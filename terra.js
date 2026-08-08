(function () {
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function smoothstep(min, max, value) {
        const t = clamp((value - min) / (max - min), 0, 1);
        return t * t * (3 - 2 * t);
    }

    /** Renderização da transição do cenário local para espaço profundo. */
    class Terra {
        constructor(config = {}) {
            this.localTerrainEndAltitude = config.localTerrainEndAltitude ?? 70000;
            this.scaledSpaceStartAltitude = config.scaledSpaceStartAltitude ?? 120000;
        }

        getScaledSpaceBlend(altitude) {
            return smoothstep(this.localTerrainEndAltitude, this.scaledSpaceStartAltitude, altitude);
        }

        getLocalTerrainOpacity(altitude) {
            return 1 - this.getScaledSpaceBlend(altitude);
        }

        draw(ctx, { width, height, altitude, time = 0 }) {
            const blend = this.getScaledSpaceBlend(altitude);
            if (blend <= 0) return;

            ctx.save();
            ctx.globalAlpha = blend;
            ctx.fillStyle = "#02050e";
            ctx.fillRect(0, 0, width, height);

            // A faint diagonal Milky-Way-like band gives the empty space a
            // large-scale structure without becoming a UI element.
            ctx.save();
            ctx.translate(width * 0.5, height * 0.48);
            ctx.rotate(-0.28);
            const galaxy = ctx.createLinearGradient(0, -height * 0.18, 0, height * 0.18);
            galaxy.addColorStop(0, "rgba(80, 80, 160, 0)");
            galaxy.addColorStop(0.42, "rgba(101, 104, 184, .10)");
            galaxy.addColorStop(0.5, "rgba(234, 197, 157, .20)");
            galaxy.addColorStop(0.58, "rgba(101, 104, 184, .10)");
            galaxy.addColorStop(1, "rgba(80, 80, 160, 0)");
            ctx.fillStyle = galaxy;
            ctx.fillRect(-width, -height * 0.2, width * 2, height * 0.4);
            ctx.restore();

            for (let index = 0; index < 260; index += 1) {
                const x = (((Math.sin(index * 91.37) * 18753.37) % 1) + 1) % 1 * width;
                const y = (((Math.sin((index + 7) * 43.91) * 31871.19) % 1) + 1) % 1 * height;
                const twinkle = 0.58 + 0.42 * Math.sin(time * 1.8 + index * 1.7);
                const alpha = (index % 17 === 0 ? 0.95 : 0.52) * twinkle;
                ctx.fillStyle = index % 29 === 0 ? `rgba(181, 204, 255, ${alpha})` : `rgba(245, 241, 226, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, index % 17 === 0 ? 1.35 : 0.55, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    window.Terra = Terra;
})();
