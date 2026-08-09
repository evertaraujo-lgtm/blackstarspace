(function () {
    /**
     * Owns flight-history storage and its timeline cursor.  Simulation code
     * supplies samples; rendering code reads the returned arrays without
     * needing to know how the cursor follows live data.
     */
    class TelemetryStore {
        constructor(timelineInput) {
            this.timelineInput = timelineInput;
            this.primary = [];
            this.booster = [];
            this.graphOffset = 0;
            this.followingLive = true;
        }

        reset({ includeBooster = false } = {}) {
            this.primary.length = 0;
            if (includeBooster) this.booster.length = 0;
            this.graphOffset = 0;
            this.followingLive = true;
            this.timelineInput.value = "0";
            this.timelineInput.max = "0";
        }

        resetBooster() {
            this.booster.length = 0;
        }

        setGraphOffset(offset) {
            this.graphOffset = Number(offset);
            this.followingLive = this.graphOffset >= Number(this.timelineInput.max);
        }

        recordPrimary(sample) {
            this.primary.push(sample);
            const latestOffset = Math.max(0, this.primary.length - 500);
            this.timelineInput.max = String(latestOffset);
            if (this.followingLive) {
                this.graphOffset = latestOffset;
                this.timelineInput.value = String(latestOffset);
            }
        }

        recordBooster(sample) {
            this.booster.push(sample);
        }

        toCsv() {
            const header = "instancia,tempo,modo,altitude_est,radar_alt,vx_est,vz_est,angulo_est,throttle,tvc_deg,nose_flap,tail_flap,rcs,dyn_pressure,lox_kg,lch4_kg,tanque_propulsante,platform_dx,platform_dz,platform_arm\\n";
            const primaryRows = this.primary.map((row) =>
                `S24,${row.t},${row.mode},${row.alt},${row.radar},${row.vx},${row.vz},${row.ang},${row.th},${row.tvc},${row.nose},${row.tail},${row.rcs},${row.q},${row.loxKg ?? ""},${row.lch4Kg ?? ""},${row.propellantTank ?? ""},${row.towerDx},${row.towerDz},${row.towerArm}`
            );
            const boosterRows = this.booster.map((row) =>
                `B7,${row.t},${row.mode},${row.alt},,${row.vx},${row.vz},${row.ang},${row.th},${row.tvc},${row.nose},${row.tail},${row.rcs},${row.q},${row.loxKg ?? ""},${row.lch4Kg ?? ""},principal,,,,`
            );
            return `${header}${[...primaryRows, ...boosterRows].join("\\n")}\\n`;
        }
    }

    function drawTelemetryGraph({ ctx, samples, graphOffset, x, y, width, height, key, config, clamp }) {
        const start = Math.max(0, Math.min(graphOffset, Math.max(0, samples.length - 1)));
        const end = Math.min(start + 500, samples.length);
        const values = samples
            .slice(start, end)
            .map((sample) => sample[key])
            .filter((value) => Number.isFinite(value));
        const range = getAdaptiveRange(values, config);
        const { min, max } = range;
        const { color, title } = config;

        ctx.fillStyle = "rgba(0, 0, 0, 0.88)";
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = "#888";
        ctx.strokeRect(x, y, width, height);
        for (let index = 0; index <= 5; index += 1) {
            const graphY = y + (index * height) / 5;
            ctx.strokeStyle = "#333";
            ctx.beginPath();
            ctx.moveTo(x, graphY);
            ctx.lineTo(x + width, graphY);
            ctx.stroke();
            ctx.fillStyle = "white";
            ctx.fillText((max - (index * (max - min)) / 5).toFixed(0), x - 35, graphY + 4);
        }
        ctx.fillStyle = "white";
        ctx.fillText(title, x, y - 4);
        ctx.beginPath();
        ctx.strokeStyle = color;
        for (let index = start; index < end; index += 1) {
            const graphX = x + ((index - start) / Math.max(1, 499)) * width;
            const value = clamp(samples[index][key], min, max);
            const graphY = y + height - ((value - min) / (max - min)) * height;
            if (index === start) ctx.moveTo(graphX, graphY);
            else ctx.lineTo(graphX, graphY);
        }
        ctx.stroke();
    }

    function graph(x, y, width, height, key, config) {
        drawTelemetryGraph({
            ctx,
            samples: telemetry,
            graphOffset,
            x,
            y,
            width,
            height,
            key,
            config,
            clamp,
        });
    }

    function getAdaptiveRange(values, config) {
        if (values.length === 0) return { min: config.defaultMin, max: config.defaultMax };
        const dataMin = Math.min(...values);
        const dataMax = Math.max(...values);
        const span = Math.max(config.minSpan, dataMax - dataMin);
        const padding = span * 0.12;
        let min = dataMin - padding;
        let max = dataMax + padding;
        if (config.floor !== undefined) min = Math.max(config.floor, min);
        if (config.ceiling !== undefined) max = Math.min(config.ceiling, max);
        if (max - min < config.minSpan) {
            const midpoint = (min + max) / 2;
            min = midpoint - config.minSpan / 2;
            max = midpoint + config.minSpan / 2;
            if (config.floor !== undefined && min < config.floor) { max += config.floor - min; min = config.floor; }
            if (config.ceiling !== undefined && max > config.ceiling) { min -= max - config.ceiling; max = config.ceiling; }
        }
        return { min, max };
    }

    function drawLocalTrajectoryChart(x, y, width, height) {
    const tracks = terraMapView?.getTrajectoryTracks?.().filter((track) => track.samples.length > 0) ?? [];
    if (tracks.length === 0) return;
    const samples = tracks.flatMap((track) => track.samples);
    const minX = Math.min(...samples.map((sample) => sample.x));
    const maxX = Math.max(...samples.map((sample) => sample.x));
    const minZ = Math.min(0, ...samples.map((sample) => sample.z));
    const maxZ = Math.max(80, ...samples.map((sample) => sample.z));
    const spanX = Math.max(120, maxX - minX);
    const spanZ = Math.max(120, maxZ - minZ);
    const left = x + 30; const right = x + width - 11;
    const top = y + 22; const bottom = y + height - 18;
    const point = (sample) => ({
        x: left + ((sample.x - minX) / spanX) * (right - left),
        y: bottom - ((sample.z - minZ) / spanZ) * (bottom - top),
    });

    ctx.save();
    ctx.fillStyle = "rgba(3, 14, 24, .9)";
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = "rgba(133, 200, 234, .56)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);
    ctx.strokeStyle = "rgba(151, 213, 243, .2)";
    ctx.beginPath(); ctx.moveTo(left, bottom); ctx.lineTo(right, bottom); ctx.moveTo(left, top); ctx.lineTo(left, bottom); ctx.stroke();
    ctx.fillStyle = "#c7ecff";
    ctx.font = "600 10px system-ui";
    ctx.fillText("TRAJETÓRIAS LOCAIS", x + 8, y + 14);
    ctx.fillStyle = "rgba(205, 233, 247, .66)";
    ctx.font = "9px system-ui";
    ctx.fillText(`Z ${Math.round(maxZ)} m`, left + 4, top + 9);
    tracks.forEach((track, index) => {
        ctx.strokeStyle = track.color;
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        track.samples.forEach((sample, sampleIndex) => {
            const p = point(sample);
            sampleIndex ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
        });
        ctx.stroke();
        const current = point(track.samples.at(-1));
        ctx.fillStyle = track.color;
        ctx.beginPath(); ctx.arc(current.x, current.y, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.fillText(track.label, x + width - 30, y + 14 + index * 12);
    });
    ctx.restore();
}

function drawArrow(x1, y1, x2, y2, color, lineWidth) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);

    if (length < 0.001) {
        return;
    }

    const ux = dx / length;
    const uy = dy / length;
    const headSize = Math.max(8, lineWidth * 2.6);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - ux * headSize - uy * headSize * 0.55, y2 - uy * headSize + ux * headSize * 0.55);
    ctx.lineTo(x2 - ux * headSize + uy * headSize * 0.55, y2 - uy * headSize - ux * headSize * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 1;
}

function describeVectorSense(value, negativeLabel, positiveLabel) {
    if (value > 0.12) {
        return positiveLabel;
    }

    if (value < -0.12) {
        return negativeLabel;
    }

    return "quase neutro";
}

function drawThrustTelemetry(x, y, w, h) {
    const thrustAngle = s.a + s.gimbal;
    const thrustMagnitude = s.engineOn ? getVehicleMaxThrust() * s.throttle : 0;
    const thrustRatio = thrustMagnitude > 0 ? s.throttle : 0;
    const thrustDirX = Math.sin(thrustAngle);
    const thrustDirZ = Math.cos(thrustAngle);
    const axisCenterX = x + 88;
    const axisCenterY = y + h / 2 + 8;
    const axisRadius = 54;
    const hasThrust = thrustMagnitude > 50000;
    const vectorLength = hasThrust ? 24 + thrustRatio * 40 : 28;
    const arrowX = axisCenterX + thrustDirX * vectorLength;
    const arrowY = axisCenterY - thrustDirZ * vectorLength;

    ctx.save();
    ctx.fillStyle = "rgba(7, 16, 25, 0.94)";
    ctx.strokeStyle = "#35506a";
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#f5fbff";
    ctx.font = "bold 15px Segoe UI";
    ctx.fillText("Vetor de Empuxo", x + 12, y + 22);

    ctx.font = "12px Segoe UI";
    ctx.fillStyle = "#8fb9da";
    ctx.fillText("Referencial do mundo", x + 12, y + 40);

    ctx.strokeStyle = "#2b4259";
    ctx.beginPath();
    ctx.moveTo(axisCenterX - axisRadius - 10, axisCenterY);
    ctx.lineTo(axisCenterX + axisRadius + 10, axisCenterY);
    ctx.moveTo(axisCenterX, axisCenterY - axisRadius - 10);
    ctx.lineTo(axisCenterX, axisCenterY + axisRadius + 10);
    ctx.stroke();

    ctx.strokeStyle = "#46637e";
    ctx.beginPath();
    ctx.arc(axisCenterX, axisCenterY, axisRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#8fb9da";
    ctx.fillText("+X", axisCenterX + axisRadius + 16, axisCenterY + 4);
    ctx.fillText("-X", axisCenterX - axisRadius - 28, axisCenterY + 4);
    ctx.fillText("+Z", axisCenterX - 10, axisCenterY - axisRadius - 16);
    ctx.fillText("-Z", axisCenterX - 10, axisCenterY + axisRadius + 22);

    ctx.fillStyle = "#d8ecff";
    ctx.beginPath();
    ctx.arc(axisCenterX, axisCenterY, 3, 0, Math.PI * 2);
    ctx.fill();

    if (hasThrust) {
        drawArrow(axisCenterX, axisCenterY, arrowX, arrowY, "#ff9e4a", 4);
    } else {
        ctx.strokeStyle = "rgba(255, 158, 74, 0.45)";
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(axisCenterX, axisCenterY);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    const textX = x + 172;
    const angleDeg = thrustAngle * 57.3;
    const lateralSense = describeVectorSense(thrustDirX, "esquerda", "direita");
    const verticalSense = describeVectorSense(thrustDirZ, "baixo", "cima");

    ctx.fillStyle = "#f5fbff";
    ctx.font = "13px Segoe UI";
    ctx.fillText(`Estado: ${hasThrust ? "ATIVO" : "SEM EMPUXO"}`, textX, y + 56);
    ctx.fillText(`Modulo: ${(thrustMagnitude / 1e6).toFixed(2)} MN`, textX, y + 78);
    ctx.fillText(`Direcao: ${angleDeg.toFixed(1)} deg`, textX, y + 100);
    ctx.fillText(`Sentido X: ${lateralSense}`, textX, y + 122);
    ctx.fillText(`Sentido Z: ${verticalSense}`, textX, y + 144);
    ctx.fillStyle = "#8fb9da";
    ctx.fillText(`TVC ${((s.gimbal * 57.3) >= 0 ? "+" : "") + (s.gimbal * 57.3).toFixed(1)} deg`, textX, y + 164);
    ctx.restore();
}

function drawCompactThrustTelemetry(x, y, w, h) {
    const thrustAngle = s.a + s.gimbal;
    const thrustRatio = s.engineOn ? s.throttle : 0;
    const thrustDirX = Math.sin(thrustAngle);
    const thrustDirZ = Math.cos(thrustAngle);
    const axisX = x + 49;
    const axisY = y + h / 2 + 5;
    const radius = 31;
    const vectorLength = 13 + thrustRatio * 25;
    const arrowX = axisX + thrustDirX * vectorLength;
    const arrowY = axisY - thrustDirZ * vectorLength;

    ctx.save();
    ctx.strokeStyle = "#3a5871";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(axisX - radius - 7, axisY);
    ctx.lineTo(axisX + radius + 7, axisY);
    ctx.moveTo(axisX, axisY - radius - 7);
    ctx.lineTo(axisX, axisY + radius + 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(axisX, axisY, radius, 0, Math.PI * 2);
    ctx.stroke();

    if (thrustRatio > 0) {
        drawArrow(axisX, axisY, arrowX, arrowY, "#ff9e4a", 3);
    } else {
        ctx.strokeStyle = "rgba(255, 158, 74, 0.4)";
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(axisX, axisY);
        ctx.lineTo(axisX, axisY - 20);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    const textX = x + 96;
    ctx.fillStyle = "#8fb9da";
    ctx.font = "600 10px Segoe UI";
    ctx.fillText("VETOR DE EMPUXO", textX, y + 25);
    ctx.fillStyle = "#f5fbff";
    ctx.font = "600 12px Segoe UI";
    ctx.fillText(`Direção: ${(thrustAngle * 57.3).toFixed(1)}°`, textX, y + 49);
    ctx.fillStyle = "#ffb36b";
    ctx.fillText(`TVC: ${(s.gimbal * 57.3).toFixed(1)}°`, textX, y + 70);
    ctx.restore();
}

    Object.assign(window, { drawLocalTrajectoryChart, drawArrow, describeVectorSense, drawThrustTelemetry, drawCompactThrustTelemetry });


    window.StarshipTelemetryStore = TelemetryStore;
    window.drawStarshipTelemetryGraph = drawTelemetryGraph;
    window.graph = graph;
})();
