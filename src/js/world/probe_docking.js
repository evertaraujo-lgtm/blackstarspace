(function () {
function setProbePosition(worldX) {
    // Orbital initial conditions are intentionally immutable after Start.
    // Changing these inputs in flight used to change the mass only, while
    // leaving the two physical bodies where they were.
    if (started || launchCountdownEndsAt !== null) return false;
    probeConfig.x = worldX;
    probeConfig.altitude = clamp(Number(probeAltitudeInput.value) || 400000, 1000, 800000);
    probeConfig.velocity = clamp(Number(probeVelocityInput.value) || 0, 0, 12000);
    probeConfig.mass = clamp(Number(probeMassInput.value) || 300, 1, 5000);
    setSelectedShipMass(probeConfig.mass);
    sceneFocusX = probeConfig.x;
    if (!started && s && isProbeSelected()) {
        physicsCore.freeze(s, {
            x: probeConfig.x,
            z: probeConfig.altitude,
            vx: probeConfig.velocity,
            vz: 0,
            a: s.a,
        });
        nav = createEstimator(s);
    }
    if (!started && probeDocking.enabled && isProbeSelected()) {
        prepareProbeDockingTarget();
    }
    return true;
}

function createProbeDockingTargetState() {
    return createState({
        x: probeConfig.x,
        z: probeConfig.altitude + PROBE_DOCKING_INITIAL_SEPARATION,
        vx: probeConfig.velocity,
        vz: 0,
        // Both docking ports are on the nose. The target points down while
        // the controlled chaser points up, putting the correct faces toward
        // each other from the first frame.
        a: Math.PI,
        w: 0,
        noseFlap: 0,
        tailFlap: 0,
        msg: "SONDA ALVO | porta de acoplamento voltada para baixo",
        mode: "PROBE DOCKING TARGET",
    });
}

function prepareProbeDockingTarget() {
    if (!probeDocking.enabled || !isProbeSelected()) {
        probeDocking.target = null;
        return;
    }
    probeDocking.target = createProbeDockingTargetState();
    probeDocking.docked = false;
    probeDocking.lastContact = null;
    probeDocking.status = `Duas sondas posicionadas: alvo ${PROBE_DOCKING_INITIAL_SEPARATION} m acima; portas nas extremidades frontais.`;
}

function positionProbePair() {
    if (!isProbeSelected() || started || launchCountdownEndsAt !== null) return;
    probeDocking.enabled = true;
    setProbePosition(probeConfig.x);
    physicsCore.freeze(s, {
        x: probeConfig.x,
        z: probeConfig.altitude,
        vx: probeConfig.velocity,
        vz: 0,
        a: 0,
        w: 0,
    });
    prepareProbeDockingTarget();
    nav = createEstimator(s);
    sceneFocusX = probeConfig.x;
    updateProbeDockingUI();
    terraMapView?.setState(getTerraMapState());
    updateVehicleTrajectoryPredictions();
}

function clearProbeDockingScenario() {
    probeDocking.enabled = false;
    probeDocking.target = null;
    probeDocking.docked = false;
    probeDocking.lastContact = null;
    probeDocking.status = "Par de sondas não posicionado.";
    terraMapView?.clearPrediction?.("probe-target");
    terraMapView?.clearTrajectory?.("probe-target");
    if (terraMapView && s) terraMapView.setState(getTerraMapState());
}

function updateProbeDockingStatusOutputs() {
    probeDockingStatus.textContent = probeDocking.status;
    probeDockingPanelStatus.textContent = probeDocking.status;
}

function updateProbeDockingUI() {
    const probeSelected = isProbeSelected();
    if (!probeSelected && probeDocking.enabled) {
        clearProbeDockingScenario();
    }
    const positionControlsDisabled = !probeSelected || started || launchCountdownEndsAt !== null;
    [
        probeAltitudeInput,
        probeVelocityInput,
        probeMassInput,
        setProbePositionBtn,
        simulateProbeTrajectoryBtn,
        positionProbePairBtn,
    ].forEach((control) => {
        control.disabled = positionControlsDisabled;
    });
    updateProbeDockingStatusOutputs();
}

function getProbeDockingPort(state, profile = shipRegistry.probe_satellite) {
    const halfLength = (profile.dimensions?.length ?? 2.4) / 2;
    const portSide = profile.dockingPort?.location === "tail" ? -1 : 1;
    const direction = {
        x: Math.sin(state.a) * portSide,
        z: Math.cos(state.a) * portSide,
    };
    const offset = {
        x: direction.x * halfLength,
        z: direction.z * halfLength,
    };
    const pointVelocity = physicsCore.getPointVelocity(state, offset);
    return {
        x: state.x + offset.x,
        z: state.z + offset.z,
        direction,
        offset,
        vx: pointVelocity.vx,
        vz: pointVelocity.vz,
    };
}

function getWrappedWorldDeltaX(fromX, toX) {
    const circumference = window.EARTH_CIRCUMFERENCE_METERS;
    const halfCircumference = circumference / 2;
    return ((toX - fromX + halfCircumference) % circumference + circumference) % circumference - halfCircumference;
}

function getProbeDockingMetrics() {
    const target = probeDocking.target;
    if (!target || !isProbeSelected()) return null;
    const chaserPort = getProbeDockingPort(s);
    const targetPort = getProbeDockingPort(target);
    const deltaX = getWrappedWorldDeltaX(chaserPort.x, targetPort.x);
    const deltaZ = targetPort.z - chaserPort.z;
    const portDistance = Math.hypot(deltaX, deltaZ);
    const contactNormal = portDistance > Number.EPSILON
        ? { x: deltaX / portDistance, z: deltaZ / portDistance }
        : { ...chaserPort.direction };
    const relativeVelocity = {
        x: targetPort.vx - chaserPort.vx,
        z: targetPort.vz - chaserPort.vz,
    };
    return {
        chaserPort,
        targetPort,
        portDistance,
        contactNormal,
        relativeSpeed: Math.hypot(relativeVelocity.x, relativeVelocity.z),
        normalRelativeSpeed: relativeVelocity.x * contactNormal.x + relativeVelocity.z * contactNormal.z,
        alignmentError: Math.abs(Math.PI - Math.abs(wrapAngle(s.a - target.a))),
    };
}

function getProbeRendezvousContactConfig() {
    const port = shipRegistry.probe_satellite.dockingPort ?? {};
    const captureRadius = port.captureRadius ?? PROBE_DOCKING_CAPTURE_RADIUS;
    return {
        captureRadius,
        contactDistance: Math.max(captureRadius, port.contactDistance ?? PROBE_DOCKING_CONTACT_DISTANCE),
        restitution: port.restitution ?? 0.08,
        positionSlop: port.positionSlop ?? 0.01,
        positionCorrection: port.positionCorrection ?? 0.82,
        maxPositionCorrection: port.maxPositionCorrection ?? 0.2,
    };
}

function isProbeDockingContactRecent() {
    return Boolean(
        probeDocking.lastContact &&
        simTime - probeDocking.lastContact.time <= PROBE_DOCKING_CONTACT_HIGHLIGHT_SECONDS
    );
}

function resolveProbeRendezvousContact(metrics = getProbeDockingMetrics()) {
    const target = probeDocking.target;
    if (!target || !metrics || probeDocking.docked) return null;
    const contact = getProbeRendezvousContactConfig();
    if (metrics.portDistance > contact.contactDistance) return null;

    const chaserMass = getSelectedShipMass();
    const targetMass = probeConfig.mass;
    const profile = shipRegistry.probe_satellite;
    const response = physicsCore.resolveRendezvousContact(s, target, {
        massA: chaserMass,
        massB: targetMass,
        inertiaA: physicsCore.getPlanarMomentOfInertia(chaserMass, profile.dimensions),
        inertiaB: physicsCore.getPlanarMomentOfInertia(targetMass, profile.dimensions),
        contactOffsetA: metrics.chaserPort.offset,
        contactOffsetB: metrics.targetPort.offset,
        normal: metrics.contactNormal,
        penetration: Math.max(0, contact.contactDistance - metrics.portDistance),
        restitution: contact.restitution,
        positionSlop: contact.positionSlop,
        positionCorrection: contact.positionCorrection,
        maxPositionCorrection: contact.maxPositionCorrection,
    });
    if (response.applied) {
        s.speed = Math.hypot(s.vx, s.vz);
        target.speed = Math.hypot(target.vx, target.vz);
        probeDocking.lastContact = {
            time: simTime,
            impulse: response.impulse,
            approachSpeed: response.approachSpeed,
            penetration: response.penetration,
        };
    }
    return response;
}

function updateProbeDockingReadout() {
    if (!probeDocking.target || !isProbeSelected()) return;
    if (probeDocking.docked) {
        probeDocking.status = "ACOPLAMENTO CONFIRMADO | portas frontais travadas";
    } else {
        const metrics = getProbeDockingMetrics();
        if (!metrics) return;
        const contact = isProbeDockingContactRecent() ? probeDocking.lastContact : null;
        const contactPrefix = contact
            ? `CONTATO LEVE ${contact.approachSpeed.toFixed(2)} m/s | `
            : "";
        probeDocking.status = `${contactPrefix}Portas: ${metrics.portDistance.toFixed(1)} m | Vrel ${metrics.relativeSpeed.toFixed(2)} m/s | desalinhamento ${(metrics.alignmentError * 180 / Math.PI).toFixed(1)}°`;
    }
}

function updateProbeManualRcsUI() {
    const probeSelected = isProbeSelected();
    probeManualRcsPanel.hidden = !probeSelected;
    if (!probeSelected) {
        probeManualRcsInput.checked = false;
        probeManualRcsKeys.clear();
    }
    probeManualRcsInput.disabled = !probeSelected;
    probeManualRcsActive = probeSelected && probeManualRcsInput.checked;
    const activeDirections = [
        probeManualRcsKeys.has("ArrowUp") ? "↑" : "",
        probeManualRcsKeys.has("ArrowDown") ? "↓" : "",
        probeManualRcsKeys.has("ArrowLeft") ? "←" : "",
        probeManualRcsKeys.has("ArrowRight") ? "→" : "",
        probeManualRcsKeys.has("KeyA") ? "⟲" : "",
        probeManualRcsKeys.has("KeyD") ? "⟳" : "",
    ].filter(Boolean).join(" ");
    probeManualRcsStatus.textContent = !probeManualRcsActive
        ? "RCS manual desligado"
        : activeDirections
            ? `RCS disparando: ${activeDirections}`
            : "RCS manual armado — setas para impulso, A/D para rotação";
}

function getManualProbeRcsForce() {
    if (!probeManualRcsActive || !started || !isProbeSelected()) {
        return { x: 0, z: 0 };
    }
    const thrust = getSelectedShipProfile().rcs?.thrustN ?? 0;
    // Arrow commands are in the probe's local axes.  That keeps the manual
    // translation intuitive after an RCS rotation: forward remains forward
    // and right remains the probe's right side, not the world/screen axis.
    const lateralForce = (probeManualRcsKeys.has("ArrowRight") ? thrust : 0) -
        (probeManualRcsKeys.has("ArrowLeft") ? thrust : 0);
    const longitudinalForce = (probeManualRcsKeys.has("ArrowUp") ? thrust : 0) -
        (probeManualRcsKeys.has("ArrowDown") ? thrust : 0);
    const attitude = s.a ?? 0;
    return {
        x: lateralForce * Math.cos(attitude) + longitudinalForce * Math.sin(attitude),
        z: longitudinalForce * Math.cos(attitude) - lateralForce * Math.sin(attitude),
    };
}

function getManualProbeRcsAngularAcceleration() {
    if (!probeManualRcsActive || !started || !isProbeSelected()) {
        return 0;
    }
    const angularAcceleration = getSelectedShipProfile().rcs?.angularAcceleration ?? 0;
    const dockedInertiaFactor = probeDocking?.docked ? 2 : 1;
    const effectiveAcceleration = angularAcceleration / dockedInertiaFactor;
    return (probeManualRcsKeys.has("KeyD") ? effectiveAcceleration : 0) -
        (probeManualRcsKeys.has("KeyA") ? effectiveAcceleration : 0);
}

function simulateProbeTrajectory() {
    if (started || launchCountdownEndsAt !== null || !isProbeSelected()) return;
    setProbePosition(probeConfig.x);
    const samples = [];
    const predicted = { x: probeConfig.x, z: probeConfig.altitude, vx: probeConfig.velocity, vz: 0, a: 0, w: 0 };
    const area = Math.max(0.15, Math.PI * (getSelectedShipDimensions().diameter / 2) ** 2 * 0.55);
    const orbit = physicsCore.getOrbit(predicted);
    const predictedDuration = orbit.period
        ? Math.min(24 * 3600, orbit.period)
        : 6 * 3600;
    const dt = 5;
    const maxSteps = Math.ceil(predictedDuration / dt);
    // Bound trajectories may have an apoapse above 1,000 km; do not mistake
    // that for an escape and truncate a valid orbital prediction.
    for (let step = 0; step < maxSteps && predicted.z >= 0 && predicted.z <= 5000000; step += 1) {
        if (step % 2 === 0) samples.push({ x: predicted.x, z: predicted.z });
        const atmosphere = physicsCore.getAtmosphere(predicted, environment.getWindAt(predicted));
        const aerodynamic = physicsCore.getAerodynamicForce(atmosphere, {
            dragCoefficient: Cd,
            dragArea: area,
            exposure: clamp((80000 - predicted.z) / 10000, 0, 1),
        });
        physicsCore.step(predicted, dt, {
            mass: probeConfig.mass,
            forceX: aerodynamic.x,
            forceZ: aerodynamic.z,
            integrateRotation: false,
        });
    }
    terraMapView.setPrediction(samples, getSelectedShipProfile().id, "rgba(143, 243, 255, .9)");
}

function predictPolarTrajectory(state, profile, massKg) {
    const samples = [];
    const predicted = { x: state.x, z: state.z, vx: state.vx, vz: state.vz, a: state.a ?? 0, w: 0 };
    const mass = Math.max(1, massKg);
    const area = Math.max(0.15, Math.PI * (profile.dimensions.diameter / 2) ** 2 * 0.55);
    const orbitalPeriod = physicsCore.getOrbit(predicted).period;
    // A bound trajectory receives a complete predicted revolution.  Keep a
    // fixed point budget by increasing the integration interval for very
    // high orbits instead of truncating its ground track.
    const duration = orbitalPeriod ? Math.min(24 * 3600, orbitalPeriod) : 3600;
    const dt = clamp(duration / 1200, 5, 30);
    const maxSteps = Math.ceil(duration / dt);
    for (let step = 0; step < maxSteps && predicted.z >= 0 && predicted.z <= 5000000; step += 1) {
        samples.push({ x: predicted.x, z: predicted.z });
        const atmosphere = physicsCore.getAtmosphere(predicted, environment.getWindAt(predicted));
        const aerodynamic = physicsCore.getAerodynamicForce(atmosphere, {
            dragCoefficient: Cd,
            dragArea: area,
            exposure: clamp((80000 - predicted.z) / 10000, 0, 1),
        });
        physicsCore.step(predicted, dt, {
            mass,
            forceX: aerodynamic.x,
            forceZ: aerodynamic.z,
            integrateRotation: false,
        });
    }
    return samples;
}

function updateVehicleTrajectoryPredictions() {
    if (!terraMapView || !s) return;
    const activeProfile = getSelectedShipProfile();
    terraMapView.setPrediction(
        predictPolarTrajectory(s, activeProfile, getVehicleMass()),
        activeProfile.id,
        activeProfile.isProbe ? "rgba(143, 243, 255, .9)" : "rgba(255, 210, 105, .9)"
    );
    if (probeDocking.target && activeProfile.isProbe) {
        terraMapView.setPrediction(
            predictPolarTrajectory(probeDocking.target, shipRegistry.probe_satellite, probeConfig.mass),
            "probe-target",
            "rgba(255, 209, 102, .9)"
        );
    }
    if (detachedBoosterFlight?.state) {
        const booster = detachedBoosterFlight;
        const propellantMass = booster.state.propellant.main.loxKg + booster.state.propellant.main.lch4Kg;
        terraMapView.setPrediction(
            predictPolarTrajectory(booster.state, booster.profile, booster.profile.mass + propellantMass),
            booster.profile.id,
            "rgba(120, 220, 255, .9)"
        );
    }
}

let terraMapView = null;
let lastTrajectoryPredictionWallTime = 0;

Object.defineProperties(window, {
    terraMapView: { get: () => terraMapView, set: (value) => { terraMapView = value; } },
    lastTrajectoryPredictionWallTime: { get: () => lastTrajectoryPredictionWallTime, set: (value) => { lastTrajectoryPredictionWallTime = value; } },
});

function getTerraMapState() {
    const activeProfile = getSelectedShipProfile();
    const indianOceanMissionActive = isStackHotstageBoostbackProgramSelected() || Boolean(s?.upperStageTransfer);
    const tracks = [{
        id: activeProfile.id,
        label: activeProfile.shortCode,
        x: nav?.x ?? s.x,
        z: nav?.z ?? s.z,
        t: simTime,
        color: "#ffd269",
    }];
    if (probeDocking.target && activeProfile.isProbe) {
        tracks.push({
            id: "probe-target",
            label: "SONDA ALVO",
            x: probeDocking.target.x,
            z: probeDocking.target.z,
            t: simTime,
            color: "#ffd166",
        });
    }
    if (detachedBoosterFlight?.state) {
        tracks.push({
            id: "superheavy_b7",
            label: "B7",
            x: detachedBoosterFlight.state.x,
            z: detachedBoosterFlight.state.z,
            t: simTime,
            color: "#78dcff",
        });
    }
    return {
        type: "telemetry",
        sentAt: Date.now(),
        operationMode,
        started,
        x: nav?.x ?? s.x,
        z: nav?.z ?? s.z,
        vx: nav?.vx ?? s.vx,
        vz: nav?.vz ?? s.vz,
        targetX: isProbeSelected() ? probeConfig.x : landingTargetX,
        targetSurface: scene.getSurfaceProfile(isProbeSelected() ? probeConfig.x : landingTargetX),
        specialTargets: indianOceanMissionActive
            ? [{ x: INDIAN_OCEAN_TARGET_X, label: "OCEANO ÍNDICO", color: "#ff9d66" }]
            : [],
        simTime,
        trackId: activeProfile.id,
        tracks,
    };
}

function getGuidanceTargetX() {
    return isLinkedMode() ? TOWER_WORLD_X : landingTargetX;
}

function getLaunchPositionX() {
    return isLinkedMode() ? TOWER_WORLD_X : STANDALONE_LAUNCH_WORLD_X;
}

function updateManualEngineUI() {
    // Manual engine authority was intentionally retired from the ship panel.
    manualEngineActive = false;
    manualThrottleSetting = 0;
}

    Object.assign(window, {
        setProbePosition,
        createProbeDockingTargetState,
        prepareProbeDockingTarget,
        positionProbePair,
        clearProbeDockingScenario,
        updateProbeDockingStatusOutputs,
        updateProbeDockingUI,
        getProbeDockingPort,
        getWrappedWorldDeltaX,
        getProbeDockingMetrics,
        getProbeRendezvousContactConfig,
        isProbeDockingContactRecent,
        resolveProbeRendezvousContact,
        updateProbeDockingReadout,
        updateProbeManualRcsUI,
        getManualProbeRcsForce,
        getManualProbeRcsAngularAcceleration,
        simulateProbeTrajectory,
        predictPolarTrajectory,
        updateVehicleTrajectoryPredictions,
        getTerraMapState,
        getGuidanceTargetX,
        getLaunchPositionX,
        updateManualEngineUI,
    });
})();
