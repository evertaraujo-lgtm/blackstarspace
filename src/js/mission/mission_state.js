(function () {
    /**
     * Single owner for mission defaults. Mutable runtime state is deliberately
     * grouped here so simulation, renderer and UI can receive the same object
     * as the remaining globals are migrated.
     */
    function createMissionState() {
        const flightPrograms = Object.freeze({
            REENTRY: "reentry_recovery",
            TEST_HOP: "test_takeoff_sequence",
            BOOSTBACK_BURN: "boostback_burn",
            SUBORBITAL_MISSION: "suborbital_mission",
            STACK_HOTSTAGE_BOOSTBACK: "stack_hotstage_boostback",
        });
        const postHoldActions = Object.freeze({
            CONTROLLED_RECOVERY: "controlled_recovery",
            BELLYFLOP_RECOVERY: "bellyflop_recovery",
        });
        return {
            flightPrograms,
            postHoldActions,
            flightControl: {
                controllerId: "FCC-PRIMARY",
                selectedShipId: "starship_sn15",
                selectedPlatformId: "mecazilla_olp_a",
                routeLocked: true,
                shipFeedbackMode: "closed_loop",
                flightProgramProfile: flightPrograms.TEST_HOP,
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
                postHoldAction: postHoldActions.BELLYFLOP_RECOVERY,
                abortBelly: false,
                boosterRecovery: "tower_catch",
            },
            stack: {
                attachS24: false,
                separated: false,
                boosterRecovery: null,
                boostbackReturn: false,
            },
            instances: {
                detachedBoosterFlight: null,
                hotStageRingFlight: null,
            },
            optimizations: {
                bestHotstageResult: null,
                bestBoosterResult: null,
            },
        };
    }

    window.createStarshipMissionState = createMissionState;
})();
