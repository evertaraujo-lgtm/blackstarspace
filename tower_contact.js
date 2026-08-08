(function () {
    /** Geometry-only portion of tower contact; it has no UI or mission state. */
    function createTowerContactGeometry({ clamp, lerp }) {
        function getCollisionProfile({ state, dimensions, geometry }) {
            const averageFlap = 0.5 * (state.noseFlap + state.tailFlap);
            return {
                bodyHalfWidth: dimensions.diameter / 2,
                bodyHalfHeight: dimensions.length / 2,
                catchHalfWidth: dimensions.diameter / 2 + geometry.capture.radialMargin + averageFlap * geometry.capture.flapExtension,
                catchHalfHeight: dimensions.length * geometry.capture.halfHeightFactor,
            };
        }

        function getCollisionSamples({ state, dimensions, geometry }) {
            const profile = getCollisionProfile({ state, dimensions, geometry });
            const noseFlapSpan = geometry.flaps.baseSpan + state.noseFlap * geometry.flaps.extensionSpan;
            const tailFlapSpan = geometry.flaps.baseSpan + state.tailFlap * geometry.flaps.extensionSpan;
            const samples = [];
            const addRect = (component, xMin, xMax, yMin, yMax, spacing = 2.5) => {
                const stepsX = Math.max(1, Math.ceil((xMax - xMin) / spacing));
                const stepsY = Math.max(1, Math.ceil((yMax - yMin) / spacing));
                for (let xIndex = 0; xIndex <= stepsX; xIndex += 1) {
                    for (let yIndex = 0; yIndex <= stepsY; yIndex += 1) {
                        samples.push({
                            x: lerp(xMin, xMax, xIndex / stepsX),
                            y: lerp(yMin, yMax, yIndex / stepsY),
                            component,
                        });
                    }
                }
            };
            const halfWidth = profile.bodyHalfWidth;
            const halfHeight = profile.bodyHalfHeight;
            addRect("casco", -halfWidth, halfWidth, -halfHeight, halfHeight);
            addRect("flap_dianteiro_esquerdo", -halfWidth - noseFlapSpan, -halfWidth, -halfHeight * 0.8, -halfHeight * 0.67);
            addRect("flap_dianteiro_direito", halfWidth, halfWidth + noseFlapSpan, -halfHeight * 0.8, -halfHeight * 0.67);
            addRect("flap_traseiro_esquerdo", -halfWidth - tailFlapSpan, -halfWidth, halfHeight * 0.7, halfHeight * 0.84);
            addRect("flap_traseiro_direito", halfWidth, halfWidth + tailFlapSpan, halfHeight * 0.7, halfHeight * 0.84);
            addRect("motores", -halfWidth * 0.55, halfWidth * 0.55, halfHeight, halfHeight + 2.5);
            addRect("rcs_esquerdo", -halfWidth - 0.8, -halfWidth, -halfHeight * 0.28, -halfHeight * 0.12, 1);
            addRect("rcs_direito", halfWidth, halfWidth + 0.8, -halfHeight * 0.28, -halfHeight * 0.12, 1);
            const cosine = Math.cos(state.a);
            const sine = Math.sin(state.a);
            return samples.map((point) => ({
                x: state.x + point.x * cosine - point.y * sine,
                z: state.z + point.x * sine - point.y * cosine,
                component: point.component,
            }));
        }

        function buildTowerRects({ platform, model, mastOffsetX, fallbackTowerHeight }) {
            const captureX = platform.captureX ?? 0;
            const leftClosure = clamp(platform.leftArmClosure ?? platform.armClosure ?? 0, 0, 1);
            const rightClosure = clamp(platform.rightArmClosure ?? platform.armClosure ?? 0, 0, 1);
            return {
                leftGapHalf: lerp(model.armGapHalfOpen, model.armGapHalfClosed, leftClosure),
                rightGapHalf: lerp(model.armGapHalfOpen, model.armGapHalfClosed, rightClosure),
                towerRects: [{
                    xMin: captureX + mastOffsetX - (model.mastHalfWidth ?? 4.5),
                    xMax: captureX + mastOffsetX + (model.mastHalfWidth ?? 4.5),
                    zMin: 0,
                    zMax: platform.towerHeight ?? fallbackTowerHeight,
                }],
            };
        }

        function evaluateImpact({ samples, rects, state }) {
            let contact = false;
            let impactSpeed = 0;
            let collisionMarker = null;
            for (const sample of samples) {
                for (const rect of rects) {
                    if (sample.x < rect.xMin || sample.x > rect.xMax || sample.z < rect.zMin || sample.z > rect.zMax) continue;
                    const dx = sample.x - state.x;
                    const dz = sample.z - state.z;
                    const speed = Math.hypot(state.vx - state.w * dz, state.vz + state.w * dx);
                    contact = true;
                    if (speed >= impactSpeed) {
                        impactSpeed = speed;
                        collisionMarker = {
                            vehicle: { ...sample },
                            tower: { x: clamp(sample.x, rect.xMin, rect.xMax), z: clamp(sample.z, rect.zMin, rect.zMax) },
                            component: sample.component,
                        };
                    }
                }
            }
            return { contact, impactSpeed, collisionMarker };
        }

        return { getCollisionProfile, getCollisionSamples, buildTowerRects, evaluateImpact };
    }

    window.createTowerContactGeometry = createTowerContactGeometry;
})();
