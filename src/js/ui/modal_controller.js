(function () {
    function createModalController({ clamp, viewport = window } = {}) {
        if (typeof clamp !== "function") throw new TypeError("createModalController requer clamp");
        let zIndex = 40;

        function bringToFront(modal) {
            zIndex += 1;
            modal.style.zIndex = String(zIndex);
        }

        function clampPosition(modal) {
            const card = modal.querySelector("[data-modal-card]");
            if (!card) return;
            const padding = 12;
            const rect = card.getBoundingClientRect();
            const maxLeft = Math.max(padding, viewport.innerWidth - rect.width - padding);
            const maxTop = Math.max(padding, viewport.innerHeight - rect.height - padding);
            const left = Number(card.style.left.replace("px", "")) || card.offsetLeft;
            const top = Number(card.style.top.replace("px", "")) || card.offsetTop;
            card.style.left = `${clamp(left, padding, maxLeft)}px`;
            card.style.top = `${clamp(top, padding, maxTop)}px`;
        }

        function initializePosition(modal, left, top) {
            const card = modal.querySelector("[data-modal-card]");
            if (!card || card.dataset.positioned === "true") return;
            card.style.left = `${left}px`;
            card.style.top = `${top}px`;
            card.dataset.positioned = "true";
            clampPosition(modal);
        }

        function setVisibility(modal, visible) {
            modal.hidden = !visible;
            if (visible) {
                bringToFront(modal);
                clampPosition(modal);
            }
        }

        function bind(modal, openButton, closeButton) {
            openButton.addEventListener("click", () => setVisibility(modal, true));
            closeButton.addEventListener("click", () => setVisibility(modal, false));
            modal.querySelector("[data-modal-card]")?.addEventListener("pointerdown", () => bringToFront(modal));
        }

        function makeDraggable(modal) {
            const card = modal.querySelector("[data-modal-card]");
            const handle = modal.querySelector("[data-modal-handle]");
            if (!card || !handle) return;
            handle.addEventListener("pointerdown", (event) => {
                if (event.target.closest("button")) return;
                bringToFront(modal);
                const rect = card.getBoundingClientRect();
                const offsetX = event.clientX - rect.left;
                const offsetY = event.clientY - rect.top;
                const move = (moveEvent) => {
                    card.style.left = `${moveEvent.clientX - offsetX}px`;
                    card.style.top = `${moveEvent.clientY - offsetY}px`;
                    clampPosition(modal);
                };
                const stop = () => {
                    viewport.removeEventListener("pointermove", move);
                    viewport.removeEventListener("pointerup", stop);
                };
                viewport.addEventListener("pointermove", move);
                viewport.addEventListener("pointerup", stop);
            });
        }

        return Object.freeze({ bringToFront, clampPosition, initializePosition, setVisibility, bind, makeDraggable });
    }

    window.StarshipModalController = Object.freeze({ createModalController });
})();
