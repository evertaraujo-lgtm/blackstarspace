(function () {
    /** Mission environmental conditions. Physics consumes this data but does not own UI state. */
    class Environment {
        constructor() {
            this.wind = { x: 0, z: 0 };
        }

        setWind({ x = this.wind.x, z = this.wind.z } = {}) {
            this.wind.x = Number.isFinite(x) ? x : 0;
            this.wind.z = Number.isFinite(z) ? z : 0;
            return this.getWind();
        }

        getWind() {
            return { x: this.wind.x, z: this.wind.z };
        }

        getWindAt() {
            return this.getWind();
        }
    }

    window.createStarshipEnvironment = () => new Environment();
})();
