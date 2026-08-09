(function () {
    /** Renders and owns interactions for the live-flight instance tracker. */
    function createInstanceTracker({ container, root, toggleButton, getInstances, getFollowedId, setFollowedId, getProfile }) {
        let collapsed = false;

        function drawIcon(canvas, profile) {
            const context = canvas.getContext("2d");
            const width = canvas.width; const height = canvas.height;
            context.clearRect(0, 0, width, height);
            const scale = Math.min((height - 6) / profile.length, (width - 8) / profile.dimensions.diameter);
            const bodyHeight = profile.length * scale;
            const bodyWidth = profile.dimensions.diameter * scale;
            const x = (width - bodyWidth) / 2; const y = (height - bodyHeight) / 2;
            const steel = context.createLinearGradient(x, 0, x + bodyWidth, 0);
            steel.addColorStop(0, "#637782"); steel.addColorStop(.5, "#edf8fa"); steel.addColorStop(1, "#536671");
            context.fillStyle = steel; context.strokeStyle = "#c9e8ef";
            if (profile.vehicleClass === "superheavy_booster") {
                context.fillRect(x, y, bodyWidth, bodyHeight); context.strokeRect(x, y, bodyWidth, bodyHeight);
                context.fillStyle = "#263943";
                for (const side of [-1, 1]) context.fillRect(x + (side > 0 ? bodyWidth : -bodyWidth * .55), y + bodyHeight * .22, bodyWidth * .55, bodyHeight * .08);
                context.fillStyle = "#17242b";
                for (let index = 0; index < 5; index += 1) { context.beginPath(); context.arc(x + bodyWidth * (.18 + index * .16), y + bodyHeight - 3, 1.1, 0, Math.PI * 2); context.fill(); }
                return;
            }
            context.beginPath();
            context.moveTo(x, y + bodyHeight); context.lineTo(x, y + bodyHeight * .18);
            context.quadraticCurveTo(x + bodyWidth / 2, y - bodyHeight * .12, x + bodyWidth, y + bodyHeight * .18);
            context.lineTo(x + bodyWidth, y + bodyHeight); context.closePath(); context.fill(); context.stroke();
            context.fillStyle = "#2b3c46";
            context.fillRect(x - bodyWidth * .35, y + bodyHeight * .62, bodyWidth * 1.7, bodyHeight * .09);
        }

        function render() {
            const followedId = getFollowedId();
            const instances = getInstances();
            container.innerHTML = instances.map((instance) => {
                const altitude = Math.max(0, instance.state.z ?? 0).toFixed(0);
                const followed = followedId === instance.id;
                return `<button class="instanceCard ${followed ? "is-followed" : ""}" type="button" data-instance-id="${instance.id}" data-profile-id="${instance.profile.id}"><canvas width="46" height="52"></canvas><span><span class="instanceCardName">${instance.label}</span><span class="instanceCardMeta">${instance.detail} · Z ${altitude} m</span></span><span class="instanceCardFollow">${followed ? "SEGUINDO" : "SEGUIR"}</span></button>`;
            }).join("");
            container.querySelectorAll(".instanceCard").forEach((card) => drawIcon(card.querySelector("canvas"), getProfile(card.dataset.profileId)));
        }

        container.addEventListener("pointerdown", (event) => {
            const card = event.target.closest(".instanceCard");
            if (!card) return;
            event.preventDefault();
            setFollowedId(card.dataset.instanceId === "s24-docked" ? "primary" : card.dataset.instanceId);
            render();
        });
        toggleButton.addEventListener("click", () => {
            collapsed = !collapsed;
            root.classList.toggle("is-collapsed", collapsed);
            toggleButton.textContent = collapsed ? "Abrir" : "Recolher";
            toggleButton.setAttribute("aria-expanded", String(!collapsed));
        });
        return { render };
    }

    window.createStarshipInstanceTracker = createInstanceTracker;
})();
