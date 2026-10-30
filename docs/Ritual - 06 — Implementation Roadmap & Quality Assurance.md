# **Ritual**

## **06 — Implementation Roadmap & Quality Assurance**

**Project:** Ritual  
**Tagline:** The Choreography of Espresso  
**Document ID:** RITUAL-06  
**Version:** 1.0 — Implementation and Quality Baseline  
**Date:** October 27, 2026  
**Status:** Execution Plan Defined — Ready for Implementation  
**Project Type:** Cinematic Interactive 3D Web Experience  
**Parent Documents:** RITUAL-00, RITUAL-01, RITUAL-02, RITUAL-03, RITUAL-04, RITUAL-05  
**Repository:** [https\://github.com/byishimwe/ritual](https://github.com/byishimwe/ritual)  
**Development Approach:** Fresh implementation, original vision, single primary project lead  
**Purpose:** Define the work required to build, verify, refine, deploy, and accept the complete Ritual experience.

---

# **1\. Document Purpose**

## **1.1 Overview**

This document is the execution and quality-assurance specification for Ritual.

It converts the approved project vision, physical asset requirements, interaction behavior, cinematic direction, and technical architecture into a clear sequence of implementation tasks.

Its purpose is to ensure that Ritual progresses from a documented concept to a complete, reliable, visually polished exhibition experience.

It defines:

* Implementation phases.  
* Task dependencies.  
* Engineering milestones.  
* Deliverables.  
* Feature completion criteria.  
* Functional verification.  
* Integration testing.  
* Automated testing.  
* Visual and sound quality assurance.  
* Performance testing.  
* Failure and recovery testing.  
* Production deployment.  
* Exhibition operation.  
* Release acceptance.

## **1.2 Primary Objective**

Deliver one complete interactive coffee-making experience in which a visitor can:

1. Discover a believable espresso machine.  
2. Open the bean hopper.  
3. Physically add coffee beans.  
4. Close the hopper.  
5. Position a ceramic cup.  
6. Power on the machine.  
7. Begin grinding and brewing.  
8. Observe the mechanical preparation sequence.  
9. Initiate coffee dispensing.  
10. Control when pouring stops.  
11. Observe physically meaningful filling, spilling, or overflow.  
12. Complete the experience.  
13. Reset and replay.

All of these interactions must remain consistent with the cinematic and technical requirements established in Documents 00–05.

## **1.3 Implementation Philosophy**

**Build the experience correctly, then refine it until it feels exceptional.**

A feature is not complete merely because source code exists.

A visual effect is not complete merely because it renders.

An interaction is not complete merely because a click handler runs.

Completion requires the correct behavior, coherent feedback, reliable integration, and acceptable visual quality.

## **1.4 Source of Truth**

Implementation must follow:

1. RITUAL-00 — Project Definition & Scope.  
2. RITUAL-01 — Reference & Concept.  
3. RITUAL-02 — 3D Assets & Scene Specification.  
4. RITUAL-03 — Interaction & Experience Specification.  
5. RITUAL-04 — Cinematic & Sensory Design System.  
6. RITUAL-05 — Technical Architecture & Engineering Specification.  
7. RITUAL-06 — Implementation Roadmap & Quality Assurance.

These documents define the requirements independently of any previous application code.

## **1.5 Fresh Implementation Policy**

The project will be built according to the original approved specifications.

The existing repository may be retained as the version-control location, but previous web implementation decisions are not binding.

Before replacing repository contents, preserve any important original assets, licenses, design references, and relevant source history.

The new development work should begin on a clean, identifiable implementation baseline.

Previous code should not be reused merely because it exists.

Reuse is appropriate only when a component is independently evaluated and shown to satisfy the approved specification.

---

# **2\. Definition of Success**

Ritual succeeds only when four distinct conditions are satisfied.

## **2.1 Functional Success**

Every required visitor action and machine transition works correctly.

The complete physical process can be performed without developer intervention.

## **2.2 Cinematic Success**

The experience feels coherent, premium, tactile, and deliberately art-directed.

Lighting, materials, sound, motion, camera, and procedural effects communicate one unified artistic vision.

## **2.3 Technical Success**

The implementation is reliable, maintainable, responsive, and recoverable.

State transitions are deterministic.

Rendering and simulation remain synchronized.

Reset works from every relevant state.

## **2.4 Exhibition Success**

The application runs on the intended device and remains usable by successive visitors.

Visitors can discover the interactions without conventional instructions.

The experience can recover from abandoned sessions and expected operational interruptions.

## **2.5 No Partial Substitution**

Passing one success category does not compensate for failure in another.

For example:

* Good visuals do not compensate for broken interaction.  
* Correct state logic does not compensate for unusable controls.  
* Smooth animation does not compensate for incorrect liquid behavior.  
* Passing automated tests does not compensate for unacceptable artistic quality.  
* A successful production build does not demonstrate exhibition readiness.

---

# **3\. Implementation Management**

## **3.1 Primary Development Model**

Ritual is managed as a focused creative engineering project under one primary decision-maker.

The implementation may be performed independently or with AI development assistance.

Regardless of implementation method, the approved documents remain authoritative.

## **3.2 Work Units**

Track work using four levels:

**Phase:** A major area of development.

**Milestone:** A meaningful integrated outcome.

**Task:** A specific implementable responsibility.

**Acceptance criterion:** Observable evidence that the responsibility is complete.

## **3.3 Task Statuses**

Each task should use one of these statuses:

| Status | Meaning |
| ----- | ----- |
| Not Started | No implementation work begun |
| In Progress | Work actively being developed |
| Implemented | Code or asset exists, but verification is incomplete |
| Verified | Functional and technical acceptance passed |
| Accepted | Quality and integration requirements approved |
| Blocked | Cannot proceed because a prerequisite is missing |
| Deferred | Intentionally postponed outside the current delivery scope |

## **3.4 Completion Rule**

A milestone cannot be marked complete until all of its critical acceptance criteria are verified.

Code completion alone is insufficient.

## **3.5 Task Ownership**

For the initial development model:

* The primary project lead approves scope and final quality.  
* The implementing engineer or AI agent performs assigned engineering work.  
* Automated checks provide repeatable technical evidence.  
* Browser and visual inspection provide experiential evidence.

The same person may perform several roles.

No unnecessary organizational process is required.

## **3.6 Decision Escalation**

Implementation should proceed without unnecessary clarification when the specifications provide sufficient direction.

If a minor engineering choice remains open, choose the simplest reliable solution consistent with the documents.

A new decision is required only when the proposed behavior would materially change the approved experience, scope, or artistic identity.

---

# **4\. Dependency Strategy**

## **4.1 Dependency Principle**

Every major subsystem should be implemented only after the systems it depends on are sufficiently reliable.

This avoids building sophisticated effects on an unstable foundation.

## **4.2 Core Dependency Sequence**

PROJECT FOUNDATION

       \|

       v

ASSET CONTRACT VALIDATION

       \|

       v

3D SCENE INTEGRATION

       \|

       v

AUTHORITATIVE EXPERIENCE ENGINE

       \|

       v

PRIMARY PHYSICAL INTERACTIONS

       \|

       v

GRINDING / PAUSE / BREWING

       \|

       v

FINITE COFFEE SIMULATION

       \|

       v

POURING / CUP FILL

       \|

       v

SPILLS / OVERFLOW / STEAM

       \|

       v

RESET / INTERRUPTIONS / RECOVERY

       \|

       v

CINEMATIC & SOUND REFINEMENT

       \|

       v

PERFORMANCE / FULL REGRESSION

       \|

       v

PRODUCTION RELEASE

       \|

       v

EXHIBITION VALIDATION

## **4.3 Parallel Work**

Some tasks may proceed in parallel without compromising consistency.

Examples:

* Audio asset research while the state engine is built.  
* Blender material cleanup while the application shell is prepared.  
* Camera composition exploration after the initial scene is available.  
* Unit-test development alongside the corresponding domain logic.  
* Visual reference capture during asset verification.

However, work must not introduce conflicting sources of truth.

## **4.4 Integration Before Polish**

A minimal but complete interaction cycle should exist before investing heavily in secondary effects.

This does not mean visual design is ignored early.

The scene, camera, and material direction must be established from the beginning.

Detailed polish becomes the focus only after the core behavior is integrated.

---

# **5\. Implementation Phases Overview**

| Phase | Name | Primary outcome |
| ----- | ----- | ----- |
| 00 | Preflight & Source Control | Clean, controlled implementation baseline |
| 01 | Application Foundation | Working React/R3F runtime |
| 02 | Asset Validation & Integration | Correct interactive 3D model |
| 03 | Experience Engine | Deterministic machine behavior |
| 04 | Input & Object Interaction | Operable hopper, beans, cup, buttons |
| 05 | Mechanical Preparation | Complete grinding/brewing sequence |
| 06 | Coffee Simulation | Finite user-controlled pouring |
| 07 | Physical Consequences | Fill, miss, spill, overflow, steam |
| 08 | Reset & Recovery | Reliable repeatable sessions |
| 09 | Cinematic & Sensory Polish | Complete artistic presentation |
| 10 | Integration & Regression Testing | Verified entire experience |
| 11 | Performance & Compatibility | Stable target-device operation |
| 12 | Production & Exhibition Release | Final approved build and handoff |

Each phase has a defined quality gate.

---

# **6\. Phase 00 — Preflight & Source Control**

## **6.1 Objective**

Establish a clean, dependable development baseline before writing the new application.

## **6.2 Tasks**

### **P00-01 — Preserve Existing Project History**

* Confirm access to the Ritual repository.  
* Identify the branch or commit currently representing previous implementation work.  
* Preserve source history.  
* Avoid irreversible loss of original Blender assets and reference materials.  
* Establish a clean branch for the new implementation.

The preserved code is not a specification or architectural authority.

### **P00-02 — Consolidate Approved Documentation**

* Store or link the seven project documents in a consistent location.  
* Ensure naming uses **Ritual**.  
* Remove references that incorrectly establish previous implementation code as authoritative.  
* Confirm preparation-first interaction in all requirements.  
* Confirm that Documents 00–05 do not contain unresolved contradictory behavior.  
* Establish the approved document versions.

### **P00-03 — Inventory Production Assets**

Identify and preserve:

* Blender source.  
* Exported GLB.  
* Textures.  
* Machine reference imagery.  
* Turnaround views.  
* Existing sound assets, if any.  
* Any independently useful licensed materials.

### **P00-04 — Establish Development Standards**

Define:

* Node.js runtime compatibility.  
* Package manager.  
* TypeScript configuration.  
* Formatting.  
* Linting.  
* Testing tools.  
* Branching convention.  
* Commit approach.  
* Build scripts.

### **P00-05 — Define Development Environment**

Confirm that the development system can run:

* Node.js.  
* Vite.  
* A modern WebGL-capable browser.  
* Blender.  
* Automated tests.  
* The production build.

## **6.3 Deliverables**

* Clean working branch.  
* Preserved project history.  
* Accessible approved specifications.  
* Asset inventory.  
* Development environment.  
* Initial project README.

## **6.4 Acceptance Gate G00**

Pass when:

* Required assets are preserved.  
* Approved documentation is accessible.  
* New work is clearly separated from legacy implementation.  
* Development environment is functional.  
* No required source asset has been accidentally lost.

---

# **7\. Phase 01 — Application Foundation**

## **7.1 Objective**

Create the minimal technical shell needed for the interactive 3D experience.

## **7.2 Tasks**

### **P01-01 — Initialize Frontend**

Create a fresh Vite, React, and TypeScript project.

Enable strict TypeScript checks.

Use versions compatible with the selected React Three Fiber release.

### **P01-02 — Configure Tooling**

Set up:

* ESLint.  
* Formatting.  
* Type checking.  
* Vitest.  
* Playwright.  
* Production build.  
* Consistent dependency lockfile.

### **P01-03 — Create Application Shell**

Implement:

* Application entry point.  
* Experience root.  
* Global styles.  
* Error boundary.  
* Application lifecycle.  
* Minimal loading state.

### **P01-04 — Create R3F Canvas**

Initialize:

* WebGL renderer.  
* Perspective camera.  
* Scene.  
* Appropriate output color handling.  
* Resize behavior.  
* Initial render loop.

### **P01-05 — Implement Basic Stage**

Create a temporary supporting surface and background corresponding to the approved product-stage direction.

This stage may be refined later.

### **P01-06 — Implement Camera Controls**

Establish:

* Controlled horizontal orbit.  
* Restricted vertical orbit.  
* Restricted camera distance.  
* Damping.  
* Disabled free panning.

### **P01-07 — Establish Configuration Modules**

Create typed configuration for:

* Experience timings.  
* Camera.  
* Materials.  
* Lighting.  
* Sound.  
* Rendering quality.

## **7.3 Deliverables**

A working single-page 3D application with:

* Stable rendering.  
* Correct viewport resizing.  
* Working camera orbit.  
* Basic stage.  
* No conventional visible interface.  
* Working development and production scripts.

## **7.4 Acceptance Gate G01**

Pass when:

* Application starts without runtime errors.  
* Canvas renders.  
* Camera controls function.  
* Resize works.  
* Type checking passes.  
* Production build succeeds.  
* No unnecessary framework or library has been introduced.

---

# **8\. Phase 02 — Asset Validation & Integration**

## **8.1 Objective**

Integrate a verified, interaction-ready production asset.

## **8.2 Tasks**

### **P02-01 — Inspect Blender Source**

Verify:

* Exact dimensions.  
* Unit scale.  
* Coordinate orientation.  
* Object hierarchy.  
* Materials.  
* Textures.  
* Interactive geometry.  
* Pivot locations.

Do not assume the GLB already satisfies Document 02\.

### **P02-02 — Resolve Asset Contract**

Establish the final required hierarchy and node names.

Ensure the model supports:

* Hopper lid.  
* Three physical buttons.  
* Bean supply.  
* Movable cup.  
* Coffee outlet.  
* Ingredient and cup-placement anchors.  
* Fill and spill references.

### **P02-03 — Repair Geometry Where Necessary**

Correct:

* Incorrect pivots.  
* Merged interactive objects.  
* Missing cup interior.  
* Incorrect object origins.  
* Problematic transforms.  
* Unnecessary geometry.  
* Export-incompatible materials.

### **P02-04 — Prepare Empty/Filled Ingredient States**

Ensure the scene can represent:

* Empty hopper.  
* Filled hopper.  
* Full bean supply.  
* Empty bean supply.

### **P02-05 — Prepare Cup Geometry**

Verify:

* Actual ceramic interior.  
* Correct mouth reference.  
* Fill-bottom reference.  
* Maximum fill reference.  
* Independent cup transform.

### **P02-06 — Export Production GLB**

Export the validated asset with:

* Correct units.  
* Correct hierarchy.  
* Stable names.  
* Appropriate material definitions.  
* Required reference nodes.

### **P02-07 — Implement Asset Loader**

Create:

* Asset manifest.  
* Loading function.  
* Node-reference resolver.  
* Required-node validation.  
* Structured failure reporting.

### **P02-08 — Establish Physical Placement**

Place the machine and props correctly on the product stage.

Verify:

* Machine grounding.  
* Cup start position.  
* Bean supply position.  
* Hopper visibility.  
* Coffee outlet relationship.  
* Initial camera composition.

### **P02-09 — Establish Baseline Materials & Lighting**

Implement a visually coherent preliminary material and lighting setup.

Final polish comes later, but the scene must already resemble the approved concept.

## **8.3 Deliverables**

* Validated Blender source.  
* Production GLB.  
* Asset manifest.  
* Verified object references.  
* Correctly positioned machine and props.  
* Initial believable rendered scene.

## **8.4 Acceptance Gate G02**

Pass when:

* All required nodes resolve.  
* Interactive objects are independent.  
* Hopper pivot is correct.  
* Button pivots are correct.  
* Cup has usable interior geometry.  
* Coffee exit anchor is correct.  
* Bean transfer anchors are correct.  
* Machine scale is physically coherent.  
* Materials render correctly.  
* Asset loads without errors.  
* Initial composition is usable.

**Blocking rule:** Do not continue to complex interaction implementation with an invalid essential asset hierarchy.

---

# **9\. Phase 03 — Experience Engine**

## **9.1 Objective**

Implement the complete machine behavior independently from the 3D presentation.

## **9.2 Tasks**

### **P03-01 — Define Typed Domain State**

Implement the required process states:

* OFF.  
* IDLE\_ON.  
* GRINDING.  
* TRANSITION.  
* BREWING.  
* READY\_TO\_POUR.  
* POURING.  
* COMPLETE.  
* RESETTING.

Include separate hopper, bean, cup, coffee, and session data.

### **P03-02 — Define Commands**

Implement typed commands for:

* Power.  
* Hopper.  
* Bean transfer.  
* Cup movement.  
* Make.  
* Pour.  
* Reset.

### **P03-03 — Implement Guards**

Validate every command according to Document 03\.

Examples:

* Make requires power, beans, and closed hopper.  
* Pour requires prepared coffee.  
* Hopper locks during processing.  
* Bean transfer cannot duplicate.  
* Cup movement remains available during pouring.

### **P03-04 — Implement State Transitions**

Create deterministic transitions with explicit entry and exit behavior.

### **P03-05 — Implement Domain Events**

Publish meaningful state-change events for the presentation systems.

### **P03-06 — Implement Simulation Clock**

Create a controlled simulation scheduler.

Use a fixed step and safe delta handling.

### **P03-07 — Implement Preparation Timeline**

Implement:

* Grinding: 4.0 seconds.  
* Mechanical pause: 1.2 seconds.  
* Brewing: 4.2 seconds.

### **P03-08 — Implement Session Generation**

Ensure operations from an earlier session cannot affect a new session.

### **P03-09 — Implement Zustand Integration**

Expose logical state through a vanilla store.

Avoid routing every animation frame through React rendering.

### **P03-10 — Write Domain Tests**

Verify all guards, transitions, timing boundaries, and reset behavior without rendering a 3D scene.

## **9.3 Deliverables**

A complete behavioral engine capable of performing the conceptual coffee-making sequence without Three.js.

## **9.4 Acceptance Gate G03**

Pass when:

* Preparation-first behavior works.  
* Beans can load while OFF.  
* Power can activate before preparation.  
* Make is correctly guarded.  
* Grinding/pause/brewing timings are correct.  
* Repeated Make commands do not duplicate cycles.  
* Brewing produces one prepared batch.  
* Pour cannot begin early.  
* Reset is logically deterministic.  
* All domain unit tests pass.

---

# **10\. Phase 04 — Primary Physical Interactions**

## **10.1 Objective**

Connect visitor gestures to the experience engine through real physical objects.

## **10.2 Tasks**

### **P04-01 — Implement Input Coordinator**

Establish pointer ownership between:

* Camera.  
* Hopper.  
* Bean container.  
* Cup.  
* Buttons.

### **P04-02 — Configure Raycast Targets**

Ensure each physical interaction resolves to its intended object.

Use enlarged invisible hit regions only where required for usability.

### **P04-03 — Implement Hopper Interaction**

Add click-to-toggle behavior with:

* Valid state checks.  
* Hinge motion.  
* Safe reversal.  
* Transfer lock.  
* Processing lock.

### **P04-04 — Implement Bean Dragging**

Allow the visitor to pick up and move the bean supply through a controlled spatial interaction.

### **P04-05 — Implement Bean Transfer**

When released within the valid hopper target:

* Accept transfer.  
* Guide the container.  
* Tilt it.  
* Show beans falling.  
* Settle the beans.  
* Commit loaded state.  
* Return the emptied supply.

### **P04-06 — Implement Invalid Transfer Recovery**

Invalid placement returns the bean supply without consuming beans.

### **P04-07 — Implement Cup Dragging**

Allow constrained horizontal movement.

Ensure camera orbit is disabled during active dragging.

### **P04-08 — Implement Cup Placement Geometry**

Establish:

* Initial unaligned position.  
* Valid movement region.  
* Outlet target.  
* Correct alignment range.  
* Partial alignment range.  
* Complete miss range.

### **P04-09 — Implement Buttons**

Connect Power, Make, and Pour to the experience engine.

Provide restrained tactile motion.

### **P04-10 — Add Interaction Feedback**

Include initial contact sounds or development placeholders until final audio is ready.

Feedback must remain consistent with accepted or rejected operations.

## **10.3 Deliverables**

A physically operable machine before final coffee effects are introduced.

## **10.4 Acceptance Gate G04**

Pass when:

* Hopper opens and closes.  
* Beans can be dragged.  
* Successful bean transfer works.  
* Invalid transfer returns safely.  
* Beans cannot be duplicated.  
* Cup can be moved and positioned.  
* Cup movement is constrained.  
* Buttons issue correct commands.  
* Object dragging does not orbit the camera.  
* Pointer cancellation is reliable.  
* No interaction creates an invalid machine state.

---

# **11\. Phase 05 — Mechanical Preparation**

## **11.1 Objective**

Create the complete sensory experience of grinding and brewing.

## **11.2 Tasks**

### **P05-01 — Integrate Make with Physical Feedback**

A valid Make command must produce a clear button response and begin preparation.

### **P05-02 — Implement Grinding Motion**

Create subtle mechanical activity.

Possible elements:

* Machine vibration.  
* Bean visual processing.  
* Relevant internal movement.  
* Controlled camera emphasis.

### **P05-03 — Implement Grinding Audio**

Use believable grinder sound synchronized with the process timeline.

### **P05-04 — Implement Mechanical Pause**

Preserve the deliberate 1.2-second quiet transition.

### **P05-05 — Implement Brewing Motion**

Create mechanically distinct brewing activity.

### **P05-06 — Implement Brewing Audio**

Use an appropriate pump/brewing sound rather than reusing the grinder sound.

### **P05-07 — Implement Ready State Feedback**

Communicate prepared coffee through a subtle integrated appliance cue.

### **P05-08 — Implement Camera Responses**

Add restrained state-driven camera choreography.

Manual control must override it.

### **P05-09 — Validate Timing Integration**

Ensure camera, sound, animation, and machine state remain synchronized.

## **11.3 Deliverables**

A complete preparation experience ending in READY\_TO\_POUR.

## **11.4 Acceptance Gate G05**

Pass when:

* Grinding begins after valid Make.  
* Grinding lasts 4.0 seconds.  
* Mechanical pause lasts 1.2 seconds.  
* Brewing lasts 4.2 seconds.  
* Grinding and brewing feel distinct.  
* Audio is synchronized.  
* Camera movement is restrained.  
* Visitor camera interaction remains possible.  
* No coffee flows automatically.  
* The machine reaches READY\_TO\_POUR predictably.

---

# **12\. Phase 06 — Coffee Simulation**

## **12.1 Objective**

Implement finite, physically coherent coffee dispensing.

## **12.2 Tasks**

### **P06-01 — Implement Prepared Batch**

Use:

* Prepared volume: 1.30 cup units.  
* Cup capacity: 1.0 cup unit.  
* Pour rate: 0.125 cup units/second.

### **P06-02 — Implement Coffee Accounting**

Track:

* Remaining volume.  
* In-flight volume.  
* Cup-retained volume.  
* Missed volume.  
* Overflow volume.  
* Discarded unused volume.

### **P06-03 — Implement Stream Geometry**

Generate a narrow continuous stream at the actual coffee outlet.

### **P06-04 — Implement Liquid Material**

Create appropriate dark espresso color, glossy response, and restrained surface irregularity.

### **P06-05 — Implement Start Pour**

The first valid Pour command begins emission.

### **P06-06 — Implement Stop Pour**

The second valid command stops new emission.

Existing in-flight coffee must finish naturally.

### **P06-07 — Implement Batch Exhaustion**

The stream ends when prepared coffee is exhausted.

### **P06-08 — Implement Cup Capture Calculation**

Use the actual relationship between stream footprint and cup mouth.

### **P06-09 — Implement Cup Fill**

Map retained coffee volume to liquid height in the cup.

### **P06-10 — Implement Coffee Surface**

Add a restrained reflective surface and small ripples.

### **P06-11 — Validate Conservation**

Ensure all emitted coffee is correctly accounted for.

## **12.3 Deliverables**

A functioning coffee-pouring system that fills an aligned cup and ends correctly.

## **12.4 Acceptance Gate G06**

Pass when:

* Pour only starts when ready.  
* Stream originates from the nozzle.  
* Liquid appearance is believable.  
* Cup fills from captured coffee.  
* Cup reaches full capacity after approximately 8 seconds of continuous full capture.  
* Batch naturally exhausts after approximately 10.4 seconds of emission.  
* Second Pour press ends dispensing.  
* In-flight coffee lands after emission stops.  
* Unused batch volume is finalized correctly.  
* Volume conservation tests pass.  
* No negative or invalid volume values appear.

---

# **13\. Phase 07 — Physical Consequences & Secondary Effects**

## **13.1 Objective**

Complete the physical outcomes established in the interaction specification.

## **13.2 Tasks**

### **P07-01 — Partial Capture**

Calculate and present partial liquid capture when the stream overlaps the cup rim region.

### **P07-02 — Surface Miss**

Ensure liquid that misses the cup reaches the supporting surface.

### **P07-03 — Puddle Effect**

Render a restrained local spill with volume-driven growth.

### **P07-04 — Cup Movement During Pour**

Allow the visitor to move the cup while coffee is flowing.

The stream remains attached to the outlet.

### **P07-05 — Dynamic Capture**

Recalculate capture while the cup moves.

Do not use a stale alignment value.

### **P07-06 — Overflow**

When the cup reaches capacity, additional incoming coffee must produce a visible overflow consequence.

### **P07-07 — Overflow Geometry**

Create restrained liquid movement across the cup rim.

### **P07-08 — Steam**

Add light vapor originating near collected hot coffee.

### **P07-09 — Result Persistence**

Keep the final cup fill, puddle, and overflow visible through completion.

### **P07-10 — Effect Performance**

Avoid unnecessary draw calls, allocations, and excessive particles.

## **13.3 Deliverables**

The complete set of intended coffee outcomes.

## **13.4 Acceptance Gate G07**

Pass when:

* Fully aligned cup fills correctly.  
* Partially aligned cup receives only the captured fraction.  
* Misaligned cup remains unfilled.  
* Surface miss produces a spill.  
* Moving cup away changes incoming capture immediately.  
* Moving cup back resumes capture of new coffee.  
* Previously captured coffee remains inside the cup.  
* Previously spilled coffee stays on the stage.  
* Overflow occurs only after cup capacity.  
* Steam does not appear above an empty cup.  
* Effects remain restrained and visually believable.  
* Logical volume accounting remains correct in every case.

---

# **14\. Phase 08 — Reset, Replay & Recovery**

## **14.1 Objective**

Make Ritual reliable across repeated visitor sessions.

## **14.2 Tasks**

### **P08-01 — Build Reset Coordinator**

Create one reset operation that restores the complete experience.

### **P08-02 — Implement Operator Reset**

Keyboard `R` must safely reset from any state.

### **P08-03 — Implement Completion Power Reset**

Power during COMPLETE initiates restoration.

### **P08-04 — Implement Prebrewing Inactivity Reset**

Reset a modified abandoned prebrewing session after 90 seconds without meaningful interaction.

### **P08-05 — Implement Ready-State Timeout**

Reset after 75 seconds without interaction in READY\_TO\_POUR.

### **P08-06 — Implement Completion Auto-Reset**

Reset after 20 seconds without interaction in COMPLETE.

### **P08-07 — Implement Visual Restoration**

Use the restrained 1.3-second studio-light transition from Document 04\.

### **P08-08 — Implement Cancellation**

Reset must terminate:

* Active drags.  
* Bean transfer.  
* Hopper animation.  
* Button animation.  
* Mechanical process.  
* Camera transitions.  
* Coffee emission.  
* Audio loops.  
* Pending session callbacks.

### **P08-09 — Implement Session Generation**

Prevent obsolete operations from mutating a fresh session.

### **P08-10 — Implement Browser Visibility**

Pause simulation while hidden.

Reset after an extended hidden interruption exceeding 60 seconds.

### **P08-11 — Implement Rendering Recovery**

Handle WebGL context loss and recovery appropriately.

### **P08-12 — Implement Failure Boundaries**

Provide a minimal technical failure path for unrecoverable rendering or essential-asset errors.

## **14.3 Deliverables**

A complete, repeatable, recovery-safe visitor session.

## **14.4 Acceptance Gate G08**

Pass when:

* Reset works in OFF.  
* Reset works in IDLE\_ON.  
* Reset works during hopper movement.  
* Reset works during bean transfer.  
* Reset works during cup dragging.  
* Reset works during grinding.  
* Reset works during brewing.  
* Reset works while ready.  
* Reset works during pouring.  
* Reset works after completion.  
* No stale audio continues.  
* No previous timer reactivates.  
* Beans return to supply.  
* Hopper is empty and closed.  
* Cup is empty and at its starting position.  
* Puddles and steam clear.  
* Camera returns to hero composition.  
* Repeated reset calls are harmless.  
* Inactivity behavior is correct.  
* Visibility handling prevents time jumps.

---

# **15\. Phase 09 — Cinematic & Sensory Refinement**

## **15.1 Objective**

Transform the complete functional system into the intended premium cinematic experience.

## **15.2 Tasks**

### **P09-01 — Refine Product Materials**

Calibrate:

* Charcoal.  
* Satin metal.  
* Hopper transparency.  
* Ceramic.  
* Coffee beans.  
* Coffee liquid.  
* Supporting surface.

### **P09-02 — Refine Lighting**

Calibrate:

* Soft key.  
* Fill.  
* Rim separation.  
* Reflections.  
* Contact shadows.  
* Machine-integrated indicators.

### **P09-03 — Finalize Opening Composition**

Ensure the opening frame communicates the machine and available props clearly.

### **P09-04 — Finalize Camera Choreography**

Refine:

* Preparation framing.  
* Grinding focus.  
* Brewing hold.  
* Ready-to-pour view.  
* Hero pour composition.  
* Completion.  
* Reset.

### **P09-05 — Refine Hopper Motion**

Improve hinge weight, easing, contact, and sound.

### **P09-06 — Refine Bean Transfer**

Improve container movement, tilt, falling beans, and settling.

### **P09-07 — Refine Cup Movement**

Improve drag feel, release, and ceramic contact feedback.

### **P09-08 — Refine Button Feedback**

Ensure all three controls share a coherent mechanical character.

### **P09-09 — Refine Machine Movement**

Distinguish grinding from brewing without excessive chassis motion.

### **P09-10 — Refine Coffee Appearance**

Improve:

* Stream curvature.  
* Material highlights.  
* Startup.  
* Termination.  
* Cup surface.  
* Ripples.

### **P09-11 — Refine Consequences**

Improve spill and overflow appearance while preserving correct accounting.

### **P09-12 — Finalize Steam**

Keep vapor subtle, soft, and physically associated with hot coffee.

### **P09-13 — Integrate Final Sound Assets**

Replace temporary cues with suitable final sound design.

### **P09-14 — Mix Sound**

Balance:

* Buttons.  
* Bean handling.  
* Hopper.  
* Cup.  
* Grinding.  
* Brewing.  
* Pouring.  
* Steam.

### **P09-15 — Refine Reset Presentation**

Ensure restoration feels like part of the same cinematic visual language.

### **P09-16 — Remove Decorative Excess**

Remove effects that do not meaningfully improve the experience.

## **15.3 Deliverables**

A complete artistically coherent Ritual experience.

## **15.4 Acceptance Gate G09**

Pass when:

* Product materials are believable.  
* Machine remains readable.  
* Opening composition is approved.  
* Camera movement feels deliberate.  
* Interaction animation feels tactile.  
* Grinding and brewing have distinct identities.  
* Pouring looks convincing.  
* Spill and overflow look proportional.  
* Steam remains subtle.  
* Sound supports the physical narrative.  
* Reset looks intentional.  
* No conventional UI appears in the active experience.  
* The complete experience feels cohesive.

---

# **16\. Phase 10 — Integration & Regression Testing**

## **16.1 Objective**

Verify all major systems together.

## **16.2 Tasks**

### **P10-01 — Execute Domain Tests**

Run all machine-state and simulation tests.

### **P10-02 — Execute Interaction Tests**

Validate hopper, bean, cup, and button behavior.

### **P10-03 — Execute Volume Tests**

Verify all coffee accounting scenarios.

### **P10-04 — Execute Reset Tests**

Reset from every important state.

### **P10-05 — Execute Browser Tests**

Use real-browser interaction tests.

### **P10-06 — Execute Camera Tests**

Validate manual control, cinematic transitions, and overrides.

### **P10-07 — Execute Audio Tests**

Verify sound lifecycle, transition, and cleanup.

### **P10-08 — Execute Visual Review**

Inspect all major scene states.

### **P10-09 — Execute Repeated-Cycle Testing**

Run multiple consecutive sessions with varied outcomes.

### **P10-10 — Resolve Regression Issues**

Fix critical and high-priority defects.

Retest affected systems.

## **16.3 Deliverables**

* Automated test results.  
* Browser verification results.  
* Visual-review findings.  
* Regression defect log.  
* Verified implementation baseline.

## **16.4 Acceptance Gate G10**

Pass when:

* Core unit tests pass.  
* Required integration tests pass.  
* Primary browser journey passes.  
* Major interaction scenarios pass.  
* Reset and recovery scenarios pass.  
* No blocking defects remain.  
* Any remaining nonblocking issues are documented.  
* Changes have not reintroduced previously fixed defects.

---

# **17\. Phase 11 — Performance & Compatibility**

## **17.1 Objective**

Verify that Ritual operates acceptably on its intended exhibition hardware.

## **17.2 Tasks**

### **P11-01 — Identify Target Device**

Record:

* Operating system.  
* Browser/version.  
* Screen resolution.  
* CPU.  
* GPU.  
* RAM.  
* Input devices.  
* Audio output.  
* Available network environment.

### **P11-02 — Profile Startup**

Measure:

* Initial load duration.  
* Model load/decode.  
* Texture loading.  
* Renderer initialization.  
* Time until the scene becomes interactive.

### **P11-03 — Profile Rendering**

Measure performance during:

* Idle.  
* Camera orbit.  
* Bean dragging.  
* Grinding.  
* Brewing.  
* Pouring.  
* Cup dragging during pour.  
* Overflow.  
* Steam.  
* Reset.

### **P11-04 — Profile Memory**

Run repeated cycles and monitor resource growth.

### **P11-05 — Optimize Bottlenecks**

Prioritize measured issues involving:

* Shadows.  
* Reflections.  
* Materials.  
* Geometry.  
* Procedural effects.  
* React rerenders.  
* CPU allocations.  
* GPU resources.

### **P11-06 — Configure Quality Tiers**

Provide appropriate high/medium/low internal quality configurations.

### **P11-07 — Test Browser Resilience**

Test:

* Resize.  
* Fullscreen.  
* Visibility changes.  
* Pointer cancellation.  
* Audio restrictions.  
* Context recovery.

### **P11-08 — Validate Long-Running Operation**

Keep the application open through extended repeated use to detect leaks or unstable behavior.

## **17.3 Deliverables**

* Hardware profile.  
* Performance measurements.  
* Optimization record.  
* Selected exhibition quality settings.  
* Compatibility results.

## **17.4 Acceptance Gate G11**

Pass when:

* The complete experience operates on the target device.  
* Interaction remains responsive.  
* Preferred 60 FPS performance is achieved where feasible.  
* Sustained frame rates below 30 FPS are avoided in normal operation.  
* No serious frame-time spikes compromise controls.  
* Memory does not grow uncontrollably across repeated sessions.  
* Visual quality remains acceptable at the selected quality tier.  
* Core behavior does not change between quality tiers.  
* Target browser and fullscreen behavior are validated.

These are release objectives, not claims of measured performance before testing.

---

# **18\. Phase 12 — Production & Exhibition Release**

## **18.1 Objective**

Produce a stable final build with a documented operating procedure.

## **18.2 Tasks**

### **P12-01 — Final Code Review**

Check:

* Dead code.  
* Unused dependencies.  
* Debug-only helpers.  
* Accidental console noise.  
* Resource cleanup.  
* Error handling.  
* Type safety.  
* Asset paths.

### **P12-02 — Final Asset Review**

Confirm:

* Production GLB.  
* Required textures.  
* Final sound assets.  
* Material correctness.  
* Licensing.  
* No missing resources.

### **P12-03 — Run Final Checks**

Execute:

* Type checking.  
* Linting.  
* Unit tests.  
* Integration tests.  
* End-to-end tests.  
* Production build.  
* Asset validation.

### **P12-04 — Build Production Artifact**

Generate the final Vite production build.

### **P12-05 — Verify Production Build**

Test the actual production output rather than relying only on development-server behavior.

### **P12-06 — Deploy**

Deploy to the selected static host or exhibition-local HTTP server.

### **P12-07 — Verify Deployment**

Confirm:

* Entry page loads.  
* Assets resolve.  
* Audio operates after permitted interaction.  
* Input works.  
* Rendering is correct.  
* Reset functions.  
* No third-party network services are required.

### **P12-08 — Prepare Exhibition Runbook**

Document:

* Launch steps.  
* Fullscreen setup.  
* Reset shortcut.  
* Recovery from browser failure.  
* Audio setup.  
* Version identification.  
* Application restart.

### **P12-09 — Final Acceptance**

Conduct an end-to-end rehearsal on the intended exhibition computer.

Record the final release identifier.

## **18.3 Deliverables**

* Production build.  
* Deployment.  
* Approved release.  
* Exhibition runbook.  
* Final QA report.  
* Release identifier.

## **18.4 Acceptance Gate G12**

Pass when:

* Production build succeeds.  
* Final deployment loads correctly.  
* Required assets are available.  
* Complete visitor journey passes.  
* Audio and controls work.  
* Reset is reliable.  
* Performance is acceptable.  
* No critical defects remain.  
* Exhibition operation is documented.  
* Final release is approved.

---

# **19\. Quality Assurance Strategy**

## **19.1 QA Philosophy**

Quality assurance is continuous.

Testing should begin when each subsystem is implemented, not only after the entire experience has been constructed.

## **19.2 Four Testing Layers**

**Layer 01 — Unit testing**

Verifies small deterministic systems.

**Layer 02 — Integration testing**

Verifies communication between multiple systems.

**Layer 03 — End-to-end testing**

Verifies the complete visitor journey in a browser.

**Layer 04 — Artistic and exhibition validation**

Verifies perceptual quality, usability, and real-world operation.

All four layers are necessary.

## **19.3 Test Automation Priority**

Automate behavior that is:

* Deterministic.  
* Repeated frequently.  
* Sensitive to regression.  
* Easy to assert programmatically.

Examples:

* State transitions.  
* Guards.  
* Timer boundaries.  
* Coffee accounting.  
* Reset.  
* Input ownership.  
* Session generation.

## **19.4 Manual Review Priority**

Use visual and auditory review for qualities that cannot be adequately judged through numeric assertions.

Examples:

* Product realism.  
* Motion weight.  
* Material appearance.  
* Lighting.  
* Coffee visual quality.  
* Sound authenticity.  
* Cinematic pacing.  
* Discoverability.

## **19.5 No False Confidence**

Passing a test suite does not prove that the coffee looks realistic or the interaction feels good.

Likewise, a polished video demonstration does not prove that edge cases are handled.

Both types of evidence are required.

---

# **20\. Functional Test Suite**

## **20.1 Preparation Tests**

| ID | Test | Expected result |
| ----- | ----- | ----- |
| F-001 | Open hopper while OFF | Allowed |
| F-002 | Add beans while OFF | Allowed |
| F-003 | Close hopper after transfer | Hopper prepared |
| F-004 | Power on before beans | Allowed, Make unavailable |
| F-005 | Make without beans | Rejected |
| F-006 | Make with hopper open | Rejected |
| F-007 | Make with hopper moving | Rejected |
| F-008 | Transfer beans twice | No duplication |
| F-009 | Release beans outside target | Supply returns; no transfer |
| F-010 | Close hopper during transfer | Locked until completion |
| F-011 | Open hopper while grinding | Rejected |
| F-012 | Toggle Power before brewing | Ingredient state preserved |

## **20.2 Mechanical Process Tests**

| ID | Test | Expected result |
| ----- | ----- | ----- |
| F-013 | Valid Make | Enters GRINDING |
| F-014 | Grinding reaches 4.0 s | Enters TRANSITION |
| F-015 | Pause reaches 1.2 s | Enters BREWING |
| F-016 | Brewing reaches 4.2 s | Enters READY\_TO\_POUR |
| F-017 | Repeated Make | One preparation sequence |
| F-018 | Pour before ready | Rejected |
| F-019 | Brew completes | No automatic stream |
| F-020 | Cup absent from outlet | Brewing still permitted |

## **20.3 Pouring Tests**

| ID | Test | Expected result |
| ----- | ----- | ----- |
| F-021 | Pour when ready | Stream starts |
| F-022 | Pour again | Stops emission |
| F-023 | Batch exhausts | Emission stops automatically |
| F-024 | Aligned cup | Full capture until capacity |
| F-025 | Partial alignment | Split capture/miss |
| F-026 | Misaligned cup | Surface spill |
| F-027 | Move cup away | New coffee misses |
| F-028 | Move cup beneath stream | New coffee enters cup |
| F-029 | Cup full | Overflow begins |
| F-030 | Early pour stop | Unused batch finalized |
| F-031 | Move partially filled cup | Retained volume unchanged |
| F-032 | Reset during pour | Liquid/effects cleared |

## **20.4 Completion Tests**

| ID | Test | Expected result |
| ----- | ----- | ----- |
| F-033 | Early-stop completion | Stable partial result |
| F-034 | Exhaustion completion | Stable final result |
| F-035 | Power during COMPLETE | Reset |
| F-036 | Complete inactivity 20 s | Reset |
| F-037 | READY\_TO\_POUR inactivity 75 s | Reset |
| F-038 | Modified prebrew inactivity 90 s | Reset |
| F-039 | Untouched OFF inactivity | No unnecessary transition |

---

# **21\. Numerical Simulation Tests**

## **21.1 Timing Accuracy**

Test exact state boundaries using manually controlled simulation time.

The engine must not skip or duplicate transitions.

## **21.2 Batch Volume**

Initial prepared batch after brewing:

`1.30 units`

## **21.3 Cup Capacity**

Maximum retained cup volume:

`1.00 unit`

## **21.4 Fully Aligned Pour**

At the standard pour rate:

`0.125 units/s`

Expected nominal fill time:

`1.00 / 0.125 = 8.0 seconds`

Expected nominal batch emission duration:

`1.30 / 0.125 = 10.4 seconds`

## **21.5 In-Flight Correction**

The cup's observable filling begins when emitted liquid arrives, not at the instant the outlet starts emitting.

The 8.0- and 10.4-second baselines describe emission and accumulated flow; visible arrival may lag by the physically modeled transit time.

Tests must account for this distinction.

## **21.6 Conservation Invariant**

At all times:

`prepared = remaining + inFlight + cup + missed + overflow + discarded`

The sum must remain equal within numerical tolerance.

## **21.7 Cup Volume Bound**

`0 ≤ cupVolume ≤ cupCapacity`

## **21.8 Remaining Volume Bound**

`0 ≤ remainingVolume ≤ preparedBatch`

## **21.9 Capture Fraction Bound**

`0 ≤ captureFraction ≤ 1`

## **21.10 Property-Based Cases**

Where practical, generate varied:

* Cup positions.  
* Frame deltas.  
* Pour durations.  
* Stop times.  
* Volume states.

Verify that the invariants remain true.

---

# **22\. Input & Interaction Reliability Tests**

## **22.1 Pointer Capture**

Verify object dragging remains functional when the pointer moves outside the visible object.

## **22.2 Pointer Cancellation**

Cancel active gestures safely when:

* Pointer capture is lost.  
* Pointer release occurs outside the canvas.  
* Browser focus changes.  
* Reset begins.

## **22.3 Click Propagation**

Clicking a button must not also trigger a parent machine interaction or camera action.

## **22.4 Drag vs Orbit**

Dragging cup or beans must not orbit the camera.

## **22.5 Orbit vs Object Selection**

Beginning camera exploration on empty stage space must not unexpectedly select a physical object.

## **22.6 Rapid Input**

Test rapid repeated:

* Hopper clicks.  
* Power clicks.  
* Make clicks.  
* Pour clicks.  
* Drag starts/stops.

No duplicate transitions or stuck animations are permitted.

## **22.7 State Changes During Drag**

Test reset and process transitions while an object is being manipulated.

The controller must not retain stale ownership.

## **22.8 Camera During Process**

Manual camera input must override cinematic transitions without altering the machine process.

---

# **23\. Reset & Recovery Test Suite**

## **23.1 State Coverage**

Reset from:

* OFF.  
* IDLE\_ON.  
* GRINDING.  
* TRANSITION.  
* BREWING.  
* READY\_TO\_POUR.  
* POURING.  
* COMPLETE.

## **23.2 Interaction Coverage**

Reset during:

* Hopper opening.  
* Hopper closing.  
* Bean dragging.  
* Bean transfer.  
* Cup dragging.  
* Button animation.  
* Camera tween.  
* Active audio.  
* Coffee streaming.  
* Steam.  
* Spill growth.

## **23.3 Post-Reset Assertions**

After reset:

* Machine is OFF.  
* Hopper is closed.  
* Hopper is empty.  
* Bean supply is full and available.  
* Cup is empty.  
* Cup is at initial position.  
* Buttons are at rest.  
* No coffee stream exists.  
* No spill remains.  
* No stale steam remains.  
* Camera is at hero view.  
* No old audio loops remain.  
* No old timers can change the state.  
* Interaction is available.

## **23.4 Idempotency**

Reset twice or more in quick succession.

Expected: exactly one valid initial condition.

## **23.5 Repeated Sessions**

Run multiple complete cycles without reloading the page.

Verify no accumulating state or rendering resources.

---

# **24\. Visual Quality Assurance**

## **24.1 Review Philosophy**

Visual quality should be judged through consistent screenshots and direct interaction with the scene.

Review at the intended exhibition resolution and representative camera angles.

## **24.2 Reference Images**

Create approved captures of:

* Initial hero.  
* Front.  
* Side.  
* Rear.  
* Hopper open.  
* Bean transfer.  
* Cup placement.  
* Grinding.  
* Brewing.  
* Ready.  
* Pouring.  
* Full cup.  
* Spill.  
* Overflow.  
* Completion.  
* Reset.

## **24.3 Visual Review Categories**

### **Composition**

* Machine dominates.  
* Props are readable.  
* Important controls are visible.  
* Negative space is balanced.  
* Camera framing remains purposeful.

### **Materials**

* Charcoal has visible form.  
* Metal reflects appropriately.  
* Glass reveals beans.  
* Ceramic looks believable.  
* Coffee appears like liquid.

### **Lighting**

* Soft key defines shape.  
* Fill preserves dark detail.  
* Rim separation remains restrained.  
* Shadows ground objects.  
* Lighting remains coherent across orbit.

### **Motion**

* Hopper feels weighted.  
* Buttons feel tactile.  
* Bean transfer reads physically.  
* Cup drag feels responsive.  
* Camera movement is restrained.

### **Effects**

* Stream originates correctly.  
* Cup fill stays inside ceramic.  
* Ripples are subtle.  
* Steam is soft.  
* Spill is localized.  
* Overflow is plausible.

## **24.4 Visual Defect Severity**

**Critical:** A required object or interaction is invisible or unusable.

**High:** A major effect looks broken or the composition obscures a required action.

**Medium:** Noticeable material, animation, shadow, or framing problem.

**Low:** Minor imperfections that do not compromise the experience.

## **24.5 Artistic Acceptance**

A screenshot comparison can detect regressions, but final artistic acceptance requires human visual judgment.

A technically passing screenshot must not be treated as proof of premium visual quality.

---

# **25\. Sound Quality Assurance**

## **25.1 Review Conditions**

Listen on:

* Development headphones.  
* Intended exhibition speakers.  
* Actual exhibition playback volume.

## **25.2 Sound Review Areas**

Evaluate:

* Material authenticity.  
* Mechanical plausibility.  
* Timing.  
* Dynamic contrast.  
* Loudness balance.  
* Loop seams.  
* Sound transitions.  
* Spatial coherence.  
* Reset cleanup.

## **25.3 Grinding Review**

Grinding should feel substantial without overwhelming the whole experience.

## **25.4 Brewing Review**

Brewing must sound distinct from grinding.

## **25.5 Mechanical Pause Review**

The quiet interval must remain perceptible.

## **25.6 Pouring Review**

Coffee should sound like liquid entering a receiving surface.

Misalignment may change the impact character.

## **25.7 No-Audio Test**

Mute or block audio.

The experience must remain functionally understandable.

## **25.8 Audio Release Criteria**

* Required sounds are present.  
* Sounds are synchronized with physical events.  
* No audible loop clicks remain.  
* No unintended overlapping loops remain.  
* Audio unlock is handled.  
* Audio interruption is handled.  
* Reset stops previous playback.  
* Overall mix is suitable for the venue.

---

# **26\. Performance QA**

## **26.1 Measurement Conditions**

Performance should be evaluated using the actual production build and intended exhibition device.

Do not rely exclusively on development-server performance.

## **26.2 Test Scenes**

Measure at least:

1. Initial idle scene.  
2. Camera orbit.  
3. Bean transfer.  
4. Grinding.  
5. Brewing.  
6. Active coffee stream.  
7. Cup drag during pouring.  
8. Partial spill.  
9. Overflow.  
10. Steam.  
11. Reset.  
12. Repeated cycles.

## **26.3 Baseline Objectives**

Preferred:

* Stable 60 FPS where feasible.  
* Avoid sustained drops below 30 FPS.  
* No noticeable input lag.  
* No long rendering stalls.  
* No uncontrolled memory growth.

## **26.4 Measurement Record**

For each test, capture:

* Device.  
* Browser.  
* Viewport.  
* DPR.  
* Quality tier.  
* Average FPS.  
* Frame-time observations.  
* Draw calls.  
* GPU-related observations where available.  
* Memory/resource trend.  
* Relevant defect notes.

## **26.5 Optimization Policy**

Do not optimize blindly.

Identify bottlenecks first.

Prioritize:

1. Preventing broken interaction.  
2. Eliminating severe frame stalls.  
3. Removing excessive allocations.  
4. Reducing unnecessary GPU work.  
5. Preserving important visual quality.

## **26.6 Quality Degradation Policy**

If target performance is not achievable, reduce optional effects before compromising core behavior.

Recommended reduction order:

1. Decorative atmosphere.  
2. Optional postprocessing.  
3. Steam density.  
4. Reflection resolution.  
5. Shadow resolution.  
6. DPR.

Do not remove the coffee stream, meaningful cup fill, or core physical interactions.

---

# **27\. Usability & Exhibition Testing**

## **27.1 Purpose**

Ritual must be usable by visitors unfamiliar with the project.

Technical correctness does not guarantee discoverability.

## **27.2 Test Participants**

Use several people who have not been involved in designing or implementing the experience.

Avoid explaining the interaction before observing their first attempt.

## **27.3 Observation Method**

Ask participants to explore the scene naturally.

Observe whether they discover:

* Hopper lid.  
* Bean transfer.  
* Cup placement.  
* Power.  
* Make.  
* Pour.  
* Stop pouring.

## **27.4 Qualitative Questions**

After the attempt, ask:

* What did you think the object was?  
* Which interaction did you discover first?  
* What felt natural?  
* What confused you?  
* What did you expect to happen?  
* Which moment was most satisfying?  
* Did anything feel broken?  
* Would you want to try again?

## **27.5 Quantitative Measures**

Record:

* Whether each primary action was discovered.  
* Whether the complete cycle was finished.  
* Whether a facilitator was needed.  
* Number of obvious failed interaction attempts.  
* Approximate completion time.  
* Whether the visitor understood the Pour control.

## **27.6 Baseline Usability Target**

For the first structured test round, use at least five unfamiliar participants if practical.

A reasonable initial acceptance target is:

* Most participants recognize the machine immediately.  
* At least four of five complete the main cycle without explicit instruction.  
* No participant becomes trapped in an unrecoverable state.  
* The three-button roles are understandable by the end of the cycle.

If the sample is smaller, report the results honestly rather than claiming statistically established usability.

## **27.7 Refinement Policy**

If an interaction is repeatedly missed:

1. Review its physical placement.  
2. Review its visual affordance.  
3. Review its hit area.  
4. Review camera visibility.  
5. Review feedback.  
6. Simplify the gesture if necessary.

Do not immediately solve discoverability problems by adding instructional text.

---

# **28\. Defect Classification & Resolution**

## **28.1 Severity Levels**

| Severity | Meaning | Release policy |
| ----- | ----- | ----- |
| S0 — Blocker | Prevents starting or completing experience, crashes, corrupts essential state | Must fix |
| S1 — High | Breaks required interaction or major cinematic effect | Must fix |
| S2 — Medium | Noticeable defect with acceptable workaround | Review and normally fix |
| S3 — Low | Minor polish issue | May defer if documented |

## **28.2 Example S0 Defects**

* GLB fails to load.  
* Machine cannot brew.  
* Pour cannot begin.  
* Application crashes.  
* Reset leaves experience unusable.  
* No WebGL rendering on target hardware.

## **28.3 Example S1 Defects**

* Bean transfer cannot complete.  
* Cup dragging is unreliable.  
* Hopper hinge is broken.  
* Coffee exits from wrong location.  
* Overflow corrupts volume.  
* Camera traps the visitor.  
* Audio continues after reset.  
* A stale timer breaks the next session.

## **28.4 Example S2 Defects**

* Minor cup motion jitter.  
* Slight reflection artifact.  
* Imperfect steam density.  
* Minor material mismatch.  
* Small nonblocking sound delay.

## **28.5 Example S3 Defects**

* Very subtle secondary reflection differences.  
* Minor hidden geometry imperfections.  
* Small atmospheric effect variations.

## **28.6 Defect Record**

Each defect should include:

* Identifier.  
* Severity.  
* Description.  
* Reproduction steps.  
* Expected behavior.  
* Actual behavior.  
* Relevant document requirement.  
* Screenshot/video/log if useful.  
* Fix status.  
* Verification result.

## **28.7 Release Rule**

No S0 or S1 defect may remain in the final approved release.

S2 defects must be reviewed and accepted explicitly if deferred.

S3 defects may be documented for later refinement.

---

# **29\. Regression Policy**

## **29.1 Purpose**

A fix must not introduce another broken behavior.

Ritual has several tightly connected systems, especially camera, pointer interaction, state timing, and liquid rendering.

## **29.2 Mandatory Regression After Domain Changes**

Re-run:

* State transitions.  
* Make guards.  
* Preparation timing.  
* Pour behavior.  
* Reset.  
* Session generation.

## **29.3 Mandatory Regression After Asset Changes**

Re-run:

* Asset validation.  
* Node lookup.  
* Hopper pivot.  
* Buttons.  
* Cup placement.  
* Bean transfer.  
* Outlet and fill alignment.  
* Camera framing.

## **29.4 Mandatory Regression After Liquid Changes**

Re-run:

* Full capture.  
* Partial capture.  
* Miss.  
* Cup movement.  
* Overflow.  
* Early stop.  
* Batch exhaustion.  
* Volume conservation.

## **29.5 Mandatory Regression After Camera Changes**

Re-run:

* Default framing.  
* Orbit limits.  
* Drag ownership.  
* Manual override.  
* Pour framing.  
* Reset framing.

## **29.6 Mandatory Regression After Reset Changes**

Re-run the complete reset matrix across all machine states and active interactions.

---

# **30\. Milestone Evidence & Acceptance Records**

## **30.1 Evidence Principle**

A milestone should have observable proof of completion.

## **30.2 Required Evidence Types**

Possible evidence includes:

* Passing automated tests.  
* Production build output.  
* Runtime screenshots.  
* Short recorded interaction demonstrations.  
* Performance measurements.  
* Audio review.  
* Defect resolution records.  
* Manual acceptance notes.

## **30.3 Milestone Record**

For each milestone, record:

**Milestone ID:**  
**Description:**  
**Implementation version/commit:**  
**Required tasks completed:**  
**Automated checks:**  
**Manual verification:**  
**Known issues:**  
**Acceptance status:**  
**Reviewer:**  
**Date:**

## **30.4 Acceptance Status**

Use:

* Pending.  
* Failed.  
* Conditionally accepted.  
* Accepted.

Conditionally accepted milestones must identify the outstanding limitations.

## **30.5 Quality Gate Rule**

A milestone is not accepted simply because its implementation tasks have been marked complete.

The gate must be verified independently.

---

# **31\. Project Risks & Mitigations**

| Risk | Impact | Mitigation |
| ----- | ----- | ----- |
| Final Blender asset is not interaction-ready | Rework and integration delay | Validate hierarchy early |
| Node names change unexpectedly | Broken runtime references | Lock and test asset manifest |
| Scope expands into unnecessary features | Delivery risk | Enforce essential/secondary/optional priorities |
| State logic becomes distributed | Unpredictable behavior | Central engine |
| Independent timers overlap | Race conditions | Authoritative simulation clock |
| Camera competes with dragging | Poor usability | Explicit input ownership |
| Bean transfer feels artificial | Weak interaction quality | Guided but physically motivated motion |
| Cup placement is too precise | Visitor frustration | Calibrated tolerance |
| Coffee stream looks rigid | Weak visual payoff | Material and geometry refinement |
| Coffee quantities become inconsistent | Broken physical illusion | Conservation tests |
| Audio feels synthetic | Reduced realism | Recorded reference and listening review |
| Effects overwhelm the scene | Loss of artistic focus | Restrained art direction |
| Rendering becomes expensive | Low FPS | Profile and adapt optional effects |
| Reset is incomplete | Exhibition failure | Design and test every reset path |
| Browser interruption causes stale state | Unreliable sessions | Visibility-aware lifecycle |
| Late asset redesign breaks interactions | Regression | Asset validation and change control |
| Too little end-to-end testing | Hidden failures | Dedicated integration/QA phase |
| Exhibition device differs from development device | Deployment failure | Test target hardware early |
| Network access is unreliable | Asset-loading failure | Self-contained static deployment |
| Lack of operating instructions | Difficult exhibition handoff | Release runbook |

---

# **32\. Scope Prioritization**

## **32.1 Priority Levels**

**P0 — Essential**

Required for a complete primary experience.

**P1 — Approved Extended Experience**

Required for the full intended Ritual vision, including the physical consequences already specified.

**P2 — Optional Enhancement**

May be deferred without violating the core project identity.

## **32.2 P0 — Essential**

* Machine scene.  
* Hopper interaction.  
* Bean transfer.  
* Cup dragging.  
* Three-button model.  
* State engine.  
* Grinding.  
* Mechanical pause.  
* Brewing.  
* Ready-to-pour.  
* Finite dispensing.  
* Aligned cup fill.  
* Stop pouring.  
* Completion.  
* Reset.  
* Essential audio/visual feedback.  
* Reliable performance.

## **32.3 P1 — Approved Extended Experience**

* Partial capture.  
* Surface spills.  
* Cup movement during active pouring.  
* Overflow.  
* Steam.  
* Refined camera choreography.  
* Detailed audio mixing.  
* Cinematic reset.  
* Advanced material refinement.

These are part of the approved full experience and should be complete before declaring the full artistic vision finished.

## **32.4 P2 — Optional**

* Complex heat distortion.  
* Elaborate internal mechanisms.  
* Advanced fluid simulation.  
* High-density particles.  
* Additional cinematic variations.  
* Secondary decorative geometry.

## **32.5 Scope Control Rule**

If technical constraints threaten completion:

1. Protect P0.  
2. Complete P1 using simpler techniques if necessary.  
3. Remove or defer P2.  
4. Do not introduce unrelated features.

---

# **33\. Release Acceptance Gates**

The final release must pass six top-level gates.

## **Gate R1 — Functional Integrity**

* All essential interactions work.  
* State transitions are correct.  
* Preparation-first is preserved.  
* Pouring is user-controlled.  
* Reset is reliable.

## **Gate R2 — Physical Consistency**

* Geometry and interactions align.  
* Cup placement affects coffee capture.  
* Liquid volume is consistent.  
* Spills and overflow are coherent.  
* No visually impossible primary behavior remains.

## **Gate R3 — Cinematic Quality**

* Materials are believable.  
* Lighting is controlled.  
* Camera remains restrained.  
* Animation feels tactile.  
* Sound is synchronized.  
* Pouring is visually satisfying.

## **Gate R4 — Engineering Reliability**

* Automated tests pass.  
* No stale timers.  
* No audio lifecycle leaks.  
* No stuck pointer capture.  
* No unrecoverable normal interaction states.  
* Repeated use is stable.

## **Gate R5 — Performance & Compatibility**

* Target hardware is tested.  
* Target browser is tested.  
* Performance is acceptable.  
* Loading and recovery work.  
* Audio works in the target environment.

## **Gate R6 — Exhibition Operation**

* Production build is deployed.  
* Launch and reset are documented.  
* Operator recovery is documented.  
* Final version is identifiable.  
* Complete visitor rehearsal passes.

A release is exhibition-ready only when all six gates pass.

---

# **34\. Final Exhibition Runbook**

## **34.1 Before Opening the Exhibition**

1. Start the exhibition computer.  
2. Connect and verify the intended display.  
3. Connect speakers and input device.  
4. Launch the approved production build.  
5. Verify the browser and display settings.  
6. Confirm the machine appears correctly.  
7. Perform a complete test interaction.  
8. Confirm that sound operates.  
9. Reset the experience.  
10. Leave the machine in the canonical initial OFF condition.

## **34.2 During the Exhibition**

The experience should remain available for visitor interaction.

Normal visitor operation requires no external instructional controls.

The system should automatically recover from ordinary abandoned sessions.

## **34.3 Manual Reset**

Press `R` on the exhibition keyboard.

The experience should return to its original condition.

## **34.4 Browser Failure**

If the application becomes unresponsive:

1. Attempt operator reset where possible.  
2. If unsuccessful, reload the application.  
3. Confirm the model and audio initialize correctly.  
4. Restore fullscreen/kiosk mode if necessary.  
5. Verify the initial state before the next visitor.

## **34.5 Audio Failure**

If the machine is visually functional but silent:

1. Check system volume.  
2. Check browser audio permissions and mute state.  
3. Confirm an initial visitor gesture has occurred.  
4. Restart the session or page if necessary.  
5. Recheck machine audio.

## **34.6 Rendering Failure**

If the machine fails to render:

1. Check the browser.  
2. Check local/server availability.  
3. Reload.  
4. Restart the browser if required.  
5. Restart the local server if applicable.  
6. Confirm WebGL support and the production build.

## **34.7 End of Exhibition**

Record any issues observed during operation.

Preserve the final build, release identifier, and any relevant defect notes.

---

# **35\. Final Documentation Deliverables**

The completed project should contain:

## **35.1 Product Documentation**

* RITUAL-00 — Project Definition & Scope.  
* RITUAL-01 — Reference & Concept.  
* RITUAL-02 — 3D Assets & Scene Specification.  
* RITUAL-03 — Interaction & Experience Specification.  
* RITUAL-04 — Cinematic & Sensory Design System.  
* RITUAL-05 — Technical Architecture & Engineering Specification.  
* RITUAL-06 — Implementation Roadmap & Quality Assurance.

## **35.2 Asset Documentation**

* Blender source.  
* Production GLB.  
* Final node manifest.  
* Material/texture inventory.  
* Spatial-anchor reference.  
* Asset export information.  
* Reference renders.

## **35.3 Engineering Documentation**

* README.  
* Setup instructions.  
* Build commands.  
* Architecture notes.  
* Configuration reference.  
* Deployment instructions.  
* Debugging/recovery instructions.

## **35.4 Quality Documentation**

* Test matrix.  
* Automated test results.  
* Visual review record.  
* Sound review record.  
* Performance report.  
* Defect log.  
* Release acceptance record.

## **35.5 Exhibition Documentation**

* Launch procedure.  
* Device/browser specification.  
* Operator reset.  
* Failure recovery.  
* Final release identifier.  
* Handoff checklist.

---

# **36\. Master Definition of Done**

Ritual is complete when every applicable item in the following checklist has been verified.

## **36.1 Concept & Scope**

* Original creative direction preserved.  
* Project name is Ritual.  
* No conventional visible interface introduced.  
* Machine remains believable.  
* Primary interaction scope is complete.  
* Unnecessary features have been excluded.

## **36.2 Assets**

* Production Blender asset verified.  
* Required hierarchy validated.  
* Pivots are correct.  
* Materials are acceptable.  
* Cup interior supports fill.  
* Bean supply supports transfer.  
* Nozzle and spatial anchors are correct.  
* Export is valid and optimized.

## **36.3 Interaction**

* Hopper opens and closes.  
* Beans can be physically transferred.  
* Bean transfer is possible before Power.  
* Cup starts unaligned.  
* Cup can be positioned.  
* Buttons behave independently.  
* Invalid actions are handled.  
* Input ownership is reliable.

## **36.4 Mechanical Sequence**

* Power activation works.  
* Make guards are correct.  
* Grinding operates.  
* Mechanical pause occurs.  
* Brewing operates.  
* Ready-to-pour is reached.  
* No automatic pour occurs.  
* Preparation timing is correct.

## **36.5 Coffee**

* Pour starts on visitor command.  
* Pour stops on visitor command.  
* Finite batch is enforced.  
* Coffee appears visually believable.  
* Cup fills correctly.  
* Partial capture works.  
* Surface miss works.  
* Cup movement changes capture.  
* Overflow works.  
* Volume accounting remains valid.  
* Stream termination is natural.

## **36.6 Cinematic Presentation**

* Hero composition is approved.  
* Lighting is refined.  
* Materials are believable.  
* Machine movement feels physical.  
* Camera choreography supports the process.  
* Manual camera input takes priority.  
* Coffee pour is the hero moment.  
* Steam and atmosphere remain restrained.  
* Reset presentation is coherent.

## **36.7 Audio**

* Appropriate physical sounds exist.  
* Grinding and brewing sound distinct.  
* Sound follows machine state.  
* Pour sound follows actual emission.  
* Sound levels are appropriate.  
* Audio unlock works.  
* Reset cancels active audio.  
* Visual interaction remains usable without audio.

## **36.8 Reliability**

* State transitions are deterministic.  
* No duplicate process timelines exist.  
* Reset works from every state.  
* Pending operations are cancelled.  
* Pointer ownership is released.  
* Background tab handling works.  
* Rendering recovery is defined and tested.  
* Multiple complete cycles remain stable.

## **36.9 Testing**

* Domain tests pass.  
* Spatial tests pass.  
* Volume tests pass.  
* Integration tests pass.  
* Browser interaction tests pass.  
* Visual review passes.  
* Sound review passes.  
* Performance review passes.  
* Usability testing has been conducted.  
* No S0 or S1 defects remain.

## **36.10 Delivery**

* Production build succeeds.  
* Final site runs on target hardware.  
* Deployment is verified.  
* Exhibition reset works.  
* Operator recovery procedure is documented.  
* Final release identifier is recorded.  
* Project documentation matches the delivered experience.  
* Final acceptance is granted.

---

# **37\. Final Release Decision**

The project must not be declared finished simply because the full sequence can be demonstrated once.

A complete Ritual release requires evidence that the system behaves correctly under normal, invalid, interrupted, and repeated use.

The final acceptance decision should record:

**Release version:** To be assigned.

**Repository commit:** To be recorded.

**Production environment:** To be recorded.

**Exhibition hardware:** To be recorded.

**Functional acceptance:** Pending.

**Cinematic acceptance:** Pending.

**Engineering acceptance:** Pending.

**Performance acceptance:** Pending.

**Exhibition acceptance:** Pending.

**Outstanding defects:** To be documented.

**Final status:** Not yet released.

A future release may be classified as:

* **Development:** Core implementation underway.  
* **Feature Complete:** Required features implemented; verification may remain.  
* **Release Candidate:** Core acceptance tests pass; final validation underway.  
* **Exhibition Ready:** All release gates passed.  
* **Released:** Approved build deployed for intended use.

---

# **38\. Final Execution Statement**

Ritual begins with a simple creative idea:

A believable physical coffee machine, operated directly by a visitor, presented with the care and restraint of premium product cinematography.

The implementation must protect that idea through every engineering decision.

The 3D assets must be structured for interaction.

The machine must behave according to explicit state rules.

The visitor must prepare the ingredients.

The buttons must have clear physical responsibilities.

Grinding and brewing must unfold with deliberate timing.

The finished coffee must wait for the visitor.

Pouring must remain under the visitor's control.

The liquid must respond to the actual cup position.

Spills and overflow must have consistent physical consequences.

The camera, lighting, animation, and sound must reinforce those actions.

Reset must restore the complete experience for the next visitor.

The final result should feel simple because its engineering has been carefully designed.

It should feel cinematic because its presentation has been carefully directed.

It should feel physical because every meaningful action produces a coherent response.

And it should feel complete because every subsystem has been verified—not merely implemented.

**Build the foundation.**

**Validate the assets.**

**Implement the behavior.**

**Complete the interactions.**

**Make the process cinematic.**

**Test every consequence.**

**Prove reliability.**

**Refine the experience.**

**Release only when it is ready.**

---

**End of Document 06 — Implementation Roadmap & Quality Assurance**

**Status:** Execution Plan Defined — Ready for Implementation  
**Documentation Set:** RITUAL-00 through RITUAL-06  
**Next Project Stage:** Fresh Implementation — Phase 00 Preflight & Source Control  
**Authority:** Approved Ritual specifications and the acceptance requirements established in this document.