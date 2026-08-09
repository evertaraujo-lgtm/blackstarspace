(function () {
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function moveToward(current, target, rate, dt) {
        const delta = target - current;
        const step = rate * dt;
        return Math.abs(delta) <= step ? target : current + Math.sign(delta) * step;
    }

    class MecazillaController {
        // Downlink state remains private to the tower controller.  Callers get
        // value copies from update(), never the stored protocol object.
        #lastFeedback;

        constructor(config = {}) {
            this.captureHeight = config.captureHeight ?? 100;
            this.towerHeight = config.towerHeight ?? 140;
            this.approachMarginX = config.approachMarginX ?? 60;
            this.approachMarginZ = config.approachMarginZ ?? 180;
            this.captureMarginX = config.captureMarginX ?? 18;
            this.captureMarginZ = config.captureMarginZ ?? 30;
            this.armBreakImpactSpeed = config.armBreakImpactSpeed ?? 10;
            this.reset();
        }

        reset() {
            this.armClosure = 0;
            this.leftArmClosure = 0;
            this.rightArmClosure = 0;
            this.captureHoldTime = 0;
            this.captureLatched = false;
            this.approachConfirmed = false;
            this.approachSignature = "";
            this.leftArmBroken = false;
            this.rightArmBroken = false;
            this.#lastFeedback = this.idleFeedback({ targetX: 0, captureMode: false });
        }

        idleFeedback(env = {}) {
            const targetX = env.targetX ?? 0;
            const approachDistance = env.approachDistance ?? 200;
            const approachAngleDeg = env.approachAngleDeg ?? 45;
            const approachTolerance = env.approachTolerance ?? 80;
            const approachAngleRad = (approachAngleDeg * Math.PI) / 180;
            const approachX = targetX + Math.cos(approachAngleRad) * approachDistance;
            const approachZ = this.captureHeight + Math.sin(approachAngleRad) * approachDistance;
            const linkFailure = env.failures?.link ?? "nominal";
            const armsFailure = env.failures?.arms ?? "nominal";
            const linkAvailable = linkFailure !== "offline";

            return {
                available: env.captureMode ? linkAvailable : false,
                targetX,
                towerHeight: this.towerHeight,
                captureX: targetX,
                captureZ: this.captureHeight,
                approachX,
                approachZ,
                approachDistance,
                approachAngleDeg,
                approachTolerance,
                approachReached: false,
                guidancePhase: "approach",
                xError: 0,
                zError: 0,
                vxError: 0,
                vzError: 0,
                angleError: 0,
                recommendedFlipAltitude: this.captureHeight + 65,
                approachAuthorized: false,
                geometryReady: false,
                readyToClose: false,
                lateralAligned: false,
                verticalAligned: false,
                rateAligned: false,
                attitudeAligned: false,
                armClosure: this.armClosure,
                leftArmClosure: this.leftArmClosure,
                rightArmClosure: this.rightArmClosure,
                leftArmBroken: this.leftArmBroken,
                rightArmBroken: this.rightArmBroken,
                captured: this.captureLatched,
                capturePossible: armsFailure === "nominal" || armsFailure === "sluggish",
                supportAuthorized: false,
                captureVerificationOk: false,
                shutdownAuthorized: false,
                authorizationSource: "none",
                status: env.captureMode ? "LINK TORRE AGUARDANDO DADOS" : "TORRE EM STANDBY",
            };
        }

        update(dt, shipReport, env = {}) {
            if (!env.captureMode || !shipReport) {
                this.leftArmClosure = Math.max(0, this.leftArmClosure - dt * 2.2);
                this.rightArmClosure = Math.max(0, this.rightArmClosure - dt * 2.2);
                this.armClosure = 0.5 * (this.leftArmClosure + this.rightArmClosure);
                this.captureHoldTime = 0;
                this.captureLatched = false;
                this.approachConfirmed = false;
                this.#lastFeedback = this.idleFeedback(env);
                return { ...this.#lastFeedback };
            }

            const failures = env.failures ?? { link: "nominal", arms: "nominal" };
            const captureX = env.targetX ?? 0;
            const captureZ = env.captureHeight ?? this.captureHeight;
            const approachDistance = env.approachDistance ?? 200;
            const approachAngleDeg = env.approachAngleDeg ?? 45;
            const approachTolerance = env.approachTolerance ?? 80;
            const approachAngleRad = (approachAngleDeg * Math.PI) / 180;
            const approachX = captureX + Math.cos(approachAngleRad) * approachDistance;
            const approachZ = captureZ + Math.sin(approachAngleRad) * approachDistance;
            const approachSignature = [captureX, captureZ, approachDistance, approachAngleDeg, approachTolerance].join(":");

            // A new panel command is a new waypoint.  Until capture has been
            // latched, require the ship to acknowledge this new point before
            // the final tower coordinates are released again.
            if (this.approachSignature && this.approachSignature !== approachSignature && !this.captureLatched) {
                this.approachConfirmed = false;
            }
            this.approachSignature = approachSignature;
            const leftArmImpactSpeed = Math.max(0, env.machineInputs?.leftArmImpactSpeed ?? 0);
            const rightArmImpactSpeed = Math.max(0, env.machineInputs?.rightArmImpactSpeed ?? 0);
            const collisionDetected = Boolean(env.machineInputs?.collisionDetected);
            const xError = captureX - shipReport.x;
            const zError = captureZ - shipReport.z;
            const vxError = -shipReport.vx;
            const vzError = -shipReport.vz;
            const angleError = -shipReport.a;
            const captureVerificationOk = Boolean(env.machineInputs?.captureVerificationOk) && !collisionDetected;
            const physicalAlignmentOk = Boolean(env.machineInputs?.physicalAlignmentOk) && !collisionDetected;

            if (leftArmImpactSpeed >= this.armBreakImpactSpeed) {
                this.leftArmBroken = true;
            }

            if (rightArmImpactSpeed >= this.armBreakImpactSpeed) {
                this.rightArmBroken = true;
            }

            const absX = Math.abs(xError);
            const absZ = Math.abs(zError);
            const absVx = Math.abs(vxError);
            const absVz = Math.abs(vzError);
            const absAngle = Math.abs(angleError);
            const recommendedFlipAltitude =
                captureZ + 55 + absVx * 12 + Math.max(0, -vzError) * 0.8;
            const lateralAligned = absX <= this.captureMarginX;
            const verticalAligned = absZ <= this.captureMarginZ;
            const rateAligned = absVx <= 2.2 && absVz <= 1.9;
            const attitudeAligned = absAngle <= 0.1;
            const approachAuthorized = absX <= this.approachMarginX && absZ <= this.approachMarginZ;
            // A broad one-way corridor prevents a fast descent from missing a
            // circular waypoint by a few metres of altitude.
            const approachReached =
                Math.abs(shipReport.z - approachZ) <= approachTolerance &&
                Math.abs(shipReport.x - approachX) <= approachTolerance;
            this.approachConfirmed ||= approachReached;
            const guidancePhase = this.approachConfirmed ? "final" : "approach";
            const geometryReady = lateralAligned && verticalAligned && rateAligned && attitudeAligned;
            // Closing is gated by the simulation's physical capture point.
            // The telemetry/uplink geometry is retained for diagnostics, but
            // may never make the arms close on its own.
            const closureAuthorized = physicalAlignmentOk;
            let leftTargetClosure = closureAuthorized ? 1 : 0;
            let rightTargetClosure = closureAuthorized ? 1 : 0;
            let closeRate = 2.4;
            let openRate = 2.8;

            switch (failures.arms) {
                case "sluggish":
                    closeRate = 0.75;
                    openRate = 1.1;
                    break;
                case "jam_open":
                    leftTargetClosure = 0;
                    rightTargetClosure = 0;
                    break;
                case "left_stuck":
                    leftTargetClosure = 0;
                    break;
                case "right_stuck":
                    rightTargetClosure = 0;
                    break;
            }

            if (this.leftArmBroken) {
                leftTargetClosure = 0;
            }

            if (this.rightArmBroken) {
                rightTargetClosure = 0;
            }

            if (!this.captureLatched) {
                this.leftArmClosure = moveToward(
                    this.leftArmClosure,
                    leftTargetClosure,
                    leftTargetClosure > this.leftArmClosure ? closeRate : openRate,
                    dt
                );
                this.rightArmClosure = moveToward(
                    this.rightArmClosure,
                    rightTargetClosure,
                    rightTargetClosure > this.rightArmClosure ? closeRate : openRate,
                    dt
                );
            }

            if (this.leftArmBroken) {
                this.leftArmClosure = Math.max(0, this.leftArmClosure - dt * 4.5);
            }

            if (this.rightArmBroken) {
                this.rightArmClosure = Math.max(0, this.rightArmClosure - dt * 4.5);
            }

            this.armClosure = 0.5 * (this.leftArmClosure + this.rightArmClosure);
            const capturePossible =
                !this.leftArmBroken &&
                !this.rightArmBroken &&
                !collisionDetected &&
                this.leftArmClosure > 0.94 &&
                this.rightArmClosure > 0.94;
            const readyToClose = closureAuthorized && capturePossible;
            const supportAuthorized =
                closureAuthorized &&
                !this.leftArmBroken &&
                !this.rightArmBroken &&
                !collisionDetected &&
                (this.armClosure > 0.28 || captureVerificationOk || this.captureLatched);

            if (readyToClose && captureVerificationOk && !this.captureLatched) {
                this.captureHoldTime += dt;
            } else if (!this.captureLatched) {
                this.captureHoldTime = Math.max(0, this.captureHoldTime - dt * 1.5);
            }

            if (!this.captureLatched && readyToClose && captureVerificationOk && this.captureHoldTime > 0.4) {
                this.captureLatched = true;
                this.armClosure = 1;
                this.leftArmClosure = 1;
                this.rightArmClosure = 1;
            }

            if (this.leftArmBroken || this.rightArmBroken || collisionDetected) {
                this.captureLatched = false;
                this.captureHoldTime = 0;
            }

            let status = "TORRE: AJUSTANDO CORREDOR";

            if (collisionDetected) {
                status = "TORRE: COLISAO ESTRUTURAL DETECTADA";
            } else if (this.leftArmBroken && this.rightArmBroken) {
                status = "TORRE: BRACOS QUEBRADOS";
            } else if (this.leftArmBroken) {
                status = "TORRE: BRACO ESQUERDO QUEBROU";
            } else if (this.rightArmBroken) {
                status = "TORRE: BRACO DIREITO QUEBROU";
            } else if (failures.arms === "jam_open") {
                status = "TORRE: BRACOS TRAVADOS ABERTOS";
            } else if (failures.arms === "left_stuck") {
                status = "TORRE: BRACO ESQUERDO TRAVADO";
            } else if (failures.arms === "right_stuck") {
                status = "TORRE: BRACO DIREITO TRAVADO";
            } else if (failures.link === "offline") {
                status = "TORRE: LINK DE POSICIONAMENTO OFFLINE";
            } else if (this.captureLatched) {
                status = "TORRE: CAPTURA CONFIRMADA";
            } else if (readyToClose && !captureVerificationOk) {
                status = "TORRE: AGUARDANDO OK FISICO";
            } else if (readyToClose) {
                status = "TORRE: FECHANDO BRACOS";
            } else if (approachAuthorized) {
                status = "TORRE: APROXIMACAO ESTAVEL";
            }

            this.#lastFeedback = {
                available: true,
                targetX: captureX,
                towerHeight: env.towerHeight ?? this.towerHeight,
                captureX,
                captureZ,
                approachX,
                approachZ,
                approachDistance,
                approachAngleDeg,
                approachTolerance,
                approachReached: this.approachConfirmed,
                guidancePhase,
                xError,
                zError,
                vxError,
                vzError,
                angleError,
                recommendedFlipAltitude,
                approachAuthorized,
                geometryReady,
                readyToClose,
                lateralAligned,
                verticalAligned,
                rateAligned,
                attitudeAligned,
                armClosure: this.armClosure,
                leftArmClosure: this.leftArmClosure,
                rightArmClosure: this.rightArmClosure,
                leftArmBroken: this.leftArmBroken,
                rightArmBroken: this.rightArmBroken,
                captured: this.captureLatched,
                capturePossible,
                supportAuthorized,
                captureVerificationOk,
                shutdownAuthorized: this.captureLatched && captureVerificationOk,
                authorizationSource: this.captureLatched ? "tower_capture" : "none",
                status,
            };

            return { ...this.#lastFeedback };
        }
    }

    window.MecazillaController = MecazillaController;
})();

