# **Ritual**

## **05 — Technical Architecture & Engineering Specification**

**Project:** Ritual  
**Tagline:** The Choreography of Espresso  
**Document ID:** RITUAL-05  
**Version:** 1.0 — Engineering Architecture Baseline  
**Date:** October 27, 2026  
**Status:** Architecture Defined — Pending Implementation and Validation  
**Project Type:** Cinematic Interactive 3D Web Experience  
**Parent Documents:** RITUAL-00, RITUAL-01, RITUAL-02, RITUAL-03, RITUAL-04  
**Repository:** [https\://github.com/byishimwe/ritual](https://github.com/byishimwe/ritual)  
**Implementation Strategy:** Fresh implementation following approved project specifications  
**Purpose:** Establish the technical architecture, system responsibilities, behavioral contracts, rendering strategy, real-time simulation, performance standards, reliability requirements, and engineering acceptance criteria for Ritual.

---

# **1\. Document Purpose**

## **1.1 Overview**

This document defines how Ritual will be engineered.

The previous documents establish what the visitor experiences:

* A premium automatic espresso machine.  
* Direct manipulation of physical objects.  
* Preparation-first interaction.  
* A coherent grinding and brewing process.  
* User-controlled coffee dispensing.  
* Physically meaningful cup placement.  
* Spilling and overflow.  
* Cinematic visual and audio feedback.  
* Reliable completion, reset, and replay.

Document 05 translates those requirements into a maintainable software architecture.

It must provide sufficient technical detail for an engineer unfamiliar with the project to construct the complete application without inventing fundamental architectural or behavioral decisions.

## **1.2 Engineering Objective**

Build a high-quality real-time interactive 3D experience that is:

* Deterministic.  
* Responsive.  
* Visually sophisticated.  
* Performance-conscious.  
* Maintainable.  
* Testable.  
* Recoverable.  
* Suitable for repeated exhibition use.

The application must not become unnecessarily complex merely to produce sophisticated visuals.

## **1.3 Architectural Principle**

**One authoritative experience engine controls the process.**

The 3D scene renders its state.

The input system issues commands.

The camera responds to meaningful events.

The animation system presents physical changes.

The audio system responds to mechanical events.

The liquid system calculates physical consequences.

None of these presentation systems independently owns the machine's operating state.

## **1.4 Source of Truth**

The authoritative project requirements are:

* RITUAL-00 — Project Definition & Scope.  
* RITUAL-01 — Reference & Concept.  
* RITUAL-02 — 3D Assets & Scene Specification.  
* RITUAL-03 — Interaction & Experience Specification.  
* RITUAL-04 — Cinematic & Sensory Design System.

Previous web implementation choices are not binding.

The new implementation may use the repository as its version-control destination, but its architecture must follow these specifications.

---

# **2\. Engineering Decisions**

The following decisions are established for the new implementation.

| Area | Selected approach |
| ----- | ----- |
| Application architecture | Client-side single-page application |
| Framework | React |
| Language | TypeScript, strict mode |
| Build tooling | Vite |
| Rendering | Three.js / WebGL 2 |
| React integration | React Three Fiber |
| Scene utilities | Drei |
| Animation | GSAP for authored transitions |
| Realtime animation | Frame-loop updates for continuous effects |
| State management | Zustand vanilla store with an authoritative experience controller |
| Behavioral logic | Typed commands, guarded transitions, deterministic simulation |
| Audio | Web Audio API with a dedicated audio service |
| Sound content | Primarily high-quality recorded sound assets, supplemented where useful |
| Assets | Blender-authored glTF/GLB |
| Liquid | Lightweight procedural geometry and shaders |
| Cup filling | Volume-driven procedural geometry |
| Steam | Lightweight procedural particle system |
| Spills | Volume-driven localized surface effects |
| Input | Pointer events and raycasting |
| Camera | Constrained OrbitControls with an explicit control coordinator |
| Process timing | Single authoritative simulation clock |
| Reset | Cancel-safe, idempotent session restoration |
| Persistence | None for visitor progress |
| Backend | None |
| Primary deployment | Static web application |
| Unit testing | Vitest |
| Interaction testing | Playwright |
| Visual verification | Controlled browser screenshot comparison and manual art-direction review |
| Target experience | Desktop-first exhibition |

## **2.1 Version Selection**

Use stable, mutually compatible package releases at implementation time.

The initial compatibility target is:

* React 19\.  
* React Three Fiber 9\.  
* A compatible Drei version.  
* A compatible Three.js version.  
* Current stable GSAP, Zustand, and Vite releases.

React Three Fiber 10 must not be adopted merely because it is newer while its alpha status remains relevant.

Package versions must be locked in a committed dependency lockfile.

Avoid loose, untested major-version upgrades during final exhibition preparation.

## **2.2 Why Vite Rather Than Next.js?**

Ritual is a single immersive client-side experience.

It does not require:

* Server-side rendering.  
* Authentication.  
* Database access.  
* Server actions.  
* Dynamic routes.  
* Complex SEO-oriented page architecture.  
* Backend APIs.

A Vite-based application provides an appropriate development and production workflow without introducing unnecessary server-side concepts.

## **2.3 Why React Three Fiber?**

React Three Fiber supports declarative scene composition, reusable components, lifecycle management, and direct interaction with Three.js objects.

It allows the 3D scene to coexist with the application architecture while still supporting imperative per-frame updates.

## **2.4 Why GSAP?**

GSAP is appropriate for:

* Hopper movement.  
* Physical buttons.  
* Bean-transfer choreography.  
* Object settling.  
* Camera transitions.  
* Reset transitions.  
* Carefully authored mechanical motion.

It should not own the logical machine-state sequence.

## **2.5 Why Zustand?**

Zustand provides a lightweight way to expose state across React and non-React systems.

A vanilla store is particularly useful because the simulation engine, audio service, and animation controller must be accessible independently of React component rendering.

## **2.6 Why Not a Full Physics Engine?**

The approved experience requires predictable physical interaction, not a mechanically exhaustive simulation.

Cup dragging, bean transfer, button travel, and hopper movement can be implemented through constrained transformations and authored animation.

A physics engine would add complexity without a corresponding improvement to the core experience.

## **2.7 Why Not a Fluid Solver?**

The coffee pour requires convincing visual behavior and internally consistent volume accounting.

It does not require accurate computational fluid dynamics.

Procedural rendering provides greater control, lower cost, and more predictable behavior.

## **2.8 Intentionally Excluded Technologies**

The initial implementation does not require:

* Next.js.  
* Tailwind.  
* ScrollTrigger.  
* Lenis.  
* React Router.  
* Framer Motion.  
* A physics engine.  
* A backend framework.  
* A database.  
* Authentication.  
* A general-purpose particle framework.  
* A large ECS/game-engine abstraction.  
* A second state-management library.  
* Multiple overlapping animation libraries.

Add a dependency only when it solves a clear, demonstrated problem.

---

# **3\. System Architecture**

## **3.1 Architectural Layers**

The application is divided into six layers.

### **Layer 01 — Application Shell**

Responsible for:

* Application initialization.  
* Asset loading.  
* Canvas creation.  
* Browser lifecycle.  
* Error recovery.  
* Configuration.  
* Deployment-related behavior.

### **Layer 02 — Experience Domain**

Responsible for:

* Machine state.  
* Interaction commands.  
* Action guards.  
* Ingredient state.  
* Cup state.  
* Coffee accounting.  
* Process transitions.  
* Session lifecycle.  
* Reset logic.

### **Layer 03 — Interaction System**

Responsible for:

* Pointer input.  
* Raycasting.  
* Click detection.  
* Dragging.  
* Object selection.  
* Input ownership.  
* Spatial validation.  
* User intent.

### **Layer 04 — Presentation Systems**

Responsible for:

* 3D scene.  
* Product materials.  
* Animations.  
* Camera choreography.  
* Lighting.  
* Liquid rendering.  
* Steam.  
* Spills.  
* Audio.

### **Layer 05 — Runtime Infrastructure**

Responsible for:

* Simulation scheduling.  
* Resource management.  
* Asset validation.  
* Quality adaptation.  
* Visibility handling.  
* Runtime diagnostics.

### **Layer 06 — Quality & Delivery**

Responsible for:

* Automated tests.  
* Performance analysis.  
* Build validation.  
* Browser testing.  
* Deployment.  
* Exhibition handoff.

## **3.2 Direction of Dependency**

The main relationship is:

**Input → Command → Experience Engine → State/Event → Presentation**

Presentation systems may read the current experience state.

They may not directly modify unrelated domain state.

For example:

* A button component requests `PRESS_MAKE`.  
* The experience engine evaluates whether Make is available.  
* A valid command changes the process state.  
* A transition event is published.  
* Mechanical animation begins.  
* Audio begins.  
* Camera choreography responds.

The button component must not directly start grinding audio, create a brewing timeout, or modify coffee volume.

## **3.3 Authority Boundaries**

| Concern | Authoritative owner |
| ----- | ----- |
| Machine process | Experience engine |
| Input validity | Experience command guards |
| Beans loaded | Experience domain |
| Hopper logical state | Experience domain |
| Cup position | Spatial interaction controller, committed to experience domain |
| Coffee volume | Liquid simulation owned by experience engine |
| Camera transform | Camera coordinator |
| Machine mesh transforms | Relevant animation controller |
| Audio playback | Audio service |
| Visual effects | Effect renderers |
| Reset lifecycle | Experience/session coordinator |
| Asset contract | Asset loader and validation manifest |

Only one system may write each authoritative property.

## **3.4 Example Data Flow**

A valid bean transfer follows:

1. Pointer interaction begins on the bean container.  
2. Input coordinator captures the pointer.  
3. Bean drag controller moves the container.  
4. Visitor releases the container near the hopper.  
5. Spatial validator checks the target region.  
6. Experience engine checks bean and hopper state.  
7. Transfer is accepted.  
8. Bean-transfer animation begins.  
9. Animation signals transfer completion.  
10. Experience engine commits the beans-loaded state.  
11. Hopper-filled rendering updates.  
12. Further bean transfer is unavailable.

This flow preserves both physical feedback and deterministic state.

---

# **4\. Proposed Project Structure**

The following structure is the selected starting architecture.

ritual/  
├── public/  
│   └── assets/  
│       ├── models/  
│       │   └── ritual\_machine.glb  
│       ├── audio/  
│       │   ├── buttons/  
│       │   ├── hopper/  
│       │   ├── beans/  
│       │   ├── cup/  
│       │   ├── machine/  
│       │   └── liquid/  
│       └── textures/  
│  
├── src/  
│   ├── app/  
│   │   ├── App.tsx  
│   │   ├── ExperienceRoot.tsx  
│   │   ├── ErrorBoundary.tsx  
│   │   └── bootstrap.ts  
│   │  
│   ├── config/  
│   │   ├── experience.config.ts  
│   │   ├── camera.config.ts  
│   │   ├── materials.config.ts  
│   │   ├── audio.config.ts  
│   │   └── quality.config.ts  
│   │  
│   ├── domain/  
│   │   ├── types.ts  
│   │   ├── commands.ts  
│   │   ├── events.ts  
│   │   ├── initialState.ts  
│   │   ├── guards.ts  
│   │   ├── transitions.ts  
│   │   ├── selectors.ts  
│   │   ├── invariants.ts  
│   │   ├── experienceEngine.ts  
│   │   ├── simulationClock.ts  
│   │   ├── liquidAccounting.ts  
│   │   └── sessionController.ts  
│   │  
│   ├── state/  
│   │   └── experienceStore.ts  
│   │  
│   ├── assets/  
│   │   ├── assetManifest.ts  
│   │   ├── loadRitualAsset.ts  
│   │   ├── validateRitualAsset.ts  
│   │   └── assetTransforms.ts  
│   │  
│   ├── scene/  
│   │   ├── ExperienceCanvas.tsx  
│   │   ├── RitualScene.tsx  
│   │   ├── Machine.tsx  
│   │   ├── BeanSupply.tsx  
│   │   ├── Cup.tsx  
│   │   ├── ProductStage.tsx  
│   │   ├── Lighting.tsx  
│   │   └── Postprocessing.tsx  
│   │  
│   ├── interactions/  
│   │   ├── inputCoordinator.ts  
│   │   ├── raycastTargets.ts  
│   │   ├── usePointerInteraction.ts  
│   │   ├── hopperController.ts  
│   │   ├── beanDragController.ts  
│   │   ├── cupDragController.ts  
│   │   └── spatialValidation.ts  
│   │  
│   ├── motion/  
│   │   ├── motionCoordinator.ts  
│   │   ├── hopperMotion.ts  
│   │   ├── buttonMotion.ts  
│   │   ├── beanTransferMotion.ts  
│   │   ├── machineMotion.ts  
│   │   └── resetMotion.ts  
│   │  
│   ├── camera/  
│   │   ├── CameraRig.tsx  
│   │   ├── cameraController.ts  
│   │   ├── cameraPresets.ts  
│   │   └── cameraConstraints.ts  
│   │  
│   ├── effects/  
│   │   ├── CoffeeStream.tsx  
│   │   ├── CupFill.tsx  
│   │   ├── CoffeeSurface.tsx  
│   │   ├── Spill.tsx  
│   │   ├── Overflow.tsx  
│   │   ├── Steam.tsx  
│   │   └── liquidGeometry.ts  
│   │  
│   ├── audio/  
│   │   ├── audioEngine.ts  
│   │   ├── audioManifest.ts  
│   │   ├── audioEvents.ts  
│   │   └── audioMix.ts  
│   │  
│   ├── runtime/  
│   │   ├── runtimeCoordinator.ts  
│   │   ├── frameScheduler.ts  
│   │   ├── visibilityController.ts  
│   │   ├── qualityManager.ts  
│   │   ├── resourceRegistry.ts  
│   │   └── diagnostics.ts  
│   │  
│   ├── styles/  
│   │   └── globals.css  
│   │  
│   ├── main.tsx  
│   └── vite-env.d.ts  
│  
├── tests/  
│   ├── domain/  
│   ├── interactions/  
│   ├── simulation/  
│   ├── integration/  
│   └── e2e/  
│  
├── scripts/  
│   └── validate-assets.ts  
│  
├── package.json  
├── tsconfig.json  
├── vite.config.ts  
└── README.md

## **4.1 Folder Responsibilities**

`app/` contains browser initialization and the React shell.

`domain/` contains the behavioral rules without dependencies on Three.js or React.

`state/` exposes the authoritative experience snapshot to consumers.

`assets/` loads and validates the Blender-produced model.

`scene/` defines the declarative 3D hierarchy.

`interactions/` translates physical input into commands.

`motion/` owns authored object animation.

`camera/` owns camera exploration and cinematography.

`effects/` renders coffee, steam, and spills.

`audio/` owns all sound playback.

`runtime/` coordinates simulation, lifecycle, and quality.

`tests/` verifies behavior and integration.

## **4.2 Avoid Excessive Abstraction**

The proposed structure is organizational rather than a requirement to create empty files for every conceivable subsystem.

Related small modules may be combined when doing so improves clarity.

Do not create a generalized plugin architecture or extensive dependency-injection framework for this single experience.

The boundaries matter more than the number of files.

---

# **5\. Application Lifecycle**

## **5.1 Lifecycle States**

The application itself has a lifecycle distinct from the coffee machine.

Recommended states:

* `BOOTING`  
* `LOADING`  
* `VALIDATING`  
* `READY`  
* `SUSPENDED`  
* `RECOVERING`  
* `FATAL_ERROR`

## **5.2 Boot Sequence**

1. Read environment and configuration.  
2. Detect rendering capability.  
3. Initialize the application shell.  
4. Initialize the experience engine.  
5. Create the rendering canvas.  
6. Begin loading required assets.  
7. Decode and validate the GLB.  
8. Resolve required asset references.  
9. Initialize scene controllers and effects.  
10. Prepare the initial camera and lighting.  
11. Initialize the audio service in its browser-permitted state.  
12. Mark the scene ready.  
13. Reveal the opening composition.  
14. Enable visitor interaction.

## **5.3 Initial Experience State**

The machine starts in `OFF`.

The hopper is closed and empty.

The bean supply is available.

The cup is empty and unaligned.

No preparation or dispensing is active.

The camera shows the approved hero framing.

## **5.4 Loading Presentation**

A restrained, nonverbal loading presentation is permitted before the experience becomes interactive.

It should not become an instructional interface.

The scene must not reveal an uninitialized or partially loaded model.

## **5.5 Ready Condition**

The application may enter `READY` only after:

* The canvas is operational.  
* The required GLB has loaded.  
* Required nodes and anchors have been validated.  
* Interaction controllers are initialized.  
* The initial visual state is coherent.

Audio can remain locked until the first permitted visitor gesture.

Audio unlock is not a reason to block the visual experience.

## **5.6 Fatal Failure**

An essential asset or rendering failure must not leave the visitor staring indefinitely at a blank canvas.

A minimal technical recovery presentation is permitted when the normal 3D experience cannot function.

Such a presentation is outside the artistic scene and should be treated as an exceptional failure state.

---

# **6\. Experience Domain Model**

## **6.1 Core State**

The logical experience state includes the following domains:

**Machine**

* Process state.  
* Process elapsed time.  
* Power condition derived from process state.

**Hopper**

* Open/closed target.  
* Whether hinge motion is complete.  
* Whether beans are loaded.

**Bean Supply**

* Available/dragging/transferring/loaded state.  
* Whether the ingredient has been consumed.

**Cup**

* Current position.  
* Dragging condition.  
* Fill volume.

**Coffee**

* Prepared batch volume.  
* Remaining volume.  
* In-flight volume.  
* Cup-captured volume.  
* Surface-spilled volume.  
* Overflow volume.  
* Discarded unused volume.  
* Pour activity.

**Session**

* Session identifier.  
* Generation number.  
* Last meaningful interaction time.  
* Reset state.  
* Visibility state.

## **6.2 Primary Machine State**

Use a discriminated union equivalent to:

type MachineState \=  
  \| 'OFF'  
  \| 'IDLE\_ON'  
  \| 'GRINDING'  
  \| 'TRANSITION'  
  \| 'BREWING'  
  \| 'READY\_TO\_POUR'  
  \| 'POURING'  
  \| 'COMPLETE'  
  \| 'RESETTING';

## **6.3 Separate Object States**

Use separate typed values for hopper and bean supply.

type HopperState \= 'CLOSED' \| 'OPEN';

type BeanSupplyState \=  
  \| 'AVAILABLE'  
  \| 'DRAGGING'  
  \| 'TRANSFERRING'  
  \| 'LOADED';

Animated movement between stable hopper positions may be tracked by its animation controller, with completion acknowledged to the domain.

## **6.4 Cup Data**

The cup model requires:

* Current world-space position.  
* A stable horizontal movement plane.  
* Its effective mouth center and radius.  
* Its remaining capacity.  
* Its accumulated contents.  
* Its current drag owner, if any.

The rendered ceramic transform and the domain's canonical spatial position must agree.

## **6.5 Derived State**

Do not independently store redundant values if they can be computed.

Examples:

`canMake` is true only when:

* Machine is `IDLE_ON`.  
* Beans are loaded.  
* Hopper is closed.  
* Lid motion is complete.  
* No bean transfer is active.

`canPour` is true only in `READY_TO_POUR` with a positive prepared batch.

`cupFillFraction = cupVolume / cupCapacity`.

`captureFraction` derives from current stream and cup geometry.

`hasOverflow = overflowVolume > 0`.

## **6.6 Numerical Rules**

Simulation values must remain finite.

Clamp:

* Coffee volumes to nonnegative ranges.  
* Cup volume to capacity.  
* Capture fraction to `[0, 1]`.  
* Drag positions to the permitted region.  
* Process elapsed time to the current stage duration.

Reject or recover from `NaN`, infinite values, and invalid spatial transforms.

---

# **7\. Commands, Guards & Events**

## **7.1 Command Architecture**

Visitor interactions issue typed commands.

Examples:

type ExperienceCommand \=  
  \| { type: 'POWER\_ON' }  
  \| { type: 'POWER\_OFF' }  
  \| { type: 'OPEN\_HOPPER' }  
  \| { type: 'CLOSE\_HOPPER' }  
  \| { type: 'BEGIN\_BEAN\_DRAG' }  
  \| { type: 'CANCEL\_BEAN\_DRAG' }  
  \| { type: 'COMMIT\_BEAN\_TRANSFER' }  
  \| { type: 'COMPLETE\_BEAN\_TRANSFER' }  
  \| { type: 'SET\_CUP\_POSITION'; position: \[number, number, number\] }  
  \| { type: 'PRESS\_MAKE' }  
  \| { type: 'PRESS\_POUR' }  
  \| { type: 'RESET'; reason: ResetReason };

The exact API may be refined during implementation, but these operations must remain explicit.

## **7.2 Guard Evaluation**

Each command passes through a guard.

The guard determines whether the command is valid for the current state.

A rejected command must not cause a partial state transition.

## **7.3 Command Result**

Use an explicit result contract equivalent to:

type CommandResult \=  
  \| { accepted: true; events: ExperienceEvent\[\] }  
  \| { accepted: false; reason: RejectionReason };

Input handlers may use rejection information for restrained physical feedback or development diagnostics.

No visible conventional error interface is required.

## **7.4 Domain Events**

The engine emits meaningful events such as:

* `HOPPER_OPENED`  
* `HOPPER_CLOSED`  
* `BEAN_TRANSFER_STARTED`  
* `BEANS_LOADED`  
* `MACHINE_POWERED_ON`  
* `MACHINE_POWERED_OFF`  
* `GRINDING_STARTED`  
* `GRINDING_FINISHED`  
* `BREWING_STARTED`  
* `BREWING_FINISHED`  
* `COFFEE_READY`  
* `POUR_STARTED`  
* `POUR_STOPPED`  
* `BATCH_EXHAUSTED`  
* `CYCLE_COMPLETED`  
* `RESET_STARTED`  
* `RESET_COMPLETED`

## **7.5 Event Semantics**

Events indicate something that happened.

They should be emitted once for each actual logical transition.

For example, `GRINDING_STARTED` must not be emitted repeatedly on every rendered frame.

## **7.6 Rejected Commands**

An invalid command:

* Preserves machine state.  
* Does not start process timers.  
* Does not change ingredient quantities.  
* Does not create a coffee batch.  
* Does not start unrelated audio or animation.

The input/presentation layer may provide appropriate subtle tactile acknowledgment.

## **7.7 Command Ordering**

Commands must be processed serially.

The engine must prevent reentrant state changes that cause multiple transitions from a single input gesture.

## **7.8 Session Generation**

Every command or scheduled completion associated with a session must be checked against its active generation.

A stale operation from an earlier session must never change the current experience.

---

# **8\. State Transition Engine**

## **8.1 Transition Ownership**

The engine is the sole authority for changing machine process state.

React components must not directly set arbitrary process-state values.

## **8.2 Preparation Prerequisites**

The engine accepts Make only when:

* Machine is powered on and idle.  
* Beans are loaded.  
* Hopper is completely closed.  
* Bean transfer is not active.  
* No preparation cycle is already running.

Cup alignment is not required.

## **8.3 Primary Transition Sequence**

`OFF → IDLE_ON → GRINDING → TRANSITION → BREWING → READY_TO_POUR → POURING → COMPLETE → RESETTING → OFF`

The `IDLE_ON → OFF` transition is also available before brewing begins.

## **8.4 No Duplicate Process Cycles**

While grinding, transitioning, or brewing:

* Further Make commands are rejected.  
* The process cannot restart.  
* No additional coffee batch is created.  
* Additional process schedulers cannot be registered.

## **8.5 Hopper Lock**

The hopper is locked from grinding through completion.

Only reset releases the completed-cycle lock.

## **8.6 Power Semantics**

Before brewing, Power may toggle between `OFF` and `IDLE_ON` without deleting previously prepared ingredients.

During active processing and dispensing, normal Power presses do not interrupt the process.

In `COMPLETE`, Power initiates the approved reset path.

## **8.7 Pour Semantics**

From `READY_TO_POUR`, Pour begins the finite batch.

While `POURING`, a second valid press stops and finalizes dispensing.

The completed cycle cannot be resumed.

## **8.8 Reset Semantics**

Reset can occur from any state.

It invalidates pending operations, clears active simulation effects, restores initial data, and coordinates the visual restoration.

---

# **9\. Authoritative Simulation Clock**

## **9.1 Clock Requirement**

The engine requires one authoritative simulation time source.

This clock governs:

* Grinding.  
* Transition pause.  
* Brewing.  
* Prepared coffee dispensing.  
* Coffee-volume changes.

It must not be replaced by unrelated `setTimeout` calls in individual presentation components.

## **9.2 Selected Approach**

Use a simulation coordinator driven by the application's animation frame loop.

The coordinator receives elapsed time and advances the domain in a controlled manner.

## **9.3 Simulation Time vs Wall Time**

Maintain separate concepts:

**Simulation time:** Advances when the experience is actively running.

**Wall time:** Used for session inactivity and browser visibility decisions.

They must not be confused.

For example, a browser tab hidden for two minutes must not cause the entire coffee preparation and pouring process to complete invisibly.

## **9.4 Simulation Step**

Use a fixed simulation step of approximately:

**1/60 second**

A fixed-step accumulator provides consistent domain behavior across variable display frame rates.

Rendering can continue at the device's actual refresh rate.

## **9.5 Frame Delta Protection**

The scheduler must reject negative or invalid deltas and clamp unusually large active-frame deltas.

A practical maximum accepted active-frame interval is 100 milliseconds, subdivided into simulation steps.

A maximum substep count prevents uncontrolled catch-up loops.

## **9.6 Lag Policy**

On a severe frame stall:

* Do not process unlimited accumulated time.  
* Do not let liquid volume jump dramatically.  
* Do not advance through several major stages invisibly.  
* Preserve a coherent, slightly slowed simulation if necessary.

Consistency is more important than pretending no rendering interruption occurred.

## **9.7 Stage Boundaries**

The scheduler must handle exact stage boundaries correctly.

If a simulation step crosses the end of grinding, the engine must:

1. Consume the remaining grinding time.  
2. Emit the grinding-complete transition.  
3. Enter the pause.  
4. Apply any remaining eligible simulation time to the new stage.

Do not skip or duplicate transitions.

## **9.8 Preparation Timings**

| Stage | Duration |
| ----- | ----- |
| Grinding | 4.0 s |
| Transition pause | 1.2 s |
| Brewing | 4.2 s |
| Total | 9.4 s |

These are the authoritative behavioral durations from Document 03\.

## **9.9 Deterministic Testing**

The simulation engine must accept manually supplied time advancement in tests.

Tests must be able to advance 4.0 seconds, 1.2 seconds, and 4.2 seconds without waiting for actual wall-clock time.

---

# **10\. State Store & React Synchronization**

## **10.1 Selected Store Architecture**

Use a Zustand vanilla store to expose the experience state.

The experience engine is responsible for modifying that store through approved transitions and simulation updates.

React components use selectors for relevant values.

## **10.2 Why a Vanilla Store?**

The experience engine must operate independently of React's rendering lifecycle.

Audio, camera, procedural effects, and simulation systems also need direct access to current state.

A vanilla store avoids requiring all those systems to call React hooks.

## **10.3 State Subscription Policy**

Components should subscribe only to values relevant to their presentation.

Examples:

* Machine indicator subscribes to process state.  
* Hopper controller subscribes to hopper target.  
* Camera controller subscribes to significant cinematic events.  
* Pour renderer accesses the current liquid model.

## **10.4 High-Frequency Data**

Do not trigger React renders for every liquid-volume increment or drag pointer update.

The engine should maintain authoritative high-frequency simulation data that renderers can read directly.

React-facing snapshots may be published at meaningful state changes or a controlled low-frequency diagnostic interval.

This must not create competing sources of truth.

## **10.5 Store and Simulation Relationship**

The experience engine owns the canonical simulation values.

The Zustand store exposes their current logical state and selected snapshots.

Continuous simulation values can be exposed through a read-only engine API to frame-driven renderers.

They must not be independently recalculated or modified by different components.

## **10.6 Render Loop Rule**

Frame-driven components may imperatively update Three.js objects using current simulation values.

They should not continuously call React state setters.

## **10.7 State Immutability**

Published logical snapshots should be immutable or treated as read-only.

Consumers must not mutate the store's nested objects directly.

## **10.8 Derived Selectors**

Centralize selectors such as:

* `selectCanMake`  
* `selectCanPour`  
* `selectIsProcessing`  
* `selectIsHopperLocked`  
* `selectIsBeanTransferAvailable`  
* `selectCupFillFraction`  
* `selectIsSessionDirty`

This avoids repeating guard logic in presentation components.

---

# **11\. Runtime Frame Pipeline**

## **11.1 Unified Frame Coordinator**

The runtime should define one clear update order.

A recommended frame pipeline is:

1. Read browser frame delta.  
2. Evaluate visibility/suspension state.  
3. Advance the authoritative experience simulation.  
4. Apply accepted object-drag positions.  
5. Update domain-driven mechanical transforms.  
6. Update coffee simulation and spatial capture.  
7. Update liquid/steam/spill render geometry.  
8. Update camera and visual presentation.  
9. Render the scene.

Audio responds to domain events through its own scheduling service.

## **11.2 Important Ordering Rule**

Cup position must be current before calculating liquid capture for that simulation step.

Otherwise a moved cup may visibly receive coffee based on its previous position.

## **11.3 Frame Ownership**

Prefer one orchestration entry point instead of many unrelated `useFrame` callbacks whose order accidentally determines behavior.

Individual visual components may still use `useFrame` for local presentation, but authoritative domain progression and geometric capture must have deliberate ordering.

## **11.4 Performance**

The frame pipeline must avoid:

* Creating new vectors every frame.  
* Creating new materials every frame.  
* React state updates every frame.  
* Unnecessary allocations.  
* Repeated full-scene traversal.  
* Uncontrolled raycasts.  
* Duplicate animation updates.

Reusable vectors, matrices, and temporary buffers should be allocated once.

---

# **12\. GLB Asset Contract**

## **12.1 Asset Authority**

The production GLB is generated from the approved Blender source.

Its final structure must follow the validated Document 02 asset contract.

## **12.2 Required Roots**

The proposed root structure is:

* `RitualAssetRoot`  
* `MachineRoot`  
* `BeanPropRoot`  
* `CupRoot`  
* `SceneAnchors`

The asset loader must not rely on a previous implementation's node names.

## **12.3 Required Interactive Nodes**

The validation manifest must include:

* `HopperLidPivot`  
* `HopperLid`  
* `PowerButtonPivot`  
* `PowerButton`  
* `MakeButtonPivot`  
* `MakeButton`  
* `PourButtonPivot`  
* `PourButton`  
* `BeanContainer`  
* `CupBody`

## **12.4 Required Spatial Anchors**

At minimum:

* `HopperOpeningAnchor`  
* `HopperBeanTarget`  
* `BeanPourAnchor`  
* `BeanPourTargetAnchor`  
* `CupStartAnchor`  
* `CupPlacementAnchor`  
* `CupMouthAnchor`  
* `CupInnerBottomAnchor`  
* `CupFillMaxAnchor`  
* `CoffeeExitAnchor`  
* `SpillSurfaceAnchor`  
* `MachineFocusAnchor`  
* `HopperFocusAnchor`  
* `PourFocusAnchor`

If the final nozzle design uses multiple exits, validate the approved per-nozzle anchors instead.

## **12.5 Asset Manifest**

The application must define a typed manifest containing:

* Asset URL.  
* Asset version.  
* Required node names.  
* Optional node names.  
* Expected spatial units.  
* Expected forward/up orientation.  
* Required anchor names.  
* Material identifiers where necessary.  
* Expected root structure.

## **12.6 Loading**

Use a compatible glTF loader through Drei or React Three Fiber.

Load the GLB once and reuse references.

Do not independently load the same file in multiple components.

## **12.7 Validation**

Immediately after loading:

1. Traverse the imported node hierarchy once.  
2. Build a name-to-object lookup.  
3. Verify all required nodes.  
4. Verify required anchors.  
5. Check root transforms.  
6. Check major spatial relationships.  
7. Validate finite numeric transforms.  
8. Report structural errors.

## **12.8 Failure Policy**

Missing required interactive nodes are integration errors.

Do not silently continue with an apparently working but incomplete machine.

A development build should provide a precise diagnostic describing the missing contract.

A production build should enter a recoverable failure state rather than exposing broken controls.

## **12.9 Scale**

Use physical meters.

Do not guess the machine's scale from a bounding box containing the machine, bean supply, and cup.

The verified asset convention controls placement.

## **12.10 Transform Ownership**

Avoid multiple systems writing the same transform.

Examples:

* Hopper-motion controller owns the lid pivot.  
* Button-motion controller owns button pivots.  
* Cup-drag controller owns the cup's world position during dragging.  
* Bean-transfer motion controller owns the bean prop while transferring.  
* Reset coordinator temporarily owns restoration of these transforms.

Explicit ownership transfers are necessary to avoid animation conflicts.

---

# **13\. Scene Graph Architecture**

## **13.1 Scene Responsibilities**

The scene renders:

* Product machine.  
* Ingredient prop.  
* Cup.  
* Stage environment.  
* Lighting.  
* Shadows.  
* Dynamic effects.

## **13.2 Declarative vs Imperative Updates**

Use React Three Fiber declaratively for:

* Scene structure.  
* Mesh mounting.  
* Material configuration.  
* Light configuration.  
* Stable component composition.

Use imperative Three.js updates for:

* Pointer-driven transforms.  
* Procedural vibration.  
* Animated geometry buffers.  
* Dynamic liquid surfaces.  
* Camera transitions.  
* High-frequency material uniforms.

## **13.3 Persistent Objects**

Keep major scene objects mounted.

Do not repeatedly mount and unmount complex geometry for every machine-state change.

Where appropriate, use visibility and material changes instead.

## **13.4 Object Identity**

Stable object references are important.

The same cup should persist through movement, filling, completion, and reset.

It should not be replaced with a newly created object during normal interaction.

## **13.5 Component Boundaries**

The `Machine` scene component should not independently implement all machine behavior.

It is a visual assembly.

Its controllers respond to domain events and input.

Likewise, `Cup` must not own the authoritative coffee-volume model.

---

# **14\. Rendering Pipeline**

## **14.1 Renderer**

Use Three.js WebGLRenderer through React Three Fiber.

WebGL 2 is the baseline rendering requirement.

## **14.2 Canvas**

The canvas occupies the available viewport.

The scene remains a single immersive presentation.

It does not require traditional page scrolling.

## **14.3 Pixel Ratio**

Use a bounded device pixel ratio.

A starting range is:

**DPR 1.0–2.0**

The quality system may reduce DPR under sustained GPU pressure.

Avoid rendering at unnecessarily high pixel density on very high-resolution displays.

## **14.4 Antialiasing**

Use appropriate antialiasing based on hardware performance and the selected postprocessing pipeline.

Do not apply redundant expensive antialiasing techniques.

## **14.5 Tone Mapping**

Use one consistent filmic tone-mapping strategy.

The exact exposure should be calibrated against the final materials and lighting.

Avoid stacking multiple color-transform passes.

## **14.6 Color Management**

Maintain a physically coherent color workflow.

Key requirements:

* Linear working color space for lighting calculations.  
* Correct sRGB treatment of color textures.  
* Correct treatment of non-color data maps.  
* Appropriate final output color conversion.  
* No accidental double-gamma or double-output transforms.

Custom shaders must participate correctly in the renderer's color-management pipeline.

## **14.7 Shadows**

Use shadows deliberately.

Prioritize:

* Machine grounding.  
* Cup grounding.  
* Bean container contact.  
* Major structural shadows.

Avoid expensive shadow casting from every small bean or invisible internal component.

## **14.8 Reflections**

The metallic fascia and hopper require believable reflections.

Use a controlled environment/reflection strategy.

Reflection quality may adapt according to device performance.

## **14.9 Postprocessing**

The baseline pipeline may include:

* Subtle tone mapping.  
* Minimal vignette if justified.  
* Selective restrained bloom.  
* Optional mild depth of field.

Each pass must be visually justified and profiled.

## **14.10 No Heavy Default Effects**

The initial implementation should achieve good visual quality through geometry, materials, lighting, and composition before adding expensive postprocessing.

---

# **15\. Input System Architecture**

## **15.1 Input Philosophy**

Input must translate visitor gestures into clear physical intentions.

The normal experience uses no conventional interface controls.

## **15.2 Input Sources**

Primary:

* Mouse.  
* Trackpad pointer.

Secondary if implemented:

* Touch.

Operator:

* Keyboard reset command.

## **15.3 Pointer Coordinator**

A central input coordinator determines which system owns the active pointer.

Possible owners:

* None.  
* Camera orbit.  
* Hopper interaction.  
* Bean drag.  
* Cup drag.  
* Physical button press.

## **15.4 Ownership Rule**

A pointer cannot simultaneously drag a cup and orbit the camera.

Object interaction takes priority.

## **15.5 Raycasting**

Use raycasting against approved interactive geometry or invisible hit proxies.

The target hierarchy should resolve child hits to their intended interactive parent.

For example, a raycast against cup-handle geometry should select the cup.

## **15.6 Input Priority**

Priority:

1. Active object drag.  
2. Physical controls.  
3. Camera exploration.

## **15.7 Pointer Capture**

Capture the pointer during dragging where supported.

If pointer capture is lost, cancel safely.

## **15.8 Drag Start Threshold**

Use a small movement threshold to distinguish intentional dragging from a click.

A preliminary pointer threshold of approximately 4–6 CSS pixels is reasonable for desktop.

The threshold should be tuned during usability testing.

## **15.9 Pointer Exit**

If the pointer leaves the canvas:

* Continue safely if pointer capture remains valid.  
* Otherwise terminate or cancel the active gesture.  
* Never leave a drag permanently active.

## **15.10 No Accidental Double Actions**

One pointer gesture must not produce multiple button commands.

Prevent click propagation from nested mesh interactions.

Use consistent pointer-down/up semantics and command debouncing.

---

# **16\. Hopper Controller**

## **16.1 Responsibility**

The hopper controller translates lid interaction into a guarded domain command and controlled hinge animation.

## **16.2 Trigger**

A click on the hopper lid requests either `OPEN_HOPPER` or `CLOSE_HOPPER`.

## **16.3 Validation**

The domain determines whether hopper interaction is permitted.

The controller does not independently decide the machine's processing state.

## **16.4 Animation**

Use a named hinge pivot from the GLB.

The animation targets the approved open or closed orientation.

## **16.5 Latest Valid Target**

During an ongoing hinge animation, a new valid click may reverse the target.

The previous tween must be retargeted or cancelled safely.

The new animation begins from the current transform.

## **16.6 Transfer Lock**

The lid cannot close during a committed bean-transfer animation.

## **16.7 Completion Signal**

When the lid reaches its target pose, the controller reports stable completion.

Brewing guards must not treat a partially closed lid as fully closed.

## **16.8 Reset**

Reset kills active lid animation and restores the exact closed transform.

---

# **17\. Bean Transfer Controller**

## **17.1 Responsibility**

Manage the direct manipulation and physical transfer of the bean supply.

## **17.2 Interaction Model**

Use constrained drag-to-transfer, followed by a guided animation once a valid release occurs.

## **17.3 Drag Representation**

Track:

* Active pointer ID.  
* Starting object transform.  
* Starting pointer projection.  
* Current target position.  
* Drag phase.  
* Current session generation.

## **17.4 World-Space Mapping**

Map pointer movement onto a controlled plane or suitable interaction surface.

The mapping must remain stable across camera angles.

Avoid deriving drag motion solely from changes in screen-space X/Y without accounting for camera perspective.

## **17.5 Spatial Constraints**

Prevent the container from:

* Passing through the machine.  
* Leaving reachable scene bounds.  
* Becoming stuck behind geometry.  
* Rotating unpredictably.

## **17.6 Target Validation**

Successful release requires the bean pour anchor to enter a forgiving region near the open hopper.

The domain then checks:

* Hopper fully open.  
* Bean supply available.  
* No active processing.  
* No conflicting transfer.

## **17.7 Guided Completion**

Once accepted:

1. Release pointer ownership.  
2. Move container into the final pour pose.  
3. Tilt container.  
4. Emit the visual bean transfer.  
5. Settle beans in hopper.  
6. Complete logical transfer.  
7. Return emptied container to rest.

## **17.8 Cancellation**

An invalid or interrupted drag restores the supply to its initial position.

No beans are consumed.

## **17.9 Duplicate Prevention**

Once the transfer is committed, repeated pointer interactions must not duplicate it.

## **17.10 Reset**

Cancel all active tweens, particles, and transfer callbacks.

Restore the original full supply and empty hopper visuals.

---

# **18\. Cup Drag Controller**

## **18.1 Responsibility**

Handle constrained cup movement on the supporting surface.

## **18.2 Position Authority**

Cup spatial position is owned by the interaction controller and committed to the experience engine.

The cup visual transform and logical position must remain synchronized.

## **18.3 Drag Plane**

Use the actual cup-supporting surface as the reference.

The cup remains upright.

## **18.4 Raycasting Technique**

Use a stable mathematical drag plane or equivalent geometry reference.

Do not rely on the pointer remaining over the cup mesh after dragging begins.

## **18.5 Position Mapping**

Calculate pointer movement in world space.

Transform it into the appropriate scene-parent coordinate space.

## **18.6 Constraints**

Clamp movement to the permitted placement area.

Avoid arbitrary one-axis restriction unless the approved stage geometry truly requires it.

The preferred model supports sensible horizontal movement across the cup platform.

## **18.7 Collision Avoidance**

Use a simple permitted movement region or exclusion volume to prevent the cup passing through the machine.

A full physics engine is unnecessary.

## **18.8 Small Alignment Assistance**

When the released cup is extremely close to the ideal destination, a short settling adjustment may be applied.

Do not automatically align a badly positioned cup.

## **18.9 During Pouring**

The controller remains active during `POURING`.

Liquid capture must use the cup's current position.

The stream remains attached to the machine outlet.

## **18.10 Filled Cup**

The cup retains its existing liquid volume when moved.

The fill geometry follows the cup transform.

## **18.11 Reset**

Cancel dragging and restore the exact starting position.

---

# **19\. Spatial Capture System**

## **19.1 Purpose**

Determine how much coffee enters the cup based on physical alignment.

## **19.2 Authoritative Inputs**

The spatial capture system reads:

* Coffee exit anchor.  
* Stream direction.  
* Stream effective radius.  
* Cup mouth center.  
* Cup mouth normal.  
* Cup effective interior radius.  
* Current cup transform.

## **19.3 Basic Capture Geometry**

For the baseline upright cup, project the stream footprint and cup opening into the horizontal receiving plane.

Let:

* `d` \= horizontal distance between footprint centers.  
* `R` \= effective cup mouth radius.  
* `S` \= effective stream radius.

Full capture when:

`d ≤ R − S`

No capture when:

`d ≥ R + S`

Partial capture occurs between those limits.

## **19.4 Partial Capture**

Use a smooth geometric overlap function.

The preferred implementation calculates the approximate area of overlap between the stream footprint and cup opening.

Normalize by the stream footprint area.

This produces:

`captureFraction ∈ [0, 1]`

## **19.5 Simplified Approximation**

If exact circle-overlap calculation offers no perceptible advantage, a calibrated smoothstep approximation is acceptable.

However, the approximation must preserve:

* Full capture near center.  
* Smooth transition near the rim.  
* Zero capture beyond the mouth.  
* Continuous response while moving the cup.

## **19.6 World Transform Updates**

Always update required world matrices before evaluating spatial capture.

Do not assume that the cup's local position equals its world position.

## **19.7 Multiple Outlet Geometry**

The concept allows the source model to contain one or more physical nozzle exits.

The baseline implementation should use one logical aggregate dispensing stream unless the final approved asset requires two distinct visible streams.

If two streams are rendered, their individual capture fractions and flow shares must sum to the same total prepared-coffee volume.

Do not duplicate coffee quantity per nozzle.

---

# **20\. Liquid Simulation & Volume Accounting**

## **20.1 Core Requirement**

Liquid appearance and liquid quantity must agree.

The simulation owns actual volume.

The renderers visualize it.

## **20.2 Baseline Model**

Use Document 03's normalized values:

| Parameter | Value |
| ----- | ----- |
| Cup capacity | 1.0 unit |
| Prepared batch | 1.30 units |
| Pour rate | 0.125 units/s |
| Full cup time | Approximately 8.0 s |
| Entire batch time | Approximately 10.4 s |

## **20.3 Authoritative Volume Fields**

The simulation tracks:

* `remainingVolume`  
* `inFlightVolume`  
* `cupVolume`  
* `missedVolume`  
* `overflowVolume`  
* `discardedVolume`  
* `totalReleasedVolume`

## **20.4 Why In-Flight Volume Exists**

A visible stream takes a short time to fall from the outlet to its receiving surface.

Stopping the outlet should not make liquid already in the air vanish.

Therefore, the implementation explicitly accounts for coffee currently in flight.

This refines the transient rendering behavior while preserving the final accounting rules from Document 03\.

## **20.5 Conservation Rule**

At all times:

`preparedBatch = remaining + inFlight + cup + missed + overflow + discarded`

Within floating-point tolerance.

During a settled completed result, `inFlight` must return to zero.

## **20.6 Emission Update**

When `POURING`:

`emitted = min(pourRate × dt, remainingVolume)`

Then:

* Decrease remaining volume.  
* Increase in-flight volume.  
* Create or extend the corresponding visual stream.

## **20.7 Arrival Update**

When emitted liquid reaches the receiving plane:

1. Evaluate the current spatial capture relationship.  
2. Divide the arriving volume into potential captured and missed quantities.  
3. Apply remaining cup capacity.  
4. Allocate excess captured volume to overflow.  
5. Reduce in-flight volume.

## **20.8 Cup Movement During Flight**

The receiving outcome should be evaluated at the time the liquid arrives, using the cup's then-current position.

This supports believable cup movement under an active stream.

## **20.9 In-Flight Representation**

A small ring buffer or queue of emitted volume parcels may be used.

Each parcel records:

* Amount.  
* Emission time.  
* Approximate arrival time.  
* Source position or relevant trajectory data.

A detailed particle-per-milliliter simulation is unnecessary.

## **20.10 Fall Time**

Approximate physical fall time from the nozzle to the receiving surface using distance and gravitational acceleration, then tune within the visually plausible range.

The liquid renderer should agree with this transit behavior.

## **20.11 Cup Capacity**

Retained cup volume cannot exceed `1.0` normalized unit.

Excess incoming captured liquid contributes to overflow.

## **20.12 Missed Coffee**

Coffee falling outside the cup contributes to the surface spill amount.

## **20.13 Early Stop**

When the visitor stops pouring:

* New emission ends immediately.  
* Remaining prepared coffee is marked discarded/unavailable for the current cycle.  
* Existing in-flight coffee may finish falling.  
* The machine enters the completed state.  
* The visible result settles.

No new pouring can begin for that batch.

## **20.14 Batch Exhaustion**

When remaining prepared coffee reaches zero:

* New emission ends.  
* Existing in-flight coffee finishes arriving.  
* The cycle completes.  
* Volume accounting remains conserved.

## **20.15 Numerical Safety**

All operations must:

* Use finite values.  
* Clamp negative values caused by floating-point error.  
* Never exceed cup capacity.  
* Never create or destroy volume accidentally.  
* Remain independent of rendering frame rate.

---

# **21\. Coffee Stream Rendering**

## **21.1 Selected Technique**

Use lightweight procedural geometry with a physically responsive material.

A tapered tube or cylinder-based stream is suitable.

## **21.2 Geometry**

The stream should:

* Begin at the actual nozzle.  
* Extend toward its current receiving surface.  
* Have a narrow physically plausible diameter.  
* Possess subtle nonuniform shape.  
* Remain smooth at ordinary viewing distances.

## **21.3 Organic Variation**

Use restrained procedural variation in:

* Radius.  
* Surface contour.  
* Minor wobble.  
* Highlight movement.

Avoid strong wave distortion.

## **21.4 Rendering Method**

Prefer updating a preallocated geometry or shader uniforms rather than rebuilding complex mesh objects every frame.

## **21.5 Material**

Use a dark coffee-colored material with convincing highlights.

Custom shader treatment may be used if standard PBR materials do not produce sufficient visual quality.

## **21.6 Shader Color Management**

Custom shader output must remain compatible with the renderer's color-management and tone-mapping pipeline.

## **21.7 Startup**

The visible stream grows from the nozzle and reaches its receiving surface within the intended startup period.

The simulation must not fill the cup before liquid arrives.

## **21.8 Termination**

When emission stops, the stream should shrink or clear from the nozzle downward.

Any residual drops must correspond to liquid already emitted.

## **21.9 No Target Following**

The stream remains physically attached to the outlet.

Its path must not move sideways merely because the cup moves.

---

# **22\. Cup Fill & Surface Rendering**

## **22.1 Fill Geometry**

Render liquid inside the cup using geometry matched to the interior.

Avoid using an unconstrained cylinder that visibly cuts through the ceramic walls.

## **22.2 Volume-to-Height Mapping**

The cup's interior shape determines the relationship between retained volume and visible fill height.

For a straight cylindrical interior, a linear height mapping may be adequate.

For a tapered cup, use a geometry-informed mapping or calibrated lookup table.

## **22.3 Fill Body**

The fill body should remain inside the cup.

It must:

* Start empty.  
* Increase only when coffee is captured.  
* Respect maximum capacity.  
* Follow cup movement.  
* Remain visible through completion.  
* Reset to empty.

## **22.4 Surface**

The surface should include:

* Appropriate dark coffee material.  
* Readable glossy highlights.  
* Subtle meniscus behavior.  
* Small ripples near the impact point.

## **22.5 Ripple Implementation**

A lightweight shader or procedural surface displacement is appropriate.

The ripple intensity should respond to arriving liquid.

When pouring stops, ripples gradually settle.

## **22.6 Cup Movement**

The fill body and surface remain in the cup's local coordinate system.

The entire liquid representation follows the cup.

## **22.7 Reset**

Clear retained volume and restore initial geometry state.

Avoid disposing and recreating materials unnecessarily.

---

# **23\. Spill & Overflow Rendering**

## **23.1 Spill Model**

Surface spills derive from the simulation's missed volume.

## **23.2 Puddle Geometry**

Use a low-profile surface mesh or decal-like geometry.

The puddle should have:

* Slightly irregular outline.  
* Dark coffee coloration.  
* Wet specular response.  
* Gradual expansion.

## **23.3 Surface Placement**

Place spills on the actual stage geometry.

Prevent z-fighting.

Avoid appearing above the surface or embedded inside it.

## **23.4 Growth Mapping**

The visual puddle extent derives from accumulated spill volume.

The mapping may compress the represented physical area for artistic control, but cannot expand independently of volume.

## **23.5 Overflow Model**

Overflow derives from coffee attempting to enter an already full cup.

The renderer may show:

* Liquid passing the rim.  
* A small overflow streak.  
* Localized accumulation around the cup base.

## **23.6 Overflow vs Miss**

Differentiate:

* Coffee that never enters the cup.  
* Coffee that reaches the full cup and spills over.

The distinction matters for a coherent physical result.

## **23.7 Persistent Result**

Spills remain visible through `COMPLETE`.

They are cleared during reset.

## **23.8 Complexity Limit**

Do not implement full fluid spreading or fluid-solid simulation.

A visually convincing, volume-driven approximation is sufficient.

---

# **24\. Steam System**

## **24.1 Selected Technique**

Use a lightweight GPU-friendly particle or shader-based vapor effect.

## **24.2 Activation**

Steam activates when sufficient hot coffee has collected in the cup.

An empty cup should not emit steam.

## **24.3 Attachment**

Steam originates near the actual liquid surface.

The emitter follows the cup and its fill geometry.

## **24.4 Behavior**

Particles should:

* Rise slowly.  
* Drift laterally.  
* Expand.  
* Fade.  
* Exhibit restrained variation.

## **24.5 Performance**

Use a modest particle budget.

The quality manager may reduce or disable secondary steam particles on lower-performance devices.

## **24.6 Resource Lifecycle**

Create geometry and materials once where practical.

Do not allocate new particle geometry every frame.

## **24.7 Completion**

Steam may continue briefly after pouring ends.

It fades naturally or disappears during reset.

---

# **25\. Machine Motion System**

## **25.1 Purpose**

Present physically motivated operation without simulating the full internal mechanism.

## **25.2 Button Motion**

Use independent authored pivot animation.

Each button:

* Depresses along its local press axis.  
* Returns to rest.  
* Responds promptly.  
* Does not accidentally trigger duplicate commands.

## **25.3 Hopper Motion**

Animate the authored hinge pivot.

Use the easing and duration defined in Document 04\.

## **25.4 Grinding Vibration**

Apply restrained procedural motion to the appropriate machine assembly.

The amplitude should remain within the cinematic direction.

Avoid displacing the entire machine in a way that makes its base appear detached from the countertop.

## **25.5 Brewing Motion**

Use a distinct lower-intensity mechanical response.

It should not merely duplicate the grinding vibration.

## **25.6 Bean Consumption Visual**

During grinding, the hopper's loaded bean representation may diminish or change.

The effect must correspond to the committed batch.

## **25.7 State-Driven Animation**

Motion begins and ends through domain events.

The animation system must not decide that brewing is finished because one tween completed.

## **25.8 Animation Cleanup**

Every active animation must be cancellable.

Track GSAP timelines by controller and session.

On reset, terminate or revert relevant timelines and restore canonical transforms.

---

# **26\. Camera Architecture**

## **26.1 Camera Ownership**

Use one camera coordinator to manage:

* Manual orbiting.  
* Guided cinematic transitions.  
* Framing constraints.  
* Reset positioning.  
* User interruption.

## **26.2 Camera Rig**

The camera rig contains:

* Perspective camera.  
* OrbitControls or equivalent constrained controller.  
* Target-management logic.  
* Cinematic transition controller.

## **26.3 Manual Controls**

Implement:

* Restricted horizontal orbit.  
* Restricted vertical orbit.  
* Restricted distance.  
* Damping.  
* No free panning.

## **26.4 Initial Preset**

Use the approved hero composition from Document 04\.

The exact camera transform is calibrated from the asset's anchors and bounding geometry.

## **26.5 Semantic Targets**

Use the provided focus anchors:

* Machine.  
* Hopper.  
* Pour.

Do not derive all camera targets from the machine's overall bounding-box center.

## **26.6 Camera Event Responses**

React to domain events such as:

* `GRINDING_STARTED`  
* `BREWING_STARTED`  
* `COFFEE_READY`  
* `POUR_STARTED`  
* `CYCLE_COMPLETED`  
* `RESET_STARTED`

## **26.7 Transition Ownership**

Only one cinematic camera transition may own the camera at a time.

New transitions must retarget or cancel previous transitions safely.

## **26.8 Manual Override**

If the visitor begins orbiting:

* Cancel or yield the active cinematic transition.  
* Continue from the current camera transform.  
* Preserve control without snapping.  
* Do not alter machine state.

## **26.9 Object Drag Lock**

While a cup or bean drag is active, the camera does not receive that pointer's motion.

## **26.10 Large-Angle Protection**

Do not force dramatic camera travel from arbitrary visitor-selected angles.

If the intended cinematic preset would require a large unexpected rotation, reduce or skip it.

## **26.11 Reset**

Camera reset must coordinate with the scene's restoration transition.

It should not reveal inconsistent restored geometry.

## **26.12 Reduced Motion**

When reduced motion is preferred, disable nonessential cinematic camera movement.

Preserve functional orbiting and necessary physical feedback.

---

# **27\. Audio Architecture**

## **27.1 Selected Audio Engine**

Use a dedicated Web Audio service.

It owns:

* AudioContext lifecycle.  
* Asset loading and decoding.  
* Gain staging.  
* Loop playback.  
* One-shot playback.  
* Crossfades.  
* Spatial panning where useful.  
* Reset cleanup.  
* Audio suspension and resume.

## **27.2 Audio Asset Strategy**

Use high-quality recorded sounds for recognizably physical events where suitable assets can be obtained.

Procedural audio may supplement:

* Subtle motors.  
* Continuous texture variation.  
* Small transitional cues.

Do not rely on simplistic synthetic noise for every sound merely to avoid sourcing audio.

## **27.3 Sound Manifest**

Each sound definition should include:

* Event identifier.  
* File URL.  
* Looping policy.  
* Default gain.  
* Fade duration.  
* Spatial category.  
* Maximum concurrent voices.  
* Optional alternate samples.

## **27.4 Audio Events**

Sound playback must be triggered by domain or physical animation events.

Examples:

* Button actuation.  
* Lid closure.  
* Bean impacts.  
* Grinding start/stop.  
* Brewing start/stop.  
* Pour start/stop.  
* Spill impact.

## **27.5 AudioContext Unlock**

Initialize or resume audio on the first valid user gesture as permitted by the browser.

Do not show a conventional "Enable Audio" interface during normal operation.

## **27.6 First-Interaction Behavior**

If the first pointer action unlocks audio too late for its initial cue, skip or gracefully handle that cue.

Never block the action itself.

## **27.7 Loop Ownership**

Each continuous sound has one owning machine state.

Grinding loop belongs to grinding.

Brewing loop belongs to brewing.

Pouring loop belongs to dispensing.

## **27.8 Loop Transitions**

Use short, controlled gain transitions.

Avoid abrupt clicks or sustained overlapping machinery sounds after state changes.

## **27.9 Mixing**

Use gain buses such as:

* Master.  
* Interaction.  
* Machine.  
* Liquid.  
* Atmosphere.

Calibrate against the actual exhibition speakers.

## **27.10 Concurrency**

Prevent repeated button input from creating overlapping copies of the same sustained sound.

Limit simultaneous one-shot voices where appropriate.

## **27.11 Visibility Handling**

Suspend or mute audio when the experience is suspended.

Resume only when allowed by the browser.

## **27.12 Reset**

Stop and release all session-owned audio playback.

The AudioContext itself may remain available for the next visitor, but no old sound may continue.

## **27.13 Audio Failure**

If audio fails, the experience remains visually functional.

Audio errors must not cause the machine state to become stuck.

---

# **28\. Session Lifecycle & Reset**

## **28.1 Reset Is a First-Class System**

Reset must be designed into the architecture from the beginning.

It cannot be added later as a collection of unrelated manual assignments.

## **28.2 Reset Triggers**

From Document 03:

* Keyboard `R` at any state.  
* Power in `COMPLETE`.  
* Completion inactivity: 20 seconds.  
* Ready-to-pour inactivity: 75 seconds.  
* Abandoned preparation inactivity: 90 seconds.  
* Extended hidden-tab interruption: over 60 seconds.

## **28.3 Reset Coordinator**

The session controller is responsible for starting reset and coordinating its completion.

## **28.4 Atomic Logical Reset**

The experience must establish a canonical fresh-state snapshot.

The reset system must not leave the machine partly reset while visitor input remains active.

## **28.5 Presentation Reset**

The visual restoration lasts approximately 1.3 seconds according to Document 04\.

During that interval, the scene may temporarily own object transforms to perform the restoration.

## **28.6 Reset Order**

The reset coordinator must:

1. Enter `RESETTING`.  
2. Reject normal commands.  
3. Increment the session generation.  
4. Cancel pending scheduled process activity.  
5. Stop audio.  
6. Stop liquid emission.  
7. Cancel object dragging.  
8. Cancel bean transfer.  
9. Cancel camera and object animations.  
10. Restore machine and prop transforms.  
11. Reset volumes.  
12. Reset hopper and ingredient visuals.  
13. Reset lights and effect uniforms.  
14. Restore the hero camera.  
15. Complete the visual transition.  
16. Re-enable interaction in `OFF`.

## **28.7 Canonical Initial Snapshot**

Store a factory function that creates fresh initial domain state.

Do not reuse a previously mutated object as the reset template.

## **28.8 Transform Restoration**

Capture or define immutable canonical transforms for:

* Machine root.  
* Hopper lid.  
* Three buttons.  
* Bean container.  
* Cup.  
* Camera.  
* Any required movable visual components.

## **28.9 Idempotency**

Calling reset several times must produce the same final initial condition.

It must not create duplicate animation chains or lose references.

## **28.10 Generation Safety**

Every deferred callback must verify that it belongs to the current generation.

A callback from a previous brewing sequence cannot mark the new session as ready.

## **28.11 Reset During Drag**

Release pointer capture and clear active input ownership before restoring the object.

## **28.12 Reset During Pour**

Stop new emission immediately.

Clear in-flight parcels and all coffee accounting as part of the reset.

## **28.13 Reset During Camera Transition**

Cancel cinematic camera motion.

Restore from the current transform without snapping through geometry.

---

# **29\. Inactivity & Exhibition Operation**

## **29.1 Meaningful Interaction**

Update the interaction clock for:

* Valid clicks.  
* Physical object dragging.  
* Camera exploration.  
* Cup movement.  
* Hopper activity.  
* Bean transfer.  
* Significant visitor commands.

Do not update it continuously because the scene is rendering.

## **29.2 Abandoned Preparation**

After 90 seconds of visitor inactivity, reset a modified prebrewing session.

An untouched OFF scene does not need a reset animation.

## **29.3 Prepared Coffee Waiting**

In `READY_TO_POUR`, reset after 75 seconds of inactivity.

## **29.4 Completion**

In `COMPLETE`, reset after 20 seconds without meaningful input.

Cup inspection or manual camera movement may restart the completion inactivity countdown.

## **29.5 Active Processing**

Do not reset during grinding or brewing merely because the visitor does not click.

These are intentionally machine-controlled stages.

## **29.6 Active Pour**

The batch is finite.

The stream automatically ends when the batch is exhausted.

An additional inactivity timer during active pouring is unnecessary.

## **29.7 Operator Mode**

Support nonvisual operator controls such as:

* Keyboard reset.  
* Diagnostic reporting.  
* Build/version identification.

These may be available through a development-only console or explicitly gated diagnostic mode.

They must not become part of the visitor-facing artistic scene.

---

# **30\. Browser Visibility & Interruption Handling**

## **30.1 Visibility Events**

Listen for browser visibility changes.

On hide:

* Suspend simulation advancement.  
* Pause or suspend audio.  
* Stop processing rendering deltas as active simulation time.  
* Record a monotonic visibility timestamp.

## **30.2 Short Interruption**

If hidden for no more than 60 seconds:

* Restore rendering on return.  
* Avoid any accumulated simulation jump.  
* Resume the current session coherently.  
* Resume audio when permitted.

## **30.3 Extended Interruption**

If hidden for over 60 seconds:

* Reset to the canonical initial condition when visible again.  
* Do not resume a stale partially completed machine sequence.

## **30.4 Window Blur**

Window blur without document visibility change should not automatically destroy the session.

Input capture may need cancellation for safety.

## **30.5 Resize**

Viewport resize must adjust camera framing and renderer dimensions without changing domain state or coffee volume.

## **30.6 WebGL Context Loss**

On context loss:

* Suspend simulation.  
* Stop or suspend audio.  
* Prevent new interactions.  
* Attempt recovery through the rendering framework.

After context restoration, validate GPU resources and prefer a clean initial session.

## **30.7 Failed Recovery**

If the rendering context cannot recover, enter the fatal application state and provide a minimal technical recovery path.

---

# **31\. Error Handling**

## **31.1 Error Categories**

Distinguish:

* Asset loading failure.  
* Asset contract mismatch.  
* Audio initialization failure.  
* Rendering capability failure.  
* WebGL context failure.  
* Invalid domain command.  
* Numerical simulation failure.  
* Unexpected application exception.

## **31.2 Recoverable Errors**

Recoverable errors should not necessarily interrupt the visitor.

Examples:

* Audio unavailable.  
* Optional postprocessing failure.  
* Missing optional atmosphere asset.

Use a safe fallback when possible.

## **31.3 Fatal Errors**

Fatal errors include:

* Essential model missing.  
* Essential interactive hierarchy invalid.  
* No usable WebGL context.  
* Unrecoverable machine-state corruption.

## **31.4 Error Boundary**

Use a React error boundary for application rendering failures.

However, domain errors and asset validation must also have explicit handling outside React render exceptions.

## **31.5 Logging**

In development, log:

* State transitions.  
* Rejected commands.  
* Asset validation results.  
* Reset reasons.  
* WebGL errors.  
* Unexpected simulation values.

Production logging should remain minimal and avoid excessive console noise.

## **31.6 Recovery Philosophy**

A fatal failure must be reported clearly to an exhibition operator.

This is an exceptional technical state, not part of the no-UI artistic presentation.

---

# **32\. Quality Adaptation**

## **32.1 Objective**

Preserve interaction correctness while adapting optional visual quality to hardware.

## **32.2 Initial Quality Levels**

Define internal tiers:

* High.  
* Medium.  
* Low.

## **32.3 High**

Preferred full-quality presentation:

* Appropriate DPR.  
* Full approved shadows.  
* Quality reflections.  
* Complete liquid shading.  
* Steam.  
* Restrained postprocessing.

## **32.4 Medium**

Reduce:

* Shadow resolution.  
* Reflection resolution.  
* Secondary particles.  
* Optional postprocessing.  
* DPR if necessary.

## **32.5 Low**

Preserve:

* Full machine geometry.  
* Interactions.  
* Main lighting.  
* Coffee stream.  
* Cup fill.  
* Essential spill feedback.

Reduce or disable:

* Optional atmospheric particles.  
* Expensive reflection updates.  
* Nonessential postprocessing.  
* Excessive secondary effects.

## **32.6 Runtime Adaptation**

A quality manager may monitor sustained frame performance and reduce costly settings.

Avoid aggressive quality oscillation.

Use hysteresis or minimum intervals between quality changes.

## **32.7 Behavioral Invariance**

Quality settings must never alter:

* Timing of grinding.  
* Brewing duration.  
* Bean-transfer validity.  
* Cup capture geometry.  
* Coffee volume.  
* Pour stop behavior.  
* Reset semantics.

Visual fidelity can vary.

The physical and behavioral contract cannot.

---

# **33\. Performance Engineering**

## **33.1 Target**

Prefer stable 60 FPS on the approved exhibition hardware where feasible.

The final target must be validated on the actual device.

## **33.2 Performance Metrics**

Measure:

* Average FPS.  
* Frame-time distribution.  
* 1% low frame performance where practicable.  
* CPU time.  
* GPU rendering cost where tooling permits.  
* Draw calls.  
* Triangle count.  
* Texture memory.  
* Renderer resource counts.  
* Asset loading time.  
* Memory behavior across repeated cycles.

## **33.3 Frame Budget**

At 60 FPS, the total frame budget is approximately 16.7 milliseconds.

Rendering, simulation, input, camera, and effects must fit within a reasonable budget.

## **33.4 Draw Calls**

Reduce unnecessary draw calls through material reuse, geometry reuse, and appropriate instancing.

Avoid splitting a simple product surface into many unnecessary meshes.

## **33.5 Geometry**

Preserve silhouette quality while simplifying details that do not contribute visibly.

## **33.6 Materials**

Reuse material instances where appropriate.

Avoid runtime recreation of physical materials during state changes.

## **33.7 Textures**

Use compressed textures only when supported and beneficial.

Ensure any necessary decoders are correctly configured.

## **33.8 Shadows**

Reserve expensive shadow work for important geometry.

Avoid high-resolution dynamic shadows from every minor mesh.

## **33.9 Reflections**

Use efficient environment reflections.

Do not update reflection probes every frame unless a measured visual need justifies it.

## **33.10 Realtime Effects**

Reuse buffers and uniforms.

Avoid geometry allocation inside `useFrame`.

## **33.11 React Rendering**

Avoid routing high-frequency simulation updates through React render cycles.

Use direct Three.js updates for continuous movement.

## **33.12 Profiling Order**

Optimize in this order:

1. Verify correctness.  
2. Measure actual bottlenecks.  
3. Identify expensive scene passes.  
4. Remove unnecessary work.  
5. Reduce expensive geometry/materials.  
6. Optimize realtime effects.  
7. Introduce quality tiers if necessary.  
8. Re-measure.

Do not degrade visible quality based on arbitrary assumptions.

---

# **34\. Accessibility & Input Resilience**

## **34.1 Philosophy**

The active visual experience remains UI-free.

However, technical accessibility and input reliability should not be ignored.

## **34.2 Reduced Motion**

Respect `prefers-reduced-motion` where available.

Reduce:

* Guided camera moves.  
* Decorative atmospheric animation.  
* Nonessential visual movement.

Retain necessary mechanical interaction feedback.

## **34.3 Color Independence**

Machine readiness and operation must not depend exclusively on a subtle color change.

Physical motion and sound should reinforce important changes.

## **34.4 Audio Independence**

A visitor should still be able to complete the experience with audio unavailable.

## **34.5 Pointer Targets**

Interactive hit regions must be usable on the target desktop display.

Small meshes may use invisible enlarged hit proxies.

## **34.6 Keyboard Accessibility**

The exhibition's primary interaction mode is pointer-based.

A full keyboard-only simulation is not part of the baseline artistic interaction, but nonvisual accessibility accommodations should be evaluated before public release.

These accommodations must not introduce an always-visible conventional UI.

## **34.7 Touch**

Touch support is secondary.

If included, pointer ownership must prevent a cup drag and camera gesture from responding to the same pointer.

---

# **35\. Testing Architecture**

## **35.1 Testing Philosophy**

The most important logic must be testable without a browser or WebGL renderer.

Domain behavior should not require mounting the 3D scene.

## **35.2 Unit Tests**

Use Vitest for:

* Machine guards.  
* Valid transitions.  
* Invalid transitions.  
* Preparation sequence.  
* Coffee volume accounting.  
* Cup capture.  
* Finite batch exhaustion.  
* Reset.  
* Session generation safety.

## **35.3 Deterministic Time Tests**

Use controlled simulation advancement.

Verify exact stage boundaries:

* 4.0 seconds grinding.  
* 1.2 seconds transition.  
* 4.2 seconds brewing.  
* Ready-to-pour after the complete process.

No tests should require sleeping for the full physical duration.

## **35.4 Spatial Tests**

Test:

* Full capture.  
* Partial capture.  
* No capture.  
* Movement across thresholds.  
* Cup boundary constraints.  
* Valid bean-transfer target.  
* Invalid bean-transfer target.

## **35.5 Volume Tests**

Verify:

* Initial batch is 1.30 units.  
* Cup capacity is 1.0.  
* Flow never exceeds remaining volume.  
* Captured volume does not exceed capacity.  
* Overflow derives from excess captured liquid.  
* Missed volume derives from noncapture.  
* In-flight volume settles correctly.  
* Early-stop discarded volume is accounted for.  
* Total volume remains conserved.

## **35.6 Reset Tests**

Verify reset from every state.

Also verify reset:

* During lid movement.  
* During bean transfer.  
* During cup dragging.  
* During grinding.  
* During brewing.  
* During pouring.  
* During camera movement.  
* During audio playback.

## **35.7 Integration Tests**

Test command-to-presentation connections:

* Power event starts relevant animation/audio.  
* Make starts one process.  
* Brewing completion creates one batch.  
* Pour activates the liquid renderer.  
* Cup movement changes capture.  
* Reset clears active controllers.

## **35.8 Browser End-to-End Tests**

Use Playwright to exercise the experience in a real browser.

Test:

* Loading.  
* Input.  
* Primary visitor journey.  
* Repeated clicks.  
* Dragging.  
* Reset.  
* Window resize.  
* Visibility changes.  
* Browser errors.

## **35.9 WebGL Test Environment**

Automated browser environments may differ from the exhibition GPU.

Headless rendering results should not be treated as final proof of visual quality.

Use automated screenshots as regression evidence and manual review on the target hardware for artistic acceptance.

## **35.10 Visual Regression**

Capture stable reference images for:

* Hero.  
* Hopper open.  
* Bean transfer.  
* Grinding.  
* Brewing.  
* Ready-to-pour.  
* Coffee stream.  
* Cup fill.  
* Spill.  
* Overflow.  
* Completion.  
* Reset.

Control camera, viewport, animation time, and random seeds where possible.

## **35.11 Sound Testing**

Audio correctness must be checked through event/lifecycle tests and listening review.

Automated tests cannot fully judge whether grinding, brewing, and ceramic contact sound believable.

---

# **36\. Core Test Scenarios**

| ID | Test | Expected outcome |
| ----- | ----- | ----- |
| T-001 | Fresh load | Canonical OFF state |
| T-002 | Open hopper before power | Allowed |
| T-003 | Add beans before power | Allowed |
| T-004 | Make without beans | Rejected |
| T-005 | Make with open hopper | Rejected |
| T-006 | Make with valid preparation | Starts grinding |
| T-007 | Repeated Make | No duplicate process |
| T-008 | Grinding elapsed | Enters transition |
| T-009 | Pause elapsed | Enters brewing |
| T-010 | Brewing elapsed | Enters ready |
| T-011 | Pour before ready | Rejected |
| T-012 | Pour when ready | Starts emission |
| T-013 | Cup centered | Full capture |
| T-014 | Cup at rim boundary | Partial capture |
| T-015 | Cup away | Surface miss |
| T-016 | Move cup during pour | Dynamic capture |
| T-017 | Cup reaches capacity | Overflow begins |
| T-018 | Batch empties | Pour ends automatically |
| T-019 | Second Pour press | Ends current batch |
| T-020 | Early stop | Unused volume unavailable |
| T-021 | Reset during brewing | No stale completion |
| T-022 | Reset during pour | Clears coffee and effects |
| T-023 | Reset twice | Same initial result |
| T-024 | Hidden tab briefly | No simulation jump |
| T-025 | Hidden tab over 60 s | Reset |
| T-026 | Ready inactivity | Reset after 75 s |
| T-027 | Complete inactivity | Reset after 20 s |
| T-028 | Pointer capture lost | Drag safely ends |
| T-029 | Manual orbit during camera tween | Manual control wins |
| T-030 | Ten consecutive cycles | No state/resource accumulation |

---

# **37\. Development Tools & Diagnostics**

## **37.1 Development Mode**

Provide internal tooling for efficient testing and debugging.

It must not appear in the normal exhibition experience.

## **37.2 Domain Inspector**

A development-only inspector may show:

* Machine state.  
* Hopper state.  
* Beans loaded.  
* Cup position.  
* Capture fraction.  
* Remaining volume.  
* Cup volume.  
* Spill.  
* Overflow.  
* Session generation.  
* Last interaction time.

## **37.3 Spatial Helpers**

Development mode may display:

* Hopper transfer target.  
* Cup placement target.  
* Coffee exit anchor.  
* Cup mouth circle.  
* Dragging bounds.  
* Camera targets.  
* Spillage region.

These must be hidden in production.

## **37.4 Time Controls**

Development tooling should allow controlled progression through grinding and brewing.

This enables repeatable visual review without waiting through the entire process for every change.

## **37.5 Reset Controls**

Development tools may expose a reset command and direct state navigation for testing.

These bypasses must not become visitor-facing capabilities.

## **37.6 Deterministic Randomness**

Use seeded randomness for effects where it benefits reproducible testing.

Production effects may still use natural variation.

---

# **38\. Build & Development Workflow**

## **38.1 Package Manager**

Use one package manager consistently.

The selected default is npm unless a deliberate project-wide change is made.

Commit the associated lockfile.

## **38.2 TypeScript**

Enable strict typing.

Avoid widespread `any` in:

* Domain state.  
* Commands.  
* Events.  
* Three.js object references.  
* Pointer interaction.  
* Asset manifests.

Use explicit types and validated narrowing.

## **38.3 Code Quality**

Configure:

* Type checking.  
* Linting.  
* Formatting.  
* Unit tests.  
* Production build checks.

## **38.4 Required Scripts**

Recommended scripts:

{  
  "dev": "vite",  
  "build": "tsc \-b && vite build",  
  "preview": "vite preview",  
  "typecheck": "tsc \--noEmit",  
  "lint": "eslint .",  
  "test": "vitest run",  
  "test:watch": "vitest",  
  "test:e2e": "playwright test"  
}

The TypeScript configuration must ensure `typecheck` and `build` use compatible project settings.

Additional asset-validation and performance scripts may be included.

## **38.5 Environment Configuration**

Use configuration for:

* Asset base path.  
* Build diagnostics.  
* Development quality override.  
* Exhibition mode.  
* Optional deployment behavior.

Do not create a large environment-variable system for values that belong in typed application configuration.

## **38.6 Dependency Management**

Avoid unused dependencies.

Audit the package manifest before release.

Do not install alternative libraries that duplicate existing responsibilities without a clear reason.

---

# **39\. Deployment Architecture**

## **39.1 Deployment Model**

Ritual is a static client-side application.

It requires no backend server logic.

## **39.2 Production Output**

The Vite production build generates static deployable assets.

The final site should be hosted over HTTPS or through an appropriate local HTTP server for exhibition use.

Do not rely on opening the compiled application directly through `file://`.

## **39.3 Asset Paths**

Asset URLs must work under the selected deployment base path.

Avoid fragile root-relative paths if the application may be deployed under a subdirectory.

## **39.4 Asset Caching**

Use content-hashed build assets where supported.

Serve the HTML entry point with a cache policy that allows it to receive updated deployment references.

Long-lived immutable caching is suitable for correctly fingerprinted assets.

## **39.5 Exhibition Network Considerations**

The application must not require runtime access to third-party APIs.

All essential:

* Models.  
* Textures.  
* Audio.  
* Shader code.

Should be served with the application.

This allows deployment on an ordinary static host and facilitates a local exhibition setup if network connectivity is unreliable.

## **39.6 Local Exhibition Deployment**

A local HTTP server may serve the production build on the exhibition computer.

The setup must be documented and tested.

## **39.7 No Mandatory Service Worker**

A service worker is not required for the initial release.

It introduces additional caching and versioning complexity.

If fully offline browser access becomes an operational requirement, that capability must be designed and tested explicitly.

## **39.8 Fullscreen**

Fullscreen presentation may be enabled by the browser or exhibition operator.

The experience should adapt to fullscreen without changing its domain state.

## **39.9 Kiosk Behavior**

The final exhibition setup may use a fullscreen or kiosk browser configuration.

The application should not assume it can always enter fullscreen automatically without a permitted browser or operator action.

## **39.10 Release Identification**

Record the final release version and repository commit for exhibition handoff.

Operator diagnostics should make it possible to determine which build is running.

---

# **40\. Security & Privacy**

## **40.1 No Personal Data**

Ritual does not require collection of visitor personal information.

## **40.2 No Accounts**

No authentication or user-profile system is needed.

## **40.3 No External State**

Do not send machine interactions or visitor behavior to external services by default.

## **40.4 Asset Licensing**

All models, textures, fonts if any, and audio must be appropriately licensed or authored.

## **40.5 Third-Party Dependencies**

Use maintained dependencies from trusted sources.

Avoid unnecessary packages.

## **40.6 Browser Security**

Use an appropriate hosting configuration.

Do not expose development diagnostics unnecessarily in production.

A content security policy may be configured according to the final hosting environment, while preserving the application’s required WebGL and audio functionality.

## **40.7 Error Reporting**

Do not leak local file paths or sensitive development information to visitors in production error presentations.

---

# **41\. Implementation Sequence**

The recommended engineering order is as follows.

## **Phase 01 — Foundation**

Implement:

* Vite application.  
* TypeScript configuration.  
* React Three Fiber canvas.  
* Initial camera.  
* Basic stage.  
* Configuration modules.  
* Development tooling.

**Completion criterion:** Stable blank-stage runtime with working camera and renderer.

## **Phase 02 — Asset Integration**

Implement:

* Production GLB loading.  
* Asset manifest.  
* Node validation.  
* Machine placement.  
* Materials.  
* Lighting.  
* Cup and bean prop references.

**Completion criterion:** Correctly scaled and visually coherent physical scene.

## **Phase 03 — Domain Engine**

Implement:

* Typed machine state.  
* Commands.  
* Guards.  
* Events.  
* Session generation.  
* Initial state.  
* Process timeline.  
* Deterministic tests.

**Completion criterion:** Complete logical coffee-making process without requiring 3D rendering.

## **Phase 04 — Primary Physical Interactions**

Implement:

* Hopper.  
* Beans.  
* Cup dragging.  
* Buttons.  
* Input ownership.  
* Spatial validation.

**Completion criterion:** Visitors can physically prepare and operate the machine.

## **Phase 05 — Grinding & Brewing**

Implement:

* Process timeline.  
* Mechanical animation.  
* Relevant indicator feedback.  
* Preparation audio.  
* Camera response.

**Completion criterion:** Complete machine preparation sequence and stable ready-to-pour state.

## **Phase 06 — Liquid System**

Implement:

* Finite batch model.  
* Stream.  
* Cup capture.  
* Cup filling.  
* Pour start/stop.  
* Batch exhaustion.

**Completion criterion:** A coherent fully aligned coffee pour.

## **Phase 07 — Physical Consequences**

Implement:

* Partial capture.  
* Missed coffee.  
* Spill.  
* Overflow.  
* Moving cup during pour.  
* Steam.

**Completion criterion:** Every major pouring outcome behaves consistently.

## **Phase 08 — Reset & Recovery**

Implement:

* Operator reset.  
* Power completion reset.  
* Inactivity reset.  
* Visibility handling.  
* Animation cancellation.  
* Audio cancellation.  
* Canonical restoration.

**Completion criterion:** All states recover safely.

## **Phase 09 — Cinematic Refinement**

Refine:

* Material quality.  
* Product composition.  
* Lighting.  
* Camera choreography.  
* Animation easing.  
* Coffee rendering.  
* Steam.  
* Sound mixing.  
* Reset presentation.

**Completion criterion:** The experience meets Document 04's artistic direction.

## **Phase 10 — Production Validation**

Complete:

* Unit tests.  
* Integration tests.  
* End-to-end tests.  
* Visual regression.  
* Performance profiling.  
* Target-device review.  
* Production build.  
* Exhibition handoff.

**Completion criterion:** Approved exhibition-ready release.

---

# **42\. Engineering Risks & Mitigations**

| Risk | Engineering response |
| ----- | ----- |
| Machine state spread across components | Central authoritative engine |
| Overlapping timers | Single simulation clock |
| Duplicate Make actions | Guarded serial commands |
| Old callbacks after reset | Session generation and cancellation |
| Incorrect Blender hierarchy | Manifest-based asset validation |
| Wrong model scale | Verified meter-based asset convention |
| Cup dragging breaks at mesh boundary | Stable drag plane and pointer capture |
| Camera fights dragging | Central input ownership |
| Camera motion becomes aggressive | Camera coordinator and user override |
| Cup visually fills when misaligned | Geometry-derived capture |
| Coffee volume becomes inconsistent | Conserved finite-batch accounting |
| Liquid appears instantly in cup | In-flight volume/arrival model |
| Liquid mesh regenerated every frame | Persistent geometry and uniforms |
| Audio continues after reset | State-owned playback lifecycle |
| Dark scene becomes unreadable | Controlled color management and lighting |
| Excessive effects reduce FPS | Profiling and adaptive quality |
| Hidden tab advances simulation | Visibility-aware clock |
| GLB fails silently | Strict asset validation |
| Browser fails at exhibition | Tested local/static deployment and recovery procedure |
| Development tools leak into exhibit | Production gating |

---

# **43\. Engineering Acceptance Criteria**

## **43.1 Architecture**

* Domain logic is independent of rendering.  
* All machine transitions have one authoritative owner.  
* Interaction handlers issue commands.  
* Presentation systems respond to state/events.  
* No duplicate animation or audio authority exists.  
* Modules have clear responsibilities.

## **43.2 Asset Integration**

* Production GLB loads correctly.  
* All required interactive nodes are verified.  
* Spatial anchors are correct.  
* Machine scale is physically coherent.  
* Cup and bean supply are independent actors.  
* Missing essential nodes fail clearly.

## **43.3 State & Timing**

* Preparation-first works.  
* Power may toggle before brewing.  
* Make guards are correct.  
* Grinding/pause/brewing timings are deterministic.  
* One Make action creates one batch.  
* Pouring remains user-controlled.  
* Time simulation is frame-rate independent.  
* Hidden tabs do not create time jumps.

## **43.4 Input**

* Object selection is reliable.  
* Hopper opens and closes.  
* Beans transfer physically.  
* Cup dragging is stable.  
* Buttons operate independently.  
* Dragging does not move the camera.  
* Invalid actions do not corrupt state.  
* Pointer cancellation is safe.

## **43.5 Liquid**

* Coffee originates from correct nozzle.  
* Stream has believable geometry and shading.  
* Fill follows actual captured volume.  
* Cup movement changes capture correctly.  
* Finite batch is enforced.  
* Overflow and spilling are consistent.  
* In-flight coffee settles correctly.  
* Early stop finalizes the batch.  
* Accounting invariants pass.

## **43.6 Presentation**

* Materials match the art direction.  
* Lighting is coherent.  
* Camera transitions are restrained.  
* Manual camera input wins over choreography.  
* Mechanical movement is believable.  
* Sound is synchronized.  
* Steam and secondary effects remain subtle.  
* No conventional UI appears during normal experience.

## **43.7 Reset & Reliability**

* Reset works from every machine state.  
* Reset works during active dragging.  
* Reset works during pouring.  
* Old callbacks cannot mutate a new session.  
* Audio stops correctly.  
* Camera restores correctly.  
* Beans and cup restore correctly.  
* Spills and liquid clear.  
* Inactivity reset works.  
* Repeated cycles remain stable.

## **43.8 Delivery**

* Type checking passes.  
* Linting passes.  
* Unit tests pass.  
* End-to-end tests pass.  
* Production build succeeds.  
* Visual review passes.  
* Target-device performance is acceptable.  
* Exhibition operation is documented.  
* Final release is identifiable.

---

# **44\. Architecture Decision Register**

| ID | Decision | Status |
| ----- | ----- | ----- |
| E-001 | Build a fresh client-side application | Defined |
| E-002 | Use React and TypeScript | Defined |
| E-003 | Use Vite rather than a full-stack framework | Defined |
| E-004 | Use Three.js through React Three Fiber | Defined |
| E-005 | Use Drei for appropriate scene utilities | Defined |
| E-006 | Use GSAP for authored transitions | Defined |
| E-007 | Use a Zustand vanilla store | Defined |
| E-008 | One experience engine owns logical state | Defined |
| E-009 | Use typed, guarded commands | Defined |
| E-010 | Use domain transition events | Defined |
| E-011 | Process timing uses one authoritative simulation clock | Defined |
| E-012 | Frame-driven effects avoid React rerenders | Defined |
| E-013 | Asset integration uses strict manifest validation | Defined |
| E-014 | Asset scale is authored correctly rather than guessed at runtime | Defined |
| E-015 | Input ownership is centralized | Defined |
| E-016 | Cup movement uses constrained world-space dragging | Defined |
| E-017 | Bean transfer uses direct drag with guided completion | Defined |
| E-018 | Cup capture derives from geometry | Defined |
| E-019 | Coffee uses finite-batch volume accounting | Defined |
| E-020 | In-flight coffee is explicitly accounted for | Defined |
| E-021 | Liquid uses procedural geometry/shaders, not CFD | Defined |
| E-022 | Steam uses lightweight procedural effects | Defined |
| E-023 | Machine animation is state-driven | Defined |
| E-024 | Camera choreography yields to manual input | Defined |
| E-025 | Audio uses a dedicated Web Audio service | Defined |
| E-026 | Recorded sounds are preferred where they improve realism | Defined |
| E-027 | Reset is a first-class session operation | Defined |
| E-028 | Reset invalidates all old pending operations | Defined |
| E-029 | Browser visibility pauses simulation | Defined |
| E-030 | Optional visual quality adapts without changing logic | Defined |
| E-031 | No backend or persistence is required | Defined |
| E-032 | Static deployment is the baseline | Defined |
| E-033 | Domain logic is independently unit-tested | Defined |
| E-034 | Browser interaction uses end-to-end tests | Defined |
| E-035 | Final visual quality requires real-device review | Defined |
| E-036 | Previous web code is not an architectural authority | Defined |

---

# **45\. Implementation Handoff Contract**

An engineer beginning Ritual must follow this order of understanding:

1. Read Document 00 to understand project scope.  
2. Read Document 01 to understand the creative concept.  
3. Read Document 02 to understand physical assets and spatial structure.  
4. Read Document 03 to understand exact interaction behavior.  
5. Read Document 04 to understand cinematic and sensory requirements.  
6. Read Document 05 to implement the approved architecture.  
7. Use Document 06 to execute and validate the project.

## **45.1 Non-Negotiable Rules**

Do not introduce conventional visible UI.

Do not make Power a prerequisite for adding beans.

Do not make cup alignment a prerequisite for brewing.

Do not start dispensing automatically after brewing.

Do not implement unlimited coffee.

Do not make the liquid follow the cup unnaturally.

Do not let independent components own conflicting machine states.

Do not use unrelated timers for the preparation sequence.

Do not sacrifice physical interaction for a fixed cinematic animation.

Do not omit reset and interruption handling.

Do not consider source-code presence proof of functional or artistic completion.

## **45.2 Required Engineering Standard**

The final application should feel simple to operate because the implementation is carefully structured.

The visitor must experience one coherent machine.

The engineering must maintain:

* Explicit responsibilities.  
* Predictable state changes.  
* Stable spatial relationships.  
* Reliable input.  
* Deterministic timing.  
* Consistent visual consequences.  
* Clean resource ownership.  
* Recoverable sessions.  
* Testable behavior.

---

# **46\. Official Technical References**

These references support the selected implementation technologies and should be consulted when developing against the installed library versions.

**Vite**

* [https\://vite.dev/guide/](https://vite.dev/guide/)  
* [https\://vite.dev/guide/build](https://vite.dev/guide/build)

**React Three Fiber**

* [https\://r3f.docs.pmnd.rs/](https://r3f.docs.pmnd.rs/)  
* [https\://r3f.docs.pmnd.rs/api/hooks](https://r3f.docs.pmnd.rs/api/hooks)  
* [https\://r3f.docs.pmnd.rs/advanced/pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls)

**Three.js**

* [https\://threejs.org/docs/](https://threejs.org/docs/)  
* [https\://threejs.org/manual/pages/color-management.html](https://threejs.org/manual/pages/color-management.html)

**Zustand**

* [https\://zustand.docs.pmnd.rs/](https://zustand.docs.pmnd.rs/)  
* [https\://zustand.docs.pmnd.rs/reference/apis/create-store](https://zustand.docs.pmnd.rs/reference/apis/create-store)

**GSAP**

* [https\://gsap.com/docs/v3/GSAP/gsap.context%28%29/](https://gsap.com/docs/v3/GSAP/gsap.context%28%29/)

**Blender/glTF**

* [https\://docs.blender.org/manual/](https://docs.blender.org/manual/)  
* [https\://www\.khronos.org/gltf/](https://www.khronos.org/gltf/)

**Testing**

* [https\://vitest.dev/](https://vitest.dev/)  
* [https\://playwright.dev/](https://playwright.dev/)

Implementation should use the documentation corresponding to the exact package versions installed in the project.

---

# **47\. Final Engineering Statement**

Ritual is a cinematic interactive experience built on a deliberately controlled technical foundation.

Its architecture must make the physical machine behave as one coherent system.

The visitor manipulates real three-dimensional components.

Those interactions become guarded commands.

The experience engine decides what is valid.

Machine states advance through a single authoritative timeline.

The camera, motion, lighting, and audio respond to that timeline.

Coffee is emitted from a finite prepared batch.

Cup position determines how much liquid is captured.

Spilling and overflow follow consistent volume rules.

The system preserves visible consequences.

Reset restores the complete scene for another visitor.

The technology should remain invisible.

No visitor should need to understand React, state machines, shaders, animation timelines, or WebGL.

They should only need to understand a coffee machine.

**One authoritative engine.**

**One coherent physical scene.**

**Clear interaction ownership.**

**Deterministic machine behavior.**

**Cinematic presentation.**

**Reliable physical consequences.**

**Complete reset and replay.**

**A polished exhibition experience.**

---

**End of Document 05 — Technical Architecture & Engineering Specification**

**Status:** Architecture Defined — Pending Implementation and Validation  
**Next Document:** RITUAL-06 — Implementation Roadmap & Quality Assurance  
**Implementation Authority:** Approved Ritual documentation, validated production assets, and the engineering contracts established in this document.

