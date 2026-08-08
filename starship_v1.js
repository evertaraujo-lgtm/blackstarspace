const c = document.getElementById("cv");
const ctx = c.getContext("2d");
const info = document.getElementById("info");
const windXSlider = document.getElementById("windXSlider");
const windXLabel = document.getElementById("windXLabel");
const windZSlider = document.getElementById("windZSlider");
const windZLabel = document.getElementById("windZLabel");
const physicsMassModelStatus = document.getElementById("physicsMassModelStatus");
const timeScroll = document.getElementById("timeScroll");
const activeControllerIndicator = document.getElementById("activeControllerIndicator");
const instanceTrackerList = document.getElementById("instanceTrackerList");
const instanceTracker = document.getElementById("instanceTracker");
const instanceTrackerToggleBtn = document.getElementById("instanceTrackerToggleBtn");
const hud = document.getElementById("hud");
const toggleHudBtn = document.getElementById("toggleHudBtn");
const simulationSpeedIndicator = document.getElementById("simulationSpeedIndicator");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const exportBtn = document.getElementById("exportBtn");
const openTelemetryModalBtn = document.getElementById("openTelemetryModalBtn");
const openPhysicsModalBtn = document.getElementById("openPhysicsModalBtn");
const openProtocolModalBtn = document.getElementById("openProtocolModalBtn");
const openShipModalBtn = document.getElementById("openShipModalBtn");
const openTowerModalBtn = document.getElementById("openTowerModalBtn");
const toggleTelemetryHudStyleBtn = document.getElementById("toggleTelemetryHudStyleBtn");
const openTerraMapBtn = document.getElementById("openTerraMapBtn");
const terraMapModal = document.getElementById("terraMapModal");
const closeTerraMapModalBtn = document.getElementById("closeTerraMapModalBtn");
const terraMapCanvas = document.getElementById("terraMapCanvas");
const terraMapTargetInput = document.getElementById("terraMapTargetInput");
const applyTerraMapTargetBtn = document.getElementById("applyTerraMapTargetBtn");
const focusStarbaseBtn = document.getElementById("focusStarbaseBtn");
const terraMapReadout = document.getElementById("terraMapReadout");
const probeMapControls = document.getElementById("probeMapControls");
const probeAltitudeInput = document.getElementById("probeAltitudeInput");
const probeVelocityInput = document.getElementById("probeVelocityInput");
const probeMassInput = document.getElementById("probeMassInput");
const setProbePositionBtn = document.getElementById("setProbePositionBtn");
const simulateProbeTrajectoryBtn = document.getElementById("simulateProbeTrajectoryBtn");
const positionProbePairBtn = document.getElementById("positionProbePairBtn");
const probeDockingStatus = document.getElementById("probeDockingStatus");
const probeManualRcsInput = document.getElementById("probeManualRcsInput");
const probeManualRcsStatus = document.getElementById("probeManualRcsStatus");
const probeDockingPanelStatus = document.getElementById("probeDockingPanelStatus");
const initialFlightTimeInput = document.getElementById("initialFlightTimeInput");
const sceneClockLabel = document.getElementById("sceneClockLabel");
const launchCountdownInput = document.getElementById("launchCountdownInput");
const telemetryModal = document.getElementById("telemetryModal");
const physicsModal = document.getElementById("physicsModal");
const protocolModal = document.getElementById("protocolModal");
const shipModal = document.getElementById("shipModal");
const towerModal = document.getElementById("towerModal");
const closeTelemetryModalBtn = document.getElementById("closeTelemetryModalBtn");
const closePhysicsModalBtn = document.getElementById("closePhysicsModalBtn");
const closeProtocolModalBtn = document.getElementById("closeProtocolModalBtn");
const closeShipModalBtn = document.getElementById("closeShipModalBtn");
const closeTowerModalBtn = document.getElementById("closeTowerModalBtn");
const shipGainProfileLabel = document.getElementById("shipGainProfileLabel");
const resetShipGainsBtn = document.getElementById("resetShipGainsBtn");
const shipControlLoopView = document.getElementById("shipControlLoopView");
const toggleShipControllersBtn = document.getElementById("toggleShipControllersBtn");
const shipControllersSection = document.getElementById("shipControllersSection");
const sn15PropulsionPanel = document.getElementById("sn15PropulsionPanel");
const propulsionPanelTitle = document.getElementById("propulsionPanelTitle");
const sn15PropulsionReadout = document.getElementById("sn15PropulsionReadout");
const sn15TankDiagram = document.getElementById("sn15TankDiagram");
const sn15EngineThrustInput = document.getElementById("sn15EngineThrustInput");
const sn15IspInput = document.getElementById("sn15IspInput");
const sn15MainLoxInput = document.getElementById("sn15MainLoxInput");
const sn15MainLch4Input = document.getElementById("sn15MainLch4Input");
const sn15HeaderLoxInput = document.getElementById("sn15HeaderLoxInput");
const sn15HeaderLch4Input = document.getElementById("sn15HeaderLch4Input");
const superHeavyStackPanel = document.getElementById("superHeavyStackPanel");
const superHeavyAttachS24Input = document.getElementById("superHeavyAttachS24Input");
const superHeavyStackReadout = document.getElementById("superHeavyStackReadout");
const probeManualRcsPanel = document.getElementById("probeManualRcsPanel");
const landingTargetLabel = document.getElementById("landingTargetLabel");
const resetTargetBtn = document.getElementById("resetTargetBtn");
const operationModeSelect = document.getElementById("operationModeSelect");
const shipSelect = document.getElementById("shipSelect");
const platformSelect = document.getElementById("platformSelect");
const shipFeedbackModeSelect = document.getElementById("shipFeedbackModeSelect");
const boosterRecoverySelect = document.getElementById("boosterRecoverySelect");
const platformPanelLabel = document.getElementById("platformPanelLabel");
const targetHint = document.getElementById("targetHint");
const captureStatus = document.getElementById("captureStatus");
const falseTowerAuthBtn = document.getElementById("falseTowerAuthBtn");
const protocolStatus = document.getElementById("protocolStatus");
const toggleFlightControlDetailsBtn = document.getElementById("toggleFlightControlDetailsBtn");
const flightControlDetails = document.getElementById("flightControlDetails");
const flightControlSummary = document.getElementById("flightControlSummary");
const protocolSpecView = document.getElementById("protocolSpecView");
const protocolUplinkView = document.getElementById("protocolUplinkView");
const protocolDownlinkView = document.getElementById("protocolDownlinkView");
const protocolUplinkDeliveryStatus = document.getElementById("protocolUplinkDeliveryStatus");
const protocolDownlinkDeliveryStatus = document.getElementById("protocolDownlinkDeliveryStatus");
const protocolUplinkOverrideEnabled = document.getElementById("protocolUplinkOverrideEnabled");
const protocolDownlinkOverrideEnabled = document.getElementById("protocolDownlinkOverrideEnabled");
const protocolUplinkOverrideText = document.getElementById("protocolUplinkOverrideText");
const protocolDownlinkOverrideText = document.getElementById("protocolDownlinkOverrideText");
const protocolUplinkSignalSelect = document.getElementById("protocolUplinkSignalSelect");
const protocolDownlinkSignalSelect = document.getElementById("protocolDownlinkSignalSelect");
const protocolUplinkSignalValueInput = document.getElementById("protocolUplinkSignalValueInput");
const protocolDownlinkSignalValueInput = document.getElementById("protocolDownlinkSignalValueInput");
const forceProtocolUplinkSignalBtn = document.getElementById("forceProtocolUplinkSignalBtn");
const forceProtocolDownlinkSignalBtn = document.getElementById("forceProtocolDownlinkSignalBtn");
const clearProtocolUplinkOverrideBtn = document.getElementById("clearProtocolUplinkOverrideBtn");
const clearProtocolDownlinkOverrideBtn = document.getElementById("clearProtocolDownlinkOverrideBtn");
const loadProtocolUplinkBtn = document.getElementById("loadProtocolUplinkBtn");
const loadProtocolDownlinkBtn = document.getElementById("loadProtocolDownlinkBtn");
const toggleFlightRouteBtn = document.getElementById("toggleFlightRouteBtn");
const abortBellyBtn = document.getElementById("abortBellyBtn");
const flightProgramProfileSelect = document.getElementById("flightProgramProfileSelect");
const flightProgramAltitudeInput = document.getElementById("flightProgramAltitudeInput");
const flightProgramHotstageAltitudeInput = document.getElementById("flightProgramHotstageAltitudeInput");
const flightProgramHotstageThrottleInput = document.getElementById("flightProgramHotstageThrottleInput");
const flightProgramHotstageRampInput = document.getElementById("flightProgramHotstageRampInput");
const flightProgramHotstagePitchBiasInput = document.getElementById("flightProgramHotstagePitchBiasInput");
const flightProgramHotstageReserveInput = document.getElementById("flightProgramHotstageReserveInput");
const runHotstageOptimizationBtn = document.getElementById("runHotstageOptimizationBtn");
const applyHotstageOptimizationBtn = document.getElementById("applyHotstageOptimizationBtn");
const hotstageOptimizationStatus = document.getElementById("hotstageOptimizationStatus");
const hotstageOptimizationResults = document.getElementById("hotstageOptimizationResults");
const flightProgramBoosterThrottleInput = document.getElementById("flightProgramBoosterThrottleInput");
const flightProgramBoosterFlipAngleInput = document.getElementById("flightProgramBoosterFlipAngleInput");
const flightProgramBoosterInboundVelocityInput = document.getElementById("flightProgramBoosterInboundVelocityInput");
const flightProgramBoosterBurnDurationInput = document.getElementById("flightProgramBoosterBurnDurationInput");
const flightProgramBoosterRecoveryThrustInput = document.getElementById("flightProgramBoosterRecoveryThrustInput");
const runBoosterOptimizationBtn = document.getElementById("runBoosterOptimizationBtn");
const applyBoosterOptimizationBtn = document.getElementById("applyBoosterOptimizationBtn");
const boosterOptimizationStatus = document.getElementById("boosterOptimizationStatus");
const boosterOptimizationResults = document.getElementById("boosterOptimizationResults");
const flightProgramHoldInput = document.getElementById("flightProgramHoldInput");
const flightProgramPostHoldSelect = document.getElementById("flightProgramPostHoldSelect");
const flightProgramStatus = document.getElementById("flightProgramStatus");
const physicsPresetSelect = document.getElementById("physicsPresetSelect");
const physicsPresetStatus = document.getElementById("physicsPresetStatus");
const towerLinkFailureSelect = document.getElementById("towerLinkFailureSelect");
const towerArmsFailureSelect = document.getElementById("towerArmsFailureSelect");
const towerFailureStatus = document.getElementById("towerFailureStatus");
const towerApproachDistanceInput = document.getElementById("towerApproachDistanceInput");
const towerApproachAngleInput = document.getElementById("towerApproachAngleInput");
const towerApproachToleranceInput = document.getElementById("towerApproachToleranceInput");
const towerApproachCommand = document.getElementById("towerApproachCommand");
const engineFailureSelect = document.getElementById("engineFailureSelect");
const rcsFailureSelect = document.getElementById("rcsFailureSelect");
const flapFailureSelect = document.getElementById("flapFailureSelect");
const failureStatus = document.getElementById("failureStatus");
const speedButtons = document.querySelectorAll(".speed-btn");
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
const FLIGHT_CONTROL_STORAGE_KEY = "starship.flight-control.v1";

function persistFlightControlConfig() {
    try {
        localStorage.setItem(FLIGHT_CONTROL_STORAGE_KEY, JSON.stringify({
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

function restoreFlightControlConfig() {
    try {
        const saved = JSON.parse(localStorage.getItem(FLIGHT_CONTROL_STORAGE_KEY) ?? "null");
        if (!saved || typeof saved !== "object") return;
        if (typeof saved.operationMode === "string") operationModeSelect.value = saved.operationMode;
        if (shipRegistry[saved.selectedShipId]) flightControlState.selectedShipId = saved.selectedShipId;
        if (platformRegistry[saved.selectedPlatformId]) flightControlState.selectedPlatformId = saved.selectedPlatformId;
        if (typeof saved.routeLocked === "boolean") flightControlState.routeLocked = saved.routeLocked;
        if (saved.shipFeedbackMode === "platform_isolated" || saved.shipFeedbackMode === "closed_loop") flightControlState.shipFeedbackMode = saved.shipFeedbackMode;
        if (Object.values(FLIGHT_PROGRAM_PROFILES).includes(saved.flightProgramProfile)) flightControlState.flightProgramProfile = saved.flightProgramProfile;
        if (Number.isFinite(saved.testAltitudeSetpoint)) flightControlState.testAltitudeSetpoint = clamp(saved.testAltitudeSetpoint, 0, 800000);
        if (Number.isFinite(saved.hotstageAltitudeSetpoint)) flightControlState.hotstageAltitudeSetpoint = clamp(saved.hotstageAltitudeSetpoint, 60000, 800000);
        if (Number.isFinite(saved.hotstageThrottle)) flightControlState.hotstageThrottle = clamp(saved.hotstageThrottle, 0.35, 1);
        if (Number.isFinite(saved.hotstageAltitudeRampRate)) flightControlState.hotstageAltitudeRampRate = clamp(saved.hotstageAltitudeRampRate, 100, 1200);
        if (Number.isFinite(saved.hotstagePitchBiasMaxDeg)) flightControlState.hotstagePitchBiasMaxDeg = clamp(saved.hotstagePitchBiasMaxDeg, 5, 35);
        if (Number.isFinite(saved.hotstageFuelReserveFraction)) flightControlState.hotstageFuelReserveFraction = clamp(saved.hotstageFuelReserveFraction, 0.01, 0.25);
        if (Number.isFinite(saved.boosterBoostbackThrottle)) flightControlState.boosterBoostbackThrottle = clamp(saved.boosterBoostbackThrottle, 0.55, 1);
        if (Number.isFinite(saved.boosterFlipAngleDeg)) flightControlState.boosterFlipAngleDeg = clamp(saved.boosterFlipAngleDeg, 85, 165);
        if (Number.isFinite(saved.boosterInboundVelocityLimit)) flightControlState.boosterInboundVelocityLimit = clamp(saved.boosterInboundVelocityLimit, 100, 1600);
        if (Number.isFinite(saved.boosterBoostbackMaxDuration)) flightControlState.boosterBoostbackMaxDuration = clamp(saved.boosterBoostbackMaxDuration, 60, 240);
        if (Number.isFinite(saved.boosterRecoveryThrustFraction)) flightControlState.boosterRecoveryThrustFraction = clamp(saved.boosterRecoveryThrustFraction, 0.45, 1);
        if (Number.isFinite(saved.holdDuration)) flightControlState.holdDuration = clamp(saved.holdDuration, 0, 300);
        if (Object.values(TEST_HOP_POST_HOLD_ACTIONS).includes(saved.postHoldAction)) flightControlState.postHoldAction = saved.postHoldAction;
        if (saved.boosterRecovery === "tower_catch" || saved.boosterRecovery === "splashdown") flightControlState.boosterRecovery = saved.boosterRecovery;
        stackMission.attachS24 = Boolean(saved.attachS24);
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
        boosterRecoverySelect.value = flightControlState.boosterRecovery;
        superHeavyAttachS24Input.checked = stackMission.attachS24;
    } catch {
        // Ignore a corrupt/outdated preference and use the built-in defaults.
    }
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

function escapeHtmlText(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

function buildControlLoopMetricMarkup(metric, gains, gainSpecMap) {
    if (typeof metric === "string") {
        return `<div class="controlLoopMetric">${escapeHtmlText(metric)}</div>`;
    }

    if (!metric || !metric.gainKey) {
        return "";
    }

    const spec = gainSpecMap[metric.gainKey];

    if (!spec) {
        return `<div class="controlLoopMetric">${escapeHtmlText(metric.label ?? metric.gainKey)}</div>`;
    }

    return `
        <label class="controlLoopGainField" title="${escapeHtmlText(spec.label)}">
            <span class="controlLoopGainFieldLabel">${escapeHtmlText(metric.label ?? spec.label)}</span>
            <input
                class="controlLoopGainFieldInput"
                type="number"
                inputmode="decimal"
                min="${spec.min}"
                max="${spec.max}"
                step="${spec.step}"
                value="${formatGainValue(gains[spec.key], spec.step)}"
                data-gain-key="${spec.key}"
                data-gain-step="${spec.step}"
                aria-label="${escapeHtmlText(spec.label)}"
            />
        </label>
    `;
}

function buildControlLoopNodeMarkup({ variant = "", eyebrow, title, metrics = [] }, gains, gainSpecMap) {
    const safeVariant = variant ? ` controlLoopNode--${variant}` : "";

    return `
        <div class="controlLoopNode${safeVariant}">
            <div class="controlLoopNodeEyebrow">${escapeHtmlText(eyebrow)}</div>
            <div class="controlLoopNodeTitle">${escapeHtmlText(title)}</div>
            <div class="controlLoopMetricList">
                ${metrics.map((metric) => buildControlLoopMetricMarkup(metric, gains, gainSpecMap)).join("")}
            </div>
        </div>
    `;
}

function buildControlLoopOutputMarkup({ title, metrics = [] }, gains, gainSpecMap) {
    return `
        <div class="controlLoopOutput">
            <div class="controlLoopOutputTitle">${escapeHtmlText(title)}</div>
            <div class="controlLoopMetricList">
                ${metrics.map((metric) => buildControlLoopMetricMarkup(metric, gains, gainSpecMap)).join("")}
            </div>
        </div>
    `;
}

function buildControlLoopNoteMarkup(title, text) {
    return `
        <div class="controlLoopNote">
            <div class="controlLoopNoteTitle">${escapeHtmlText(title)}</div>
            <div class="controlLoopNoteBody">${escapeHtmlText(text)}</div>
        </div>
    `;
}

function buildControlLoopDiagramMarkup(gains, gainSpecs) {
    const gainSpecMap = Object.fromEntries(gainSpecs.map((spec) => [spec.key, spec]));

    return `
        <div class="controlLoopCard">
            <div class="controlLoopTitle">Malha de Atitude</div>
            <div class="controlLoopFlow controlLoopFlow--attitude">
                ${buildControlLoopNodeMarkup({
                    variant: "reference",
                    eyebrow: "Referencia",
                    title: "targetAngle",
                    metrics: [
                        { gainKey: "bellyEntryAngleDeg", label: "Belly SP" },
                        "base do belly antes do flip"
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "sum",
                    eyebrow: "Comparador",
                    title: "erro angular",
                    metrics: ["targetAngle - nav.a"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "controller",
                    eyebrow: "Controlador",
                    title: "Atitude",
                    metrics: [
                        { gainKey: "attitudeEntryGain", label: "Entry" },
                        { gainKey: "attitudeTerminalGain", label: "Terminal" }
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "plant",
                    eyebrow: "Planta",
                    title: "Nave",
                    metrics: ["nav.a", "nav.w", "q"]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopOutputsLabel">Saidas do controlador</div>
            <div class="controlLoopOutputs controlLoopOutputs--triple">
                ${buildControlLoopOutputMarkup({
                    title: "RCS",
                    metrics: [
                        { gainKey: "rcsEntryGain", label: "Entry" },
                        { gainKey: "rcsTerminalGain", label: "Terminal" }
                    ]
                }, gains, gainSpecMap)}
                ${buildControlLoopOutputMarkup({
                    title: "Gimbal / TVC",
                    metrics: [
                        { gainKey: "gimbalEntryGain", label: "Entry" },
                        { gainKey: "gimbalFlipGain", label: "Flip" },
                        { gainKey: "gimbalLandingGain", label: "Land" }
                    ]
                }, gains, gainSpecMap)}
                ${buildControlLoopOutputMarkup({
                    title: "Flaps",
                    metrics: [{ gainKey: "flapAuthorityGain", label: "Authority" }]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopFeedback">
                Feedback: nav.a, nav.w e pressao dinamica q | targetAngle = belly SP + correcao lateral
            </div>
        </div>
        <div class="controlLoopCard">
            <div class="controlLoopTitle">Malha PID de Decolagem</div>
            <div class="controlLoopFlow controlLoopFlow--vertical">
                ${buildControlLoopNodeMarkup({
                    variant: "reference",
                    eyebrow: "Referencia",
                    title: "targetZ",
                    metrics: ["entrada em degrau de altitude"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "sum",
                    eyebrow: "Comparador",
                    title: "erro Z",
                    metrics: ["targetZ - nav.z", "feedback derivativo por nav.vz"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "controller",
                    eyebrow: "Controlador",
                    title: "PID Altitude",
                    metrics: [
                        { gainKey: "takeoffPositionPGain", label: "Z P" },
                        { gainKey: "takeoffPositionIGain", label: "Z I" },
                        { gainKey: "takeoffVelocityDGain", label: "D" }
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "controller",
                    eyebrow: "Malha interna",
                    title: "Takeoff Throttle PI",
                    metrics: [
                        { gainKey: "takeoffThrottlePGain", label: "P" },
                        { gainKey: "takeoffThrottleIGain", label: "I" }
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "plant",
                    eyebrow: "Planta",
                    title: "Nave",
                    metrics: ["nav.z", "nav.vz"]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopOutputsLabel">Observacao</div>
            ${buildControlLoopNoteMarkup("Lei de controle", "degrau em Zsp -> PID de altitude -> alvo Vz -> throttle PI")}
            <div class="controlLoopFeedback">Ativo apenas em teste de decolagem ate o fim do hold</div>
        </div>
        <div class="controlLoopCard">
            <div class="controlLoopTitle">Malha Vertical / Throttle</div>
            <div class="controlLoopFlow controlLoopFlow--vertical">
                ${buildControlLoopNodeMarkup({
                    variant: "reference",
                    eyebrow: "Referencia",
                    title: "targetVz",
                    metrics: ["taxa vertical alvo"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "sum",
                    eyebrow: "Comparador",
                    title: "erro Vz",
                    metrics: ["targetVz - nav.vz"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "controller",
                    eyebrow: "Controlador",
                    title: "Throttle PI — Descida",
                    metrics: [
                        { gainKey: "throttlePGain", label: "P" },
                        { gainKey: "throttleIGain", label: "I" }
                    ]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "actuator",
                    eyebrow: "Atuador",
                    title: "Motor",
                    metrics: ["throttle -> empuxo"]
                }, gains, gainSpecMap)}
                <div class="controlLoopArrow" aria-hidden="true"></div>
                ${buildControlLoopNodeMarkup({
                    variant: "plant",
                    eyebrow: "Planta",
                    title: "Nave",
                    metrics: ["nav.vz"]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopOutputsLabel">Malha Externa</div>
            <div class="controlLoopOutputs controlLoopOutputs--double">
                ${buildControlLoopOutputMarkup({
                    title: "Altitude PI",
                    metrics: [
                        { gainKey: "altitudePGain", label: "P" },
                        { gainKey: "altitudeIGain", label: "I" }
                    ]
                }, gains, gainSpecMap)}
                ${buildControlLoopOutputMarkup({
                    title: "Sequenciador",
                    metrics: ["targetZ -> targetVz", "ativo na recuperacao e pouso"]
                }, gains, gainSpecMap)}
            </div>
            <div class="controlLoopOutputsLabel">Observacao</div>
            ${buildControlLoopNoteMarkup("Lei de controle", "hover throttle + erro Vz + integral | usado fora da etapa de decolagem")}
            <div class="controlLoopFeedback">Feedback: velocidade vertical medida</div>
        </div>
    `;
}

function updateShipGainPanel() {
    const controller = getSelectedShipController();

    if (!controller) {
        shipGainProfileLabel.textContent = "Nave ativa: indisponível";
        shipControlLoopView.innerHTML = "";
        return;
    }

    const profile = getSelectedShipProfile();
    const gains = controller.getControlGains();
    const specs = controller.getControlGainSpecs();

    shipGainProfileLabel.textContent = `Nave ativa: ${profile.label} (${profile.callsign})`;
    shipControlLoopView.innerHTML = buildControlLoopDiagramMarkup(gains, specs);
}

function handleShipGainInput(input, finalize = false) {
    const controller = getSelectedShipController();

    if (!controller) {
        return;
    }

    const gainKey = input.dataset.gainKey;
    const step = Number(input.dataset.gainStep);
    const nextValue = input.valueAsNumber;

    if (gainKey && Number.isFinite(nextValue)) {
        controller.setControlGain(gainKey, nextValue);
    }

    if (!finalize || !gainKey) {
        return;
    }

    const currentValue = controller.getControlGains()[gainKey];

    if (typeof currentValue === "number" && Number.isFinite(currentValue)) {
        input.value = formatGainValue(currentValue, step);
    }
}

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

const protocolState = {
    shipUplinkRaw: {},
    shipUplinkEffective: {},
    platformUplinkReceived: {},
    platformDownlinkRaw: {},
    platformDownlinkEffective: {},
    shipDownlinkReceived: {},
    uplinkError: "",
    downlinkError: "",
};

const protocolDefinition = {
    name: "SPLP-1",
    version: "1.0",
    title: "Starship Platform Link Protocol",
    operatingRules: [
        "Stand-alone: a nave decide a recuperacao terminal apenas com sensores locais.",
        "Linked: o controlador de voo arma um enlace entre uma nave registrada e uma plataforma registrada.",
        "A nave envia seu estado estimado ao controlador da plataforma selecionada por meio do uplink.",
        "A plataforma calcula sua resposta e devolve ao controlador de voo a janela de recepcao/captura.",
        "O controlador de voo pode devolver a resposta real da plataforma em malha fechada ou um retorno isolado para a nave.",
        "Autorizacao de shutdown deve ser conferida pela nave junto com o contexto cinemático recebido.",
    ],
    uplink: {
        label: "Nave -> Plataforma",
        channel: "uplink",
        frame: "SHIP_STATE",
        source: "flight_computer",
        destination: "platform_controller",
        signals: [
            { key: "controllerId", group: "discrete", type: "string", description: "Identificador do controlador de voo que roteou o enlace." },
            { key: "vehicleId", group: "discrete", type: "string", description: "Identificador unico da nave selecionada." },
            { key: "vehicleClass", group: "discrete", type: "string", description: "Classe da nave selecionada." },
            { key: "callsign", group: "discrete", type: "string", description: "Callsign operacional da nave." },
            { key: "length", group: "analog", type: "number", unit: "m", description: "Altura física da nave." },
            { key: "diameter", group: "analog", type: "number", unit: "m", description: "Diâmetro físico da nave." },
            { key: "assignedPlatformId", group: "discrete", type: "string", description: "Plataforma designada no controlador de voo." },
            { key: "linkedModeRequested", group: "discrete", type: "boolean", description: "Nave solicitando operacao em linked mode." },
            { key: "routeLocked", group: "discrete", type: "boolean", description: "Rota travada pelo controlador de voo." },
            { key: "x", group: "analog", type: "number", unit: "m", description: "Posicao horizontal estimada da nave." },
            { key: "z", group: "analog", type: "number", unit: "m", description: "Altitude estimada da nave." },
            { key: "vx", group: "analog", type: "number", unit: "m/s", description: "Velocidade horizontal estimada." },
            { key: "vz", group: "analog", type: "number", unit: "m/s", description: "Velocidade vertical estimada." },
            { key: "a", group: "analog", type: "number", unit: "rad", description: "Atitude estimada da nave." },
        ],
    },
    downlink: {
        label: "Plataforma -> Nave",
        channel: "downlink",
        frame: "PLATFORM_GUIDANCE",
        source: "platform_controller",
        destination: "flight_computer",
        signals: [
            { key: "controllerId", group: "discrete", type: "string", description: "Identificador do controlador de voo no enlace." },
            { key: "platformId", group: "discrete", type: "string", description: "Identificador unico da plataforma selecionada." },
            { key: "platformClass", group: "discrete", type: "string", description: "Classe da plataforma ativa." },
            { key: "linkedShipId", group: "discrete", type: "string", description: "Nave atualmente associada a esta plataforma." },
            { key: "routeLocked", group: "discrete", type: "boolean", description: "Rota travada pelo controlador de voo." },
            { key: "linkAccepted", group: "discrete", type: "boolean", description: "Plataforma aceitando o enlace atual." },
            { key: "available", group: "discrete", type: "boolean", description: "Link valido e ativo." },
            { key: "captureX", group: "analog", type: "number", unit: "m", description: "Eixo horizontal da janela da plataforma." },
            { key: "captureZ", group: "analog", type: "number", unit: "m", description: "Altitude da janela de captura ou recepcao." },
            { key: "approachX", group: "analog", type: "number", unit: "m", description: "Coordenada X do ponto de aproximação enviado pela torre." },
            { key: "approachZ", group: "analog", type: "number", unit: "m", description: "Coordenada Z do ponto de aproximação enviado pela torre." },
            { key: "approachTolerance", group: "analog", type: "number", unit: "m", description: "Raio de tolerância do ponto de aproximação." },
            { key: "recoveryMode", group: "discrete", type: "string", description: "Perfil de retorno determinado pelo controlador de voo." },
            { key: "approachRequired", group: "discrete", type: "boolean", description: "Controlador exige passagem pelo ponto de aproximação." },
            { key: "abortBelly", group: "discrete", type: "boolean", description: "Sinal de emergência do controlador que libera a saída do bellyflop travado." },
            { key: "approachReached", group: "discrete", type: "boolean", description: "Nave entrou no raio do ponto de aproximação." },
            { key: "guidancePhase", group: "discrete", type: "string", description: "Etapa do downlink: approach ou final." },
            { key: "towerHeight", group: "analog", type: "number", unit: "m", description: "Altura total da estrutura da plataforma." },
            { key: "xError", group: "analog", type: "number", unit: "m", description: "Erro horizontal nave-plataforma." },
            { key: "zError", group: "analog", type: "number", unit: "m", description: "Erro vertical nave-plataforma." },
            { key: "vxError", group: "analog", type: "number", unit: "m/s", description: "Erro de velocidade horizontal." },
            { key: "vzError", group: "analog", type: "number", unit: "m/s", description: "Erro de velocidade vertical." },
            { key: "angleError", group: "analog", type: "number", unit: "rad", description: "Erro angular relativo." },
            {
                key: "recommendedFlipAltitude",
                group: "analog",
                type: "number",
                unit: "m",
                description: "Altitude sugerida para iniciar o flip em modo linked.",
            },
            { key: "approachAuthorized", group: "discrete", type: "boolean", description: "Corredor de aproximacao autorizado." },
            { key: "geometryReady", group: "discrete", type: "boolean", description: "Plataforma validou a geometria para comando de fechamento." },
            { key: "readyToClose", group: "discrete", type: "boolean", description: "Plataforma pronta para travar a captura com os bracos quase fechados." },
            { key: "lateralAligned", group: "discrete", type: "boolean", description: "Alinhamento lateral dentro da janela." },
            { key: "verticalAligned", group: "discrete", type: "boolean", description: "Alinhamento vertical dentro da janela." },
            { key: "rateAligned", group: "discrete", type: "boolean", description: "Velocidades dentro do envelope aceito." },
            { key: "attitudeAligned", group: "discrete", type: "boolean", description: "Atitude dentro do envelope aceito." },
            { key: "armClosure", group: "analog", type: "number", unit: "0..1", description: "Fechamento medio do mecanismo de captura." },
            { key: "leftArmClosure", group: "analog", type: "number", unit: "0..1", description: "Fechamento do lado esquerdo." },
            { key: "rightArmClosure", group: "analog", type: "number", unit: "0..1", description: "Fechamento do lado direito." },
            { key: "leftArmBroken", group: "discrete", type: "boolean", description: "Braço esquerdo estruturalmente quebrado." },
            { key: "rightArmBroken", group: "discrete", type: "boolean", description: "Braço direito estruturalmente quebrado." },
            { key: "captured", group: "discrete", type: "boolean", description: "Captura confirmada pela plataforma." },
            { key: "capturePossible", group: "discrete", type: "boolean", description: "Captura fisicamente viavel no estado atual." },
            { key: "supportAuthorized", group: "discrete", type: "boolean", description: "PLC da plataforma autorizando o suporte/contato dos bracos." },
            { key: "captureVerificationOk", group: "discrete", type: "boolean", description: "PLC da plataforma recebeu verificacao fisica positiva do controlador." },
            { key: "shutdownAuthorized", group: "discrete", type: "boolean", description: "Autorizacao para corte dos motores da nave." },
            {
                key: "authorizationSource",
                group: "discrete",
                type: "string",
                description: "Origem da autorizacao de shutdown, nominal ou injetada.",
            },
            { key: "status", group: "discrete", type: "string", description: "Mensagem de estado da plataforma." },
        ],
    },
};

let modalZIndex = 40;

function bringModalToFront(modal) {
    modalZIndex += 1;
    modal.style.zIndex = String(modalZIndex);
}

function clampModalPosition(modal) {
    const card = modal.querySelector("[data-modal-card]");

    if (!card) {
        return;
    }

    const viewportPadding = 12;
    const cardRect = card.getBoundingClientRect();
    const maxLeft = Math.max(viewportPadding, window.innerWidth - cardRect.width - viewportPadding);
    const maxTop = Math.max(viewportPadding, window.innerHeight - cardRect.height - viewportPadding);
    const currentLeft = Number(card.style.left.replace("px", "")) || card.offsetLeft;
    const currentTop = Number(card.style.top.replace("px", "")) || card.offsetTop;

    card.style.left = `${clamp(currentLeft, viewportPadding, maxLeft)}px`;
    card.style.top = `${clamp(currentTop, viewportPadding, maxTop)}px`;
}

function initializeModalPosition(modal, preferredLeft, preferredTop) {
    const card = modal.querySelector("[data-modal-card]");

    if (!card || card.dataset.positioned === "true") {
        return;
    }

    card.style.left = `${preferredLeft}px`;
    card.style.top = `${preferredTop}px`;
    card.dataset.positioned = "true";
    clampModalPosition(modal);
}

function setModalVisibility(modal, visible) {
    modal.hidden = !visible;

    if (visible) {
        bringModalToFront(modal);
        clampModalPosition(modal);
    }
}

function closeAllModals() {
    setModalVisibility(protocolModal, false);
    setModalVisibility(telemetryModal, false);
    setModalVisibility(physicsModal, false);
    setModalVisibility(shipModal, false);
    setModalVisibility(towerModal, false);
    setModalVisibility(terraMapModal, false);
}

function bindModal(modal, openButton, closeButton) {
    openButton.addEventListener("click", () => {
        setModalVisibility(modal, true);
    });

    closeButton.addEventListener("click", () => {
        setModalVisibility(modal, false);
    });

    const card = modal.querySelector("[data-modal-card]");

    if (card) {
        card.addEventListener("pointerdown", () => {
            bringModalToFront(modal);
        });
    }
}

function makeModalDraggable(modal) {
    const card = modal.querySelector("[data-modal-card]");
    const handle = modal.querySelector("[data-modal-handle]");

    if (!card || !handle) {
        return;
    }

    handle.addEventListener("pointerdown", (event) => {
        if (event.target.closest("button")) {
            return;
        }

        bringModalToFront(modal);

        const cardRect = card.getBoundingClientRect();
        const dragOffsetX = event.clientX - cardRect.left;
        const dragOffsetY = event.clientY - cardRect.top;

        const onPointerMove = (moveEvent) => {
            card.style.left = `${moveEvent.clientX - dragOffsetX}px`;
            card.style.top = `${moveEvent.clientY - dragOffsetY}px`;
            clampModalPosition(modal);
        };

        const onPointerUp = () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };

        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    });
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

function syncFlightProgramControls() {
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
    const boosterTestProgram = isSuperHeavySelected() &&
        flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.TEST_HOP;
    // Bellyflop is a Starship-only manoeuvre. Keep the configuration visibly
    // locked as well as forcing it in the controller below.
    flightProgramPostHoldSelect.disabled = boosterTestProgram;
    document.querySelectorAll("[data-flight-program-fields]").forEach((fields) => {
        const isSharedHotstageFields =
            fields.dataset.flightProgramFields === FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK &&
            isSuborbitalMissionProgramSelected();
        fields.hidden = fields.dataset.flightProgramFields !== flightControlState.flightProgramProfile && !isSharedHotstageFields;
    });
    boosterRecoverySelect.value = flightControlState.boosterRecovery;
    boosterRecoverySelect.disabled = !isSuperHeavySelected() || started;
    const supportsHotstageOptimization = isStackHotstageBoostbackProgramSelected() || isSuborbitalMissionProgramSelected();
    runHotstageOptimizationBtn.disabled = started || !supportsHotstageOptimization;
    applyHotstageOptimizationBtn.disabled = started || !bestHotstageOptimizationResult;
    runBoosterOptimizationBtn.disabled = started || !supportsHotstageOptimization;
    applyBoosterOptimizationBtn.disabled = started || !bestBoosterOptimizationResult;
}

function updateFlightProgramStatus() {
    if (isSuperHeavySelected()) {
        const destination = flightControlState.boosterRecovery === "tower_catch" ? "captura na torre" : "amerrissagem no oceano";
        flightProgramStatus.textContent = stackMission.attachS24
            ? isSuborbitalMissionProgramSelected()
                ? `Missão Suborbital B7 + S24: decolagem acoplada, hot-staging a 60 km, B7 retorna para ${destination} e S24 segue para o Oceano Índico.`
                : isStackHotstageBoostbackProgramSelected()
                ? `Stack B7 + S24: início a 60 km e 5.800 km/h rumo a leste; B7 reduz para os motores centrais, S24 acende ainda acoplada e então ocorre o hot-staging. A S24 eleva o ápice até ${(flightControlState.hotstageAltitudeSetpoint / 1000).toFixed(0)} km; B7 retorna para ${destination}.`
                : `Stack B7 + S24: o Super Heavy separa a 10 km; destino do booster: ${destination}. A S24 entra em recuperação.`
            : flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.BOOSTBACK_BURN
                ? "B7 Boostback Burn: 60 km, 4.500 km/h para leste, flip RCS, reversão máxima e entrega à torre em 7 km."
                : flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.REENTRY
                ? `B7: teste de reentrada habilitado; retorno propulsivo direto para ${destination}, sem bellyflop.`
                : `B7 independente: subir a ${flightControlState.testAltitudeSetpoint.toFixed(0)} m, estabilizar por ${flightControlState.holdDuration.toFixed(1)} s e retornar para ${destination}.`;
        return;
    }
    const missionConfig = getSelectedShipMissionState();

    if (flightControlState.flightProgramProfile !== FLIGHT_PROGRAM_PROFILES.TEST_HOP) {
        flightProgramStatus.textContent =
            "Perfil nominal de reentrada: a nave inicia em alta altitude e executa a recuperação terminal.";
        return;
    }

    const sequenceLabel =
        started && controlState?.sequencePhase
            ? `Fase atual: ${controlState.sequencePhase}`
            : `Sequência armada: ${missionConfig.sequencePhase}`;
    const actionLabel = getPostHoldActionLabel(missionConfig.postHoldAction);
    flightProgramStatus.textContent =
        `Teste de decolagem: subir e estabilizar em ${missionConfig.testAltitudeSetpoint.toFixed(0)} m, esperar ${missionConfig.holdDuration.toFixed(1)} s e depois ${actionLabel}. ${sequenceLabel}.`;
}

function createHotstageOptimizationCandidates() {
    const throttleValues = [0.55, 0.625, 0.70, 0.775, 0.85, 0.925, 0.95, 0.975, 1];
    const rampValues = [300, 500, 700, 900, 1100];
    const pitchBiasValues = [12, 20, 28, 35];
    const candidates = [];

    for (const throttle of throttleValues) {
        for (const altitudeRampRate of rampValues) {
            for (const pitchBiasMaxDeg of pitchBiasValues) {
                candidates.push({ throttle, altitudeRampRate, pitchBiasMaxDeg });
            }
        }
    }

    // Always test the operator's current command as well, even when it does
    // not fall on the coarse optimization grid.
    candidates.push({
        throttle: flightControlState.hotstageThrottle,
        altitudeRampRate: flightControlState.hotstageAltitudeRampRate,
        pitchBiasMaxDeg: flightControlState.hotstagePitchBiasMaxDeg,
    });

    const unique = new Map();
    candidates.forEach((candidate) => {
        const key = `${candidate.throttle.toFixed(4)}:${candidate.altitudeRampRate}:${candidate.pitchBiasMaxDeg}`;
        unique.set(key, candidate);
    });
    return [...unique.values()];
}

function simulateHotstageOptimizationCandidate(candidate, altitudeTarget) {
    const profile = shipRegistry.starship_ship24;
    const propulsion = propulsionOverrides.get(profile.id) ?? profile.propulsion;
    const controller = profile.createController();
    const initialMainPropellant = propulsion.tanks.main.loxKg + propulsion.tanks.main.lch4Kg;
    const initialHeaderPropellant = propulsion.tanks.header.loxKg + propulsion.tanks.header.lch4Kg;
    const initialTotalPropellant = initialMainPropellant + initialHeaderPropellant;
    const maxThrust = propulsion.engines.count * propulsion.engines.thrustN;
    const massFlowAtFullThrust = maxThrust / (propulsion.engines.specificImpulseSeconds * 9.80665);
    const initialSpeed = 5800 / 3.6;
    const initialPitch = Math.PI / 3;
    const state = {
        x: 0,
        z: 60000,
        vx: initialSpeed * Math.sin(initialPitch),
        vz: initialSpeed * Math.cos(initialPitch),
        a: initialPitch,
        w: 0,
        noseFlap: 0.72,
        tailFlap: 0.72,
        rcs: 0,
        gimbal: 0,
        throttle: 0,
    };
    const director = {
        profile: FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK,
        hotstageAltitudeSetpoint: altitudeTarget,
        hotstageThrottle: candidate.throttle,
        hotstageAltitudeRampRate: candidate.altitudeRampRate,
        hotstagePitchBiasMaxDeg: candidate.pitchBiasMaxDeg,
        hotstageFuelReserveFraction: flightControlState.hotstageFuelReserveFraction,
    };
    let mainPropellant = initialMainPropellant;
    let headerPropellant = initialHeaderPropellant;
    let time = 0;
    let burnTime = 0;
    let maxAltitude = state.z;
    let impactX = null;
    let numericalFailure = false;
    let engineEverCutOff = false;

    controller.reset();
    controller.applyFlightDirector(director);

    while (time < 6500) {
        const dt = state.z < 80000 ? 0.05 : state.z < 220000 ? 0.2 : 0.5;
        const vehicleMass = profile.mass + mainPropellant + headerPropellant;
        const relativeVx = state.vx - environment.wind.x;
        const relativeVz = state.vz - environment.wind.z;
        const airspeed = Math.hypot(relativeVx, relativeVz) + 0.01;
        const density = rho(state.z);
        const q = 0.5 * density * airspeed * airspeed;
        const navSnapshot = {
            ...state,
            q,
            airSpeed: airspeed,
        };
        const command = controller.update(dt, navSnapshot, {
            airdata: { dynamicPressure: q },
            platformLink: {},
            towerLink: {},
        }, {
            started: true,
            mass: vehicleMass,
            maxThrust,
            g: G,
            upperStageTransfer: true,
            indianOceanTargetX: INDIAN_OCEAN_TARGET_X,
            mainPropellantFraction: mainPropellant / Math.max(initialMainPropellant, 1),
            actuators: { flapLift: 1, flapTorque: 1, rcs: 1, tvc: 1 },
            flightDirector: director,
        });

        state.noseFlap = moveToward(state.noseFlap, command.noseFlap ?? command.noseTarget ?? 0, 2.8, dt);
        state.tailFlap = moveToward(state.tailFlap, command.tailFlap ?? command.tailTarget ?? 0, 2.8, dt);
        state.rcs = moveToward(state.rcs, command.rcs ?? command.rcsTarget ?? 0, 7.5, dt);
        state.gimbal = moveToward(state.gimbal, command.engineOn ? command.gimbal ?? command.gimbalTarget ?? 0 : 0, 2.8, dt);
        state.throttle = moveToward(state.throttle, command.engineOn ? command.throttle ?? command.throttleTarget ?? 0 : 0, 1.6, dt);
        if (!command.engineOn && state.throttle <= 0.02) engineEverCutOff = true;

        const useHeaderTank = ["FLIP", "LANDING"].includes(command.mode);
        const activePropellant = useHeaderTank ? headerPropellant : mainPropellant;
        let thrustFraction = activePropellant > 0 ? state.throttle : 0;
        const requestedPropellant = massFlowAtFullThrust * thrustFraction * dt;
        if (requestedPropellant > activePropellant && requestedPropellant > 0) {
            thrustFraction *= activePropellant / requestedPropellant;
        }
        const consumedPropellant = Math.min(activePropellant, requestedPropellant);
        if (useHeaderTank) headerPropellant -= consumedPropellant;
        else mainPropellant -= consumedPropellant;
        if (thrustFraction > 0.001) burnTime += dt * thrustFraction;

        const flowAngle = Math.atan2(-relativeVx, -relativeVz);
        const aoa = wrapAngle(state.a - flowAngle);
        const averageFlap = 0.5 * (state.noseFlap + state.tailFlap);
        const flapDifferential = state.tailFlap - state.noseFlap;
        const flapDragArea = 100 * averageFlap + 180 * averageFlap * averageFlap + 40 * Math.abs(flapDifferential);
        const dragArea = 90 + 250 * Math.abs(Math.sin(aoa)) + flapDragArea;
        const dragMagnitude = Cd * q * dragArea;
        const bodyLiftMagnitude = q * 160 * (0.12 * Math.sin(2 * aoa));
        const flapLiftMagnitude = q * 220 * (0.16 * averageFlap * Math.sin(2 * aoa) + 0.38 * flapDifferential);
        const liftMagnitude = bodyLiftMagnitude + flapLiftMagnitude;
        const dragX = -dragMagnitude * relativeVx / airspeed;
        const dragZ = -dragMagnitude * relativeVz / airspeed;
        const liftX = -liftMagnitude * relativeVz / airspeed;
        const liftZ = liftMagnitude * relativeVx / airspeed;
        const thrustMagnitude = maxThrust * thrustFraction;
        const thrustAngle = state.a + state.gimbal;
        const thrustX = thrustMagnitude * Math.sin(thrustAngle);
        const thrustZ = thrustMagnitude * Math.cos(thrustAngle);

        const aeroBlend = clamp(q / 6000, 0, 1);
        const aeroMoment = aeroBlend * (-wrapAngle(aoa - Math.PI / 2) * 2.6 + flapDifferential * 6.2 - state.w * 1.8);
        const rcsMoment = state.rcs * (1.8 - aeroBlend * 0.9);
        const tvcMoment = thrustFraction > 0.001
            ? clamp(state.gimbal / MAX_GIMBAL, -1, 1) * (7.5 + state.throttle * 8.5) - state.w * 0.6
            : 0;
        const previousX = state.x;
        const previousZ = state.z;
        physicsCore.step(state, dt, {
            mass: vehicleMass,
            forceX: dragX + liftX + thrustX,
            forceZ: dragZ + liftZ + thrustZ,
            angularAcceleration: aeroMoment + rcsMoment + tvcMoment,
        });
        time += dt;
        maxAltitude = Math.max(maxAltitude, state.z);

        if (!physicsCore.isFinite(state)) {
            numericalFailure = true;
            break;
        }

        if (previousZ > 0 && state.z <= 0 && state.vz < 0) {
            const impactFraction = clamp(previousZ / Math.max(previousZ - state.z, 1e-9), 0, 1);
            impactX = previousX + (state.x - previousX) * impactFraction;
            break;
        }

        // A trajectory that passes the target by more than half an Earth
        // circumference without descending is effectively orbital for this
        // suborbital targeting test.
        if (state.x > INDIAN_OCEAN_TARGET_X + Math.PI * EARTH_RADIUS_METERS && state.vz >= 0) {
            break;
        }
    }

    const rangeError = impactX === null ? Infinity : impactX - INDIAN_OCEAN_TARGET_X;
    const altitudeShortfall = Math.max(0, altitudeTarget - maxAltitude);
    const mainFuelFraction = mainPropellant / Math.max(initialMainPropellant, 1);
    const totalFuelRemaining = mainPropellant + headerPropellant;
    const fuelRemainingPercent = 100 * totalFuelRemaining / Math.max(initialTotalPropellant, 1);
    const success =
        !numericalFailure &&
        impactX !== null &&
        Math.abs(rangeError) <= 300000 &&
        altitudeShortfall <= 3000 &&
        mainFuelFraction >= flightControlState.hotstageFuelReserveFraction * 0.8;
    const score =
        (Number.isFinite(rangeError) ? Math.abs(rangeError) / 1000 : 100000) +
        (altitudeShortfall / 1000) * 40 +
        (mainFuelFraction < flightControlState.hotstageFuelReserveFraction * 0.8 ? 50000 : 0) +
        (numericalFailure ? 100000 : 0) -
        fuelRemainingPercent * 4;

    return {
        ...candidate,
        success,
        score,
        maxAltitude,
        impactX,
        rangeError,
        fuelRemainingPercent,
        mainFuelFraction,
        burnTime,
        duration: time,
        engineEverCutOff,
        numericalFailure,
    };
}

function renderHotstageOptimizationResults(results) {
    const ranked = [...results].sort((left, right) => {
        if (left.success !== right.success) return left.success ? -1 : 1;
        if (left.success && right.success) {
            return right.fuelRemainingPercent - left.fuelRemainingPercent || Math.abs(left.rangeError) - Math.abs(right.rangeError);
        }
        return left.score - right.score;
    });
    setBestHotstageOptimizationResult(ranked.find((result) => result.success) ?? null);
    const visible = ranked.slice(0, 8);
    hotstageOptimizationResults.hidden = false;
    hotstageOptimizationResults.innerHTML = `
        <table>
            <thead><tr><th>Resultado</th><th>Potência</th><th>Rampa</th><th>Pitch</th><th>Ápice</th><th>Erro Índico</th><th>Combustível</th></tr></thead>
            <tbody>${visible.map((result, index) => `
                <tr>
                    <td>${index === 0 ? "MELHOR · " : ""}${result.success ? "APROVADO" : "NÃO ATENDE"}</td>
                    <td>${(result.throttle * 100).toFixed(1)}%</td>
                    <td>${result.altitudeRampRate.toFixed(0)} m/s</td>
                    <td>${result.pitchBiasMaxDeg.toFixed(1)}°</td>
                    <td>${(result.maxAltitude / 1000).toFixed(1)} km</td>
                    <td>${Number.isFinite(result.rangeError) ? `${result.rangeError >= 0 ? "+" : ""}${(result.rangeError / 1000).toFixed(0)} km` : "sem impacto"}</td>
                    <td>${result.fuelRemainingPercent.toFixed(1)}%</td>
                </tr>`).join("")}</tbody>
        </table>`;
    applyHotstageOptimizationBtn.disabled = started || !bestHotstageOptimizationResult;
    return ranked;
}

async function runHotstageOptimization() {
    if (started || (!isStackHotstageBoostbackProgramSelected() && !isSuborbitalMissionProgramSelected())) return;

    const altitudeTarget = clamp(Number(flightProgramHotstageAltitudeInput.value) || 180000, 60000, 800000);
    const candidates = createHotstageOptimizationCandidates();
    const results = [];
    setBestHotstageOptimizationResult(null);
    runHotstageOptimizationBtn.disabled = true;
    applyHotstageOptimizationBtn.disabled = true;
    hotstageOptimizationResults.hidden = true;

    for (let index = 0; index < candidates.length; index += 1) {
        results.push(simulateHotstageOptimizationCandidate(candidates[index], altitudeTarget));
        hotstageOptimizationStatus.textContent = `Simulando combinação ${index + 1}/${candidates.length}…`;
        if (index % 4 === 3) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    const ranked = renderHotstageOptimizationResults(results);
    const approvedCount = ranked.filter((result) => result.success).length;
    const best = ranked[0];
    hotstageOptimizationStatus.textContent = best && approvedCount > 0
        ? `${results.length} combinações testadas · ${approvedCount} aprovadas · melhor: ${(best.throttle * 100).toFixed(1)}% de potência, ${best.altitudeRampRate.toFixed(0)} m/s e ${best.pitchBiasMaxDeg.toFixed(1)}°.`
        : best
            ? `${results.length} combinações testadas · nenhuma atende altitude, alcance e reserva simultaneamente. Melhor aproximação não aplicável: ${(best.throttle * 100).toFixed(1)}%.`
        : "O ensaio não produziu resultados.";
    runHotstageOptimizationBtn.disabled = false;
}

function applyBestHotstageOptimization() {
    if (!bestHotstageOptimizationResult || started) return;
    flightControlState.hotstageThrottle = bestHotstageOptimizationResult.throttle;
    flightControlState.hotstageAltitudeRampRate = bestHotstageOptimizationResult.altitudeRampRate;
    flightControlState.hotstagePitchBiasMaxDeg = bestHotstageOptimizationResult.pitchBiasMaxDeg;
    flightProgramHotstageThrottleInput.value = String(flightControlState.hotstageThrottle * 100);
    flightProgramHotstageRampInput.value = String(flightControlState.hotstageAltitudeRampRate);
    flightProgramHotstagePitchBiasInput.value = String(flightControlState.hotstagePitchBiasMaxDeg);
    syncOperationMode();
    hotstageOptimizationStatus.textContent = `Melhor ajuste aplicado ao Flight Director: ${(flightControlState.hotstageThrottle * 100).toFixed(1)}%, rampa ${flightControlState.hotstageAltitudeRampRate.toFixed(0)} m/s, pitch ${flightControlState.hotstagePitchBiasMaxDeg.toFixed(1)}°.`;
}

function createBoosterOptimizationCandidates() {
    const throttleValues = [0.80, 0.90, 1];
    const flipAngleValues = [95, 110, 125, 140];
    const inboundVelocityValues = [900, 1200, 1500];
    const burnDurationValues = [120, 160, 200];
    const recoveryThrustValues = [0.72, 0.84];
    const candidates = [];

    for (const throttle of throttleValues) {
        for (const flipAngleDeg of flipAngleValues) {
            for (const inboundVelocityLimit of inboundVelocityValues) {
                for (const boostbackMaxDuration of burnDurationValues) {
                    for (const recoveryThrustFraction of recoveryThrustValues) {
                        candidates.push({ throttle, flipAngleDeg, inboundVelocityLimit, boostbackMaxDuration, recoveryThrustFraction });
                    }
                }
            }
        }
    }

    candidates.push({
        throttle: flightControlState.boosterBoostbackThrottle,
        flipAngleDeg: flightControlState.boosterFlipAngleDeg,
        inboundVelocityLimit: flightControlState.boosterInboundVelocityLimit,
        boostbackMaxDuration: flightControlState.boosterBoostbackMaxDuration,
        recoveryThrustFraction: flightControlState.boosterRecoveryThrustFraction,
    });
    const unique = new Map();
    candidates.forEach((candidate) => {
        const key = `${candidate.throttle.toFixed(4)}:${candidate.flipAngleDeg}:${candidate.inboundVelocityLimit}:${candidate.boostbackMaxDuration}:${candidate.recoveryThrustFraction.toFixed(4)}`;
        unique.set(key, candidate);
    });
    return [...unique.values()];
}

function simulateBoosterOptimizationCandidate(candidate) {
    const profile = shipRegistry.superheavy_b7;
    const propulsion = propulsionOverrides.get(profile.id) ?? profile.propulsion;
    const controller = profile.createController();
    const initialPropellant = propulsion.tanks.main.loxKg + propulsion.tanks.main.lch4Kg;
    const maxThrust = propulsion.engines.count * propulsion.engines.thrustN;
    const massFlowAtFullThrust = maxThrust / (propulsion.engines.specificImpulseSeconds * 9.80665);
    const initialSpeed = 5800 / 3.6;
    const initialPitch = Math.PI / 3;
    const separationImpulse = 3.5;
    const state = {
        x: 65000,
        z: 60000,
        vx: initialSpeed * Math.sin(initialPitch) - Math.sin(initialPitch) * separationImpulse,
        vz: initialSpeed * Math.cos(initialPitch) - Math.cos(initialPitch) * separationImpulse,
        a: initialPitch,
        w: 0,
        noseFlap: 0.1,
        tailFlap: 0.1,
        rcs: 0,
        gimbal: 0,
        throttle: 0,
    };
    const director = {
        profile: FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK,
        boosterBoostbackThrottle: candidate.throttle,
        boosterFlipAngleDeg: candidate.flipAngleDeg,
        boosterInboundVelocityLimit: candidate.inboundVelocityLimit,
        boosterBoostbackMaxDuration: candidate.boostbackMaxDuration,
        boosterRecoveryThrustFraction: candidate.recoveryThrustFraction,
    };
    const platformLink = {
        routeLocked: true,
        linkAccepted: true,
        available: true,
        platformId: "mecazilla_olp_a",
        linkedShipId: profile.id,
        captureX: TOWER_WORLD_X,
        captureZ: TOWER_CAPTURE_ALTITUDE,
        approachX: -Math.cos(Math.PI / 4) * 200,
        approachZ: TOWER_CAPTURE_ALTITUDE + Math.sin(Math.PI / 4) * 200,
        approachTolerance: 80,
        guidancePhase: "final",
        approachReached: true,
        readyToClose: true,
        shutdownAuthorized: false,
        recommendedFlipAltitude: 5000,
    };
    let propellant = initialPropellant;
    let time = 0;
    let burnTime = 0;
    let maxAltitude = state.z;
    let closest = null;
    let success = false;
    let numericalFailure = false;

    controller.reset();
    controller.applyFlightDirector(director);

    while (time < 1800) {
        const dt = state.z < 8000 ? 0.025 : state.z < 80000 ? 0.08 : 0.2;
        const mass = profile.mass + propellant;
        const relativeVx = state.vx - environment.wind.x;
        const relativeVz = state.vz - environment.wind.z;
        const airspeed = Math.hypot(relativeVx, relativeVz) + 0.01;
        const q = 0.5 * rho(state.z) * airspeed * airspeed;
        const navSnapshot = { ...state, q, airSpeed: airspeed };
        const sensorsSnapshot = {
            airdata: { dynamicPressure: q },
            platformLink,
            towerLink: platformLink,
        };
        const command = controller.update(dt, navSnapshot, sensorsSnapshot, {
            started: true,
            mass,
            maxThrust,
            g: G,
            targetX: TOWER_WORLD_X,
            targetZ: TOWER_CAPTURE_ALTITUDE,
            captureHeight: TOWER_CAPTURE_ALTITUDE,
            captureMode: true,
            linkedMode: true,
            stackAttached: false,
            boostbackReturn: true,
            detachedReturn: false,
            windX: environment.wind.x,
            actuators: { flapLift: 1, flapTorque: 1, rcs: 1, tvc: 1 },
            platformId: platformLink.platformId,
            shipId: profile.id,
            flightDirector: director,
        });

        state.noseFlap = moveToward(state.noseFlap, command.noseTarget ?? command.noseFlap ?? 0, command.flapRate ?? 2.8, dt);
        state.tailFlap = moveToward(state.tailFlap, command.tailTarget ?? command.tailFlap ?? 0, command.flapRate ?? 2.8, dt);
        state.rcs = moveToward(state.rcs, command.rcsTarget ?? command.rcs ?? 0, 7.5, dt);
        state.gimbal = moveToward(state.gimbal, command.engineOn ? command.gimbalTarget ?? command.gimbal ?? 0 : 0, 2.8, dt);
        state.throttle = moveToward(state.throttle, command.engineOn ? command.throttleTarget ?? command.throttle ?? 0 : 0, 1.6, dt);

        let thrustFraction = propellant > 0 ? state.throttle : 0;
        const requestedPropellant = massFlowAtFullThrust * thrustFraction * dt;
        if (requestedPropellant > propellant && requestedPropellant > 0) {
            thrustFraction *= propellant / requestedPropellant;
        }
        const consumedPropellant = Math.min(propellant, requestedPropellant);
        propellant -= consumedPropellant;
        if (thrustFraction > 0.001) burnTime += dt * thrustFraction;

        const flowAngle = Math.atan2(-relativeVx, -relativeVz);
        const aoa = wrapAngle(state.a - flowAngle);
        const flapAverage = 0.5 * (state.noseFlap + state.tailFlap);
        const flapDifferential = state.tailFlap - state.noseFlap;
        const dragArea = 78 + 160 * Math.abs(Math.sin(aoa)) + 90 * flapAverage;
        const dragMagnitude = Cd * q * dragArea;
        const dragX = -dragMagnitude * relativeVx / airspeed;
        const dragZ = -dragMagnitude * relativeVz / airspeed;
        const finLiftMagnitude = q * 145 * flapDifferential;
        const finLiftX = -finLiftMagnitude * relativeVz / airspeed;
        const finLiftZ = finLiftMagnitude * relativeVx / airspeed;
        const thrustMagnitude = maxThrust * thrustFraction;
        const thrustAngle = state.a + state.gimbal;
        const thrustX = thrustMagnitude * Math.sin(thrustAngle);
        const thrustZ = thrustMagnitude * Math.cos(thrustAngle);

        const aeroBlend = clamp(q / 5200, 0, 1);
        const rcsTorque = state.rcs * 5.2 * (1 - aeroBlend * 0.9);
        const aeroTorque = aeroBlend * (-aoa * 4.1 + flapDifferential * 8.2 - state.w * 1.45);
        const tvcTorque = thrustFraction > 0.001
            ? clamp(state.gimbal / MAX_GIMBAL, -1, 1) * (2.2 + state.throttle * 3.8)
            : 0;
        physicsCore.step(state, dt, {
            mass,
            forceX: thrustX + dragX + finLiftX,
            forceZ: thrustZ + dragZ + finLiftZ,
            angularAcceleration: rcsTorque + aeroTorque + tvcTorque - state.w * 0.32,
        });
        time += dt;
        maxAltitude = Math.max(maxAltitude, state.z);

        if (!physicsCore.isFinite(state)) {
            numericalFailure = true;
            break;
        }

        if (state.z < 2200) {
            const sample = {
                x: state.x,
                z: state.z,
                vx: state.vx,
                vz: state.vz,
                angle: wrapAngle(state.a),
            };
            const metric =
                Math.abs(sample.x - TOWER_WORLD_X) / 14 +
                Math.abs(sample.z - TOWER_CAPTURE_ALTITUDE) / 8 +
                Math.abs(sample.vx) / 3 +
                Math.abs(sample.vz) / 3 +
                Math.abs(sample.angle) / 0.14;
            if (!closest || metric < closest.metric) closest = { ...sample, metric };
            success =
                Math.abs(sample.x - TOWER_WORLD_X) <= 14 &&
                Math.abs(sample.z - TOWER_CAPTURE_ALTITUDE) <= 8 &&
                Math.abs(sample.vx) <= 3 &&
                Math.abs(sample.vz) <= 3 &&
                Math.abs(sample.angle) <= 0.14;
            if (success) break;
        }

        if (state.z <= 0 || (propellant <= 0 && state.z < 1000 && state.vz < 0)) break;
    }

    const capture = closest ?? {
        x: state.x,
        z: state.z,
        vx: state.vx,
        vz: state.vz,
        angle: wrapAngle(state.a),
        metric: 100000,
    };
    const fuelRemainingPercent = 100 * propellant / Math.max(initialPropellant, 1);
    const score = capture.metric + (propellant <= 0 ? 50000 : 0) + (numericalFailure ? 100000 : 0);
    return {
        ...candidate,
        success: success && !numericalFailure && propellant > 0,
        score,
        capture,
        fuelRemainingPercent,
        maxAltitude,
        burnTime,
        duration: time,
        numericalFailure,
    };
}

function renderBoosterOptimizationResults(results) {
    const ranked = [...results].sort((left, right) => {
        if (left.success !== right.success) return left.success ? -1 : 1;
        if (left.success && right.success) {
            return right.fuelRemainingPercent - left.fuelRemainingPercent || left.score - right.score;
        }
        return left.score - right.score;
    });
    setBestBoosterOptimizationResult(ranked.find((result) => result.success) ?? null);
    boosterOptimizationResults.hidden = false;
    boosterOptimizationResults.innerHTML = `
        <table>
            <thead><tr><th>Resultado</th><th>Boostback</th><th>Flip</th><th>VX limite</th><th>Duração</th><th>Terminal</th><th>ΔX</th><th>VX / VZ</th><th>Combustível</th></tr></thead>
            <tbody>${ranked.slice(0, 8).map((result, index) => `
                <tr>
                    <td>${index === 0 ? "MELHOR · " : ""}${result.success ? "CAPTURÁVEL" : "FORA DA JANELA"}</td>
                    <td>${(result.throttle * 100).toFixed(1)}%</td>
                    <td>${result.flipAngleDeg.toFixed(0)}°</td>
                    <td>${result.inboundVelocityLimit.toFixed(0)} m/s</td>
                    <td>${result.boostbackMaxDuration.toFixed(0)} s</td>
                    <td>${(result.recoveryThrustFraction * 100).toFixed(0)}%</td>
                    <td>${(result.capture.x - TOWER_WORLD_X).toFixed(1)} m</td>
                    <td>${result.capture.vx.toFixed(1)} / ${result.capture.vz.toFixed(1)} m/s</td>
                    <td>${result.fuelRemainingPercent.toFixed(1)}%</td>
                </tr>`).join("")}</tbody>
        </table>`;
    applyBoosterOptimizationBtn.disabled = started || !bestBoosterOptimizationResult;
    return ranked;
}

async function runBoosterOptimization() {
    if (started || (!isStackHotstageBoostbackProgramSelected() && !isSuborbitalMissionProgramSelected())) return;
    const candidates = createBoosterOptimizationCandidates();
    const results = [];
    setBestBoosterOptimizationResult(null);
    runBoosterOptimizationBtn.disabled = true;
    applyBoosterOptimizationBtn.disabled = true;
    boosterOptimizationResults.hidden = true;

    for (let index = 0; index < candidates.length; index += 1) {
        results.push(simulateBoosterOptimizationCandidate(candidates[index]));
        boosterOptimizationStatus.textContent = `Simulando retorno B7 ${index + 1}/${candidates.length}…`;
        if (index % 4 === 3) await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const ranked = renderBoosterOptimizationResults(results);
    const approvedCount = ranked.filter((result) => result.success).length;
    const best = ranked[0];
    boosterOptimizationStatus.textContent = best && approvedCount > 0
        ? `${results.length} combinações testadas · ${approvedCount} capturáveis · melhor: ${(best.throttle * 100).toFixed(1)}%, flip ${best.flipAngleDeg.toFixed(0)}°, VX ${best.inboundVelocityLimit.toFixed(0)} m/s, ${best.boostbackMaxDuration.toFixed(0)} s, terminal ${(best.recoveryThrustFraction * 100).toFixed(0)}%.`
        : best
            ? `${results.length} combinações testadas · nenhuma entrou em toda a janela de captura. Melhor aproximação não aplicável: ΔX ${(best.capture.x - TOWER_WORLD_X).toFixed(1)} m, VX ${best.capture.vx.toFixed(1)} m/s, VZ ${best.capture.vz.toFixed(1)} m/s.`
            : "O ensaio do B7 não produziu resultados.";
    runBoosterOptimizationBtn.disabled = false;
}

function applyBestBoosterOptimization() {
    if (!bestBoosterOptimizationResult || started) return;
    flightControlState.boosterBoostbackThrottle = bestBoosterOptimizationResult.throttle;
    flightControlState.boosterFlipAngleDeg = bestBoosterOptimizationResult.flipAngleDeg;
    flightControlState.boosterInboundVelocityLimit = bestBoosterOptimizationResult.inboundVelocityLimit;
    flightControlState.boosterBoostbackMaxDuration = bestBoosterOptimizationResult.boostbackMaxDuration;
    flightControlState.boosterRecoveryThrustFraction = bestBoosterOptimizationResult.recoveryThrustFraction;
    flightProgramBoosterThrottleInput.value = String(flightControlState.boosterBoostbackThrottle * 100);
    flightProgramBoosterFlipAngleInput.value = String(flightControlState.boosterFlipAngleDeg);
    flightProgramBoosterInboundVelocityInput.value = String(flightControlState.boosterInboundVelocityLimit);
    flightProgramBoosterBurnDurationInput.value = String(flightControlState.boosterBoostbackMaxDuration);
    flightProgramBoosterRecoveryThrustInput.value = String(flightControlState.boosterRecoveryThrustFraction * 100);
    syncOperationMode();
    boosterOptimizationStatus.textContent = `Ajuste B7 aplicado ao Flight Director: ${(flightControlState.boosterBoostbackThrottle * 100).toFixed(1)}%, flip ${flightControlState.boosterFlipAngleDeg.toFixed(0)}°, VX ${flightControlState.boosterInboundVelocityLimit.toFixed(0)} m/s, ${flightControlState.boosterBoostbackMaxDuration.toFixed(0)} s, terminal ${(flightControlState.boosterRecoveryThrustFraction * 100).toFixed(0)}%.`;
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

function buildFlightControlLinkEnv() {
    // Read the tower panel at the point the platform controller is evaluated.
    // The panel is the source of truth for the waypoint; this avoids retaining
    // a previous value until an input happens to lose focus.
    const approachConfig = readTowerApproachConfig();

    return {
        targetX: TOWER_WORLD_X,
        failures: towerFailureConfig,
        falseAuthorizationActive: falseTowerAuthorizationActive,
        approachDistance: approachConfig.distance,
        approachAngleDeg: approachConfig.angleDeg,
        approachTolerance: approachConfig.tolerance,
        uplinkOverride: getProtocolOverride("uplink"),
        downlinkOverride: getProtocolOverride("downlink"),
        machineInputs: {
            ...platformMachineInputs,
        },
    };
}

function syncProtocolStateFromSnapshot(snapshot) {
    const bus = snapshot?.bus ?? {};
    const platform = snapshot?.platform ?? {};

    protocolState.shipUplinkRaw = bus.uplinkRaw ?? {};
    protocolState.shipUplinkEffective = bus.uplinkTransmitted ?? {};
    protocolState.platformUplinkReceived = bus.uplinkReceivedByPlatform ?? {};
    protocolState.platformDownlinkRaw = platform.deliveredBase ?? {};
    protocolState.platformDownlinkEffective = bus.downlinkDelivered ?? {};
    protocolState.shipDownlinkReceived = bus.downlinkReceivedByShip ?? {};
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

function getProtocolDirectionConfig(direction) {
    return protocolDefinition[direction];
}

function getProtocolSignalDefinition(direction, key) {
    return getProtocolDirectionConfig(direction).signals.find((signal) => signal.key === key) ?? null;
}

function getProtocolWidgets(direction) {
    if (direction === "uplink") {
        return {
            enabled: protocolUplinkOverrideEnabled,
            editor: protocolUplinkOverrideText,
            monitor: protocolUplinkView,
            deliveryStatus: protocolUplinkDeliveryStatus,
            signalSelect: protocolUplinkSignalSelect,
            signalValueInput: protocolUplinkSignalValueInput,
        };
    }

    return {
        enabled: protocolDownlinkOverrideEnabled,
        editor: protocolDownlinkOverrideText,
        monitor: protocolDownlinkView,
        deliveryStatus: protocolDownlinkDeliveryStatus,
        signalSelect: protocolDownlinkSignalSelect,
        signalValueInput: protocolDownlinkSignalValueInput,
    };
}

function formatProtocolValue(value) {
    if (typeof value === "number") {
        return Number.isInteger(value) ? String(value) : value.toFixed(3);
    }

    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }

    return String(value);
}

function compareProtocolValues(expected, received) {
    if (typeof expected === "number" && typeof received === "number") {
        return Math.abs(expected - received) < 1e-9;
    }

    return JSON.stringify(expected) === JSON.stringify(received);
}

function buildProtocolDeliveryReport(direction, transmittedPacket, receivedPacket) {
    const override = getProtocolOverride(direction);

    if (!isLinkedMode()) {
        return "Stand-alone: enlace externo inativo.";
    }

    if (!flightController.isRouteLocked()) {
        return "Enlace desarmado pelo controlador de voo.";
    }

    if (!override.enabled) {
        return "Canal nominal roteado.";
    }

    if (override.error) {
        return override.error;
    }

    const forcedKeys = Object.keys(override.patch);

    if (forcedKeys.length === 0) {
        return "Override ativo, mas sem sinais forçados.";
    }

    const delivered = forcedKeys.filter((key) => compareProtocolValues(transmittedPacket?.[key], receivedPacket?.[key]));
    const missing = forcedKeys.filter((key) => !delivered.includes(key));

    if (missing.length === 0) {
        return `Entrega confirmada ${delivered.length}/${forcedKeys.length}: ${delivered.join(", ")}`;
    }

    return `Entrega parcial ${delivered.length}/${forcedKeys.length}. Divergentes: ${missing.join(", ")}`;
}

function formatProtocolPacket(direction) {
    const packet =
        direction === "uplink"
            ? {
                  origem: protocolState.shipUplinkRaw,
                  transmitido: protocolState.shipUplinkEffective,
                  recebido: protocolState.platformUplinkReceived,
              }
            : {
                  origem: protocolState.platformDownlinkRaw,
                  transmitido: protocolState.platformDownlinkEffective,
                  recebido: protocolState.shipDownlinkReceived,
              };

    return JSON.stringify(packet, null, 2);
}

function buildProtocolSignalLabel(signal) {
    const typeLabel = signal.group === "discrete" ? "D" : "A";
    const unit = signal.unit ? ` ${signal.unit}` : "";
    return `${typeLabel} | ${signal.key}${unit}`;
}

function buildProtocolSpecMarkup(direction) {
    const config = getProtocolDirectionConfig(direction);
    const analogSignals = config.signals.filter((signal) => signal.group === "analog");
    const discreteSignals = config.signals.filter((signal) => signal.group === "discrete");

    const renderSignals = (signals) =>
        signals
            .map((signal) => `<div><strong>${signal.key}</strong>${signal.unit ? ` [${signal.unit}]` : ""}: ${signal.description}</div>`)
            .join("");

    return `
        <div class="panelTitle">${config.label}</div>
        <div><strong>Quadro:</strong> ${config.frame}</div>
        <div><strong>Origem:</strong> ${config.source}</div>
        <div><strong>Destino:</strong> ${config.destination}</div>
        <div><strong>Analógicos:</strong></div>
        ${renderSignals(analogSignals)}
        <div style="margin-top:8px;"><strong>Discretos:</strong></div>
        ${renderSignals(discreteSignals)}
    `;
}

function updateProtocolSpecView() {
    const rulesMarkup = protocolDefinition.operatingRules.map((rule) => `<div>${rule}</div>`).join("");

    protocolSpecView.innerHTML = `
        <div class="panelTitle">${protocolDefinition.title} (${protocolDefinition.name} v${protocolDefinition.version})</div>
        ${rulesMarkup}
        <div style="margin-top:8px;">${buildProtocolSpecMarkup("uplink")}</div>
        <div style="margin-top:10px;">${buildProtocolSpecMarkup("downlink")}</div>
    `;
}

function populateProtocolSignalSelect(direction) {
    const { signalSelect } = getProtocolWidgets(direction);
    const config = getProtocolDirectionConfig(direction);
    signalSelect.innerHTML = config.signals
        .map((signal) => `<option value="${signal.key}">${buildProtocolSignalLabel(signal)}</option>`)
        .join("");
}

function updateProtocolSignalInputHint(direction) {
    const { signalSelect, signalValueInput } = getProtocolWidgets(direction);
    const signal = getProtocolSignalDefinition(direction, signalSelect.value);

    if (!signal) {
        signalValueInput.placeholder = "valor";
        return;
    }

    switch (signal.type) {
        case "boolean":
            signalValueInput.placeholder = "true | false";
            break;
        case "number":
            signalValueInput.placeholder = signal.unit ? `numero em ${signal.unit}` : "numero";
            break;
        default:
            signalValueInput.placeholder = "texto";
            break;
    }
}

function validateProtocolSignalValue(signal, value) {
    switch (signal.type) {
        case "boolean":
            return typeof value === "boolean";
        case "number":
            return typeof value === "number" && Number.isFinite(value);
        case "string":
            return typeof value === "string";
        default:
            return false;
    }
}

function validateProtocolPatch(direction, patch) {
    const config = getProtocolDirectionConfig(direction);
    const signalMap = new Map(config.signals.map((signal) => [signal.key, signal]));
    const normalizedPatch = {};

    for (const [key, value] of Object.entries(patch)) {
        const signal = signalMap.get(key);

        if (!signal) {
            return {
                ok: false,
                error: `Sinal desconhecido para ${direction}: ${key}`,
            };
        }

        if (!validateProtocolSignalValue(signal, value)) {
            return {
                ok: false,
                error: `Tipo invalido para ${key}. Esperado: ${signal.type}.`,
            };
        }

        normalizedPatch[key] = value;
    }

    return {
        ok: true,
        value: normalizedPatch,
    };
}

function coerceProtocolSignalValue(direction, key, rawValue) {
    const signal = getProtocolSignalDefinition(direction, key);

    if (!signal) {
        return {
            ok: false,
            error: `Sinal desconhecido: ${key}`,
        };
    }

    const trimmed = rawValue.trim();

    if (!trimmed && signal.type !== "string") {
        return {
            ok: false,
            error: `Informe um valor para ${key}.`,
        };
    }

    if (signal.type === "boolean") {
        const normalized = trimmed.toLowerCase();

        if (["true", "1", "sim", "verdadeiro", "on"].includes(normalized)) {
            return { ok: true, value: true };
        }

        if (["false", "0", "nao", "não", "falso", "off"].includes(normalized)) {
            return { ok: true, value: false };
        }

        return {
            ok: false,
            error: `Valor booleano invalido para ${key}. Use true/false.`,
        };
    }

    if (signal.type === "number") {
        const normalized = trimmed.replace(",", ".");
        const numericValue = Number(normalized);

        if (!Number.isFinite(numericValue)) {
            return {
                ok: false,
                error: `Valor numerico invalido para ${key}.`,
            };
        }

        return {
            ok: true,
            value: numericValue,
        };
    }

    return {
        ok: true,
        value: rawValue,
    };
}

function tryParseProtocolPatch(text) {
    const trimmed = text.trim();

    if (!trimmed) {
        return {
            ok: true,
            value: {},
        };
    }

    try {
        const value = JSON.parse(trimmed);

        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return {
                ok: false,
                error: "Override deve ser um objeto JSON.",
            };
        }

        return {
            ok: true,
            value,
        };
    } catch (error) {
        return {
            ok: false,
            error: `JSON inválido: ${error.message}`,
        };
    }
}

function getProtocolOverride(direction) {
    const { enabled, editor } = getProtocolWidgets(direction);
    const stateKey = direction === "uplink" ? "uplinkError" : "downlinkError";

    if (!enabled.checked) {
        protocolState[stateKey] = "";
        return {
            enabled: false,
            patch: {},
            error: "",
        };
    }

    const parsed = tryParseProtocolPatch(editor.value);

    if (!parsed.ok) {
        protocolState[stateKey] = parsed.error;
        return {
            enabled: true,
            patch: {},
            error: parsed.error,
        };
    }

    const validated = validateProtocolPatch(direction, parsed.value);

    if (!validated.ok) {
        protocolState[stateKey] = validated.error;
        return {
            enabled: true,
            patch: {},
            error: validated.error,
        };
    }

    protocolState[stateKey] = "";
    return {
        enabled: true,
        patch: validated.value,
        error: "",
    };
}

function applyProtocolPatch(direction, packet) {
    const override = getProtocolOverride(direction);

    if (!override.enabled || override.error) {
        return packet;
    }

    return {
        ...packet,
        ...override.patch,
    };
}

function refreshProtocolTransport() {
    if (!nav || !sensors) {
        updateProtocolViews();
        return;
    }

    refreshPlatformState(0);

    if (sensors.platformLink) {
        setSensorValue(sensors.platformLink, samplePlatformLink());
    }

    updateCaptureStatus();
}

function applySingleProtocolSignalOverride(direction) {
    const { enabled, editor, signalSelect, signalValueInput } = getProtocolWidgets(direction);
    const signalKey = signalSelect.value;
    const coercedValue = coerceProtocolSignalValue(direction, signalKey, signalValueInput.value);
    const stateKey = direction === "uplink" ? "uplinkError" : "downlinkError";

    if (!coercedValue.ok) {
        protocolState[stateKey] = coercedValue.error;
        updateProtocolViews();
        return;
    }

    const parsed = tryParseProtocolPatch(editor.value);
    let basePatch = {};

    if (parsed.ok) {
        const validated = validateProtocolPatch(direction, parsed.value);

        if (validated.ok) {
            basePatch = validated.value;
        }
    }

    const nextPatch = {
        ...basePatch,
        [signalKey]: coercedValue.value,
    };

    editor.value = JSON.stringify(nextPatch, null, 2);
    enabled.checked = true;
    protocolState[stateKey] = "";
    refreshProtocolTransport();
}

function clearProtocolOverride(direction) {
    const { enabled, editor, signalValueInput } = getProtocolWidgets(direction);
    const stateKey = direction === "uplink" ? "uplinkError" : "downlinkError";

    enabled.checked = false;
    editor.value = "{}";
    signalValueInput.value = "";
    protocolState[stateKey] = "";
    refreshProtocolTransport();
}

function updateProtocolStatus() {
    const modeLabel = `${flightControlState.controllerId} | ${getSelectedShipProfile().callsign} -> ${getSelectedPlatformProfile().label}`;
    const routeLabel = getFlightControlRouteActive()
        ? "enlace travado"
        : flightController.isRouteLocked()
          ? "aguardando linked mode"
          : "enlace desarmado";
    const feedbackLabel =
        flightControlState.shipFeedbackMode === "platform_isolated"
            ? "retorno isolado"
            : "malha fechada";
    const uplinkLabel = buildProtocolDeliveryReport(
        "uplink",
        protocolState.shipUplinkEffective,
        protocolState.platformUplinkReceived
    );
    const downlinkLabel = buildProtocolDeliveryReport(
        "downlink",
        protocolState.platformDownlinkEffective,
        protocolState.shipDownlinkReceived
    );

    protocolStatus.textContent = `${modeLabel} | ${routeLabel} | ${feedbackLabel} | uplink: ${uplinkLabel} | downlink: ${downlinkLabel}`;
}

function updateProtocolViews() {
    protocolUplinkView.textContent = formatProtocolPacket("uplink");
    protocolDownlinkView.textContent = formatProtocolPacket("downlink");
    protocolUplinkDeliveryStatus.textContent = buildProtocolDeliveryReport(
        "uplink",
        protocolState.shipUplinkEffective,
        protocolState.platformUplinkReceived
    );
    protocolDownlinkDeliveryStatus.textContent = buildProtocolDeliveryReport(
        "downlink",
        protocolState.platformDownlinkEffective,
        protocolState.shipDownlinkReceived
    );
    updateProtocolStatus();
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
const telemetryStore = new window.StarshipTelemetryStore(timeScroll);
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

+// Compatibility bridge while the renderer is migrated from classic scripts to modules.
// Stateful values use accessors so the renderer always observes the live mission.
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

speedButtons.forEach((button) => {
    button.addEventListener("click", () => {
        sim = Number(button.dataset.speed);
        updateSimulationSpeedUI();
    });
});

toggleHudBtn.addEventListener("click", () => {
    const isCollapsed = hud.classList.toggle("is-collapsed");
    toggleHudBtn.textContent = isCollapsed ? "›" : "‹";
    toggleHudBtn.title = isCollapsed ? "Expandir menu" : "Recolher menu";
    toggleHudBtn.setAttribute("aria-expanded", String(!isCollapsed));
});

toggleTelemetryHudStyleBtn.addEventListener("click", () => {
    telemetryHudStyle = telemetryHudStyle === "engineering" ? "spacex" : "engineering";
    toggleTelemetryHudStyleBtn.textContent = telemetryHudStyle === "spacex" ? "HUD: Engenharia" : "HUD: SpaceX";
});

bindModal(protocolModal, openProtocolModalBtn, closeProtocolModalBtn);
bindModal(telemetryModal, openTelemetryModalBtn, closeTelemetryModalBtn);
bindModal(physicsModal, openPhysicsModalBtn, closePhysicsModalBtn);
bindModal(shipModal, openShipModalBtn, closeShipModalBtn);
bindModal(towerModal, openTowerModalBtn, closeTowerModalBtn);
bindModal(terraMapModal, openTerraMapBtn, closeTerraMapModalBtn);
initializeModalPosition(protocolModal, 520, 120);
initializeModalPosition(telemetryModal, 420, 56);
initializeModalPosition(physicsModal, Math.max(460, window.innerWidth - 520), 420);
initializeModalPosition(shipModal, 420, 56);
initializeModalPosition(towerModal, Math.max(460, window.innerWidth - 520), 88);
initializeModalPosition(terraMapModal, Math.max(16, (window.innerWidth - 1240) / 2), 28);
makeModalDraggable(protocolModal);
makeModalDraggable(telemetryModal);
makeModalDraggable(physicsModal);
makeModalDraggable(shipModal);
makeModalDraggable(towerModal);
makeModalDraggable(terraMapModal);
terraMapView = new window.TerraMapView({
    canvas: terraMapCanvas,
    input: terraMapTargetInput,
    applyButton: applyTerraMapTargetBtn,
    readout: terraMapReadout,
    onTarget: (targetX) => {
        if (isProbeSelected()) {
            if (!started && setProbePosition(targetX)) {
                sceneFocusX = targetX;
                terraMapView.setState(getTerraMapState());
            }
        } else if (!isLinkedMode()) {
            setLandingTarget(targetX);
            sceneFocusX = targetX;
            terraMapView.setState(getTerraMapState());
        }
    },
});

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeAllModals();
    }
    if (!probeManualRcsActive || !started || !isProbeSelected() || !probeManualRcsControlKeys.has(event.code)) {
        return;
    }
    const editingFormField =
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLInputElement && event.target !== probeManualRcsInput);
    if (editingFormField) {
        return;
    }
    event.preventDefault();
    probeManualRcsKeys.add(event.code);
    updateProbeManualRcsUI();
});

window.addEventListener("keyup", (event) => {
    if (probeManualRcsKeys.delete(event.code)) {
        updateProbeManualRcsUI();
    }
});

window.addEventListener("blur", () => {
    if (probeManualRcsKeys.size > 0) {
        probeManualRcsKeys.clear();
        updateProbeManualRcsUI();
    }
});

window.addEventListener("resize", () => {
    clampModalPosition(protocolModal);
    clampModalPosition(telemetryModal);
    clampModalPosition(physicsModal);
    clampModalPosition(shipModal);
    clampModalPosition(towerModal);
    clampModalPosition(terraMapModal);
});

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

startBtn.addEventListener("click", () => {
    if (started && !s.end) {
        return;
    }
    if (launchCountdownTimer !== null) return;
    const countdownSeconds = Math.max(0, Math.min(60, Number(launchCountdownInput.value) || 0));
    if (countdownSeconds === 0) {
        beginMissionAfterCountdown();
        return;
    }
    launchCountdownEndsAt = performance.now() + countdownSeconds * 1000;
    launchCountdownInput.disabled = true;
    startBtn.disabled = true;
    updateProbeDockingUI();
    updateLaunchCountdownButton();
    launchCountdownTimer = window.setTimeout(beginMissionAfterCountdown, countdownSeconds * 1000);
});

pauseBtn.addEventListener("click", () => {
    if (!started || s.end) {
        return;
    }

    paused = !paused;
});

exportBtn.addEventListener("click", exportTelemetry);
falseTowerAuthBtn.addEventListener("click", () => {
    if (!isLinkedMode()) {
        return;
    }

    falseTowerAuthorizationActive = !falseTowerAuthorizationActive;
    updateFalseTowerAuthUI();
    refreshPlatformState(0);

    if (sensors?.platformLink) {
        setSensorValue(sensors.platformLink, samplePlatformLink());
    }

    updateCaptureStatus();
});
toggleShipControllersBtn.addEventListener("click", () => {
    shipControllersSection.hidden = !shipControllersSection.hidden;
    toggleShipControllersBtn.textContent = shipControllersSection.hidden ? "Abrir controladores" : "Ocultar controladores";
    if (!shipControllersSection.hidden) updateShipGainPanel();
});
resetShipGainsBtn.addEventListener("click", () => {
    const controller = getSelectedShipController();

    if (!controller) {
        return;
    }

    controller.resetControlGains();
    updateShipGainPanel();
});
resetTargetBtn.addEventListener("click", () => {
    setLandingTarget(0);
});
openTerraMapBtn.addEventListener("click", () => {
    probeMapControls.hidden = !isProbeSelected();
    updateProbeManualRcsUI();
    updateProbeDockingUI();
    terraMapView.setState(getTerraMapState());
    updateVehicleTrajectoryPredictions();
});
setProbePositionBtn.addEventListener("click", () => setProbePosition(probeConfig.x));
simulateProbeTrajectoryBtn.addEventListener("click", simulateProbeTrajectory);
positionProbePairBtn.addEventListener("click", positionProbePair);
probeManualRcsInput.addEventListener("change", updateProbeManualRcsUI);
initialFlightTimeInput.addEventListener("input", () => {
    scene.setInitialStarbaseTime(initialFlightTimeInput.value);
});
focusStarbaseBtn.addEventListener("click", () => {
    sceneFocusX = STANDALONE_LAUNCH_WORLD_X;
});
operationModeSelect.addEventListener("change", syncOperationMode);
shipSelect.addEventListener("change", syncOperationMode);
platformSelect.addEventListener("change", syncOperationMode);
shipFeedbackModeSelect.addEventListener("change", syncOperationMode);
boosterRecoverySelect.addEventListener("change", syncOperationMode);
superHeavyAttachS24Input.addEventListener("change", () => {
    if (started || !isSuperHeavySelected()) return;
    stackMission.attachS24 = superHeavyAttachS24Input.checked;
    if (
        stackMission.attachS24 &&
        flightControlState.flightProgramProfile !== FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK &&
        flightControlState.flightProgramProfile !== FLIGHT_PROGRAM_PROFILES.SUBORBITAL_MISSION
    ) {
        flightControlState.flightProgramProfile = FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK;
        flightProgramProfileSelect.value = flightControlState.flightProgramProfile;
    }
    stackMission.separated = false;
    stackMission.boosterRecovery = null;
    stackMission.boostbackReturn = false;
    resetWaitingState();
    updateSuperHeavyStackPanel();
    updateFlightProgramStatus();
    persistFlightControlConfig();
});
flightProgramProfileSelect.addEventListener("change", syncOperationMode);
flightProgramAltitudeInput.addEventListener("change", syncOperationMode);
flightProgramHotstageAltitudeInput.addEventListener("change", syncOperationMode);
flightProgramHotstageThrottleInput.addEventListener("change", syncOperationMode);
flightProgramHotstageRampInput.addEventListener("change", syncOperationMode);
flightProgramHotstagePitchBiasInput.addEventListener("change", syncOperationMode);
flightProgramHotstageReserveInput.addEventListener("change", syncOperationMode);
flightProgramBoosterThrottleInput.addEventListener("change", syncOperationMode);
flightProgramBoosterFlipAngleInput.addEventListener("change", syncOperationMode);
flightProgramBoosterInboundVelocityInput.addEventListener("change", syncOperationMode);
flightProgramBoosterBurnDurationInput.addEventListener("change", syncOperationMode);
flightProgramBoosterRecoveryThrustInput.addEventListener("change", syncOperationMode);
flightProgramHoldInput.addEventListener("change", syncOperationMode);
flightProgramPostHoldSelect.addEventListener("change", syncOperationMode);
runHotstageOptimizationBtn.addEventListener("click", () => {
    runHotstageOptimization().catch((error) => {
        hotstageOptimizationStatus.textContent = `Falha no ensaio: ${error.message}`;
        runHotstageOptimizationBtn.disabled = false;
    });
});
applyHotstageOptimizationBtn.addEventListener("click", applyBestHotstageOptimization);
runBoosterOptimizationBtn.addEventListener("click", () => {
    runBoosterOptimization().catch((error) => {
        boosterOptimizationStatus.textContent = `Falha no ensaio B7: ${error.message}`;
        runBoosterOptimizationBtn.disabled = false;
    });
});
applyBoosterOptimizationBtn.addEventListener("click", applyBestBoosterOptimization);
toggleFlightRouteBtn.addEventListener("click", () => {
    flightControlState.routeLocked = !flightControlState.routeLocked;
    syncOperationMode();
});
abortBellyBtn.addEventListener("click", () => {
    if (!isLinkedMode() || !flightControlState.routeLocked) {
        return;
    }

    flightControlState.abortBelly = true;
    abortBellyBtn.textContent = "Abort Belly enviado";
    syncFlightControllerConfig();
    refreshPlatformState(0);
    if (sensors?.platformLink) {
        setSensorValue(sensors.platformLink, samplePlatformLink());
    }
    const abortAcknowledged = samplePlatformLink().abortBelly === true;
    abortBellyBtn.textContent = abortAcknowledged
        ? "Abort Belly confirmado no link"
        : "Abort Belly aguardando enlace";
});
toggleFlightControlDetailsBtn.addEventListener("click", () => {
    setFlightControlDetailsVisible(flightControlDetails.hidden);
});
towerLinkFailureSelect.addEventListener("change", syncTowerFailurePanel);
towerArmsFailureSelect.addEventListener("change", syncTowerFailurePanel);
[towerApproachDistanceInput, towerApproachAngleInput, towerApproachToleranceInput].forEach((input) => {
    const syncApproachPointFromPanel = () => {
        readTowerApproachConfig();
        refreshPlatformState(0);
    };

    input.addEventListener("input", syncApproachPointFromPanel);
    input.addEventListener("change", () => {
        syncApproachPointFromPanel();
        towerApproachDistanceInput.value = String(towerApproachConfig.distance);
        towerApproachAngleInput.value = String(towerApproachConfig.angleDeg);
        towerApproachToleranceInput.value = String(towerApproachConfig.tolerance);
    });
});
engineFailureSelect.addEventListener("change", syncFailurePanel);
rcsFailureSelect.addEventListener("change", syncFailurePanel);
flapFailureSelect.addEventListener("change", syncFailurePanel);
shipControlLoopView.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement) || !event.target.dataset.gainKey) {
        return;
    }

    handleShipGainInput(event.target, false);
});
shipControlLoopView.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || !event.target.dataset.gainKey) {
        return;
    }

    handleShipGainInput(event.target, true);
});

windXSlider.addEventListener("input", () => {
    environment.setWind({ x: Number(windXSlider.value) });
    windXLabel.textContent = environment.wind.x;
    markPhysicsCustom();
});

windZSlider.addEventListener("input", () => {
    environment.setWind({ z: Number(windZSlider.value) });
    windZLabel.textContent = environment.wind.z;
    markPhysicsCustom();
});

sn15PropulsionInputs.forEach((input) => {
    input.addEventListener("change", applySn15PropulsionPanelValues);
});

physicsPresetSelect.addEventListener("change", () => {
    applyPhysicsPreset(physicsPresetSelect.value);
});

protocolUplinkOverrideEnabled.addEventListener("change", refreshProtocolTransport);
protocolDownlinkOverrideEnabled.addEventListener("change", refreshProtocolTransport);
protocolUplinkOverrideText.addEventListener("input", refreshProtocolTransport);
protocolDownlinkOverrideText.addEventListener("input", refreshProtocolTransport);
protocolUplinkSignalSelect.addEventListener("change", () => {
    updateProtocolSignalInputHint("uplink");
});
protocolDownlinkSignalSelect.addEventListener("change", () => {
    updateProtocolSignalInputHint("downlink");
});
forceProtocolUplinkSignalBtn.addEventListener("click", () => {
    applySingleProtocolSignalOverride("uplink");
});
forceProtocolDownlinkSignalBtn.addEventListener("click", () => {
    applySingleProtocolSignalOverride("downlink");
});
clearProtocolUplinkOverrideBtn.addEventListener("click", () => {
    clearProtocolOverride("uplink");
});
clearProtocolDownlinkOverrideBtn.addEventListener("click", () => {
    clearProtocolOverride("downlink");
});
loadProtocolUplinkBtn.addEventListener("click", () => {
    protocolUplinkOverrideText.value = JSON.stringify(protocolState.shipUplinkRaw, null, 2);
    protocolUplinkOverrideEnabled.checked = true;
    refreshProtocolTransport();
});
loadProtocolDownlinkBtn.addEventListener("click", () => {
    protocolDownlinkOverrideText.value = JSON.stringify(protocolState.platformDownlinkRaw, null, 2);
    protocolDownlinkOverrideEnabled.checked = true;
    refreshProtocolTransport();
});

timeScroll.addEventListener("input", () => {
    telemetryStore.setGraphOffset(timeScroll.value);
    graphOffset = telemetryStore.graphOffset;
    graphFollowingLive = telemetryStore.followingLive;
});

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

// Pointer events work consistently for mouse and touch.  The pad position is
// intentionally not part of this interaction; only the landing target moves.
c.addEventListener("pointerdown", selectStandaloneLandingTarget);

c.addEventListener("mousemove", (event) => {
    const rect = c.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;
    c.style.cursor = isFlightControlBuildingHit(pointerX, pointerY) ? "pointer" : isLinkedMode() ? "default" : "crosshair";
});

// Moved to mission_simulation.js.

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

const instanceTrackerView = window.createStarshipInstanceTracker({
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
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([telemetryStore.toCsv()], { type: "text/csv" }));
    a.download = "telemetria_starship.csv";
    a.click();
}



const simulationLoop = window.startStarshipSimulationLoop({
    isRunning: () => started && !paused,
    getSpeed: () => sim,
    step,
    draw,
    maxStep: MAX_SIMULATION_INTEGRATION_STEP,
});
