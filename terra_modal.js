(function () {
    class TerraMapView {
        constructor({ canvas, input, applyButton, readout, onTarget }) {
            this.canvas = canvas;
            this.ctx = canvas.getContext("2d");
            this.input = input;
            this.readout = readout;
            this.onTarget = onTarget;
            this.state = null;
            this.trajectory = [];
            this.trajectories = new Map();
            this.predictions = new Map();
            this.zoom = 1;
            this.panX = 0;
            this.panY = 0;
            this.drag = null;
            this.earthImage = new Image();
            this.earthImage.addEventListener("load", () => this.draw());
            this.earthImage.src = "img/terra.png";
            applyButton.addEventListener("click", () => this.setTargetFromKilometres(Number(input.value)));
            canvas.addEventListener("wheel", (event) => {
                event.preventDefault();
                this.zoom = Math.max(0.7, Math.min(5, this.zoom * (event.deltaY < 0 ? 1.1 : 0.9)));
                this.draw();
            }, { passive: false });
            canvas.addEventListener("dblclick", () => { this.zoom = 1; this.draw(); });
            canvas.addEventListener("pointerdown", (event) => this.beginDrag(event));
            canvas.addEventListener("pointermove", (event) => this.dragEarth(event));
            canvas.addEventListener("pointerup", (event) => this.endDrag(event));
            canvas.addEventListener("pointercancel", () => { this.drag = null; canvas.style.cursor = "grab"; });
            canvas.style.cursor = "grab";
        }

        setState(state) {
            if (!state) return;
            this.state = state;
            this.recordState(state);
            this.input.value = Math.round(this.toOrbitalKilometres(state.targetX));
            const surface = state.targetSurface;
            const surfaceLabel = surface ? `${surface.name} · ${surface.kind === "ocean" ? "oceano" : "terra"}` : "superfície desconhecida";
            this.readout.textContent = `Nave: ${(this.toOrbitalKilometres(state.x)).toFixed(1)} km | altitude ${(Math.max(0, state.z) / 1000).toFixed(2)} km | alvo ${(this.toOrbitalKilometres(state.targetX)).toFixed(1)} km | ${surfaceLabel}`;
            this.draw();
        }

        recordState(state) {
            const tracks = Array.isArray(state?.tracks) && state.tracks.length > 0
                ? state.tracks
                : [{ id: state?.trackId ?? "active", x: state?.x, z: state?.z, color: "#ffd269" }];
            tracks.forEach((track) => {
                if (!Number.isFinite(track.x) || !Number.isFinite(track.z)) return;
                const id = track.id ?? "active";
                const previousTrack = this.trajectories.get(id) ?? [];
                const previous = previousTrack.at(-1);
                const time = Number.isFinite(track.t) ? track.t : Number.isFinite(state.simTime) ? state.simTime : 0;
                const isNewFlight = previous && time < previous.t;
                const intervalElapsed = !previous || time - previous.t >= 5;
                if (isNewFlight || intervalElapsed) {
                    const retained = isNewFlight
                        ? []
                        : previousTrack.filter((sample) => time - sample.t <= 7200);
                    this.trajectories.set(id, [
                        ...retained,
                        { x: track.x, z: track.z, t: time, color: track.color ?? "#ffd269", label: track.label ?? id },
                    ]);
                }
            });
            this.trajectory = this.trajectories.get(state?.trackId ?? "active") ?? [];
        }

        setTarget(value) {
            if (!Number.isFinite(value)) return;
            const halfCircumference = window.EARTH_CIRCUMFERENCE_METERS / 2;
            this.onTarget(Math.max(-halfCircumference, Math.min(halfCircumference, Math.round(value))));
        }

        setPrediction(samples, id = "prediction", color = "#8ff3ff") {
            this.predictions.set(id, {
                color,
                samples: Array.isArray(samples) ? samples : [],
            });
            this.draw();
        }

        clearPrediction(id) {
            if (this.predictions.delete(id)) this.draw();
        }

        clearTrajectory(id) {
            if (this.trajectories.delete(id)) {
                this.trajectory = this.trajectories.get(this.state?.trackId ?? "active") ?? [];
                this.draw();
            }
        }

        getTrajectoryTracks() {
            return [...this.trajectories.entries()].map(([id, samples]) => ({
                id,
                label: samples.at(-1)?.label ?? id,
                color: samples.at(-1)?.color ?? "#ffd269",
                samples: samples.map((sample) => ({ x: sample.x, z: sample.z })),
            }));
        }

        setTargetFromKilometres(value) {
            if (!Number.isFinite(value)) return;
            const circumference = window.EARTH_CIRCUMFERENCE_METERS;
            const orbitalMetres = Math.max(0, Math.min(circumference, value * 1000));
            // Keep the simulation's local coordinate centered around zero;
            // the map itself remains a 0..one-circumference orbital axis.
            this.setTarget(orbitalMetres > circumference / 2 ? orbitalMetres - circumference : orbitalMetres);
        }

        toOrbitalKilometres(worldMetres) {
            const circumference = window.EARTH_CIRCUMFERENCE_METERS;
            return ((worldMetres % circumference) + circumference) % circumference / 1000;
        }

        pickTarget(event) {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = rect.width / this.canvas.width;
            const scaleY = rect.height / this.canvas.height;
            const centerX = rect.left + rect.width / 2 + this.panX * scaleX;
            const centerY = rect.top + rect.height * 0.54 + this.panY * scaleY;
            const polarAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
            const relativeAngle = ((polarAngle + Math.PI * 1.5) % (Math.PI * 2)) - Math.PI;
            const distance = -(relativeAngle / Math.PI) * this.getScale();
            this.setTarget(distance);
        }

        beginDrag(event) {
            const rect = this.canvas.getBoundingClientRect();
            this.drag = { x: event.clientX, y: event.clientY, panX: this.panX, panY: this.panY, moved: false, scaleX: this.canvas.width / rect.width, scaleY: this.canvas.height / rect.height };
            this.canvas.setPointerCapture(event.pointerId);
            this.canvas.style.cursor = "grabbing";
        }

        dragEarth(event) {
            if (!this.drag) return;
            const dx = (event.clientX - this.drag.x) * this.drag.scaleX;
            const dy = (event.clientY - this.drag.y) * this.drag.scaleY;
            this.drag.moved ||= Math.hypot(dx, dy) > 4;
            this.panX = this.drag.panX + dx;
            this.panY = this.drag.panY + dy;
            this.draw();
        }

        endDrag(event) {
            if (!this.drag) return;
            const moved = this.drag.moved;
            this.drag = null;
            this.canvas.releasePointerCapture?.(event.pointerId);
            this.canvas.style.cursor = "grab";
            if (!moved) this.pickTarget(event);
        }

        getScale() {
            // One full rim is one Earth circumference.  This preserves a
            // stable geographic reference instead of rescaling the planet to
            // whichever target happened to be selected last.
            return window.EARTH_CIRCUMFERENCE_METERS / 2;
        }

        draw() {
            const { canvas, ctx } = this;
            const width = canvas.width; const height = canvas.height; const cx = width * 0.5 + this.panX; const cy = height * 0.54 + this.panY; const textureRadius = Math.min(width, height) * 0.43 * this.zoom; const radius = textureRadius * 0.91;
            ctx.clearRect(0, 0, width, height);
            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, textureRadius, 0, Math.PI * 2); ctx.clip();
            if (this.earthImage.complete && this.earthImage.naturalWidth) {
                // The asset is a north-polar projection.  Its North American
                // sector is rotated to the top, where X=0 marks Starbase.
                ctx.save(); ctx.translate(cx, cy); ctx.rotate(77 * Math.PI / 180);
                ctx.drawImage(this.earthImage, -textureRadius, -textureRadius, textureRadius * 2, textureRadius * 2);
                ctx.restore();
            } else {
                const ocean = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.35, 5, cx, cy, radius);
                ocean.addColorStop(0, "#83d5ff"); ocean.addColorStop(0.36, "#287ec8"); ocean.addColorStop(1, "#0d347d");
                ctx.fillStyle = ocean; ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
            }
            ctx.restore();
            ctx.strokeStyle = "#9bdcff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
            // Earth rotates counterclockwise when viewed from above the North Pole.
            const rotationRadius = radius + 46; const rotationEnd = -Math.PI * 0.57;
            ctx.strokeStyle = "rgba(255, 104, 104, 0.94)"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(cx, cy, rotationRadius, -0.05, rotationEnd, true); ctx.stroke();
            const arrowX = cx + Math.cos(rotationEnd) * rotationRadius; const arrowY = cy + Math.sin(rotationEnd) * rotationRadius;
            const tangentX = Math.sin(rotationEnd); const tangentY = -Math.cos(rotationEnd);
            ctx.fillStyle = "#ff8585"; ctx.beginPath(); ctx.moveTo(arrowX, arrowY); ctx.lineTo(arrowX - tangentX * 11 - tangentY * 5, arrowY - tangentY * 11 + tangentX * 5); ctx.lineTo(arrowX - tangentX * 11 + tangentY * 5, arrowY - tangentY * 11 - tangentX * 5); ctx.closePath(); ctx.fill();
            ctx.font = "11px Segoe UI"; ctx.fillText("ROTAÇÃO", arrowX + 8, arrowY - 6);
            // The supplied texture looks down over the North Pole, so the
            // equator is the planet's rim.  Horizontal X selects longitude
            // around that rim; altitude extends outward from the surface.
            const scale = this.getScale();
            const equatorPoint = (x, offset = 0) => {
                const angle = -Math.PI / 2 - Math.max(-1, Math.min(1, x / scale)) * Math.PI;
                const surfaceRadius = radius + offset;
                return { x: cx + Math.cos(angle) * surfaceRadius, y: cy + Math.sin(angle) * surfaceRadius };
            };
            const point = (x, z) => {
                return equatorPoint(x, (z / Math.max(scale, 120000)) * radius);
            };
            this.trajectories.forEach((trajectory) => {
                if (trajectory.length <= 1) return;
                ctx.strokeStyle = trajectory.at(-1).color ?? "#ffd269";
                ctx.lineWidth = 1;
                ctx.beginPath();
                trajectory.forEach((sample, index) => {
                    // Same polar x/z samples and projection used by the
                    // probe's orbital prediction; no screen-space scaling.
                    const p = point(sample.x, sample.z);
                    index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
                });
                ctx.stroke();
            });
            this.predictions.forEach((prediction) => {
                if (prediction.samples.length <= 1) return;
                ctx.save();
                ctx.strokeStyle = prediction.color;
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                prediction.samples.forEach((sample, index) => {
                    const p = point(sample.x, sample.z);
                    index ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y);
                });
                ctx.stroke();
                ctx.restore();
            });
            const launch = equatorPoint(0); ctx.fillStyle = "#7ff4c9"; ctx.beginPath(); ctx.moveTo(launch.x, launch.y - 7); ctx.lineTo(launch.x - 6, launch.y + 5); ctx.lineTo(launch.x + 6, launch.y + 5); ctx.closePath(); ctx.fill(); ctx.fillStyle = "#c8fff0"; ctx.font = "12px Segoe UI"; ctx.fillText("STARBASE", launch.x + 9, launch.y - 8);
            if (this.state) {
                const target = equatorPoint(this.state.targetX); ctx.strokeStyle = "#ffe08a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(target.x, target.y, 8, 0, Math.PI * 2); ctx.moveTo(target.x - 13, target.y); ctx.lineTo(target.x + 13, target.y); ctx.moveTo(target.x, target.y - 13); ctx.lineTo(target.x, target.y + 13); ctx.stroke(); ctx.fillStyle = "#ffe08a"; ctx.fillText("ALVO", target.x + 11, target.y - 11);
                (this.state.specialTargets ?? []).forEach((specialTarget) => {
                    const marker = equatorPoint(specialTarget.x);
                    ctx.strokeStyle = specialTarget.color ?? "#ff9d66";
                    ctx.fillStyle = specialTarget.color ?? "#ff9d66";
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.arc(marker.x, marker.y, 6, 0, Math.PI * 2); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(marker.x, marker.y - 12); ctx.lineTo(marker.x - 5, marker.y - 3); ctx.lineTo(marker.x + 5, marker.y - 3); ctx.closePath(); ctx.fill();
                    ctx.font = "11px Segoe UI"; ctx.fillText(specialTarget.label ?? "ALVO", marker.x + 9, marker.y + 16);
                });
                const ship = point(this.state.x, this.state.z); ctx.fillStyle = "#ff8b5c"; ctx.beginPath(); ctx.arc(ship.x, ship.y, 5, 0, Math.PI * 2); ctx.fill();
                // A 100 m separation is intentionally too small to distort
                // an Earth-scale map. Show the second live instance as a
                // labelled marker so its presence remains explicit instead
                // of being hidden beneath the primary probe marker.
                (this.state.tracks ?? [])
                    .filter((track) => track.id && track.id !== this.state.trackId)
                    .forEach((track) => {
                        if (!Number.isFinite(track.x) || !Number.isFinite(track.z)) return;
                        const marker = point(track.x, track.z);
                        const altitudeDelta = Number.isFinite(this.state.z)
                            ? ` ${track.z >= this.state.z ? "+" : ""}${Math.round(track.z - this.state.z)} m`
                            : "";
                        ctx.save();
                        ctx.strokeStyle = track.color ?? "#ffd166";
                        ctx.fillStyle = track.color ?? "#ffd166";
                        ctx.lineWidth = 1.8;
                        ctx.beginPath(); ctx.rect(marker.x - 5, marker.y - 5, 10, 10); ctx.stroke();
                        ctx.font = "600 10px Segoe UI";
                        ctx.fillText(`${track.label ?? track.id}${altitudeDelta}`, marker.x + 9, marker.y + 16);
                        ctx.restore();
                    });
            }
        }
    }

    window.TerraMapView = TerraMapView;
})();
