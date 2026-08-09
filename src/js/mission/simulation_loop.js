(function () {
    /** Keeps wall-clock scheduling separate from mission state and rendering. */
    function startSimulationLoop({ isRunning, getSpeed, step, draw, maxStep = 0.025 }) {
        let last = performance.now();

        function frame(now) {
            const elapsed = Math.max(0, (now - last) / 1000);
            last = now;

            if (isRunning()) {
                const simulatedDelta = Math.min(elapsed, 0.05) * getSpeed();
                if (simulatedDelta > 0) {
                    const substeps = Math.min(1000, Math.max(4, Math.ceil(simulatedDelta / maxStep)));
                    for (let index = 0; index < substeps; index += 1) step(simulatedDelta / substeps);
                }
            }

            draw();
            window.requestAnimationFrame(frame);
        }

        window.requestAnimationFrame(frame);
        return {
            resetClock() {
                last = performance.now();
            },
        };
    }

    window.startStarshipSimulationLoop = startSimulationLoop;
})();
