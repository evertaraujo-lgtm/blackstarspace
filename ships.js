(function () {
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function wrapAngle(angle) {
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    }

    function estimateTimeToImpact(nav) {
        const altitude = Math.max(0, nav.z);
        const earthRadius = 6371000;
        const radius = earthRadius + altitude;
        const localGravity = 9.80665 * (earthRadius / radius) ** 2;
        // In the local tangent approximation, Earth's surface drops by
        // d²/(2R). With d = vx*t this is the same as reducing downward
        // acceleration by vx²/R. The main integrator uses the equivalent
        // polar term directly; the impact estimator must use it too.
        const effectiveDownwardAcceleration = localGravity - (nav.vx * nav.vx) / radius;

        if (effectiveDownwardAcceleration > 0.001) {
            const discriminant = nav.vz * nav.vz + 2 * effectiveDownwardAcceleration * altitude;
            const impactTime = (nav.vz + Math.sqrt(Math.max(0, discriminant))) / effectiveDownwardAcceleration;
            return clamp(impactTime, 0, 21600);
        }

        // At or above circular speed there is no local ballistic surface
        // intercept. Keep a finite horizon for guidance projections.
        if (nav.vz < -0.01) return clamp(altitude / -nav.vz, 0, 21600);
        return 21600;
    }

    function applyDeadband(value, threshold) {
        return Math.abs(value) <= threshold ? 0 : value - Math.sign(value) * threshold;
    }

    function degToRad(deg) {
        return (deg * Math.PI) / 180;
    }

    const MISSION_PROFILES = {
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

    const DEFAULT_MISSION_CONFIG = {
        profile: MISSION_PROFILES.REENTRY,
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
    };

    const CONTROL_GAIN_SPECS = [
        {
            key: "bellyEntryAngleDeg",
            label: "Belly Entry Angle",
            min: -180,
            max: 180,
            step: 1,
            defaultValue: 90,
        },
        {
            key: "attitudeEntryGain",
            label: "Atitude Entry",
            min: -12,
            max: 12,
            step: 0.05,
            defaultValue: 2.3,
        },
        {
            key: "attitudeTerminalGain",
            label: "Atitude Terminal",
            min: -12,
            max: 12,
            step: 0.05,
            defaultValue: 3.5,
        },
        {
            key: "flapAuthorityGain",
            label: "Flap Authority",
            min: -8,
            max: 8,
            step: 0.05,
            defaultValue: 1,
        },
        {
            key: "rcsEntryGain",
            label: "RCS Entry",
            min: -8,
            max: 8,
            step: 0.05,
            defaultValue: 0.65,
        },
        {
            key: "rcsTerminalGain",
            label: "RCS Terminal",
            min: -8,
            max: 8,
            step: 0.05,
            defaultValue: 1.15,
        },
        {
            key: "gimbalEntryGain",
            label: "Gimbal Entry",
            min: -5,
            max: 5,
            step: 0.01,
            defaultValue: 0.16,
        },
        {
            key: "gimbalFlipGain",
            label: "Gimbal Flip",
            min: -5,
            max: 5,
            step: 0.01,
            defaultValue: 0.2,
        },
        {
            key: "gimbalLandingGain",
            label: "Gimbal Landing",
            min: -5,
            max: 5,
            step: 0.01,
            defaultValue: 0.24,
        },
        {
            key: "altitudePGain",
            label: "Altitude P",
            min: -1,
            max: 1,
            step: 0.001,
            defaultValue: 0.035,
        },
        {
            key: "altitudeIGain",
            label: "Altitude I",
            min: -0.5,
            max: 0.5,
            step: 0.001,
            defaultValue: 0.002,
        },
        {
            key: "takeoffPositionPGain",
            label: "Takeoff Z P",
            min: -2,
            max: 2,
            step: 0.001,
            defaultValue: 0.022,
        },
        {
            key: "takeoffPositionIGain",
            label: "Takeoff Z I",
            min: -0.5,
            max: 0.5,
            step: 0.0005,
            defaultValue: 0.0015,
        },
        {
            key: "takeoffVelocityDGain",
            label: "Takeoff Z D",
            min: -10,
            max: 10,
            step: 0.05,
            defaultValue: 0.35,
        },
        {
            key: "takeoffThrottlePGain",
            label: "Takeoff Thr P",
            min: -1,
            max: 1,
            step: 0.001,
            defaultValue: 0.028,
        },
        {
            key: "takeoffThrottleIGain",
            label: "Takeoff Thr I",
            min: -0.5,
            max: 0.5,
            step: 0.001,
            defaultValue: 0.015,
        },
        {
            key: "throttlePGain",
            label: "Throttle Descida P",
            min: -1,
            max: 1,
            step: 0.001,
            defaultValue: 0.02,
        },
        {
            key: "throttleIGain",
            label: "Throttle Descida I",
            min: -0.5,
            max: 0.5,
            step: 0.001,
            defaultValue: 0.012,
        },
    ];

    function buildDefaultControlGains() {
        return CONTROL_GAIN_SPECS.reduce((gains, spec) => {
            gains[spec.key] = spec.defaultValue;
            return gains;
        }, {});
    }

    class StarshipController {
        constructor(config = {}) {
            this.g = config.g ?? 9.81;
            this.maxThrust = config.maxThrust ?? 6.9e6;
            this.defaultMass = config.mass ?? 120000;
            this.mass = this.defaultMass;
            this.defaultControlGains = {
                ...buildDefaultControlGains(),
                ...(config.controlGains ?? {}),
            };
            this.controlGains = { ...this.defaultControlGains };
            this.defaultMissionConfig = {
                ...DEFAULT_MISSION_CONFIG,
                ...(config.missionConfig ?? {}),
            };
            this.missionConfig = { ...this.defaultMissionConfig };
            this.reset();
        }

        reset() {
            this.mode = "STANDBY";
            this.activeController = {
                id: "CTRL_STANDBY",
                label: "Standby / aguardando missão",
                loops: ["atuadores em neutro"],
            };
            this.engineLatched = false;
            this.vzIntegral = 0;
            this.altitudeIntegral = 0;
            this.sequencePhase = "IDLE";
            this.sequencePhaseTimer = 0;
            this.sequenceHoldTimer = 0;
            this.sequenceAscentStartAltitude = 0;
            this.transferAltitudeSetpoint = null;
            this.transferAltitudeAchieved = false;
            this.transferInjectionComplete = false;
            this.transferReserveCutoff = false;
        }

        idleCommand() {
            return {
                noseFlap: 0.55,
                tailFlap: 0.55,
                rcs: 0,
                gimbal: 0,
                throttle: 0,
                engineOn: false,
                mode: "STANDBY",
                status: "AGUARDANDO START",
                targetAngle: degToRad(this.controlGains.bellyEntryAngleDeg),
                targetVz: 0,
                brakeAltitude: 0,
                targetZ: 0,
                // Contrato de missão para o HUD: a interface não deduz
                // etapas por altitude/posição; ela apenas apresenta esta
                // sequência declarada pelo controlador de voo.
                missionHud: {
                    stages: ["PREPARAÇÃO", "DECOLAGEM", "SUBIDA", "BELLYFLOP", "APROXIMAÇÃO", "CAPTURA"],
                    activeStage: 0,
                    completedStage: 0,
                },
                activeController: { ...this.activeController, loops: [...this.activeController.loops] },
            };
        }

        setActiveController(id, label, loops = []) {
            this.activeController = { id, label, loops: [...loops] };
        }

        buildMissionHudState(command = {}, nav = {}) {
            const postHoldBellyflop =
                this.missionConfig.postHoldAction === TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY;
            const stages = [
                "PREPARAÇÃO",
                "DECOLAGEM",
                "SUBIDA",
                postHoldBellyflop ? "BELLYFLOP" : "RETORNO",
                "APROXIMAÇÃO",
                "CAPTURA",
            ];
            const phase = command.sequencePhase ?? this.sequencePhase;
            const mode = command.mode ?? this.mode ?? "";
            let activeStage = 1;
            let completedStage = 0;

            if (phase === "ASCENT") {
                const climbedFromPad = (nav.z ?? 0) - this.sequenceAscentStartAltitude > 10;
                activeStage = climbedFromPad ? 2 : 1;
                completedStage = climbedFromPad ? 1 : 0;
            } else if (phase === "HOLD") {
                activeStage = 2;
                completedStage = 2;
            } else if (phase === "BELLYFLOP") {
                activeStage = 3;
                completedStage = 3;
            } else if (phase === "RECOVERY") {
                activeStage = 4;
                completedStage = 3;
            }

            // Perfis sem sequência de teste também descrevem a etapa pela
            // própria máquina de estados do controlador.
            if (mode.includes("ENTRY")) {
                activeStage = 2;
                completedStage = Math.max(completedStage, 1);
            } else if (mode.includes("FLIP")) {
                activeStage = 3;
                completedStage = Math.max(completedStage, 3);
            } else if (mode.includes("APPROACH") || mode === "CAPTURE HOLD") {
                activeStage = 4;
                completedStage = Math.max(completedStage, 4);
            } else if (mode === "CAPTURED" || mode === "LANDED") {
                activeStage = 5;
                completedStage = 5;
            }

            return { stages, activeStage, completedStage };
        }

        attachActiveController(command, nav) {
            return {
                ...command,
                missionHud: this.buildMissionHudState(command, nav),
                activeController: { ...this.activeController, loops: [...this.activeController.loops] },
            };
        }

        runTestHopController(dt, nav, sensors, env, actuators) {
            this.setActiveController("CTRL_DECOLAGEM_TESTE", "Sequenciador de decolagem", [
                "PID de altitude de decolagem",
                `PI de throttle de decolagem (P ${this.controlGains.takeoffThrottlePGain.toFixed(3)}, I ${this.controlGains.takeoffThrottleIGain.toFixed(3)})`,
                "controle de atitude vertical",
            ]);
            return this.updateTestHopSequence(dt, nav, sensors, env, actuators);
        }

        runStandaloneRecoveryController(dt, nav, sensors, env, actuators) {
            this.setActiveController("CTRL_RETORNO_AUTONOMO", "Guiagem de retorno standalone", [
                "predição de impacto em X",
                "controle de atitude",
                `PID de altitude / PI de throttle de descida (P ${this.controlGains.throttlePGain.toFixed(3)}, I ${this.controlGains.throttleIGain.toFixed(3)})`,
            ]);
            return this.updateGroundRecovery(dt, nav, sensors, env, actuators);
        }

        runTowerRecoveryController(dt, nav, sensors, env, actuators) {
            this.setActiveController("CTRL_TORRE_TERMINAL", "Guiagem terminal para torre", [
                "controle X da janela",
                "controle de atitude vertical",
                `PID de altitude / PI de throttle de descida (P ${this.controlGains.throttlePGain.toFixed(3)}, I ${this.controlGains.throttleIGain.toFixed(3)})`,
            ]);
            return this.updateLinkedRecovery(dt, nav, sensors, env, actuators);
        }

        getControlGainSpecs() {
            return CONTROL_GAIN_SPECS.map((spec) => ({ ...spec }));
        }

        getControlGains() {
            return { ...this.controlGains };
        }

        getMass() {
            return this.mass;
        }

        setMass(nextMass) {
            if (typeof nextMass !== "number" || !Number.isFinite(nextMass)) {
                return;
            }

            this.mass = clamp(nextMass, 10000, 500000);
        }

        getMissionConfig() {
            return { ...this.missionConfig };
        }

        getMissionState() {
            return {
                ...this.getMissionConfig(),
                sequencePhase: this.sequencePhase,
                sequencePhaseTimer: this.sequencePhaseTimer,
                sequenceHoldTimer: this.sequenceHoldTimer,
            };
        }

        setControlGains(nextGains = {}) {
            for (const spec of CONTROL_GAIN_SPECS) {
                if (typeof nextGains[spec.key] !== "number" || !Number.isFinite(nextGains[spec.key])) {
                    continue;
                }

                this.controlGains[spec.key] = clamp(nextGains[spec.key], spec.min, spec.max);
            }
        }

        setControlGain(key, value) {
            const spec = CONTROL_GAIN_SPECS.find((item) => item.key === key);

            if (!spec || typeof value !== "number" || !Number.isFinite(value)) {
                return;
            }

            this.controlGains[key] = clamp(value, spec.min, spec.max);
        }

        resetControlGains() {
            this.controlGains = { ...this.defaultControlGains };
        }

        setMissionConfig(nextConfig = {}) {
            const previousProfile = this.missionConfig.profile;

            if (typeof nextConfig.profile === "string") {
                this.missionConfig.profile =
                    nextConfig.profile === MISSION_PROFILES.TEST_HOP
                        ? MISSION_PROFILES.TEST_HOP
                        : nextConfig.profile === MISSION_PROFILES.BOOSTBACK_BURN
                            ? MISSION_PROFILES.BOOSTBACK_BURN
                            : nextConfig.profile === MISSION_PROFILES.SUBORBITAL_MISSION
                                ? MISSION_PROFILES.SUBORBITAL_MISSION
                            : nextConfig.profile === MISSION_PROFILES.STACK_HOTSTAGE_BOOSTBACK
                                ? MISSION_PROFILES.STACK_HOTSTAGE_BOOSTBACK
                                : MISSION_PROFILES.REENTRY;
            }

            if (typeof nextConfig.testAltitudeSetpoint === "number" && Number.isFinite(nextConfig.testAltitudeSetpoint)) {
            this.missionConfig.testAltitudeSetpoint = clamp(nextConfig.testAltitudeSetpoint, 0, 800000);
            }

            if (typeof nextConfig.hotstageAltitudeSetpoint === "number" && Number.isFinite(nextConfig.hotstageAltitudeSetpoint)) {
                const nextHotstageTarget = clamp(nextConfig.hotstageAltitudeSetpoint, 60000, 800000);
                if (nextHotstageTarget !== this.missionConfig.hotstageAltitudeSetpoint) {
                    this.missionConfig.hotstageAltitudeSetpoint = nextHotstageTarget;
                    this.transferAltitudeSetpoint = Number.isFinite(this.transferAltitudeSetpoint)
                        ? Math.min(this.transferAltitudeSetpoint, nextHotstageTarget)
                        : null;
                    this.transferAltitudeAchieved = false;
                }
            }


            if (typeof nextConfig.hotstageThrottle === "number" && Number.isFinite(nextConfig.hotstageThrottle)) {
                this.missionConfig.hotstageThrottle = clamp(nextConfig.hotstageThrottle, 0.35, 1);
            }

            if (typeof nextConfig.hotstageAltitudeRampRate === "number" && Number.isFinite(nextConfig.hotstageAltitudeRampRate)) {
                this.missionConfig.hotstageAltitudeRampRate = clamp(nextConfig.hotstageAltitudeRampRate, 100, 1200);
            }

            if (typeof nextConfig.hotstagePitchBiasMaxDeg === "number" && Number.isFinite(nextConfig.hotstagePitchBiasMaxDeg)) {
                this.missionConfig.hotstagePitchBiasMaxDeg = clamp(nextConfig.hotstagePitchBiasMaxDeg, 5, 35);
            }

            if (typeof nextConfig.hotstageFuelReserveFraction === "number" && Number.isFinite(nextConfig.hotstageFuelReserveFraction)) {
                this.missionConfig.hotstageFuelReserveFraction = clamp(nextConfig.hotstageFuelReserveFraction, 0.01, 0.25);
            }

            if (typeof nextConfig.boosterBoostbackThrottle === "number" && Number.isFinite(nextConfig.boosterBoostbackThrottle)) {
                this.missionConfig.boosterBoostbackThrottle = clamp(nextConfig.boosterBoostbackThrottle, 0.55, 1);
            }

            if (typeof nextConfig.boosterFlipAngleDeg === "number" && Number.isFinite(nextConfig.boosterFlipAngleDeg)) {
                this.missionConfig.boosterFlipAngleDeg = clamp(nextConfig.boosterFlipAngleDeg, 85, 165);
            }

            if (typeof nextConfig.boosterInboundVelocityLimit === "number" && Number.isFinite(nextConfig.boosterInboundVelocityLimit)) {
                this.missionConfig.boosterInboundVelocityLimit = clamp(nextConfig.boosterInboundVelocityLimit, 100, 1600);
            }

            if (typeof nextConfig.boosterBoostbackMaxDuration === "number" && Number.isFinite(nextConfig.boosterBoostbackMaxDuration)) {
                this.missionConfig.boosterBoostbackMaxDuration = clamp(nextConfig.boosterBoostbackMaxDuration, 60, 240);
            }

            if (typeof nextConfig.boosterRecoveryThrustFraction === "number" && Number.isFinite(nextConfig.boosterRecoveryThrustFraction)) {
                this.missionConfig.boosterRecoveryThrustFraction = clamp(nextConfig.boosterRecoveryThrustFraction, 0.45, 1);
            }

            if (typeof nextConfig.holdDuration === "number" && Number.isFinite(nextConfig.holdDuration)) {
                this.missionConfig.holdDuration = clamp(nextConfig.holdDuration, 0, 300);
            }

            if (typeof nextConfig.postHoldAction === "string") {
                this.missionConfig.postHoldAction =
                    nextConfig.postHoldAction === TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
                        ? TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
                        : TEST_HOP_POST_HOLD_ACTIONS.CONTROLLED_RECOVERY;
            }

            if (this.missionConfig.profile !== previousProfile) {
                this.sequencePhase = "IDLE";
                this.sequencePhaseTimer = 0;
                this.sequenceHoldTimer = 0;
                this.sequenceAscentStartAltitude = 0;
                this.altitudeIntegral = 0;
            }
        }

        applyFlightDirector(directive = {}) {
            this.setMissionConfig({
                profile: directive.profile,
                testAltitudeSetpoint: directive.testAltitudeSetpoint,
                hotstageAltitudeSetpoint: directive.hotstageAltitudeSetpoint,
                hotstageThrottle: directive.hotstageThrottle,
                hotstageAltitudeRampRate: directive.hotstageAltitudeRampRate,
                hotstagePitchBiasMaxDeg: directive.hotstagePitchBiasMaxDeg,
                hotstageFuelReserveFraction: directive.hotstageFuelReserveFraction,
                boosterBoostbackThrottle: directive.boosterBoostbackThrottle,
                boosterFlipAngleDeg: directive.boosterFlipAngleDeg,
                boosterInboundVelocityLimit: directive.boosterInboundVelocityLimit,
                boosterBoostbackMaxDuration: directive.boosterBoostbackMaxDuration,
                boosterRecoveryThrustFraction: directive.boosterRecoveryThrustFraction,
                holdDuration: directive.holdDuration,
                postHoldAction: directive.postHoldAction,
            });
        }

        transitionSequencePhase(nextPhase, navAltitude = this.sequenceAscentStartAltitude) {
            if (this.sequencePhase === nextPhase) {
                return;
            }

            this.sequencePhase = nextPhase;
            this.sequencePhaseTimer = 0;
            this.sequenceHoldTimer = 0;

            if (nextPhase === "ASCENT") {
                this.sequenceAscentStartAltitude = navAltitude;
            }
        }

        controllerTakeoffAltitudePid(dt, targetAltitude, nav, limits = {}) {
            const gains = this.controlGains;
            const altitudeError = targetAltitude - nav.z;
            // targetVz is the feed-forward velocity of the planned ascent
            // trajectory. Previously it was used only inside the error term,
            // which made a 60 s / 2800 m profile fly at roughly half of its
            // required climb rate.
            const plannedVz = limits.targetVz ?? 0;
            const verticalRateError = plannedVz - nav.vz;
            const climbLimit = Math.max(0, limits.climb ?? 25);
            const descentLimit = Math.max(0, limits.descent ?? 8);
            const integralLimit = Math.max(20, limits.integralLimit ?? 420);

            this.altitudeIntegral = clamp(this.altitudeIntegral + altitudeError * dt, -integralLimit, integralLimit);

            const command =
                plannedVz +
                altitudeError * gains.takeoffPositionPGain +
                this.altitudeIntegral * gains.takeoffPositionIGain +
                verticalRateError * gains.takeoffVelocityDGain;

            return clamp(command, -descentLimit, climbLimit);
        }

        update(dt, nav, sensors, env) {
            this.applyFlightDirector(env.flightDirector ?? {});
            const runtimeEnv = {
                ...env,
                mass:
                    typeof env.mass === "number" && Number.isFinite(env.mass)
                        ? env.mass
                        : this.mass,
            };

            if (!runtimeEnv.started) {
                this.mode = "STANDBY";
                return this.idleCommand();
            }

            const actuators = runtimeEnv.actuators ?? {
                flapLift: 1,
                flapTorque: 1,
                rcs: 1,
                tvc: 1,
            };

            if (runtimeEnv.upperStageTransfer) {
                return this.attachActiveController(this.runUpperStageTransfer(dt, nav, sensors, runtimeEnv, actuators), nav);
            }

            if (this.missionConfig.profile === MISSION_PROFILES.TEST_HOP) {
                return this.attachActiveController(this.runTestHopController(dt, nav, sensors, runtimeEnv, actuators), nav);
            }

            // A linked recovery requires both flags.  Treat an incomplete or
            // stale link state as stand-alone ground recovery.
            if (runtimeEnv.captureMode === true && runtimeEnv.linkedMode === true) {
                return this.attachActiveController(this.runTowerRecoveryController(dt, nav, sensors, runtimeEnv, actuators), nav);
            }

            return this.attachActiveController(this.runStandaloneRecoveryController(dt, nav, sensors, runtimeEnv, actuators), nav);
        }

        runUpperStageTransfer(dt, nav, sensors, env, actuators) {
            const targetX = env.indianOceanTargetX;
            const distance = targetX - nav.x;
            // Start the transfer burn immediately after hot-staging. While
            // climbing, true prograde attitude places a useful portion of
            // thrust upward and enlarges the existing ballistic arc instead
            // of trying to hold a fixed altitude.
            if (distance > 40000 || nav.z > 18000) {
                const finalAltitudeTarget = clamp(this.missionConfig.hotstageAltitudeSetpoint, 60000, 800000);
                const earthRadius = 6371000;
                const radius = earthRadius + Math.max(0, nav.z);
                const localGravity = 9.80665 * (earthRadius / radius) ** 2;
                const effectiveGravity = Math.max(1, localGravity - (nav.vx * nav.vx) / radius);
                const ballisticApoapsis = nav.z + (Math.max(0, nav.vz) ** 2) / (2 * effectiveGravity);

                // Begin at the apoapsis already carried by the separation
                // trajectory, then raise that target continuously. This
                // avoids an instantaneous pitch step at hot-staging.
                if (!Number.isFinite(this.transferAltitudeSetpoint)) {
                    this.transferAltitudeSetpoint = clamp(ballisticApoapsis, nav.z, finalAltitudeTarget);
                }
                this.transferAltitudeSetpoint = Math.min(
                    finalAltitudeTarget,
                    this.transferAltitudeSetpoint + this.missionConfig.hotstageAltitudeRampRate * Math.max(0, dt),
                );
                if (nav.z >= finalAltitudeTarget) this.transferAltitudeAchieved = true;

                // The tangent of the actual parabola remains the reference,
                // but insertion must never keep thrusting downward after
                // apoapsis. Hold a small upward component until orbital
                // energy is closed instead of following a descending prograde
                // vector into the atmosphere.
                const progradePitch = Math.atan2(nav.vx, nav.vz);
                const altitudeError = Math.max(0, this.transferAltitudeSetpoint - nav.z);
                const desiredVz = this.transferInjectionComplete
                    ? 0
                    : clamp(altitudeError * 0.008, 0, 180);
                const verticalRateError = desiredVz - nav.vz;
                const altitudePitchBias = clamp(
                    verticalRateError * 0.0009,
                    -degToRad(8),
                    degToRad(this.missionConfig.hotstagePitchBiasMaxDeg)
                );
                const transferPitch = clamp(
                    progradePitch - altitudePitchBias,
                    degToRad(12),
                    // 90° is horizontal in this simulator. Capping just
                    // below it prevents a prograde burn from adding downward
                    // velocity once S24 begins to descend.
                    degToRad(89),
                );
                const transferAngleError = wrapAngle(transferPitch - nav.a);
                const transferRateTarget = clamp(transferAngleError * 2.8, -1.8, 1.8);
                const transferRateError = transferRateTarget - nav.w;
                const timeToImpact = estimateTimeToImpact(nav);
                const projectedImpactX = nav.x + nav.vx * timeToImpact;
                const downrangeError = targetX - projectedImpactX;
                const altitudeSolutionReady = ballisticApoapsis >= finalAltitudeTarget - 1000;
                const rangeSolutionReady = projectedImpactX >= targetX - 120000;
                // The old controller calculated desiredEastSpeed but cut the
                // engines once altitude/range alone looked sufficient. At
                // ~27,000 km/h and 250 km that is still below circular speed,
                // so the vehicle inevitably loses altitude. Require the
                // tangential orbital-energy solution before MECO.
                const desiredEastSpeed = clamp(5200 + downrangeError * 0.00018, 5200, 7800);
                const circularSpeed = Math.sqrt((9.80665 * earthRadius ** 2) / radius);
                const orbitalSpeedTarget = clamp(Math.max(desiredEastSpeed, circularSpeed + 80), 5200, 7900);
                const velocitySolutionReady = nav.vx >= orbitalSpeedTarget - 75;
                const verticalSolutionReady = Math.abs(nav.vz) <= 110;
                const reserveReached = Number.isFinite(env.mainPropellantFraction) &&
                    env.mainPropellantFraction <= this.missionConfig.hotstageFuelReserveFraction;
                if (reserveReached) {
                    this.transferInjectionComplete = true;
                    this.transferReserveCutoff = true;
                } else if (!this.transferInjectionComplete && altitudeSolutionReady && rangeSolutionReady && velocitySolutionReady && verticalSolutionReady) {
                    this.transferInjectionComplete = true;
                } else if (
                    this.transferInjectionComplete &&
                    !this.transferReserveCutoff &&
                    nav.z > 80000 &&
                    (projectedImpactX < targetX - 300000 || nav.vx < orbitalSpeedTarget - 200)
                ) {
                    // Hysteresis permits one correction burn if the updated
                    // ballistic solution later falls materially short.
                    this.transferInjectionComplete = false;
                }
                // This profile is an orbital-energy insertion attempt: keep
                // all six S24 engines at full throttle until the transfer
                // phase hands off to Indian Ocean recovery or propellant is
                // depleted. Pitch, not throttle, steers the energy split.
                const throttle = this.transferInjectionComplete ? 0 : this.missionConfig.hotstageThrottle;
                // Dedicated prograde attitude loop. Differential flaps, RCS
                // and TVC are the only mechanisms that rotate the vehicle.
                const transferFlapDifferential = clamp(transferAngleError * 1.15 + transferRateError * 0.30, -0.92, 0.92) * actuators.flapTorque;
                const attitude = {
                    noseFlap: clamp(0.16 - transferFlapDifferential * 0.72, 0, 1),
                    tailFlap: clamp(0.16 + transferFlapDifferential * 0.72, 0, 1),
                    rcs: clamp(transferAngleError * 2.8 + transferRateError * 0.72, -1, 1) * actuators.rcs,
                    gimbal: clamp(transferAngleError * 0.34 + transferRateError * 0.11, -0.24, 0.24) * actuators.tvc,
                };
                const altitudePhase = this.transferInjectionComplete
                    ? this.transferReserveCutoff
                        ? "reserva protegida; coast prograde"
                        : "inserção concluída; coast prograde"
                    : this.transferAltitudeAchieved
                    ? `alcance prograde após ${(finalAltitudeTarget / 1000).toFixed(0)} km`
                    : `elevação progressiva do ápice até ${(finalAltitudeTarget / 1000).toFixed(0)} km`;
                this.setActiveController("CTRL_S24_TRANSFER", "Transferência S24 rumo ao Oceano Índico", [altitudePhase, "pitch prograde com correção vertical limitada", "potência do Flight Director; movimento somente por atuadores"]);
                return {
                    ...attitude,
                    engineOn: !this.transferInjectionComplete,
                    throttle,
                    mode: this.transferInjectionComplete ? "S24 TRANSFER COAST" : "S24 TRANSFER EAST",
                    status: `S24 ${this.transferInjectionComplete ? "MECO / coast" : `${(throttle * 100).toFixed(1)}% potência`} | Vx alvo ${(orbitalSpeedTarget * 3.6).toFixed(0)} km/h | ${this.transferAltitudeAchieved ? `alcance pós-${(finalAltitudeTarget / 1000).toFixed(0)} km` : `ALT alvo ${(this.transferAltitudeSetpoint / 1000).toFixed(1)} km`} | pitch ${((Math.PI / 2 - transferPitch) * 180 / Math.PI).toFixed(1)}° horizonte | erro Índico ${(downrangeError / 1000).toFixed(0)} km`,
                    targetAngle: transferPitch,
                    targetVz: desiredVz,
                    targetX,
                    targetZ: this.transferAltitudeAchieved ? nav.z : this.transferAltitudeSetpoint,
                };
            }
            return this.runStandaloneRecoveryController(dt, nav, sensors, { ...env, targetX }, actuators);
        }

        updateGroundRecovery(dt, nav, sensors, env, actuators) {
            const gains = this.controlGains;
            const bellyEntryAngle = degToRad(gains.bellyEntryAngleDeg);
            const altitude = Math.max(0, nav.z);
            const q = sensors.airdata.dynamicPressure;
            const targetX = env.targetX ?? 0;
            const lateralError = nav.x - targetX;
            const timeToImpact = estimateTimeToImpact(nav);
            const projectedImpactX = nav.x + nav.vx * timeToImpact;
            const impactError = projectedImpactX - targetX;
            const recoveryThrust = env.recoveryMaxThrust ?? env.maxThrust;
            const maxDecel = Math.max(3, recoveryThrust / Math.max(env.mass, 1) - env.g);
            const brakeAltitude =
                (Math.max(0, -nav.vz) ** 2) / (2 * maxDecel) +
                Math.abs(nav.vx) * (env.recoveryLateralMargin ?? 12) +
                (env.recoveryAltitudeMargin ?? 140);

            let mode = "ENTRY";
            let engineOn = false;
            let poweredGuidance = Boolean(env.manualEngineActive);
            let lateralAuthority = actuators.flapLift;
            // Do not turn normal estimator noise into a cross-range manoeuvre
            // immediately after the test-hop hold. Outside the terminal phase,
            // guide from the projected impact; close to the ground, guide from
            // position. Both use a physical deadband before commanding attitude.
            const rawGuidanceError = altitude > 250 ? impactError : lateralError;
            const guidanceDeadband = altitude > 250 ? 12 : 3;
            const guidanceError = applyDeadband(rawGuidanceError, guidanceDeadband);
            const stabilizedVx = applyDeadband(nav.vx, 0.8);
            let lateralTilt = clamp(-guidanceError * 0.00045 - stabilizedVx * 0.045, -0.65, 0.65);
            let flapAuthority = clamp(Math.abs(guidanceError) / 900, 0, 1);
            let targetAngle = bellyEntryAngle + lateralTilt;
            let targetVz = altitude > 6000 ? -48 : altitude > 2500 ? -34 : -22;
            let flapBase = clamp(0.72 + flapAuthority * 0.22 - Math.abs(lateralTilt) * 0.05, 0.52, 0.94);
            let trajectoryBias = clamp(-impactError * 0.0002, -0.32, 0.32);

            if (this.engineLatched || altitude < brakeAltitude + (env.recoveryIgnitionMargin ?? 280)) {
                this.engineLatched = true;
            }

            if (this.engineLatched && altitude > 180) {
                mode = "FLIP";
                // Upright is the neutral attitude in this 2D world.  A fixed
                // +0.08 rad offset here created rightward thrust after every
                // hold, even in still air with zero lateral error.
                targetAngle = clamp(lateralTilt * 0.65, -0.32, 0.32);
                targetVz = altitude > 900 ? -28 : altitude > 400 ? -16 : -8;
                flapBase = altitude > 700 ? 0.22 + flapAuthority * 0.1 : 0.1;
                engineOn = true;
                trajectoryBias *= 0.45;
            }

            if (this.engineLatched && altitude <= 180) {
                mode = "LANDING";
                const terminalError = applyDeadband(lateralError, 2);
                targetAngle = clamp(-terminalError * 0.004 - stabilizedVx * 0.06, -0.18, 0.18);
                targetVz = this.controllerAltitudePid(dt, 0, nav, {
                    climb: 2.5,
                    descent: altitude > 80 ? 6 : altitude > 25 ? 2.5 : 1.1,
                    integralLimit: 220,
                });
                flapBase = 0.06;
                engineOn = true;
                trajectoryBias = 0;
            }

            const guidance = this.resolveGuidanceEnvelope(
                mode,
                engineOn,
                actuators,
                env.manualEngineActive,
                {
                    targetAngle,
                    bellyEntryAngle,
                    flapBase,
                    flapAuthority,
                    trajectoryBias,
                }
            );

            const attitude = this.controllerAttitude(
                guidance.targetAngle,
                nav,
                q,
                guidance.flapBase,
                mode,
                guidance.trajectoryBias,
                actuators,
                guidance.poweredGuidance
            );
            const throttle = engineOn ? this.controllerThrottlePi(dt, targetVz, nav, env) : 0;

            if (!engineOn) {
                this.vzIntegral *= 0.96;
                this.altitudeIntegral *= 0.92;
            }

            this.mode = mode;

            return {
                ...attitude,
                throttle,
                engineOn,
                mode,
                status: `${mode} | alvo VZ ${targetVz.toFixed(1)} m/s`,
                targetAngle: guidance.targetAngle,
                targetVz,
                brakeAltitude,
                targetX,
                targetZ: 0,
                targetError: targetX - nav.x,
                projectedImpactX,
                projectedTargetZ: 0,
                impactError: targetX - projectedImpactX,
            };
        }

        updateLinkedRecovery(dt, nav, sensors, env, actuators) {
            const gains = this.controlGains;
            const bellyEntryAngle = degToRad(gains.bellyEntryAngleDeg);
            const q = sensors.airdata.dynamicPressure;
            const platformLink = sensors.platformLink ?? sensors.towerLink ?? {};
            const routeLocked = platformLink.routeLocked !== false;
            const platformMatches = !env.platformId || !platformLink.platformId || platformLink.platformId === env.platformId;
            const shipMatches = !env.shipId || !platformLink.linkedShipId || platformLink.linkedShipId === env.shipId;
            const linkAccepted = platformLink.linkAccepted !== false;
            const linkAvailable = platformLink.available !== false && routeLocked && platformMatches && shipMatches && linkAccepted;
            const captureX = linkAvailable && typeof platformLink.captureX === "number" ? platformLink.captureX : env.targetX ?? 0;
            const captureZ = linkAvailable && typeof platformLink.captureZ === "number" ? platformLink.captureZ : env.captureHeight ?? 100;
            const approachX = linkAvailable && typeof platformLink.approachX === "number" ? platformLink.approachX : captureX;
            const approachZ = linkAvailable && typeof platformLink.approachZ === "number" ? platformLink.approachZ : captureZ;
            const approachTolerance = linkAvailable && typeof platformLink.approachTolerance === "number" ? platformLink.approachTolerance : 80;
            const approachReached = linkAvailable && platformLink.guidancePhase === "final";
            const shutdownAuthorized = Boolean(platformLink.shutdownAuthorized) && routeLocked && platformMatches && shipMatches && linkAccepted;
            const authorizationSource = platformLink.authorizationSource ?? "none";
            const platformId = platformLink.platformId ?? env.platformId ?? "unassigned_platform";
            const altitude = Math.max(0, nav.z);
            const altitudeToCapture = altitude - captureZ;
            const sinkRate = Math.max(5, -nav.vz);
            const timeToCapture = altitudeToCapture > 0 ? altitudeToCapture / sinkRate : 0.8;
            const projectedCaptureX = nav.x + nav.vx * timeToCapture;
            const projectedXError = captureX - projectedCaptureX;
            const targetError = captureX - nav.x;
            const flipAltitude = Number.isFinite(env.recoveryFlipAltitude)
                ? env.recoveryFlipAltitude
                : linkAvailable
                    ? platformLink.recommendedFlipAltitude ?? captureZ + 65
                    : captureZ + 90;

            if (shutdownAuthorized) {
                this.mode = "CAPTURE SHUTDOWN";
                this.vzIntegral *= 0.92;

                const attitude = this.controllerAttitude(0, nav, q, 0.05, this.mode, 0, actuators, false);

                return {
                    ...attitude,
                    throttle: 0,
                    engineOn: false,
                    mode: this.mode,
                    status:
                        authorizationSource === "false_authorization"
                            ? "CAPTURE SHUTDOWN | AUTORIZACAO FALSA"
                            : "CAPTURE SHUTDOWN | AUTORIZACAO PLATAFORMA",
                    targetAngle: 0,
                    targetVz: 0,
                    brakeAltitude: flipAltitude,
                    targetX: captureX,
                    targetZ: captureZ,
                    targetError,
                    projectedImpactX: projectedCaptureX,
                    projectedTargetZ: captureZ,
                    impactError: projectedXError,
                    forceEngineCutoff: true,
                    authorizationSource,
                    platformId,
                };
            }

            if (linkAvailable && !approachReached && !env.bypassTowerApproach) {
                this.setActiveController("CTRL_TORRE_APROXIMACAO", "Controle do ponto de aproximação", [
                    "posição X/Z do ponto de aproximação",
                    "controle de atitude",
                    `PID de altitude / PI de throttle de descida (P ${this.controlGains.throttlePGain.toFixed(3)}, I ${this.controlGains.throttleIGain.toFixed(3)})`,
                ]);
                const pointXError = approachX - nav.x;
                const pointZError = approachZ - nav.z;
                const mode = "TOWER APPROACH POINT";
                const engineOn = altitude <= approachZ + (env.approachIgnitionMargin ?? 260) || env.manualEngineActive;
                const targetAngle = engineOn
                    ? clamp(pointXError * 0.002 - nav.vx * 0.07, -0.2, 0.2)
                    : bellyEntryAngle + clamp(pointXError * 0.0008 - nav.vx * 0.045, -0.42, 0.42);
                const targetVz = engineOn
                    ? this.controllerAltitudePid(dt, approachZ, nav, {
                          climb: 4,
                          descent: pointZError < -80 ? 12 : pointZError < 0 ? 6 : 3,
                          integralLimit: 260,
                      })
                    : -18;
                const guidance = this.resolveGuidanceEnvelope(mode, engineOn, actuators, env.manualEngineActive, {
                    targetAngle,
                    bellyEntryAngle,
                    flapBase: engineOn ? 0.08 : 0.72,
                    flapAuthority: clamp(Math.abs(pointXError) / 700, 0, 1),
                    trajectoryBias: clamp(pointXError * 0.00025, -0.28, 0.28),
                });
                const attitude = this.controllerAttitude(
                    guidance.targetAngle,
                    nav,
                    q,
                    guidance.flapBase,
                    mode,
                    guidance.trajectoryBias,
                    actuators,
                    guidance.poweredGuidance
                );
                const throttle = engineOn ? this.controllerThrottlePi(dt, targetVz, nav, env) : 0;

                return {
                    ...attitude,
                    throttle,
                    engineOn,
                    mode,
                    status: `${mode} | alvo X/Z ${approachX.toFixed(0)} / ${approachZ.toFixed(0)} m | tolerância ${approachTolerance.toFixed(0)} m`,
                    targetAngle: guidance.targetAngle,
                    targetVz,
                    brakeAltitude: approachZ,
                    targetX: approachX,
                    targetZ: approachZ,
                    targetError: pointXError,
                    projectedImpactX: nav.x + nav.vx * Math.max(0.8, (altitude - approachZ) / Math.max(5, -nav.vz)),
                    projectedTargetZ: approachZ,
                    impactError: pointXError,
                    forceEngineCutoff: false,
                    authorizationSource,
                    platformId,
                    approachReached: false,
                };
            }

            // The tower releases final capture coordinates only after the
            // approach corridor has been reached.  That acknowledgement is a
            // one-way handoff: remain in powered, upright terminal guidance
            // from here to the capture window; never re-enter a belly phase.
            if (linkAvailable && approachReached) {
                this.engineLatched = true;
                this.setActiveController("CTRL_TORRE_TERMINAL", "Guiagem vertical terminal para torre", [
                    "posição X da janela de captura",
                    "controle de atitude vertical",
                    "PID de altitude / PI de throttle",
                ]);
            }

            let mode = "ENTRY";
            let engineOn = false;
            let targetAngle = bellyEntryAngle + clamp(projectedXError * 0.00055 - nav.vx * 0.04, -0.5, 0.5);
            let targetVz = altitudeToCapture > 3200 ? -40 : altitudeToCapture > 1700 ? -28 : -18;
            let flapBase = clamp(0.76 + clamp(Math.abs(projectedXError) / 1000, 0, 1) * 0.14, 0.54, 0.92);
            let trajectoryBias = clamp(projectedXError * 0.0002, -0.3, 0.3);

            if (this.engineLatched || altitude < flipAltitude || env.manualEngineActive) {
                this.engineLatched = true;
            }

            if (this.engineLatched && altitudeToCapture > 180) {
                mode = "CAPTURE FLIP";
                engineOn = true;
                targetAngle = clamp(targetError * 0.0012 - nav.vx * 0.055, -0.24, 0.24);
                targetVz = this.controllerAltitudePid(dt, captureZ, nav, {
                    climb: 5,
                    descent: altitudeToCapture > 650 ? 18 : altitudeToCapture > 320 ? 10 : 5,
                    integralLimit: 260,
                });
                flapBase = altitudeToCapture > 420 ? 0.18 : 0.08;
                trajectoryBias *= 0.4;
            }

            if (this.engineLatched && altitudeToCapture <= 180) {
                mode = platformLink.readyToClose && linkAvailable ? "CAPTURE HOLD" : "CAPTURE APPROACH";
                engineOn = true;
                targetAngle = clamp(targetError * (linkAvailable ? 0.0035 : 0.0024) - nav.vx * 0.08, -0.12, 0.12);
                targetVz = this.controllerAltitudePid(dt, captureZ, nav, {
                    climb: 3.5,
                    descent:
                        altitudeToCapture > 100
                            ? linkAvailable
                                ? 4.2
                                : 5
                            : altitudeToCapture > 35
                              ? linkAvailable
                                  ? 1.8
                                  : 2.3
                              : altitudeToCapture > -20
                                ? linkAvailable
                                    ? 0.7
                                    : 0.9
                                : 1.2,
                    integralLimit: 200,
                });
                flapBase = 0.05;
                trajectoryBias = 0;
            }

            const guidance = this.resolveGuidanceEnvelope(
                mode,
                engineOn,
                actuators,
                env.manualEngineActive,
                {
                    targetAngle,
                    bellyEntryAngle,
                    flapBase,
                    flapAuthority: clamp(Math.abs(projectedXError) / 1000, 0, 1),
                    trajectoryBias,
                }
            );

            const attitude = this.controllerAttitude(
                guidance.targetAngle,
                nav,
                q,
                guidance.flapBase,
                mode,
                guidance.trajectoryBias,
                actuators,
                guidance.poweredGuidance
            );
            const throttle = engineOn ? this.controllerThrottlePi(dt, targetVz, nav, env) : 0;

            if (!engineOn) {
                this.vzIntegral *= 0.96;
                this.altitudeIntegral *= 0.92;
            }

            this.mode = mode;

            return {
                ...attitude,
                throttle,
                engineOn,
                mode,
                status: `${mode}${linkAvailable ? "" : " | LINK PLATAFORMA DEGRADED"} | ${platformId} | plataforma DZ ${(-altitudeToCapture).toFixed(0)} m`,
                targetAngle: guidance.targetAngle,
                targetVz,
                brakeAltitude: flipAltitude,
                targetX: captureX,
                targetZ: captureZ,
                targetError,
                projectedImpactX: projectedCaptureX,
                projectedTargetZ: captureZ,
                impactError: projectedXError,
                forceEngineCutoff: false,
                authorizationSource,
                platformId,
            };
        }

        updateTestHopSequence(dt, nav, sensors, env, actuators) {
            const q = sensors.airdata.dynamicPressure;
            const platformLink = sensors.platformLink ?? sensors.towerLink ?? {};
            const linkAvailable = Boolean(env.linkedMode || env.captureMode)
                ? platformLink.available !== false && platformLink.linkAccepted !== false && platformLink.routeLocked !== false
                : false;
            const targetX =
                linkAvailable && typeof platformLink.captureX === "number"
                    ? platformLink.captureX
                    : env.targetX ?? 0;
            const landingTargetZ =
                linkAvailable && typeof platformLink.captureZ === "number"
                    ? platformLink.captureZ
                    : env.captureMode || env.linkedMode
                      ? env.captureHeight ?? 0
                      : 0;
            const shutdownAuthorized = Boolean(platformLink.shutdownAuthorized) && Boolean(env.linkedMode || env.captureMode);
            const authorizationSource = platformLink.authorizationSource ?? "none";
            const cruiseAltitude = Math.max(0, this.missionConfig.testAltitudeSetpoint);
            const postHoldAction =
                this.missionConfig.postHoldAction === TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
                    ? TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
                    : TEST_HOP_POST_HOLD_ACTIONS.CONTROLLED_RECOVERY;
            const altitude = Math.max(0, nav.z);
            const targetError = targetX - nav.x;
            const timeToGround = estimateTimeToImpact(nav);
            const projectedImpactX = nav.x + nav.vx * timeToGround;
            const impactError = targetX - projectedImpactX;

            if (shutdownAuthorized) {
                this.mode = "TEST CAPTURE SHUTDOWN";
                this.vzIntegral *= 0.92;
                this.altitudeIntegral *= 0.92;

                const attitude = this.controllerAttitude(0, nav, q, 0.05, this.mode, 0, actuators, false);

                return {
                    ...attitude,
                    throttle: 0,
                    engineOn: false,
                    mode: this.mode,
                    status:
                        authorizationSource === "false_authorization"
                            ? "TEST CAPTURE SHUTDOWN | AUTORIZACAO FALSA"
                            : "TEST CAPTURE SHUTDOWN | AUTORIZACAO PLATAFORMA",
                    targetAngle: 0,
                    targetVz: 0,
                    brakeAltitude: landingTargetZ,
                    targetX,
                    targetZ: landingTargetZ,
                    targetError,
                    projectedImpactX,
                    projectedTargetZ: landingTargetZ,
                    impactError,
                    forceEngineCutoff: true,
                    authorizationSource,
                    sequencePhase: this.sequencePhase,
                    sequencePhaseTimer: this.sequencePhaseTimer,
                    holdTimeRemaining: 0,
                    postHoldAction,
                };
            }

            if (this.sequencePhase === "IDLE") {
                this.transitionSequencePhase("ASCENT", altitude);
                this.altitudeIntegral = 0;
                this.vzIntegral = 0;
                this.engineLatched = false;
            }

            this.sequencePhaseTimer += dt;
            const altitudeErrorToCruise = cruiseAltitude - altitude;
            // A sequência não pode prosseguir apenas porque o cronômetro
            // terminou: a nave precisa estar fisicamente no setpoint. A
            // tolerância absorve ruído do estimador sem liberar retorno em
            // altitude incorreta.
            const stableAtSetpoint = Math.abs(altitudeErrorToCruise) <= 20 && Math.abs(nav.vz) <= 3;

            if (
                this.sequencePhase === "ASCENT" &&
                stableAtSetpoint
            ) {
                this.transitionSequencePhase("HOLD");
                this.altitudeIntegral = 0;
                this.vzIntegral = 0;
            }

            if (this.sequencePhase === "HOLD") {
                // O relógio do hold é uma confirmação de estabilidade, não
                // apenas tempo desde o fim da subida. Enquanto o PID ainda
                // estiver levando a nave ao alvo, ele permanece em HOLD sem
                // liberar a recuperação.
                this.sequenceHoldTimer = stableAtSetpoint ? this.sequenceHoldTimer + dt : 0;

                if (this.sequenceHoldTimer >= this.missionConfig.holdDuration) {
                    const nextPhase =
                        postHoldAction === TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
                            ? "BELLYFLOP"
                            : "RECOVERY";
                    this.transitionSequencePhase(nextPhase);
                    this.altitudeIntegral = 0;
                    this.vzIntegral = 0;
                    this.engineLatched = nextPhase === "RECOVERY";
                }
            }

            if (this.sequencePhase === "BELLYFLOP" || this.sequencePhase === "RECOVERY") {
                const recoveryResponse =
                    env.captureMode || env.linkedMode
                        ? this.runTowerRecoveryController(dt, nav, sensors, env, actuators)
                        : this.runStandaloneRecoveryController(dt, nav, sensors, env, actuators);
                const stageLabel =
                    this.sequencePhase === "BELLYFLOP"
                        ? "TEST BELLYFLOP"
                        : "TEST DESCENT";

                return {
                    ...recoveryResponse,
                    mode: `TEST ${recoveryResponse.mode}`,
                    status: `${stageLabel} | ${recoveryResponse.status}`,
                    sequencePhase: this.sequencePhase,
                    sequencePhaseTimer: this.sequencePhaseTimer,
                    holdTimeRemaining: 0,
                    postHoldAction,
                };
            }

            let mode = "TEST ASCENT";
            let targetVz = 0;
            if (this.sequencePhase === "ASCENT") {
                // Perfil de subida baseado somente no erro físico atual.
                // Não há prazo programado: quanto mais distante do setpoint,
                // maior a razão de subida solicitada; ela reduz suavemente
                // ao se aproximar da altitude alvo.
                const climbReference = clamp(altitudeErrorToCruise * 0.045, 0, 42);
                targetVz = this.controllerTakeoffAltitudePid(dt, cruiseAltitude, nav, {
                    climb: 50,
                    descent: 12,
                    integralLimit: 500,
                    targetVz: climbReference,
                });
            } else if (this.sequencePhase === "HOLD") {
                mode = "TEST HOLD";
                targetVz = this.controllerTakeoffAltitudePid(dt, cruiseAltitude, nav, {
                    climb: 7,
                    descent: 7,
                    integralLimit: 280,
                });
            }

            const targetAltitude = cruiseAltitude;
            // GPS/velocity samples contain enough noise near zero to make a
            // short hop hunt laterally. Ignore that small envelope and use a
            // gentler correction only when the vehicle has really left the pad axis.
            const stabilizedTargetError = Math.abs(targetError) < 3 ? 0 : targetError;
            const stabilizedVx = Math.abs(nav.vx) < 0.8 ? 0 : nav.vx;
            const targetAngle = clamp(stabilizedTargetError * 0.0012 - stabilizedVx * 0.035, -0.06, 0.06);
            const guidance = this.resolveGuidanceEnvelope(
                mode,
                true,
                actuators,
                env.manualEngineActive,
                {
                    targetAngle,
                    bellyEntryAngle: 0,
                    flapBase: this.sequencePhase === "ASCENT" ? 0.08 : 0.05,
                    flapAuthority: clamp(Math.abs(targetError) / 240, 0, 1),
                    trajectoryBias: 0,
                }
            );
            const attitude = this.controllerAttitude(
                guidance.targetAngle,
                nav,
                q,
                guidance.flapBase,
                mode,
                guidance.trajectoryBias,
                actuators,
                guidance.poweredGuidance
            );
            const throttle = this.controllerThrottlePi(dt, targetVz, nav, env, "takeoff");
            const holdTimeRemaining =
                this.sequencePhase === "HOLD"
                    ? Math.max(0, this.missionConfig.holdDuration - this.sequenceHoldTimer)
                    : 0;

            this.mode = mode;

            return {
                ...attitude,
                throttle,
                engineOn: true,
                mode,
                status:
                    this.sequencePhase === "HOLD"
                        ? stableAtSetpoint
                            ? `${mode} | hold ${holdTimeRemaining.toFixed(1)} s | alvo Z ${targetAltitude.toFixed(0)} m`
                            : `${mode} | estabilizando no alvo Z ${targetAltitude.toFixed(0)} m | erro ${altitudeErrorToCruise.toFixed(1)} m`
                        : `${mode} | alvo Z ${cruiseAltitude.toFixed(0)} m | alvo VZ ${targetVz.toFixed(1)} m/s`,
                targetAngle: guidance.targetAngle,
                targetVz,
                brakeAltitude: targetAltitude,
                targetX,
                targetZ: targetAltitude,
                targetError,
                projectedImpactX,
                projectedTargetZ: landingTargetZ,
                impactError,
                forceEngineCutoff: false,
                authorizationSource,
                sequencePhase: this.sequencePhase,
                sequencePhaseTimer: this.sequencePhaseTimer,
                holdTimeRemaining,
                postHoldAction,
            };
        }

        resolveGuidanceEnvelope(mode, engineOn, actuators, manualEngineActive, state) {
            const poweredGuidance = Boolean(manualEngineActive || engineOn);
            let lateralAuthority = actuators.flapLift;
            let targetAngle = state.targetAngle;
            const bellyEntryAngle = state.bellyEntryAngle ?? Math.PI / 2;
            let flapBase = state.flapBase;
            let trajectoryBias = state.trajectoryBias;

            if (poweredGuidance) {
                lateralAuthority = Math.max(lateralAuthority, actuators.tvc);
            }

            if (lateralAuthority < 0.05) {
                targetAngle = mode === "ENTRY" ? bellyEntryAngle : 0;
                flapBase = mode === "ENTRY" ? 0.72 : mode.includes("FLIP") ? 0.18 : 0.06;
                trajectoryBias = 0;
            }

            return {
                poweredGuidance,
                targetAngle,
                flapBase,
                trajectoryBias,
            };
        }

        controllerAttitude(targetAngle, nav, dynamicPressure, flapBase, mode, trajectoryBias, actuators, poweredGuidance) {
            const landingLike = mode === "LANDING" || mode.startsWith("CAPTURE");
            const flipLike = mode === "FLIP" || mode.includes("FLIP");
            const gains = this.controlGains;
            const angleError = wrapAngle(targetAngle - nav.a);
            const rateTarget = clamp(
                angleError * (landingLike ? gains.attitudeTerminalGain : gains.attitudeEntryGain),
                -2.2,
                2.2
            );
            const rateError = rateTarget - nav.w;
            const aeroBlend = clamp(dynamicPressure / 6000, 0, 1);
            const flapGain = 0.42 + aeroBlend * 0.45;
            const flapDifferential =
                clamp((angleError * 0.9 + rateError * 0.28 + trajectoryBias) * gains.flapAuthorityGain, -0.95, 0.95) *
                actuators.flapTorque;
            const rcsGain = mode === "ENTRY" ? gains.rcsEntryGain : gains.rcsTerminalGain;
            const gimbalGain = landingLike
                ? gains.gimbalLandingGain
                : flipLike
                  ? gains.gimbalFlipGain
                  : gains.gimbalEntryGain;
            const gimbalCommand =
                clamp((angleError * 1.05 + rateError * 0.4 + trajectoryBias * 0.45) * gimbalGain, -0.24, 0.24) *
                (poweredGuidance ? actuators.tvc : 0);

            return {
                noseFlap: clamp(flapBase - flapDifferential * flapGain, 0, 1),
                tailFlap: clamp(flapBase + flapDifferential * flapGain, 0, 1),
                rcs:
                    clamp((angleError * 1.1 + rateError * 0.42) * rcsGain * (1.15 - aeroBlend * 0.55), -1, 1) *
                    actuators.rcs,
                gimbal: gimbalCommand,
            };
        }

        controllerAltitudePid(dt, targetAltitude, nav, limits = {}) {
            const result = window.StarshipControlAlgorithms.altitudePid({
                dt,
                target: targetAltitude,
                measurement: nav.z,
                integral: this.altitudeIntegral,
                proportionalGain: this.controlGains.altitudePGain,
                integralGain: this.controlGains.altitudeIGain,
                climbLimit: limits.climb,
                descentLimit: limits.descent,
                integralLimit: limits.integralLimit,
            });

            this.altitudeIntegral = result.integral;
            return result.output;
        }

        controllerThrottlePi(dt, targetVz, nav, env, gainProfile = "default") {
            const gains = this.controlGains;
            const result = window.StarshipControlAlgorithms.throttlePi({
                dt,
                targetVelocity: targetVz,
                measuredVelocity: nav.vz,
                tilt: nav.a,
                maxThrust: env.maxThrust,
                mass: env.mass,
                gravity: env.g,
                integral: this.vzIntegral,
                proportionalGain: gainProfile === "takeoff" ? gains.takeoffThrottlePGain : gains.throttlePGain,
                integralGain: gainProfile === "takeoff" ? gains.takeoffThrottleIGain : gains.throttleIGain,
            });

            this.vzIntegral = result.integral;
            return result.output;
        }
    }

    class ProbeController extends StarshipController {
        constructor(config = {}) {
            super({ ...config, mass: config.mass ?? 300 });
        }

        setMass(nextMass) {
            if (typeof nextMass === "number" && Number.isFinite(nextMass)) {
                this.mass = clamp(nextMass, 1, 5000);
            }
        }

        update() {
            return {
                ...this.idleCommand(),
                mode: "BALLISTIC PROBE",
                status: "SONDA BALÍSTICA | sem propulsão",
                engineOn: false,
                throttle: 0,
                gimbal: 0,
                rcs: 0,
                noseTarget: 0,
                tailTarget: 0,
                forceEngineCutoff: true,
            };
        }
    }

    class SuperHeavyController extends StarshipController {
        setMissionConfig(nextConfig = {}) {
            // A Super Heavy never uses the Starship bellyflop branch. Enforce
            // this at the controller boundary so saved settings, direct API
            // calls, and the UI all produce the same powered recovery.
            super.setMissionConfig({
                ...nextConfig,
                postHoldAction: nextConfig.profile === MISSION_PROFILES.TEST_HOP
                    ? TEST_HOP_POST_HOLD_ACTIONS.CONTROLLED_RECOVERY
                    : nextConfig.postHoldAction,
            });
            if (this.missionConfig.profile === MISSION_PROFILES.TEST_HOP) {
                this.missionConfig.postHoldAction = TEST_HOP_POST_HOLD_ACTIONS.CONTROLLED_RECOVERY;
            }
        }

        reset() {
            super.reset();
            this.boostbackPhase = "IDLE";
            this.boostbackPhaseTimer = 0;
            this.hotstageTimer = 0;
        }

        transitionBoostbackPhase(nextPhase) {
            if (this.boostbackPhase !== nextPhase) {
                this.boostbackPhase = nextPhase;
                this.boostbackPhaseTimer = 0;
            }
        }

        runBoostbackBurn(dt, nav, sensors, env) {
            // Return-direction flip: the booster rotates tail-first toward the
            // landing site before relighting its inner engines.  This keeps
            // the standalone test useful on either side of the tower too.
            const targetX = env.targetX ?? 0;
            const returnDirection = Math.sign(targetX - nav.x) || -1;
            // B7 leaves the stack on an ascending, downrange arc.  A shallow
            // 100° flip mostly cancels VX and leaves its upward inertia
            // untouched, creating an unrealistically high post-boostback
            // coast. Use a deeper retrograde attitude so the engine plume
            // removes horizontal *and* vertical ascent energy.
            const flipAngle = degToRad(returnDirection * this.missionConfig.boosterFlipAngleDeg);
            const flipError = wrapAngle(flipAngle - nav.a);
            if (this.boostbackPhase === "IDLE") this.transitionBoostbackPhase("RCS_FLIP");
            this.boostbackPhaseTimer += dt;

            // Never light the boostback group while still upright.  With an
            // RCS fault the safe behaviour is to remain in the flip phase,
            // not turn a return burn into an unintended ascent burn.
            if (this.boostbackPhase === "RCS_FLIP" && Math.abs(flipError) < degToRad(5)) {
                this.transitionBoostbackPhase("BOOSTBACK_BURN");
            }
            // Solve horizontal return from the actual remaining ballistic
            // flight time. The old distance-only target commanded -310 m/s
            // even when B7 was only tens of kilometres downrange, so it
            // crossed the tower and had no powered means to come back.
            const inboundVelocityLimit = this.missionConfig.boosterInboundVelocityLimit;
            const estimatedReturnTime = clamp(estimateTimeToImpact(nav) * 0.86, 35, 360);
            const maxReturnVx = Math.max(inboundVelocityLimit, inboundVelocityLimit * 2.4);
            const desiredInboundVx = clamp(
                (targetX - nav.x) / estimatedReturnTime,
                -maxReturnVx,
                maxReturnVx
            );
            const returnVelocityReached = returnDirection < 0
                ? nav.vx <= desiredInboundVx
                : nav.vx >= desiredInboundVx;
            // Once the range solution is reached, stop the retrograde burn.
            // Continuing it merely adds reverse velocity while trying to
            // reduce VZ, which is what caused the tower overshoot.
            if (this.boostbackPhase === "BOOSTBACK_BURN" && (returnVelocityReached || this.boostbackPhaseTimer > this.missionConfig.boosterBoostbackMaxDuration)) {
                this.transitionBoostbackPhase("VERTICAL_COAST");
            }
            // Hand off only after the entry-guidance segment has had time to
            // remove most of the cross-range with grid fins.  The terminal
            // burn is then a small cleanup, not a late sideways rescue.
            if (this.boostbackPhase === "VERTICAL_COAST" && nav.z <= 5000) {
                this.transitionBoostbackPhase("TOWER_APPROACH");
            }

            if (this.boostbackPhase === "TOWER_APPROACH") {
                const previousProfile = this.missionConfig.profile;
                const previousBellyEntryAngle = this.controlGains.bellyEntryAngleDeg;
                this.missionConfig.profile = MISSION_PROFILES.REENTRY;
                this.controlGains.bellyEntryAngleDeg = 0;
                const command = super.update(dt, nav, sensors, {
                    ...env,
                    boostbackReturn: false,
                    recoveryMaxThrust: env.maxThrust * this.missionConfig.boosterRecoveryThrustFraction,
                    recoveryLateralMargin: 18,
                    recoveryAltitudeMargin: 420,
                    recoveryIgnitionMargin: 0,
                    recoveryFlipAltitude: 5000,
                    bypassTowerApproach: false,
                });
                this.missionConfig.profile = previousProfile;
                this.controlGains.bellyEntryAngleDeg = previousBellyEntryAngle;
                return {
                    ...command,
                    mode: `B7 BOOSTBACK | ${command.mode}`,
                    status: `B7 | aproximação da torre após boostback | ${command.status}`,
                    sequencePhase: "TOWER_APPROACH",
                };
            }

            const phase = this.boostbackPhase;
            const q = sensors.airdata.dynamicPressure ?? 0;
            // Predict a conservative time remaining from the actual descent
            // state.  The desired horizontal velocity collapses toward zero
            // as altitude is spent; this makes the entry coast shed range
            // efficiently instead of carrying boostback velocity to water.
            const coastErrorX = targetX - nav.x;
            const estimatedDescentTime = Math.max(12, estimateTimeToImpact(nav));
            const maxEntryVx = clamp(nav.z * 0.008, 5, 85);
            const targetEntryVx = clamp(coastErrorX / estimatedDescentTime, -maxEntryVx, maxEntryVx);
            const entryVelocityError = targetEntryVx - nav.vx;
            // This is an attitude setpoint only.  The ensuing rotation is
            // performed by the RCS at low q and by grid fins at higher q.
            const coastTilt = clamp(
                entryVelocityError * 0.010 + coastErrorX * 0.000012 - (env.windX ?? 0) * 0.007,
                -0.34,
                0.34
            );
            const targetAngle = phase === "VERTICAL_COAST" ? coastTilt : flipAngle;
            const angleError = wrapAngle(targetAngle - nav.a);
            const rcsAuthority = 1 - clamp(q / 9000, 0, 0.92);
            const rcsTarget = clamp((angleError * 1.3 - nav.w * 0.48) * rcsAuthority, -1, 1);
            const engineOn = phase === "BOOSTBACK_BURN";
            // A Super Heavy boostback relights a large inner-engine group;
            // represent that group as a bounded fraction of installed thrust.
            const throttle = engineOn ? this.missionConfig.boosterBoostbackThrottle : 0;
            const gimbalTarget = engineOn ? clamp(angleError * 0.13 - nav.w * 0.06, -0.12, 0.12) : 0;
            const statusByPhase = {
                RCS_FLIP: `RCS girando o B7 ${returnDirection < 0 ? "para oeste" : "para leste"}`,
                BOOSTBACK_BURN: `BOOSTBACK BURN | VX retorno ${desiredInboundVx.toFixed(0)} m/s | ${estimatedReturnTime.toFixed(0)} s até a torre`,
                VERTICAL_COAST: "ENTRY COAST | grid fins e RCS verticalizando para a aproximação",
            };
            this.setActiveController("CTRL_B7_BOOSTBACK", "Sequenciador de boostback B7", [
                `flip RCS retrogrado de ${this.missionConfig.boosterFlipAngleDeg.toFixed(0)}°`,
                "relight de grupo interno para remover energia VX/VZ",
                "coast de entrada após amortecer subida",
            ]);
            return this.attachActiveController({
                ...this.idleCommand(),
                engineOn,
                engineEnabled: engineOn,
                throttle,
                throttleTarget: throttle,
                activeEngineCount: engineOn ? 11 : 0,
                gimbal: gimbalTarget,
                gimbalTarget,
                // Differential grid-fin deflection creates aerodynamic torque
                // once dynamic pressure is available.  At thin-air altitude
                // RCS remains the dominant actuator.
                noseTarget: clamp((phase === "VERTICAL_COAST" ? clamp(q / 4800, 0.06, 0.68) : 0.56) - clamp(angleError * 0.72 - nav.w * 0.22, -0.34, 0.34), 0, 1),
                tailTarget: clamp((phase === "VERTICAL_COAST" ? clamp(q / 4800, 0.06, 0.68) : 0.56) + clamp(angleError * 0.72 - nav.w * 0.22, -0.34, 0.34), 0, 1),
                rcs: rcsTarget,
                rcsTarget,
                mode: `B7 ${phase}`,
                status: phase === "VERTICAL_COAST"
                    ? `ENTRY B7 | VX alvo ${targetEntryVx.toFixed(1)} m/s | q ${q.toFixed(0)} Pa | ${rcsAuthority > 0.35 ? "RCS" : "grid fins"} dominante`
                    : statusByPhase[phase] ?? "B7 BOOSTBACK",
                targetAngle,
                targetVz: phase === "VERTICAL_COAST" ? -80 : 0,
                targetVx: phase === "VERTICAL_COAST" ? targetEntryVx : undefined,
                targetX,
                targetZ: phase === "TOWER_APPROACH" ? 7000 : 0,
                sequencePhase: phase,
            }, nav);
        }

        update(dt, nav, sensors, env = {}) {
            if (!env.started) {
                return {
                    ...this.idleCommand(),
                    mode: "BOOSTER STANDBY",
                    status: "SUPER HEAVY | aguardando decolagem",
                    sequencePhase: "IDLE",
                };
            }

            const stackAttached = Boolean(env.stackAttached);
            if (
                !stackAttached &&
                ((!env.detachedReturn && this.missionConfig.profile === MISSION_PROFILES.BOOSTBACK_BURN) || env.boostbackReturn === true)
            ) {
                return this.runBoostbackBurn(dt, nav, sensors, env);
            }
            if (env.detachedReturn) {
                const previousBellyEntryAngle = this.controlGains.bellyEntryAngleDeg;
                this.controlGains.bellyEntryAngleDeg = 0;
                const recoveryMaxThrust = env.maxThrust * 0.72;
                const recoveryMaxDecel = Math.max(3, recoveryMaxThrust / Math.max(env.mass, 1) - env.g);
                const earlyBrakeAltitude =
                    (Math.max(0, -nav.vz) ** 2) / (2 * recoveryMaxDecel) +
                    Math.abs(nav.vx) * 18 + 420 + 900;
                const towerLink = sensors?.platformLink ?? {};
                const adaptedSensors = {
                    ...sensors,
                    platformLink: {
                        ...towerLink,
                        // The tower sends the same field used by Starship;
                        // B7 requests a higher value from its own recovery
                        // envelope before consuming that directive.
                        recommendedFlipAltitude: Math.max(
                            towerLink.recommendedFlipAltitude ?? 0,
                            (towerLink.captureZ ?? env.captureHeight ?? 0) + earlyBrakeAltitude
                        ),
                    },
                };
                const command = super.update(dt, nav, adaptedSensors, {
                    ...env,
                    recoveryMaxThrust,
                    recoveryLateralMargin: 18,
                    recoveryAltitudeMargin: 420,
                    recoveryIgnitionMargin: 900,
                    recoveryFlipAltitude: (towerLink.captureZ ?? env.captureHeight ?? 0) + earlyBrakeAltitude,
                    bypassTowerApproach: true,
                });
                this.controlGains.bellyEntryAngleDeg = previousBellyEntryAngle;
                // The generic recovery law protects the vertical rate, but
                // its Starship-sized terminal tilt cap is too small for a
                // Super Heavy that still carries boostback cross-range. Give
                // B7 a separate lateral-braking loop before splash/capture:
                // its permitted horizontal speed shrinks continuously with
                // altitude instead of arriving near the surface sideways.
                if (command.mode === "LANDING") {
                    const altitude = Math.max(0, nav.z);
                    const lateralError = nav.x - (env.targetX ?? 0);
                    const maxTerminalVx = clamp(altitude * 0.045, 1.5, 18);
                    const desiredVx = clamp(-lateralError * 0.028, -maxTerminalVx, maxTerminalVx);
                    const brakingTilt = clamp(
                        (desiredVx - nav.vx) * 0.014 - lateralError * 0.0015,
                        -0.48,
                        0.48
                    );
                    const terminalAttitude = this.controllerAttitude(
                        brakingTilt,
                        nav,
                        sensors.airdata.dynamicPressure,
                        0.08,
                        "LANDING",
                        0,
                        env.actuators ?? { flapLift: 1, flapTorque: 1, rcs: 1, tvc: 1 },
                        true
                    );
                    Object.assign(command, terminalAttitude, {
                        targetAngle: brakingTilt,
                        targetVx: desiredVx,
                        status: `${command.status} | alvo VX ${desiredVx.toFixed(1)} m/s`,
                    });
                }
                return {
                    ...command,
                    mode: `B7 SEPARADO | ${command.mode}`,
                    status: `B7 SEPARADO | ${command.status}`,
                    activeController: {
                        id: command.activeController?.id ?? "CTRL_RETORNO_B7",
                        label: "Guiagem Starship adaptada ao B7",
                        loops: ["lógica de frenagem da Starship", "link dedicado B7 ↔ torre", "grid fins + TVC"],
                    },
                    sequencePhase: "BOOSTER_RETURN",
                };
            }

            // A booster flown alone follows the proven Starship test-flight
            // sequencer: ascent, setpoint hold, powered return and terminal
            // tower guidance.  Its only aerodynamic difference here is that
            // it never selects the belly-flop branch.
            if (!stackAttached) {
                const previousPostHoldAction = this.missionConfig.postHoldAction;
                const previousBellyEntryAngle = this.controlGains.bellyEntryAngleDeg;
                if (this.missionConfig.profile === MISSION_PROFILES.TEST_HOP) {
                    this.missionConfig.postHoldAction = TEST_HOP_POST_HOLD_ACTIONS.CONTROLLED_RECOVERY;
                }
                // The shared recovery controller otherwise uses Starship's
                // 90° entry setpoint before its terminal burn. That made B7
                // look and fly like a bellyflop even with the test sequence
                // correctly set to controlled recovery. A booster remains
                // upright through its entire standalone return.
                this.controlGains.bellyEntryAngleDeg = 0;
                // The tower approach controller was tuned for the much
                // lighter Starship and only started braking 260 m above its
                // waypoint. Calculate a B7-specific lead distance, then
                // hand that same envelope to both approach and final capture.
                const recoveryMaxThrust = env.maxThrust * this.missionConfig.boosterRecoveryThrustFraction;
                const recoveryMaxDecel = Math.max(3, recoveryMaxThrust / Math.max(env.mass, 1) - env.g);
                const earlyBrakeAltitude =
                    (Math.max(0, -nav.vz) ** 2) / (2 * recoveryMaxDecel) +
                    Math.abs(nav.vx) * 18 + 420 + 650;
                const captureZ = sensors?.platformLink?.captureZ ?? env.captureHeight ?? 0;
                const command = super.update(dt, nav, sensors, {
                    ...env,
                    recoveryMaxThrust,
                    recoveryIgnitionMargin: 650,
                    recoveryFlipAltitude: captureZ + earlyBrakeAltitude,
                    approachIgnitionMargin: earlyBrakeAltitude,
                });
                this.missionConfig.postHoldAction = previousPostHoldAction;
                this.controlGains.bellyEntryAngleDeg = previousBellyEntryAngle;
                return {
                    ...command,
                    mode: `B7 | ${command.mode}`,
                    status: `SUPER HEAVY | ${command.status}`,
                    stageSeparation: false,
                };
            }

            const separationAltitude = env.stageSeparationAltitude ?? 10000;
            const hotstageStack = stackAttached && this.missionConfig.profile === MISSION_PROFILES.STACK_HOTSTAGE_BOOSTBACK;
            const suborbitalStack = stackAttached && this.missionConfig.profile === MISSION_PROFILES.SUBORBITAL_MISSION;
            // The legacy hot-staging profile begins already on a suborbital
            // arc. The integrated mission reaches the same sequence under
            // powered ascent, releasing it only after the staging altitude.
            const deliverySpeedReady = Math.hypot(nav.vx, nav.vz) >= 5600 / 3.6;
            const deliveryAttitudeReady = Math.abs(wrapAngle((env.stackHoldAngle ?? Math.PI / 3) - nav.a)) <= degToRad(12);
            const hotstageSequenceActive = hotstageStack ||
                (suborbitalStack && nav.z >= separationAltitude - 250 && deliverySpeedReady && deliveryAttitudeReady);
            if (hotstageSequenceActive) {
                this.hotstageTimer += dt;
                const upperIgnited = this.hotstageTimer >= 1.4;
                const separationReady = this.hotstageTimer >= 3.2;
                const stackHoldAngle = env.stackHoldAngle ?? Math.PI / 3;
                const stackAngleError = wrapAngle(stackHoldAngle - nav.a);
                const stackRcs = clamp(stackAngleError * 1.7 - nav.w * 0.62, -1, 1);
                const stackGimbal = clamp(stackAngleError * 0.30 - nav.w * 0.11, -0.16, 0.16);
                return {
                    ...this.idleCommand(),
                    mode: separationReady ? "HOT-STAGING / SEPARAÇÃO" : upperIgnited ? "HOT-STAGING / IGNIÇÃO S24" : "ASCENSÃO / MOTORES CENTRAIS",
                    status: separationReady
                        ? "SEPARAÇÃO HOT-STAGING | ignição da S24 autorizada"
                        : upperIgnited
                            ? "S24 acesa ainda acoplada | braçadeiras preparando abertura"
                            : `B7 reduzido aos motores centrais | voo leste | Z ${nav.z.toFixed(0)} m`,
                    activeController: {
                        id: "CTRL_STACK_PREORBITAL",
                        label: "Costa pré-orbital e sequenciador de hot-staging",
                        loops: ["propulsão do stack inibida", "detecção de ápice", "liberação S24 / anel / B7"],
                    },
                    engineOn: !separationReady,
                    engineEnabled: !separationReady,
                    throttle: separationReady ? 0 : 0.12,
                    throttleTarget: separationReady ? 0 : 0.12,
                    // Maintain the pre-orbital 30° attitude with actual
                    // RCS/TVC while clamped together; no hidden attitude lock
                    // is used before the B7's post-separation flip.
                    gimbal: separationReady ? 0 : stackGimbal,
                    gimbalTarget: separationReady ? 0 : stackGimbal,
                    noseTarget: 0.1,
                    tailTarget: 0.1,
                    rcsTarget: separationReady ? 0 : stackRcs,
                    forceEngineCutoff: separationReady,
                    targetZ: separationAltitude,
                    targetAngle: stackHoldAngle,
                    hotStageIgnition: upperIgnited,
                    activeEngineCount: separationReady ? 0 : 3,
                    sequencePhase: separationReady ? "STAGE_SEPARATION" : "PREORBIT_COAST",
                    stageSeparation: separationReady,
                };
            }
            const targetAltitude = stackAttached ? separationAltitude : (this.missionConfig.testAltitudeSetpoint ?? 2800);
            const altitudeError = targetAltitude - nav.z;
            // The integrated mission pitches progressively downrange during
            // ascent, then passes that prograde attitude into hot-staging.
            // Both stages therefore retain one continuous trajectory from
            // liftoff instead of spawning at the handoff point.
            const ascentPitch = suborbitalStack
                ? clamp((nav.z / Math.max(separationAltitude, 1)) * Math.PI / 3, 0, Math.PI / 3)
                : hotstageStack
                    ? clamp((nav.z / Math.max(separationAltitude, 1)) * 0.16, 0, 0.16)
                    : 0;
            // Build the same 5,800 km/h pre-orbital handoff used by the
            // standalone hot-staging profile.  The former altitude-only loop
            // slowed toward zero at 60 km, leaving S24 with only ~2,500 km/h.
            // Here the vertical setpoint is derived from the remaining part
            // of the total speed vector after the downrange component.
            const suborbitalAscentFraction = clamp(nav.z / Math.max(separationAltitude, 1), 0, 1);
            const suborbitalSpeedSetpoint = 180 + (5800 / 3.6 - 180) * suborbitalAscentFraction;
            const suborbitalVerticalSetpoint = Math.sqrt(Math.max(0, suborbitalSpeedSetpoint ** 2 - nav.vx ** 2));
            const targetVz = suborbitalStack
                ? Math.max(altitudeError * 0.045, suborbitalVerticalSetpoint)
                : clamp(altitudeError * 0.045, -18, 115);
            const separationReady = stackAttached && Math.abs(altitudeError) <= 8 && Math.abs(nav.vz) <= 4;
            const throttle = separationReady
                ? 0
                : clamp(this.controllerThrottlePi(dt, targetVz, nav, env, "takeoff"), 0, 1);

            return {
                ...this.idleCommand(),
                mode: stackAttached ? "ASCENSÃO DO STACK" : "ASCENSÃO SUPER HEAVY",
                status: separationReady
                    ? "SEPARAÇÃO DE ESTÁGIOS"
                    : stackAttached
                        ? `${suborbitalStack ? `MISSÃO SUBORBITAL B7 + S24 | entrega ${(suborbitalSpeedSetpoint * 3.6).toFixed(0)} km/h` : hotstageStack ? "STACK HOT-STAGING" : "STACK B7 + S24"} | alvo ${targetAltitude.toFixed(0)} m | Vz alvo ${targetVz.toFixed(1)} m/s`
                        : "SUPER HEAVY | voo autônomo",
                activeController: {
                    id: "CTRL_SUPERHEAVY_ASCENT",
                    label: "Controle de ascensão Super Heavy",
                    loops: ["velocidade vertical", "TVC", "separação de estágios"],
                },
                engineOn: !separationReady,
                engineEnabled: !separationReady,
                throttle,
                throttleTarget: throttle,
                targetAngle: ascentPitch,
                gimbal: clamp((ascentPitch - nav.a) * 0.22 - nav.w * 0.08, -0.12, 0.12),
                gimbalTarget: clamp((ascentPitch - nav.a) * 0.22 - nav.w * 0.08, -0.12, 0.12),
                noseTarget: 0,
                tailTarget: 0,
                rcsTarget: 0,
                forceEngineCutoff: separationReady,
                sequencePhase: separationReady ? "STAGE_SEPARATION" : "ASCENT",
                stageSeparation: separationReady,
            };
        }
    }

    window.StarshipController = StarshipController;
    window.ProbeController = ProbeController;
    window.SuperHeavyController = SuperHeavyController;
})();
