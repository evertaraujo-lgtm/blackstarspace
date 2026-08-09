(function () {
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * PID de altitude com integral limitada para evitar windup.
     * Retorna o comando e o novo estado integral; não mantém estado interno.
     */
    function altitudePid({
        dt,
        target,
        measurement,
        integral = 0,
        proportionalGain,
        integralGain,
        climbLimit = 20,
        descentLimit = 20,
        integralLimit = 260,
    }) {
        const error = target - measurement;
        const limitedIntegral = clamp(
            integral + error * dt,
            -Math.max(20, integralLimit),
            Math.max(20, integralLimit)
        );

        return {
            integral: limitedIntegral,
            output: clamp(
                error * proportionalGain + limitedIntegral * integralGain,
                -Math.max(0, descentLimit),
                Math.max(0, climbLimit)
            ),
        };
    }

    /**
     * PI de velocidade vertical que calcula o throttle para uma nave inclinada.
     * O estado integral é explícito para que qualquer classe possa reutilizá-lo.
     */
    function throttlePi({
        dt,
        targetVelocity,
        measuredVelocity,
        tilt,
        maxThrust,
        mass,
        gravity,
        integral = 0,
        proportionalGain,
        integralGain,
    }) {
        const thrustAcceleration = maxThrust / Math.max(mass, 1);
        const verticalAuthority = Math.max(4, thrustAcceleration * Math.max(0.2, Math.cos(tilt)));
        const hoverThrottle = clamp(gravity / verticalAuthority, 0, 0.9);
        const error = targetVelocity - measuredVelocity;
        const limitedIntegral = clamp(integral + error * dt, -25, 25);

        return {
            integral: limitedIntegral,
            output: clamp(hoverThrottle + error * proportionalGain + limitedIntegral * integralGain, 0, 1),
        };
    }

    window.StarshipControlAlgorithms = Object.freeze({
        clamp,
        altitudePid,
        throttlePi,
    });
})();

