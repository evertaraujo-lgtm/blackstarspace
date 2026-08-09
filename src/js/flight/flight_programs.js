// Flight-program configuration and optimization routines.
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


