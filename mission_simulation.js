(function () {
function n(amplitude) {
    return (Math.random() - 0.5) * 2 * amplitude;
}

function createState(overrides = {}) {
    return {
        x: 180,
        z: 10000,
        vx: 15,
        vz: -120,
        a: 1.45,
        w: 0,
        noseFlap: 0.72,
        tailFlap: 0.72,
        rcs: 0,
        throttle: 0,
        gimbal: 0,
        engineOn: false,
        propellant: createPropellantState(),
        q: 0,
        aoa: 0,
        bodyLift: 0,
        flapLift: 0,
        flapDrag: 0,
        nonGravAx: 0,
        nonGravAz: 0,
        ax: 0,
        az: -G,
        speed: 0,
        end: false,
        captured: false,
        contactState: "free",
        collisionMarkers: [],
        collisionFailure: false,
        waterLanding: false,
        waterFloating: false,
        waterFloatingTime: null,
        waterLandingCertified: false,
        // While the hull is initially capsizing, this is the submerged
        // support point at its engine/base.  The physical centre is derived
        // from it, so the ship does not visually rotate around its centre.
        waterPivot: null,
        waterTouchdownTime: null,
        waterImpact: null,
        msg: "",
        mode: "STANDBY",
        landingSuccess: null,
        resultTitle: "",
        resultDetail: "",
        ...overrides,
    };
}

function isTestHopProgramSelected() {
    return flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.TEST_HOP;
}

function isBoostbackBurnProgramSelected() {
    return flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.BOOSTBACK_BURN;
}

function isStackHotstageBoostbackProgramSelected() {
    return flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.STACK_HOTSTAGE_BOOSTBACK;
}

function isSuborbitalMissionProgramSelected() {
    return flightControlState.flightProgramProfile === FLIGHT_PROGRAM_PROFILES.SUBORBITAL_MISSION;
}

function createStandbyState() {
    if (isProbeSelected()) {
        return createState({ x: probeConfig.x, z: probeConfig.altitude, vx: probeConfig.velocity, vz: 0, a: 0, noseFlap: 0, tailFlap: 0, msg: "SONDA AGUARDANDO START", mode: "PROBE STANDBY" });
    }
    if (isTestHopProgramSelected() || (isSuperHeavySelected() && stackMission.attachS24 && isSuborbitalMissionProgramSelected())) {
        return createState({
            x: getLaunchPositionX(),
            z: getLaunchPadRestingCenterAltitude(),
            vx: 0,
            vz: 0,
            a: 0,
            noseFlap: 0.08,
            tailFlap: 0.08,
            speed: 0,
            msg: "AGUARDANDO START | TESTE DE DECOLAGEM",
            mode: "TEST STANDBY",
        });
    }

    return createState({
        vx: 0,
        vz: 0,
        speed: 0,
        msg: "AGUARDANDO START",
        mode: "STANDBY",
    });
}

function createTestHopStartState() {
    return createState({
        x: getLaunchPositionX(),
        z: getLaunchPadRestingCenterAltitude(),
        vx: 0,
        vz: 0,
        a: 0,
        noseFlap: 0.08,
        tailFlap: 0.08,
        speed: 0,
        msg: "TESTE DE DECOLAGEM INICIADO",
        mode: "TEST ASCENT",
    });
}

function createEstimator(state) {
    return {
        x: state.x,
        z: state.z,
        vx: state.vx,
        vz: state.vz,
        a: state.a,
        w: state.w,
        q: 0,
        airSpeed: 0,
    };
}

function createSensor(period, initialValues) {
    return {
        period,
        timer: 0,
        age: 0,
        fresh: false,
        ...initialValues,
    };
}

function createSensors() {
    const platformLink = createSensor(1 / 12, getPlatformLinkDefaults());

    return {
        imu: createSensor(1 / 80, { forward: 0, right: 0, gyro: 0 }),
        gps: createSensor(1 / 5, { x: 0, z: 10000, vx: 0, vz: 0 }),
        radar: createSensor(1 / 20, { altitude: 10000 }),
        airdata: createSensor(1 / 25, { speed: 0, dynamicPressure: 0, flowAngle: 0 }),
        attitude: createSensor(1 / 20, { angle: 1.45 }),
        platformLink,
        towerLink: platformLink,
    };
}

function setSensorValue(sensor, values) {
    Object.assign(sensor, values);
    sensor.age = 0;
    sensor.fresh = true;
}

function sampleIMU() {
    const bodyAccel = toBody(s.nonGravAx, s.nonGravAz, s.a);
    return {
        forward: bodyAccel.forward + n(0.35),
        right: bodyAccel.right + n(0.35),
        gyro: s.w + n(0.01),
    };
}

function sampleGPS() {
    return {
        x: s.x + n(2),
        z: Math.max(0, s.z + n(2)),
        vx: s.vx + n(0.45),
        vz: s.vz + n(0.45),
    };
}

function sampleRadar() {
    return {
        altitude: Math.max(0, s.z + n(0.75)),
    };
}

function sampleAirdata() {
    const rvx = s.vx - environment.wind.x;
    const rvz = s.vz - environment.wind.z;
    const speed = Math.hypot(rvx, rvz);
    return {
        speed: Math.max(0, speed + n(0.4)),
        dynamicPressure: Math.max(0, 0.5 * rho(s.z) * speed * speed + n(35)),
        flowAngle: Math.atan2(-rvx, -rvz) + n(0.01),
    };
}

function sampleAttitude() {
    return {
        angle: wrapAngle(s.a + n(0.015)),
    };
}

function primeSensors() {
    refreshPlatformState(0);
    setSensorValue(sensors.imu, sampleIMU());
    setSensorValue(sensors.gps, sampleGPS());
    setSensorValue(sensors.radar, sampleRadar());
    setSensorValue(sensors.airdata, sampleAirdata());
    setSensorValue(sensors.attitude, sampleAttitude());
    setSensorValue(sensors.platformLink, samplePlatformLink());
    nav.q = sensors.airdata.dynamicPressure;
    nav.airSpeed = sensors.airdata.speed;
}

function updateSensor(sensor, dt, sampler) {
    sensor.timer += dt;
    sensor.age += dt;
    sensor.fresh = false;

    while (sensor.timer >= sensor.period) {
        sensor.timer -= sensor.period;
        setSensorValue(sensor, sampler());
    }
}

function updateSensors(dt) {
    updateSensor(sensors.imu, dt, sampleIMU);
    updateSensor(sensors.gps, dt, sampleGPS);
    updateSensor(sensors.radar, dt, sampleRadar);
    updateSensor(sensors.airdata, dt, sampleAirdata);
    updateSensor(sensors.attitude, dt, sampleAttitude);
}

function updatePlatformLink(dt) {
    updateSensor(sensors.platformLink, dt, samplePlatformLink);
}

function updateTowerLink(dt) {
    updatePlatformLink(dt);
}

function fuseSensors(dt) {
    nav.a = wrapAngle(nav.a + sensors.imu.gyro * dt);
    nav.w = sensors.imu.gyro;

    const accWorld = toWorld(sensors.imu.forward, sensors.imu.right, nav.a);
    propagateNavigationEstimate(nav, dt, accWorld.x, accWorld.z);
    nav.z = Math.max(0, nav.z);

    if (sensors.attitude.fresh) {
        nav.a = blendAngle(nav.a, sensors.attitude.angle, 0.22);
    }

    if (sensors.gps.fresh) {
        nav.x = lerp(nav.x, sensors.gps.x, 0.2);
        nav.z = lerp(nav.z, sensors.gps.z, 0.08);
        nav.vx = lerp(nav.vx, sensors.gps.vx, 0.32);
        nav.vz = lerp(nav.vz, sensors.gps.vz, 0.32);
    }

    if (sensors.radar.fresh) {
        nav.z = lerp(nav.z, sensors.radar.altitude, 0.35);
    }

    if (sensors.airdata.fresh) {
        nav.airSpeed = sensors.airdata.speed;
        nav.q = sensors.airdata.dynamicPressure;
    }
}

function applyFailures(command) {
    // Controllers may issue either the direct actuator fields used by the
    // shared recovery laws or the explicit *Target contract used by stack,
    // coast and B7-specific guidance.  Dropping the latter here silently
    // zeroed S24's coast RCS after separation.
    let noseTarget = command.noseTarget ?? command.noseFlap ?? 0;
    let tailTarget = command.tailTarget ?? command.tailFlap ?? 0;
    let flapRate = 2.8;
    let rcsTarget = command.rcsTarget ?? command.rcs ?? 0;
    let gimbalTarget = command.gimbalTarget ?? command.gimbal ?? 0;
    let gimbalRate = 2.8;
    let throttleTarget = command.throttleTarget ?? command.throttle ?? 0;
    let engineEnabled = command.engineOn;

    switch (failureConfig.flaps) {
        case "sluggish":
            flapRate = 0.55;
            break;
        case "jam_current":
            if (!failureState.flapJamLatched) {
                latchCurrentFlaps();
            }
            noseTarget = failureState.jammedNose;
            tailTarget = failureState.jammedTail;
            break;
        case "jam_open":
            noseTarget = 0.95;
            tailTarget = 0.95;
            break;
        case "jam_closed":
            noseTarget = 0.05;
            tailTarget = 0.05;
            break;
        case "detached":
            noseTarget = 0;
            tailTarget = 0;
            break;
        case "asymmetric":
            noseTarget = 0.15;
            tailTarget = 0.95;
            break;
    }

    switch (failureConfig.rcs) {
        case "degraded":
            rcsTarget *= 0.3;
            break;
        case "offline":
            rcsTarget = 0;
            break;
        case "stuck_left":
            rcsTarget = -0.6;
            break;
        case "stuck_right":
            rcsTarget = 0.6;
            break;
    }

    switch (failureConfig.engine) {
        case "one_out":
            throttleTarget *= 2 / 3;
            gimbalTarget *= 0.75;
            break;
        case "single_engine":
            throttleTarget *= 1 / 3;
            gimbalTarget *= 0.5;
            break;
        case "no_ignition":
            engineEnabled = false;
            throttleTarget = 0;
            gimbalTarget = 0;
            break;
        case "flameout":
            if (failureState.engineFlamedOut || engineEnabled || throttleTarget > 0.05) {
                failureState.engineFlamedOut = true;
                engineEnabled = false;
                throttleTarget = 0;
                gimbalTarget = 0;
            }
            break;
    }

    updateFailureStatus();

    return {
        noseTarget,
        tailTarget,
        flapRate,
        rcsTarget,
        gimbalTarget,
        gimbalRate,
        throttleTarget,
        engineEnabled,
    };
}

function applyControl(dt) {
    if (s.waterLanding) {
        // After splashdown there is no engine/attitude authority.  The water
        // dynamics below own the vehicle until it has toppled.
        controlState = {
            ...controlState,
            mode: s.waterFloating ? "NAVE BOIANDO" : "AMERRISSAGEM",
            status: s.waterFloating
                ? (s.waterLandingCertified
                    ? "AMERRISSAGEM BEM-SUCEDIDA | nave boiando e oscilando na água"
                    : "AMERRISSAGEM | estabilizando na água antes da confirmação")
                : "AMERRISSAGEM | sustentação vertical insuficiente; tombando",
            activeController: {
                id: "CTRL_DINAMICA_AGUA",
                label: "Dinâmica passiva de amerrissagem",
                loops: ["empuxo hidrodinâmico limitado", "arrasto da água", "torque de tombamento"],
            },
        };
        s.noseFlap = moveToward(s.noseFlap, 0, 2.8, dt);
        s.tailFlap = moveToward(s.tailFlap, 0, 2.8, dt);
        s.rcs = 0;
        s.gimbal = 0;
        s.throttle = 0;
        s.engineOn = false;
        return;
    }

    const actuators = getActuatorProfile();

    controlState = flightController.updateShipCommand(dt, nav, sensors, {
        started,
        mass: getVehicleMass(),
        maxThrust: getVehicleMaxThrust(),
        g: G,
        targetX: getGuidanceTargetX(),
        targetZ: isLinkedMode() ? sensors.platformLink.captureZ : 0,
        captureHeight: getSelectedPlatformCaptureHeight(),
        manualEngineActive,
        actuators,
        upperStageTransfer: Boolean(s.upperStageTransfer),
        indianOceanTargetX: INDIAN_OCEAN_TARGET_X,
        mainPropellantFraction: getMainPropellantFraction(),
        ...getStackControlEnvironment(),
    });

    let commandedState = controlState;

    if (manualEngineActive && !controlState.forceEngineCutoff) {
        commandedState = {
            ...controlState,
            engineOn: true,
            throttle: Math.max(controlState.throttle, manualThrottleSetting),
        };
    }

    const failedCommand = applyFailures(commandedState);

    s.noseFlap = moveToward(s.noseFlap, failedCommand.noseTarget, failedCommand.flapRate, dt);
    s.tailFlap = moveToward(s.tailFlap, failedCommand.tailTarget, failedCommand.flapRate, dt);
    s.rcs = moveToward(s.rcs, failedCommand.rcsTarget, 7.5, dt);
    s.gimbal = moveToward(
        s.gimbal,
        controlState.forceEngineCutoff ? 0 : failedCommand.engineEnabled ? failedCommand.gimbalTarget : 0,
        failedCommand.gimbalRate,
        dt
    );
    s.throttle = moveToward(
        s.throttle,
        controlState.forceEngineCutoff ? 0 : failedCommand.engineEnabled ? failedCommand.throttleTarget : 0,
        1.6,
        dt
    );
    s.engineOn = controlState.forceEngineCutoff ? false : failedCommand.engineEnabled || s.throttle > 0.02;
    s.hotStageIgnition = Boolean(controlState.hotStageIgnition);
    s.mode = controlState.mode;
}

const towerContactGeometry = window.createTowerContactGeometry({
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    lerp: (start, end, amount) => start + (end - start) * amount,
});

function getVehicleCollisionProfile() {
    return towerContactGeometry.getCollisionProfile({
        state: s,
        dimensions: getSelectedShipDimensions(),
        geometry: getSelectedShipGeometry(),
    });
}

function getTowerContactModel() {
    return getSelectedPlatformProfile().contactModel ?? window.StarshipPlatformCatalog.defaultCaptureEnvelope.contactModel;
}

function getVehicleCollisionSamples() {
    return towerContactGeometry.getCollisionSamples({
        state: s,
        dimensions: getSelectedShipDimensions(),
        geometry: getSelectedShipGeometry(),
    });
}

function getVehicleGroundClearance() {
    const lowestPointZ = getVehicleCollisionSamples().reduce(
        (lowest, point) => Math.min(lowest, point.z),
        Number.POSITIVE_INFINITY
    );
    return s.z - lowestPointZ;
}

function buildTowerArmCollisionRects(platformOutput) {
    return towerContactGeometry.buildTowerRects({
        platform: platformOutput,
        model: getTowerContactModel(),
        mastOffsetX: TOWER_MAST_OFFSET_X,
        fallbackTowerHeight: getSelectedPlatformTowerHeight(),
    });
}

function evaluateArmImpact(samples, rects) {
    return towerContactGeometry.evaluateImpact({ samples, rects, state: s });
}

function resolveTowerContactPhysics(dt) {
    // The fixed Starbase tower is a structural obstacle in every operational
    // mode. Linked mode only enables its capture protocol; it does not create
    // or remove the physical mast.
    if (getSelectedPlatformProfile().visual !== "tower") {
        s.contactState = "free";
        s.collisionMarkers = [];
        platformMachineInputs = createPlatformMachineInputs();
        return;
    }

    const actualPlatformState = flightController.getActualPlatformState() ?? platformState;
    const captureX = actualPlatformState.captureX ?? TOWER_WORLD_X;
    const captureZ = actualPlatformState.captureZ ?? getSelectedPlatformCaptureHeight();
    const model = getTowerContactModel();
    const geometry = getVehicleCollisionProfile();
    const leftClosure = clamp(actualPlatformState.leftArmClosure ?? actualPlatformState.armClosure ?? 0, 0, 1);
    const rightClosure = clamp(actualPlatformState.rightArmClosure ?? actualPlatformState.armClosure ?? 0, 0, 1);
    const leftGapHalf = lerp(model.armGapHalfOpen, model.armGapHalfClosed, leftClosure);
    const rightGapHalf = lerp(model.armGapHalfOpen, model.armGapHalfClosed, rightClosure);
    const captureDz = s.z - captureZ;
    const captureDx = s.x - captureX;
    const supportBand = model.supportBandHalfHeight + geometry.catchHalfHeight;
    const withinSupportBand = Math.abs(captureDz) <= supportBand;
    const towerGeometry = buildTowerArmCollisionRects(actualPlatformState);
    const collisionSamples = getVehicleCollisionSamples();
    const finalGuidanceActive = actualPlatformState.guidancePhase === "final";
    const towerImpact = evaluateArmImpact(collisionSamples, towerGeometry.towerRects);
    let contactState = "free";
    // A red contact marker represents a physical intersection. It must never
    // coexist with a successful capture, regardless of impact speed.
    let structuralCollision = towerImpact.contact;
    const collisionMarkers = [];

    platformMachineInputs = {
        leftArmContact: false,
        rightArmContact: false,
        leftArmImpactSpeed: 0,
        rightArmImpactSpeed: 0,
    };

    if (towerImpact.contact) {
        collisionMarkers.push(towerImpact.collisionMarker);
        contactState = "tower_strike";
    }

    if (withinSupportBand && (leftClosure > 0.08 || rightClosure > 0.08)) {
        const minCenterX = captureX - leftGapHalf + geometry.catchHalfWidth;
        const maxCenterX = captureX + rightGapHalf - geometry.catchHalfWidth;
        const supportedX = minCenterX <= maxCenterX ? clamp(s.x, minCenterX, maxCenterX) : captureX;

        if (Math.abs(supportedX - s.x) > 1e-6 && !structuralCollision) {
            // This is a low-speed capture-guide constraint, not an impact response.
            // Structural contacts are handled below by freezing the simulation.
            contactState = "arm_contact";
        }
    }

    if (structuralCollision) {
        s.collisionFailure = true;
        platformMachineInputs.collisionDetected = true;
    }

    const supportReady =
        Boolean(actualPlatformState.supportAuthorized) &&
        finalGuidanceActive &&
        !s.collisionFailure &&
        !structuralCollision &&
        leftClosure > 0.6 &&
        rightClosure > 0.6 &&
        Math.abs(captureDx) <= Math.max(leftGapHalf, rightGapHalf) + 2.5 &&
        withinSupportBand;

    if (supportReady) {
        if (s.z < captureZ) {
            physicsCore.placeOnSurface(s, captureZ);
        }
        physicsCore.constrainTowardAnchor(s, { x: captureX, z: captureZ, a: 0 }, dt, {
            positionRateX: model.lateralDamping * 0.72,
            positionRateZ: model.verticalDamping,
            velocityRateX: model.lateralDamping,
            velocityRateZ: model.verticalDamping,
            attitudeRate: model.attitudeDamping,
            angularRate: model.angularDamping,
        });
        contactState = "supported";
    }

    if (actualPlatformState.captured && !s.collisionFailure) {
        physicsCore.constrainTowardAnchor(s, { x: captureX, z: captureZ, a: 0 }, dt, {
            positionRate: model.holdDamping,
            velocityRateX: model.holdDamping,
            velocityRateZ: model.holdDamping,
            attitudeRate: model.holdDamping,
            angularRate: model.holdDamping,
        });
        contactState = "captured";
    }

    s.contactState = contactState;
    s.collisionMarkers = collisionMarkers.filter(Boolean);
    s.collisionFailure ||= structuralCollision;
    platformMachineInputs.collisionDetected = s.collisionFailure;
}

function simulatePhysics(dt) {
    const probeVehicle = isProbeSelected();
    const atmosphere = physicsCore.getAtmosphere(s, environment.getWindAt(s));
    const rvx = atmosphere.relativeVx;
    const rvz = atmosphere.relativeVz;
    const speed = atmosphere.speed;
    const q = atmosphere.dynamicPressure;
    const flowAngle = atmosphere.flowAngle;
    const aoa = wrapAngle(s.a - flowAngle);
    const avgFlap = 0.5 * (s.noseFlap + s.tailFlap);
    const flapDiff = s.tailFlap - s.noseFlap;
    const flapDragArea = probeVehicle ? 0 : 100 * avgFlap + 180 * avgFlap * avgFlap + 40 * Math.abs(flapDiff);
    const dragArea = probeVehicle
        ? Math.max(0.15, Math.PI * (getSelectedShipDimensions().diameter / 2) ** 2 * 0.55)
        : 90 + 250 * Math.abs(Math.sin(aoa)) + flapDragArea;
    // A floating vehicle is not an aircraft with its full reference area
    // exposed.  Only the small portion above the waterline receives the
    // simplified aerodynamic loading used by this 2D model.  Without this
    // distinction, a strong lateral wind could incorrectly "lift" a ship
    // that is already supported by water.
    const atmosphericExposure = s.waterLanding
        ? 0.06
        : probeVehicle
            ? clamp((80000 - s.z) / 10000, 0, 1)
            : 1;
    const bodyLiftCoeff = probeVehicle ? 0 : 0.12 * Math.sin(2 * aoa);
    // Symmetric flaps supply drag, not a preferred left/right force.  The old
    // model produced positive lateral lift for a perfectly neutral bellyflop,
    // so the ship drifted in X even when its target and velocity were zero.
    // Cross-range lift now comes from angle of attack and differential flaps.
    const flapLiftCoeff = probeVehicle ? 0 : 0.16 * avgFlap * Math.sin(2 * aoa) + 0.38 * flapDiff;
    const bodyLiftMag = q * 160 * bodyLiftCoeff;
    const flapLiftMag = q * 220 * flapLiftCoeff;
    const liftMag = bodyLiftMag + flapLiftMag;
    const aerodynamic = physicsCore.getAerodynamicForce(atmosphere, {
        dragCoefficient: Cd,
        dragArea,
        liftMagnitude: liftMag,
        exposure: atmosphericExposure,
    });
    const thrust = physicsCore.getThrustForce(s, getVehicleMaxThrust());
    const manualProbeRcsForce = getManualProbeRcsForce();
    const manualProbeRcsAngularAcceleration = getManualProbeRcsAngularAcceleration();
    const vehicleMass = getVehicleMass();
    let waterForceX = 0;
    let waterForceZ = 0;
    let waterMoment = 0;

    if (s.waterLanding) {
        const waterDynamics = physicsCore.getWaterForces({
            mass: vehicleMass,
            gravity: G,
            simTime,
            waterTouchdownTime: s.waterTouchdownTime,
            waterFloating: s.waterFloating,
            hasWaterPivot: Boolean(s.waterPivot),
            impactVx: s.waterImpact?.vx,
            x: s.x,
            centerZ: s.z,
            vx: s.vx,
            vz: s.vz,
            angle: s.a,
            angularVelocity: s.w,
            floatCenterZ: getVehicleGroundClearance() - 2.5,
        });
        waterForceX = waterDynamics.forceX;
        waterForceZ = waterDynamics.forceZ;
        waterMoment = waterDynamics.angularAcceleration;
    }

    const totalForceX = aerodynamic.x + thrust.x + manualProbeRcsForce.x + waterForceX;
    const totalForceZ = aerodynamic.z + thrust.z + manualProbeRcsForce.z + waterForceZ;
    const aeroBlend = clamp(q / 6000, 0, 1);
    const preSeparationStack =
        isSuperHeavySelected() &&
        stackMission.attachS24 &&
        !stackMission.separated &&
        (isStackHotstageBoostbackProgramSelected() || isSuborbitalMissionProgramSelected());
    // The generic vehicle moment is deliberately tuned for Starship's
    // belly-flop.  Applying it to the still-stacked B7 + S24 assembly was
    // an uncommanded pitch torque that erased the requested 30° attitude.
    // The slender stack has only aerodynamic rate damping here; its pitch is
    // held by the central-engine TVC and RCS commanded by its controller.
    const aeroMoment = probeVehicle
        ? 0
        : preSeparationStack
            ? atmosphericExposure * aeroBlend * (-s.w * 0.45)
            : atmosphericExposure * aeroBlend * (-wrapAngle(aoa - Math.PI / 2) * 2.6 + flapDiff * 6.2 - s.w * 1.8);
    const rcsMoment = s.rcs * (1.8 - aeroBlend * 0.9);
    const tvcMoment = s.engineOn ? clamp(s.gimbal / MAX_GIMBAL, -1, 1) * (7.5 + s.throttle * 8.5) - s.w * 0.6 : 0;
    const angularAccel = aeroMoment + rcsMoment + tvcMoment + manualProbeRcsAngularAcceleration + waterMoment;

    // Every free-flight object uses this same polar integrator. Vehicle
    // differences enter only through the non-gravitational forces above.
    const orbitalStep = physicsCore.step(s, dt, {
        mass: vehicleMass,
        forceX: totalForceX,
        forceZ: totalForceZ,
        angularAcceleration: angularAccel,
    });

    // The first part of the splashdown is a constrained rotation around the
    // submerged engine/base point, rather than a rotation around the centre
    // of mass.  Keep that support point 2.5 m below the surface, then release
    // the vehicle to the regular floating model once it has capsized.
    if (s.waterLanding && !s.waterFloating && s.waterPivot) {
        const baseOffset = getVehicleRestingCenterAltitude();
        physicsCore.constrainToPivot(s, s.waterPivot, baseOffset);
    }
    s.q = q;
    s.aoa = aoa;
    s.bodyLift = bodyLiftMag;
    s.flapLift = flapLiftMag;
    s.flapDrag = Cd * q * flapDragArea;
    s.ax = orbitalStep.ax;
    s.az = orbitalStep.az;
    s.nonGravAx = orbitalStep.nonGravAx;
    s.nonGravAz = orbitalStep.nonGravAz;
    s.speed = speed;
    resolveTowerContactPhysics(dt);
}

function constrainDockedProbeTarget() {
    const target = probeDocking.target;
    if (!target) return;
    const chaserPort = getProbeDockingPort(s);
    const targetAngle = wrapAngle(s.a + Math.PI);
    const targetPort = getProbeDockingPort({ x: 0, z: 0, vx: 0, vz: 0, a: targetAngle, w: 0 });
    const targetCenterX = chaserPort.x - targetPort.offset.x;
    const targetCenterZ = chaserPort.z - targetPort.offset.z;
    const offsetX = targetCenterX - s.x;
    const offsetZ = targetCenterZ - s.z;
    target.x = physicsCore.wrapWorldX(targetCenterX);
    target.z = targetCenterZ;
    // A docked pair is one rigid body: the target's centre carries the
    // tangential ω × r velocity caused by the chaser's rotation.
    target.vx = s.vx + s.w * offsetZ;
    target.vz = s.vz - s.w * offsetX;
    target.a = targetAngle;
    target.w = s.w;
    target.speed = Math.hypot(target.vx, target.vz);
    target.mode = "PROBE DOCKED";
    target.msg = "ACOPLADA À SONDA CHASER";
}

function tryProbeDocking(metrics = getProbeDockingMetrics()) {
    const target = probeDocking.target;
    if (!target || probeDocking.docked || !metrics) return false;
    const contact = getProbeRendezvousContactConfig();
    if (
        metrics.portDistance > contact.captureRadius ||
        metrics.relativeSpeed > PROBE_DOCKING_MAX_RELATIVE_SPEED ||
        metrics.alignmentError > PROBE_DOCKING_MAX_ALIGNMENT_ERROR
    ) {
        return false;
    }

    // The latch is a completely inelastic handoff. Preserve the pair's
    // linear momentum before constraining its two ports together.
    const chaserMass = getVehicleMass();
    const targetMass = probeConfig.mass;
    const totalMass = Math.max(Number.EPSILON, chaserMass + targetMass);
    const chaserInertia = physicsCore.getPlanarMomentOfInertia(chaserMass, shipRegistry.probe_satellite.dimensions);
    const targetInertia = physicsCore.getPlanarMomentOfInertia(targetMass, shipRegistry.probe_satellite.dimensions);
    s.vx = (s.vx * chaserMass + target.vx * targetMass) / totalMass;
    s.vz = (s.vz * chaserMass + target.vz * targetMass) / totalMass;
    s.w = (s.w * chaserInertia + target.w * targetInertia) / Math.max(Number.EPSILON, chaserInertia + targetInertia);
    probeDocking.docked = true;
    probeDocking.lastContact = null;
    probeDocking.status = "ACOPLAMENTO CONFIRMADO | portas frontais travadas";
    constrainDockedProbeTarget();
    return true;
}

function updateProbeDockingFlight(dt) {
    const target = probeDocking.target;
    if (!target || !isProbeSelected()) return;
    if (probeDocking.docked) {
        constrainDockedProbeTarget();
        updateProbeDockingReadout();
        return;
    }

    // The target is a passive free-flying copy of the probe. At orbital
    // altitude its drag is normally zero, but using the same propagator keeps
    // its motion consistent if the pair is positioned lower.
    const atmosphere = physicsCore.getAtmosphere(target, environment.getWindAt(target));
    const dimensions = shipRegistry.probe_satellite.dimensions;
    const dragArea = Math.max(0.15, Math.PI * (dimensions.diameter / 2) ** 2 * 0.55);
    const aerodynamic = physicsCore.getAerodynamicForce(atmosphere, {
        dragCoefficient: Cd,
        dragArea,
        exposure: clamp((80000 - target.z) / 10000, 0, 1),
    });
    physicsCore.step(target, dt, {
        mass: probeConfig.mass,
        forceX: aerodynamic.x,
        forceZ: aerodynamic.z,
        angularAcceleration: 0,
    });
    target.q = atmosphere.dynamicPressure;
    target.speed = atmosphere.speed;
    const metrics = getProbeDockingMetrics();
    // A rendezvous that is already within the quiet capture envelope latches
    // directly. Anything faster or misaligned receives the reusable soft
    // Newtonian contact response instead of becoming a fatal collision.
    if (!tryProbeDocking(metrics)) {
        resolveProbeRendezvousContact(metrics);
    }
    updateProbeDockingReadout();
}

function recordTelemetry() {
    telemetryStore.followingLive = graphFollowingLive;
    telemetryStore.recordPrimary({
        t: simTime,
        alt: nav.z,
        radar: sensors.radar.altitude,
        vx: nav.vx,
        vz: nav.vz,
        th: s.throttle * 100,
        tvc: s.gimbal * 57.3,
        ang: Math.abs(wrapAngle(nav.a)) * 57.3,
        nose: s.noseFlap * 100,
        tail: s.tailFlap * 100,
        rcs: s.rcs * 100,
        q: nav.q,
        loxKg: getSelectedShipPropulsion() ? s.propellant.main.loxKg + s.propellant.header.loxKg : null,
        lch4Kg: getSelectedShipPropulsion() ? s.propellant.main.lch4Kg + s.propellant.header.lch4Kg : null,
        propellantTank: s.propellant?.activeTank ?? null,
        mode: controlState.mode,
        towerDx: sensors.platformLink.xError,
        towerDz: sensors.platformLink.zError,
        towerArm: sensors.platformLink.armClosure * 100,
    });

    graphOffset = telemetryStore.graphOffset;
    graphFollowingLive = telemetryStore.followingLive;
}

function recordBoosterTelemetry(booster) {
    const state = booster?.state;
    if (!state) return;
    const propellant = state.propellant?.main;
    telemetryStore.recordBooster({
        instance: "B7",
        t: simTime,
        alt: state.z,
        vx: state.vx,
        vz: state.vz,
        th: (state.throttle ?? 0) * 100,
        tvc: (state.gimbal ?? 0) * 57.3,
        ang: Math.abs(wrapAngle(state.a ?? 0)) * 57.3,
        nose: (state.noseFlap ?? 0) * 100,
        tail: (state.tailFlap ?? 0) * 100,
        rcs: (state.rcs ?? 0) * 100,
        q: 0.5 * rho(state.z) * ((state.vx - environment.wind.x) ** 2 + (state.vz - environment.wind.z) ** 2),
        loxKg: propellant?.loxKg ?? null,
        lch4Kg: propellant?.lch4Kg ?? null,
        mode: state.mode,
    });
}

function getLandingOutcome(x, vx, vz, angle) {
    if (isCapturePlatformActive()) {
        const reasons = ["tocou o solo antes da captura"];
        const captureAxisX = flightController.getActualPlatformState()?.captureX ?? TOWER_WORLD_X;
        const towerOffset = x - captureAxisX;

        if (Math.abs(vz) >= 2) {
            reasons.push(`velocidade vertical excessiva (${Math.abs(vz).toFixed(1)} m/s)`);
        }

        if (Math.abs(vx) >= 3) {
            reasons.push(`velocidade horizontal excessiva (${Math.abs(vx).toFixed(1)} m/s)`);
        }

        if (Math.abs(angle) >= 0.2) {
            reasons.push(`inclinação excessiva (${Math.abs(angle * 57.3).toFixed(1)}°)`);
        }

        if (Math.abs(towerOffset) >= TARGET_TOLERANCE) {
            reasons.push(`fora do eixo da plataforma (${Math.abs(towerOffset).toFixed(1)} m)`);
        }

        return {
            success: false,
            title: "FALHA NA CAPTURA",
            detail: `Motivo: ${reasons.join(" | ")}`,
            status: reasons[0],
        };
    }

    const reasons = [];
    const targetOffset = x - landingTargetX;

    if (Math.abs(vz) >= 2) {
        reasons.push(`velocidade vertical excessiva (${Math.abs(vz).toFixed(1)} m/s)`);
    }

    if (Math.abs(vx) >= 3) {
        reasons.push(`velocidade horizontal excessiva (${Math.abs(vx).toFixed(1)} m/s)`);
    }

    if (Math.abs(angle) >= 0.2) {
        reasons.push(`inclinação excessiva (${Math.abs(angle * 57.3).toFixed(1)}°)`);
    }

    if (Math.abs(targetOffset) >= TARGET_TOLERANCE) {
        reasons.push(`fora do alvo (${Math.abs(targetOffset).toFixed(1)} m)`);
    }

    if (reasons.length === 0) {
        return {
            success: true,
            title: "POUSO BEM-SUCEDIDO",
            detail: `Toque dentro dos limites e a ${Math.abs(targetOffset).toFixed(1)} m do alvo`,
            status: "LANDING SUCCESS",
        };
    }

    return {
        success: false,
        title: "FALHA NO POUSO",
        detail: `Motivo: ${reasons.join(" | ")}`,
        status: reasons[0],
    };
}

function finishIfCaptured() {
    const actualPlatformState = flightController.getActualPlatformState() ?? getPlatformLinkDefaults();

    if (!isCapturePlatformActive() || !actualPlatformState.captured || !actualPlatformState.shutdownAuthorized || s.end) {
        return;
    }

    s.end = true;
    keepRunningForOtherInstance();
    manualEngineActive = false;
    updateManualEngineUI();

    physicsCore.freeze(s, { x: actualPlatformState.captureX, z: actualPlatformState.captureZ, a: 0 });
    s.throttle = 0;
    s.gimbal = 0;
    s.rcs = 0;
    s.engineOn = false;
    s.captured = true;
    s.landingSuccess = true;
    s.resultTitle = "CAPTURA BEM-SUCEDIDA";
    s.resultDetail = `${getSelectedPlatformLabel()} capturou a nave em ${TOWER_WORLD_X.toFixed(0)} m e desligou os motores`;
    s.msg = "CAPTURE SUCCESS";
    s.mode = "CAPTURED";

    controlState = {
        ...controlState,
        mode: s.mode,
        status: s.msg,
        targetX: actualPlatformState.captureX,
        targetZ: actualPlatformState.captureZ,
    };
}

function finishIfCollisionFailure() {
    if (!s.collisionFailure || s.end) {
        return false;
    }

    s.end = true;
    keepRunningForOtherInstance();
    manualEngineActive = false;
    updateManualEngineUI();
    physicsCore.freeze(s);
    s.throttle = 0;
    s.gimbal = 0;
    s.engineOn = false;
    s.landingSuccess = false;
    s.resultTitle = "COLISÃO COM A TORRE";
    s.resultDetail = "Impacto estrutural detectado: captura cancelada";
    s.msg = "COLISÃO ESTRUTURAL";
    s.mode = "TOWER COLLISION";
    controlState = { ...controlState, mode: s.mode, status: s.msg };
    return true;
}

function hasLiveDetachedBooster() {
    return Boolean(detachedBoosterFlight?.state && !detachedBoosterFlight.state.end);
}

function keepRunningForOtherInstance() {
    if (hasLiveDetachedBooster()) {
        // The selected ship may be gone, but B7 is a separate simulation
        // endpoint and must keep receiving its controller updates.
        started = true;
        paused = false;
        pauseBtn.disabled = false;
        return true;
    }
    started = false;
    paused = true;
    pauseBtn.disabled = true;
    return false;
}

function isWaterLandingZone(worldX) {
    return scene.isWaterAt(worldX);
}

function getWaterLandingOutcome(vx, vz) {
    const reasons = [];

    if (Math.abs(vz) >= 2) {
        reasons.push(`velocidade vertical excessiva (${Math.abs(vz).toFixed(1)} m/s)`);
    }

    if (Math.abs(vx) >= 3) {
        reasons.push(`velocidade horizontal excessiva (${Math.abs(vx).toFixed(1)} m/s)`);
    }

    if (reasons.length > 0) {
        return {
            success: false,
            title: "FALHA NA AMERRISSAGEM",
            detail: `Motivo: ${reasons.join(" | ")}`,
            status: reasons[0],
        };
    }

    return {
        success: true,
        title: "AMERRISSAGEM BEM-SUCEDIDA",
        detail: "Toque na água dentro do limite de velocidade; nave sem sustentação vertical, tombando.",
        status: "AMERRISSAGEM CONTROLADA",
    };
}

function beginWaterLanding(groundClearance) {
    const outcome = getWaterLandingOutcome(s.vx, s.vz);

    physicsCore.placeOnSurface(s, groundClearance);
    s.throttle = 0;
    s.gimbal = 0;
    s.rcs = 0;
    s.engineOn = false;
    s.landingSuccess = outcome.success;
    s.resultTitle = outcome.title;
    s.resultDetail = outcome.detail;
    s.msg = outcome.status;
    s.waterImpact = { vx: s.vx, vz: s.vz };

    if (!outcome.success) {
        s.end = true;
        keepRunningForOtherInstance();
        s.mode = "WATER IMPACT FAILURE";
        controlState = { ...controlState, mode: s.mode, status: outcome.status };
        return;
    }

    s.waterLanding = true;
    s.waterFloating = false;
    const baseOffset = getVehicleRestingCenterAltitude();
    // Local +Y is the engine/base direction.  Store its world-space X and put
    // it just under the water line before the capsizing rotation begins.
    s.waterPivot = {
        x: s.x - baseOffset * Math.sin(s.a),
        z: -2.5,
    };
    physicsCore.constrainToPivot(s, s.waterPivot, baseOffset);
    s.waterTouchdownTime = simTime;
    s.mode = "AMERRISSAGEM";
    controlState = {
        ...controlState,
        mode: s.mode,
        status: outcome.status,
    };
}

function finishWaterLandingIfComplete() {
    if (!s.waterLanding || s.end || s.waterTouchdownTime === null) {
        return;
    }

    if (s.waterFloating) {
        const floatingElapsed = simTime - (s.waterFloatingTime ?? simTime);
        if (!s.waterLandingCertified && floatingElapsed >= 10) {
            s.waterLandingCertified = true;
            s.landingSuccess = true;
            s.mode = "AMERRISSAGEM CONFIRMADA";
            s.msg = "AMERRISSAGEM BEM-SUCEDIDA | 10 s de flutuação estável confirmados";
            s.resultTitle = "AMERRISSAGEM BEM-SUCEDIDA";
            s.resultDetail = "Nave permaneceu boiando de forma estável por 10 segundos.";
            controlState = { ...controlState, mode: s.mode, status: s.msg };
        }
        return;
    }

    const elapsed = simTime - s.waterTouchdownTime;
    const toppled = Math.abs(s.a) >= 1.42;

    if (!toppled && elapsed < 3.2) {
        return;
    }

    s.waterFloating = true;
    s.waterFloatingTime = simTime;
    // Preserve a small part of the rotational/horizontal energy as wave
    // motion, but remove the rigid support constraint at the base.
    s.waterPivot = null;
    physicsCore.scaleMotion(s, { w: 0.25, vz: 0.3 });
    s.mode = "NAVE BOIANDO";
    s.msg = "AMERRISSAGEM | nave boiando; aguardando 10 s para confirmação";
    s.resultTitle = "";
    s.resultDetail = "";
    controlState = { ...controlState, mode: s.mode, status: s.msg };
}

function finishIfLanded() {
    const groundClearance = getVehicleGroundClearance();

    if (s.waterLanding) {
        return;
    }

    if (s.z - groundClearance > 0) {
        return;
    }

    // Keep the physical centre at the altitude that places the lowest point
    // of the vehicle exactly on the ground plane (Z = 0).
    physicsCore.placeOnSurface(s, groundClearance);

    if (isTestHopProgramSelected() && controlState?.sequencePhase === "ASCENT" && simTime < 1.5) {
        physicsCore.placeOnSurface(s, groundClearance, { stopDescending: true });
        return;
    }

    if (isWaterLandingZone(s.x)) {
        beginWaterLanding(groundClearance);
        return;
    }

    s.end = true;
    keepRunningForOtherInstance();

    const outcome = getLandingOutcome(s.x, s.vx, s.vz, s.a);

    physicsCore.freeze(s, { x: s.x, z: s.z, a: s.a });
    s.throttle = 0;
    s.engineOn = false;

    s.landingSuccess = outcome.success;
    s.resultTitle = outcome.title;
    s.resultDetail = outcome.detail;
    s.msg = outcome.status;
    s.mode = outcome.success ? "LANDED" : "FAILED";
    controlState = {
        ...controlState,
        mode: s.mode,
        status: outcome.status,
    };
}

function separateSuperHeavyStack() {
    if (!controlState?.stageSeparation || !isSuperHeavySelected() || !stackMission.attachS24 || stackMission.separated) {
        return false;
    }

    // Hot-staging lights the S24 engines before the vehicles fully clear one
    // another.  Model the separation impulse explicitly, then give B7 its
    // own boostback controller while S24 becomes the active vehicle.
    const boosterProfile = getSelectedShipProfile();
    const boosterController = getSelectedShipController();
    const hotstageBoostback = isStackHotstageBoostbackProgramSelected() || isSuborbitalMissionProgramSelected();
    const separationX = s.x;
    const separationZ = s.z;
    const separationAxisX = Math.sin(s.a);
    const separationAxisZ = Math.cos(s.a);
    const boosterLength = boosterProfile.dimensions?.length ?? boosterProfile.length ?? 70;
    const shipLength = shipRegistry.starship_ship24.dimensions?.length ?? shipRegistry.starship_ship24.length ?? 50;
    // These are the same centres used by drawDockedStarship.  Starting the
    // two free bodies here makes the visual handoff continuous rather than
    // jumping them 120 m apart in one simulation frame.
    const upperStageOffset = boosterLength / 2 + shipLength / 2 - 1.5;
    const hotstageSeparationImpulse = hotstageBoostback ? 10 : 3;
    const boosterSeparationImpulse = hotstageBoostback ? 3.5 : 1;
    setDetachedBoosterFlight({
        profile: boosterProfile,
        controller: boosterController,
        state: {
            x: separationX,
            z: separationZ,
            vx: s.vx - separationAxisX * boosterSeparationImpulse,
            vz: s.vz - separationAxisZ * boosterSeparationImpulse,
            a: s.a,
            w: s.w,
            throttle: 0,
            gimbal: 0,
            noseFlap: s.noseFlap,
            tailFlap: s.tailFlap,
            rcs: s.rcs,
            engineOn: false,
            propellant: {
                main: { ...s.propellant.main },
                header: { ...s.propellant.header },
            },
            end: false,
            mode: "SEPARADO",
            status: hotstageBoostback ? "B7 separando | hot-staging concluído | boostback armado" : "B7 separando",
        },
    });
    // The hot-stage ring is passive, but still follows the same gravity,
    // curvature and atmospheric-drag laws as every other free body.
    setHotStageRingFlight({
        x: separationX + separationAxisX * (boosterLength / 2 + 1.5),
        z: separationZ + separationAxisZ * (boosterLength / 2 + 1.5),
        vx: s.vx,
        vz: s.vz - 2,
        a: s.a,
        w: 0.18,
        mass: 9000,
        dragArea: 42,
        dragCoefficient: 1.2,
        end: false,
    });
    stackMission.separated = true;
    stackMission.boosterRecovery = flightControlState.boosterRecovery;
    stackMission.boostbackReturn = hotstageBoostback;
    // S24 continues downrange after hot-staging.  The active visual task is
    // B7's flip/entry/landing, so transfer the camera to its independent
    // instance automatically; S24 remains selectable in the tracker.
    followedInstanceId = "b7";
    sceneFocusX = null;
    flightControlState.selectedShipId = "starship_ship24";
    flightControlState.flightProgramProfile = FLIGHT_PROGRAM_PROFILES.REENTRY;
    shipSelect.value = flightControlState.selectedShipId;
    flightProgramProfileSelect.value = flightControlState.flightProgramProfile;
    syncFlightControllerConfig();

    s = createState({
        x: separationX + separationAxisX * upperStageOffset,
        z: separationZ + separationAxisZ * upperStageOffset,
        vx: s.vx + separationAxisX * hotstageSeparationImpulse,
        vz: s.vz + separationAxisZ * hotstageSeparationImpulse,
        // S24 departs in the same inertial attitude as the stack.  Its own
        // transfer controller may pitch later; separation itself adds no
        // artificial rotation.
        a: s.a,
        w: 0,
        noseFlap: 0.72,
        tailFlap: 0.72,
        // The ignition happens while still physically coupled.  Once free,
        // S24 coasts along the inherited parabola until apogee.
        engineOn: false,
        throttle: 0,
        hotStagePlumeTimer: hotstageBoostback ? 3.2 : 0,
        upperStageTransfer: hotstageBoostback,
        msg: hotstageBoostback
            ? `HOT-STAGING CONCLUÍDO | anel descartado | B7 em boostback | S24 afastando`
            : `SEPARAÇÃO CONCLUÍDA | B7: ${stackMission.boosterRecovery === "tower_catch" ? "captura na torre" : "amerrissagem"} | S24 em reentrada`,
        mode: hotstageBoostback ? "S24 HOT-STAGING" : "S24 REENTRY",
    });
    nav = createEstimator(s);
    sensors = createSensors();
    resetFlightControllerEndpoints();
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
        upperStageTransfer: hotstageBoostback,
        indianOceanTargetX: INDIAN_OCEAN_TARGET_X,
    });
    updateSuperHeavyStackPanel();
    syncFlightProgramControls();
    return true;
}

function updateDetachedBoosterFlight(dt) {
    const booster = detachedBoosterFlight;
    if (!booster || booster.state.end) return;

    const state = booster.state;
    const propellantMass = state.propellant.main.loxKg + state.propellant.main.lch4Kg;
    const mass = booster.profile.mass + propellantMass;
    if (state.waterLanding) {
        updateBoosterWaterLanding(booster, mass, dt);
        recordBoosterTelemetry(booster);
        return;
    }
    const maxThrust = booster.profile.propulsion.engines.count * booster.profile.propulsion.engines.thrustN;
    const approachConfig = readTowerApproachConfig();
    const relativeVx = state.vx - environment.wind.x;
    const relativeVz = state.vz - environment.wind.z;
    const boosterSensors = {
        airdata: {
            dynamicPressure: 0.5 * rho(state.z) * (relativeVx * relativeVx + relativeVz * relativeVz),
            speed: Math.hypot(relativeVx, relativeVz),
        },
        attitude: { angle: state.a },
    };
    const remoteSession = flightController.updateRemoteShipCommand(
        "superheavy_b7",
        dt,
        state,
        boosterSensors,
        {
            started: true,
            mass,
            maxThrust,
            g: G,
            detachedReturn: true,
            boostbackReturn: stackMission.boostbackReturn,
            boosterRecovery: stackMission.boosterRecovery,
            captureHeight: getSelectedPlatformCaptureHeight(),
            windX: environment.wind.x,
        },
        {
            targetX: TOWER_WORLD_X,
            failures: { link: towerFailureConfig.link, arms: towerFailureConfig.arms },
            falseAuthorizationActive: falseTowerAuthorizationActive,
            approachDistance: approachConfig.distance,
            approachAngleDeg: approachConfig.angleDeg,
            approachTolerance: approachConfig.tolerance,
            machineInputs: flightController.createPlatformPhysicalInterlock(state),
        }
    );
    const towerLink = remoteSession.downlink ?? getBoosterTowerLink();
    booster.towerLink = towerLink;
    const command = remoteSession.command;
    state.mode = command.mode;
    state.status = command.status;
    state.engineOn = Boolean(command.engineOn);
    state.throttle = command.throttleTarget ?? command.throttle ?? 0;
    state.gimbal = command.gimbalTarget ?? command.gimbal ?? 0;
    // Boostback-specific commands use *Target fields, while the shared
    // Starship recovery controller returns the actuator values directly.
    // Accept both contracts so B7 never silently loses RCS/flap authority
    // during the handoff to the tower-approach controller.
    state.noseFlap = moveToward(state.noseFlap ?? 0, command.noseTarget ?? command.noseFlap ?? 0, command.flapRate ?? 2.8, dt);
    state.tailFlap = moveToward(state.tailFlap ?? 0, command.tailTarget ?? command.tailFlap ?? 0, command.flapRate ?? 2.8, dt);
    state.rcs = moveToward(state.rcs ?? 0, command.rcsTarget ?? command.rcs ?? 0, 7.5, dt);
    // The detached booster must use the attitude command generated by its
    // own controller.  The previous hard-coded `-state.a` spring always
    // forced it upright, cancelling the RCS flip and leaving boostback thrust
    // nearly vertical (which sent B7 to an unrealistic >200 km coast).
    const atmosphere = physicsCore.getAtmosphere(state, environment.getWindAt(state));
    const airspeed = atmosphere.speed;
    const q = atmosphere.dynamicPressure;
    const flowAngle = atmosphere.flowAngle;
    const aoa = wrapAngle(state.a - flowAngle);
    const flapAverage = 0.5 * ((state.noseFlap ?? 0) + (state.tailFlap ?? 0));
    const flapDifferential = (state.tailFlap ?? 0) - (state.noseFlap ?? 0);
    const dragArea = 78 + 160 * Math.abs(Math.sin(aoa)) + 90 * flapAverage;
    // Grid fins act as a differential aerodynamic control surface.  Their
    // authority rises naturally with q instead of being a timed animation.
    const finLiftMagnitude = q * 145 * flapDifferential;
    const aerodynamic = physicsCore.getAerodynamicForce(atmosphere, {
        dragCoefficient: Cd,
        dragArea,
        liftMagnitude: finLiftMagnitude,
    });
    const aeroBlend = clamp(q / 5200, 0, 1);
    // Cold-gas RCS turns the vehicle in thin air.  It is deliberately faded
    // out as grid-fin authority grows, rather than competing with it or
    // forcing a hidden upright attitude.
    const rcsTorque = state.rcs * 5.2 * (1 - aeroBlend * 0.9);
    const aeroTorque = aeroBlend * (-aoa * 4.1 + flapDifferential * 8.2 - state.w * 1.45);
    const tvcTorque = state.engineOn
        ? clamp((state.gimbal ?? 0) / MAX_GIMBAL, -1, 1) * (2.2 + state.throttle * 3.8)
        : 0;
    const attitudeDamping = -state.w * 0.32;
    const thrust = physicsCore.getThrustForce(state, maxThrust);
    // Use air-relative forces on both axes.  The old X-only damping made a
    // crosswind visually and physically disappear from B7's descent.
    physicsCore.step(state, dt, {
        mass,
        forceX: thrust.x + aerodynamic.x,
        forceZ: thrust.z + aerodynamic.z,
        angularAcceleration: rcsTorque + aeroTorque + tvcTorque + attitudeDamping,
    });
    // The controller status reports its setpoint in m/s.  Pair it with the
    // measured rate so the floating B7 label cannot be mistaken for a second
    // (and apparently conflicting) telemetry source in km/h.
    state.status = `${command.status} | VZ real ${state.vz.toFixed(1)} m/s`;

    if (state.engineOn && state.throttle > 0.02) {
        const propulsion = booster.profile.propulsion;
        const totalFlow = thrust.magnitude / (propulsion.engines.specificImpulseSeconds * 9.80665);
        const lch4Flow = totalFlow / (1 + propulsion.mixtureRatio);
        const loxFlow = totalFlow - lch4Flow;
        const burnTime = Math.min(dt,
            state.propellant.main.loxKg / Math.max(loxFlow, Number.EPSILON),
            state.propellant.main.lch4Kg / Math.max(lch4Flow, Number.EPSILON));
        state.propellant.main.loxKg = Math.max(0, state.propellant.main.loxKg - loxFlow * burnTime);
        state.propellant.main.lch4Kg = Math.max(0, state.propellant.main.lch4Kg - lch4Flow * burnTime);
        if (burnTime < dt) state.engineOn = false;
    }

    recordBoosterTelemetry(booster);

    const towerCaptureRequested = stackMission.boosterRecovery === "tower_catch";
    const towerCaptureAvailable = towerCaptureRequested && towerLink.available && towerLink.linkAccepted;
    const captureZ = towerLink.captureZ ?? getSelectedPlatformCaptureHeight();
    const captureX = towerLink.captureX ?? TOWER_WORLD_X;
    const captureEnvelopeSatisfied =
        Math.abs(state.x - captureX) <= 14 &&
        Math.abs(state.vx) <= 3 &&
        Math.abs(state.vz) <= 3 &&
        Math.abs(wrapAngle(state.a)) <= 0.14;
    // A detached stage has its own physics loop, so it must own a definite
    // ground terminal condition.  Previously `captureZ` could be undefined,
    // allowing it to fall forever; another branch repeatedly lifted it above
    // the tower, producing the apparent approach "jump".
    const waterlineCenterZ = getBoosterWaterlineCenter(booster.profile, state.a);
    if (towerCaptureAvailable && state.z <= captureZ && captureEnvelopeSatisfied) {
        physicsCore.freeze(state, { x: state.x, z: captureZ, a: state.a });
        state.engineOn = false;
        state.end = true;
        state.status = "B7 capturado via link da torre";
        return;
    }
    // A valid radio link is not a physical catch.  Missing the capture
    // envelope must never teleport/freeze B7 at the tower height; it keeps
    // flying and reaches the same water-impact dynamics as Starship.
    if (state.z <= waterlineCenterZ) {
        beginBoosterWaterLanding(booster);
        return;
    }
    if (towerCaptureAvailable && state.z <= captureZ) {
        state.status = "B7 fora da janela de captura | prosseguindo para amerrissagem";
    }
}

function beginBoosterWaterLanding(booster) {
    const state = booster.state;
    const baseOffset = getBoosterWaterlineCenter(booster.profile, state.a);
    const outcome = getWaterLandingOutcome(state.vx, state.vz);
    state.engineOn = false;
    state.throttle = 0;
    state.gimbal = 0;
    state.rcs = 0;
    state.landingSuccess = outcome.success;
    state.resultTitle = outcome.title;
    state.resultDetail = outcome.detail;
    state.landingOutcomeStatus = outcome.status;
    state.waterLanding = true;
    state.waterFloating = false;
    state.waterTouchdownTime = simTime;
    state.waterImpact = { vx: state.vx, vz: state.vz };
    state.waterPivot = {
        x: state.x - baseOffset * Math.sin(state.a),
        z: -2.5,
    };
    physicsCore.constrainToPivot(state, state.waterPivot, baseOffset);
    state.mode = "B7 AMERRISSAGEM";
    state.status = !outcome.success
        ? `B7 ${outcome.status} | dinâmica de água mantida`
        : stackMission.boosterRecovery === "tower_catch"
        ? "B7 em amerrissagem de contingência | captura indisponível"
        : "B7 AMERRISSAGEM | tombamento controlado";
}

function getBoosterWaterlineCenter(profile, angle) {
    const dimensions = profile.dimensions ?? { length: profile.length, diameter: profile.diameter };
    const uprightExtent = dimensions.length / 2 + 2.5;
    const sidewaysExtent = dimensions.diameter / 2;
    // Project the same rectangular body used by the Super Heavy renderer onto
    // the vertical axis. Upright it rests on its engine skirt; horizontal it
    // rides at roughly half its diameter, rather than floating one body length
    // above the water.
    return Math.abs(Math.cos(angle)) * uprightExtent + Math.abs(Math.sin(angle)) * sidewaysExtent;
}

function updateBoosterWaterLanding(booster, mass, dt) {
    const state = booster.state;
    const baseOffset = getBoosterWaterlineCenter(booster.profile, state.a);
    const water = physicsCore.getWaterForces({
        mass,
        gravity: G,
        simTime,
        waterTouchdownTime: state.waterTouchdownTime,
        waterFloating: state.waterFloating,
        hasWaterPivot: Boolean(state.waterPivot),
        impactVx: state.waterImpact?.vx,
        x: state.x,
        centerZ: state.z,
        vx: state.vx,
        vz: state.vz,
        angle: state.a,
        angularVelocity: state.w,
        floatCenterZ: baseOffset - 2.5,
    });
    physicsCore.step(state, dt, {
        mass,
        forceX: water.forceX,
        forceZ: water.forceZ,
        angularAcceleration: water.angularAcceleration - state.w * 0.8,
    });
    const rotatedBaseOffset = getBoosterWaterlineCenter(booster.profile, state.a);
    if (!state.waterFloating && state.waterPivot) {
        physicsCore.constrainToPivot(state, state.waterPivot, rotatedBaseOffset);
    }
    const elapsed = simTime - state.waterTouchdownTime;
    if (!state.waterFloating && (Math.abs(state.a) >= 1.42 || elapsed >= 3.2)) {
        state.waterFloating = true;
        state.waterPivot = null;
        physicsCore.scaleMotion(state, { w: 0.25, vz: 0.3 });
        state.mode = "B7 BOIANDO";
        state.status = state.landingSuccess
            ? "B7 amerrissado | flutuando"
            : `B7 ${state.landingOutcomeStatus} | flutuando após impacto`;
    }
    if (state.waterFloating && elapsed >= 10 && !state.waterLandingCertified) {
        state.waterLandingCertified = true;
        if (state.landingSuccess) {
            state.resultTitle = "AMERRISSAGEM B7 BEM-SUCEDIDA";
            state.resultDetail = "B7 permaneceu flutuando de forma estável por 10 segundos.";
            state.status = "B7 amerrissagem confirmada | flutuação estável";
        } else {
            state.status = `B7 ${state.landingOutcomeStatus} | flutuação observada`;
        }
    }
}

function updateHotStageRingFlight(dt) {
    const ring = hotStageRingFlight;
    if (!ring || ring.end) return;
    const atmosphere = physicsCore.getAtmosphere(ring, environment.getWindAt(ring));
    const aerodynamic = physicsCore.getAerodynamicForce(atmosphere, {
        dragCoefficient: ring.dragCoefficient,
        dragArea: ring.dragArea,
    });
    physicsCore.step(ring, dt, {
        mass: ring.mass,
        forceX: aerodynamic.x,
        forceZ: aerodynamic.z,
        angularAcceleration: 0,
    });
    if (ring.z < -120) ring.end = true;
}

function step(dt) {
    // requestAnimationFrame can share the exact timestamp of the callback
    // that arms a mission.  Do not hand a zero/negative step to the physical
    // integrator: it correctly rejects invalid time deltas, while the flight
    // update expects a populated acceleration result.
    if (!Number.isFinite(dt) || dt <= 0) return;

    if (s.end) {
        // Do not freeze the whole mission when the selected vehicle has
        // finished or failed: a detached B7 remains a live flight instance.
        if (hasLiveDetachedBooster()) {
            refreshPlatformState(dt);
            updateDetachedBoosterFlight(dt);
            updateHotStageRingFlight(dt);
            simTime += dt;
            updateFlightProgramStatus();
            updateFlightControlSummary();
        } else {
            keepRunningForOtherInstance();
        }
        return;
    }

    updateSensors(dt);
    fuseSensors(dt);
    refreshPlatformState(dt);
    updatePlatformLink(dt);

    applyControl(dt);
    consumeSn15Propellant(dt);
    simulatePhysics(dt);
    updateProbeDockingFlight(dt);
    if (s.hotStagePlumeTimer > 0) {
        s.hotStagePlumeTimer = Math.max(0, s.hotStagePlumeTimer - dt);
    }
    updateDetachedBoosterFlight(dt);
    updateHotStageRingFlight(dt);
    if (separateSuperHeavyStack()) {
        return;
    }
    const altitudeAboveGround = Math.max(0, s.z - getVehicleGroundClearance());
    if (sim > 1 && s.vz < 0 && altitudeAboveGround <= AUTO_SLOWDOWN_ALTITUDE) {
        sim = 1;
        updateSimulationSpeedUI();
    }
    refreshPlatformState(0);
    platformMachineInputs = createPlatformMachineInputs();
    simTime += dt;
    s.msg = s.propellant?.depleted
        ? `PROPULSANTE ESGOTADO | tanque ${s.propellant.activeTank === "header" ? "DE CABECEIRA" : "PRINCIPAL"}`
        : controlState.status;
    recordTelemetry();
    terraMapView?.recordState(getTerraMapState());
    if (performance.now() - lastTrajectoryPredictionWallTime >= 750) {
        updateVehicleTrajectoryPredictions();
        lastTrajectoryPredictionWallTime = performance.now();
    }
    updateFlightProgramStatus();
    updateFlightControlSummary();

    if (finishIfCollisionFailure()) {
        return;
    }

    if (isCapturePlatformActive() && platformState.captured && platformState.shutdownAuthorized) {
        finishIfCaptured();
        return;
    }

    finishIfLanded();
    finishWaterLandingIfComplete();
}

// Vehicle, tower and HUD rendering live in renderer.js. This file retains the
// mission state and invokes the exported drawing functions from draw().

    Object.assign(window, {
        n,
        createState,
        isTestHopProgramSelected,
        isBoostbackBurnProgramSelected,
        isStackHotstageBoostbackProgramSelected,
        isSuborbitalMissionProgramSelected,
        createStandbyState,
        createTestHopStartState,
        createEstimator,
        createSensor,
        createSensors,
        setSensorValue,
        sampleIMU,
        sampleGPS,
        sampleRadar,
        sampleAirdata,
        sampleAttitude,
        primeSensors,
        updateSensor,
        updateSensors,
        updatePlatformLink,
        updateTowerLink,
        fuseSensors,
        applyFailures,
        applyControl,
        getVehicleCollisionProfile,
        getTowerContactModel,
        getVehicleCollisionSamples,
        getVehicleGroundClearance,
        buildTowerArmCollisionRects,
        evaluateArmImpact,
        resolveTowerContactPhysics,
        simulatePhysics,
        constrainDockedProbeTarget,
        tryProbeDocking,
        updateProbeDockingFlight,
        recordTelemetry,
        recordBoosterTelemetry,
        getLandingOutcome,
        finishIfCaptured,
        finishIfCollisionFailure,
        hasLiveDetachedBooster,
        keepRunningForOtherInstance,
        isWaterLandingZone,
        getWaterLandingOutcome,
        beginWaterLanding,
        finishWaterLandingIfComplete,
        finishIfLanded,
        separateSuperHeavyStack,
        updateDetachedBoosterFlight,
        beginBoosterWaterLanding,
        getBoosterWaterlineCenter,
        updateBoosterWaterLanding,
        updateHotStageRingFlight,
        step,
    });
})();
