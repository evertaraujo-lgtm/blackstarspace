(function () {
function getVehicleLayout() {
    const dimensions = getSelectedShipDimensions();
    const geometry = getSelectedShipGeometry();
    return {
        bodyHalfWidth: (dimensions.diameter / 2) * camera.zoom,
        bodyHalfHeight: (dimensions.length / 2) * camera.zoom,
        noseSpan: (geometry.flaps.baseSpan + s.noseFlap * geometry.flaps.extensionSpan) * camera.zoom,
        tailSpan: (geometry.flaps.baseSpan + s.tailFlap * geometry.flaps.extensionSpan) * camera.zoom,
    };
}

function getVehicleLayoutFor(profile, state) {
    const dimensions = profile.dimensions ?? { length: profile.length, diameter: profile.diameter };
    const geometry = profile.geometry ?? { flaps: { baseSpan: 0, extensionSpan: 0 } };
    return {
        bodyHalfWidth: (dimensions.diameter / 2) * camera.zoom,
        bodyHalfHeight: (dimensions.length / 2) * camera.zoom,
        noseSpan: (geometry.flaps.baseSpan + (state.noseFlap ?? 0) * geometry.flaps.extensionSpan) * camera.zoom,
        tailSpan: (geometry.flaps.baseSpan + (state.tailFlap ?? 0) * geometry.flaps.extensionSpan) * camera.zoom,
    };
}

function drawEnginePlume(state = s, layout = getVehicleLayout()) {
    const hotStaging = (state.hotStagePlumeTimer ?? 0) > 0;
    const plumeThrottle = hotStaging ? Math.max(state.throttle, 0.72) : state.throttle;
    if ((!state.engineOn && !hotStaging) || plumeThrottle <= 0.02) {
        return;
    }

    const nozzleCenterX = 0;
    const { bodyHalfWidth, bodyHalfHeight } = layout;
    const nozzleCenterY = bodyHalfHeight;
    const nozzleHalfWidth = bodyHalfWidth * 0.52;
    const nozzleLength = 2.5 * camera.zoom;
    const plumeLength = (11 + plumeThrottle * 15) * camera.zoom;
    const plumeWidth = (2.6 + plumeThrottle * 1.8) * camera.zoom;
    const exhaustDirX = -Math.sin(state.gimbal ?? 0);
    const exhaustDirY = Math.cos(state.gimbal ?? 0);
    const sideX = -exhaustDirY;
    const sideY = exhaustDirX;
    const nozzleTipX = nozzleCenterX + exhaustDirX * nozzleLength;
    const nozzleTipY = nozzleCenterY + exhaustDirY * nozzleLength;
    const plumeTipX = nozzleCenterX + exhaustDirX * plumeLength;
    const plumeTipY = nozzleCenterY + exhaustDirY * plumeLength;
    const leftBaseX = nozzleCenterX - sideX * nozzleHalfWidth;
    const leftBaseY = nozzleCenterY - sideY * nozzleHalfWidth;
    const rightBaseX = nozzleCenterX + sideX * nozzleHalfWidth;
    const rightBaseY = nozzleCenterY + sideY * nozzleHalfWidth;
    const leftMidX = nozzleTipX - sideX * plumeWidth;
    const leftMidY = nozzleTipY - sideY * plumeWidth;
    const rightMidX = nozzleTipX + sideX * plumeWidth;
    const rightMidY = nozzleTipY + sideY * plumeWidth;

    ctx.fillStyle = "#9aa8b8";
    ctx.beginPath();
    ctx.moveTo(leftBaseX, leftBaseY);
    ctx.lineTo(rightBaseX, rightBaseY);
    ctx.lineTo(rightBaseX + exhaustDirX * nozzleLength, rightBaseY + exhaustDirY * nozzleLength);
    ctx.lineTo(leftBaseX + exhaustDirX * nozzleLength, leftBaseY + exhaustDirY * nozzleLength);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255, 156, 64, 0.92)";
    ctx.beginPath();
    ctx.moveTo(leftBaseX, leftBaseY);
    ctx.lineTo(leftMidX, leftMidY);
    ctx.lineTo(plumeTipX, plumeTipY);
    ctx.lineTo(rightMidX, rightMidY);
    ctx.lineTo(rightBaseX, rightBaseY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(255, 235, 170, 0.95)";
    ctx.beginPath();
    ctx.moveTo(nozzleCenterX - sideX * (nozzleHalfWidth * 0.42), nozzleCenterY - sideY * (nozzleHalfWidth * 0.42));
    ctx.lineTo(nozzleTipX - sideX * (plumeWidth * 0.38), nozzleTipY - sideY * (plumeWidth * 0.38));
    ctx.lineTo(nozzleCenterX + exhaustDirX * (plumeLength * 0.72), nozzleCenterY + exhaustDirY * (plumeLength * 0.72));
    ctx.lineTo(nozzleTipX + sideX * (plumeWidth * 0.38), nozzleTipY + sideY * (plumeWidth * 0.38));
    ctx.lineTo(nozzleCenterX + sideX * (nozzleHalfWidth * 0.42), nozzleCenterY + sideY * (nozzleHalfWidth * 0.42));
    ctx.closePath();
    ctx.fill();
}

function drawSuperHeavyVehicle(gx, gy, state = s, profile = getSelectedShipProfile(), options = {}) {
    const { bodyHalfWidth, bodyHalfHeight } = getVehicleLayoutFor(profile, state);
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(state.a);
    const top = -bodyHalfHeight;
    const bottom = bodyHalfHeight;
    ctx.beginPath();
    ctx.moveTo(-bodyHalfWidth, bottom);
    ctx.lineTo(-bodyHalfWidth, top);
    ctx.lineTo(bodyHalfWidth, top);
    ctx.lineTo(bodyHalfWidth, bottom);
    ctx.closePath();
    const steel = ctx.createLinearGradient(-bodyHalfWidth, 0, bodyHalfWidth, 0);
    steel.addColorStop(0, "#566671"); steel.addColorStop(0.46, "#dce7ea"); steel.addColorStop(1, "#53636d");
    ctx.fillStyle = steel; ctx.fill(); ctx.strokeStyle = "#e4f1f4"; ctx.stroke();
    ctx.strokeStyle = "rgba(36, 50, 60, .45)";
    for (let y = top + 11 * camera.zoom; y < bottom - 4 * camera.zoom; y += 4.5 * camera.zoom) {
        ctx.beginPath(); ctx.moveTo(-bodyHalfWidth * .92, y); ctx.lineTo(bodyHalfWidth * .92, y); ctx.stroke();
    }
    ctx.fillStyle = "#27343d";
    ctx.fillRect(-bodyHalfWidth, top + bodyHalfHeight * .25, bodyHalfWidth * 2, 4 * camera.zoom);
    // The flight model keeps the generic flap actuators, but on Super Heavy
    // their visual counterpart is the four deployable grid fins.
    for (const side of [-1, 1]) {
        const deployment = 0.18 + (0.5 * ((state.noseFlap ?? 0) + (state.tailFlap ?? 0))) * 0.82;
        const steering = clamp(((state.tailFlap ?? 0) - (state.noseFlap ?? 0)) * 0.38, -0.2, 0.2) * camera.zoom;
        const rootX = side * bodyHalfWidth * 0.82;
        const rootY = top + bodyHalfHeight * 0.22;
        const span = (1.8 + deployment * 5.1) * camera.zoom;
        const finHeight = 3.8 * camera.zoom;
        ctx.fillStyle = "#26343d";
        ctx.strokeStyle = "#b9cbd2";
        ctx.beginPath();
        ctx.moveTo(rootX, rootY - finHeight / 2);
        ctx.lineTo(rootX + side * span, rootY - finHeight * .72 + steering);
        ctx.lineTo(rootX + side * span, rootY + finHeight * .72 + steering);
        ctx.lineTo(rootX, rootY + finHeight / 2);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = "rgba(205, 225, 231, .62)";
        ctx.lineWidth = .65;
        for (let cell = 1; cell < 5; cell += 1) {
            const fraction = cell / 5;
            ctx.beginPath();
            ctx.moveTo(rootX + side * span * fraction, rootY - finHeight * .68 + steering * fraction);
            ctx.lineTo(rootX + side * span * fraction, rootY + finHeight * .68 + steering * fraction);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(rootX + side * span, rootY + steering);
        ctx.stroke();
    }
    ctx.fillStyle = "#16232b";
    const engineRadius = Math.max(1.1, 0.8 * camera.zoom);
    for (let ring = 0; ring < 3; ring += 1) {
        const count = [1, 10, 22][ring];
        const radius = ring * bodyHalfWidth * .42;
        for (let i = 0; i < count; i += 1) {
            const angle = count === 1 ? 0 : (i / count) * Math.PI * 2;
            ctx.beginPath(); ctx.arc(Math.cos(angle) * radius, bottom - 1.5 * camera.zoom + Math.sin(angle) * radius * .42, engineRadius, 0, Math.PI * 2); ctx.fill();
        }
    }
    drawEnginePlume(state, { bodyHalfWidth, bodyHalfHeight });
    ctx.restore();

    if (options.drawDockedShip && stackMission.attachS24 && !stackMission.separated) {
        drawDockedStarship(gx, gy);
    }
}

function drawDockedStarship(boosterGx, boosterGy) {
    const originalState = s;
    const originalProfile = visualProfileOverride;
    const boosterLength = getSelectedShipDimensions().length;
    const shipLength = shipRegistry.starship_ship24.length;
    // Local Y is upward on screen when negative.  Place the S24 engine skirt
    // immediately above the booster interstage, then render it with the same
    // complete Starship renderer used for an independently instantiated S24.
    const stackOffset = boosterLength / 2 + shipLength / 2 - 1.5;
    const virtualState = {
        ...originalState,
        x: originalState.x + stackOffset * Math.sin(originalState.a),
        z: originalState.z + stackOffset * Math.cos(originalState.a),
        engineOn: Boolean(originalState.hotStageIgnition),
        throttle: originalState.hotStageIgnition ? 0.72 : 0,
        gimbal: 0,
        noseFlap: 0.08,
        tailFlap: 0.08,
    };
    visualProfileOverride = shipRegistry.starship_ship24;
    s = virtualState;
    drawVehicle(worldToScreenX(virtualState.x), worldToScreenY(virtualState.z));
    s = originalState;
    visualProfileOverride = originalProfile;
}

function drawDetachedBoosterVehicle() {
    const booster = detachedBoosterFlight;
    if (!booster) return;
    const state = booster.state;
    const x = worldToScreenX(state.x);
    const y = worldToScreenY(state.z);
    const { bodyHalfHeight } = getVehicleLayoutFor(booster.profile, state);
    drawSuperHeavyVehicle(x, y, state, booster.profile);
    drawRcsPlumes(x, y, state, booster.profile);
    ctx.save();
    ctx.fillStyle = "#c6e9f7";
    ctx.font = "600 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(state.status, x, y - bodyHalfHeight - 9);
    ctx.restore();
}

function drawProbeDockingTarget() {
    const target = probeDocking.target;
    if (!target || !isProbeSelected()) return;
    const originalState = s;
    s = target;
    drawVehicle(worldToScreenX(target.x), worldToScreenY(target.z));
    s = originalState;
}

function drawProbeDockingGuidance() {
    const target = probeDocking.target;
    if (!target || !isProbeSelected()) return;
    const chaserPort = getProbeDockingPort(s);
    const targetPort = getProbeDockingPort(target);
    const chaserX = worldToScreenX(chaserPort.x);
    const chaserY = worldToScreenY(chaserPort.z);
    const targetX = worldToScreenX(targetPort.x);
    const targetY = worldToScreenY(targetPort.z);
    const recentContact = !probeDocking.docked && isProbeDockingContactRecent();
    const color = probeDocking.docked ? "#79f5cd" : recentContact ? "#ff9e4a" : "#ffd166";

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.4;
    ctx.setLineDash(probeDocking.docked ? [] : [4, 4]);
    ctx.beginPath();
    ctx.moveTo(chaserX, chaserY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    [
        { x: chaserX, y: chaserY, label: "CHASER" },
        { x: targetX, y: targetY, label: "ALVO" },
    ].forEach((port) => {
        ctx.beginPath();
        ctx.arc(port.x, port.y, 4.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "700 9px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(port.label, port.x, port.y - 8);
    });
    if (recentContact) {
        const contactX = (chaserX + targetX) / 2;
        const contactY = (chaserY + targetY) / 2;
        const pulse = 6 + Math.sin(performance.now() * 0.018) * 1.6;
        ctx.beginPath();
        ctx.arc(contactX, contactY, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "700 9px system-ui";
        ctx.fillText("CONTATO LEVE", contactX, contactY - 10);
    }
    ctx.textAlign = "start";
    ctx.restore();
}

function drawHotStageRing() {
    const ring = hotStageRingFlight;
    if (!ring || ring.end) return;
    const x = worldToScreenX(ring.x);
    const y = worldToScreenY(ring.z);
    const halfWidth = 5.1 * camera.zoom;
    const halfHeight = 3.3 * camera.zoom;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ring.a);
    const steel = ctx.createLinearGradient(-halfWidth, 0, halfWidth, 0);
    steel.addColorStop(0, "#4d5d66");
    steel.addColorStop(.48, "#d8e4e7");
    steel.addColorStop(1, "#53636c");
    ctx.fillStyle = steel;
    ctx.strokeStyle = "#e8f4f5";
    ctx.lineWidth = Math.max(.7, camera.zoom);
    ctx.fillRect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
    ctx.strokeRect(-halfWidth, -halfHeight, halfWidth * 2, halfHeight * 2);
    ctx.strokeStyle = "rgba(35, 50, 58, .8)";
    for (let offset = -halfHeight * .45; offset < halfHeight; offset += Math.max(1.2, 1.3 * camera.zoom)) {
        ctx.beginPath();
        ctx.moveTo(-halfWidth, offset);
        ctx.lineTo(halfWidth, offset);
        ctx.stroke();
    }
    ctx.restore();
}

function drawVehicle(gx, gy) {
    if (isSuperHeavySelected()) {
        drawSuperHeavyVehicle(gx, gy, s, getSelectedShipProfile(), { drawDockedShip: true });
        return;
    }
    const { bodyHalfWidth, bodyHalfHeight, noseSpan, tailSpan } = getVehicleLayout();
    const noseBaseY = -bodyHalfHeight * 0.67;
    const skirtTopY = bodyHalfHeight * 0.61;

    ctx.save();
    ctx.translate(gx, gy);
    // The render uses the same positive-angle convention as the physical
    // thrust vector: positive attitude points the nose and thrust to +X.
    ctx.rotate(s.a);

    // Stainless-steel Starship silhouette: pointed ogive nose, cylindrical
    // barrel and tapered engine skirt. Rendering remains independent from the
    // collision profile, which continues to use the physical 50 m × 9 m body.
    ctx.beginPath();
    ctx.moveTo(-bodyHalfWidth * 0.68, bodyHalfHeight);
    ctx.lineTo(-bodyHalfWidth * 0.94, skirtTopY);
    ctx.lineTo(-bodyHalfWidth, noseBaseY);
    ctx.quadraticCurveTo(-bodyHalfWidth * 0.86, -bodyHalfHeight * 0.93, 0, -bodyHalfHeight);
    ctx.quadraticCurveTo(bodyHalfWidth * 0.86, -bodyHalfHeight * 0.93, bodyHalfWidth, noseBaseY);
    ctx.lineTo(bodyHalfWidth * 0.94, skirtTopY);
    ctx.lineTo(bodyHalfWidth * 0.68, bodyHalfHeight);
    ctx.closePath();
    ctx.save();
    ctx.clip();
    const steel = ctx.createLinearGradient(-bodyHalfWidth, 0, bodyHalfWidth, 0);
    steel.addColorStop(0, "#8896a0");
    steel.addColorStop(0.18, "#eef5f6");
    steel.addColorStop(0.52, "#c3d0d4");
    steel.addColorStop(0.78, "#f7ffff");
    steel.addColorStop(1, "#71818d");
    ctx.fillStyle = steel;
    ctx.fillRect(-bodyHalfWidth, -bodyHalfHeight, bodyHalfWidth * 2, bodyHalfHeight * 2);

    // Dark windward strip and nose thermal section, characteristic of the
    // reference front/side drawings.
    ctx.fillStyle = "rgba(22, 29, 34, 0.75)";
    ctx.beginPath();
    ctx.moveTo(bodyHalfWidth * 0.2, -bodyHalfHeight * 0.96);
    ctx.lineTo(bodyHalfWidth, noseBaseY + 5 * camera.zoom);
    ctx.lineTo(bodyHalfWidth, bodyHalfHeight * 0.72);
    ctx.lineTo(bodyHalfWidth * 0.38, bodyHalfHeight * 0.88);
    ctx.closePath();
    ctx.fill();

    // Weld seams and darker heat-shield / engine-bay bands.
    ctx.strokeStyle = "rgba(42, 57, 67, 0.45)";
    ctx.lineWidth = 0.75;
    for (let y = noseBaseY + 8 * camera.zoom; y < skirtTopY; y += 4.2 * camera.zoom) {
        ctx.beginPath();
        ctx.moveTo(-bodyHalfWidth, y);
        ctx.lineTo(bodyHalfWidth, y);
        ctx.stroke();
    }
    ctx.fillStyle = "rgba(42, 53, 61, 0.82)";
    ctx.fillRect(-bodyHalfWidth, bodyHalfHeight * 0.18, bodyHalfWidth * 2, bodyHalfHeight * 0.29);
    ctx.fillStyle = "rgba(230, 240, 242, 0.55)";
    ctx.fillRect(-bodyHalfWidth * 0.58, -bodyHalfHeight * 0.08, bodyHalfWidth * 1.16, 1.4 * camera.zoom);
    ctx.restore();
    ctx.strokeStyle = "#dcecf0";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Forward flaps: long, high-mounted swept surfaces.
    const forwardRootTopY = -bodyHalfHeight * 0.69;
    const forwardRootBottomY = -bodyHalfHeight * 0.38;
    ctx.fillStyle = "#303b43";
    ctx.strokeStyle = "#b5c7ce";
    ctx.lineWidth = 1;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * bodyHalfWidth * 0.92, forwardRootTopY);
        ctx.lineTo(side * (bodyHalfWidth + noseSpan), -bodyHalfHeight * 0.52);
        ctx.lineTo(side * (bodyHalfWidth + noseSpan * 0.72), forwardRootBottomY + 4 * camera.zoom);
        ctx.lineTo(side * bodyHalfWidth, forwardRootBottomY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(204, 220, 226, 0.42)";
        ctx.beginPath();
        ctx.moveTo(side * bodyHalfWidth * 0.98, forwardRootTopY + 6 * camera.zoom);
        ctx.lineTo(side * (bodyHalfWidth + noseSpan * 0.73), -bodyHalfHeight * 0.49);
        ctx.stroke();
        ctx.strokeStyle = "#b5c7ce";
    }

    // Broad lower flaps with the tall, triangular planform from the blueprint.
    const aftRootTopY = bodyHalfHeight * 0.3;
    const aftRootBottomY = bodyHalfHeight * 0.84;
    ctx.fillStyle = "#2d3941";
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * bodyHalfWidth * 0.98, aftRootTopY);
        ctx.lineTo(side * (bodyHalfWidth + tailSpan), bodyHalfHeight * 0.78);
        ctx.lineTo(side * (bodyHalfWidth + tailSpan * 0.8), bodyHalfHeight * 0.98);
        ctx.lineTo(side * bodyHalfWidth * 0.7, bodyHalfHeight * 0.98);
        ctx.lineTo(side * bodyHalfWidth, aftRootBottomY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(206, 220, 225, 0.35)";
        for (let y = aftRootTopY + 8 * camera.zoom; y < bodyHalfHeight * 0.9; y += 7 * camera.zoom) {
            ctx.beginPath();
            ctx.moveTo(side * bodyHalfWidth * 1.03, y);
            ctx.lineTo(side * (bodyHalfWidth + tailSpan * 0.84), y + 6 * camera.zoom);
            ctx.stroke();
        }
        ctx.strokeStyle = "#b5c7ce";
    }

    ctx.fillStyle = "#31414b";
    ctx.fillRect(-bodyHalfWidth * 0.72, bodyHalfHeight * 0.78, bodyHalfWidth * 1.44, bodyHalfHeight * 0.18);
    ctx.fillStyle = "#18242c";
    for (const nozzleX of [-bodyHalfWidth * 0.42, 0, bodyHalfWidth * 0.42]) {
        ctx.beginPath();
        ctx.arc(nozzleX, bodyHalfHeight * 0.98, 2.1 * camera.zoom, 0, Math.PI * 2);
        ctx.fill();
    }

    // Landing-leg struts are visible when the ship is near vertical.
    ctx.strokeStyle = "#4b5a63";
    ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(side * bodyHalfWidth * 0.48, bodyHalfHeight * 0.8);
        ctx.lineTo(side * bodyHalfWidth * 0.82, bodyHalfHeight + 5 * camera.zoom);
        ctx.stroke();
    }

    drawEnginePlume();

    ctx.restore();
}

function rotateVehicleVector(vector, angle) {
    return {
        x: vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
        y: vector.x * Math.sin(angle) + vector.y * Math.cos(angle),
    };
}

function getRcsVisualPlumes(gx, gy, state, profile) {
    const rcsVisual = profile.rcs ?? {};
    const plumeScale = rcsVisual.visualPlumeScale ?? 1;

    // Translation jets are body-fixed, matching the force applied by the
    // arrow keys.  Their animated exhaust must rotate with the probe too.
    if (profile.isProbe && state === s && probeManualRcsActive && started) {
        const nozzleOffset = Math.max(
            5,
            (profile.dimensions?.diameter ?? 1) * camera.zoom * (rcsVisual.visualNozzleOffset ?? 0.8)
        );
        const translationPlumes = [
            probeManualRcsKeys.has("ArrowRight") && { x: -1, y: 0 },
            probeManualRcsKeys.has("ArrowLeft") && { x: 1, y: 0 },
            probeManualRcsKeys.has("ArrowUp") && { x: 0, y: 1 },
            probeManualRcsKeys.has("ArrowDown") && { x: 0, y: -1 },
        ].filter(Boolean).map((localDirection) => {
            const direction = rotateVehicleVector(localDirection, state.a ?? 0);
            return {
                baseX: gx + direction.x * nozzleOffset,
                baseY: gy + direction.y * nozzleOffset,
                direction,
                power: 1,
                scale: plumeScale,
            };
        });
        const rotationDirection = (probeManualRcsKeys.has("KeyD") ? 1 : 0) -
            (probeManualRcsKeys.has("KeyA") ? 1 : 0);
        if (rotationDirection === 0) return translationPlumes;

        // A/D fires an opposing pair of body-fixed jets. The pair produces a
        // pure yaw torque in the 2D model while leaving the arrow controls as
        // deliberate translation commands.
        const sideOffset = Math.max(5, (profile.dimensions?.diameter ?? 1) * camera.zoom * 0.7);
        const localPlumes = [
            { base: { x: sideOffset, y: 0 }, direction: { x: 0, y: -rotationDirection } },
            { base: { x: -sideOffset, y: 0 }, direction: { x: 0, y: rotationDirection } },
        ];
        const rotationPlumes = localPlumes.map((plume) => {
            const baseOffset = rotateVehicleVector(plume.base, state.a ?? 0);
            return {
                baseX: gx + baseOffset.x,
                baseY: gy + baseOffset.y,
                direction: rotateVehicleVector(plume.direction, state.a ?? 0),
                power: 1,
                scale: plumeScale,
            };
        });
        return [...translationPlumes, ...rotationPlumes];
    }

    const rcsCommand = state.rcs ?? 0;
    if (Math.abs(rcsCommand) <= 0.04) {
        return [];
    }

    // Attitude RCS is body-fixed. A lateral nozzle at the upper section
    // preserves the prior dynamics visualization while sharing the same
    // animated plume style as the probe.
    const dimensions = profile.dimensions ?? { length: profile.length ?? 50, diameter: profile.diameter ?? 9 };
    const side = Math.sign(rcsCommand) || 1;
    const localBase = {
        x: side * (dimensions.diameter / 2) * (rcsVisual.visualNozzleOffset ?? 0.95) * camera.zoom,
        y: -dimensions.length * 0.2 * camera.zoom,
    };
    const localDirection = { x: side, y: 0 };
    const baseOffset = rotateVehicleVector(localBase, state.a ?? 0);
    const direction = rotateVehicleVector(localDirection, state.a ?? 0);
    return [{
        baseX: gx + baseOffset.x,
        baseY: gy + baseOffset.y,
        direction,
        power: Math.abs(rcsCommand),
        scale: plumeScale,
    }];
}

function drawRcsPlumes(gx, gy, state = s, profile = getSelectedShipProfile()) {
    const plumes = getRcsVisualPlumes(gx, gy, state, profile);
    if (plumes.length === 0) return;

    const now = performance.now();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    plumes.forEach((plume, index) => {
        const perpendicular = { x: -plume.direction.y, y: plume.direction.x };
        const pulse = 0.78 + Math.sin(now * 0.026 + index * 1.7) * 0.18;
        const flicker = Math.max(0.45, pulse + Math.sin(now * 0.041 + index * 2.1) * 0.08) * plume.scale;
        const plumeLength = (9 + plume.power * 8) * flicker;
        const plumeWidth = (2.8 + plume.power * 2.2) * flicker;
        const tipX = plume.baseX + plume.direction.x * plumeLength;
        const tipY = plume.baseY + plume.direction.y * plumeLength;

        ctx.fillStyle = "rgba(85, 210, 255, 0.38)";
        ctx.beginPath();
        ctx.moveTo(plume.baseX + perpendicular.x * plumeWidth, plume.baseY + perpendicular.y * plumeWidth);
        ctx.lineTo(tipX, tipY);
        ctx.lineTo(plume.baseX - perpendicular.x * plumeWidth, plume.baseY - perpendicular.y * plumeWidth);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(226, 252, 255, 0.96)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(plume.baseX, plume.baseY);
        ctx.lineTo(
            plume.baseX + plume.direction.x * plumeLength * 0.78,
            plume.baseY + plume.direction.y * plumeLength * 0.78
        );
        ctx.stroke();

        ctx.fillStyle = "#e5fbff";
        ctx.beginPath();
        ctx.arc(plume.baseX, plume.baseY, 2.2 * plume.scale, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

function drawTowerStructure(groundY) {
    if (getSelectedPlatformProfile().visual !== "tower") {
        return;
    }

    const towerX = worldToScreenX(TOWER_WORLD_X);
    const towerTopY = groundY - (platformState?.towerHeight ?? getSelectedPlatformTowerHeight()) * camera.zoom;
    const captureY = groundY - (platformState?.captureZ ?? getSelectedPlatformCaptureHeight()) * camera.zoom;
    const mastWidth = 9 * camera.zoom;
    const mastX = towerX + TOWER_MAST_OFFSET_X * camera.zoom;
    const baseHalfWidth = 11 * camera.zoom;
    const active = isLinkedMode();
    const controlBuilding = getFlightControlBuildingScreenRect(groundY);
    const radioTargetX = controlBuilding.x + controlBuilding.width * 0.5;
    const radioTargetY = controlBuilding.y - 12 * camera.zoom;

    ctx.save();
    ctx.globalAlpha = active ? 1 : 0.72;
    ctx.fillStyle = "#293842";
    ctx.fillRect(mastX - mastWidth / 2 - 4, groundY - 5, mastWidth + 8, 6);
    ctx.strokeStyle = "#b7c7d6";
    ctx.lineWidth = 2.1;
    ctx.strokeRect(mastX - mastWidth / 2, towerTopY, mastWidth, groundY - towerTopY);
    ctx.strokeStyle = "#7e93a2";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(mastX - mastWidth / 2, groundY);
    ctx.lineTo(mastX + mastWidth / 2, towerTopY);
    ctx.moveTo(mastX + mastWidth / 2, groundY);
    ctx.lineTo(mastX - mastWidth / 2, towerTopY);
    ctx.stroke();
    ctx.strokeStyle = "#c1d2dc";
    ctx.lineWidth = 1.15;
    for (let y = groundY - 10 * camera.zoom; y > towerTopY + 5 * camera.zoom; y -= 12 * camera.zoom) {
        ctx.beginPath();
        ctx.moveTo(mastX - mastWidth / 2, y);
        ctx.lineTo(mastX + mastWidth / 2, y - 6 * camera.zoom);
        ctx.moveTo(mastX + mastWidth / 2, y);
        ctx.lineTo(mastX - mastWidth / 2, y - 6 * camera.zoom);
        ctx.stroke();
    }
    scene.drawTowerRadioAntenna(ctx, { mastX, towerTopY, zoom: camera.zoom, active, targetX: radioTargetX, targetY: radioTargetY });
    ctx.strokeStyle = active ? "rgba(121, 245, 205, 0.75)" : "rgba(255, 209, 102, 0.45)";
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(towerX - 8.8 * camera.zoom, captureY - 6.25 * camera.zoom, 17.6 * camera.zoom, 12.5 * camera.zoom);
    ctx.setLineDash([]);
    ctx.fillStyle = active ? "#79f5cd" : "#ffd166";
    ctx.font = "12px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(active ? "JANELA DE CAPTURA" : getSelectedPlatformLabel(), mastX, towerTopY - 10);
    ctx.textAlign = "start";
    ctx.restore();
}

function drawLinkedRadioCommunication(groundY) {
    const linkActive = isLinkedMode() && getSelectedPlatformProfile().visual === "tower";
    const building = getFlightControlBuildingScreenRect(groundY);
    const sourceX = building.x + building.width * 0.26;
    const sourceY = building.y - 5 - (scene.linkDeployment ?? 0) * 36;
    const towerX = worldToScreenX(TOWER_WORLD_X) + TOWER_MAST_OFFSET_X * camera.zoom;
    const towerY = groundY - (platformState?.towerHeight ?? getSelectedPlatformTowerHeight()) * camera.zoom - 9 * camera.zoom;
    scene.drawRadioCommunication(ctx, { active: linkActive, sourceX, sourceY, targetX: towerX, targetY: towerY });
}

function getSuborbitalLaunchArmClosure() {
    // Use the physical stack state rather than the currently selected UI
    // profile. The renderer may temporarily select S24 to draw the docked
    // vehicle, while the launch arms must still hold the B7 + S24 assembly.
    if (!stackMission.attachS24 || stackMission.separated) return null;

    // The launch arms hold the stack in its pre-flight visual position, then
    // retract smoothly through the first 55 m of ascent. This is separate
    // from the physical capture machine, which remains inactive at launch.
    const liftoffClearance = Math.max(0, s.z - getLaunchPadRestingCenterAltitude());
    const progress = clamp(liftoffClearance / 55, 0, 1);
    const easedProgress = progress * progress * (3 - 2 * progress);
    return 0.76 * (1 - easedProgress);
}

function drawTowerArms(groundY) {
    if (getSelectedPlatformProfile().visual !== "tower") {
        return;
    }

    const towerX = worldToScreenX(TOWER_WORLD_X);
    const captureY = groundY - (platformState?.captureZ ?? getSelectedPlatformCaptureHeight()) * camera.zoom;
    const mastX = towerX + TOWER_MAST_OFFSET_X * camera.zoom;
    const mastHalf = 4.5 * camera.zoom;
    const launchArmClosure = getSuborbitalLaunchArmClosure();
    // B7 owns an independent tower session after hot-staging. Render its arm
    // state rather than the concurrently selected S24's inactive session.
    const boosterTowerState = detachedBoosterFlight?.towerLink;
    const armState = boosterTowerState?.linkedShipId === "superheavy_b7"
        ? boosterTowerState
        : platformState;
    const leftClosure = launchArmClosure ?? armState?.leftArmClosure ?? armState?.armClosure ?? 0;
    const rightClosure = launchArmClosure ?? armState?.rightArmClosure ?? armState?.armClosure ?? 0;
    const leftBroken = Boolean(armState?.leftArmBroken);
    const rightBroken = Boolean(armState?.rightArmBroken);
    const leftGapHalf = lerp(17, 4.5, leftClosure) * camera.zoom;
    const rightGapHalf = lerp(17, 4.5, rightClosure) * camera.zoom;
    const activeColor = armState?.captured ? "#8cff9c" : (isLinkedMode() || boosterTowerState) ? "#9fd3ff" : "#7f93a6";
    const armScale = camera.zoom;

    ctx.save();
    const drawTrussBoom = (start, end, color, thickness = 10) => {
        const half = thickness / 2;
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.strokeStyle = "#e1eef2";
        ctx.lineWidth = 1;
        const segments = 7;
        for (let index = 0; index < segments; index += 1) {
            const t0 = index / segments;
            const t1 = (index + 1) / segments;
            const x0 = lerp(start.x, end.x, t0);
            const y0 = lerp(start.y, end.y, t0);
            const x1 = lerp(start.x, end.x, t1);
            const y1 = lerp(start.y, end.y, t1);
            ctx.beginPath();
            ctx.moveTo(x0, y0 - half * 0.62);
            ctx.lineTo(x1, y1 + half * 0.62);
            ctx.moveTo(x0, y0 + half * 0.62);
            ctx.lineTo(x1, y1 - half * 0.62);
            ctx.stroke();
        }
    };

    // Side view: mast to the west, with the cantilever projecting east toward
    // the sea. This matches the site orientation requested for the scene.
    const boomRoot = { x: mastX + mastHalf, y: captureY - 1 * armScale };
    const rightTip = { x: towerX + rightGapHalf, y: captureY - 1 * armScale };
    const leftTip = { x: towerX - leftGapHalf, y: captureY + 4 * armScale };
    const braceRoot = { x: mastX + mastHalf, y: captureY + 30 * armScale };
    const braceTip = { x: rightTip.x - 6 * armScale, y: captureY + 4 * armScale };
    const rightColor = rightBroken ? "#ff6f6f" : activeColor;
    const leftColor = leftBroken ? "#ff6f6f" : activeColor;

    if (!rightBroken) {
        drawTrussBoom(boomRoot, rightTip, rightColor, 9);
        drawTrussBoom(braceRoot, braceTip, "#647d8b", 5);
        ctx.strokeStyle = "#97adba";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(boomRoot.x, boomRoot.y + 4 * armScale);
        ctx.lineTo(braceTip.x, braceTip.y);
        ctx.stroke();
    } else {
        drawTrussBoom(boomRoot, { x: boomRoot.x + 8 * armScale, y: boomRoot.y }, "#ff6f6f", 8);
    }

    // A secondary, shaded boom suggests the opposite chopstick without
    // hiding the rocket in this lateral projection. It deliberately follows
    // the left closure instead of mirroring the right arm.
    if (!leftBroken) {
        drawTrussBoom({ x: mastX + mastHalf, y: captureY + 7 * armScale }, leftTip, leftColor, 5);
    } else {
        drawTrussBoom(
            { x: mastX + mastHalf, y: captureY + 7 * armScale },
            { x: mastX + mastHalf + 8 * armScale, y: captureY + 7 * armScale },
            "#ff6f6f",
            5
        );
    }

    ctx.strokeStyle = "#eefaff";
    ctx.lineWidth = 1.2;
    const drawClaw = (tip, inwardDirection, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y - 6 * armScale);
        ctx.lineTo(tip.x + inwardDirection * 5 * armScale, tip.y - 1 * armScale);
        ctx.lineTo(tip.x + inwardDirection * 5 * armScale, tip.y + 5 * armScale);
        ctx.lineTo(tip.x, tip.y + 6 * armScale);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    };
    if (!rightBroken) drawClaw(rightTip, -1, rightColor);
    if (!leftBroken) drawClaw(leftTip, 1, leftColor);

    if (isLinkedMode() || boosterTowerState) {
        ctx.fillStyle = leftBroken || rightBroken ? "#ff8f8f" : armState?.captured ? "#8cff9c" : "#9fd3ff";
        ctx.font = "11px Segoe UI";
        ctx.textAlign = "center";
        ctx.fillText(armState?.status ?? getSelectedPlatformLabel(), towerX, captureY - 28);
        ctx.textAlign = "start";
    }

    ctx.restore();
}

function drawTowerApproachPoint() {
    if (!isLinkedMode() || typeof platformState?.approachX !== "number" || typeof platformState?.approachZ !== "number") {
        return;
    }

    const x = worldToScreenX(platformState.approachX);
    const y = worldToScreenY(platformState.approachZ);

    ctx.save();
    ctx.strokeStyle = "rgba(255, 209, 102, 0.9)";
    ctx.fillStyle = "#ffd166";
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x - 18, y);
    ctx.lineTo(x + 18, y);
    ctx.moveTo(x, y - 18);
    ctx.lineTo(x, y + 18);
    ctx.stroke();
    ctx.font = "11px Segoe UI";
    ctx.fillText(
        `APROX. X ${platformState.approachX.toFixed(0)} m | Z ${platformState.approachZ.toFixed(0)} m`,
        x + 18,
        y - 16
    );
    ctx.restore();
}

function drawCollisionMarker(point, tag) {
    const x = worldToScreenX(point.x);
    const y = worldToScreenY(point.z);
    const size = 7;

    ctx.save();
    ctx.strokeStyle = "#ff4d5f";
    ctx.fillStyle = "#ff4d5f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
    ctx.font = "700 10px Segoe UI";
    ctx.fillText(tag, x + size + 3, y - size - 2);
    ctx.restore();
}

function drawCollisionMarkers() {
    (s.collisionMarkers ?? []).forEach((marker) => {
        drawCollisionMarker(marker.vehicle, "N");
        drawCollisionMarker(marker.tower, "T");
    });
}

function drawLandingTarget(groundY) {
    if (isLinkedMode()) {
        return;
    }

    const targetScreenX = worldToScreenX(landingTargetX);

    if (targetScreenX < -40 || targetScreenX > c.width + 40) {
        return;
    }

    ctx.strokeStyle = "#ffd166";
    ctx.fillStyle = "#ffd166";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(targetScreenX, groundY - 26);
    ctx.lineTo(targetScreenX, groundY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(targetScreenX, groundY - 32);
    ctx.lineTo(targetScreenX - 7, groundY - 20);
    ctx.lineTo(targetScreenX + 7, groundY - 20);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(targetScreenX - 18, groundY);
    ctx.lineTo(targetScreenX + 18, groundY);
    ctx.stroke();
    ctx.font = "12px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(`ALVO DE POUSO ${landingTargetX.toFixed(0)} m`, targetScreenX, groundY - 38);
    ctx.textAlign = "start";
    ctx.lineWidth = 1;
}

function drawProjectedImpact(groundY) {
    if (!started || typeof controlState.projectedImpactX !== "number") {
        return;
    }

    const projectedScreenX = worldToScreenX(controlState.projectedImpactX);
    const targetZ = typeof controlState.projectedTargetZ === "number" ? controlState.projectedTargetZ : 0;
    const targetY = groundY - targetZ * camera.zoom;

    if (projectedScreenX < -40 || projectedScreenX > c.width + 40) {
        return;
    }

    ctx.save();
    ctx.strokeStyle = "#6ee7ff";
    ctx.fillStyle = "#6ee7ff";
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(projectedScreenX, targetY - 18);
    ctx.lineTo(projectedScreenX, targetY + (isCapturePlatformActive() ? 18 : 0));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "11px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(
        `${isCapturePlatformActive() ? "PROJECAO PLATAFORMA" : "PROJECAO"} ${controlState.projectedImpactX.toFixed(0)} m`,
        projectedScreenX,
        targetY - 24
    );
    ctx.restore();
}

function drawLandingResult(x, y, w) {
    if (!s.end && !s.waterLandingCertified) {
        return;
    }

    const success = Boolean(s.landingSuccess);
    const title = s.resultTitle || (success ? "POUSO BEM-SUCEDIDO" : "FALHA NO POUSO");
    const detail = s.resultDetail || "";

    ctx.fillStyle = success ? "rgba(20, 120, 60, 0.9)" : "rgba(150, 30, 30, 0.92)";
    ctx.fillRect(x, y, w, 54);
    ctx.strokeStyle = success ? "#7cffb2" : "#ff8a8a";
    ctx.strokeRect(x, y, w, 54);
    ctx.fillStyle = "white";
    ctx.font = "bold 15px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, x + w / 2, y + 16);
    ctx.font = "13px Segoe UI";
    ctx.fillText(truncateText(detail, 52), x + w / 2, y + 38);
    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
}


function getFlightPhaseSummary() {
    if (s.collisionFailure) {
        return "COLISÃO | simulação congelada para análise";
    }

    if (s.waterFloating) {
        return s.waterLandingCertified
            ? "AMERRISSAGEM BEM-SUCEDIDA | nave boiando e oscilando na água"
            : "AMERRISSAGEM | aguardando 10 s de flutuação estável";
    }

    if (s.waterLanding) {
        return "AMERRISSAGEM | perda de estabilidade vertical; tombando";
    }

    if (!started) {
        return "PRONTO | aguardando início da missão";
    }

    if (controlState.mode === "TOWER APPROACH POINT") {
        const approachX = platformState?.approachX ?? controlState.targetX ?? 0;
        const approachZ = platformState?.approachZ ?? controlState.targetZ ?? 0;
        const tolerance = platformState?.approachTolerance ?? 80;
        return `PONTO DE APROXIMAÇÃO | aguardando X ${approachX.toFixed(0)} m / Z ${approachZ.toFixed(0)} m | tolerância ${tolerance.toFixed(0)} m`;
    }

    const phase = controlState.sequencePhase ?? getSelectedShipMissionState().sequencePhase;
    if (phase === "ASCENT") {
        const targetAltitude = getSelectedShipMissionConfig().testAltitudeSetpoint;
        return `DECOLAGEM | aguardando altitude ${targetAltitude.toFixed(0)} m | T+ ${formatMissionTime(simTime)}`;
    }

    if (phase === "HOLD") {
        const remaining = Math.max(0, controlState.holdTimeRemaining ?? 0);
        return `ESTABILIZAÇÃO | aguardando ${remaining.toFixed(1)} s antes do retorno`;
    }

    if (phase === "RECOVERY" || phase === "BELLYFLOP") {
        return `RETORNO | aguardando alinhamento com a plataforma`;
    }

    if (controlState.mode?.includes("CAPTURE")) {
        return "CAPTURA FINAL | aguardando posição, velocidade e atitude dentro do envelope";
    }

    return `${controlState.mode ?? "VOO"} | acompanhando guiagem ativa`;
}

function getEngineHudConfiguration() {
    const propulsion = getSelectedShipPropulsion();
    if (propulsion) {
        return {
            count: propulsion.engines.count,
            seaLevelCount: propulsion.engines.seaLevelCount,
            vacuumCount: propulsion.engines.vacuumCount,
            label: "RAPTOR SL",
            thrustMn: getVehicleMaxThrust() / 1e6,
        };
    }

    if (isProbeSelected()) {
        return { count: 0, label: "SEM PROPULSÃO", thrustMn: 0 };
    }

    // Ships not yet migrated to the detailed propulsion model retain their
    // existing aggregate three-engine simulation configuration.
    return { count: 3, label: "MOTORES SIM.", thrustMn: getVehicleMaxThrust() / 1e6 };
}

function drawSuperHeavyRaptorLayout(centerX, centerY, powerFraction) {
    // B7's 33 Raptors: 3 in the centre, 10 in the inner ring and 20 in the
    // outer ring. The dot size is intentionally compact so all three rings
    // remain legible inside the same circular SpaceX HUD instrument.
    ctx.save();
    ctx.strokeStyle = "rgba(219, 241, 250, 0.30)";
    ctx.lineWidth = 0.75;
    [13, 25].forEach((radius) => {
        ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke();
    });
    const engines = [
        ...[-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6].map((angle) => ({
            x: centerX + Math.cos(angle) * 3.7,
            y: centerY + Math.sin(angle) * 3.7,
            radius: 2.8,
        })),
        ...Array.from({ length: 10 }, (_, index) => {
            const angle = (index / 10) * Math.PI * 2 - Math.PI / 2;
            return { x: centerX + Math.cos(angle) * 13, y: centerY + Math.sin(angle) * 13, radius: 2.35 };
        }),
        ...Array.from({ length: 20 }, (_, index) => {
            const angle = (index / 20) * Math.PI * 2 - Math.PI / 2;
            return { x: centerX + Math.cos(angle) * 25, y: centerY + Math.sin(angle) * 25, radius: 2.1 };
        }),
    ];
    const activeEngines = Math.round(clamp(powerFraction, 0, 1) * engines.length);
    engines.forEach((engine, index) => {
        // Engine order follows the physical staging order: core, inner ring,
        // then outer ring. A throttle ramp therefore reads as an outward
        // ignition animation instead of a simultaneous colour change.
        ctx.fillStyle = index < activeEngines ? "#ffad5a" : "#50616d";
        ctx.beginPath(); ctx.arc(engine.x, engine.y, engine.radius, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#e8f7ff";
        ctx.lineWidth = 0.45;
        ctx.stroke();
    });
    ctx.restore();
}

function drawStarshipEngineLayout(centerX, centerY, powerFraction, altitude) {
    // S24: three sea-level Raptors in the core and three vacuum Raptors on
    // the outside. The vacuum set is a space-only visual indication and does
    // not alter the vehicle's physical thrust model.
    const coreAngles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
    const vacuumAngles = [-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6];
    const activeCore = Math.round(clamp(powerFraction, 0, 1) * 3);
    const vacuumEnabled = altitude >= 100000;
    const activeVacuum = vacuumEnabled ? Math.round(clamp(powerFraction, 0, 1) * 3) : 0;

    ctx.save();
    ctx.strokeStyle = "rgba(219, 241, 250, 0.30)";
    ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.arc(centerX, centerY, 22, 0, Math.PI * 2); ctx.stroke();
    coreAngles.forEach((angle, index) => {
        ctx.fillStyle = index < activeCore ? "#ffad5a" : "#50616d";
        ctx.beginPath();
        ctx.arc(centerX + Math.cos(angle) * 4, centerY + Math.sin(angle) * 4, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#e8f7ff";
        ctx.lineWidth = 0.55;
        ctx.stroke();
    });
    vacuumAngles.forEach((angle, index) => {
        ctx.fillStyle = index < activeVacuum ? "#79d8ff" : "#50616d";
        ctx.beginPath();
        ctx.arc(centerX + Math.cos(angle) * 22, centerY + Math.sin(angle) * 22, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#e8f7ff";
        ctx.lineWidth = 0.55;
        ctx.stroke();
    });
    ctx.restore();
}

function drawEngineConfigurationHud(x, y, width, height) {
    const config = getEngineHudConfiguration();
    ctx.save();
    ctx.textAlign = "center";

    if (config.count === 0) {
        ctx.restore();
        return;
    }

    const failed = failureConfig.engine;
    const centerX = x + width / 2;
    const centerY = y + 47;
    const layout = config.count === 3
        ? [
            { x: centerX, y: centerY - 10 },
            { x: centerX - 15, y: centerY + 9 },
            { x: centerX + 15, y: centerY + 9 },
        ]
        : config.count === 1
            ? [{ x: centerX, y: centerY }]
            : Array.from({ length: config.count }, (_, index) => ({
                x: centerX + Math.cos((index / config.count) * Math.PI * 2 - Math.PI / 2) * 18,
                y: centerY + Math.sin((index / config.count) * Math.PI * 2 - Math.PI / 2) * 18,
            }));
    ctx.strokeStyle = "rgba(219, 241, 250, 0.64)";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(centerX, centerY, 37, 0, Math.PI * 2); ctx.stroke();
    if (isSuperHeavySelected() && config.count === 33) {
        drawSuperHeavyRaptorLayout(
            centerX,
            centerY,
            s.engineOn && failureConfig.engine !== "no_ignition" && failureConfig.engine !== "flameout" ? s.throttle : 0
        );
        ctx.restore();
        return;
    }
    if (config.seaLevelCount === 3 && config.vacuumCount === 3) {
        drawStarshipEngineLayout(centerX, centerY, s.engineOn ? s.throttle : 0, s.z ?? 0);
        ctx.restore();
        return;
    }
    layout.forEach((position, index) => {
        const centerEngine = index === Math.floor(config.count / 2);
        const disabled = !s.engineOn || failed === "no_ignition" || failed === "flameout" ||
            (failed === "single_engine" && !centerEngine) || (failed === "one_out" && index === 0);
        const color = disabled && s.engineOn && (failed === "one_out" || failed === "single_engine" || failed === "flameout")
            ? "#f05c5c"
            : disabled ? "#50616d" : "#ffad5a";
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(position.x, position.y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#e8f7ff";
        ctx.lineWidth = 1;
        ctx.stroke();
        if (!disabled) {
            ctx.fillStyle = "rgba(255, 161, 70, 0.35)";
            ctx.beginPath(); ctx.moveTo(position.x - 4, position.y + 7); ctx.lineTo(position.x, position.y + 15); ctx.lineTo(position.x + 4, position.y + 7); ctx.closePath(); ctx.fill();
        }
    });
    ctx.restore();
}

function drawVehicleEngineConfigurationHud(x, y, width, height, profile, state) {
    const propulsion = profile.propulsion;
    const engineCount = propulsion?.engines?.count ?? 0;
    const power = state.engineOn ? clamp(state.throttle ?? 0, 0, 1) * 100 : 0;
    const centerX = x + width / 2;
    const radius = 34;
    // The caller aligns this centre with the speed/altitude gauges.
    const centerY = y + 60;
    const displayedEngines = Math.min(engineCount, 12);

    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = profile.vehicleClass === "superheavy_booster" ? "#ffd166" : "#79f5cd";
    ctx.font = "700 9px system-ui";
    const hasStarshipVacuumLayout = propulsion?.engines?.seaLevelCount === 3 && propulsion?.engines?.vacuumCount === 3;
    ctx.fillText(
        hasStarshipVacuumLayout ? `${profile.callsign} · 3 SL + 3 VAC` : `${profile.callsign} · ${engineCount} Raptor`,
        centerX,
        centerY - radius - 8
    );
    ctx.strokeStyle = "rgba(219, 241, 250, 0.64)";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.stroke();
    if (profile.vehicleClass === "superheavy_booster" && engineCount === 33) {
        drawSuperHeavyRaptorLayout(centerX, centerY, power / 100);
    } else if (hasStarshipVacuumLayout) {
        drawStarshipEngineLayout(centerX, centerY, power / 100, state.z ?? 0);
    } else {
        for (let index = 0; index < displayedEngines; index += 1) {
            const angle = (index / displayedEngines) * Math.PI * 2 - Math.PI / 2;
            const active = index < Math.ceil((power / 100) * displayedEngines);
            ctx.fillStyle = active ? "#ffad5a" : "#50616d";
            ctx.beginPath();
            ctx.arc(centerX + Math.cos(angle) * 17, centerY + Math.sin(angle) * 17, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#e8f7ff";
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
    }
    ctx.fillStyle = "rgba(235, 246, 252, 0.78)";
    ctx.font = "700 9px system-ui";
    ctx.fillText("POTÊNCIA", centerX, centerY + radius + 12);
    ctx.fillStyle = power > 0 ? "#ffb05e" : "#ffffff";
    ctx.font = "700 17px system-ui";
    ctx.fillText(`${power.toFixed(0)}%`, centerX, centerY + radius + 29);
    ctx.restore();
}

function drawSpaceXTelemetryHudMobile() {
    const hudFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const width = c.width;
    const height = c.height;
    
    const altitude = Math.max(0, nav?.z ?? s.z);
    const speedKmh = Math.hypot(nav?.vx ?? s.vx, nav?.vz ?? s.vz) * 3.6;
    const power = s.engineOn ? s.throttle * 100 : 0;
    const angleDegs = (nav?.a ?? s.a) * 57.3;
    const vzMs = nav?.vz ?? s.vz;
    const qPa = nav?.q ?? 0;

    // Painel visual dos 6 painéis à esquerda
    const leftPanelX = 8;
    const startY = 20;
    const gaugeRadius = 18;
    const spacingY = 50;
    
    const gauges = [
        { label: "VEL", value: `${speedKmh.toFixed(0)}`, unit: "km/h", y: startY },
        { label: "ALT", value: `${altitude.toFixed(0)}`, unit: "m", y: startY + spacingY },
        { label: "POT", value: `${power.toFixed(0)}`, unit: "%", y: startY + spacingY * 2 },
        { label: "ANG", value: `${angleDegs.toFixed(0)}`, unit: "°", y: startY + spacingY * 3 },
        { label: "VZ", value: `${vzMs.toFixed(1)}`, unit: "m/s", y: startY + spacingY * 4 },
        { label: "Q", value: `${qPa.toFixed(0)}`, unit: "Pa", y: startY + spacingY * 5 },
    ];

    ctx.save();

    // Desenha os 6 painéis redondos na esquerda
    gauges.forEach((gauge) => {
        const gaugeX = leftPanelX + gaugeRadius + 6;
        
        // Círculo do painel
        ctx.strokeStyle = "rgba(243, 249, 252, 0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(gaugeX, gauge.y, gaugeRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Label (topo)
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(235, 246, 252, 0.8)";
        ctx.font = `600 6px ${hudFont}`;
        ctx.fillText(gauge.label, gaugeX, gauge.y - 6);
        
        // Valor (centro)
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 10px ${hudFont}`;
        ctx.fillText(gauge.value, gaugeX, gauge.y + 3);
        
        // Unidade (bottom)
        ctx.fillStyle = "rgba(235, 246, 252, 0.6)";
        ctx.font = `600 5px ${hudFont}`;
        ctx.fillText(gauge.unit, gaugeX, gauge.y + 11);
    });

    // Arco de estágios no centro-topo
    const missionHud = controlState?.missionHud ?? flightController.idleCommand().missionHud;
    const stages = missionHud.stages;
    let activeStage = clamp(missionHud.activeStage, 0, stages.length - 1);
    let completedStage = clamp(missionHud.completedStage, 0, stages.length - 1);
    const terminalMission = s.captured || s.waterLandingCertified || (s.landingSuccess === true && s.end);
    if (terminalMission) {
        activeStage = stages.length - 1;
        completedStage = stages.length - 1;
    }

    const arcStart = { x: width * 0.4, y: 35 };
    const arcControl = { x: width * 0.5, y: 5 };
    const arcEnd = { x: width * 0.6, y: 35 };
    const bezierPoint = (t) => ({
        x: (1 - t) ** 2 * arcStart.x + 2 * (1 - t) * t * arcControl.x + t ** 2 * arcEnd.x,
        y: (1 - t) ** 2 * arcStart.y + 2 * (1 - t) * t * arcControl.y + t ** 2 * arcEnd.y,
    });

    ctx.strokeStyle = "rgba(235, 246, 252, 0.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(arcStart.x, arcStart.y);
    ctx.quadraticCurveTo(arcControl.x, arcControl.y, arcEnd.x, arcEnd.y);
    ctx.stroke();

    stages.forEach((stage, index) => {
        const point = bezierPoint(index / Math.max(1, stages.length - 1));
        const complete = index <= completedStage;
        const active = index === activeStage && !terminalMission;
        ctx.fillStyle = complete ? "#ffffff" : active ? "#ffb05e" : "rgba(9, 16, 22, 0.88)";
        ctx.strokeStyle = active ? "#ffb05e" : complete ? "#ffffff" : "rgba(235, 246, 252, 0.68)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(point.x, point.y, active ? 3.5 : complete ? 3 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });

    // Sobrepor gradiente no topo e bottom para suavizar
    const topGradient = ctx.createLinearGradient(0, 0, 0, 100);
    topGradient.addColorStop(0, "rgba(2, 7, 13, 0.8)");
    topGradient.addColorStop(1, "rgba(2, 7, 13, 0)");
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, 60);

    const bottomGradient = ctx.createLinearGradient(0, height - 120, 0, height);
    bottomGradient.addColorStop(0, "rgba(2, 7, 13, 0)");
    bottomGradient.addColorStop(1, "rgba(2, 7, 13, 0.94)");
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, height - 120, width, 120);

    // Tempo no bottom centralizado
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 26px ${hudFont}`;
    ctx.fillText(getMissionClockDisplay(), width * 0.5, height - 60);

    // Botões de controle no bottom: velocidade acelerada e start
    const btnStartY = height - 42;
    const btnHeight = 28;
    const btnSpacing = 8;
    const speedBtnWidth = 40;
    const startBtnWidth = 70;
    const totalBtnWidth = speedBtnWidth * 3 + startBtnWidth + btnSpacing * 3;
    const startBtnX = (width - totalBtnWidth) / 2;
    
    const speedMultipliers = [1, 5, 100];
    speedMultipliers.forEach((multiplier, index) => {
        const btnX = startBtnX + index * (speedBtnWidth + btnSpacing);
        const isActive = multiplier === sim;
        
        ctx.fillStyle = isActive ? "rgba(251, 176, 94, 0.9)" : "rgba(100, 140, 170, 0.4)";
        ctx.strokeStyle = isActive ? "#ffb05e" : "rgba(200, 220, 240, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.fillRect(btnX, btnStartY, speedBtnWidth, btnHeight);
        ctx.strokeRect(btnX, btnStartY, speedBtnWidth, btnHeight);
        
        ctx.fillStyle = isActive ? "#ffffff" : "rgba(220, 240, 255, 0.7)";
        ctx.font = `600 11px ${hudFont}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${multiplier}x`, btnX + speedBtnWidth / 2, btnStartY + btnHeight / 2);
    });

    // Botão START/PAUSE (posição à direita dos botões de speed)
    const startBtnXPos = startBtnX + speedBtnWidth * 3 + btnSpacing * 3;
    const isRunning = started && !paused;
    ctx.fillStyle = isRunning ? "rgba(121, 245, 205, 0.3)" : "rgba(100, 160, 110, 0.4)";
    ctx.strokeStyle = isRunning ? "#79f5cd" : "rgba(150, 200, 160, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.fillRect(startBtnXPos, btnStartY, startBtnWidth, btnHeight);
    ctx.strokeRect(startBtnXPos, btnStartY, startBtnWidth, btnHeight);
    
    ctx.fillStyle = isRunning ? "#ffffff" : "rgba(220, 240, 255, 0.8)";
    ctx.font = `600 11px ${hudFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isRunning ? "PAUSE" : "START", startBtnXPos + startBtnWidth / 2, btnStartY + btnHeight / 2);

    // Botão discreto para selecionar instâncias (canto superior direito)
    const btnX = width - 36;
    const btnY = 16;
    const btnSize = 22;
    
    ctx.fillStyle = "rgba(243, 249, 252, 0.15)";
    ctx.strokeStyle = "rgba(243, 249, 252, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(btnX, btnY, btnSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = "rgba(243, 249, 252, 0.8)";
    ctx.font = `600 11px ${hudFont}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⚙", btnX, btnY);

    // Armazenar posições dos botões para clique
    window.mobileHudButtons = {
        speeds: speedMultipliers.map((mult, idx) => ({
            x: startBtnX + idx * (speedBtnWidth + btnSpacing),
            y: btnStartY,
            w: speedBtnWidth,
            h: btnHeight,
            multiplier: mult,
        })),
        start: { x: startBtnXPos, y: btnStartY, w: startBtnWidth, h: btnHeight },
        instances: { x: btnX, y: btnY, r: btnSize / 2 },
    };

    ctx.textAlign = "start";
    ctx.textBaseline = "alphabetic";
    ctx.restore();
}


function drawSpaceXTelemetryHud() {
    const hudFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    const height = 138;
    const width = c.width;
    const x = 0;
    const y = c.height - height;
    const altitude = Math.max(0, nav?.z ?? s.z);
    const speedKmh = Math.hypot(nav?.vx ?? s.vx, nav?.vz ?? s.vz) * 3.6;
    const power = s.engineOn ? s.throttle * 100 : 0;
    const detachedBoosterState = detachedBoosterFlight?.state ?? null;
    const stackStillAttached = !detachedBoosterState &&
        isSuperHeavySelected() && stackMission.attachS24 && !stackMission.separated;
    // The dual-stage SpaceX layout applies to the coupled stack as well as
    // the free-flight pair. While coupled, both stages share kinematics but
    // retain independent engine-state readouts.
    const dualStageTelemetry = Boolean(detachedBoosterState || stackStillAttached);
    const boosterState = detachedBoosterState ?? (stackStillAttached ? s : null);
    const boosterProfile = detachedBoosterFlight?.profile ?? (stackStillAttached ? getSelectedShipProfile() : null);
    const starshipState = stackStillAttached
        ? {
            ...s,
            engineOn: Boolean(controlState?.hotStageIgnition),
            throttle: controlState?.hotStageIgnition ? flightControlState.hotstageThrottle : 0,
        }
        : s;
    const history = telemetry.slice(-72);

    ctx.save();
    const overlay = ctx.createLinearGradient(0, y, 0, c.height);
    overlay.addColorStop(0, "rgba(2, 7, 13, 0)");
    overlay.addColorStop(0.32, "rgba(2, 7, 13, 0.5)");
    overlay.addColorStop(1, "rgba(2, 7, 13, 0.88)");
    ctx.fillStyle = overlay;
    ctx.fillRect(x, y, width, height);

    const missionHud = controlState?.missionHud ?? flightController.idleCommand().missionHud;
    const stages = missionHud.stages;
    let activeStage = clamp(missionHud.activeStage, 0, stages.length - 1);
    let completedStage = clamp(missionHud.completedStage, 0, stages.length - 1);
    const terminalMission = s.captured || s.waterLandingCertified || (s.landingSuccess === true && s.end);
    if (terminalMission) {
        activeStage = stages.length - 1;
        completedStage = stages.length - 1;
    }

    const arcStart = { x: width * 0.28, y: y + 47 };
    const arcControl = { x: width * 0.5, y: y + 2 };
    const arcEnd = { x: width * 0.72, y: y + 47 };
    const bezierPoint = (t) => ({
        x: (1 - t) ** 2 * arcStart.x + 2 * (1 - t) * t * arcControl.x + t ** 2 * arcEnd.x,
        y: (1 - t) ** 2 * arcStart.y + 2 * (1 - t) * t * arcControl.y + t ** 2 * arcEnd.y,
    });

    ctx.strokeStyle = "rgba(235, 246, 252, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(arcStart.x, arcStart.y);
    ctx.quadraticCurveTo(arcControl.x, arcControl.y, arcEnd.x, arcEnd.y);
    ctx.stroke();
    stages.forEach((stage, index) => {
        const point = bezierPoint(index / (stages.length - 1));
        const complete = index <= completedStage;
        const active = index === activeStage && !terminalMission;
        ctx.fillStyle = complete ? "#ffffff" : active ? "#ffb05e" : "rgba(9, 16, 22, 0.88)";
        ctx.strokeStyle = active ? "#ffb05e" : complete ? "#ffffff" : "rgba(235, 246, 252, 0.68)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, active ? 6 : complete ? 5 : 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = active || complete ? "#ffffff" : "rgba(235, 246, 252, 0.7)";
        ctx.font = `700 8px ${hudFont}`;
        ctx.textAlign = "center";
        ctx.fillText(stage, point.x, point.y < y + 18 ? point.y + 18 : point.y - 11);
    });

    const gauge = (label, value, gaugeX) => {
        // Separated-stage instruments sit slightly higher than the standard
        // HUD, leaving their labels clear of the lower telemetry edge.
        const gaugeY = y + (dualStageTelemetry ? 68 : 90);
        const gaugeRadius = dualStageTelemetry ? 34 : 30;
        ctx.strokeStyle = "rgba(243, 249, 252, 0.8)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, gaugeRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(243, 249, 252, 0.28)";
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, gaugeRadius - 6, Math.PI * 0.72, Math.PI * 1.72);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(235, 246, 252, 0.78)";
        ctx.font = `700 8px ${hudFont}`;
        ctx.fillText(label, gaugeX, gaugeY - 9);
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 17px ${hudFont}`;
        ctx.fillText(value, gaugeX, gaugeY + 10);
    };

    if (dualStageTelemetry) {
        const boosterSpeedKmh = Math.hypot(boosterState.vx ?? 0, boosterState.vz ?? 0) * 3.6;
        const boosterAltitude = Math.max(0, boosterState.z ?? 0);
        gauge("B7 VEL.", `${boosterSpeedKmh.toFixed(0)}`, x + 55);
        gauge("B7 ALTITUDE", `${boosterAltitude.toFixed(0)}`, x + 145);
        gauge("S24 VEL.", `${speedKmh.toFixed(0)}`, x + width - 235);
        gauge("S24 ALTITUDE", `${altitude.toFixed(0)}`, x + width - 145);
    } else {
        gauge("VELOCIDADE", `${speedKmh.toFixed(0)}`, x + 66);
        gauge("ALTITUDE", `${altitude.toFixed(0)}`, x + 142);
    }
    ctx.fillStyle = "rgba(235, 246, 252, 0.75)";
    ctx.font = `600 9px ${hudFont}`;
    ctx.textAlign = "center";
    if (dualStageTelemetry) {
        ctx.fillText("km/h", x + 55, y + 116);
        ctx.fillText("m", x + 145, y + 116);
        ctx.fillText("km/h", x + width - 235, y + 116);
        ctx.fillText("m", x + width - 145, y + 116);
    } else {
        // Keep units outside the circular readouts in the normal SpaceX HUD
        // too, matching the separated-stage presentation.
        ctx.fillText("km/h", x + 66, y + 134);
        ctx.fillText("m", x + 142, y + 134);
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(235, 246, 252, 0.8)";
    ctx.font = `700 10px ${hudFont}`;
    ctx.fillText(getFlightPhaseSummary(), x + width * 0.5, y + 70);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 29px ${hudFont}`;
    ctx.fillText(getMissionClockDisplay(), x + width * 0.5, y + 102);
    ctx.fillStyle = "#9cc8e8";
    ctx.font = `600 10px ${hudFont}`;
    ctx.fillText(`X ${s.x.toFixed(1)} m  ·  Z ${s.z.toFixed(1)} m`, x + width * 0.5, y + 123);

    if (dualStageTelemetry) {
        // Keep the full B7 instrument block before the mission arc and the
        // full S24 block after it, matching the physical left/right stage map.
        drawVehicleEngineConfigurationHud(x + 162.5, y + 8, 145, 105, boosterProfile, boosterState);
        drawVehicleEngineConfigurationHud(x + width - 127.5, y + 8, 145, 105, shipRegistry.starship_ship24, starshipState);
    } else {
        ctx.textAlign = "right";
        ctx.fillStyle = "rgba(235, 246, 252, 0.78)";
        ctx.font = `700 10px ${hudFont}`;
        ctx.fillText("POTÊNCIA DO MOTOR", x + width - 30, y + 71);
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 20px ${hudFont}`;
        ctx.fillText(`${power.toFixed(0)}%`, x + width - 30, y + 94);
        drawEngineConfigurationHud(x + width - 390, y + 36, 170, 94);
        const graphX = x + width - 190;
        const graphY = y + 108;
        const graphWidth = 160;
        const graphHeight = 18;
        ctx.strokeStyle = "rgba(255,255,255,0.32)";
        ctx.beginPath();
        ctx.moveTo(graphX, graphY + graphHeight);
        ctx.lineTo(graphX + graphWidth, graphY + graphHeight);
        ctx.stroke();
        ctx.strokeStyle = "#ffb05e";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        history.forEach((sample, index) => {
            const sampleX = graphX + (index / Math.max(1, history.length - 1)) * graphWidth;
            const sampleY = graphY + graphHeight - (clamp(sample.th, 0, 100) / 100) * graphHeight;
            if (index === 0) ctx.moveTo(sampleX, sampleY);
            else ctx.lineTo(sampleX, sampleY);
        });
        ctx.stroke();
    }
    ctx.textAlign = "start";
    ctx.restore();
}

function drawFlightTelemetryBar() {
    const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
    
    if (telemetryHudStyle === "spacex") {
        if (isMobileViewport) {
            drawSpaceXTelemetryHudMobile();
        } else {
            drawSpaceXTelemetryHud();
        }
        return;
    }

    const margin = 18;
    const height = 116;
    const width = Math.min(1160, c.width - margin * 2);
    const x = (c.width - width) / 2;
    const y = c.height - height - margin;
    const altitude = Math.max(0, nav?.z ?? s.z);
    const speedKmh = Math.hypot(nav?.vx ?? s.vx, nav?.vz ?? s.vz) * 3.6;
    const power = s.engineOn ? s.throttle * 100 : 0;
    const values = [
        { label: "COORDENADAS", value: `X ${s.x.toFixed(1)} m | Z ${s.z.toFixed(1)} m`, color: "#d8ecff", compact: true },
        { label: "ALTITUDE", value: `${altitude.toFixed(0)} m`, color: "#f5fbff" },
        { label: "VELOCIDADE", value: `${speedKmh.toFixed(0)} km/h`, color: "#9fd3ff" },
        { label: "POTÊNCIA / EMPUXO", value: `${power.toFixed(0)}%`, color: power > 0 ? "#ffb36b" : "#9aa8b8" },
        { label: "TEMPO DA MISSÃO", value: getMissionClockDisplay(), color: "#79f5cd" },
    ];

    ctx.save();
    ctx.fillStyle = "rgba(4, 11, 18, 0.88)";
    ctx.strokeStyle = "rgba(121, 245, 205, 0.45)";
    ctx.fillRect(x, y - 31, width, 23);
    ctx.strokeRect(x, y - 31, width, 23);
    ctx.fillStyle = "#b9d9ed";
    ctx.font = "600 12px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(getFlightPhaseSummary(), x + width / 2, y - 15);

    ctx.fillStyle = "rgba(4, 11, 18, 0.9)";
    ctx.strokeStyle = "rgba(157, 211, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = "#79f5cd";
    ctx.fillRect(x, y, width, 3);

    const vectorWidth = Math.min(286, width * 0.32);
    const columnWidth = (width - vectorWidth) / values.length;
    drawCompactThrustTelemetry(x + 10, y + 10, vectorWidth - 20, height - 20);

    values.forEach((item, index) => {
        const columnX = x + vectorWidth + index * columnWidth;

        {
            ctx.strokeStyle = "rgba(143, 185, 218, 0.3)";
            ctx.beginPath();
            ctx.moveTo(columnX, y + 13);
            ctx.lineTo(columnX, y + height - 12);
            ctx.stroke();
        }

        ctx.textAlign = "center";
        ctx.fillStyle = "#8fb9da";
        ctx.font = "600 11px Segoe UI";
        ctx.fillText(item.label, columnX + columnWidth / 2, y + 29);
        ctx.fillStyle = item.color;
        ctx.font = item.compact ? "700 14px Segoe UI" : "700 22px Segoe UI";
        ctx.fillText(item.value, columnX + columnWidth / 2, y + 60);

        if (index === 3) {
            const graphX = columnX + 18;
            const graphY = y + 78;
            const graphWidth = columnWidth - 36;
            const graphHeight = 19;
            const history = telemetry.slice(-72);

            ctx.fillStyle = "rgba(255, 179, 107, 0.1)";
            ctx.fillRect(graphX, graphY, graphWidth, graphHeight);
            ctx.strokeStyle = "rgba(255, 179, 107, 0.35)";
            ctx.strokeRect(graphX, graphY, graphWidth, graphHeight);
            ctx.strokeStyle = "#ffb36b";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            history.forEach((sample, sampleIndex) => {
                const sampleX = graphX + (sampleIndex / Math.max(1, history.length - 1)) * graphWidth;
                const sampleY = graphY + graphHeight - (clamp(sample.th, 0, 100) / 100) * graphHeight;
                if (sampleIndex === 0) {
                    ctx.moveTo(sampleX, sampleY);
                } else {
                    ctx.lineTo(sampleX, sampleY);
                }
            });
            ctx.stroke();
            ctx.lineWidth = 1;
        }
    });

    ctx.textAlign = "start";
    ctx.restore();
}

function worldToScreenY(worldZ) {
    return c.height * CAMERA_SHIP_SCREEN_Y - (worldZ - camera.z) * camera.zoom;
}

function getGroundY() {
    return worldToScreenY(0);
}

function drawGroundEnvironment(groundY, visualAltitude) {
    scene.drawGround(ctx, {
        groundY,
        width: c.width,
        height: c.height,
        worldAtScreenX: screenToWorldX,
        zoom: camera.zoom,
        time: simTime,
        // Ground/ocean visibility must follow the camera target.  Using the
        // primary S24 altitude made the surface transparent whenever S24 was
        // in scaled space, even while the selected B7 was near the tower.
        opacity: terra.getLocalTerrainOpacity(visualAltitude),
    });
}

function getFlightControlBuildingScreenRect(groundY) {
    return scene.getFlightControlBuildingScreenRect({ groundY, worldToScreenX, zoom: camera.zoom });
}

function isFlightControlBuildingHit(screenX, screenY, groundY = getGroundY()) {
    return scene.isFlightControlBuildingHit(screenX, screenY, { groundY, worldToScreenX, zoom: camera.zoom });
}

function drawFlightControlBuilding(groundY) {
    scene.drawFlightControlBuilding(ctx, {
        groundY,
        width: c.width,
        height: c.height,
        canvasWidth: c.width,
        canvasHeight: c.height,
        worldToScreenX,
        zoom: camera.zoom,
        linked: isLinkedMode(),
        targetScreenX: worldToScreenX(s.x),
        targetScreenY: worldToScreenY(s.z),
    });
}

function drawLaunchPad(groundY) {
    scene.drawLaunchPad(ctx, {
        groundY,
        width: c.width,
        height: c.height,
        worldToScreenX,
        zoom: camera.zoom,
        launchX: getLaunchPositionX(),
    });
}

function worldToScreenX(worldX) {
    return c.width * CAMERA_SHIP_SCREEN_X + (worldX - camera.x) * camera.zoom;
}

function screenToWorldX(screenX) {
    return camera.x + (screenX - c.width * CAMERA_SHIP_SCREEN_X) / camera.zoom;
}

function drawSn15TankDiagram(propulsion, propellant, vehicleLabel) {
    const ctx = sn15TankDiagram.getContext("2d");
    const { width, height } = sn15TankDiagram;
    const tanks = propellant ?? propulsion.tanks;
    const entries = [
        { label: "LOX principal", amount: tanks.main.loxKg, capacity: propulsion.tanks.main.loxKg, color: "#71cfff", y: 48 },
        { label: "LCH₄ principal", amount: tanks.main.lch4Kg, capacity: propulsion.tanks.main.lch4Kg, color: "#76e6a8", y: 99 },
        { label: "LOX cabeceira", amount: tanks.header.loxKg, capacity: propulsion.tanks.header.loxKg, color: "#398fc9", y: 150 },
        { label: "LCH₄ cabeceira", amount: tanks.header.lch4Kg, capacity: propulsion.tanks.header.lch4Kg, color: "#39a46a", y: 201 },
    ];
    const propellantMass = entries.reduce((total, tank) => total + tank.amount, 0);
    const dryMass = getSelectedShipMass();
    const centerOfMass = entries.reduce((sum, tank) => sum + tank.amount * (tank.y - height / 2), 0) /
        Math.max(1, dryMass + propellantMass);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#a9d9ef";
    ctx.font = "600 12px Segoe UI";
    ctx.fillText(`TANQUES ${vehicleLabel.toUpperCase()} — vista lateral`, 14, 20);
    entries.forEach((tank) => {
        const x = 150; const barWidth = 350; const barHeight = 26;
        const fraction = Math.max(0, Math.min(1, tank.amount / Math.max(1, tank.capacity)));
        ctx.fillStyle = "#122637";
        ctx.fillRect(x, tank.y - 16, barWidth, barHeight);
        ctx.fillStyle = tank.color;
        ctx.fillRect(x, tank.y - 16, barWidth * fraction, barHeight);
        ctx.strokeStyle = "#52758d";
        ctx.strokeRect(x, tank.y - 16, barWidth, barHeight);
        ctx.fillStyle = "#d9eff9";
        ctx.fillText(tank.label, 14, tank.y + 2);
        ctx.fillText(`${(tank.amount / 1000).toFixed(1)} t`, 510, tank.y + 2);
    });
    const cmY = height / 2 + centerOfMass;
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(132, cmY); ctx.lineTo(510, cmY); ctx.stroke();
    ctx.fillStyle = "#ffd166";
    ctx.fillText("CM", 104, cmY + 4);
}

function drawSeparatedInstanceHud() {
    const booster = detachedBoosterFlight;
    if (!booster?.state) return;
    const cards = [
        { label: "B7 · SUPER HEAVY", state: booster.state, color: "#ffd166" },
        { label: "S24 · STARSHIP", state: s, color: "#8fe8ff" },
    ];
    const width = Math.min(220, (c.width - 32) / 2);
    const height = 90;
    const gap = 8;
    const totalWidth = width * 2 + gap;
    const x = Math.max(12, (c.width - totalWidth) / 2);
    const y = c.height - (telemetryHudStyle === "spacex" ? 235 : 230);
    ctx.save();
    cards.forEach((card, index) => {
        const cardX = x + index * (width + gap);
        const state = card.state;
        const speed = Math.hypot(state.vx ?? 0, state.vz ?? 0) * 3.6;
        const power = state.engineOn ? (state.throttle ?? 0) * 100 : 0;
        ctx.fillStyle = "rgba(3, 12, 20, .9)";
        ctx.strokeStyle = card.color;
        ctx.lineWidth = 1.2;
        ctx.fillRect(cardX, y, width, height);
        ctx.strokeRect(cardX, y, width, height);
        ctx.fillStyle = card.color;
        ctx.fillRect(cardX, y, width, 3);
        ctx.font = "700 10px system-ui";
        ctx.fillText(card.label, cardX + 8, y + 17);
        ctx.fillStyle = "#eaf7ff";
        ctx.font = "600 10px ui-monospace, monospace";
        ctx.fillText(`ALT ${Math.max(0, state.z ?? 0).toFixed(0)} m`, cardX + 8, y + 34);
        ctx.fillText(`VEL ${speed.toFixed(0)} km/h`, cardX + 8, y + 49);
        ctx.fillText(`VX ${((state.vx ?? 0) * 3.6).toFixed(0)} · VZ ${((state.vz ?? 0) * 3.6).toFixed(0)} km/h`, cardX + 8, y + 64);
        if (state.waterImpact) {
            ctx.fillStyle = "#ffd166";
            ctx.fillText(`TOQUE VX ${(state.waterImpact.vx * 3.6).toFixed(0)} · VZ ${(state.waterImpact.vz * 3.6).toFixed(0)} km/h`, cardX + 8, y + 79);
            ctx.fillStyle = "#eaf7ff";
        }
        ctx.textAlign = "right";
        ctx.fillText(`PWR ${power.toFixed(0)}%`, cardX + width - 8, y + 34);
        ctx.fillText((state.mode ?? "ATIVO").slice(0, 22), cardX + width - 8, y + 56);
        ctx.textAlign = "start";
    });
    ctx.restore();
}

function draw() {
    updateCamera();
    updateLaunchCountdownButton();
    updatePhysicsMassReadout();
    // The environment belongs to the camera target, not to the primary S24
    // state.  After separation the two vehicles may differ by hundreds of
    // kilometres; using `s.z` here kept deep space visible while following a
    // low-altitude B7.
    const followedState = getFollowedInstanceState();
    const visualAltitude = Math.max(0, Number.isFinite(followedState?.z) ? followedState.z : camera.z);
    scene.drawSky(ctx, { width: c.width, height: c.height, worldX: camera.x, simTime, altitude: visualAltitude });
    sceneClockLabel.textContent = scene.getLocalTimeLabel(camera.x, simTime);
    const groundY = getGroundY();
    const gx = worldToScreenX(s.x);
    const gy = worldToScreenY(s.z);

    terra.draw(ctx, { width: c.width, height: c.height, altitude: visualAltitude, time: simTime });
    drawGroundEnvironment(groundY, visualAltitude);
    if (!terraMapModal.hidden) {
        terraMapView.setState(getTerraMapState());
    }
    drawFlightControlBuilding(groundY);
    drawTowerStructure(groundY);
    drawLinkedRadioCommunication(groundY);
    drawLaunchPad(groundY);
    drawTowerApproachPoint();
    drawLandingTarget(groundY);
    drawProjectedImpact(groundY);
    drawHotStageRing();
    drawDetachedBoosterVehicle();
    drawProbeDockingTarget();
    drawVehicle(gx, gy);
    drawRcsPlumes(gx, gy);
    drawProbeDockingGuidance();
    drawTowerArms(groundY);
    drawCollisionMarkers();

    // Em modo mobile, mostra apenas o HUD compacto (SpaceX style é ideal para celular)
    const isMobileViewport = window.matchMedia("(max-width: 720px)").matches;
    if (!isMobileViewport) {
        const graphX = c.width - 360;
        graph(graphX, 30, 340, 55, "ang", {
            floor: 0,
            ceiling: 180,
            minSpan: 12,
            defaultMin: 0,
            defaultMax: 180,
            color: "#0af",
            title: "Ângulo",
        });
        graph(graphX, 105, 340, 55, "th", {
            floor: 0,
            ceiling: 100,
            minSpan: 8,
            defaultMin: 0,
            defaultMax: 100,
            color: "#ff9e4a",
            title: "Potência do motor",
        });
        graph(graphX, 180, 340, 55, "vz", {
            minSpan: 12,
            defaultMin: -20,
            defaultMax: 20,
            color: "#f0f",
            title: "Velocidade vertical",
        });
        graph(graphX, 255, 340, 55, "alt", {
            floor: 0,
            minSpan: 50,
            defaultMin: 0,
            defaultMax: 100,
            color: "#ff0",
            title: "Altitude",
        });
        // The local flight plot lives below the right-side telemetry graphs.
        drawLocalTrajectoryChart(graphX, 390, 340, 120);
        drawLandingResult(graphX, 525, 340);
        drawSeparatedInstanceHud();
    }
    // HUD SpaceX é compacto e perfeito para mobile
    drawFlightTelemetryBar();
    updateActiveControllerIndicator();
    updateInstanceTracker();
    if (isProbeSelected()) updateProbeDockingStatusOutputs();
    updateSn15PropulsionPanel();
    updateSuperHeavyStackPanel();

    const primaryProfile = getSelectedShipProfile();
    const s24State = primaryProfile.id === "starship_ship24" ? s : stackMission.attachS24 ? s : null;
    const b7State = detachedBoosterFlight?.state ?? (primaryProfile.vehicleClass === "superheavy_booster" ? s : null);

    info.innerHTML = [
        `Controlador de voo: ${flightControlState.controllerId}`,
        `Modo operacional: ${getRecoveryModeLabel()}`,
        `Nave ativa: ${getSelectedShipLabel()} (${getSelectedShipProfile().callsign})`,
        formatInstanceHud("S24", s24State, s24State?.mode ?? ""),
        formatInstanceHud("B7", b7State, b7State?.mode ?? ""),
        `Rota ativa: ${getFlightControlRouteLabel()}`,
        `Enlace travado: ${flightController.isRouteLocked() ? "SIM" : "NAO"}`,
        detachedBoosterFlight
            ? `B7: ${detachedBoosterFlight.state.mode} | ${detachedBoosterFlight.towerLink?.status ?? "link inicializando"}`
            : "B7: sem estágio separado",
        `Modo: ${controlState.mode}`,
        `Status: ${s.msg}`,
        `Contato estrutura: ${s.contactState ?? "free"}`,
        `Falhas: ${getFailureStatusText()}`,
        `Plataforma: ${getSelectedPlatformLabel()}`,
        `Falhas plataforma: ${getTowerFailureStatusText()}`,
        `Motores manuais: ${manualEngineActive ? `${Math.round(manualThrottleSetting * 100)}%` : "OFF"}`,
        `Referência X: ${getGuidanceTargetX().toFixed(0)} m`,
        `Erro de referência: ${(nav.x - getGuidanceTargetX()).toFixed(1)} m`,
        `Impacto previsto: ${typeof controlState.projectedImpactX === "number" ? controlState.projectedImpactX.toFixed(1) : "--"} m`,
        `Janela plataforma Z: ${isLinkedMode() ? `${(sensors.platformLink.captureZ ?? getSelectedPlatformCaptureHeight()).toFixed(0)} m` : "--"}`,
        `Feedback plataforma: ${sensors.platformLink.status}`,
        `Erro plataforma X/Z: ${sensors.platformLink.xError.toFixed(1)} / ${sensors.platformLink.zError.toFixed(1)} m`,
        `Braços plataforma: ${(sensors.platformLink.armClosure * 100).toFixed(0)}%`,
        `Autorização plataforma: ${
            sensors.platformLink.shutdownAuthorized
                ? sensors.platformLink.authorizationSource === "false_authorization"
                    ? "falsa"
                    : "plataforma"
                : "nenhuma"
        }`,
        `Altitude est: ${nav.z.toFixed(1)} m`,
        `Radar alt: ${sensors.radar.altitude.toFixed(1)} m`,
        `VX est: ${nav.vx.toFixed(1)} m/s`,
        `VZ est: ${nav.vz.toFixed(1)} m/s`,
        `Ângulo est: ${(nav.a * 57.3).toFixed(1)} deg`,
        `Throttle: ${(s.throttle * 100).toFixed(0)}%`,
        `TVC: ${(s.gimbal * 57.3).toFixed(1)} deg`,
        ...(s.propellant
            ? [
                `Tanque ativo: ${s.propellant.activeTank === "header" ? "cabeceira" : "principal"}`,
                `LOX: ${((s.propellant.main.loxKg + s.propellant.header.loxKg) / 1000).toFixed(1)} t`,
                `LCH₄: ${((s.propellant.main.lch4Kg + s.propellant.header.lch4Kg) / 1000).toFixed(1)} t`,
                `Massa atual: ${(getVehicleMass() / 1000).toFixed(1)} t`,
            ]
            : []),
        `Flaps N/T: ${(s.noseFlap * 100).toFixed(0)} / ${(s.tailFlap * 100).toFixed(0)}%`,
        `RCS: ${(s.rcs * 100).toFixed(0)}%`,
        `Controle lateral ativo: ${getActiveLateralControlText()}`,
        `q estimada: ${nav.q.toFixed(0)} Pa`,
        `Tempo: ${simTime.toFixed(1)} s`,
        `Simulação: ${sim}x`,
    ].join("<br>");
}

    Object.assign(window, {
        worldToScreenY,
        getGroundY,
        drawGroundEnvironment,
        getFlightControlBuildingScreenRect,
        isFlightControlBuildingHit,
        drawFlightControlBuilding,
        drawLaunchPad,
        worldToScreenX,
        screenToWorldX,
        drawSn15TankDiagram,
        drawSeparatedInstanceHud,
        draw,
        getVehicleLayout,
        getVehicleLayoutFor,
        drawEnginePlume,
        drawSuperHeavyVehicle,
        drawDockedStarship,
        drawDetachedBoosterVehicle,
        drawProbeDockingTarget,
        drawProbeDockingGuidance,
        drawHotStageRing,
        drawVehicle,
        rotateVehicleVector,
        getRcsVisualPlumes,
        drawRcsPlumes,
        drawTowerStructure,
        drawLinkedRadioCommunication,
        getSuborbitalLaunchArmClosure,
        drawTowerArms,
        drawTowerApproachPoint,
        drawCollisionMarker,
        drawCollisionMarkers,
        drawLandingTarget,
        drawProjectedImpact,
        drawLandingResult,
        getFlightPhaseSummary,
        getEngineHudConfiguration,
        drawSuperHeavyRaptorLayout,
        drawStarshipEngineLayout,
        drawEngineConfigurationHud,
        drawVehicleEngineConfigurationHud,
        drawSpaceXTelemetryHudMobile,
        drawSpaceXTelemetryHud,
        drawFlightTelemetryBar,
    });
})();
