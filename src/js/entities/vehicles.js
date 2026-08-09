(function () {
    const DEFAULT_STARSHIP_GEOMETRY = Object.freeze({
        flaps: Object.freeze({ baseSpan: 1.5, extensionSpan: 6.5 }),
        capture: Object.freeze({ radialMargin: 2.3, flapExtension: 2.8, halfHeightFactor: 0.24 }),
        engineSkirtLength: 2.5,
    });

    /**
     * Immutable definition of a vehicle type.  It describes what the vehicle
     * is; the mutable flight state remains in the simulation state object.
     */
    class VehicleDefinition {
        constructor({ id, label, callsign, shortCode = callsign, vehicleClass, mass, dimensions, geometry, propulsion = null, rcs = null, dockingPort = null, isProbe = false, controller }) {
            this.id = id;
            this.label = label;
            this.callsign = callsign;
            this.shortCode = shortCode;
            this.vehicleClass = vehicleClass;
            this.mass = mass;
            this.dimensions = Object.freeze({ ...dimensions });
            this.geometry = Object.freeze({
                ...geometry,
                flaps: Object.freeze({ ...geometry.flaps }),
                capture: Object.freeze({ ...geometry.capture }),
            });
            this.propulsion = propulsion
                ? Object.freeze({
                    ...propulsion,
                    engines: Object.freeze({ ...propulsion.engines }),
                    tanks: Object.freeze({
                        main: Object.freeze({ ...propulsion.tanks.main }),
                        header: Object.freeze({ ...propulsion.tanks.header }),
                    }),
                })
                : null;
            this.rcs = rcs ? Object.freeze({ ...rcs }) : null;
            this.dockingPort = dockingPort ? Object.freeze({ ...dockingPort }) : null;
            this.isProbe = isProbe;
            this.controller = Object.freeze({ ...controller });
            Object.freeze(this);
        }

        get length() {
            return this.dimensions.length;
        }

        get diameter() {
            return this.dimensions.diameter;
        }

        createController() {
            if (this.controller.type === "probe") {
                return new window.ProbeController({
                    g: this.controller.gravity,
                    mass: this.mass,
                });
            }

            if (this.controller.type === "superheavy") {
                return new window.SuperHeavyController({
                    g: this.controller.gravity,
                    maxThrust: this.controller.maxThrust,
                    mass: this.mass,
                    controlGains: this.controller.controlGains,
                });
            }

            return new window.StarshipController({
                g: this.controller.gravity,
                maxThrust: this.controller.maxThrust,
                mass: this.mass,
            });
        }
    }

    function createRegistry({ gravity, maxThrust }) {
        const starship = (spec) => new VehicleDefinition({
            ...spec,
            dimensions: { length: 50, diameter: 9, ...spec.dimensions },
            geometry: DEFAULT_STARSHIP_GEOMETRY,
            rcs: { visualNozzleOffset: 0.95, visualPlumeScale: 1, ...spec.rcs },
            controller: { type: "starship", gravity, maxThrust },
        });
        const superHeavy = (spec) => new VehicleDefinition({
            ...spec,
            dimensions: { length: 70, diameter: 9, ...spec.dimensions },
            geometry: DEFAULT_STARSHIP_GEOMETRY,
            rcs: { visualNozzleOffset: 1, visualPlumeScale: 1.15, ...spec.rcs },
            controller: {
                type: "superheavy",
                gravity,
                maxThrust: spec.propulsion.engines.count * spec.propulsion.engines.thrustN,
                controlGains: spec.controlGains,
            },
        });

        return Object.freeze({
            starship_sn15: starship({
                id: "starship_sn15",
                label: "Starship SN15",
                callsign: "SN15",
                shortCode: "SN15",
                vehicleClass: "reentry_test_article",
                mass: 120000,
                propulsion: {
                    mixtureRatio: 3.6,
                    engines: { count: 3, thrustN: 2.3e6, specificImpulseSeconds: 330 },
                    tanks: {
                        main: { loxKg: 145000, lch4Kg: 40000 },
                        header: { loxKg: 11500, lch4Kg: 3200 },
                    },
                },
            }),
            starship_ship24: starship({
                id: "starship_ship24",
                label: "Starship Ship 24",
                callsign: "S24",
                shortCode: "S24",
                vehicleClass: "orbital_block",
                mass: 120000,
                // Approximate Block 1 orbital configuration for simulation:
                // three sea-level and three vacuum Raptors.
                propulsion: {
                    mixtureRatio: 3.6,
                    engines: {
                        count: 6,
                        seaLevelCount: 3,
                        vacuumCount: 3,
                        thrustN: 2.3e6,
                        specificImpulseSeconds: 355,
                    },
                    tanks: {
                        // The integrated suborbital mission carries a larger
                        // transfer reserve than the early S24 test profile.
                        // Keep the 3.6:1 mixture so the added delta-v is
                        // physically consumed by the same propulsion model.
                        main: { loxKg: 1200000, lch4Kg: 333333 },
                        header: { loxKg: 50400, lch4Kg: 14000 },
                    },
                },
            }),
            superheavy_b7: superHeavy({
                id: "superheavy_b7",
                label: "Super Heavy Booster 7",
                callsign: "B7",
                shortCode: "B7",
                vehicleClass: "superheavy_booster",
                // Approximate Booster 7 / early Block 1 values.  The 33
                // Raptor layout and 3.6:1 LOX/LCH4 mixture are the model's
                // baseline; dry mass remains an engineering estimate.
                mass: 200000,
                // Tuned for the much larger inertia of B7.  The outer
                // altitude loop is deliberately calmer, while the throttle
                // loop is stronger to compensate for the stack's lower
                // thrust-to-mass response near liftoff.
                controlGains: {
                    altitudePGain: 0.022,
                    altitudeIGain: 0.0012,
                    takeoffPositionPGain: 0.014,
                    takeoffPositionIGain: 0.0008,
                    takeoffVelocityDGain: 0.55,
                    takeoffThrottlePGain: 0.043,
                    takeoffThrottleIGain: 0.020,
                    throttlePGain: 0.031,
                    throttleIGain: 0.017,
                    attitudeEntryGain: 1.65,
                    attitudeTerminalGain: 2.45,
                    rcsEntryGain: 0.42,
                    rcsTerminalGain: 0.78,
                    gimbalEntryGain: 0.12,
                    gimbalFlipGain: 0.14,
                    gimbalLandingGain: 0.18,
                },
                propulsion: {
                    mixtureRatio: 3.6,
                    engines: { count: 33, thrustN: 2.3e6, specificImpulseSeconds: 330 },
                    tanks: {
                        main: { loxKg: 2661000, lch4Kg: 739000 },
                        header: { loxKg: 0, lch4Kg: 0 },
                    },
                },
            }),
            starship_hls: starship({
                id: "starship_hls",
                label: "Starship HLS Demo",
                callsign: "HLS-1",
                shortCode: "HLS",
                vehicleClass: "lunar_variant_demo",
                mass: 120000,
            }),
            probe_satellite: new VehicleDefinition({
                id: "probe_satellite",
                label: "Sonda orbital",
                callsign: "PROBE-1",
                shortCode: "P-1",
                vehicleClass: "ballistic_probe",
                isProbe: true,
                mass: 300,
                dimensions: { length: 2.4, diameter: 1.2 },
                geometry: DEFAULT_STARSHIP_GEOMETRY,
                rcs: { thrustN: 75, angularAcceleration: 0.9, visualNozzleOffset: 0.8, visualPlumeScale: 0.82 },
                dockingPort: {
                    location: "nose",
                    captureRadius: 1.2,
                    // The soft-contact envelope is slightly larger than the
                    // latch envelope. It routes a fast/unaligned rendezvous
                    // through PhysicalCore's reusable Newtonian impulse
                    // solver instead of treating it as a fatal collision.
                    contactDistance: 1.35,
                    restitution: 0.08,
                    positionSlop: 0.01,
                    positionCorrection: 0.82,
                    maxPositionCorrection: 0.2,
                },
                controller: { type: "probe", gravity },
            }),
        });
    }

    window.StarshipVehicleCatalog = Object.freeze({ VehicleDefinition, createRegistry });
})();
