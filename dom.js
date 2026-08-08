(function () {
    const elementIds = [
        "info", "windXSlider", "windXLabel", "windZSlider", "windZLabel", "physicsMassModelStatus",
        "timeScroll", "activeControllerIndicator", "instanceTrackerList", "instanceTracker", "instanceTrackerToggleBtn",
        "hud", "toggleHudBtn", "simulationSpeedIndicator", "startBtn", "pauseBtn", "exportBtn",
        "openTelemetryModalBtn", "openPhysicsModalBtn", "openProtocolModalBtn", "openShipModalBtn", "openTowerModalBtn",
        "toggleTelemetryHudStyleBtn", "openTerraMapBtn", "terraMapModal", "closeTerraMapModalBtn", "terraMapCanvas",
        "terraMapTargetInput", "applyTerraMapTargetBtn", "focusStarbaseBtn", "terraMapReadout", "probeMapControls",
        "probeAltitudeInput", "probeVelocityInput", "probeMassInput", "setProbePositionBtn", "simulateProbeTrajectoryBtn",
        "positionProbePairBtn", "probeDockingStatus", "probeManualRcsInput", "probeManualRcsStatus", "probeDockingPanelStatus",
        "initialFlightTimeInput", "sceneClockLabel", "launchCountdownInput", "telemetryModal", "physicsModal", "protocolModal",
        "shipModal", "towerModal", "closeTelemetryModalBtn", "closePhysicsModalBtn", "closeProtocolModalBtn", "closeShipModalBtn",
        "closeTowerModalBtn", "shipGainProfileLabel", "resetShipGainsBtn", "shipControlLoopView", "toggleShipControllersBtn",
        "shipControllersSection", "sn15PropulsionPanel", "propulsionPanelTitle", "sn15PropulsionReadout", "sn15TankDiagram",
        "sn15EngineThrustInput", "sn15IspInput", "sn15MainLoxInput", "sn15MainLch4Input", "sn15HeaderLoxInput",
        "sn15HeaderLch4Input", "superHeavyStackPanel", "superHeavyAttachS24Input", "superHeavyStackReadout", "probeManualRcsPanel",
        "landingTargetLabel", "resetTargetBtn", "operationModeSelect", "shipSelect", "platformSelect", "shipFeedbackModeSelect",
        "boosterRecoverySelect", "platformPanelLabel", "targetHint", "captureStatus", "falseTowerAuthBtn", "protocolStatus",
        "toggleFlightControlDetailsBtn", "flightControlDetails", "flightControlSummary", "protocolSpecView", "protocolUplinkView",
        "protocolDownlinkView", "protocolUplinkDeliveryStatus", "protocolDownlinkDeliveryStatus", "protocolUplinkOverrideEnabled",
        "protocolDownlinkOverrideEnabled", "protocolUplinkOverrideText", "protocolDownlinkOverrideText", "protocolUplinkSignalSelect",
        "protocolDownlinkSignalSelect", "protocolUplinkSignalValueInput", "protocolDownlinkSignalValueInput", "forceProtocolUplinkSignalBtn",
        "forceProtocolDownlinkSignalBtn", "clearProtocolUplinkOverrideBtn", "clearProtocolDownlinkOverrideBtn", "loadProtocolUplinkBtn",
        "loadProtocolDownlinkBtn", "toggleFlightRouteBtn", "abortBellyBtn", "flightProgramProfileSelect", "flightProgramAltitudeInput",
        "flightProgramHotstageAltitudeInput", "flightProgramHotstageThrottleInput", "flightProgramHotstageRampInput",
        "flightProgramHotstagePitchBiasInput", "flightProgramHotstageReserveInput", "runHotstageOptimizationBtn",
        "applyHotstageOptimizationBtn", "hotstageOptimizationStatus", "hotstageOptimizationResults", "flightProgramBoosterThrottleInput",
        "flightProgramBoosterFlipAngleInput", "flightProgramBoosterInboundVelocityInput", "flightProgramBoosterBurnDurationInput",
        "flightProgramBoosterRecoveryThrustInput", "runBoosterOptimizationBtn", "applyBoosterOptimizationBtn", "boosterOptimizationStatus",
        "boosterOptimizationResults", "flightProgramHoldInput", "flightProgramPostHoldSelect", "flightProgramStatus", "physicsPresetSelect",
        "physicsPresetStatus", "towerLinkFailureSelect", "towerArmsFailureSelect", "towerFailureStatus", "towerApproachDistanceInput",
        "towerApproachAngleInput", "towerApproachToleranceInput", "towerApproachCommand", "engineFailureSelect", "rcsFailureSelect",
        "flapFailureSelect", "failureStatus",
    ];

    function requiredElement(id) {
        const element = document.getElementById(id);
        if (!element) throw new Error(`Elemento obrigatório não encontrado: #${id}`);
        return element;
    }

    function getElements() {
        return {
            c: requiredElement("cv"),
            ...Object.fromEntries(elementIds.map((id) => [id, requiredElement(id)])),
            speedButtons: document.querySelectorAll(".speed-btn"),
        };
    }

    window.StarshipDom = Object.freeze({ getElements });
})();
