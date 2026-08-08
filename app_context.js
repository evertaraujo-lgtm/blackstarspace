(function () {
    function createAppContext(initialValues = {}) {
        const values = new Map(Object.entries(initialValues));

        function provide(name, value) {
            values.set(name, value);
            return value;
        }

        function requireValue(name) {
            if (!values.has(name)) throw new Error(`Dependência não fornecida: ${name}`);
            return values.get(name);
        }

        function pick(names) {
            return Object.fromEntries(names.map((name) => [name, requireValue(name)]));
        }

        return Object.freeze({ provide, require: requireValue, pick });
    }

    window.StarshipAppContext = Object.freeze({ createAppContext });
})();
