(function () {
    const DEFAULT_EARTH_RADIUS = 6371000;
    const DEFAULT_SURFACE_GRAVITY = 9.81;
    const DEFAULT_CIRCUMFERENCE = 40075017;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function wrapAngle(angle) {
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    }

    function finiteComponent(value, fallback = 0) {
        return Number.isFinite(value) ? value : fallback;
    }

    function finiteVector(vector, fallback = { x: 0, z: 0 }) {
        return {
            x: finiteComponent(vector?.x, fallback.x),
            z: finiteComponent(vector?.z, fallback.z),
        };
    }

    function cross2D(a, b) {
        return a.x * b.z - a.z * b.x;
    }

    /**
     * Single dynamics authority for every free body in the simulation.
     *
     * Controllers only choose actuator commands. Vehicle adapters turn those
     * commands into forces/torques. This class is the only component that
     * advances position, velocity and attitude or applies a physical contact
     * constraint.
     */
    class PhysicalCore {
        constructor(config = {}) {
            this.surfaceGravity = config.surfaceGravity ?? DEFAULT_SURFACE_GRAVITY;
            this.earthRadius = config.earthRadius ?? DEFAULT_EARTH_RADIUS;
            this.earthMu = config.earthMu ?? this.surfaceGravity * this.earthRadius ** 2;
            this.circumference = config.circumference ?? DEFAULT_CIRCUMFERENCE;
            this.seaLevelDensity = config.seaLevelDensity ?? 1.225;
            this.atmosphereScaleHeight = config.atmosphereScaleHeight ?? 8500;
        }

        wrapWorldX(worldX) {
            const half = this.circumference / 2;
            return ((worldX + half) % this.circumference + this.circumference) % this.circumference - half;
        }

        densityAt(altitude) {
            return this.seaLevelDensity * Math.exp(-Math.max(altitude, 0) / this.atmosphereScaleHeight);
        }

        getAtmosphere(body, wind = {}) {
            const relativeVx = (body.vx ?? 0) - (wind.x ?? 0);
            const relativeVz = (body.vz ?? 0) - (wind.z ?? 0);
            const speed = Math.hypot(relativeVx, relativeVz) + 0.01;
            const density = this.densityAt(body.z ?? 0);
            return {
                relativeVx,
                relativeVz,
                speed,
                density,
                dynamicPressure: 0.5 * density * speed * speed,
                flowAngle: Math.atan2(-relativeVx, -relativeVz),
            };
        }

        getOrbitalAcceleration(body, nonGravAx = 0, nonGravAz = 0) {
            const radius = Math.max(this.earthRadius + (body.z ?? 0), this.earthRadius * 0.5);
            const gravity = this.earthMu / (radius * radius);
            const vx = body.vx ?? 0;
            const vz = body.vz ?? 0;
            return {
                radius,
                gravity,
                ax: nonGravAx - (vz * vx) / radius,
                az: nonGravAz + (vx * vx) / radius - gravity,
            };
        }

        getAerodynamicForce(atmosphere, config = {}) {
            const exposure = config.exposure ?? 1;
            const dragMagnitude = (config.dragCoefficient ?? 0) * atmosphere.dynamicPressure * (config.dragArea ?? 0);
            const liftMagnitude = config.liftMagnitude ?? 0;
            return {
                x: exposure * (-dragMagnitude * atmosphere.relativeVx - liftMagnitude * atmosphere.relativeVz) / atmosphere.speed,
                z: exposure * (-dragMagnitude * atmosphere.relativeVz + liftMagnitude * atmosphere.relativeVx) / atmosphere.speed,
                dragMagnitude,
                liftMagnitude,
            };
        }

        getThrustForce(body, maxThrust, throttle = body.throttle ?? 0, enabled = body.engineOn) {
            const magnitude = enabled ? Math.max(0, maxThrust) * clamp(throttle, 0, 1) : 0;
            const angle = (body.a ?? 0) + (body.gimbal ?? 0);
            return {
                x: magnitude * Math.sin(angle),
                z: magnitude * Math.cos(angle),
                magnitude,
                angle,
            };
        }

        getWaterForces(input) {
            const pivotingOnBase = !input.waterFloating && input.hasWaterPivot;
            const wavePhase = (input.simTime - (input.waterTouchdownTime ?? input.simTime)) * 1.7 + input.x * 0.035;
            const tumbleDirection = (input.impactVx ?? input.vx) < -0.15 ? -1 : 1;
            const targetAngle = tumbleDirection * Math.PI * 0.5;
            const angularAcceleration = wrapAngle(targetAngle - input.angle) * 2.4
                - input.angularVelocity * 1.25
                + Math.sin(wavePhase * 0.72) * 0.16;

            if (pivotingOnBase) return { forceX: 0, forceZ: 0, angularAcceleration };

            const broadsideFactor = Math.sin(Math.abs(input.angle)) ** 2;
            const buoyancy = input.mass * input.gravity * (0.72 + broadsideFactor * 0.33);
            const surfaceError = input.floatCenterZ - input.centerZ;
            const waveForce = Math.sin(wavePhase) * input.mass * 0.32;
            return {
                forceX: -input.mass * (1.7 * input.vx + 5 * input.vx * Math.abs(input.vx)),
                forceZ: buoyancy + surfaceError * input.mass * 3.8
                    - input.mass * (2.6 * input.vz + 6 * input.vz * Math.abs(input.vz))
                    + waveForce,
                angularAcceleration,
            };
        }

        step(body, dt, options = {}) {
            if (!body || !Number.isFinite(dt) || dt <= 0) return null;
            const mass = Math.max(Number.EPSILON, options.mass ?? 1);
            const forceX = options.forceX ?? 0;
            const forceZ = options.forceZ ?? 0;
            const nonGravAx = (options.accelerationX ?? 0) + forceX / mass;
            const nonGravAz = (options.accelerationZ ?? 0) + forceZ / mass;
            const acceleration = this.getOrbitalAcceleration(body, nonGravAx, nonGravAz);

            if (options.integrateRotation !== false) {
                body.w = (body.w ?? 0) + (options.angularAcceleration ?? 0) * dt;
                body.a = wrapAngle((body.a ?? 0) + body.w * dt);
            }

            body.vx = (body.vx ?? 0) + acceleration.ax * dt;
            body.vz = (body.vz ?? 0) + acceleration.az * dt;
            const nextX = (body.x ?? 0) + body.vx * dt;
            body.x = options.wrapX === false ? nextX : this.wrapWorldX(nextX);
            body.z = (body.z ?? 0) + body.vz * dt;

            return { ...acceleration, nonGravAx, nonGravAz, forceX, forceZ };
        }

        /**
         * Velocity at a world-oriented point attached to a body.  In this
         * polar 2D convention an offset r = (x, z) has tangential velocity
         * w × r = (w * r.z, -w * r.x).
         */
        getPointVelocity(body, offset = {}) {
            const pointOffset = finiteVector(offset);
            const angularVelocity = finiteComponent(body?.w);
            return {
                vx: finiteComponent(body?.vx) + angularVelocity * pointOffset.z,
                vz: finiteComponent(body?.vz) - angularVelocity * pointOffset.x,
            };
        }

        /**
         * Planar moment of inertia for a rectangular vehicle silhouette.
         * Rendezvous adapters provide their own dimensions, so every future
         * vehicle can share the same contact solver without vehicle-specific
         * physics in the core.
         */
        getPlanarMomentOfInertia(mass, dimensions = {}) {
            const safeMass = Number.isFinite(mass) && mass > 0 ? mass : 0;
            const length = Math.max(0, finiteComponent(dimensions.length));
            const diameter = Math.max(0, finiteComponent(dimensions.diameter ?? dimensions.width));
            if (safeMass <= 0) return Infinity;
            return Math.max(Number.EPSILON, safeMass * (length * length + diameter * diameter) / 12);
        }

        /**
         * Resolve a non-destructive point contact between two rendezvous
         * vehicles.  It applies one equal-and-opposite impulse (Newton's
         * third law) at the supplied contact offsets, including angular
         * response, then performs a bounded positional separation to prevent
         * numerical overlap.  Detection remains vehicle-specific; every
         * rendezvous uses this same response once a contact is detected.
         *
         * `normal` points from bodyA toward bodyB. `penetration` is the
         * amount by which their allowed contact separation was exceeded.
         */
        resolveRendezvousContact(bodyA, bodyB, options = {}) {
            const emptyResult = {
                applied: false,
                impulse: 0,
                approachSpeed: 0,
                normalRelativeSpeed: 0,
                penetration: 0,
                positionCorrection: 0,
                normal: { x: 0, z: 0 },
            };
            if (!bodyA || !bodyB) return emptyResult;

            const rawNormal = finiteVector(options.normal);
            const normalLength = Math.hypot(rawNormal.x, rawNormal.z);
            if (normalLength <= Number.EPSILON) return emptyResult;
            const normal = { x: rawNormal.x / normalLength, z: rawNormal.z / normalLength };
            const offsetA = finiteVector(options.contactOffsetA);
            const offsetB = finiteVector(options.contactOffsetB);
            const massA = Number(options.massA);
            const massB = Number(options.massB);
            const inverseMassA = Number.isFinite(massA) && massA > 0 ? 1 / massA : 0;
            const inverseMassB = Number.isFinite(massB) && massB > 0 ? 1 / massB : 0;
            const translationalInverseMass = inverseMassA + inverseMassB;
            if (translationalInverseMass <= Number.EPSILON) return { ...emptyResult, normal };

            const inertiaA = Number(options.inertiaA);
            const inertiaB = Number(options.inertiaB);
            const inverseInertiaA = Number.isFinite(inertiaA) && inertiaA > Number.EPSILON ? 1 / inertiaA : 0;
            const inverseInertiaB = Number.isFinite(inertiaB) && inertiaB > Number.EPSILON ? 1 / inertiaB : 0;
            const contactVelocityA = this.getPointVelocity(bodyA, offsetA);
            const contactVelocityB = this.getPointVelocity(bodyB, offsetB);
            const relativeVelocity = {
                x: contactVelocityB.vx - contactVelocityA.vx,
                z: contactVelocityB.vz - contactVelocityA.vz,
            };
            const normalRelativeSpeed = relativeVelocity.x * normal.x + relativeVelocity.z * normal.z;
            const leverA = cross2D(offsetA, normal);
            const leverB = cross2D(offsetB, normal);
            const effectiveInverseMass = translationalInverseMass +
                leverA * leverA * inverseInertiaA +
                leverB * leverB * inverseInertiaB;
            const restitution = clamp(finiteComponent(options.restitution, 0.08), 0, 1);
            const maxImpulse = Number.isFinite(options.maxImpulse)
                ? Math.max(0, options.maxImpulse)
                : Infinity;
            let impulse = 0;

            if (normalRelativeSpeed < 0 && effectiveInverseMass > Number.EPSILON) {
                impulse = Math.min(
                    maxImpulse,
                    -((1 + restitution) * normalRelativeSpeed) / effectiveInverseMass
                );
                const impulseVector = { x: normal.x * impulse, z: normal.z * impulse };
                bodyA.vx = finiteComponent(bodyA.vx) - impulseVector.x * inverseMassA;
                bodyA.vz = finiteComponent(bodyA.vz) - impulseVector.z * inverseMassA;
                bodyB.vx = finiteComponent(bodyB.vx) + impulseVector.x * inverseMassB;
                bodyB.vz = finiteComponent(bodyB.vz) + impulseVector.z * inverseMassB;
                // `w` follows this simulator's clockwise x/z convention
                // (see getPointVelocity), so its impulse signs are the
                // inverse of the conventional counter-clockwise 2D form.
                bodyA.w = finiteComponent(bodyA.w) + cross2D(offsetA, impulseVector) * inverseInertiaA;
                bodyB.w = finiteComponent(bodyB.w) - cross2D(offsetB, impulseVector) * inverseInertiaB;
            }

            const penetration = Math.max(0, finiteComponent(options.penetration));
            const positionSlop = Math.max(0, finiteComponent(options.positionSlop, 0.002));
            const correctionFraction = clamp(finiteComponent(options.positionCorrection, 0.8), 0, 1);
            const maxPositionCorrection = Number.isFinite(options.maxPositionCorrection)
                ? Math.max(0, options.maxPositionCorrection)
                // A detector may report a stale/deep overlap after a large
                // simulation step. Keep the generic rendezvous response
                // gentle by default; a vehicle adapter can opt into more.
                : 0.25;
            const positionCorrection = Math.min(
                maxPositionCorrection,
                Math.max(0, penetration - positionSlop) * correctionFraction
            );
            if (positionCorrection > 0) {
                const correctionA = positionCorrection * inverseMassA / translationalInverseMass;
                const correctionB = positionCorrection * inverseMassB / translationalInverseMass;
                const nextAX = finiteComponent(bodyA.x) - normal.x * correctionA;
                const nextBX = finiteComponent(bodyB.x) + normal.x * correctionB;
                bodyA.x = options.wrapX === false ? nextAX : this.wrapWorldX(nextAX);
                bodyA.z = finiteComponent(bodyA.z) - normal.z * correctionA;
                bodyB.x = options.wrapX === false ? nextBX : this.wrapWorldX(nextBX);
                bodyB.z = finiteComponent(bodyB.z) + normal.z * correctionB;
            }

            return {
                applied: impulse > 0 || positionCorrection > 0,
                impulse,
                approachSpeed: Math.max(0, -normalRelativeSpeed),
                normalRelativeSpeed,
                penetration,
                positionCorrection,
                normal,
                contactVelocityA,
                contactVelocityB,
            };
        }

        constrainToPivot(body, pivot, radialOffset, options = {}) {
            const angle = body.a ?? 0;
            body.x = pivot.x + radialOffset * Math.sin(angle);
            body.z = pivot.z + radialOffset * Math.cos(angle);
            body.vx = radialOffset * Math.cos(angle) * (body.w ?? 0);
            body.vz = -radialOffset * Math.sin(angle) * (body.w ?? 0);
            if (options.wrapX !== false) body.x = this.wrapWorldX(body.x);
        }

        constrainTowardAnchor(body, anchor, dt, config = {}) {
            const blend = (rate) => clamp(dt * rate, 0, 1);
            const positionBlendX = blend(config.positionRateX ?? config.positionRate ?? 0);
            const positionBlendZ = blend(config.positionRateZ ?? config.positionRate ?? 0);
            const velocityBlendX = blend(config.velocityRateX ?? config.velocityRate ?? 0);
            const velocityBlendZ = blend(config.velocityRateZ ?? config.velocityRate ?? 0);
            const attitudeBlend = blend(config.attitudeRate ?? 0);
            const angularBlend = blend(config.angularRate ?? 0);
            body.x += (anchor.x - body.x) * positionBlendX;
            body.z += (anchor.z - body.z) * positionBlendZ;
            body.vx += ((anchor.vx ?? 0) - body.vx) * velocityBlendX;
            body.vz += ((anchor.vz ?? 0) - body.vz) * velocityBlendZ;
            body.a = wrapAngle(body.a + wrapAngle((anchor.a ?? 0) - body.a) * attitudeBlend);
            body.w += ((anchor.w ?? 0) - body.w) * angularBlend;
        }

        placeOnSurface(body, centerAltitude, options = {}) {
            body.z = centerAltitude;
            if (options.stopDescending) body.vz = Math.max(0, body.vz ?? 0);
        }

        scaleMotion(body, factors = {}) {
            body.vx *= factors.vx ?? 1;
            body.vz *= factors.vz ?? 1;
            body.w *= factors.w ?? 1;
        }

        freeze(body, anchor = {}) {
            if (Number.isFinite(anchor.x)) body.x = this.wrapWorldX(anchor.x);
            if (Number.isFinite(anchor.z)) body.z = anchor.z;
            if (Number.isFinite(anchor.a)) body.a = wrapAngle(anchor.a);
            body.vx = anchor.vx ?? 0;
            body.vz = anchor.vz ?? 0;
            body.w = anchor.w ?? 0;
        }

        getOrbit(body) {
            const radius = this.earthRadius + (body.z ?? 0);
            const specificEnergy = ((body.vx ?? 0) ** 2 + (body.vz ?? 0) ** 2) / 2 - this.earthMu / radius;
            const semiMajorAxis = specificEnergy < 0 ? -this.earthMu / (2 * specificEnergy) : null;
            return {
                radius,
                specificEnergy,
                semiMajorAxis,
                period: semiMajorAxis ? 2 * Math.PI * Math.sqrt(semiMajorAxis ** 3 / this.earthMu) : null,
            };
        }

        isFinite(body) {
            return [body.x, body.z, body.vx, body.vz, body.a ?? 0, body.w ?? 0].every(Number.isFinite);
        }
    }

    const api = { PhysicalCore, clamp, wrapAngle };
    if (typeof window !== "undefined") window.StarshipPhysicalCore = api;
    if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
