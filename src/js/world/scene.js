(function () {
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function wrapAngle(angle) {
        return Math.atan2(Math.sin(angle), Math.cos(angle));
    }

    const EARTH_CIRCUMFERENCE_METERS = 40075017;

    function wrapLongitude(longitude) {
        return ((longitude + 180) % 360 + 360) % 360 - 180;
    }

    // Scene owns scenario-only geometry, visuals and environmental forces.
    // It has no reference to the ship, tower or flight-controller state: all
    // inputs are explicit values and all physics results are returned as data.
    class Scene {
        constructor(config = {}) {
            this.earthCircumference = config.earthCircumference ?? EARTH_CIRCUMFERENCE_METERS;
            // Starbase, Texas: 25.997° N, 97.156° W.  The map is equatorial
            // for navigation purposes, while this longitude anchors its rim.
            this.starbaseLongitude = config.starbaseLongitude ?? -97.1566;
            this.initialStarbaseHours = 18.5;
            this.flightControlBuilding = {
                x: -200,
                width: 24,
                height: 18,
                ...(config.flightControlBuilding ?? {}),
            };
            this.launchPadHeight = config.launchPadHeight ?? 8;
            this.linkDeployment = 0;
            this.lastBuildingVisualTime = null;
            this.dishAngle = -Math.PI / 2;
            this.radioAngle = -Math.PI / 2;
            this.towerRadioAngle = Math.PI;
            this.radioLinkStartedAt = null;
            this.radioLinkWasActive = false;
            this.controlAntennaImage = new Image();
            this.controlAntennaImage.addEventListener("load", () => this.prepareControlAntennaImage());
            this.controlAntennaImage.src = "assets/images/antena.png";
        }

        longitudeAt(worldX) {
            return wrapLongitude(this.starbaseLongitude + worldX / this.earthCircumference * 360);
        }

        worldDistanceToLongitude(worldX, longitude) {
            return wrapLongitude(this.longitudeAt(worldX) - longitude);
        }

        setInitialStarbaseTime(time) {
            const [hours, minutes] = String(time).split(":").map(Number);
            if (Number.isFinite(hours) && Number.isFinite(minutes)) {
                this.initialStarbaseHours = clamp(hours, 0, 23) + clamp(minutes, 0, 59) / 60;
            }
        }

        getLocalSolarHours(worldX, simTime) {
            // The chosen clock is local to Starbase. Every other location is
            // offset from it by longitude, which keeps map navigation and the
            // visual solar time in the same geographic reference.
            const longitudeOffsetHours = wrapLongitude(this.longitudeAt(worldX) - this.starbaseLongitude) / 15;
            return ((this.initialStarbaseHours + simTime / 3600 + longitudeOffsetHours) % 24 + 24) % 24;
        }

        getLocalTimeLabel(worldX, simTime) {
            const hours = this.getLocalSolarHours(worldX, simTime);
            const wholeHours = Math.floor(hours);
            const minutes = Math.floor((hours - wholeHours) * 60);
            return `${String(wholeHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
        }

        prepareControlAntennaImage() {
            const source = this.controlAntennaImage;
            const sprite = document.createElement("canvas");
            sprite.width = source.naturalWidth;
            sprite.height = source.naturalHeight;
            const spriteContext = sprite.getContext("2d");
            spriteContext.drawImage(source, 0, 0);
            const pixels = spriteContext.getImageData(0, 0, sprite.width, sprite.height);
            for (let index = 0; index < pixels.data.length; index += 4) {
                const r = pixels.data[index];
                const g = pixels.data[index + 1];
                const b = pixels.data[index + 2];
                // The supplied file has a light neutral checkerboard baked
                // into it. Remove only those nearly-white neutral pixels.
                if (r > 218 && g > 218 && b > 218 && Math.max(r, g, b) - Math.min(r, g, b) < 8) {
                    pixels.data[index + 3] = 0;
                }
            }
            spriteContext.putImageData(pixels, 0, 0);
            this.controlAntennaSprite = sprite;
        }

        drawSky(ctx, { width, height, worldX, simTime = 0, altitude = 0 }) {
            const localHours = this.getLocalSolarHours(worldX, simTime);
            const sunAltitude = Math.sin((localHours - 6) * Math.PI / 12);
            const daylight = clamp((sunAltitude + 0.16) / 0.44, 0, 1);
            const dusk = clamp(1 - Math.abs(sunAltitude) * 5.5, 0, 1) * daylight;
            // Atmospheric density fades continuously through the stratosphere.
            // This darkens the blue well before space visuals take over.
            const atmosphereThinness = clamp((altitude - 18000) / 6000, 0, 1);
            const horizonY = height * 0.72;
            const daytimeTop = [6 + daylight * 29 + dusk * 20, 14 + daylight * 76 + dusk * 15, 30 + daylight * 122 + dusk * 5];
            const daytimeHorizon = [13 + daylight * 105 + dusk * 112, 25 + daylight * 133 + dusk * 45, 50 + daylight * 149];
            const top = daytimeTop.map((value, index) => Math.round(value * (1 - atmosphereThinness) + [3, 8, 22][index] * atmosphereThinness));
            const horizon = daytimeHorizon.map((value, index) => Math.round(value * (1 - atmosphereThinness) + [5, 13, 37][index] * atmosphereThinness));
            const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
            sky.addColorStop(0, `rgb(${top.join(",")})`);
            sky.addColorStop(0.68, `rgb(${top.map((value, index) => Math.round((value + horizon[index]) / 2)).join(",")})`);
            sky.addColorStop(1, `rgb(${horizon.join(",")})`);
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, width, height);

            const starsAlpha = Math.max((1 - daylight) * 0.86, atmosphereThinness * 0.68);
            if (starsAlpha > 0.015) {
                ctx.fillStyle = `rgba(235,246,255,${starsAlpha})`;
                for (let index = 0; index < 110; index += 1) {
                    const x = (((Math.sin(index * 78.233) * 43758.5453) % 1) + 1) % 1 * width;
                    const y = (((Math.sin((index + 19) * 31.719) * 24634.6345) % 1) + 1) % 1 * horizonY;
                    ctx.beginPath();
                    ctx.arc(x, y, index % 13 === 0 ? 1.25 : 0.65, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (sunAltitude > -0.14) {
                const sunX = width * (0.5 + clamp((localHours - 12) / 12, -0.43, 0.43));
                const sunY = horizonY - sunAltitude * height * 0.52;
                const glow = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 95);
                glow.addColorStop(0, "rgba(255,249,203,.98)");
                glow.addColorStop(0.12, "rgba(255,210,121,.54)");
                glow.addColorStop(1, "rgba(255,174,93,0)");
                ctx.fillStyle = glow;
                ctx.fillRect(sunX - 95, sunY - 95, 190, 190);
                ctx.fillStyle = "#fff6ca";
                ctx.beginPath(); ctx.arc(sunX, sunY, 8, 0, Math.PI * 2); ctx.fill();
            }

            const spaceBlend = clamp((altitude - 70000) / 50000, 0, 1);
            if (spaceBlend > 0) {
                ctx.fillStyle = `rgba(2,6,15,${spaceBlend})`;
                ctx.fillRect(0, 0, width, height);
            }
        }

        getSurfaceProfile(worldX) {
            const longitude = this.longitudeAt(worldX);
            const fromStarbase = this.worldDistanceToLongitude(worldX, this.starbaseLongitude) / 360 * this.earthCircumference;

            // Licença poética local: a plataforma fica em terreno firme e o
            // Golfo começa 500 m a leste.  Entre ambos há restinga e praia.
            if (Math.abs(fromStarbase) < 160000) {
                return fromStarbase >= 500
                    ? { kind: "ocean", name: "Golfo do México", longitude }
                    : fromStarbase >= 220
                        ? { kind: "beach", name: "Praia de Boca Chica", longitude, mountains: 0 }
                        : { kind: "coast", name: "Costa do Texas", longitude, mountains: 0.06 };
            }

            const regions = [
                [-130, -78, "land", "América do Norte", 0.24],
                [-78, -34, "land", "América do Sul", 0.5],
                [-17, 42, "land", "África", 0.3],
                [42, 100, "ocean", "Oceano Índico", 0],
                [100, 145, "land", "Sudeste Asiático", 0.55],
            ];
            const region = regions.find(([start, end]) => longitude >= start && longitude <= end);
            if (region) {
                const [, , kind, name, mountains] = region;
                return { kind, name, longitude, mountains };
            }
            return { kind: "ocean", name: "Oceano Pacífico", longitude, mountains: 0 };
        }

        isWaterAt(worldX) {
            return this.getSurfaceProfile(worldX).kind === "ocean";
        }

        getSurfaceHeight(worldX, profile = this.getSurfaceProfile(worldX)) {
            const fromStarbase = this.worldDistanceToLongitude(worldX, this.starbaseLongitude) / 360 * this.earthCircumference;
            if (profile.kind === "ocean") return 0;
            if (profile.kind === "beach") return Math.max(0.2, (500 - fromStarbase) * 0.022);

            // A low-frequency combination gives local land a smooth, rolling
            // profile.  Mountain regions add broad highlands without turning
            // the physical Z=0 landing plane into an obstacle course.
            const rolling = 7 + Math.sin(worldX * 0.009) * 2.6 + Math.sin(worldX * 0.0021 + 1.8) * 3.8;
            const localCoast = Math.abs(fromStarbase) < 160000;
            if (localCoast) return Math.max(1.5, rolling + Math.max(0, 220 - fromStarbase) * 0.026);
            const mountainRise = (profile.mountains ?? 0) * (50 + 80 * Math.abs(Math.sin(worldX * 0.000023)));
            return Math.max(2, rolling + mountainRise);
        }

        drawGround(ctx, { groundY, width, height, worldAtScreenX, zoom = 1, time = 0, opacity = 1 }) {
            const sampleStep = 6;
            const samples = [];
            for (let screenX = -sampleStep; screenX <= width + sampleStep; screenX += sampleStep) {
                const worldX = worldAtScreenX(screenX);
                const profile = this.getSurfaceProfile(worldX);
                samples.push({ screenX, profile, surfaceY: groundY - this.getSurfaceHeight(worldX, profile) * zoom });
            }

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            // The surface remains at Z=0 for physics; only the distant
            // relief rises above it visually.
            ctx.rect(0, Math.max(0, groundY - 180), width, Math.min(height, height - groundY + 180));
            ctx.clip();

            const water = ctx.createLinearGradient(0, groundY, 0, height);
            water.addColorStop(0, "#2a82b7");
            water.addColorStop(0.38, "#145984");
            water.addColorStop(1, "#082a51");
            ctx.fillStyle = water;
            ctx.fillRect(0, groundY, width, height - groundY);

            // Moving highlights make water read as a sea rather than a blue
            // rectangle. Land is painted afterwards, naturally masking them.
            ctx.strokeStyle = "rgba(166, 231, 244, 0.30)";
            ctx.lineWidth = 1;
            for (let y = groundY + 14; y < height; y += 19) {
                for (let x = -30; x < width + 30; x += 48) {
                    const wave = Math.sin(time * 1.3 + x * 0.035 + y * 0.02) * 3;
                    ctx.beginPath();
                    ctx.moveTo(x, y + wave);
                    ctx.quadraticCurveTo(x + 12, y - 3 + wave, x + 25, y + wave);
                    ctx.stroke();
                }
            }

            for (const sample of samples) {
                const { screenX, profile, surfaceY } = sample;
                if (profile.kind === "ocean") continue;
                ctx.fillStyle = profile.kind === "beach"
                    ? "#d7c68a"
                    : profile.kind === "coast" ? "#55784f" : "#4b6d4a";
                ctx.fillRect(screenX, surfaceY, sampleStep + 1, height - surfaceY);
            }

            // Coastlines are never vertical cuts. The beach itself is a
            // triangular landform descending into the ocean; water begins on
            // the other side of its diagonal, not at a rectangular edge.
            const beachSlope = "#d7c68a";
            for (let index = 0; index < samples.length - 1; index += 1) {
                const current = samples[index];
                const next = samples[index + 1];
                const currentWater = current.profile.kind === "ocean";
                const nextWater = next.profile.kind === "ocean";
                if (currentWater === nextWater) continue;

                const shoreX = (current.screenX + next.screenX) / 2;
                const waterToRight = nextWater;
                const diagonalEndX = clamp(shoreX + (waterToRight ? 1 : -1) * 520, 0, width);
                ctx.fillStyle = beachSlope;
                ctx.beginPath();
                ctx.moveTo(shoreX, groundY);
                ctx.lineTo(diagonalEndX, height);
                ctx.lineTo(shoreX, height);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = "rgba(244, 230, 175, 0.82)";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(shoreX, groundY);
                ctx.lineTo(diagonalEndX, height);
                ctx.stroke();
            }

            // Z=0 is the physical contact plane used by the landing model.
            // Keep it darker than the terrain so visual relief never hides
            // the exact level where the vehicle will touch down.
            ctx.strokeStyle = "#1f3528";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(width, groundY);
            ctx.stroke();

            ctx.restore();
        }

        getFlightControlBuildingScreenRect({ groundY, worldToScreenX, zoom }) {
            const width = this.flightControlBuilding.width * zoom;
            const height = this.flightControlBuilding.height * zoom;
            return {
                x: worldToScreenX(this.flightControlBuilding.x) - width / 2,
                y: groundY - height,
                width,
                height,
            };
        }

        isFlightControlBuildingHit(screenX, screenY, scene) {
            const building = this.getFlightControlBuildingScreenRect(scene);
            return screenX >= building.x && screenX <= building.x + building.width && screenY >= building.y - 34 && screenY <= scene.groundY;
        }

        drawFlightControlBuilding(ctx, scene) {
            const { width: canvasWidth, height: canvasHeight } = scene;
            const building = this.getFlightControlBuildingScreenRect(scene);
            const { x, y, width, height } = building;
            if (x > canvasWidth + 40 || x + width < -40 || y > canvasHeight + 40) return;

            const now = performance.now() / 1000;
            const elapsed = Math.min(0.08, Math.max(0, now - (this.lastBuildingVisualTime ?? now)));
            this.lastBuildingVisualTime = now;
            const desiredDeployment = scene.linked ? 1 : 0;
            this.linkDeployment += (desiredDeployment - this.linkDeployment) * Math.min(1, elapsed * 2.8);

            ctx.save();
            ctx.fillStyle = "#263b4d";
            ctx.fillRect(x - 3, y + height - 5, width + 6, 5);
            ctx.fillStyle = "#34546a";
            ctx.fillRect(x, y, width, height - 4);
            ctx.strokeStyle = "#8bc4d8";
            ctx.lineWidth = 1.4;
            ctx.strokeRect(x, y, width, height - 4);
            ctx.fillStyle = "#172632";
            ctx.fillRect(x - 2, y - 4, width + 4, 5);
            ctx.fillStyle = "#82e4ec";
            for (let column = 0; column < 3; column += 1) {
                ctx.fillRect(x + width * (0.1 + column * 0.3), y + height * 0.27, width * 0.19, Math.max(5, height * 0.23));
            }

            // Ground antenna supplied with the scenario, placed immediately
            // to the left of Mission Control and seated on the same ground.
            if (this.controlAntennaSprite) {
                const antennaHeight = Math.max(54, height * 1.18);
                const antennaWidth = antennaHeight;
                const antennaX = Math.max(5, x - antennaWidth - Math.max(7, width * 0.14));
                const antennaY = scene.groundY - antennaHeight;
                ctx.drawImage(this.controlAntennaSprite, antennaX, antennaY, antennaWidth, antennaHeight);
            }

            const dishX = x + width * 0.7;
            const dishY = y - 12 - this.linkDeployment * 25;
            const targetX = scene.targetScreenX ?? dishX;
            const targetY = scene.targetScreenY ?? dishY - 40;
            // The dish artwork's open face is opposite its local +X axis.
            const desiredDishAngle = scene.linked
                ? Math.atan2(targetY - dishY, targetX - dishX) + Math.PI
                : -Math.PI / 4;
            this.dishAngle += Math.atan2(Math.sin(desiredDishAngle - this.dishAngle), Math.cos(desiredDishAngle - this.dishAngle)) * Math.min(1, elapsed * 5.5);
            ctx.strokeStyle = "#70d8db";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(dishX, y - 3);
            ctx.lineTo(dishX, dishY);
            ctx.stroke();
            ctx.save();
            ctx.translate(dishX, dishY);
            ctx.rotate(this.dishAngle);
            ctx.beginPath();
            ctx.moveTo(-4, -11);
            ctx.quadraticCurveTo(10, 0, -4, 11);
            ctx.moveTo(0, 0);
            ctx.lineTo(-8, 0);
            ctx.stroke();
            ctx.fillStyle = "#ffca57";
            ctx.beginPath();
            ctx.arc(-8, 0, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Deployable radio mast: the mast rises in linked mode and its
            // directional antenna slews toward the vehicle independently of
            // the parabolic dish.
            const mastX = x + width * 0.26;
            const mastTopY = y - 5 - this.linkDeployment * 36;
            // The receiver's radiating end is local +X, so it rests and
            // tracks toward the right-hand side of Mission Control.
            const desiredRadioAngle = Math.atan2(targetY - mastTopY, targetX - mastX);
            this.radioAngle += Math.atan2(Math.sin(desiredRadioAngle - this.radioAngle), Math.cos(desiredRadioAngle - this.radioAngle)) * Math.min(1, elapsed * 4.2);
            ctx.strokeStyle = "#8cb4c1";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(mastX, y - 4);
            ctx.lineTo(mastX, mastTopY);
            ctx.moveTo(mastX - 4, y - 4);
            ctx.lineTo(mastX + 4, mastTopY);
            ctx.moveTo(mastX + 4, y - 4);
            ctx.lineTo(mastX - 4, mastTopY);
            ctx.stroke();
            ctx.save();
            ctx.translate(mastX, mastTopY);
            ctx.rotate(this.radioAngle);
            ctx.strokeStyle = "#d5eef4";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-3, 0);
            ctx.lineTo(14, 0);
            ctx.moveTo(8, -5);
            ctx.lineTo(8, 5);
            ctx.stroke();
            ctx.restore();
            ctx.fillStyle = scene.linked ? "#7ff4c9" : "#ffca57";
            ctx.beginPath();
            ctx.arc(mastX, mastTopY, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#c8f4f2";
            ctx.font = "bold 10px Segoe UI";
            ctx.textAlign = "center";
            ctx.fillText("CONTROLE DE VOO", x + width / 2, y + height + 12);
            ctx.font = "9px Segoe UI";
            ctx.fillStyle = "#8ec7dd";
            ctx.fillText("clique para abrir", x + width / 2, y + height + 23);
            ctx.restore();
        }

        drawTowerRadioAntenna(ctx, { mastX, towerTopY, zoom, active, targetX, targetY }) {
            const radioY = towerTopY - 9 * zoom;
            const desiredAngle = Math.atan2(targetY - radioY, targetX - mastX);
            this.towerRadioAngle = wrapAngle(this.towerRadioAngle + wrapAngle(desiredAngle - this.towerRadioAngle) * 0.12);
            ctx.save();
            ctx.translate(mastX, radioY);
            ctx.rotate(this.towerRadioAngle);
            ctx.strokeStyle = active ? "#9ff7dd" : "#a9bac4";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-4 * zoom, 0); ctx.lineTo(15 * zoom, 0);
            ctx.moveTo(7 * zoom, -5 * zoom); ctx.lineTo(7 * zoom, 5 * zoom);
            ctx.moveTo(12 * zoom, -3 * zoom); ctx.lineTo(12 * zoom, 3 * zoom);
            ctx.stroke();
            ctx.restore();
            ctx.fillStyle = active ? "#7ff4c9" : "#ffd166";
            ctx.beginPath(); ctx.arc(mastX, radioY, 2.4, 0, Math.PI * 2); ctx.fill();
        }

        drawRadioCommunication(ctx, { active, sourceX, sourceY, targetX, targetY }) {
            if (!active) {
                this.radioLinkWasActive = false;
                this.radioLinkStartedAt = null;
                return;
            }
            const now = performance.now();
            if (!this.radioLinkWasActive) {
                this.radioLinkWasActive = true;
                this.radioLinkStartedAt = now;
            }
            const elapsed = (now - this.radioLinkStartedAt) / 1000;
            if (elapsed > 1.5) return;
            ctx.save();
            for (let pulse = 0; pulse < 3; pulse += 1) {
                const progress = (elapsed - pulse * 0.15) / 1.05;
                if (progress < 0 || progress > 1) continue;
                const x = sourceX + (targetX - sourceX) * progress;
                const y = sourceY + (targetY - sourceY) * progress;
                ctx.strokeStyle = `rgba(113, 235, 255, ${0.78 * (1 - progress)})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(x, y, 4 + progress * 10, 0, Math.PI * 2); ctx.stroke();
            }
            ctx.strokeStyle = "rgba(117, 230, 255, 0.24)";
            ctx.setLineDash([4, 6]);
            ctx.beginPath(); ctx.moveTo(sourceX, sourceY); ctx.lineTo(targetX, targetY); ctx.stroke();
            ctx.restore();
        }

        drawLaunchPad(ctx, scene) {
            const { groundY, width, height, worldToScreenX, zoom, launchX } = scene;
            const x = worldToScreenX(launchX);
            const deckWidth = 31 * zoom;
            const deckHeight = 3 * zoom;
            const deckY = groundY - this.launchPadHeight * zoom;

            if (x + deckWidth < -40 || x - deckWidth > width + 40 || deckY > height + 40) return;

            ctx.save();
            // Concrete base and wide launch table.
            ctx.fillStyle = "#263039";
            ctx.beginPath();
            ctx.ellipse(x, groundY - 1.5 * zoom, deckWidth * 0.62, 4.5 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#48545b";
            ctx.fillRect(x - deckWidth / 2, deckY, deckWidth, deckHeight);
            ctx.strokeStyle = "#a6bbc2";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x - deckWidth / 2, deckY, deckWidth, deckHeight);

            // Central flame diverter / mount ring below the vehicle.
            ctx.fillStyle = "#1d272d";
            ctx.beginPath();
            ctx.ellipse(x, deckY - 1.5 * zoom, 7.2 * zoom, 2.6 * zoom, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#d4e0e2";
            ctx.stroke();
            ctx.fillStyle = "#d07139";
            ctx.fillRect(x - 10 * zoom, deckY - 1.2 * zoom, 20 * zoom, 1.3 * zoom);

            // Four trapezoidal legs give the pad the low, heavy silhouette of
            // an orbital launch mount while keeping the vehicle unobstructed.
            ctx.fillStyle = "#334149";
            for (const side of [-1, 1]) {
                ctx.beginPath();
                ctx.moveTo(x + side * 10 * zoom, deckY + deckHeight);
                ctx.lineTo(x + side * 15 * zoom, groundY - 1 * zoom);
                ctx.lineTo(x + side * 10.5 * zoom, groundY - 1 * zoom);
                ctx.lineTo(x + side * 6 * zoom, deckY + deckHeight);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = "#9babb1";
                ctx.stroke();
            }

            // Short service bridge facing the tower side of the pad.
            ctx.strokeStyle = "#738c98";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(x - deckWidth / 2, deckY + deckHeight * 0.5);
            ctx.lineTo(x - deckWidth / 2 - 13 * zoom, deckY + deckHeight * 0.5);
            ctx.lineTo(x - deckWidth / 2 - 16 * zoom, deckY - 5 * zoom);
            ctx.stroke();
            ctx.strokeStyle = "#b5c9cf";
            ctx.lineWidth = 1;
            for (let offset = 0; offset < 12; offset += 3) {
                ctx.beginPath();
                ctx.moveTo(x - deckWidth / 2 - offset * zoom, deckY - 1 * zoom);
                ctx.lineTo(x - deckWidth / 2 - (offset + 3) * zoom, deckY + deckHeight + 1 * zoom);
                ctx.stroke();
            }
            ctx.restore();
        }

    }

    window.Scene = Scene;
    window.EARTH_CIRCUMFERENCE_METERS = EARTH_CIRCUMFERENCE_METERS;
})();
