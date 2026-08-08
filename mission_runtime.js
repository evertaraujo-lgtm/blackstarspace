(function () {
    /** Runtime services that are independent of flight-program physics. */
    function createMissionRuntime({ timeScroll, state }) {
        const telemetryStore = new window.StarshipTelemetryStore(timeScroll);

        function createStateView(specification) {
            const view = {};
            for (const [key, accessor] of Object.entries(specification)) {
                Object.defineProperty(view, key, {
                    enumerable: true,
                    get: accessor.get,
                    set: accessor.set,
                });
            }
            return Object.freeze(view);
        }

        const mission = createStateView(state.mission);
        const clock = createStateView(state.clock);
        const instances = createStateView(state.instances);

        function createInstanceTracker({ container, root, toggleButton, getInstances, getFollowedId, setFollowedId, getProfile }) {
            return window.createStarshipInstanceTracker({
                container,
                root,
                toggleButton,
                getInstances,
                getFollowedId,
                setFollowedId,
                getProfile,
            });
        }

        function exportTelemetry(filename = "telemetria_starship.csv") {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(new Blob([telemetryStore.toCsv()], { type: "text/csv" }));
            link.download = filename;
            link.click();
        }

        return Object.freeze({
            mission,
            clock,
            instances,
            telemetryStore,
            createInstanceTracker,
            exportTelemetry,
        });
    }

    window.StarshipMissionRuntime = Object.freeze({ createMissionRuntime });
})();
