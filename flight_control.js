(function () {
    function clonePacket(packet = {}) {
        return { ...packet };
    }

    // Protocol packets and public diagnostic snapshots must never expose a
    // mutable reference owned by a controller.  This keeps a reader/UI from
    // changing what the ship or platform will consume on the next cycle.
    function cloneData(value) {
        if (!value || typeof value !== "object") {
            return value;
        }

        if (Array.isArray(value)) {
            return value.map((item) => cloneData(item));
        }

        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneData(item)]));
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    const FLIGHT_PROGRAMS = {
        REENTRY: "reentry_recovery",
        TEST_HOP: "test_takeoff_sequence",
        BOOSTBACK_BURN: "boostback_burn",
        SUBORBITAL_MISSION: "suborbital_mission",
        STACK_HOTSTAGE_BOOSTBACK: "stack_hotstage_boostback",
    };

    const TEST_HOP_POST_HOLD_ACTIONS = {
        CONTROLLED_RECOVERY: "controlled_recovery",
        BELLYFLOP_RECOVERY: "bellyflop_recovery",
    };

    const DEFAULT_FLIGHT_PROGRAM = {
        profile: FLIGHT_PROGRAMS.TEST_HOP,
        testAltitudeSetpoint: 2800,
        hotstageAltitudeSetpoint: 180000,
        hotstageThrottle: 1,
        hotstageAltitudeRampRate: 500,
        hotstagePitchBiasMaxDeg: 20,
        hotstageFuelReserveFraction: 0.01,
        boosterBoostbackThrottle: 0.86,
        boosterFlipAngleDeg: 135,
        boosterInboundVelocityLimit: 310,
        boosterBoostbackMaxDuration: 90,
        boosterRecoveryThrustFraction: 0.72,
        holdDuration: 6,
        postHoldAction: TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY,
        abortBelly: false,
    };

    function mergeOverride(packet, override) {
        if (!override?.enabled || override.error) {
            return clonePacket(packet);
        }

        return {
            ...packet,
            ...override.patch,
        };
    }

    class FlightControlShipSystem {
        #uplinkRaw;
        #uplinkRouted;
        #receivedDownlink;

        constructor(profile) {
            this.profile = profile;
            this.controller = profile.createController();
            this.reset();
        }

        reset() {
            this.controller.reset();
            this.#uplinkRaw = {};
            this.#uplinkRouted = {};
            this.#receivedDownlink = {};
            this.command = this.controller.idleCommand();
        }

        buildUplink(nav, routeContext) {
            if (!nav) {
                return {};
            }

            return {
                controllerId: routeContext.controllerId,
                vehicleId: this.profile.id,
                vehicleClass: this.profile.vehicleClass,
                callsign: this.profile.callsign,
                length: this.profile.length,
                diameter: this.profile.diameter,
                assignedPlatformId: routeContext.platformId,
                linkedModeRequested: routeContext.linkedRequested,
                routeLocked: routeContext.routeLocked,
                x: nav.x,
                z: nav.z,
                vx: nav.vx,
                vz: nav.vz,
                a: nav.a,
            };
        }

        updateCommand(dt, nav, sensors, env, routeContext, deliveredDownlink) {
            // Stand-alone is intentionally an isolated flight: do not expose a
            // platform packet to the ship controller, even an inactive/stale one.
            // This prevents a previous linked-flight waypoint from becoming a
            // navigation target after the operational mode changes.
            const shipDownlink = routeContext.captureMode ? deliveredDownlink : {};
            const routedSensors = {
                ...sensors,
                platformLink: shipDownlink,
                towerLink: shipDownlink,
            };

            this.#receivedDownlink = clonePacket(shipDownlink);
            this.controller.applyFlightDirector?.(routeContext.flightDirector ?? {});
            this.command = this.controller.update(dt, nav, routedSensors, {
                ...env,
                captureMode: routeContext.captureMode,
                linkedMode: routeContext.captureMode,
                captureHeight: routeContext.captureHeight,
                targetZ: routeContext.captureMode
                    ? shipDownlink.captureZ ?? routeContext.captureHeight
                    : 0,
                shipId: this.profile.id,
                platformId: routeContext.platformId,
                flightDirector: routeContext.flightDirector,
            });

            return this.command;
        }

        storeUplinkPackets(rawPacket, routedPacket) {
            this.#uplinkRaw = clonePacket(rawPacket);
            this.#uplinkRouted = clonePacket(routedPacket);
        }
    }

    class FlightControlPlatformSystem {
        #actualLogical;
        #shadowLogical;

        constructor(profile) {
            this.profile = profile;
            this.actualController = profile.createController();
            this.shadowController = profile.createController();
            this.reset();
        }

        createIdleFeedback(routeContext = {}) {
            return {
                controllerId: routeContext.controllerId ?? "",
                platformId: this.profile.id,
                platformClass: this.profile.platformClass,
                linkedShipId: routeContext.shipId ?? "",
                routeLocked: Boolean(routeContext.routeLocked),
                linkAccepted: false,
                available: false,
                targetX: routeContext.targetX ?? 0,
                towerHeight: this.profile.towerHeight,
                captureX: routeContext.targetX ?? 0,
                captureZ: this.profile.captureHeight,
                xError: 0,
                zError: 0,
                vxError: 0,
                vzError: 0,
                angleError: 0,
                recommendedFlipAltitude: this.profile.captureHeight + 65,
                approachAuthorized: false,
                geometryReady: false,
                readyToClose: false,
                lateralAligned: false,
                verticalAligned: false,
                rateAligned: false,
                attitudeAligned: false,
                armClosure: 0,
                leftArmClosure: 0,
                rightArmClosure: 0,
                captured: false,
                capturePossible: true,
                supportAuthorized: false,
                captureVerificationOk: false,
                shutdownAuthorized: false,
                authorizationSource: "none",
                status: routeContext.captureMode ? "LINK PLATAFORMA AGUARDANDO DADOS" : "PLATAFORMA EM STANDBY",
            };
        }

        reset() {
            this.actualController.reset();
            this.shadowController.reset();
            this.#actualLogical = this.createIdleFeedback();
            this.#shadowLogical = this.createIdleFeedback();
        }

        updateControllers(dt, actualUplink, shadowUplink, env, routeContext) {
            const controllerEnv = {
                captureMode: routeContext.captureMode,
                targetX: env.targetX ?? 0,
                captureHeight: this.profile.captureHeight,
                towerHeight: this.profile.towerHeight,
                approachDistance: env.approachDistance,
                approachAngleDeg: env.approachAngleDeg,
                approachTolerance: env.approachTolerance,
                failures: env.failures,
                machineInputs: env.machineInputs,
            };

            this.#actualLogical = this.actualController.update(dt, actualUplink, controllerEnv);
            this.#shadowLogical = this.shadowController.update(dt, shadowUplink, controllerEnv);
        }

        evaluatePhysicalCapture(nav) {
            const captureX = this.#actualLogical.captureX ?? 0;
            const captureZ = this.#actualLogical.captureZ ?? this.profile.captureHeight;
            const xError = captureX - nav.x;
            const zError = captureZ - nav.z;
            // This uses the physical state supplied by the simulation, rather
            // than the noisy uplink estimate.  It is the interlock that allows
            // the tower to start closing its arms.
            // Arms must start closing in a wider physical engagement window.
            // Requiring the final 2 m / 5 m capture envelope before any arm
            // motion was circular: the vehicle received no support to settle
            // into that envelope, so a linked Mechazilla never closed.
            const finalCaptureAlignmentOk =
                Math.abs(xError) <= this.profile.captureMarginX &&
                Math.abs(zError) <= this.profile.captureMarginZ &&
                Math.abs(nav.vx) <= this.profile.captureRateLimitX &&
                Math.abs(nav.vz) <= this.profile.captureRateLimitZ &&
                Math.abs(nav.a) <= this.profile.captureAngleLimit;
            const physicalAlignmentOk =
                Math.abs(xError) <= Math.max(this.profile.captureMarginX * 5, 12) &&
                Math.abs(zError) <= Math.max(this.profile.captureMarginZ * 4, 18) &&
                Math.abs(nav.vx) <= Math.max(this.profile.captureRateLimitX * 2, 4) &&
                Math.abs(nav.vz) <= Math.max(this.profile.captureRateLimitZ * 2, 4) &&
                Math.abs(nav.a) <= Math.max(this.profile.captureAngleLimit * 2, 0.18);
            const captureVerificationOk =
                finalCaptureAlignmentOk &&
                this.#actualLogical.leftArmClosure > 0.94 &&
                this.#actualLogical.rightArmClosure > 0.94;

            return {
                physicalAlignmentOk,
                captureVerificationOk,
                xError,
                zError,
            };
        }

        getActualLogical() {
            return clonePacket(this.#actualLogical);
        }

        getShadowLogical() {
            return clonePacket(this.#shadowLogical);
        }
    }

    class StarshipFlightController {
        // Bus snapshots are protocol internals. Public readers receive copies
        // through getSnapshot()/sampleDownlinkForShip(), never this object.
        #snapshot;

        constructor(config = {}) {
            this.controllerId = config.controllerId ?? "FCC-PRIMARY";
            this.operationMode = config.operationMode ?? "standalone";
            this.routeLocked = config.routeLocked ?? true;
            this.shipFeedbackMode = config.shipFeedbackMode ?? "closed_loop";
            this.flightProgram = {
                ...DEFAULT_FLIGHT_PROGRAM,
                ...(config.flightProgram ?? {}),
            };
            this.noiseFn = config.noiseFn ?? (() => 0);
            this.shipSystems = new Map();
            this.platformSystems = new Map();
            this.remoteShipSessions = new Map();
            this.remotePlatformSystems = new Map();

            (config.shipProfiles ?? []).forEach((profile) => {
                this.shipSystems.set(profile.id, new FlightControlShipSystem(profile));
            });
            (config.platformProfiles ?? []).forEach((profile) => {
                this.platformSystems.set(profile.id, new FlightControlPlatformSystem(profile));
            });

            this.selectedShipId =
                config.selectedShipId ?? (config.shipProfiles?.[0]?.id ?? "");
            this.selectedPlatformId =
                config.selectedPlatformId ?? (config.platformProfiles?.[0]?.id ?? "");

            this.#snapshot = this.createSnapshot();
        }

        createSnapshot() {
            return {
                route: {
                    controllerId: this.controllerId,
                    operationMode: this.operationMode,
                    routeLocked: this.routeLocked,
                    shipFeedbackMode: this.shipFeedbackMode,
                    flightProgram: { ...this.flightProgram },
                    captureMode: false,
                    linkedRequested: false,
                    shipId: this.selectedShipId,
                    platformId: this.selectedPlatformId,
                },
                ship: {
                    profile: this.getSelectedShipProfile(),
                    uplinkRaw: {},
                    uplinkTransmitted: {},
                    receivedDownlink: {},
                    command: this.getSelectedShipSystem()?.controller.idleCommand?.() ?? {},
                },
                platform: {
                    profile: this.getSelectedPlatformProfile(),
                    actualLogical: this.getSelectedPlatformSystem()?.createIdleFeedback() ?? {},
                    shadowLogical: this.getSelectedPlatformSystem()?.createIdleFeedback() ?? {},
                    deliveredBase: {},
                    physicalCaptureConfirmed: false,
                    physicalDiagnostics: {},
                },
                bus: {
                    uplinkRaw: {},
                    uplinkTransmitted: {},
                    uplinkReceivedByPlatform: {},
                    downlinkActualRaw: {},
                    downlinkShadowRaw: {},
                    downlinkDelivered: {},
                    downlinkReceivedByShip: {},
                },
            };
        }

        listShips() {
            return [...this.shipSystems.values()].map((system) => system.profile);
        }

        listPlatforms() {
            return [...this.platformSystems.values()].map((system) => system.profile);
        }

        getSelectedShipSystem() {
            return this.shipSystems.get(this.selectedShipId) ?? this.shipSystems.values().next().value;
        }

        getSelectedPlatformSystem() {
            return this.platformSystems.get(this.selectedPlatformId) ?? this.platformSystems.values().next().value;
        }

        getSelectedShipProfile() {
            return this.getSelectedShipSystem()?.profile ?? null;
        }

        getSelectedPlatformProfile() {
            return this.getSelectedPlatformSystem()?.profile ?? null;
        }

        getControllerId() {
            return this.controllerId;
        }

        isLinkedMode() {
            return this.operationMode === "linked";
        }

        isRouteLocked() {
            return this.routeLocked;
        }

        getShipFeedbackMode() {
            return this.shipFeedbackMode;
        }

        setSelectedShip(id) {
            if (this.shipSystems.has(id)) {
                this.selectedShipId = id;
            }
        }

        setSelectedPlatform(id) {
            if (this.platformSystems.has(id)) {
                this.selectedPlatformId = id;
            }
        }

        setOperationMode(mode) {
            this.operationMode = mode;
        }

        setRouteLocked(value) {
            this.routeLocked = Boolean(value);
        }

        setShipFeedbackMode(mode) {
            this.shipFeedbackMode = mode === "platform_isolated" ? "platform_isolated" : "closed_loop";
        }

        getFlightProgram() {
            return { ...this.flightProgram };
        }

        setFlightProgram(nextProgram = {}) {
            if (typeof nextProgram.profile === "string") {
                this.flightProgram.profile =
                    nextProgram.profile === FLIGHT_PROGRAMS.TEST_HOP
                        ? FLIGHT_PROGRAMS.TEST_HOP
                        : nextProgram.profile === FLIGHT_PROGRAMS.BOOSTBACK_BURN
                            ? FLIGHT_PROGRAMS.BOOSTBACK_BURN
                            : nextProgram.profile === FLIGHT_PROGRAMS.SUBORBITAL_MISSION
                                ? FLIGHT_PROGRAMS.SUBORBITAL_MISSION
                            : nextProgram.profile === FLIGHT_PROGRAMS.STACK_HOTSTAGE_BOOSTBACK
                                ? FLIGHT_PROGRAMS.STACK_HOTSTAGE_BOOSTBACK
                                : FLIGHT_PROGRAMS.REENTRY;
            }

            if (
                typeof nextProgram.testAltitudeSetpoint === "number" &&
                Number.isFinite(nextProgram.testAltitudeSetpoint)
            ) {
                this.flightProgram.testAltitudeSetpoint = clamp(nextProgram.testAltitudeSetpoint, 0, 800000);
            }

            if (
                typeof nextProgram.hotstageAltitudeSetpoint === "number" &&
                Number.isFinite(nextProgram.hotstageAltitudeSetpoint)
            ) {
                this.flightProgram.hotstageAltitudeSetpoint = clamp(nextProgram.hotstageAltitudeSetpoint, 60000, 800000);
            }

            if (typeof nextProgram.hotstageThrottle === "number" && Number.isFinite(nextProgram.hotstageThrottle)) {
                this.flightProgram.hotstageThrottle = clamp(nextProgram.hotstageThrottle, 0.35, 1);
            }

            if (typeof nextProgram.hotstageAltitudeRampRate === "number" && Number.isFinite(nextProgram.hotstageAltitudeRampRate)) {
                this.flightProgram.hotstageAltitudeRampRate = clamp(nextProgram.hotstageAltitudeRampRate, 100, 1200);
            }

            if (typeof nextProgram.hotstagePitchBiasMaxDeg === "number" && Number.isFinite(nextProgram.hotstagePitchBiasMaxDeg)) {
                this.flightProgram.hotstagePitchBiasMaxDeg = clamp(nextProgram.hotstagePitchBiasMaxDeg, 5, 35);
            }

            if (typeof nextProgram.hotstageFuelReserveFraction === "number" && Number.isFinite(nextProgram.hotstageFuelReserveFraction)) {
                this.flightProgram.hotstageFuelReserveFraction = clamp(nextProgram.hotstageFuelReserveFraction, 0.01, 0.25);
            }

            if (typeof nextProgram.boosterBoostbackThrottle === "number" && Number.isFinite(nextProgram.boosterBoostbackThrottle)) {
                this.flightProgram.boosterBoostbackThrottle = clamp(nextProgram.boosterBoostbackThrottle, 0.55, 1);
            }

            if (typeof nextProgram.boosterFlipAngleDeg === "number" && Number.isFinite(nextProgram.boosterFlipAngleDeg)) {
                this.flightProgram.boosterFlipAngleDeg = clamp(nextProgram.boosterFlipAngleDeg, 85, 165);
            }

            if (typeof nextProgram.boosterInboundVelocityLimit === "number" && Number.isFinite(nextProgram.boosterInboundVelocityLimit)) {
                this.flightProgram.boosterInboundVelocityLimit = clamp(nextProgram.boosterInboundVelocityLimit, 100, 1600);
            }

            if (typeof nextProgram.boosterBoostbackMaxDuration === "number" && Number.isFinite(nextProgram.boosterBoostbackMaxDuration)) {
                this.flightProgram.boosterBoostbackMaxDuration = clamp(nextProgram.boosterBoostbackMaxDuration, 60, 240);
            }

            if (typeof nextProgram.boosterRecoveryThrustFraction === "number" && Number.isFinite(nextProgram.boosterRecoveryThrustFraction)) {
                this.flightProgram.boosterRecoveryThrustFraction = clamp(nextProgram.boosterRecoveryThrustFraction, 0.45, 1);
            }

            if (typeof nextProgram.holdDuration === "number" && Number.isFinite(nextProgram.holdDuration)) {
                this.flightProgram.holdDuration = clamp(nextProgram.holdDuration, 0, 300);
            }

            if (typeof nextProgram.postHoldAction === "string") {
                this.flightProgram.postHoldAction =
                    nextProgram.postHoldAction === TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
                        ? TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
                        : TEST_HOP_POST_HOLD_ACTIONS.CONTROLLED_RECOVERY;
            }

            if (typeof nextProgram.abortBelly === "boolean") {
                this.flightProgram.abortBelly = nextProgram.abortBelly;
            }

            this.shipSystems.forEach((system) => {
                system.controller.applyFlightDirector?.(this.flightProgram);
            });
        }

        resetSystems() {
            this.shipSystems.forEach((system) => system.reset());
            this.platformSystems.forEach((system) => system.reset());
            this.remoteShipSessions.clear();
            this.remotePlatformSystems.clear();
            this.#snapshot = this.createSnapshot();
        }

        idleCommand() {
            return this.getSelectedShipSystem()?.controller.idleCommand?.() ?? {};
        }

        createFlightDirector(targetX = 0) {
            const platform = this.getSelectedPlatformProfile();
            const captureMode = this.isLinkedMode() && this.routeLocked;

            return {
                controllerId: this.controllerId,
                profile: this.flightProgram.profile,
                testAltitudeSetpoint: this.flightProgram.testAltitudeSetpoint,
                hotstageAltitudeSetpoint: this.flightProgram.hotstageAltitudeSetpoint,
                hotstageThrottle: this.flightProgram.hotstageThrottle,
                hotstageAltitudeRampRate: this.flightProgram.hotstageAltitudeRampRate,
                hotstagePitchBiasMaxDeg: this.flightProgram.hotstagePitchBiasMaxDeg,
                hotstageFuelReserveFraction: this.flightProgram.hotstageFuelReserveFraction,
                boosterBoostbackThrottle: this.flightProgram.boosterBoostbackThrottle,
                boosterFlipAngleDeg: this.flightProgram.boosterFlipAngleDeg,
                boosterInboundVelocityLimit: this.flightProgram.boosterInboundVelocityLimit,
                boosterBoostbackMaxDuration: this.flightProgram.boosterBoostbackMaxDuration,
                boosterRecoveryThrustFraction: this.flightProgram.boosterRecoveryThrustFraction,
                holdDuration: this.flightProgram.holdDuration,
                postHoldAction: this.flightProgram.postHoldAction,
                recoveryMode: this.flightProgram.postHoldAction,
                abortBelly: Boolean(this.flightProgram.abortBelly),
                approachRequired: captureMode,
                targetX,
                targetZ: captureMode ? platform?.captureHeight ?? 0 : 0,
                linkedMode: captureMode,
                assignedPlatformId: platform?.id ?? "",
            };
        }

        createRouteContext(targetX = 0, shipId = this.selectedShipId) {
            const ship = this.shipSystems.get(shipId)?.profile ?? this.getSelectedShipProfile();
            const platform = this.getSelectedPlatformProfile();
            const captureMode = this.isLinkedMode() && this.routeLocked;

            return {
                controllerId: this.controllerId,
                operationMode: this.operationMode,
                routeLocked: this.routeLocked,
                shipFeedbackMode: this.shipFeedbackMode,
                flightProgram: { ...this.flightProgram },
                flightDirector: this.createFlightDirector(targetX),
                captureMode,
                linkedRequested: this.isLinkedMode(),
                targetX,
                shipId: ship?.id ?? "",
                platformId: platform?.id ?? "",
                platformClass: platform?.platformClass ?? "",
                captureHeight: platform?.captureHeight ?? 0,
                towerHeight: platform?.towerHeight ?? 0,
            };
        }

        buildPlatformDownlink(logicalState, routeContext) {
            const finalGuidance = logicalState.guidancePhase === "final";

            return {
                controllerId: routeContext.controllerId,
                platformId: routeContext.platformId,
                platformClass: routeContext.platformClass,
                linkedShipId: routeContext.shipId,
                routeLocked: routeContext.routeLocked,
                linkAccepted: routeContext.captureMode,
                available: Boolean(logicalState.available) && routeContext.captureMode,
                // Final capture coordinates remain withheld until the tower
                // confirms that the broad approach waypoint was reached.
                captureX: finalGuidance ? logicalState.captureX : undefined,
                captureZ: finalGuidance ? logicalState.captureZ : undefined,
                towerHeight: logicalState.towerHeight,
                approachX: logicalState.approachX,
                approachZ: logicalState.approachZ,
                approachDistance: logicalState.approachDistance,
                approachAngleDeg: logicalState.approachAngleDeg,
                approachTolerance: logicalState.approachTolerance,
                // Esta diretiva vem do controlador de voo e atravessa o
                // enlace junto da guiagem da plataforma. A nave linked não
                // escolhe localmente como deve retornar.
                recoveryMode: routeContext.flightProgram.postHoldAction,
                abortBelly: Boolean(routeContext.flightProgram.abortBelly),
                approachRequired: routeContext.captureMode,
                flightProgramProfile: routeContext.flightProgram.profile,
                approachReached: logicalState.approachReached,
                guidancePhase: logicalState.guidancePhase ?? "approach",
                xError: logicalState.xError,
                zError: logicalState.zError,
                vxError: logicalState.vxError,
                vzError: logicalState.vzError,
                angleError: logicalState.angleError,
                recommendedFlipAltitude: logicalState.recommendedFlipAltitude,
                approachAuthorized: logicalState.approachAuthorized,
                geometryReady: logicalState.geometryReady,
                readyToClose: logicalState.readyToClose,
                lateralAligned: logicalState.lateralAligned,
                verticalAligned: logicalState.verticalAligned,
                rateAligned: logicalState.rateAligned,
                attitudeAligned: logicalState.attitudeAligned,
                armClosure: logicalState.armClosure,
                leftArmClosure: logicalState.leftArmClosure,
                rightArmClosure: logicalState.rightArmClosure,
                leftArmBroken: logicalState.leftArmBroken,
                rightArmBroken: logicalState.rightArmBroken,
                captured: logicalState.captured,
                capturePossible: logicalState.capturePossible,
                supportAuthorized: logicalState.supportAuthorized,
                captureVerificationOk: logicalState.captureVerificationOk,
                shutdownAuthorized: logicalState.shutdownAuthorized,
                authorizationSource: logicalState.authorizationSource ?? "none",
                status: logicalState.status,
            };
        }

        applyLinkTransport(basePacket, linkEnv, routeContext) {
            const shipId = routeContext.shipId;
            const idlePacket = this.getSelectedPlatformSystem().createIdleFeedback(routeContext);
            const failureLink = linkEnv.failures?.link ?? "nominal";
            const forceCaptureLink = Boolean(linkEnv.forceCaptureLink);
            let linkBiasX = 0;
            let linkBiasZ = 0;

            if ((!this.isLinkedMode() && !forceCaptureLink) || (!this.routeLocked && !forceCaptureLink)) {
                return {
                    ...idlePacket,
                    linkedShipId: shipId,
                    routeLocked: this.routeLocked,
                    linkAccepted: false,
                    status: this.isLinkedMode()
                        ? "ENLACE DESARMADO PELO CONTROLADOR DE VOO"
                        : "PROTOCOLO INATIVO",
                };
            }

            switch (failureLink) {
                case "bias_left":
                    linkBiasX = -24;
                    break;
                case "bias_right":
                    linkBiasX = 24;
                    break;
                case "bias_high":
                    linkBiasZ = 42;
                    break;
                case "bias_low":
                    linkBiasZ = -42;
                    break;
            }

            if (failureLink === "offline") {
                return {
                    ...basePacket,
                    available: false,
                    linkedShipId: shipId,
                    routeLocked: this.routeLocked,
                    linkAccepted: routeContext.captureMode,
                    shutdownAuthorized: Boolean(linkEnv.falseAuthorizationActive),
                    authorizationSource: linkEnv.falseAuthorizationActive
                        ? "false_authorization"
                        : "none",
                    status: linkEnv.falseAuthorizationActive
                        ? "AUTORIZACAO FALSA INJETADA"
                        : "LINK PLATAFORMA INDISPONIVEL",
                };
            }

            const transported = {
                ...basePacket,
                linkedShipId: shipId,
                routeLocked: this.routeLocked,
                linkAccepted: routeContext.captureMode,
                captureX:
                    typeof basePacket.captureX === "number"
                        ? basePacket.captureX + linkBiasX + this.noiseFn(0.35)
                        : undefined,
                captureZ:
                    typeof basePacket.captureZ === "number"
                        ? basePacket.captureZ + linkBiasZ + this.noiseFn(0.45)
                        : undefined,
                xError: basePacket.xError + linkBiasX + this.noiseFn(0.45),
                zError: basePacket.zError + linkBiasZ + this.noiseFn(0.55),
                vxError: basePacket.vxError + this.noiseFn(0.18),
                vzError: basePacket.vzError + this.noiseFn(0.18),
                angleError: basePacket.angleError + this.noiseFn(0.01),
                recommendedFlipAltitude: basePacket.recommendedFlipAltitude + linkBiasZ + this.noiseFn(5),
            };

            if (linkEnv.falseAuthorizationActive) {
                transported.shutdownAuthorized = true;
                transported.authorizationSource = "false_authorization";
                transported.status = "AUTORIZACAO FALSA INJETADA";
            }

            return transported;
        }

        createPlatformPhysicalInterlock(physicalState) {
            // This is a trusted local interlock, not a telemetry packet.  It
            // intentionally returns only the capture booleans/errors required
            // by the platform PLC; the tower never receives the vehicle state
            // object owned by the simulation.
            if (!physicalState) {
                return {
                    physicalAlignmentOk: false,
                    captureVerificationOk: false,
                    xError: 0,
                    zError: 0,
                };
            }

            return clonePacket(this.getSelectedPlatformSystem().evaluatePhysicalCapture(physicalState));
        }

        updatePlatform(dt, estimatedState, linkEnv = {}) {
            const shipSystem = this.getSelectedShipSystem();
            const platformSystem = this.getSelectedPlatformSystem();
            const routeContext = this.createRouteContext(linkEnv.targetX ?? 0);
            const uplinkRaw = shipSystem.buildUplink(estimatedState, routeContext);
            const uplinkTransmitted = mergeOverride(uplinkRaw, linkEnv.uplinkOverride);
            // The platform receives only discrete/derived machine signals.
            // No reference to `s`, `nav`, or another object's private state is
            // passed across this boundary.
            const machineInputs = {
                physicalAlignmentOk: false,
                captureVerificationOk: false,
                xError: 0,
                zError: 0,
                leftArmContact: false,
                rightArmContact: false,
                leftArmImpactSpeed: 0,
                rightArmImpactSpeed: 0,
                ...(linkEnv.machineInputs ?? {}),
            };

            shipSystem.storeUplinkPackets(uplinkRaw, uplinkTransmitted);

            platformSystem.updateControllers(
                dt,
                uplinkTransmitted,
                uplinkRaw,
                {
                    targetX: linkEnv.targetX ?? 0,
                    approachDistance: linkEnv.approachDistance,
                    approachAngleDeg: linkEnv.approachAngleDeg,
                    approachTolerance: linkEnv.approachTolerance,
                    failures: linkEnv.failures ?? { link: "nominal", arms: "nominal" },
                    machineInputs,
                },
                routeContext
            );

            const actualLogical = this.buildPlatformDownlink(
                platformSystem.getActualLogical(),
                routeContext
            );
            const shadowLogical = this.buildPlatformDownlink(
                platformSystem.getShadowLogical(),
                routeContext
            );
            const actualTransported = this.applyLinkTransport(
                actualLogical,
                linkEnv,
                routeContext
            );
            const shadowTransported = this.applyLinkTransport(
                shadowLogical,
                linkEnv,
                routeContext
            );
            const deliveredBase =
                this.shipFeedbackMode === "platform_isolated"
                    ? shadowTransported
                    : actualTransported;
            const deliveredDownlink = mergeOverride(
                deliveredBase,
                linkEnv.downlinkOverride
            );
            this.#snapshot = {
                route: routeContext,
                ship: {
                    profile: shipSystem.profile,
                    uplinkRaw: clonePacket(uplinkRaw),
                    uplinkTransmitted: clonePacket(uplinkTransmitted),
                    receivedDownlink: clonePacket(deliveredDownlink),
                    command: shipSystem.command,
                },
                platform: {
                    profile: platformSystem.profile,
                    actualLogical: clonePacket(actualLogical),
                    shadowLogical: clonePacket(shadowLogical),
                    deliveredBase: clonePacket(deliveredBase),
                    physicalCaptureConfirmed: Boolean(actualLogical.captured),
                    physicalDiagnostics: clonePacket(machineInputs),
                },
                bus: {
                    uplinkRaw: clonePacket(uplinkRaw),
                    uplinkTransmitted: clonePacket(uplinkTransmitted),
                    uplinkReceivedByPlatform: clonePacket(uplinkTransmitted),
                    downlinkActualRaw: clonePacket(actualTransported),
                    downlinkShadowRaw: clonePacket(shadowTransported),
                    downlinkDelivered: clonePacket(deliveredDownlink),
                    downlinkReceivedByShip: clonePacket(deliveredDownlink),
                },
            };

            return cloneData(this.#snapshot);
        }

        sampleDownlinkForShip() {
            return clonePacket(this.#snapshot.bus.downlinkReceivedByShip);
        }

        updateShipCommand(dt, nav, sensors, shipEnv = {}) {
            const shipSystem = this.getSelectedShipSystem();
            // Build the route at the instant the ship is commanded.  A snapshot
            // belongs to the platform update and can otherwise retain a linked
            // route for one frame (or after a mode switch).  Stand-alone must
            // never inherit that route or any of its approach coordinates.
            const routeContext = this.createRouteContext(shipEnv.targetX ?? 0);
            const deliveredDownlink = sensors?.platformLink
                ? clonePacket(sensors.platformLink)
                : this.sampleDownlinkForShip();
            const command = shipSystem.updateCommand(
                dt,
                nav,
                sensors,
                shipEnv,
                routeContext,
                deliveredDownlink
            );

            this.#snapshot.ship = {
                ...this.#snapshot.ship,
                command,
                receivedDownlink: clonePacket(deliveredDownlink),
            };

            return command;
        }

        // A separated stage remains an independent endpoint on the same
        // flight-control bus.  It gets its own uplink/downlink exchange while
        // the selected vehicle (for example the S24) continues uninterrupted.
        updateRemoteShipCommand(shipId, dt, nav, sensors, shipEnv = {}, linkEnv = {}) {
            const shipSystem = this.shipSystems.get(shipId);
            const selectedPlatformSystem = this.getSelectedPlatformSystem();
            if (!shipSystem || !selectedPlatformSystem) {
                return { command: {}, downlink: {} };
            }

            const routeContext = this.createRouteContext(linkEnv.targetX ?? 0, shipId);
            const autonomousTowerReturn = shipEnv.detachedReturn && shipEnv.boosterRecovery === "tower_catch";
            if (autonomousTowerReturn) {
                // The B7 return is a mission-owned tower session even when
                // the launch itself ran stand-alone. It must not inherit the
                // S24's current flight-selection or be blocked by that UI
                // mode after hot-staging.
                routeContext.captureMode = true;
                routeContext.linkedRequested = true;
                routeContext.routeLocked = true;
                routeContext.flightDirector = {
                    ...routeContext.flightDirector,
                    linkedMode: true,
                    approachRequired: true,
                    targetZ: routeContext.captureHeight,
                };
                linkEnv = { ...linkEnv, forceCaptureLink: true };
            }
            const uplinkRaw = shipSystem.buildUplink(nav, routeContext);
            const uplinkTransmitted = mergeOverride(uplinkRaw, linkEnv.uplinkOverride);
            shipSystem.storeUplinkPackets(uplinkRaw, uplinkTransmitted);

            // A separated stage has its own logical tower session.  This is
            // not a second physical tower; it is the B7's independent link
            // endpoint, so its approach/flip guidance is based on B7 uplink
            // rather than on the concurrently flying S24.
            const remoteKey = `${shipId}:${routeContext.platformId}`;
            let platformSystem = this.remotePlatformSystems.get(remoteKey);
            if (!platformSystem) {
                platformSystem = new FlightControlPlatformSystem(selectedPlatformSystem.profile);
                this.remotePlatformSystems.set(remoteKey, platformSystem);
            }
            platformSystem.updateControllers(
                dt,
                uplinkTransmitted,
                uplinkRaw,
                {
                    targetX: linkEnv.targetX ?? 0,
                    approachDistance: linkEnv.approachDistance,
                    approachAngleDeg: linkEnv.approachAngleDeg,
                    approachTolerance: linkEnv.approachTolerance,
                    failures: linkEnv.failures ?? { link: "nominal", arms: "nominal" },
                    machineInputs: {
                        physicalAlignmentOk: false,
                        captureVerificationOk: false,
                        xError: 0,
                        zError: 0,
                        leftArmContact: false,
                        rightArmContact: false,
                        leftArmImpactSpeed: 0,
                        rightArmImpactSpeed: 0,
                        ...(linkEnv.machineInputs ?? {}),
                    },
                },
                routeContext
            );
            const actualLogical = platformSystem.getActualLogical();
            const baseDownlink = this.buildPlatformDownlink(actualLogical, routeContext);
            const transported = this.applyLinkTransport(baseDownlink, linkEnv, routeContext);
            const downlink = mergeOverride(transported, linkEnv.downlinkOverride);
            const routedSensors = { ...sensors, platformLink: clonePacket(downlink), towerLink: clonePacket(downlink) };
            const command = shipSystem.updateCommand(dt, nav, routedSensors, shipEnv, routeContext, downlink);

            const session = {
                shipId,
                route: clonePacket(routeContext),
                uplinkRaw: clonePacket(uplinkRaw),
                uplinkTransmitted: clonePacket(uplinkTransmitted),
                downlink: clonePacket(downlink),
                command: clonePacket(command),
            };
            this.remoteShipSessions.set(shipId, session);
            return cloneData(session);
        }

        getRemoteShipSession(shipId) {
            return cloneData(this.remoteShipSessions.get(shipId) ?? {});
        }

        getSnapshot() {
            return cloneData(this.#snapshot);
        }

        getActualPlatformState() {
            return clonePacket(this.#snapshot.platform.actualLogical);
        }

        getShadowPlatformState() {
            return clonePacket(this.#snapshot.platform.shadowLogical);
        }

        isPhysicalCaptureConfirmed() {
            return Boolean(this.#snapshot.platform.actualLogical?.captured);
        }
    }

    window.StarshipFlightController = StarshipFlightController;
})();
