const assert = require("node:assert/strict");
const { PhysicalCore } = require("../src/js/core/physical_core.js");

const core = new PhysicalCore();

function almostEqual(actual, expected, tolerance, message) {
    assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);
}

// Vehicle identity is deliberately absent from the integrator. Equal states
// under equal forces must remain equal, whether they represent S24, B7, ring
// or probe.
const bodies = ["S24", "B7", "ring", "probe"].map((id) => ({
    id,
    x: 1000,
    z: 60000,
    vx: 1400,
    vz: 700,
    a: Math.PI / 3,
    w: 0.02,
}));
bodies.forEach((body) => core.step(body, 0.1, {
    mass: 1000,
    forceX: -1200,
    forceZ: 400,
    angularAcceleration: -0.01,
}));
for (const body of bodies.slice(1)) {
    for (const key of ["x", "z", "vx", "vz", "a", "w"]) {
        almostEqual(body[key], bodies[0][key], 1e-12, `estado comum ${key}`);
    }
}

// Circular-orbit horizontal velocity cancels radial gravity in the local
// polar frame to numerical precision.
const orbitalAltitude = 180000;
const orbitalRadius = core.earthRadius + orbitalAltitude;
const circularSpeed = Math.sqrt(core.earthMu / orbitalRadius);
const orbitalAcceleration = core.getOrbitalAcceleration({ z: orbitalAltitude, vx: circularSpeed, vz: 0 });
almostEqual(orbitalAcceleration.az, 0, 1e-9, "equilíbrio orbital radial");

// Aerodynamic drag must oppose the air-relative velocity on both axes.
const atmosphere = core.getAtmosphere({ z: 1000, vx: 120, vz: -40 }, { x: 20, z: 10 });
const drag = core.getAerodynamicForce(atmosphere, { dragCoefficient: 1.2, dragArea: 10 });
assert.ok(drag.x < 0, "arrasto horizontal deve opor VX relativo positivo");
assert.ok(drag.z > 0, "arrasto vertical deve opor VZ relativo negativo");

// A pivot constraint keeps the support point invariant while deriving the
// centre velocity from angular velocity.
const pivoted = { x: 0, z: 0, vx: 0, vz: 0, a: Math.PI / 2, w: 0.5 };
core.constrainToPivot(pivoted, { x: 10, z: -2.5 }, 5);
almostEqual(pivoted.x, 15, 1e-12, "posição X no pivô");
almostEqual(pivoted.z, -2.5, 1e-12, "posição Z no pivô");
almostEqual(pivoted.vz, -2.5, 1e-12, "velocidade tangencial no pivô");

// Water support is also part of the core. A floating body below its target
// waterline receives an upward resultant, while horizontal motion is damped.
const water = core.getWaterForces({
    mass: 1000,
    gravity: 9.81,
    simTime: 20,
    waterTouchdownTime: 10,
    waterFloating: true,
    hasWaterPivot: false,
    x: 0,
    centerZ: 0,
    floatCenterZ: 3,
    vx: 2,
    vz: -1,
    angle: Math.PI / 2,
    angularVelocity: 0,
});
assert.ok(water.forceX < 0, "água deve amortecer movimento horizontal positivo");
assert.ok(water.forceZ > 0, "água deve sustentar corpo abaixo da linha de flutuação");

// Point velocity is shared by rendezvous contact and any future docking
// geometry, including the angular contribution at an offset port.
const portVelocity = core.getPointVelocity({ vx: 10, vz: 20, w: 0.5 }, { x: 2, z: 4 });
almostEqual(portVelocity.vx, 12, 1e-12, "velocidade X na porta com rotação");
almostEqual(portVelocity.vz, 19, 1e-12, "velocidade Z na porta com rotação");

// A gentle inelastic rendezvous contact must preserve linear momentum while
// applying equal and opposite impulses to both vehicles (Newton III).
const chaserContact = { x: 0, z: 0, vx: 0, vz: 1, w: 0 };
const targetContact = { x: 0, z: 1, vx: 0, vz: 0, w: 0 };
const contactResult = core.resolveRendezvousContact(chaserContact, targetContact, {
    massA: 300,
    massB: 300,
    inertiaA: Infinity,
    inertiaB: Infinity,
    contactOffsetA: { x: 0, z: 0 },
    contactOffsetB: { x: 0, z: 0 },
    normal: { x: 0, z: 1 },
    restitution: 0,
});
assert.ok(contactResult.applied, "contato de rendezvous deve aplicar impulso");
almostEqual(contactResult.impulse, 150, 1e-12, "impulso de contato para massas iguais");
almostEqual(chaserContact.vz, 0.5, 1e-12, "chaser desacelera após contato");
almostEqual(targetContact.vz, 0.5, 1e-12, "alvo recebe impulso igual e oposto");
almostEqual(
    300 * chaserContact.vz + 300 * targetContact.vz,
    300,
    1e-12,
    "momento linear do rendezvous é conservado"
);

// Penetration is corrected symmetrically without turning a light contact
// into a fatal collision or allowing the docking rings to overlap forever.
const overlapA = { x: 0, z: 0, vx: 0, vz: 0, w: 0 };
const overlapB = { x: 0, z: 0.8, vx: 0, vz: 0, w: 0 };
const separationResult = core.resolveRendezvousContact(overlapA, overlapB, {
    massA: 300,
    massB: 300,
    normal: { x: 0, z: 1 },
    penetration: 0.2,
    positionCorrection: 1,
    positionSlop: 0,
});
assert.ok(separationResult.applied, "sobreposição leve deve ser separada");
almostEqual(overlapA.z, -0.1, 1e-12, "correção de posição do primeiro corpo");
almostEqual(overlapB.z, 0.9, 1e-12, "correção de posição do segundo corpo");

// Off-centre contacts include rotational inertia. The post-impact velocity at
// the actual contact points must satisfy the inelastic contact constraint,
// not merely the centres-of-mass velocity.
const spinningA = { x: 0, z: 0, vx: 0, vz: 0, w: 1 };
const spinningB = { x: 1, z: 0, vx: 0, vz: 0, w: 0 };
core.resolveRendezvousContact(spinningA, spinningB, {
    massA: 1,
    massB: 1,
    inertiaA: 1,
    inertiaB: 1,
    contactOffsetA: { x: 0, z: 1 },
    contactOffsetB: { x: 0, z: 0 },
    normal: { x: 1, z: 0 },
    restitution: 0,
});
const postImpactPointA = core.getPointVelocity(spinningA, { x: 0, z: 1 });
const postImpactPointB = core.getPointVelocity(spinningB, { x: 0, z: 0 });
almostEqual(postImpactPointA.vx, postImpactPointB.vx, 1e-12, "velocidade normal das portas após impacto");

console.log("NucleoFisico: 9 testes aprovados");
