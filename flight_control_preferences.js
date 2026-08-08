(function () {
    const STORAGE_KEY = "starship.flight-control.v1";

    function createFlightControlPreferences({ storage = localStorage, clamp }) {
        if (typeof clamp !== "function") throw new TypeError("createFlightControlPreferences requer clamp");

        function persist({ operationMode, flightControlState, stackMission }) {
            try {
                storage.setItem(STORAGE_KEY, JSON.stringify({
                    operationMode,
                    selectedShipId: flightControlState.selectedShipId,
                    selectedPlatformId: flightControlState.selectedPlatformId,
                    routeLocked: flightControlState.routeLocked,
                    shipFeedbackMode: flightControlState.shipFeedbackMode,
                    flightProgramProfile: flightControlState.flightProgramProfile,
                    testAltitudeSetpoint: flightControlState.testAltitudeSetpoint,
                    hotstageAltitudeSetpoint: flightControlState.hotstageAltitudeSetpoint,
                    hotstageThrottle: flightControlState.hotstageThrottle,
                    hotstageAltitudeRampRate: flightControlState.hotstageAltitudeRampRate,
                    hotstagePitchBiasMaxDeg: flightControlState.hotstagePitchBiasMaxDeg,
                    hotstageFuelReserveFraction: flightControlState.hotstageFuelReserveFraction,
                    boosterBoostbackThrottle: flightControlState.boosterBoostbackThrottle,
                    boosterFlipAngleDeg: flightControlState.boosterFlipAngleDeg,
                    boosterInboundVelocityLimit: flightControlState.boosterInboundVelocityLimit,
                    boosterBoostbackMaxDuration: flightControlState.boosterBoostbackMaxDuration,
                    boosterRecoveryThrustFraction: flightControlState.boosterRecoveryThrustFraction,
                    holdDuration: flightControlState.holdDuration,
                    postHoldAction: flightControlState.postHoldAction,
                    boosterRecovery: flightControlState.boosterRecovery,
                    attachS24: stackMission.attachS24,
                }));
            } catch {
                // Storage can be disabled by the browser; the simulator remains usable.
            }
        }

        function restore({ elements, flightControlState, stackMission, shipRegistry, platformRegistry, flightPrograms, postHoldActions }) {
            try {
                const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? "null");
                if (!saved || typeof saved !== "object") return;
                if (typeof saved.operationMode === "string") elements.operationModeSelect.value = saved.operationMode;
                if (shipRegistry[saved.selectedShipId]) flightControlState.selectedShipId = saved.selectedShipId;
                if (platformRegistry[saved.selectedPlatformId]) flightControlState.selectedPlatformId = saved.selectedPlatformId;
                if (typeof saved.routeLocked === "boolean") flightControlState.routeLocked = saved.routeLocked;
                if (["platform_isolated", "closed_loop"].includes(saved.shipFeedbackMode)) flightControlState.shipFeedbackMode = saved.shipFeedbackMode;
                if (Object.values(flightPrograms).includes(saved.flightProgramProfile)) flightControlState.flightProgramProfile = saved.flightProgramProfile;
                const numberFields = [
                    ["testAltitudeSetpoint", 0, 800000], ["hotstageAltitudeSetpoint", 60000, 800000], ["hotstageThrottle", 0.35, 1],
                    ["hotstageAltitudeRampRate", 100, 1200], ["hotstagePitchBiasMaxDeg", 5, 35], ["hotstageFuelReserveFraction", 0.01, 0.25],
                    ["boosterBoostbackThrottle", 0.55, 1], ["boosterFlipAngleDeg", 85, 165], ["boosterInboundVelocityLimit", 100, 1600],
                    ["boosterBoostbackMaxDuration", 60, 240], ["boosterRecoveryThrustFraction", 0.45, 1], ["holdDuration", 0, 300],
                ];
                numberFields.forEach(([field, min, max]) => {
                    if (Number.isFinite(saved[field])) flightControlState[field] = clamp(saved[field], min, max);
                });
                if (Object.values(postHoldActions).includes(saved.postHoldAction)) flightControlState.postHoldAction = saved.postHoldAction;
                if (["tower_catch", "splashdown"].includes(saved.boosterRecovery)) flightControlState.boosterRecovery = saved.boosterRecovery;
                stackMission.attachS24 = Boolean(saved.attachS24);

                const fields = {
                    flightProgramProfileSelect: flightControlState.flightProgramProfile,
                    flightProgramAltitudeInput: flightControlState.testAltitudeSetpoint,
                    flightProgramHotstageAltitudeInput: flightControlState.hotstageAltitudeSetpoint,
                    flightProgramHotstageThrottleInput: flightControlState.hotstageThrottle * 100,
                    flightProgramHotstageRampInput: flightControlState.hotstageAltitudeRampRate,
                    flightProgramHotstagePitchBiasInput: flightControlState.hotstagePitchBiasMaxDeg,
                    flightProgramHotstageReserveInput: flightControlState.hotstageFuelReserveFraction * 100,
                    flightProgramBoosterThrottleInput: flightControlState.boosterBoostbackThrottle * 100,
                    flightProgramBoosterFlipAngleInput: flightControlState.boosterFlipAngleDeg,
                    flightProgramBoosterInboundVelocityInput: flightControlState.boosterInboundVelocityLimit,
                    flightProgramBoosterBurnDurationInput: flightControlState.boosterBoostbackMaxDuration,
                    flightProgramBoosterRecoveryThrustInput: flightControlState.boosterRecoveryThrustFraction * 100,
                    flightProgramHoldInput: flightControlState.holdDuration,
                    flightProgramPostHoldSelect: flightControlState.postHoldAction,
                    boosterRecoverySelect: flightControlState.boosterRecovery,
                };
                Object.entries(fields).forEach(([elementName, value]) => { elements[elementName].value = String(value); });
                elements.superHeavyAttachS24Input.checked = stackMission.attachS24;
            } catch {
                // Ignore a corrupt/outdated preference and use the built-in defaults.
            }
        }

        return Object.freeze({ persist, restore });
    }

    window.StarshipFlightControlPreferences = Object.freeze({ createFlightControlPreferences });
})();
