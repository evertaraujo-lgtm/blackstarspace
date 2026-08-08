// Application composition root. Dependencies are loaded before this file by
// starship_v1.html; this remains a classic script while legacy modules share
// the global lexical scope. New feature code belongs in focused modules.
const elements = window.StarshipDom.getElements();
const { c, info, windXSlider, windXLabel, windZSlider, windZLabel, physicsMassModelStatus, timeScroll, activeControllerIndicator, instanceTrackerList, instanceTracker, instanceTrackerToggleBtn, hud, toggleHudBtn, simulationSpeedIndicator, startBtn, pauseBtn, exportBtn, openTelemetryModalBtn, openPhysicsModalBtn, openProtocolModalBtn, openShipModalBtn, openTowerModalBtn, toggleTelemetryHudStyleBtn, openTerraMapBtn, terraMapModal, closeTerraMapModalBtn, terraMapCanvas, terraMapTargetInput, applyTerraMapTargetBtn, focusStarbaseBtn, terraMapReadout, probeMapControls, probeAltitudeInput, probeVelocityInput, probeMassInput, setProbePositionBtn, simulateProbeTrajectoryBtn, positionProbePairBtn, probeDockingStatus, probeManualRcsInput, probeManualRcsStatus, probeDockingPanelStatus, initialFlightTimeInput, sceneClockLabel, launchCountdownInput, telemetryModal, physicsModal, protocolModal, shipModal, towerModal, closeTelemetryModalBtn, closePhysicsModalBtn, closeProtocolModalBtn, closeShipModalBtn, closeTowerModalBtn, shipGainProfileLabel, resetShipGainsBtn, shipControlLoopView, toggleShipControllersBtn, shipControllersSection, sn15PropulsionPanel, propulsionPanelTitle, sn15PropulsionReadout, sn15TankDiagram, sn15EngineThrustInput, sn15IspInput, sn15MainLoxInput, sn15MainLch4Input, sn15HeaderLoxInput, sn15HeaderLch4Input, superHeavyStackPanel, superHeavyAttachS24Input, superHeavyStackReadout, probeManualRcsPanel, landingTargetLabel, resetTargetBtn, operationModeSelect, shipSelect, platformSelect, shipFeedbackModeSelect, boosterRecoverySelect, platformPanelLabel, targetHint, captureStatus, falseTowerAuthBtn, protocolStatus, toggleFlightControlDetailsBtn, flightControlDetails, flightControlSummary, protocolSpecView, protocolUplinkView, protocolDownlinkView, protocolUplinkDeliveryStatus, protocolDownlinkDeliveryStatus, protocolUplinkOverrideEnabled, protocolDownlinkOverrideEnabled, protocolUplinkOverrideText, protocolDownlinkOverrideText, protocolUplinkSignalSelect, protocolDownlinkSignalSelect, protocolUplinkSignalValueInput, protocolDownlinkSignalValueInput, forceProtocolUplinkSignalBtn, forceProtocolDownlinkSignalBtn, clearProtocolUplinkOverrideBtn, clearProtocolDownlinkOverrideBtn, loadProtocolUplinkBtn, loadProtocolDownlinkBtn, toggleFlightRouteBtn, abortBellyBtn, flightProgramProfileSelect, flightProgramAltitudeInput, flightProgramHotstageAltitudeInput, flightProgramHotstageThrottleInput, flightProgramHotstageRampInput, flightProgramHotstagePitchBiasInput, flightProgramHotstageReserveInput, runHotstageOptimizationBtn, applyHotstageOptimizationBtn, hotstageOptimizationStatus, hotstageOptimizationResults, flightProgramBoosterThrottleInput, flightProgramBoosterFlipAngleInput, flightProgramBoosterInboundVelocityInput, flightProgramBoosterBurnDurationInput, flightProgramBoosterRecoveryThrustInput, runBoosterOptimizationBtn, applyBoosterOptimizationBtn, boosterOptimizationStatus, boosterOptimizationResults, flightProgramHoldInput, flightProgramPostHoldSelect, flightProgramStatus, physicsPresetSelect, physicsPresetStatus, towerLinkFailureSelect, towerArmsFailureSelect, towerFailureStatus, towerApproachDistanceInput, towerApproachAngleInput, towerApproachToleranceInput, towerApproachCommand, engineFailureSelect, rcsFailureSelect, flapFailureSelect, failureStatus, speedButtons } = elements;
const ctx = c.getContext("2d");
const sn15PropulsionInputs = [
    sn15EngineThrustInput,
    sn15IspInput,
    sn15MainLoxInput,
    sn15MainLch4Input,
    sn15HeaderLoxInput,
    sn15HeaderLch4Input,
];

const G = 9.81;
const TH = 6.9e6;
const EARTH_RADIUS_METERS = 6371000;
const EARTH_MU = G * EARTH_RADIUS_METERS ** 2;
const Cd = 1.45;
const physicsCore = new window.StarshipPhysicalCore.PhysicalCore({
    surfaceGravity: G,
    earthRadius: EARTH_RADIUS_METERS,
    earthMu: EARTH_MU,
    circumference: window.EARTH_CIRCUMFERENCE_METERS,
});
let appContext;

function wrapWorldX(worldX) {
    return physicsCore.wrapWorldX(worldX);
}

function propagateNavigationEstimate(body, dt, nonGravAx = 0, nonGravAz = 0) {
    return physicsCore.step(body, dt, {
        mass: 1,
        accelerationX: nonGravAx,
        accelerationZ: nonGravAz,
        integrateRotation: false,
    });
}
// Visual scale is expressed in pixels per metre.  The camera keeps this close
// view while following the vehicle, rather than shrinking real dimensions.
const CAMERA_ZOOM = 3.2;
const CAMERA_SHIP_SCREEN_X = 0.38;
const CAMERA_SHIP_SCREEN_Y = 0.56;
// Reserve the lower HUD band below the physical ground line.  The telemetry
// panel must not cover the tower base or the zero-altitude reference.
const GROUND_MARGIN = 180;
const TARGET_TOLERANCE = 25;
const AUTO_SLOWDOWN_ALTITUDE = 50;
const TOWER_CAPTURE_ALTITUDE = 100;
const TOWER_HEIGHT = 140;
const TOWER_MAST_OFFSET_X = -20;
const LAUNCH_PAD_DECK_HEIGHT = 8;
// The tower and the stand-alone launch pad are fixed world structures.  In
// stand-alone mode, the selectable X coordinate belongs only to the landing
// target.
const TOWER_WORLD_X = 0;
const STANDALONE_LAUNCH_WORLD_X = 0;
const INDIAN_OCEAN_TARGET_X = 19000000;
const MAX_GIMBAL = 0.24;
// Physical location and dimensions of the visual-only flight-control building.
// It deliberately has no collision volume or influence on the simulation.
const FLIGHT_CONTROL_BUILDING = { x: -130, width: 24, height: 18 };
const scene = new window.Scene({
    flightControlBuilding: FLIGHT_CONTROL_BUILDING,
    launchPadHeight: LAUNCH_PAD_DECK_HEIGHT,
});
const terra = new window.Terra();
const shipRegistry = window.StarshipVehicleCatalog.createRegistry({ gravity: G, maxThrust: TH });
const platformRegistry = window.StarshipPlatformCatalog.createRegistry({
    captureAltitude: TOWER_CAPTURE_ALTITUDE,
    towerHeight: TOWER_HEIGHT,
});
const missionState = window.createStarshipMissionState();
const FLIGHT_PROGRAM_PROFILES = missionState.flightPrograms;
const TEST_HOP_POST_HOLD_ACTIONS = missionState.postHoldActions;
const flightControlState = missionState.flightControl;
const stackMission = missionState.stack;
const missionInstances = missionState.instances;
const missionOptimizations = missionState.optimizations;
let detachedBoosterFlight = missionInstances.detachedBoosterFlight;
let hotStageRingFlight = missionInstances.hotStageRingFlight;
let bestHotstageOptimizationResult = missionOptimizations.bestHotstageResult;
let bestBoosterOptimizationResult = missionOptimizations.bestBoosterResult;

function setDetachedBoosterFlight(value) {
    detachedBoosterFlight = value;
    missionInstances.detachedBoosterFlight = value;
}

function setHotStageRingFlight(value) {
    hotStageRingFlight = value;
    missionInstances.hotStageRingFlight = value;
}

function setBestHotstageOptimizationResult(value) {
    bestHotstageOptimizationResult = value;
    missionOptimizations.bestHotstageResult = value;
}

function setBestBoosterOptimizationResult(value) {
    bestBoosterOptimizationResult = value;
    missionOptimizations.bestBoosterResult = value;
}
let flightControlPreferences;

function getFlightControlPreferences() {
    flightControlPreferences ??= window.StarshipFlightControlPreferences.createFlightControlPreferences({ clamp });
    return flightControlPreferences;
}

function persistFlightControlConfig() {
    getFlightControlPreferences().persist({ operationMode, flightControlState, stackMission });
}

function restoreFlightControlConfig() {
    getFlightControlPreferences().restore({
        elements,
        flightControlState,
        stackMission,
        shipRegistry,
        platformRegistry,
        flightPrograms: FLIGHT_PROGRAM_PROFILES,
        postHoldActions: TEST_HOP_POST_HOLD_ACTIONS,
    });
}

const flightController = new window.StarshipFlightController({
    controllerId: flightControlState.controllerId,
    operationMode: "standalone",
    routeLocked: flightControlState.routeLocked,
    shipFeedbackMode: flightControlState.shipFeedbackMode,
    flightProgram: {
        profile: flightControlState.flightProgramProfile,
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
        abortBelly: flightControlState.abortBelly,
    },
    shipProfiles: Object.values(shipRegistry),
    platformProfiles: Object.values(platformRegistry),
    selectedShipId: flightControlState.selectedShipId,
    selectedPlatformId: flightControlState.selectedPlatformId,
    noiseFn: (amplitude) => (Math.random() - 0.5) * 2 * amplitude,
});
const propulsionOverrides = new Map();

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function moveToward(current, target, rate, dt) {
    const delta = target - current;
    const step = rate * dt;
    return Math.abs(delta) <= step ? target : current + Math.sign(delta) * step;
}

function truncateText(text, maxLength) {
    return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`;
}

function wrapAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function blendAngle(current, measured, gain) {
    return wrapAngle(current + wrapAngle(measured - current) * gain);
}

function toBody(wx, wz, angle) {
    return {
        forward: wx * Math.sin(angle) + wz * Math.cos(angle),
        right: wx * Math.cos(angle) - wz * Math.sin(angle),
    };
}

function toWorld(forward, right, angle) {
    return {
        x: forward * Math.sin(angle) + right * Math.cos(angle),
        z: forward * Math.cos(angle) - right * Math.sin(angle),
    };
}

const camera = { x: 0, z: 0, zoom: CAMERA_ZOOM };
// Pre-flight map navigation can inspect either endpoint without moving it.
let sceneFocusX = null;
let followedInstanceId = "primary";

function getFollowedInstanceState() {
    if (followedInstanceId === "b7" && detachedBoosterFlight?.state) return detachedBoosterFlight.state;
    if (followedInstanceId === "probe-target" && probeDocking.target) return probeDocking.target;
    return s;
}

function updateCamera() {
    if (!s) {
        return;
    }

    // A fixed physical zoom makes the 50 m vehicle legible.  Once the run
    // starts, the camera follows it in both axes so ascent and descent remain
    // visible instead of reducing the world scale.
    const groundFramingAltitude = Math.max(
        0,
        (c.height * (1 - CAMERA_SHIP_SCREEN_Y) - GROUND_MARGIN) / camera.zoom
    );
    // A ground landing away from any capture platform remains framed at its
    // actual touchdown point after the simulation has ended.
    const followedState = getFollowedInstanceState();
    const followingDetachedBooster = followedInstanceId === "b7" && Boolean(detachedBoosterFlight?.state);
    const previewingProbeDocking = !started && isProbeSelected() && Boolean(probeDocking.target);
    const preserveFreeLandingCamera = !started && followedState.end && !followedState.captured && !followedState.waterLanding;
    // A detached stage owns its camera target.  Do not let the lifecycle of
    // the selected ship (S24) return this view to the launch pad/ground.
    const followShip = followingDetachedBooster || previewingProbeDocking || started || preserveFreeLandingCamera;
    camera.x = followShip
        ? followedState.x
        : Number.isFinite(sceneFocusX)
            ? sceneFocusX
            : getLaunchPositionX();
    // The normal vehicle view keeps a ground band in frame.  That lower bound
    // made the B7 camera stop descending during its terminal approach, so the
    // booster could leave the visible area while its card still said SEGUINDO.
    camera.z = followShip
        ? followingDetachedBooster
            ? Number.isFinite(followedState.z) ? followedState.z : groundFramingAltitude
            : Math.max(followedState.z, groundFramingAltitude)
        : groundFramingAltitude;
}

function updateLandingTargetLabel() {
    landingTargetLabel.textContent = landingTargetX.toFixed(0);
}

function setLandingTarget(worldX) {
    if (isLinkedMode()) {
        return;
    }

    const halfCircumference = window.EARTH_CIRCUMFERENCE_METERS / 2;
    landingTargetX = Math.max(-halfCircumference, Math.min(halfCircumference, Math.round(worldX)));
    updateLandingTargetLabel();
}

function getGainDisplayPrecision(step) {
    const stepText = String(step);
    const dotIndex = stepText.indexOf(".");
    return dotIndex >= 0 ? stepText.length - dotIndex - 1 : 0;
}

function formatGainValue(value, step) {
    return Number(value).toFixed(getGainDisplayPrecision(step));
}

const {
    escapeHtmlText,
    buildControlLoopMetricMarkup,
    buildControlLoopNodeMarkup,
    buildControlLoopOutputMarkup,
    buildControlLoopNoteMarkup,
    buildControlLoopDiagramMarkup,
    updateShipGainPanel,
    handleShipGainInput,
} = window.StarshipControlLoopView;

const physicsPresets = {
    nominal: {
        windX: 0,
        windZ: 0,
        description: "Configuração nominal.",
    },
    crosswind_right: {
        windX: 32,
        windZ: 0,
        description: "Vento lateral sustentado empurrando a nave para a direita.",
    },
    crosswind_left: {
        windX: -32,
        windZ: 0,
        description: "Vento lateral sustentado empurrando a nave para a esquerda.",
    },
    updraft: {
        windX: 0,
        windZ: 10,
        description: "Coluna ascendente reduzindo a taxa efetiva de descida.",
    },
    downdraft: {
        windX: 0,
        windZ: -10,
        description: "Corrente descendente exigindo mais autoridade de frenagem.",
    },
    custom: {
        description: "Configuração ambiental personalizada.",
    },
};

const modalController = window.StarshipModalController.createModalController({ clamp });
const {
    bringToFront: bringModalToFront,
    clampPosition: clampModalPosition,
    initializePosition: initializeModalPosition,
    setVisibility: setModalVisibility,
    bind: bindModal,
    makeDraggable: makeModalDraggable,
} = modalController;

function closeAllModals() {
    [protocolModal, telemetryModal, physicsModal, shipModal, towerModal, terraMapModal]
        .forEach((modal) => setModalVisibility(modal, false));
}

function syncPhysicsControls() {
    windXSlider.value = String(environment.wind.x);
    windXLabel.textContent = String(environment.wind.x);
    windZSlider.value = String(environment.wind.z);
    windZLabel.textContent = String(environment.wind.z);
    updatePhysicsMassReadout();
}

function updatePhysicsMassReadout() {
    if (!physicsMassModelStatus) return;
    const profile = getSelectedShipProfile();
    const dryMass = getSelectedShipMass();
    const propellantMass = s?.propellant ? getCurrentPropellantMass() : getVehiclePropellantCapacity(profile);
    const attachedMass = getAttachedS24Mass();
    const totalMass = Math.max(1, dryMass + propellantMass + attachedMass);
    physicsMassModelStatus.textContent = profile?.isProbe
        ? `Massa da sonda: ${totalMass.toFixed(0)} kg · configurável no mapa orbital.`
        : `Massa dinâmica: ${(totalMass / 1000).toFixed(1)} t = seca ${(dryMass / 1000).toFixed(1)} t + propelente ${(propellantMass / 1000).toFixed(1)} t${attachedMass > 0 ? ` + S24 acoplada ${(attachedMass / 1000).toFixed(1)} t` : ""}.`;
}

function updatePhysicsPresetStatus() {
    const preset = physicsPresets[physicsPresetSelect.value] ?? physicsPresets.custom;
    physicsPresetStatus.textContent = preset.description;
}

function setPhysicsPresetSelection(presetKey) {
    physicsPresetSelect.value = presetKey;
    updatePhysicsPresetStatus();
}

function markPhysicsCustom() {
    setPhysicsPresetSelection("custom");
}

function applyPhysicsPreset(presetKey) {
    const preset = physicsPresets[presetKey];

    if (!preset || presetKey === "custom") {
        markPhysicsCustom();
        return;
    }

    environment.setWind({ x: preset.windX, z: preset.windZ });
    syncPhysicsControls();
    setPhysicsPresetSelection(presetKey);
}

function isLinkedMode() {
    return operationMode === "linked";
}

function getRegisteredShips() {
    return flightController.listShips().sort((first, second) =>
        first.label.localeCompare(second.label, "pt-BR", { sensitivity: "base" })
    );
}

function getRegisteredPlatforms() {
    return flightController.listPlatforms();
}

// Rendering a docked upper stage must use its own definition without
// changing the active flight-controller selection.
let visualProfileOverride = null;

function getSelectedShipProfile() {
    return visualProfileOverride ?? flightController.getSelectedShipProfile() ?? getRegisteredShips()[0];
}

function getSelectedShipController() {
    return flightController.getSelectedShipSystem()?.controller ?? null;
}

function getSelectedShipMass() {
    return getSelectedShipController()?.getMass?.() ?? getSelectedShipProfile()?.mass ?? 120000;
}

function setSelectedShipMass(nextMass) {
    getSelectedShipController()?.setMass?.(nextMass);
}

function getSelectedShipMissionConfig() {
    return getSelectedShipController()?.getMissionConfig?.() ?? {
        profile: flightControlState.flightProgramProfile,
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
        abortBelly: flightControlState.abortBelly,
    };
}

function getSelectedShipMissionState() {
    return getSelectedShipController()?.getMissionState?.() ?? {
        ...getSelectedShipMissionConfig(),
        sequencePhase: "IDLE",
        sequencePhaseTimer: 0,
        sequenceHoldTimer: 0,
    };
}

function getSelectedShipLabel() {
    return getSelectedShipProfile().label;
}

function isProbeSelected() {
    return Boolean(getSelectedShipProfile().isProbe);
}

function getSelectedShipDimensions() {
    const profile = getSelectedShipProfile();
    return profile.dimensions ?? { length: profile.length ?? 50, diameter: profile.diameter ?? 9 };
}

function getSelectedShipGeometry() {
    return getSelectedShipProfile().geometry;
}

function getSelectedShipPropulsion() {
    const profile = getSelectedShipProfile();
    if (!profile.propulsion) {
        return null;
    }

    if (!propulsionOverrides.has(profile.id)) {
        const propulsion = profile.propulsion;
        propulsionOverrides.set(profile.id, {
            ...propulsion,
            engines: { ...propulsion.engines },
            tanks: {
                main: { ...propulsion.tanks.main },
                header: { ...propulsion.tanks.header },
            },
        });
    }

    return propulsionOverrides.get(profile.id);
}

function isSuperHeavySelected() {
    return getSelectedShipProfile().vehicleClass === "superheavy_booster";
}

function getLaunchPadRestingCenterAltitude() {
    return LAUNCH_PAD_DECK_HEIGHT + getVehicleRestingCenterAltitude();
}

function getSelectedPlatformLabel() {
    return getSelectedPlatformProfile().label;
}

function getSelectedPlatformProfile() {
    return flightController.getSelectedPlatformProfile() ?? getRegisteredPlatforms()[0];
}

function getSelectedPlatformController() {
    return flightController.getSelectedPlatformSystem()?.actualController ?? null;
}

function getSelectedPlatformCaptureHeight() {
    return getSelectedPlatformProfile().captureHeight ?? TOWER_CAPTURE_ALTITUDE;
}

function getSelectedPlatformTowerHeight() {
    return getSelectedPlatformProfile().towerHeight ?? TOWER_HEIGHT;
}

function getFlightControlRouteActive() {
    return isLinkedMode() && flightController.isRouteLocked();
}

function getFlightControlRouteLabel() {
    return `${getSelectedShipProfile().callsign} -> ${getSelectedPlatformProfile().id}`;
}

function getBoosterTowerLink() {
    return flightController.getRemoteShipSession("superheavy_b7").downlink ?? {};
}

function resetFlightControllerEndpoints() {
    flightController.resetSystems();
}

function getPostHoldActionLabel(action) {
    return action === TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
        ? "iniciar bellyflop"
        : "pouso / captura controlada";
}

function syncFlightControllerConfig() {
    flightController.setOperationMode(operationMode);
    flightController.setSelectedShip(flightControlState.selectedShipId);
    flightController.setSelectedPlatform(flightControlState.selectedPlatformId);
    flightController.setRouteLocked(flightControlState.routeLocked);
    flightController.setShipFeedbackMode(flightControlState.shipFeedbackMode);
    flightController.setFlightProgram({
        profile: flightControlState.flightProgramProfile,
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
    });
}

function createPlatformMachineInputs() {
    return {
        leftArmContact: false,
        rightArmContact: false,
        leftArmImpactSpeed: 0,
        rightArmImpactSpeed: 0,
        collisionDetected: false,
    };
}

function readTowerApproachConfig() {
    const normalize = (input, fallback, min, max) => {
        const value = Number(input.value);
        return clamp(Number.isFinite(value) ? value : fallback, min, max);
    };

    towerApproachConfig.distance = normalize(towerApproachDistanceInput, 200, 50, 1000);
    towerApproachConfig.angleDeg = normalize(towerApproachAngleInput, 45, -80, 80);
    towerApproachConfig.tolerance = normalize(towerApproachToleranceInput, 80, 20, 300);

    const angleRad = (towerApproachConfig.angleDeg * Math.PI) / 180;
    const x = TOWER_WORLD_X + Math.cos(angleRad) * towerApproachConfig.distance;
    const z = getSelectedPlatformCaptureHeight() + Math.sin(angleRad) * towerApproachConfig.distance;
    towerApproachCommand.textContent = `Comando enviado: X ${x.toFixed(1)} m | Z ${z.toFixed(1)} m (ângulo a partir de +X)`;

    return towerApproachConfig;
}

function populateFlightControlSelects() {
    shipSelect.innerHTML = getRegisteredShips()
        .map((ship) => `<option value="${ship.id}">${ship.label} (${ship.callsign})</option>`)
        .join("");
    shipSelect.value = flightControlState.selectedShipId;

    platformSelect.innerHTML = getRegisteredPlatforms()
        .map((platform) => `<option value="${platform.id}">${platform.label}</option>`)
        .join("");
    platformSelect.value = flightControlState.selectedPlatformId;
    shipFeedbackModeSelect.value = flightControlState.shipFeedbackMode;
    syncFlightProgramControls();
}

function updateFlightRouteButton() {
    toggleFlightRouteBtn.textContent = flightController.isRouteLocked() ? "Desarmar Enlace" : "Travar Enlace";
}

function setFlightControlDetailsVisible(visible) {
    flightControlDetails.hidden = !visible;
    toggleFlightControlDetailsBtn.textContent = visible ? "Ocultar detalhes técnicos" : "Exibir detalhes técnicos";
    toggleFlightControlDetailsBtn.setAttribute("aria-expanded", String(visible));
}

function updateFlightControlSummary() {
    const ship = getSelectedShipProfile();
    const platform = getSelectedPlatformProfile();
    const snapshot = flightController.getSnapshot();
    const missionState = getSelectedShipMissionState();
    const hudMission = controlState?.missionHud;
    const hudStage = hudMission?.stages?.[hudMission.activeStage] ?? "PREPARAÇÃO";
    const hudCompleted = hudMission?.stages?.[hudMission.completedStage] ?? "PREPARAÇÃO";
    const feedbackLabel =
        flightControlState.shipFeedbackMode === "platform_isolated"
            ? "Plataforma isolada"
            : "Malha fechada";
    const routeState = getFlightControlRouteActive()
        ? "Enlace travado e roteado"
        : flightController.isRouteLocked()
          ? "Enlace armado, aguardando linked mode"
          : "Enlace desarmado";

    flightControlSummary.innerHTML = `
        <div class="panelTitle">Controlador de Voo ${flightControlState.controllerId}</div>
        <div><strong>Nave ativa:</strong> ${ship.label} (${ship.callsign})</div>
        <div><strong>Classe da nave:</strong> ${ship.vehicleClass}</div>
        <div><strong>Dimensões da nave:</strong> ${ship.length} m de altura | ${ship.diameter} m de diâmetro</div>
        <div><strong>Plataforma ativa:</strong> ${platform.label}</div>
        <div><strong>Classe da plataforma:</strong> ${platform.platformClass}</div>
        <div><strong>Altura da torre:</strong> ${platform.towerHeight} m</div>
        <div><strong>Rota:</strong> ${ship.id} -> ${platform.id}</div>
        <div><strong>Estado do enlace:</strong> ${routeState}</div>
        <div><strong>Retorno da nave:</strong> ${feedbackLabel}</div>
        ${ship.vehicleClass === "superheavy_booster" ? `<div><strong>Retorno do Super Heavy:</strong> ${flightControlState.boosterRecovery === "tower_catch" ? "captura na torre" : "amerrissagem no oceano"}</div>` : ""}
        ${ship.vehicleClass === "superheavy_booster" ? `<div><strong>Configuração do stack:</strong> ${stackMission.attachS24 ? "S24 acoplada" : "booster independente"}</div>` : ""}
        <div><strong>Programa de voo:</strong> ${
            flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.TEST_HOP
                ? `Decolagem de teste | Zsp ${flightControlState.testAltitudeSetpoint.toFixed(0)} m | hold ${flightControlState.holdDuration.toFixed(1)} s | depois ${getPostHoldActionLabel(flightControlState.postHoldAction)}`
                : "Reentrada / Recuperação"
        }</div>
        <div><strong>Fase da sequência:</strong> ${started ? controlState?.sequencePhase ?? missionState.sequencePhase : missionState.sequencePhase}</div>
        <div><strong>Estado enviado ao HUD:</strong> ${hudStage} | concluído até ${hudCompleted}</div>
        <div><strong>Status lógico da plataforma:</strong> ${snapshot.platform?.actualLogical?.status ?? "em espera"}</div>
        <div><strong>Status entregue à nave:</strong> ${snapshot.bus?.downlinkDelivered?.status ?? "sem downlink"}</div>
        <div><strong>Inventario registrado:</strong> ${getRegisteredShips().length} naves | ${getRegisteredPlatforms().length} plataformas</div>
    `;
}

function isCapturePlatformActive() {
    return isLinkedMode() && getSelectedPlatformProfile().recoveryType === "capture";
}

function getRecoveryModeLabel() {
    return isLinkedMode() ? "Linked mode" : "Stand-alone mode";
}

function updatePlatformPanelLabel() {
    platformPanelLabel.textContent = `Plataforma atual: ${getSelectedPlatformLabel()} | Nave roteada: ${getSelectedShipProfile().callsign}`;
}

function updateCaptureStatus() {
    if (!isLinkedMode()) {
        captureStatus.textContent = "Plataforma inativa no modo stand-alone";
        return;
    }

    if (!flightController.isRouteLocked()) {
        captureStatus.textContent = "Controle de voo com enlace desarmado";
        return;
    }

    captureStatus.textContent = platformState?.status ?? sensors?.platformLink?.status ?? "Link aguardando dados";
}

function updateFalseTowerAuthUI() {
    falseTowerAuthBtn.textContent = falseTowerAuthorizationActive
        ? "Cancelar Falsa Autorização"
        : "Injetar Falsa Autorização";
    falseTowerAuthBtn.disabled = !getFlightControlRouteActive();
}

function updateRecoveryModeUI() {
    targetHint.textContent = isLinkedMode()
        ? "Torre e lançamento fixos em X 0 m"
        : "Clique no solo para definir apenas o alvo de pouso";
    syncPhysicsControls();
    syncFlightProgramControls();
    updatePlatformPanelLabel();
    updateCaptureStatus();
    updateFalseTowerAuthUI();
    updateFlightRouteButton();
    updateFlightProgramStatus();
    updateFlightControlSummary();
}

function getTowerFailureStatusText() {
    const labels = [];
    const actualPlatformState = flightController.getActualPlatformState?.() ?? platformState;

    if (towerFailureConfig.link !== "nominal") {
        const linkMap = {
            offline: "Link: offline",
            bias_left: "Link: viés lateral esquerda",
            bias_right: "Link: viés lateral direita",
            bias_high: "Link: viés vertical cima",
            bias_low: "Link: viés vertical baixo",
        };
        labels.push(linkMap[towerFailureConfig.link]);
    }

    if (towerFailureConfig.arms !== "nominal") {
        const armsMap = {
            sluggish: "Braços: lentos",
            jam_open: "Braços: travados abertos",
            left_stuck: "Braço esquerdo travado",
            right_stuck: "Braço direito travado",
        };
        labels.push(armsMap[towerFailureConfig.arms]);
    }

    if (actualPlatformState?.leftArmBroken) {
        labels.push("Braço esquerdo quebrado");
    }

    if (actualPlatformState?.rightArmBroken) {
        labels.push("Braço direito quebrado");
    }

    return labels.length > 0 ? labels.join(" | ") : "Plataforma nominal";
}

function updateTowerFailureStatus() {
    towerFailureStatus.textContent = getTowerFailureStatusText();
}

function syncTowerFailurePanel() {
    towerFailureConfig.link = towerLinkFailureSelect.value;
    towerFailureConfig.arms = towerArmsFailureSelect.value;

    refreshTowerState(0);

    if (sensors?.platformLink) {
        setSensorValue(sensors.platformLink, samplePlatformLink());
    }

    updateTowerFailureStatus();
    updateCaptureStatus();
}

function latchCurrentFlaps() {
    failureState.flapJamLatched = true;
    failureState.jammedNose = s ? s.noseFlap : 0.72;
    failureState.jammedTail = s ? s.tailFlap : 0.72;
}

function resetFailureDynamics() {
    failureState.engineFlamedOut = false;
    failureState.flapJamLatched = false;

    if (failureConfig.flaps === "jam_current") {
        latchCurrentFlaps();
    }
}

function getFailureStatusText() {
    const labels = [];

    if (failureConfig.engine !== "nominal") {
        const engineMap = {
            one_out: "Motores: 1 indisponivel",
            single_engine: "Motores: apenas 1 ativo",
            no_ignition: "Motores: sem ignicao",
            flameout: failureState.engineFlamedOut ? "Motores: flameout latched" : "Motores: flameout armado",
        };
        labels.push(engineMap[failureConfig.engine]);
    }

    if (failureConfig.rcs !== "nominal") {
        const rcsMap = {
            degraded: "RCS: baixa autoridade",
            offline: "RCS: inoperante",
            stuck_left: "RCS: travado esquerda",
            stuck_right: "RCS: travado direita",
        };
        labels.push(rcsMap[failureConfig.rcs]);
    }

    if (failureConfig.flaps !== "nominal") {
        const flapMap = {
            sluggish: "Flaps: lentos",
            jam_current: "Flaps: travados",
            jam_open: "Flaps: travados abertos",
            jam_closed: "Flaps: travados fechados",
            detached: "Flaps: perdidos",
            asymmetric: "Flaps: assimetria severa",
        };
        labels.push(flapMap[failureConfig.flaps]);
    }

    return labels.length > 0 ? labels.join(" | ") : "Sem falhas ativas";
}

function updateFailureStatus() {
    failureStatus.textContent = getFailureStatusText();
}

function syncFailurePanel() {
    failureConfig.engine = engineFailureSelect.value;
    failureConfig.rcs = rcsFailureSelect.value;
    failureConfig.flaps = flapFailureSelect.value;

    if (failureConfig.engine !== "flameout") {
        failureState.engineFlamedOut = false;
    } else if (s && (s.engineOn || s.throttle > 0.02)) {
        failureState.engineFlamedOut = true;
    }

    if (failureConfig.flaps === "jam_current") {
        latchCurrentFlaps();
    } else {
        failureState.flapJamLatched = false;
    }

    updateFailureStatus();
}

function getTowerLinkDefaults() {
    const ship = getSelectedShipProfile();
    const platform = getSelectedPlatformProfile();

    return {
        controllerId: flightControlState.controllerId,
        platformId: platform.id,
        platformClass: platform.platformClass,
        linkedShipId: ship.id,
        routeLocked: Boolean(flightController.isRouteLocked()),
        linkAccepted: false,
        available: false,
        captureX: TOWER_WORLD_X,
        captureZ: getSelectedPlatformCaptureHeight(),
        towerHeight: getSelectedPlatformTowerHeight(),
        xError: 0,
        zError: 0,
        vxError: 0,
        vzError: 0,
        angleError: 0,
        recommendedFlipAltitude: getSelectedPlatformCaptureHeight() + 65,
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
        leftArmBroken: false,
        rightArmBroken: false,
        captured: false,
        capturePossible: true,
        supportAuthorized: false,
        captureVerificationOk: false,
        shutdownAuthorized: false,
        authorizationSource: "none",
        status: `CONTROLADOR ${flightControlState.controllerId} EM STANDBY`,
    };
}

function getPlatformLinkDefaults() {
    return getTowerLinkDefaults();
}

function refreshPlatformState(dt) {
    syncFlightControllerConfig();

    if (!nav || !s) {
        platformState = getPlatformLinkDefaults();
        towerState = platformState;
        syncProtocolStateFromSnapshot(flightController.getSnapshot());
        updateProtocolViews();
        updateCaptureStatus();
        return;
    }

    const physicalInterlock = flightController.createPlatformPhysicalInterlock(s);
    const snapshot = flightController.updatePlatform(dt, nav, {
        ...buildFlightControlLinkEnv(),
        // Only this compact, derived interlock crosses from simulation to the
        // platform logic; raw vehicle state remains internal to the simulator.
        machineInputs: {
            ...platformMachineInputs,
            ...physicalInterlock,
        },
    });

    syncProtocolStateFromSnapshot(snapshot);
    platformState = snapshot.platform?.actualLogical ?? getPlatformLinkDefaults();
    towerState = platformState;
    updateProtocolViews();
    updateCaptureStatus();
}

function refreshTowerState(dt) {
    refreshPlatformState(dt);
}

function samplePlatformLink() {
    const delivered = flightController.sampleDownlinkForShip();
    return Object.keys(delivered).length > 0 ? delivered : getPlatformLinkDefaults();
}

function sampleTowerLink() {
    return samplePlatformLink();
}

function syncOperationMode() {
    operationMode = operationModeSelect.value;
    flightControlState.selectedShipId = shipSelect.value;
    flightControlState.selectedPlatformId = platformSelect.value;
    flightControlState.shipFeedbackMode = shipFeedbackModeSelect.value;
    flightControlState.boosterRecovery = boosterRecoverySelect.value === "splashdown" ? "splashdown" : "tower_catch";
    flightControlState.flightProgramProfile = flightProgramProfileSelect.value;
    const selectedProfile = shipRegistry[flightControlState.selectedShipId];
    // Both hot-staging missions need the physical upper stage. Selecting one
    // for B7 arms the stack immediately, without a second checkbox action.
    if (
        (flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK ||
            flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.SUBORBITAL_MISSION) &&
        selectedProfile?.vehicleClass === "superheavy_booster"
    ) {
        stackMission.attachS24 = true;
        superHeavyAttachS24Input.checked = true;
    } else if (
        flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK ||
        flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.SUBORBITAL_MISSION
    ) {
        flightControlState.flightProgramProfile = FLIGHT_PROGRAM_PROFILES.TEST_HOP;
    }
    flightControlState.testAltitudeSetpoint = clamp(Number(flightProgramAltitudeInput.value) || 0, 0, 800000);
    flightControlState.hotstageAltitudeSetpoint = clamp(Number(flightProgramHotstageAltitudeInput.value) || 180000, 60000, 800000);
    flightControlState.hotstageThrottle = clamp((Number(flightProgramHotstageThrottleInput.value) || 100) / 100, 0.35, 1);
    flightControlState.hotstageAltitudeRampRate = clamp(Number(flightProgramHotstageRampInput.value) || 500, 100, 1200);
    flightControlState.hotstagePitchBiasMaxDeg = clamp(Number(flightProgramHotstagePitchBiasInput.value) || 20, 5, 35);
    flightControlState.hotstageFuelReserveFraction = clamp((Number(flightProgramHotstageReserveInput.value) || 1) / 100, 0.01, 0.25);
    flightControlState.boosterBoostbackThrottle = clamp((Number(flightProgramBoosterThrottleInput.value) || 86) / 100, 0.55, 1);
    flightControlState.boosterFlipAngleDeg = clamp(Number(flightProgramBoosterFlipAngleInput.value) || 135, 85, 165);
    flightControlState.boosterInboundVelocityLimit = clamp(Number(flightProgramBoosterInboundVelocityInput.value) || 310, 100, 1600);
    flightControlState.boosterBoostbackMaxDuration = clamp(Number(flightProgramBoosterBurnDurationInput.value) || 90, 60, 240);
    flightControlState.boosterRecoveryThrustFraction = clamp((Number(flightProgramBoosterRecoveryThrustInput.value) || 72) / 100, 0.45, 1);
    flightControlState.holdDuration = clamp(Number(flightProgramHoldInput.value) || 0, 0, 300);
    flightControlState.postHoldAction =
        flightProgramPostHoldSelect.value === TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
            ? TEST_HOP_POST_HOLD_ACTIONS.BELLYFLOP_RECOVERY
            : TEST_HOP_POST_HOLD_ACTIONS.CONTROLLED_RECOVERY;
    // O primeiro perfil operacional do B7 é deliberadamente o mesmo teste
    // de decolagem/retorno da Starship, sem a etapa aerodinâmica de belly.
    if (
        selectedProfile?.vehicleClass === "superheavy_booster" &&
        flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.TEST_HOP
    ) {
        flightControlState.postHoldAction = TEST_HOP_POST_HOLD_ACTIONS.CONTROLLED_RECOVERY;
    }
    flightProgramProfileSelect.value = flightControlState.flightProgramProfile;
    flightProgramAltitudeInput.value = String(flightControlState.testAltitudeSetpoint);
    flightProgramHotstageAltitudeInput.value = String(flightControlState.hotstageAltitudeSetpoint);
    flightProgramHotstageThrottleInput.value = String(flightControlState.hotstageThrottle * 100);
    flightProgramHotstageRampInput.value = String(flightControlState.hotstageAltitudeRampRate);
    flightProgramHotstagePitchBiasInput.value = String(flightControlState.hotstagePitchBiasMaxDeg);
    flightProgramHotstageReserveInput.value = String(flightControlState.hotstageFuelReserveFraction * 100);
    flightProgramBoosterThrottleInput.value = String(flightControlState.boosterBoostbackThrottle * 100);
    flightProgramBoosterFlipAngleInput.value = String(flightControlState.boosterFlipAngleDeg);
    flightProgramBoosterInboundVelocityInput.value = String(flightControlState.boosterInboundVelocityLimit);
    flightProgramBoosterBurnDurationInput.value = String(flightControlState.boosterBoostbackMaxDuration);
    flightProgramBoosterRecoveryThrustInput.value = String(flightControlState.boosterRecoveryThrustFraction * 100);
    flightProgramHoldInput.value = String(flightControlState.holdDuration);
    flightProgramPostHoldSelect.value = flightControlState.postHoldAction;
    captureMode = isLinkedMode();
    falseTowerAuthorizationActive = false;
    syncFlightControllerConfig();
    probeMapControls.hidden = !isProbeSelected();
    updateProbeManualRcsUI();
    updateProbeDockingUI();
    resetFlightControllerEndpoints();
    refreshPlatformState(0);
    persistFlightControlConfig();

    if (!started) {
        syncFlightProgramControls();
        resetWaitingState();
        return;
    }

    if (sensors?.platformLink) {
        setSensorValue(sensors.platformLink, samplePlatformLink());
    }

    if (started && sensors && nav) {
        controlState = flightController.updateShipCommand(0, nav, sensors, {
            started,
            mass: getVehicleMass(),
            maxThrust: getVehicleMaxThrust(),
            g: G,
            targetX: getGuidanceTargetX(),
            targetZ: isLinkedMode() ? sensors.platformLink.captureZ : 0,
            captureHeight: getSelectedPlatformCaptureHeight(),
            manualEngineActive,
            actuators: getActuatorProfile(),
        });
    }

    updateTowerFailureStatus();
    updateRecoveryModeUI();
    updateFlightProgramStatus();
    updateProtocolViews();
    updateShipGainPanel();
    updateSuperHeavyStackPanel();
    syncFlightProgramControls();
}

function syncRecoveryMode() {
    syncOperationMode();
}

function getActuatorProfile() {
    let flapLift = 1;
    let flapTorque = 1;
    let rcs = 1;
    let tvc = 1;

    switch (failureConfig.flaps) {
        case "jam_current":
        case "jam_open":
        case "jam_closed":
        case "detached":
        case "asymmetric":
            flapLift = 0;
            flapTorque = 0;
            break;
    }

    switch (failureConfig.rcs) {
        case "degraded":
            rcs = 0.3;
            break;
        case "offline":
        case "stuck_left":
        case "stuck_right":
            rcs = 0;
            break;
    }

    switch (failureConfig.engine) {
        case "one_out":
            tvc = 0.75;
            break;
        case "single_engine":
            tvc = 0.5;
            break;
        case "no_ignition":
            tvc = 0;
            break;
        case "flameout":
            tvc = failureState.engineFlamedOut ? 0 : 1;
            break;
    }

    return {
        flapLift,
        flapTorque,
        rcs,
        tvc,
    };
}

function getActiveLateralControlText() {
    const actuators = getActuatorProfile();
    const sources = [];

    if (actuators.flapLift > 0.05 && !s.engineOn) {
        sources.push("flaps");
    }

    if (s.engineOn && actuators.tvc > 0.05) {
        sources.push("TVC");
    }

    if (sources.length === 0 && actuators.flapLift > 0.05) {
        sources.push("flaps");
    }

    return sources.length > 0 ? sources.join(" + ") : "sem autoridade ativa";
}

function fit() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
}

window.addEventListener("resize", fit);
fit();

let sim = 1;
let started = false;
let paused = true;
let launchCountdownEndsAt = null;
let launchCountdownTimer = null;
const missionRuntime = window.StarshipMissionRuntime.createMissionRuntime({
    timeScroll,
    state: {
        mission: {
            started: { get: () => started, set: (value) => { started = Boolean(value); } },
            paused: { get: () => paused, set: (value) => { paused = Boolean(value); } },
            countdownEndsAt: { get: () => launchCountdownEndsAt, set: (value) => { launchCountdownEndsAt = value; } },
            countdownTimer: { get: () => launchCountdownTimer, set: (value) => { launchCountdownTimer = value; } },
        },
        clock: {
            simulationSpeed: { get: () => sim, set: (value) => { sim = Number(value); } },
            simulationTime: { get: () => simTime, set: (value) => { simTime = Number(value); } },
            graphOffset: { get: () => graphOffset, set: (value) => { graphOffset = Number(value); } },
            graphFollowingLive: { get: () => graphFollowingLive, set: (value) => { graphFollowingLive = Boolean(value); } },
        },
        instances: {
            detachedBooster: { get: () => detachedBoosterFlight, set: setDetachedBoosterFlight },
            hotStageRing: { get: () => hotStageRingFlight, set: setHotStageRingFlight },
        },
    },
});
window.StarshipRuntime = missionRuntime;
const telemetryStore = missionRuntime.telemetryStore;
const telemetry = telemetryStore.primary;
const boosterTelemetry = telemetryStore.booster;
let graphOffset = 0;
let graphFollowingLive = true;
let simTime = 0;
// At 500× a rendered frame can cover up to 25 seconds of flight. Keep each
// physics integration slice short enough for contact, propulsion and guidance
// to remain stable instead of silently running one oversized frame.
const MAX_SIMULATION_INTEGRATION_STEP = 0.025;

function updateSimulationSpeedUI() {
    simulationSpeedIndicator.value = `Simulação: ${sim}×`;
    simulationSpeedIndicator.textContent = `Simulação: ${sim}×`;
    speedButtons.forEach((button) => {
        const isActive = Number(button.dataset.speed) === sim;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

const environment = window.createStarshipEnvironment();
let landingTargetX = 0;
const probeConfig = { x: 0, altitude: 400000, velocity: 7670, mass: 300 };
const PROBE_DOCKING_INITIAL_SEPARATION = 100;
const PROBE_DOCKING_CAPTURE_RADIUS = 1.2;
const PROBE_DOCKING_MAX_RELATIVE_SPEED = 0.55;
const PROBE_DOCKING_MAX_ALIGNMENT_ERROR = 12 * Math.PI / 180;
const PROBE_DOCKING_CONTACT_DISTANCE = 1.35;
const PROBE_DOCKING_CONTACT_HIGHLIGHT_SECONDS = 1.2;
const probeDocking = {
    enabled: false,
    target: null,
    docked: false,
    lastContact: null,
    status: "Par de sondas não posicionado.",
};
const probeManualRcsKeys = new Set();
const probeManualRcsControlKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyA", "KeyD"]);
let probeManualRcsActive = false;
let telemetryHudStyle = "spacex";
let operationMode = "standalone";
let captureMode = false;
let falseTowerAuthorizationActive = false;
let manualEngineActive = false;
let manualThrottleSetting = 0.35;

const rho = (h) => physicsCore.densityAt(h);

let s;
let nav;
let sensors;
let controlState = flightController.idleCommand();
let platformState = getPlatformLinkDefaults();
let towerState = getTowerLinkDefaults();
let platformMachineInputs = createPlatformMachineInputs();
const towerFailureConfig = {
    link: "nominal",
    arms: "nominal",
};
const towerApproachConfig = {
    distance: 200,
    angleDeg: 45,
    tolerance: 80,
};
const failureConfig = {
    engine: "nominal",
    rcs: "nominal",
    flaps: "nominal",
};
const failureState = {
    engineFlamedOut: false,
    flapJamLatched: false,
    jammedNose: 0.72,
    jammedTail: 0.72,
};

// Moved to mission_simulation.js.

function resetWaitingState() {
    flightControlState.abortBelly = false;
    setDetachedBoosterFlight(null);
    setHotStageRingFlight(null);
    telemetryStore.resetBooster();
    abortBellyBtn.textContent = "Emergência: Abort Belly";
    s = createStandbyState();
    if (isProbeSelected() && probeDocking.enabled) {
        prepareProbeDockingTarget();
    } else if (!isProbeSelected()) {
        probeDocking.target = null;
    }
    nav = createEstimator(s);
    sensors = createSensors();
    syncFlightControllerConfig();
    controlState = flightController.idleCommand();
    resetFlightControllerEndpoints();
    platformMachineInputs = createPlatformMachineInputs();
    telemetryStore.reset();
    graphOffset = 0;
    graphFollowingLive = true;
    simTime = 0;
    timeScroll.value = 0;
    timeScroll.max = 0;
    started = false;
    paused = true;
    falseTowerAuthorizationActive = false;
    pauseBtn.disabled = true;
    startBtn.textContent = "Start";
    resetFailureDynamics();
    primeSensors();
    updateFailureStatus();
    updateTowerFailureStatus();
    updateRecoveryModeUI();
    updateFlightProgramStatus();
    updateProtocolViews();
    updateProbeDockingUI();
}

function beginReentry() {
    s = isSuperHeavySelected()
        ? createState({
            x: getLaunchPositionX(),
            z: 10000,
            vx: 0,
            vz: -120,
            a: 0,
            noseFlap: 0.35,
            tailFlap: 0.35,
            msg: "B7 POSICIONADO | TESTE DE REENTRADA PROPULSIVA",
            mode: "B7 REENTRY TEST",
        })
        : createState();
    nav = createEstimator(s);
    sensors = createSensors();
    resetFlightControllerEndpoints();
    platformMachineInputs = createPlatformMachineInputs();
    telemetryStore.reset();
    graphOffset = 0;
    graphFollowingLive = true;
    simTime = 0;
    timeScroll.value = 0;
    timeScroll.max = 0;
    started = true;
    paused = false;
    falseTowerAuthorizationActive = false;
    pauseBtn.disabled = false;
    startBtn.textContent = "Restart";
    resetFailureDynamics();
    primeSensors();
    updateFalseTowerAuthUI();
    controlState = flightController.updateShipCommand(0, nav, sensors, {
        started,
        mass: getVehicleMass(),
        maxThrust: getVehicleMaxThrust(),
        g: G,
        targetX: getGuidanceTargetX(),
        targetZ: isLinkedMode() ? getSelectedPlatformCaptureHeight() : 0,
        captureHeight: getSelectedPlatformCaptureHeight(),
        manualEngineActive,
        actuators: getActuatorProfile(),
    });
}

function beginTestHopSequence() {
    s = createTestHopStartState();
    nav = createEstimator(s);
    sensors = createSensors();
    resetFlightControllerEndpoints();
    platformMachineInputs = createPlatformMachineInputs();
    telemetryStore.reset();
    graphOffset = 0;
    graphFollowingLive = true;
    simTime = 0;
    timeScroll.value = 0;
    timeScroll.max = 0;
    started = true;
    paused = false;
    falseTowerAuthorizationActive = false;
    pauseBtn.disabled = false;
    startBtn.textContent = "Restart";
    resetFailureDynamics();
    primeSensors();
    updateFalseTowerAuthUI();
    controlState = flightController.updateShipCommand(0, nav, sensors, {
        started,
        mass: getVehicleMass(),
        maxThrust: getVehicleMaxThrust(),
        g: G,
        targetX: getGuidanceTargetX(),
        targetZ: isLinkedMode() ? getSelectedPlatformCaptureHeight() : 0,
        captureHeight: getSelectedPlatformCaptureHeight(),
        manualEngineActive,
        actuators: getActuatorProfile(),
    });
}

function beginProbeMission() {
    setProbePosition(probeConfig.x);
    s = createState({
        x: probeConfig.x,
        z: probeConfig.altitude,
        vx: probeConfig.velocity,
        vz: 0,
        a: 0,
        noseFlap: 0,
        tailFlap: 0,
        msg: "SONDA POSICIONADA | dinâmica balística",
        mode: "BALLISTIC PROBE",
    });
    if (probeDocking.enabled) {
        prepareProbeDockingTarget();
        s.msg = "SONDA CHASER | alvo 100 m acima | RCS disponível";
        s.mode = "PROBE DOCKING CHASER";
    } else {
        probeDocking.target = null;
    }
    nav = createEstimator(s);
    sensors = createSensors();
    resetFlightControllerEndpoints();
    telemetryStore.reset(); graphOffset = 0; graphFollowingLive = true; simTime = 0;
    started = true; paused = false; pauseBtn.disabled = false;
    controlState = flightController.idleCommand();
    updateProbeDockingUI();
}

function beginBoostbackBurnMission() {
    s = createState({
        x: 55000,
        z: 60000,
        vx: 4500 / 3.6,
        vz: 0,
        a: 0,
        w: 0,
        noseFlap: 0.12,
        tailFlap: 0.12,
        msg: "B7 POSICIONADO | separação simulada | 60 km | 4.500 km/h leste",
        mode: "B7 BOOSTBACK PREP",
    });
    nav = createEstimator(s);
    sensors = createSensors();
    resetFlightControllerEndpoints();
    telemetryStore.reset(); graphOffset = 0; graphFollowingLive = true; simTime = 0;
    started = true; paused = false; pauseBtn.disabled = false;
    startBtn.textContent = "Restart";
    primeSensors();
    controlState = flightController.updateShipCommand(0, nav, sensors, {
        started,
        mass: getVehicleMass(),
        maxThrust: getVehicleMaxThrust(),
        g: G,
        targetX: getGuidanceTargetX(),
        targetZ: isLinkedMode() ? getSelectedPlatformCaptureHeight() : 0,
        captureHeight: getSelectedPlatformCaptureHeight(),
        manualEngineActive,
        actuators: getActuatorProfile(),
    });
}

function beginStackHotstageBoostbackMission() {
    // A suborbital handoff already downrange: B7 remains powered on its
    // central engines before S24 ignites and the stack hot-stages.
    const preOrbitalSpeed = 5800 / 3.6;
    // In this 2D model zero attitude is vertical, so the requested visual
    // 30° above the horizon is 60° from vertical.  The velocity vector must
    // share that tangent; a
    // nearly horizontal 5,800 km/h vector made the visual stack look pitched
    // while its parabolic path went in another direction.
    const preOrbitalPitch = Math.PI / 3;
    const preOrbitalVx = preOrbitalSpeed * Math.sin(preOrbitalPitch);
    const preOrbitalVz = preOrbitalSpeed * Math.cos(preOrbitalPitch);
    s = createState({
        x: 65000,
        z: 60000,
        vx: preOrbitalVx,
        vz: preOrbitalVz,
        // The stack is already pitched 30° above the eastern horizon on its
        // pre-orbital arc.
        // That attitude is held by its actuators through hot-staging and is
        // inherited by both vehicles at physical separation.
        a: preOrbitalPitch,
        w: 0,
        noseFlap: 0.1,
        tailFlap: 0.1,
        msg: "STACK B7 + S24 | 60 km | 5.800 km/h | tangente pré-orbital de 30° acima do horizonte | motores centrais ativos",
        mode: "STACK PRE-ORBITAL POWERED",
    });
    nav = createEstimator(s);
    sensors = createSensors();
    resetFlightControllerEndpoints();
    platformMachineInputs = createPlatformMachineInputs();
    telemetryStore.reset(); graphOffset = 0; graphFollowingLive = true; simTime = 0;
    started = true; paused = false; falseTowerAuthorizationActive = false;
    pauseBtn.disabled = false;
    startBtn.textContent = "Restart";
    resetFailureDynamics();
    primeSensors();
    updateFalseTowerAuthUI();
    controlState = flightController.updateShipCommand(0, nav, sensors, {
        started,
        mass: getVehicleMass(),
        maxThrust: getVehicleMaxThrust(),
        g: G,
        targetX: getGuidanceTargetX(),
        targetZ: isLinkedMode() ? getSelectedPlatformCaptureHeight() : 0,
        captureHeight: getSelectedPlatformCaptureHeight(),
        manualEngineActive,
        actuators: getActuatorProfile(),
        ...getStackControlEnvironment(),
    });
}

function beginSelectedFlightProgram() {
    // The emergency signal is one-shot for the current flight only.
    flightControlState.abortBelly = false;
    setDetachedBoosterFlight(null);
    setHotStageRingFlight(null);
    telemetryStore.resetBooster();
    if (isSuperHeavySelected()) {
        stackMission.separated = false;
        stackMission.boosterRecovery = null;
        stackMission.boostbackReturn = false;
    }
    abortBellyBtn.textContent = "Emergência: Abort Belly";
    syncFlightControllerConfig();

    if (isProbeSelected()) {
        beginProbeMission();
        return;
    }

    if (isSuperHeavySelected() && isBoostbackBurnProgramSelected()) {
        beginBoostbackBurnMission();
        return;
    }

    // This stack profile begins during its powered pre-orbital flight.
    if (isSuperHeavySelected() && stackMission.attachS24 && isStackHotstageBoostbackProgramSelected()) {
        beginStackHotstageBoostbackMission();
        return;
    }

    if (isTestHopProgramSelected() || (isSuperHeavySelected() && stackMission.attachS24 && isSuborbitalMissionProgramSelected())) {
        beginTestHopSequence();
        return;
    }

    beginReentry();
}

// Compatibility bridge while the renderer is migrated from classic scripts to modules.
// Stateful values use accessors so the renderer always observes the live mission.
appContext = window.StarshipAppContext.createAppContext({
    elements, physicsCore, scene, terra, shipRegistry, platformRegistry, flightController,
});
Object.assign(window, { wrapWorldX,propagateNavigationEstimate,setDetachedBoosterFlight,setHotStageRingFlight,setBestHotstageOptimizationResult,setBestBoosterOptimizationResult,persistFlightControlConfig,restoreFlightControlConfig,clamp,lerp,moveToward,truncateText,wrapAngle,blendAngle,toBody,toWorld,getFollowedInstanceState,updateCamera,updateLandingTargetLabel,setLandingTarget,getGainDisplayPrecision,formatGainValue,escapeHtmlText,buildControlLoopMetricMarkup,buildControlLoopNodeMarkup,buildControlLoopOutputMarkup,buildControlLoopNoteMarkup,buildControlLoopDiagramMarkup,updateShipGainPanel,handleShipGainInput,bringModalToFront,clampModalPosition,initializeModalPosition,setModalVisibility,closeAllModals,bindModal,makeModalDraggable,syncPhysicsControls,updatePhysicsMassReadout,updatePhysicsPresetStatus,setPhysicsPresetSelection,markPhysicsCustom,applyPhysicsPreset,isLinkedMode,getRegisteredShips,getRegisteredPlatforms,getSelectedShipProfile,getSelectedShipController,getSelectedShipMass,setSelectedShipMass,getSelectedShipMissionConfig,getSelectedShipMissionState,getSelectedShipLabel,isProbeSelected,getSelectedShipDimensions,getSelectedShipGeometry,getSelectedShipPropulsion,isSuperHeavySelected,getLaunchPadRestingCenterAltitude,getSelectedPlatformLabel,getSelectedPlatformProfile,getSelectedPlatformController,getSelectedPlatformCaptureHeight,getSelectedPlatformTowerHeight,getFlightControlRouteActive,getFlightControlRouteLabel,getBoosterTowerLink,resetFlightControllerEndpoints,getPostHoldActionLabel,syncFlightControllerConfig,syncFlightProgramControls,updateFlightProgramStatus,createHotstageOptimizationCandidates,simulateHotstageOptimizationCandidate,renderHotstageOptimizationResults,applyBestHotstageOptimization,createBoosterOptimizationCandidates,simulateBoosterOptimizationCandidate,renderBoosterOptimizationResults,applyBestBoosterOptimization,createPlatformMachineInputs,readTowerApproachConfig,buildFlightControlLinkEnv,syncProtocolStateFromSnapshot,populateFlightControlSelects,updateFlightRouteButton,setFlightControlDetailsVisible,updateFlightControlSummary,isCapturePlatformActive,getRecoveryModeLabel,updatePlatformPanelLabel,updateCaptureStatus,updateFalseTowerAuthUI,updateRecoveryModeUI,getProtocolDirectionConfig,getProtocolSignalDefinition,getProtocolWidgets,formatProtocolValue,compareProtocolValues,buildProtocolDeliveryReport,formatProtocolPacket,buildProtocolSignalLabel,buildProtocolSpecMarkup,updateProtocolSpecView,populateProtocolSignalSelect,updateProtocolSignalInputHint,validateProtocolSignalValue,validateProtocolPatch,coerceProtocolSignalValue,tryParseProtocolPatch,getProtocolOverride,applyProtocolPatch,refreshProtocolTransport,applySingleProtocolSignalOverride,clearProtocolOverride,updateProtocolStatus,updateProtocolViews,getTowerFailureStatusText,updateTowerFailureStatus,syncTowerFailurePanel,latchCurrentFlaps,resetFailureDynamics,getFailureStatusText,updateFailureStatus,syncFailurePanel,getTowerLinkDefaults,getPlatformLinkDefaults,refreshPlatformState,refreshTowerState,samplePlatformLink,sampleTowerLink,syncOperationMode,syncRecoveryMode,getActuatorProfile,getActiveLateralControlText,fit,updateSimulationSpeedUI,resetWaitingState,beginReentry,beginTestHopSequence,beginProbeMission,beginBoostbackBurnMission,beginStackHotstageBoostbackMission,beginSelectedFlightProgram,beginMissionAfterCountdown,updateLaunchCountdownButton,getMissionClockDisplay,selectStandaloneLandingTarget,formatMissionTime,updateActiveControllerIndicator,getFlightInstances,updateInstanceTracker,formatInstanceHud,exportTelemetry });
Object.defineProperties(window, {
    c: { get: () => c }, ctx: { get: () => ctx }, info: { get: () => info }, scene: { get: () => scene }, terra: { get: () => terra },
    camera: { get: () => camera }, s: { get: () => s, set: (value) => { s = value; } },
    nav: { get: () => nav, set: (value) => { nav = value; } }, sensors: { get: () => sensors },
    controlState: { get: () => controlState }, platformState: { get: () => platformState }, towerState: { get: () => towerState },
    flightControlState: { get: () => flightControlState }, stackMission: { get: () => stackMission },
    detachedBoosterFlight: { get: () => detachedBoosterFlight }, hotStageRingFlight: { get: () => hotStageRingFlight },
    shipRegistry: { get: () => shipRegistry }, platformRegistry: { get: () => platformRegistry }, flightController: { get: () => flightController },
    physicsCore: { get: () => physicsCore }, telemetry: { get: () => telemetry }, graphOffset: { get: () => graphOffset },
    simTime: { get: () => simTime }, sim: { get: () => sim }, environment: { get: () => environment }, windX: { get: () => environment.wind.x }, windZ: { get: () => environment.wind.z },
    landingTargetX: { get: () => landingTargetX }, visualProfileOverride: { get: () => visualProfileOverride, set: (value) => { visualProfileOverride = value; } },
    probeDocking: { get: () => probeDocking }, probeManualRcsActive: { get: () => probeManualRcsActive },
    probeManualRcsKeys: { get: () => probeManualRcsKeys }, telemetryHudStyle: { get: () => telemetryHudStyle },
    terraMapModal: { get: () => terraMapModal }, sceneClockLabel: { get: () => sceneClockLabel },
    towerFailureConfig: { get: () => towerFailureConfig }, failureConfig: { get: () => failureConfig },
    G: { get: () => G }, TH: { get: () => TH }, Cd: { get: () => Cd }, MAX_GIMBAL: { get: () => MAX_GIMBAL },
    TOWER_WORLD_X: { get: () => TOWER_WORLD_X }, TOWER_MAST_OFFSET_X: { get: () => TOWER_MAST_OFFSET_X },
    CAMERA_SHIP_SCREEN_X: { get: () => CAMERA_SHIP_SCREEN_X }, CAMERA_SHIP_SCREEN_Y: { get: () => CAMERA_SHIP_SCREEN_Y },
});
updateManualEngineUI();
restoreFlightControlConfig();
populateFlightControlSelects();
setLandingTarget(0);
updateFlightControlSummary();
updateShipGainPanel();
updateProtocolSpecView();
populateProtocolSignalSelect("uplink");
populateProtocolSignalSelect("downlink");
updateProtocolSignalInputHint("uplink");
updateProtocolSignalInputHint("downlink");
syncOperationMode();
resetWaitingState();
applyPhysicsPreset("nominal");
updateSimulationSpeedUI();

function beginMissionAfterCountdown() {
    launchCountdownEndsAt = null;
    launchCountdownTimer = null;
    startBtn.disabled = false;
    launchCountdownInput.disabled = false;
    startBtn.textContent = "Restart";
    sceneFocusX = null;
    beginSelectedFlightProgram();
    simulationLoop.resetClock();
}

function updateLaunchCountdownButton() {
    if (launchCountdownEndsAt === null) return;
    const remaining = Math.max(0, (launchCountdownEndsAt - performance.now()) / 1000);
    startBtn.textContent = `T− ${remaining.toFixed(1)} s`;
}

function getMissionClockDisplay() {
    if (launchCountdownEndsAt !== null) {
        const remaining = Math.max(0, (launchCountdownEndsAt - performance.now()) / 1000);
        return `T− ${remaining.toFixed(1)} s`;
    }
    return `T+ ${formatMissionTime(simTime)}`;
}

function selectStandaloneLandingTarget(event) {
    if (isLinkedMode() || event.button !== 0) {
        return;
    }

    const rect = c.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    if (isFlightControlBuildingHit(clickX, clickY)) {
        setModalVisibility(protocolModal, true);
        return;
    }

    setLandingTarget(screenToWorldX(clickX));
}

function formatMissionTime(seconds) {
    const totalTenths = Math.max(0, Math.round(seconds * 10));
    const minutes = Math.floor(totalTenths / 600);
    const remainingTenths = totalTenths % 600;
    const wholeSeconds = Math.floor(remainingTenths / 10);
    const tenths = remainingTenths % 10;
    return `${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}.${tenths}`;
}

function updateActiveControllerIndicator() {
    const active = controlState?.activeController ?? {
        id: "CTRL_STANDBY",
        label: "Standby / aguardando missão",
        loops: [],
    };
    const loops = Array.isArray(active.loops) ? active.loops.join(" · ") : "";
    activeControllerIndicator.textContent = `CONTROLADOR ATIVO: ${active.id} — ${active.label}`;
    activeControllerIndicator.title = loops ? `${active.id}: ${active.label}\n${loops}` : `${active.id}: ${active.label}`;
}

function getFlightInstances() {
    const primaryProfile = getSelectedShipProfile();
    const primaryInstance = { id: "primary", profile: primaryProfile, state: s, label: primaryProfile.label, detail: "instância ativa" };
    // In the separated stack view, B7 is the left/first stage and S24 is the
    // right/second stage everywhere in the HUD, including this tracker.
    const instances = detachedBoosterFlight?.state
        ? [{ id: "b7", profile: detachedBoosterFlight.profile, state: detachedBoosterFlight.state, label: detachedBoosterFlight.profile.label, detail: "booster separado" }, primaryInstance]
        : [primaryInstance];
    if (probeDocking.target && primaryProfile.isProbe) {
        instances.push({
            id: "probe-target",
            profile: shipRegistry.probe_satellite,
            state: probeDocking.target,
            label: "Sonda Alvo",
            detail: probeDocking.docked ? "acoplada à chaser" : "alvo passivo de acoplamento",
        });
    }
    if (!detachedBoosterFlight?.state && stackMission.attachS24 && isSuperHeavySelected()) {
        instances.push({ id: "s24-docked", profile: shipRegistry.starship_ship24, state: s, label: "Starship Ship 24", detail: "acoplada ao B7" });
    }
    return instances;
}

const instanceTrackerView = missionRuntime.createInstanceTracker({
    container: instanceTrackerList,
    root: instanceTracker,
    toggleButton: instanceTrackerToggleBtn,
    getInstances: getFlightInstances,
    getFollowedId: () => followedInstanceId,
    setFollowedId: (instanceId) => { followedInstanceId = instanceId; },
    getProfile: (profileId) => shipRegistry[profileId],
});

function updateInstanceTracker() {
    if (followedInstanceId === "b7" && !detachedBoosterFlight?.state) followedInstanceId = "primary";
    if (followedInstanceId === "probe-target" && !probeDocking.target) followedInstanceId = "primary";
    instanceTrackerView.render();
}

function formatInstanceHud(name, state, extra = "") {
    if (!state) return `${name}: indisponível`;
    return `${name}: Z ${Math.max(0, state.z ?? 0).toFixed(0)} m | VX ${(state.vx ?? 0).toFixed(0)} | VZ ${(state.vz ?? 0).toFixed(0)} m/s | ${((state.throttle ?? 0) * 100).toFixed(0)}% ${extra}`;
}

function exportTelemetry() {
    missionRuntime.exportTelemetry();
}



const simulationLoop = window.startStarshipSimulationLoop({
    isRunning: () => started && !paused,
    getSpeed: () => sim,
    step,
    draw,
    maxStep: MAX_SIMULATION_INTEGRATION_STEP,
});
