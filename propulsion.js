(function () {
function getVehiclePropellantCapacity(profile) {
    if (!profile?.propulsion) return 0;
    const { main, header } = profile.propulsion.tanks;
    return main.loxKg + main.lch4Kg + header.loxKg + header.lch4Kg;
}

function getAttachedS24Mass() {
    if (!isSuperHeavySelected() || !stackMission.attachS24 || stackMission.separated) return 0;
    const ship24 = shipRegistry.starship_ship24;
    return ship24.mass + getVehiclePropellantCapacity(ship24);
}

function getStackControlEnvironment() {
    return {
        stackAttached: isSuperHeavySelected() && stackMission.attachS24 && !stackMission.separated,
        stageSeparationAltitude: (isStackHotstageBoostbackProgramSelected() || isSuborbitalMissionProgramSelected()) ? 60000 : 10000,
        // Internal attitude is measured from vertical.  A visual flight-path
        // angle of 30° above the horizon is therefore 60° internally.
        stackHoldAngle: Math.PI / 3,
        boosterRecovery: flightControlState.boosterRecovery,
    };
}

function createPropellantState() {
    const propulsion = getSelectedShipPropulsion();
    if (!propulsion) {
        return null;
    }

    return {
        main: { ...propulsion.tanks.main },
        header: { ...propulsion.tanks.header },
        activeTank: "main",
        depleted: false,
    };
}

function getCurrentPropellantMass() {
    if (!s?.propellant) {
        return 0;
    }

    return s.propellant.main.loxKg + s.propellant.main.lch4Kg + s.propellant.header.loxKg + s.propellant.header.lch4Kg;
}

function getMainPropellantFraction() {
    const propulsion = getSelectedShipPropulsion();
    if (!s?.propellant?.main || !propulsion?.tanks?.main) return 1;
    const capacity = propulsion.tanks.main.loxKg + propulsion.tanks.main.lch4Kg;
    const remaining = s.propellant.main.loxKg + s.propellant.main.lch4Kg;
    return clamp(remaining / Math.max(capacity, 1), 0, 1);
}

function getVehicleMass() {
    // After capture the chaser is the simulated body of a rigid two-probe
    // stack. Keep the RCS acceleration and trajectory prediction consistent
    // with both physical instances, not only the controlled one.
    const dockedTargetMass = isProbeSelected() && probeDocking?.docked
        ? probeConfig.mass
        : 0;
    return Math.max(1, getSelectedShipMass() + getCurrentPropellantMass() + getAttachedS24Mass() + dockedTargetMass);
}

function getVehicleMaxThrust() {
    const propulsion = getSelectedShipPropulsion();
    return propulsion ? propulsion.engines.count * propulsion.engines.thrustN : TH;
}

function shouldUseHeaderTanks() {
    return !isSuperHeavySelected() && s?.propellant && (
        ["BELLYFLOP", "RECOVERY"].includes(controlState.sequencePhase) ||
        ["FLIP", "LANDING"].includes(controlState.mode)
    );
}

function consumeSn15Propellant(dt) {
    const propulsion = getSelectedShipPropulsion();
    if (!propulsion || !s.engineOn || s.throttle <= 0.02) {
        return;
    }

    const tankName = shouldUseHeaderTanks() ? "header" : "main";
    const tank = s.propellant[tankName];
    const thrust = getVehicleMaxThrust() * s.throttle;
    const totalFlow = thrust / (propulsion.engines.specificImpulseSeconds * 9.80665);
    const lch4Flow = totalFlow / (1 + propulsion.mixtureRatio);
    const loxFlow = totalFlow - lch4Flow;
    const availableBurnTime = Math.min(
        tank.loxKg / Math.max(loxFlow, Number.EPSILON),
        tank.lch4Kg / Math.max(lch4Flow, Number.EPSILON)
    );
    const burnTime = Math.min(dt, Math.max(0, availableBurnTime));

    tank.loxKg = Math.max(0, tank.loxKg - loxFlow * burnTime);
    tank.lch4Kg = Math.max(0, tank.lch4Kg - lch4Flow * burnTime);
    s.propellant.activeTank = tankName;

    if (burnTime < dt) {
        s.throttle *= burnTime / dt;
        if (s.throttle <= 0.02) {
            s.throttle = 0;
            s.engineOn = false;
            s.propellant.depleted = true;
            s.msg = `PROPULSANTE ESGOTADO | tanque ${tankName === "header" ? "DE CABECEIRA" : "PRINCIPAL"}`;
        }
    }
}

// Moved to renderer.js.

function updateSn15PropulsionPanel() {
    const propulsion = getSelectedShipPropulsion();
    const profile = getSelectedShipProfile();
    const isConfigurable = Boolean(propulsion);
    sn15PropulsionPanel.hidden = !isConfigurable;
    if (!isConfigurable) return;
    propulsionPanelTitle.textContent = `Propulsão ${profile.label}`;

    const values = [
        propulsion.engines.thrustN / 1e6,
        propulsion.engines.specificImpulseSeconds,
        propulsion.tanks.main.loxKg / 1000,
        propulsion.tanks.main.lch4Kg / 1000,
        propulsion.tanks.header.loxKg / 1000,
        propulsion.tanks.header.lch4Kg / 1000,
    ];
    sn15PropulsionInputs.forEach((input, index) => {
        input.disabled = started;
        if (document.activeElement !== input) input.value = String(values[index]);
    });
    if (isSuperHeavySelected()) {
        sn15MainLoxInput.max = "4000";
        sn15MainLch4Input.max = "1200";
    } else {
        sn15MainLoxInput.max = "2000";
        sn15MainLch4Input.max = "800";
    }

    const propellant = s?.propellant;
    const totalCapacity = Object.values(propulsion.tanks).reduce((total, tank) => total + tank.loxKg + tank.lch4Kg, 0);
    const remaining = propellant ? getCurrentPropellantMass() : totalCapacity;
    const engineLayout = propulsion.engines.vacuumCount
        ? `${propulsion.engines.seaLevelCount} SL + ${propulsion.engines.vacuumCount} VAC`
        : `${propulsion.engines.count} SL`;
    sn15PropulsionReadout.textContent = `${propulsion.engines.count} Raptors (${engineLayout}) · ${(getVehicleMaxThrust() / 1e6).toFixed(2)} MN · mistura LOX/LCH₄ ${propulsion.mixtureRatio}:1 · propelente ${(remaining / 1000).toFixed(1)} / ${(totalCapacity / 1000).toFixed(1)} t`;
    drawSn15TankDiagram(propulsion, propellant, profile.callsign);
}

function updateSuperHeavyStackPanel() {
    const superHeavy = isSuperHeavySelected();
    superHeavyStackPanel.hidden = !superHeavy;
    if (!superHeavy) return;

    superHeavyAttachS24Input.checked = stackMission.attachS24;
    superHeavyAttachS24Input.disabled = started;
    const ship24 = shipRegistry.starship_ship24;
    const s24Mass = ship24.mass + getVehiclePropellantCapacity(ship24);
    const totalMass = getSelectedShipMass() + getVehiclePropellantCapacity(getSelectedShipProfile()) + (stackMission.attachS24 ? s24Mass : 0);
    superHeavyStackReadout.textContent = stackMission.attachS24
        ? `Stack B7 + S24 armado · massa inicial aproximada ${(totalMass / 1000).toFixed(0)} t · ${isStackHotstageBoostbackProgramSelected() ? "perfil pré-órbita: 60 km / 5.800 km/h" : "separação nominal a 10 km"}.`
        : `B7 independente · massa inicial aproximada ${(totalMass / 1000).toFixed(0)} t.`;
}

function applySn15PropulsionPanelValues() {
    if (started || !getSelectedShipPropulsion()) return;
    const propulsion = getSelectedShipPropulsion();
    propulsion.engines.thrustN = clamp(Number(sn15EngineThrustInput.value) || 2.3, 1, 4) * 1e6;
    propulsion.engines.specificImpulseSeconds = clamp(Number(sn15IspInput.value) || 330, 200, 450);
    propulsion.tanks.main.loxKg = clamp(Number(sn15MainLoxInput.value) || 0, 0, isSuperHeavySelected() ? 4000 : 2000) * 1000;
    propulsion.tanks.main.lch4Kg = clamp(Number(sn15MainLch4Input.value) || 0, 0, isSuperHeavySelected() ? 1200 : 800) * 1000;
    propulsion.tanks.header.loxKg = clamp(Number(sn15HeaderLoxInput.value) || 0, 0, 200) * 1000;
    propulsion.tanks.header.lch4Kg = clamp(Number(sn15HeaderLch4Input.value) || 0, 0, 80) * 1000;
    if (s) s.propellant = createPropellantState();
    updateSn15PropulsionPanel();
    updateSuperHeavyStackPanel();
}

function getVehicleRestingCenterAltitude() {
    // The engine skirt extends below the cylindrical hull.
    return getSelectedShipDimensions().length / 2 + getSelectedShipGeometry().engineSkirtLength;
}

    Object.assign(window, {
        getVehiclePropellantCapacity,
        getAttachedS24Mass,
        getStackControlEnvironment,
        createPropellantState,
        getCurrentPropellantMass,
        getMainPropellantFraction,
        getVehicleMass,
        getVehicleMaxThrust,
        shouldUseHeaderTanks,
        consumeSn15Propellant,
        updateSn15PropulsionPanel,
        updateSuperHeavyStackPanel,
        applySn15PropulsionPanelValues,
        getVehicleRestingCenterAltitude,
    });
})();
