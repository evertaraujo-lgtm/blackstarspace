# blackstarspace
# Black Star Space

**Black Star Space** is a 2D aerospace engineering and flight simulation project built with **HTML, JavaScript and Canvas**.

The goal is not to create an arcade-style rocket game. Instead, Black Star Space explores the engineering behind spaceflight: vehicle dynamics, flight control, sensor limitations, guidance, propulsion, atmospheric flight, staging, recovery and mission design.

The player is expected to interact with systems, parameters and engineering decisions rather than simply pilot a spacecraft manually.

---

## Project Goal

Black Star Space aims to make aerospace engineering concepts understandable through simulation.

The project focuses on questions such as:

* How does a launch vehicle remain stable during flight?
* How can a controller command throttle, gimbal, flaps and RCS?
* What happens when sensors contain noise or update at different frequencies?
* How does a flight computer estimate the real state of the vehicle?
* How can a booster perform a boostback burn and return toward its launch site?
* How does a spacecraft transition between vertical flight, atmospheric descent and landing?
* What happens when a sensor, actuator, engine or communication link fails?
* How much propellant should be reserved for recovery?
* What trade-offs appear when optimizing a flight profile?

The long-term idea is to place the player in the role of a **generalist flight engineer**, responsible for understanding and improving complex spacecraft systems.

---

## Current Scope

The simulator currently contains systems related to:

* 2D rigid-body flight dynamics
* Atmospheric flight
* Gravity
* Aerodynamic drag and lift
* Angle of attack
* Dynamic pressure
* Vehicle rotation
* Engine thrust
* Engine gimbal
* Throttle control
* Reaction Control System (RCS)
* Aerodynamic control surfaces
* Propellant state
* Vehicle mass
* Launch and landing targets
* Launch tower interaction
* Booster recovery
* Hot staging
* Boostback burns
* Suborbital mission profiles
* Water landing
* Vehicle capture and collision states
* Multiple vehicle instances
* Flight program configuration
* Failure simulation
* Flight telemetry
* Control-loop visualization
* Flight profile optimization

The simulation is under active development and many systems are still experimental.

---

## Simulation Architecture

Black Star Space is gradually being organized around four main conceptual layers.

### 1. Physical Core

The physical simulation represents what is actually happening to the vehicle.

It includes values such as:

* Position
* Velocity
* Acceleration
* Attitude
* Angular velocity
* Mass
* Propellant
* Aerodynamic forces
* Engine forces
* Contact with the ground, tower or water

The physical state should remain independent from what the flight computer believes is happening.

---

### 2. Avionics and Sensors

The simulated spacecraft does not necessarily have perfect knowledge of its state.

Sensors operate independently and may contain noise, limited update rates and failures.

Current simulated sensors include approximately:

| Sensor                | Update Rate |
| --------------------- | ----------: |
| IMU                   |       80 Hz |
| GPS                   |        5 Hz |
| Radar Altimeter       |       20 Hz |
| Air Data              |       25 Hz |
| Attitude Sensor       |       20 Hz |
| Platform / Tower Link |       12 Hz |

Sensor measurements may differ from the real physical state.

This distinction allows the simulator to explore concepts such as:

* sensor fusion
* navigation estimation
* latency
* noisy measurements
* control instability
* degraded avionics
* sensor failures

---

### 3. Flight Computer and Control

The flight-control system receives estimated vehicle information and determines actuator commands.

Depending on the mission phase, it may control:

* throttle
* engine gimbal
* aerodynamic flaps
* RCS
* vehicle attitude
* vertical velocity
* lateral position
* landing alignment
* staging
* boostback burns
* recovery maneuvers

The project includes configurable control parameters so different controller behaviors can be tested and compared.

The long-term objective is for engineering decisions made by the player to directly influence mission success.

---

### 4. Mission and Game Layer

Above the physical simulation sits the mission system.

This layer defines:

* mission objectives
* launch configuration
* flight programs
* vehicle selection
* recovery strategy
* failures
* optimization targets
* engineering constraints

Future versions may expand this layer into a broader engineering-management game involving:

* contracts
* vehicle development
* experimental hardware
* reliability
* reputation
* research
* engineering incidents
* mission investigation
* operational decisions

---

## Flight Programs

Several mission profiles are already represented in the simulation.

Examples include:

### Test Hop

A low-altitude launch and landing test used to evaluate vehicle control.

### Boostback Burn

A recovery maneuver designed to alter the trajectory of a booster and return it toward a landing area.

### Hotstage + Boostback

A mission sequence involving vehicle staging followed by recovery operations.

### Suborbital Mission

A more complete flight profile involving ascent, staging, atmospheric flight and recovery.

These profiles are still evolving as the flight model becomes more sophisticated.

---

## Vehicle Control

Vehicles may use several control mechanisms simultaneously.

### Engine Throttle

Controls total engine thrust.

### Engine Gimbal

Changes the direction of engine thrust and generates rotational and lateral control authority.

### RCS

Reaction Control System thrusters provide attitude control, especially when aerodynamic surfaces are ineffective.

### Aerodynamic Flaps

Control surfaces can generate aerodynamic forces and moments during atmospheric flight.

The interaction between these systems creates a control problem rather than a predefined animation.

---

## Sensor Simulation

One of the core design principles of Black Star Space is that:

> **The simulated vehicle state and the flight computer's knowledge of that state are not necessarily the same thing.**

Sensors may contain:

* measurement noise
* different sampling frequencies
* communication delays
* temporary loss of signal
* failures

This makes it possible to simulate real control-system problems instead of simply giving the autopilot perfect information.

---

## Failure Simulation

The simulator already includes infrastructure for introducing failures in systems such as:

* engines
* RCS
* aerodynamic flaps
* tower communication
* tower mechanisms
* flight-control systems

Failures are intended to become an important part of the gameplay.

A mission should not always fail because the player made an obvious mistake.

Instead, the player may need to diagnose unexpected behavior and determine whether the problem is related to:

* hardware
* software
* control tuning
* sensors
* propulsion
* mission planning
* environmental conditions

---

## Optimization

Some flight parameters can be evaluated automatically.

Current experimental optimization systems include:

* hot-staging configuration
* throttle settings
* staging altitude
* pitch bias
* fuel reserve
* booster boostback
* inbound velocity limits
* recovery thrust

The intention is not to replace engineering decisions with an automatic optimizer.

Instead, optimization tools can help the player explore the consequences of different configurations.

---

## Project Structure

The project is currently written primarily in vanilla JavaScript.

Important modules include:

```text
app_context.js
control_loop_view.js
controllers.js
dom.js
environment.js
flight_control.js
flight_control_preferences.js
instances.js
main.js
mission_simulation.js
mission_state.js
modal_controller.js
```

### `main.js`

Application composition, rendering integration, simulation coordination and global runtime behavior.

### `mission_simulation.js`

Mission state evolution, sensors, vehicle state and simulation behavior.

### `flight_control.js`

Flight-control logic and mission guidance.

### `controllers.js`

Reusable control algorithms.

### `mission_state.js`

Mission and flight-program state definitions.

### `control_loop_view.js`

Visualization and inspection of control-loop behavior.

### `environment.js`

Environmental simulation components.

### `instances.js`

Management of multiple simulated vehicles or mission objects.

### `dom.js`

DOM element access and interface integration.

The architecture is still being refactored as the simulation grows.

---

## Technology

Black Star Space intentionally uses a relatively simple technology stack:

* HTML
* CSS
* JavaScript
* HTML Canvas

The objective is to keep the simulation understandable and portable without requiring a large game engine.

This also makes it easier to experiment directly with physics, control algorithms and visualization.

---

## Development Philosophy

The project follows a few important principles.

### Physics before animation

Vehicles should move because forces and control systems cause them to move, not because a predefined animation tells them where to go.

### Imperfect information

The flight computer should operate using simulated sensors rather than accessing the exact physical state whenever possible.

### Engineering should matter

Changing control gains, mass, thrust, staging parameters or recovery configuration should produce meaningful consequences.

### Failure is part of the simulation

Unexpected behavior should create engineering problems to investigate.

### Complexity should be introduced gradually

The objective is not to reproduce every detail of a real launch vehicle.

Instead, systems are simplified while preserving the engineering relationships that make them interesting.

---

## Long-Term Vision

Black Star Space may eventually evolve into an engineering-focused space program simulator.

Rather than controlling every mission as a pilot or acting purely as an agency manager, the player would work as a **generalist flight engineer**.

The player's job would involve:

* configuring vehicles
* analyzing telemetry
* tuning controllers
* investigating failures
* preparing missions
* evaluating experimental hardware
* solving unexpected engineering problems
* supporting operational decisions

The computer-controlled organization around the player could make broader decisions based on mission performance, reliability, reputation and engineering results.

The objective is to create a game where understanding **why something happened** is often more important than simply succeeding.

---

## Status

Black Star Space is currently an experimental personal project and is under active development.

Expect:

* incomplete systems
* changing architecture
* experimental physics
* temporary interfaces
* unfinished mission logic
* frequent refactoring

The repository represents the development process rather than a finished product.

---

## Inspiration

Black Star Space is inspired by real aerospace engineering and reusable launch vehicle development, particularly topics involving:

* launch vehicle control
* atmospheric reentry
* reusable boosters
* vertical landing
* staging
* guidance and navigation
* spacecraft systems engineering

The project is independent and is not affiliated with SpaceX, NASA or any other aerospace organization.

---

## Author

Developed by **Everton Araujo**.

A personal project combining software development, control engineering and an interest in spaceflight.
