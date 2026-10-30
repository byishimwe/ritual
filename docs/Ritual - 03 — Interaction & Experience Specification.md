# **Ritual**

## **03 — Interaction & Experience Specification**

**Project:** Ritual  
**Tagline:** The Choreography of Espresso  
**Document ID:** RITUAL-03  
**Version:** 1.0 — Behavioral Specification  
**Date:** October 27, 2026  
**Status:** Behavioral Decisions Established — Ready for Engineering  
**Project Type:** Cinematic Interactive 3D Web Experience  
**Parent Documents:** RITUAL-00, RITUAL-01, RITUAL-02  
**Purpose:** Define every meaningful visitor interaction, machine state, transition, prerequisite, physical consequence, interruption, and recovery mechanism.

---

# **1\. Document Purpose & Authority**

## **1.1 Purpose**

This document establishes the complete behavioral contract for Ritual.

It defines how visitors operate the coffee machine, how its internal state changes, how objects respond, and how the experience handles successful actions, invalid actions, interruptions, and completion.

It is intended to remove ambiguity before implementation.

The engineering team should not need to invent core interaction behavior while writing code.

Every significant action must have:

* A clearly defined trigger.  
* Explicit prerequisites.  
* A predictable state transition.  
* An observable response.  
* Defined behavior when the action is unavailable.  
* Appropriate handling of interruption.  
* A reliable reset path.

## **1.2 Relationship to Other Documents**

**Document 00** defines the project's scope, objectives, and requirements.

**Document 01** establishes the creative concept and intended visitor experience.

**Document 02** defines physical assets, hierarchy, pivots, and spatial references.

**Document 03** specifies the behavioral rules connecting those assets.

**Document 04** will define the exact cinematic execution of those behaviors.

**Document 05** will define their implementation architecture.

**Document 06** will establish development sequencing and verification.

## **1.3 Source of Truth**

This document follows the original preparation-first concept.

The approved canonical journey is:

**Discover → Open Hopper → Add Beans → Close Hopper → Position Cup → Power On → Make → Grind → Pause → Brew → Ready → Pour → Result → Reset**

This is the intended demonstration sequence.

The system must not force unnecessary ordering between independent preparatory interactions.

For example, the cup may be moved before the hopper is opened.

However, mechanical processing must respect its defined prerequisites.

## **1.4 Decision Policy**

All major behavioral questions are resolved within this specification.

Where the original concept left details open, this document selects a coherent default consistent with:

* Physical plausibility.  
* Visitor agency.  
* Exhibition usability.  
* Cinematic pacing.  
* Implementation simplicity.  
* Reliable repeatability.

Exact spatial coordinates remain dependent on the verified production asset.

Those measurements are calibration tasks rather than unresolved interaction-design decisions.

---

# **2\. Fundamental Interaction Philosophy**

## **2.1 The Object Is the Interface**

Visitors interact with the actual three-dimensional objects.

The normal experience does not contain:

* Instructional overlays.  
* External action buttons.  
* Navigation.  
* Tooltips.  
* Textual error messages.  
* Artificial progress panels.  
* Gameplay indicators.  
* Completion screens.

Physical objects communicate the available interactions.

## **2.2 Meaningful Direct Manipulation**

Primary interactions must not become unrelated clicks that simply change application state.

Opening the hopper must move the lid.

Adding beans must involve an observable physical transfer.

Moving the cup must reposition the vessel.

Pressing a button must produce tactile feedback.

The system should behave like a manipulable physical installation.

## **2.3 User Agency**

The visitor controls:

1. Camera exploration.  
2. Hopper operation.  
3. Bean transfer.  
4. Cup positioning.  
5. Power activation.  
6. Beginning preparation.  
7. Beginning dispensing.  
8. Stopping dispensing.

The machine controls:

1. Grinding.  
2. The mechanical transition pause.  
3. Brewing.  
4. Internal preparation timing.  
5. Completion of the prepared batch.

This distinction must remain visible in both system behavior and cinematic direction.

## **2.4 Physical Cause and Effect**

The fundamental interaction model is:

**Action → Mechanical response → State change → Observable consequence**

A successful action must not merely update internal application data.

Its result should be perceptible through the object or scene.

## **2.5 Forgiving but Not Artificial**

Interactions should be accessible to first-time exhibition visitors.

Hit targets, drag behavior, and placement tolerances should be forgiving.

However, the system should not completely ignore physical position.

For example, moving a cup near the outlet can be easy, but coffee should not travel sideways to reach a badly positioned cup.

## **2.6 Cinematic Control Must Never Break Interaction**

The camera may guide attention during important events.

However:

* Active object dragging takes priority over camera orbiting.  
* Cinematic transitions cannot change the meaning of an interaction.  
* Camera movement must not alter world-space object positions.  
* A visitor must not lose a dragged object because a camera animation begins.

The camera is a presentation system, not the authority for machine behavior.

---

# **3\. Canonical Experience Journey**

## **3.1 Initial Condition**

The scene begins with:

* Machine powered off.  
* Hopper closed.  
* Hopper empty.  
* Bean supply available.  
* Bean container resting at its starting location.  
* Cup empty.  
* Cup resting away from its correct dispensing position.  
* All three buttons at rest.  
* No active machine sounds.  
* No coffee stream.  
* No steam from a completed drink.  
* No spill.  
* No visible cup fill.  
* Camera in the initial hero composition.

The machine is immediately visible.

The visitor may begin exploring without a separate Start button.

## **3.2 Intended Journey**

| Step | Visitor or machine action | Result |
| ----- | ----- | ----- |
| 01 | Visitor explores | Machine and props become familiar |
| 02 | Visitor opens hopper | Lid exposes the bean compartment |
| 03 | Visitor transfers beans | Beans enter and settle in hopper |
| 04 | Visitor closes hopper | Machine is physically prepared |
| 05 | Visitor positions cup | Cup approaches outlet alignment |
| 06 | Visitor presses Power | Machine wakes |
| 07 | Visitor presses Make | Preparation starts |
| 08 | Machine grinds | Mechanical grinding activity |
| 09 | Machine pauses | Brief transitional silence |
| 10 | Machine brews | Internal brewing process |
| 11 | Machine becomes ready | Prepared coffee awaits dispensing |
| 12 | Visitor presses Pour | Liquid begins flowing |
| 13 | Visitor observes or moves cup | Correct filling or spilling |
| 14 | Visitor stops pour, or batch empties | Dispensing ends |
| 15 | Machine displays result | Stable completed state |
| 16 | Reset occurs | Original scene is restored |

## **3.3 Independent Preparatory Actions**

Before brewing starts, the following actions can occur in different orders:

* Camera exploration.  
* Cup movement.  
* Hopper opening.  
* Bean transfer.  
* Hopper closure.  
* Power activation.

The canonical presentation encourages preparation before Power, but the system does not artificially prevent Power from being pressed early.

If the visitor powers on the machine before adding beans, the machine activates but cannot begin brewing until the ingredient requirements are satisfied.

**Important distinction:** Preparation-first is the intended visitor journey; it is not an unnecessary global ordering lock.

## **3.4 Processing Dependencies**

The machine may begin preparation only when:

1. Power is on.  
2. Beans have been successfully added.  
3. The hopper lid is closed.  
4. No existing preparation or dispensing cycle is active.

Cup alignment is deliberately not a brewing prerequisite.

This allows the visitor to discover the consequences of pouring without a correctly positioned cup.

## **3.5 One-Batch Experience**

One successful Make action produces one prepared batch.

That batch may be dispensed through one visitor-controlled pouring operation.

When the visitor deliberately stops pouring, the batch is considered finished.

Alternatively, the batch ends naturally when the available prepared coffee is exhausted.

A second brewing cycle requires replay/reset.

This decision prevents ambiguous leftover-coffee states and keeps the exhibition journey focused.

---

# **4\. Behavioral State Model**

## **4.1 State Architecture Principle**

Ritual must not be represented as one enormous enumeration combining every possible condition.

Machine processing, hopper preparation, cup placement, and ingredient transfer are related but distinct concerns.

The recommended conceptual model separates:

1. Machine process state.  
2. Hopper state.  
3. Bean supply state.  
4. Cup spatial state.  
5. Coffee output state.  
6. Interaction activity.

The application should maintain these domains coherently.

## **4.2 Primary Machine States**

The primary machine-state sequence is:

OFF  
 \|  
 \| Power On  
 v  
IDLE\_ON  
 \|  
 \| Make (when prepared)  
 v  
GRINDING  
 \|  
 v  
TRANSITION  
 \|  
 v  
BREWING  
 \|  
 v  
READY\_TO\_POUR  
 \|  
 \| Pour  
 v  
POURING  
 \|  
 \| Stop or batch exhausted  
 v  
COMPLETE  
 \|  
 \| Power Off / Auto-reset  
 v  
RESETTING  
 \|  
 v  
OFF

The powered-on preparation state is represented by `IDLE_ON`, with additional readiness derived from bean and hopper conditions.

No separate duplicate `READY_TO_BREW` state is required.

## **4.3 Machine State Definitions**

| State | Meaning |
| ----- | ----- |
| `OFF` | Machine is dormant; preparation props can be manipulated |
| `IDLE_ON` | Machine is powered but not processing |
| `GRINDING` | Machine is actively grinding beans |
| `TRANSITION` | Grinding has stopped; brewing has not started |
| `BREWING` | Machine is preparing coffee |
| `READY_TO_POUR` | Coffee is prepared and waiting |
| `POURING` | Coffee is being dispensed |
| `COMPLETE` | Dispensing has ended; result is visible |
| `RESETTING` | Scene and all systems are returning to the initial condition |

These names describe the conceptual contract. Engineering naming may differ only if the meaning remains unambiguous.

## **4.4 Hopper State**

The hopper has two stable states:

* `CLOSED`  
* `OPEN`

Its visual movement may also pass through opening and closing animation phases.

Those animations do not need to become separate global machine states.

However, brewing must not begin while the lid is moving or open.

## **4.5 Bean Supply State**

The bean supply has four relevant states:

* `AVAILABLE`  
* `DRAGGING`  
* `TRANSFERRING`  
* `LOADED`

`AVAILABLE`: Beans are present in the original supply.

`DRAGGING`: Visitor is manipulating the supply.

`TRANSFERRING`: A successful transfer animation is underway.

`LOADED`: Beans are in the hopper, and the supply has been consumed for this cycle.

The bean supply may also return to `AVAILABLE` after an unsuccessful placement.

## **4.6 Cup State**

Cup state should be represented primarily by spatial data, not only a boolean such as `cupAligned`.

The cup requires:

* Current position.  
* Starting position.  
* Dragging status.  
* Spatial relationship to outlet.  
* Current liquid volume.

Alignment should be derived from geometry.

The cup can transition continuously between:

* Outside the receiving region.  
* Partially aligned.  
* Fully aligned.

## **4.7 Coffee Output State**

The coffee output system maintains:

* Prepared coffee remaining.  
* Total coffee dispensed.  
* Coffee captured by cup.  
* Current cup fill.  
* Coffee missed onto the stage.  
* Coffee overflowed from the cup.  
* Whether the stream is active.

These values must remain internally consistent.

## **4.8 State Invariants**

The following conditions must always hold:

1. Coffee cannot flow before a batch has been prepared.  
2. Brewing cannot start without beans.  
3. Brewing cannot start with the hopper open.  
4. Only one grinding/brewing sequence can exist at once.  
5. Only one dispensing operation can exist at once.  
6. Prepared coffee volume cannot become negative.  
7. Cup fill cannot exceed its modeled usable capacity.  
8. Overflow volume cannot be negative.  
9. The hopper cannot open during active grinding or brewing.  
10. Reset cancels all previous pending operations.  
11. Coffee effects must correspond to the actual output state.  
12. Machine sounds must correspond to active machine states.  
13. Cup movement must not alter the amount of coffee already collected.  
14. The camera must not determine whether an interaction is valid.  
15. After reset, state and visible geometry must agree.

---

# **5\. Global Action Availability**

The following matrix defines the normal behavior of primary actions.

| Action | OFF | IDLE\_ON | GRINDING / TRANSITION / BREWING | READY\_TO\_POUR | POURING | COMPLETE |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| Explore camera | Yes | Yes | Yes\* | Yes | Yes\* | Yes |
| Open/close hopper | Yes | Yes | Locked | Locked | Locked | Locked |
| Transfer beans | Yes | Yes | Locked | Locked | Locked | Locked |
| Move cup | Yes | Yes | Yes | Yes | Yes | Yes |
| Power button | Turn on | Turn off | No normal effect | No normal effect | No normal effect | Turn off/reset |
| Make button | Unavailable | Conditional | Unavailable | Unavailable | Unavailable | Unavailable |
| Pour button | Unavailable | Unavailable | Unavailable | Start | Stop | Unavailable |
| Operator reset | Yes | Yes | Yes | Yes | Yes | Yes |

\* Camera control remains possible during mechanical activity and pouring, but guided cinematic movement must yield appropriately to active visitor input.

During `RESETTING`, all normal visitor inputs are ignored until the initial state is restored.

---

# **6\. Hopper Interaction Specification**

## **6.1 Interaction Goal**

The visitor discovers that the hopper lid is a movable physical component and uses it to prepare the machine for beans.

## **6.2 Input**

Primary desktop input:

**Click or tap the hopper lid.**

A click toggles between the permitted open and closed states.

The lid does not require freeform physical dragging.

This is deliberate: a controlled hinge animation is more reliable for an exhibition and can feel physically convincing through timing and feedback.

## **6.3 Open Hopper**

### **Preconditions**

* Machine is `OFF` or `IDLE_ON`.  
* No ingredient-transfer animation is currently running.  
* Lid is closed or settling into its stable closed position.

### **Action**

Visitor selects the hopper lid.

### **Response**

* Lid begins opening.  
* Mechanical opening sound plays.  
* Lid rotates around the authored hinge.  
* Hopper opening becomes accessible.  
* Lid settles into its approved open position.

### **State Result**

`hopperState = OPEN`

The machine's power condition is unchanged.

## **6.4 Close Hopper**

### **Preconditions**

* Machine is `OFF` or `IDLE_ON`.  
* No beans are actively transferring.  
* Lid is open.

### **Response**

* Lid begins closing.  
* Mechanical closure sound plays.  
* Lid settles into its closed position.

### **State Result**

`hopperState = CLOSED`

If beans are present and power is on, the machine now satisfies the hopper-related preparation requirements.

## **6.5 Rapid Repeated Clicks**

Repeated clicks during the hinge animation must not create overlapping animation timelines.

The chosen policy is:

**Latest valid target wins.**

If the visitor clicks during opening, the lid may smoothly reverse toward closing, provided no bean transfer is active.

The current interpolated transform becomes the starting point for the new movement.

This avoids abrupt snapping and accumulated animations.

## **6.6 Locked Hopper**

The lid is locked from the beginning of grinding until reset.

This includes:

* `GRINDING`  
* `TRANSITION`  
* `BREWING`  
* `READY_TO_POUR`  
* `POURING`  
* `COMPLETE`

While locked:

* Clicking the lid does not move it.  
* No new opening animation begins.  
* The machine process is not interrupted.

## **6.7 Hopper While Beans Are Transferring**

The lid cannot close during an accepted bean-transfer animation.

This prevents beans from visibly passing through a closed lid.

Once transfer finishes, normal closing becomes available.

## **6.8 Beans Already Loaded**

Before brewing, the visitor may reopen the hopper after loading beans.

Previously loaded beans remain in the hopper.

The visitor cannot add the same supply again.

The hopper must be closed before Make becomes valid.

---

# **7\. Coffee Bean Interaction Specification**

## **7.1 Interaction Goal**

Bean preparation must feel like transferring a physical ingredient.

The visitor should not simply click beans and see them teleport into the hopper.

## **7.2 Selected Interaction Model**

**Drag-to-transfer with a guided completion animation.**

The visitor directly manipulates the bean container or equivalent supply object.

A successful release near the open hopper initiates a controlled bean-pouring animation.

This provides physical agency while avoiding the complexity of full rigid-body bean simulation.

## **7.3 Initial Condition**

* Bean supply is present.  
* Bean container is at its designated starting position.  
* Hopper is empty.  
* Hopper lid is closed.  
* Machine is powered off.

## **7.4 Begin Drag**

### **Trigger**

Pointer down or touch start on the bean container's interactive region.

### **Preconditions**

* Bean supply is `AVAILABLE`.  
* Machine is `OFF` or `IDLE_ON`.  
* No reset is active.

### **Result**

* Bean supply enters `DRAGGING`.  
* Pointer ownership is assigned to the bean interaction.  
* Camera orbiting is suspended for that pointer.  
* The object follows a controlled drag mapping.  
* Subtle pickup feedback is produced.

The hopper may still be closed when dragging begins.

The visitor can attempt to bring the container toward it, but successful transfer requires an open hopper.

## **7.5 Drag Movement**

The container should follow the visitor's gesture smoothly.

Movement must remain spatially controlled.

It should not:

* Pass through the machine body.  
* Disappear behind the camera.  
* Become detached from the pointer.  
* Orbit around an unrelated pivot.  
* Move into inaccessible areas.

The exact mapping from pointer to world space will be chosen during implementation.

The observable requirement is a reliable, intuitive physical gesture.

## **7.6 Successful Transfer Conditions**

A release is accepted only when:

1. Hopper lid is fully open.  
2. Bean supply is available.  
3. Container's pouring reference is within the valid target region near the hopper opening.  
4. The machine is not processing.  
5. No conflicting transfer is active.

The target region should be more forgiving than a strict point intersection.

The target tolerance should be calibrated against the actual hopper geometry.

The recommended behavior is to allow a reasonable near-hopper release and guide the container into the exact final pouring pose.

## **7.7 Successful Transfer Sequence**

The accepted sequence is:

1. Visitor releases the container near the hopper.  
2. Container smoothly settles into an appropriate pouring position.  
3. Container tilts toward the hopper.  
4. Beans visibly leave the supply.  
5. Beans fall through the hopper opening.  
6. Beans settle inside.  
7. A natural bean-rattling sound reinforces the event.  
8. Container returns to its resting position in an emptied condition.  
9. Hopper remains filled.

The physical transfer, not the pointer release alone, determines when the loading sequence is complete.

## **7.8 State Commitment**

When the transfer begins:

`beanSupplyState = TRANSFERRING`

When transfer completes successfully:

* `beanSupplyState = LOADED`  
* `beansLoaded = true`  
* Hopper filled visual becomes active.  
* Supply no longer displays a full quantity of beans.

The transfer is a one-time operation per cycle.

## **7.9 Invalid Transfer**

If the visitor releases the bean container away from the valid hopper region:

* No beans are transferred.  
* The container returns naturally to its starting position.  
* The supply remains available.  
* No machine preparation state changes.

If the hopper is closed:

* The transfer is rejected.  
* Beans do not pass through the lid.  
* The container returns safely.

No visible error text appears.

## **7.10 Duplicate Transfer Prevention**

After beans are loaded, additional bean-transfer attempts must not create more beans.

The empty supply can remain visible as a physical prop but no longer initiates a loading operation.

## **7.11 Cancelled Drag**

If the visitor releases outside the canvas, cancels the pointer, loses pointer capture, or the browser interrupts the gesture:

* The drag ends.  
* No beans are consumed.  
* The container returns to its starting position.  
* Camera control becomes available again.

## **7.12 Preparation-First Requirement**

This rule is explicit:

**Coffee beans can be added while the machine is powered off.**

Power activation is not a prerequisite for ingredient transfer.

This is a fundamental requirement of Ritual.

---

# **8\. Cup Interaction Specification**

## **8.1 Interaction Goal**

The visitor must physically position the cup beneath the coffee outlet.

The position should have meaningful consequences during dispensing.

## **8.2 Initial Position**

The cup begins:

* Empty.  
* Resting on the supporting surface.  
* Visible from the initial camera.  
* Outside the correctly aligned receiving position.  
* Close enough for the visitor to understand its relationship to the machine.

The cup must not start automatically centered under the spout.

## **8.3 Selected Interaction Model**

**Direct constrained dragging.**

The visitor selects the cup and moves it across an appropriate horizontal placement area.

The cup remains upright.

The experience does not require free rotation, lifting, tipping, or rigid-body collision simulation.

## **8.4 Begin Drag**

### **Trigger**

Pointer down or touch start on the cup's interactive region.

### **Response**

* Cup becomes the active manipulated object.  
* Camera orbit is suspended for that pointer.  
* The cup follows the drag gesture.  
* Position remains constrained to the permitted area.

## **8.5 Movement Plane**

The cup moves along the supporting surface.

Its vertical position remains stable relative to the surface.

Its permitted horizontal range must include:

* Original resting location.  
* Correct outlet position.  
* Slight misalignment.  
* Clear misalignment.  
* A position where coffee can miss the cup entirely.

The exact movement polygon must be derived from the final stage and machine geometry.

## **8.6 Movement Bounds**

Dragging must prevent the cup from:

* Passing through the machine.  
* Leaving the intended stage.  
* Falling through the surface.  
* Disappearing outside reachable camera framing.  
* Entering an impossible physical location.

When the pointer moves beyond a permitted bound, the cup remains at the nearest valid position.

## **8.7 Correct Placement**

When the cup is positioned beneath the outlet, coffee should fall into its opening.

The cup does not need exact center alignment.

A tolerance region must account for the actual cup opening and stream width.

## **8.8 Alignment Feedback**

The preferred approach is physical rather than overtly instructional.

When a cup is released very near the ideal receiving position, a small, natural settling adjustment may help it align.

This adjustment must remain subtle.

The cup should not jump a significant distance across the stage.

The snap tolerance must be smaller than the range needed to demonstrate meaningful misalignment.

## **8.9 During Machine Processing**

The cup remains movable during grinding, the pause, and brewing.

This allows the visitor to correct or change its position while the machine works.

Cup placement is not a Make prerequisite.

## **8.10 During Pouring**

The cup remains movable while coffee is flowing.

This is an intentional interaction feature.

If the cup moves:

* The cup's existing coffee remains in the cup.  
* The liquid fill representation follows the cup.  
* Incoming coffee continues downward from the stationary machine outlet.  
* The amount entering the cup changes according to current alignment.  
* Coffee missing the cup contributes to a surface spill.

The liquid must not bend unnaturally to follow the cup.

## **8.11 During Completion**

The visitor may still inspect or move the cup in `COMPLETE`.

Moving a filled cup must preserve its displayed coffee level.

The cup remains upright, so no separate sloshing/spilling-from-tilt system is required.

## **8.12 Cup Release**

When the drag ends:

* The cup settles.  
* Its final position remains valid.  
* Camera input is released.  
* The spatial relationship to the outlet is recalculated.

The cup does not automatically return to its starting location until reset.

---

# **9\. Cup Alignment & Liquid Capture**

## **9.1 Design Principle**

Alignment is geometric.

Do not use a permanently stored boolean as the sole authority for whether coffee enters the cup.

The system must evaluate the current relationship between:

* Coffee emission point.  
* Downward stream footprint.  
* Cup opening.  
* Cup orientation.  
* Cup usable radius.

## **9.2 Three Capture Conditions**

**Full Capture**

The falling stream lies comfortably inside the cup opening.

Nearly all incoming coffee enters the cup.

**Partial Capture**

The stream overlaps the cup rim region.

Part of the flow enters the cup while a portion misses.

**Miss**

The stream footprint does not intersect the cup opening.

Coffee falls onto the supporting surface.

## **9.3 Spatial Calculation**

Let:

* `d` \= horizontal distance between the stream center and cup mouth center.  
* `R` \= effective internal cup-mouth radius.  
* `S` \= effective stream radius, including a small practical tolerance.

Then:

* Full capture when `d ≤ R − S`.  
* No capture when `d ≥ R + S`.  
* Partial capture between those limits.

Within the transition region, use a smooth capture fraction rather than an abrupt binary threshold.

The final `R` and `S` values must come from verified geometry and visual tuning.

## **9.4 Effective Mouth Radius**

Use the cup's usable interior radius rather than its outside ceramic diameter.

The thickness of the rim must not count as an unrestricted liquid-accepting area.

## **9.5 Capture Fraction**

Define a capture factor:

`captureFraction ∈ [0, 1]`

Interpretation:

* `1`: All incoming coffee is received by the cup, subject to capacity.  
* `0.5`: Approximately half is received.  
* `0`: The cup receives none.

The factor is recalculated while pouring, including when the cup moves.

## **9.6 Physical Consistency**

The visual stream and capture calculation must agree.

If the stream visibly misses the cup, its volume must not increase.

If the stream visibly enters the cup, the cup should fill unless it is already full.

If the stream hits the rim, a restrained mixed result is appropriate.

---

# **10\. Power Button Behavior**

## **10.1 Role**

The Power button controls machine activation.

It must not start brewing or dispense coffee.

## **10.2 Power On**

### **Preconditions**

`machineState = OFF`

### **Action**

Visitor presses Power.

### **Response**

* Button depresses and releases.  
* Machine activation sound plays.  
* Appropriate integrated indicator activates.  
* Machine becomes operational.

### **State Transition**

`OFF → IDLE_ON`

Hopper, bean supply, and cup conditions remain unchanged.

## **10.3 Power Before Preparation**

Power may be activated before beans are added.

This does not invalidate the preparation-first concept.

The machine simply remains in `IDLE_ON` until required ingredients are supplied.

Make remains unavailable until preparation requirements are satisfied.

## **10.4 Power Off Before Brewing**

While the machine is `IDLE_ON`, pressing Power switches it off.

Transition:

`IDLE_ON → OFF`

The machine becomes dormant.

However:

* Previously loaded beans remain loaded.  
* Hopper state remains unchanged.  
* Cup position remains unchanged.  
* No automatic replay occurs.

This allows a visitor to power the machine on again without repeating ingredient preparation.

## **10.5 Power During Processing**

Normal Power presses are disabled during:

* Grinding.  
* Transition pause.  
* Brewing.

This prevents accidental interruption of the cinematic preparation sequence.

No new machine state is initiated.

The physical control may provide minimal mechanical feedback, but it must not suggest that power-off succeeded.

## **10.6 Power While Ready or Pouring**

Normal Power presses are also disabled while the prepared batch awaits dispensing or is actively being poured.

This avoids ambiguous handling of already prepared coffee.

The operator reset remains available if an interruption is necessary.

## **10.7 Power After Completion**

Once the cycle reaches `COMPLETE`, Power becomes available again.

Pressing Power:

1. Switches off the machine.  
2. Begins the end-of-session restoration sequence.  
3. Returns Ritual to the canonical initial state.

This preserves Power as the physical on/off control.

The full reset itself is an exhibition recovery action initiated after the completed cycle.

## **10.8 Invalid Power Presses**

Invalid presses must never:

* Duplicate machine state changes.  
* Start another animation sequence.  
* Cancel active machine timers.  
* Produce contradictory indicator behavior.

---

# **11\. Make Button Behavior**

## **11.1 Role**

The Make button begins the machine's internal preparation process.

It never directly dispenses coffee.

## **11.2 Preconditions**

A valid Make action requires:

* Machine state is `IDLE_ON`.  
* Beans are loaded.  
* Hopper lid is completely closed.  
* No bean transfer is running.  
* No existing preparation has begun for the cycle.

Cup alignment is not required.

## **11.3 Successful Activation**

When Make is valid:

1. Button depresses.  
2. Press feedback plays.  
3. Machine commits to the preparation cycle.  
4. Hopper and bean preparation become locked.  
5. Grinding begins.  
6. Machine audio, animation, and camera cues respond to the new state.

Transition:

`IDLE_ON → GRINDING`

## **11.4 Missing Beans**

If Make is pressed without beans:

* No grinding begins.  
* No coffee batch is created.  
* No preparation timer starts.  
* Machine remains idle.

The visitor can still open the hopper and add beans.

## **11.5 Hopper Open**

If Make is pressed while the hopper is open or moving:

* Brewing does not begin.  
* Machine remains in `IDLE_ON`.  
* Visitor may close the hopper and try again.

## **11.6 Power Off**

If the machine is OFF:

* Make does not begin preparation.  
* No operating state change occurs.

## **11.7 Repeated Make Presses**

Once preparation begins, further Make presses are unavailable for that cycle.

Repeated clicks must not:

* Restart grinding.  
* Accelerate brewing.  
* Add duplicate timers.  
* Create multiple prepared batches.  
* Re-trigger machine effects.

## **11.8 Bean Consumption**

The transition into grinding marks the loaded ingredient as committed to this batch.

The hopper's visible bean representation may diminish during grinding.

The logical ingredient supply must remain unavailable for further use until reset.

---

# **12\. Grinding, Pause & Brewing**

## **12.1 Process Ownership**

The machine owns the preparation timeline.

The visitor starts it with Make, but does not need to perform additional actions during its internal operation.

## **12.2 Selected Timing Baseline**

The initial behavioral timing is:

| Stage | Duration |
| ----- | ----- |
| Grinding | 4.0 seconds |
| Mechanical transition pause | 1.2 seconds |
| Brewing | 4.2 seconds |
| Total preparation | 9.4 seconds |

These values establish a working experience rhythm.

Document 04 may refine the exact presentation timing after visual and audio review, but the sequence and independent stage ownership remain fixed.

## **12.3 Grinding State**

Transition:

`IDLE_ON → GRINDING`

Effects:

* Grinder sound begins.  
* Subtle machine vibration becomes active.  
* Appropriate bean-processing animation begins.  
* Any relevant machine-integrated indicator responds.  
* Camera may direct attention according to the cinematic specification.

The process must feel active, not merely delayed.

## **12.4 Grinding Completion**

After the grinding interval:

* Grinding animation settles.  
* Grinder sound stops.  
* Grinding vibration ceases or transitions naturally.  
* Machine enters the deliberate pause.

Transition:

`GRINDING → TRANSITION`

## **12.5 Mechanical Pause**

The machine enters a relatively quiet moment.

The purpose is anticipation and contrast.

No coffee emerges.

The machine should not appear frozen due to a missing animation or sound bug.

A small natural settling response is acceptable.

## **12.6 Brewing Start**

After the pause:

`TRANSITION → BREWING`

Effects:

* Brewing/pump audio begins.  
* Appropriate machine motion begins.  
* A different mechanical rhythm replaces grinding.  
* The scene communicates internal preparation.

## **12.7 Brewing Completion**

After brewing:

1. Machine processing sounds stop or settle.  
2. Mechanical movement returns to rest.  
3. One finite prepared coffee batch is created.  
4. A subtle integrated readiness cue may activate.  
5. The machine waits for the visitor.

Transition:

`BREWING → READY_TO_POUR`

## **12.8 No Automatic Dispensing**

Brewing completion must never automatically activate the coffee stream.

The Pour button remains the exclusive normal trigger for dispensing.

## **12.9 Preparation Timing Reliability**

All stages must derive from one authoritative process timeline.

The experience must not rely on several independent animations each deciding when the next state begins.

Animation and audio respond to the process state.

They do not independently own the machine's logical completion.

---

# **13\. Ready-to-Pour State**

## **13.1 Role**

`READY_TO_POUR` is a significant interaction and cinematic moment.

The machine has completed its internal work.

The visitor now controls the final output.

## **13.2 State Conditions**

On entry:

* Grinding has completed.  
* Brewing has completed.  
* Prepared coffee is available.  
* Coffee stream is inactive.  
* Cup remains wherever the visitor last positioned it.  
* Machine is powered on.  
* Pour is available.

## **13.3 Visual Communication**

A subtle machine-integrated indicator may signal readiness.

Acceptable techniques include:

* A physical status light.  
* A restrained button indicator.  
* A minor machine settling response.  
* A change in mechanical sound.

Unacceptable techniques include:

* "READY TO POUR" text.  
* A floating action button.  
* A tooltip.  
* A large glowing arrow.  
* An instructional overlay.

## **13.4 Waiting**

The machine remains ready until:

* The visitor presses Pour.  
* An operator reset occurs.  
* The inactivity-reset policy applies.

No coffee flows while waiting.

## **13.5 Cup Movement**

The cup remains movable.

The visitor may align it before pouring.

The system must not silently snap it to the correct destination.

---

# **14\. Prepared Coffee & Volume Model**

## **14.1 Core Decision**

Coffee supply is finite.

The machine does not generate an unlimited stream.

This improves physical credibility and guarantees a natural end to unattended pouring.

## **14.2 Normalized Volume Model**

To keep the simulation independent of the eventual exact cup geometry, define the cup's normal usable capacity as:

`C = 1.0 cup unit`

The prepared batch contains:

`B = 1.30 cup units`

The standard dispensing rate is:

`Q = 0.125 cup units per second`

For a fully aligned empty cup:

* Normal fill time: approximately 8.0 seconds.  
* Total available pour time: approximately 10.4 seconds.  
* Possible overflow: up to 0.30 cup units.

These are behavioral proportions rather than claims about a particular commercial espresso recipe.

If the final ceramic cup is calibrated to approximately 80 mL of usable volume, the prepared batch corresponds to approximately 104 mL.

The model is intentionally art-directed to demonstrate a small overflow consequence.

## **14.3 Why the Batch Exceeds Cup Capacity**

The original concept requires the possibility of overfilling a cup.

The chosen finite-batch model accomplishes this without infinite coffee or an arbitrary visual timer.

The difference between batch and cup capacity should remain moderate.

The overflow must look like a small physical consequence, not a dramatic flood.

## **14.4 Single Prepared Batch**

One Make action produces one batch.

The prepared amount is created when brewing finishes, not when Pour is pressed.

The total volume cannot increase during dispensing.

## **14.5 Volume Conservation**

All dispensed coffee must be allocated among:

* Coffee captured in the cup.  
* Coffee spilled onto the surface.  
* Coffee overflowed from the cup.

The volume remaining in the machine decreases by the dispensed amount.

No volume should be created or destroyed during an active pour, apart from deliberate finalization of an unfinished batch after the user stops.

## **14.6 Asset Calibration**

The normalized volume model must map to the real cup interior geometry.

The cup's visible fill height should correspond to its modeled interior volume, not blindly to a world-space vertical distance.

For a tapered cup, equal increments of volume may produce unequal increments in liquid height.

The engineering implementation should account for this geometrically or through a suitable approximation.

---

# **15\. Pour Button Behavior**

## **15.1 Role**

Pour controls the release of prepared coffee.

It does not grind beans or begin brewing.

## **15.2 Start Pouring**

### **Preconditions**

`machineState = READY_TO_POUR`

Prepared coffee remaining is greater than zero.

### **Action**

Visitor presses Pour.

### **Response**

* Physical button depresses.  
* Dispensing begins.  
* Coffee appears at the outlet.  
* Pouring audio begins.  
* Liquid falls toward the appropriate physical destination.  
* Cup filling or spilling is evaluated continuously.

### **Transition**

`READY_TO_POUR → POURING`

## **15.3 During Pouring**

While `POURING`:

* Prepared coffee decreases over time.  
* Liquid output remains active.  
* Cup capture is computed continuously.  
* Cup fill rises where appropriate.  
* Spill/overflow is accumulated.  
* The visitor may move the cup.  
* Pour remains available as a stop control.

## **15.4 Stop Pouring**

When the visitor presses Pour again:

1. Dispensing is stopped.  
2. The stream transitions out naturally.  
3. Pouring sound stops.  
4. The current cup fill remains visible.  
5. The resulting spill/overflow remains visible.  
6. The batch is finalized.

Transition:

`POURING → COMPLETE`

## **15.5 Stop Is Final for the Batch**

Stopping Pour deliberately completes the current dispensing operation.

It does not introduce a hidden paused state requiring the visitor to guess whether another press will resume.

Any unused prepared coffee is considered discarded or unavailable for further dispensing during the current exhibition cycle.

A new batch requires reset.

This keeps the interaction understandable:

**Press once to pour. Press again to finish.**

## **15.6 Automatic Batch Exhaustion**

If the visitor does not stop pouring, the stream must end when the prepared batch is empty.

Transition:

`POURING → COMPLETE`

This prevents unlimited spilling.

## **15.7 Pour Without Cup**

The machine does not require a correctly positioned cup.

If the cup is absent from the stream footprint:

* Coffee flows normally.  
* Cup fill remains unchanged.  
* Coffee falls onto the receiving surface.  
* A small spill effect becomes visible.  
* The batch continues until stopped or exhausted.

This is an intentional consequence, not a software error.

## **15.8 Pour Before Ready**

Pour is unavailable before brewing completes.

The machine must not:

* Emit coffee.  
* Reduce prepared volume.  
* Trigger the pour sound.  
* Skip brewing.  
* Change process state.

## **15.9 Repeated Pour Input**

Input must be debounced sufficiently to prevent a single physical click from triggering both start and stop.

Rapid distinct presses are allowed, but actions must be processed sequentially.

---

# **16\. Continuous Liquid Simulation Behavior**

## **16.1 Stream Origin**

The stream originates from the authored `CoffeeExitAnchor` or the approved nozzle anchors.

It must not emerge from the approximate center of the entire machine.

## **16.2 Stream Direction**

Coffee falls downward from the outlet.

It must not automatically bend toward a moving cup.

## **16.3 Stream Destination**

The stream's visible destination should depend on:

* Current cup position.  
* Cup opening.  
* Current liquid fill height.  
* Supporting surface position.  
* Cup rim overlap.

The stream may visually terminate at the coffee surface inside the cup or at the stage surface.

## **16.4 Frame-Independent Volume Update**

At each simulation update:

`dispensedVolume = min(pourRate × deltaTime, remainingVolume)`

Then:

`remainingVolume -= dispensedVolume`

Volume must advance according to elapsed simulation time, not frame count.

## **16.5 Cup Capture**

For each update:

`potentialCupVolume = dispensedVolume × captureFraction`

`missedVolume = dispensedVolume × (1 − captureFraction)`

Cup capacity determines how much of the potential captured amount can be retained.

## **16.6 Cup Fill**

Define:

`availableCupSpace = max(0, cupCapacity − currentCupVolume)`

Then:

`capturedVolume = min(potentialCupVolume, availableCupSpace)`

Update:

`currentCupVolume += capturedVolume`

## **16.7 Overflow**

When potential captured coffee exceeds available space:

`overflowVolume += potentialCupVolume − capturedVolume`

Overflow should only occur when the cup is sufficiently filled.

## **16.8 Surface Spill**

Coffee that misses the cup contributes to the surface spill:

`surfaceSpillVolume += missedVolume`

Overflow also contributes to visible external liquid, but it should be classified separately to support a distinct rim-overflow visual.

## **16.9 Conservation Invariant**

At any point during dispensing:

`totalDispensed = cupVolume + surfaceMissedVolume + overflowVolume`

Allow only negligible floating-point tolerance.

This rule prevents visual and logical contradictions.

## **16.10 Visual Effect Independence**

The exact mesh and particle techniques may be optimized independently.

However, the rendered effects must follow the authoritative liquid-state values.

The visuals must not create a separate, contradictory notion of coffee volume.

---

# **17\. Spill & Overflow Consequences**

## **17.1 Correct Pour**

When fully aligned:

* Stream enters the cup.  
* Cup fill increases.  
* Surface spill remains absent or negligible.  
* Cup may eventually overflow if pouring continues.

## **17.2 Partial Misalignment**

When partially aligned:

* A fraction of the flow enters the cup.  
* The remaining fraction misses or strikes the rim.  
* The cup fills more slowly.  
* A small spill appears.

A simplified visual split is acceptable if it accurately communicates the result.

## **17.3 Complete Miss**

When completely misaligned:

* Cup volume does not increase.  
* Coffee falls onto the supporting surface.  
* Spill volume accumulates.

## **17.4 Moving the Cup Away**

If the cup is moved away while pouring:

* Previously collected coffee remains in the cup.  
* New coffee misses the cup.  
* The surface spill increases.  
* Flow continues until stopped or exhausted.

## **17.5 Moving the Cup Under the Stream**

If the visitor moves the cup under an active stream:

* Incoming coffee begins entering it.  
* Previously spilled coffee remains on the surface.  
* Cup fill responds from its current stored volume.

The system must not retroactively place previously spilled coffee into the cup.

## **17.6 Overflow Threshold**

The cup's normal fill capacity is `1.0 cup unit`.

Once that capacity is reached, subsequent captured coffee contributes to overflow.

## **17.7 Overflow Visual**

The overflow should appear restrained.

Possible visual elements include:

* Liquid cresting the cup rim.  
* A small descending overflow streak.  
* Surface spill near the cup base.  
* A modest puddle.

The final effects belong in Document 04\.

## **17.8 Puddle Behavior**

Spill volume may produce a small puddle on the supporting surface.

The puddle should:

* Grow gradually with spilled volume.  
* Remain spatially plausible.  
* Avoid unlimited expansion.  
* Remain visible after dispensing ends.  
* Disappear during reset.

Detailed fluid flow across the entire countertop is unnecessary.

## **17.9 No Unbounded Accumulation**

The finite batch ensures that the spill cannot grow indefinitely.

The visual system may also impose sensible size limits to preserve the product-stage composition.

---

# **18\. Completion State**

## **18.1 Entry Conditions**

The machine enters `COMPLETE` when:

* The visitor stops pouring, or  
* The available prepared coffee is exhausted.

## **18.2 Completion Response**

On entry:

* Active liquid emission ends.  
* Pouring audio ends.  
* Relevant animations settle.  
* Machine returns to a calm mechanical condition.  
* Cup fill remains visible.  
* Spill and overflow remain visible.  
* A subtle completion atmosphere may persist temporarily.

## **18.3 No Success or Failure Screen**

There is no external success message.

Completion is communicated by the physical result.

Possible outcomes include:

* A correctly filled cup.  
* A partially filled cup.  
* A full cup with small overflow.  
* A partial spill.  
* Coffee entirely missing the cup.

These are different physical outcomes, not separate gameplay scores.

## **18.4 Result Classification**

The system may classify the result internally for rendering or testing.

Suggested categories:

* `CLEAN_FILL`  
* `PARTIAL_FILL`  
* `MIXED_FILL_AND_SPILL`  
* `SURFACE_SPILL`  
* `OVERFLOW`  
* `EMPTY_CUP`

These classifications are descriptive.

They do not appear as textual interface messages.

## **18.5 Result Persistence**

The visible result should remain long enough for the visitor to observe it.

Cup fill and spill geometry must not vanish instantly when Pour stops.

The scene should enter a quiet presentation state before reset.

---

# **19\. Reset & Replay Specification**

## **19.1 Reset as a Core Requirement**

Ritual is an exhibition experience.

It must support multiple visitors without requiring manual manipulation of application state.

Reset is therefore a primary system responsibility.

## **19.2 Selected Reset Mechanisms**

Three mechanisms are approved:

**Automatic completion reset**

After a completed cycle has remained untouched for 20 seconds, the experience resets.

**Physical end-of-cycle reset**

Pressing Power while the machine is in `COMPLETE` powers off the machine and initiates reset.

**Operator reset**

Pressing the keyboard key `R` triggers a safe reset from any state.

The operator shortcut is for exhibition management, not a visible visitor instruction.

## **19.3 Inactivity Reset**

To protect against abandoned sessions:

* Before brewing, after 90 seconds without meaningful visitor interaction, restore the initial scene if any preparation or power state has changed.  
* In `READY_TO_POUR`, reset after 75 seconds without interaction.  
* In `COMPLETE`, reset after 20 seconds without interaction.

The machine must not reset during active grinding, the mechanical pause, brewing, or an active finite pour merely because those stages contain no pointer events.

## **19.4 Initial OFF Condition**

When the experience is already in its untouched initial OFF condition, inactivity should not repeatedly trigger reset animations.

The stage simply remains available for the next visitor.

## **19.5 Meaningful Interaction**

Events that refresh the inactivity clock include:

* Camera exploration.  
* Starting or completing a drag.  
* Hopper operation.  
* Bean transfer.  
* Cup movement.  
* Button interactions.  
* Successful state-changing operations.

Passive camera animation and machine-controlled processing do not count as visitor activity.

## **19.6 Reset Sequence**

Reset must perform the following logical actions:

1. Reject new visitor interaction.  
2. Cancel pending machine transitions.  
3. Stop active procedural or recorded sounds.  
4. Stop coffee emission.  
5. Cancel pending bean transfer.  
6. Cancel active drags.  
7. Restore machine power-off state.  
8. Close hopper.  
9. Restore beans to the original supply.  
10. Empty the hopper.  
11. Restore cup to initial position.  
12. Clear cup coffee volume.  
13. Remove spills and overflow.  
14. Return buttons to resting positions.  
15. Restore relevant camera state.  
16. Clear stale animation references.  
17. Re-enable interaction after restoration.

## **19.7 Visual Reset Treatment**

The reset should not abruptly reveal all objects teleporting to their starting positions.

A restrained cinematic restoration is preferred.

The scene may use a short transition that conceals the instantaneous restoration of consumed ingredients and liquid.

The reset should remain concise rather than becoming an extended cinematic sequence.

## **19.8 Reset Timing**

A recommended restoration duration is approximately 1.0–1.5 seconds.

The logical state reset must be atomic even if the visible transition takes longer.

## **19.9 Reset from Active Processing**

The operator reset must work during:

* Grinding.  
* Pause.  
* Brewing.  
* Ready-to-pour.  
* Pouring.  
* Bean transfer.  
* Cup dragging.

No pending operation from the previous session may resume after the reset.

## **19.10 Reset Idempotency**

Calling reset repeatedly must not:

* Spawn duplicate transitions.  
* Restart stale sounds.  
* Duplicate beans.  
* Change the initial cup position.  
* Leave the machine partly powered.  
* Corrupt the state.

Resetting an already fresh initial scene should be harmless.

---

# **20\. Input Ownership & Interaction Coordination**

## **20.1 Interaction Priority**

Pointer input must be owned by one active interaction at a time.

Priority is:

1. Active object manipulation.  
2. Physical button or lid interaction.  
3. Camera exploration.

The camera must not respond to a pointer being used to drag a cup or bean container.

## **20.2 Pointer Capture**

During object dragging, the interaction should capture the pointer when supported.

The drag should continue smoothly even if the pointer temporarily leaves the object's visible mesh.

## **20.3 Pointer Release**

Pointer release completes or cancels the active gesture.

The gesture must not remain logically active after the pointer is released.

## **20.4 Lost Pointer Capture**

If capture is lost:

* Active dragging ends safely.  
* Bean transfer is cancelled unless already committed.  
* Cup remains at a valid position or is clamped to bounds.  
* Camera control is restored.

## **20.5 Multi-Touch**

If touch support is implemented, a single object drag should not simultaneously trigger camera gestures.

Multi-touch behavior must be deterministic.

The desktop pointer experience remains the primary acceptance target.

## **20.6 Click vs Drag**

Small incidental pointer movement should not accidentally convert button clicks into object drags.

Conversely, a deliberate object drag must not trigger a click action on release.

## **20.7 Input During Cinematic Camera Movement**

If the user begins manual orbiting while the camera is performing a guided movement:

* Manual input takes priority.  
* The camera transition yields or is cancelled smoothly.  
* No object state changes.  
* The machine's process continues normally.

Exact camera interruption behavior will be finalized in Document 04\.

## **20.8 Pointer Affordances**

Contextual cursor changes such as pointer or grab are acceptable on desktop.

They are input affordances, not separate visible interface elements.

Large glowing interaction markers, hover labels, or animated arrows are not part of the approved visual direction.

---

# **21\. Invalid Actions & Feedback**

## **21.1 Principle**

An unavailable action should never corrupt the machine or produce contradictory effects.

The normal experience should not display textual error messages.

## **21.2 Invalid Action Types**

| Action | Condition | Behavior |
| ----- | ----- | ----- |
| Make | Machine off | No preparation |
| Make | Beans missing | No preparation |
| Make | Hopper open | No preparation |
| Make | Brewing already active | Ignore |
| Pour | Coffee not ready | No dispensing |
| Pour | Batch already finished | Ignore |
| Open hopper | Machine processing | Ignore |
| Transfer beans | Hopper closed | Reject transfer and return prop |
| Transfer beans | Beans already loaded | Ignore |
| Power off | Active preparation | Ignore normal press |
| Cup drag | Outside permitted bounds | Clamp position |
| Input | Resetting | Ignore |
| Reset | Any condition | Safely restore initial state |

## **21.3 Physical Feedback Policy**

For invalid button actions:

* A restrained tactile depression may occur if the button is physically operable.  
* No success-related machine response should play.  
* No long error animation should occur.

For invalid bean transfer:

* The container returns to its starting position.  
* The hopper remains unchanged.

For locked hopper interaction:

* The lid remains stationary.

## **21.4 No Punitive Feedback**

Avoid:

* Red error overlays.  
* Warning messages.  
* Failure sounds.  
* Camera shake.  
* Harsh flashing lights.  
* Arbitrary penalties.

Incorrect actions should be understood through consistent physical behavior.

## **21.5 No Hidden Auto-Correction of Major Actions**

The system must not:

* Add beans automatically.  
* Begin brewing automatically.  
* Position the cup automatically from its initial location.  
* Start Pour automatically.  
* Teleport spilled coffee into the cup.

Minor magnetic alignment or gesture assistance is acceptable when it preserves the visitor's actual intention.

---

# **22\. Temporal Reliability & Interruptions**

## **22.1 Authoritative Process Clock**

Grinding, pause, brewing, and dispensing must use an authoritative elapsed-time model.

The state machine owns process transitions.

Visual and audio timelines follow those transitions.

## **22.2 Frame-Rate Independence**

Liquid volume, cup filling, and time-based movement must depend on elapsed simulation time.

They must not depend on a fixed number of rendered frames.

## **22.3 Background Tab Behavior**

If the browser tab becomes hidden:

* Suspend or pause active simulation progress.  
* Suspend active audio as appropriate.  
* Avoid accumulating a large time delta.  
* Avoid allowing liquid volume to jump forward invisibly.

When visibility returns, the experience should continue coherently if the interruption was brief.

## **22.4 Extended Interruption**

If the application has been hidden for more than 60 seconds, restore the initial exhibition state when it becomes visible again.

This prevents visitors from encountering a partially completed or stale session.

## **22.5 Audio Reinitialization**

Audio must respect browser playback policies.

If audio cannot resume automatically after visibility changes, the system should resume it on the next valid user gesture.

The visual interaction must remain functional even when audio is unavailable.

## **22.6 Window Resize**

Resizing the viewport must not alter:

* Machine state.  
* Cup position.  
* Bean preparation.  
* Coffee volume.  
* Current interaction outcome.

Camera framing and input mapping should adapt without resetting the experience.

## **22.7 WebGL Context Loss**

If the rendering context is lost:

* Stop or suspend the active experience safely.  
* Attempt recovery where supported.  
* Restore the scene consistently.  
* Prefer returning to the canonical initial condition after recovery.

## **22.8 Reload**

A full page reload begins a fresh session.

There is no requirement to persist unfinished coffee-making progress across reloads.

## **22.9 No Persistent Application State**

Ritual does not require accounts, saved sessions, or a backend database.

The visitor session is temporary and self-contained.

---

# **23\. State Synchronization & Engineering Contract**

## **23.1 Single Logical Authority**

Machine behavior must be controlled by one consistent state authority.

Buttons must issue commands to that authority rather than independently changing animations, audio, and coffee effects.

## **23.2 Recommended Commands**

The behavioral command surface should include equivalents of:

* `POWER_ON`  
* `POWER_OFF`  
* `OPEN_HOPPER`  
* `CLOSE_HOPPER`  
* `BEGIN_BEAN_DRAG`  
* `CANCEL_BEAN_DRAG`  
* `COMMIT_BEAN_TRANSFER`  
* `COMPLETE_BEAN_TRANSFER`  
* `BEGIN_CUP_DRAG`  
* `UPDATE_CUP_POSITION`  
* `END_CUP_DRAG`  
* `PRESS_MAKE`  
* `ADVANCE_PROCESS`  
* `PRESS_POUR`  
* `TICK_POUR`  
* `RESET`

The final method names are an engineering decision.

The command semantics are not.

## **23.3 State Snapshots**

The application should expose sufficient state for dependent systems to render consistently.

The logical snapshot includes:

**Machine**

* Current process state.  
* Power condition.  
* Process elapsed time.

**Hopper**

* Open/closed state.  
* Active hinge target.  
* Beans loaded.

**Bean Supply**

* Transfer state.  
* Consumed/unconsumed.

**Cup**

* Position.  
* Drag state.  
* Current fill volume.

**Output**

* Prepared volume remaining.  
* Dispensed volume.  
* Surface spill volume.  
* Overflow volume.  
* Stream activity.

**Session**

* Last interaction time.  
* Session generation/reset identifier.  
* Reset status.

## **23.4 Derived Values**

Do not store redundant mutable values when they can reliably be computed.

Examples:

`canMake` derives from machine state, beans loaded, hopper closure, and transfer status.

`canPour` derives from `READY_TO_POUR`.

`captureFraction` derives from current spatial geometry.

`cupFillFraction` derives from cup volume and capacity.

`hasOverflowed` derives from overflow volume.

## **23.5 Transition Events**

Machine transitions should produce events that presentation systems can respond to.

Examples:

* `MACHINE_POWERED_ON`  
* `BEANS_LOADED`  
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

These events should coordinate visual and audio systems without allowing them to redefine machine logic.

## **23.6 Avoid Duplicate Side Effects**

The same event must not accidentally start duplicate sound loops or animation sequences.

A state transition occurs once, even if several scene components observe it.

## **23.7 Session Generation**

Each reset should invalidate all pending operations from the previous cycle.

An operation may apply its result only if it still belongs to the active session.

This is necessary to prevent delayed animations or timers from mutating a fresh session.

## **23.8 Resource Cleanup**

On state exit or reset:

* Stop obsolete audio loops.  
* Kill or complete relevant animations safely.  
* Release pointer capture.  
* Remove temporary effects.  
* Clear pending transitions.  
* Restore the appropriate visual transforms.

---

# **24\. Interaction Feedback & Sensory Events**

## **24.1 Feedback Layers**

A successful interaction may produce feedback through:

1. Physical object motion.  
2. Sound.  
3. Light.  
4. Camera attention.  
5. Environmental response.

Not every interaction requires all five layers.

## **24.2 Required Feedback Matrix**

| Event | Physical feedback | Audio feedback | Camera/lighting |
| ----- | ----- | ----- | ----- |
| Open hopper | Lid rotates | Hinge/latch | Optional subtle attention |
| Add beans | Container tilts, beans fall | Bean rattle | Hopper remains readable |
| Close hopper | Lid settles | Closure | No special takeover |
| Move cup | Cup translates | Light contact where useful | Camera yields to drag |
| Power On | Button depresses | Activation | Integrated light response |
| Make | Button depresses | Mechanical click | Prepare for processing |
| Grinding | Beans/process motion, vibration | Grinder | Controlled mechanical focus |
| Transition | Machine settles | Silence/decay | Hold tension |
| Brewing | Subtle machine activity | Pump/brew | Restrained attention |
| Ready | Machine settles | Subtle cue | Return attention to output |
| Pour | Flow begins | Liquid | Optional outlet/cup emphasis |
| Spill | Puddle appears | Soft liquid impact | No punitive movement |
| Overflow | Liquid crosses rim | Subtle fluid sound | Keep consequence visible |
| Complete | Flow stops, machine settles | Return to quiet | Resting composition |
| Reset | Objects restored | Optional minimal sound | Return to opening frame |

## **24.3 Feedback Timing**

Input acknowledgment should begin promptly.

Longer physical animations may continue after the initial acknowledgment.

A click should not feel unresponsive merely because a subsequent mechanical action takes time.

## **24.4 No Decorative Overreaction**

Avoid unnecessarily strong:

* Button scaling.  
* Camera shake.  
* Color flashes.  
* Glowing outlines.  
* Particles.  
* Loud impact sounds.

The quality of feedback comes from physical coherence and timing.

---

# **25\. Complete Scenario Specifications**

## **Scenario 01 — Ideal Coffee-Making Cycle**

**Initial:** Fresh scene.

1. Open hopper.  
2. Transfer beans.  
3. Close hopper.  
4. Move cup under outlet.  
5. Power on.  
6. Press Make.  
7. Wait through grinding and brewing.  
8. Press Pour.  
9. Allow the cup to fill.  
10. Press Pour before overflow.  
11. Observe the result.  
12. Allow auto-reset or press Power.

**Expected:** Clean fill, stable completed scene, successful reset.

## **Scenario 02 — Power Before Beans**

1. Press Power immediately.  
2. Press Make without beans.  
3. Open hopper.  
4. Add beans.  
5. Close hopper.  
6. Press Make.

**Expected:** Initial Make has no effect. Second valid Make begins preparation. No forced restart.

## **Scenario 03 — Make While Hopper Open**

1. Add beans.  
2. Leave hopper open.  
3. Power on.  
4. Press Make.

**Expected:** Brewing does not start.

Closing the hopper and pressing Make then starts preparation.

## **Scenario 04 — Invalid Bean Transfer**

1. Leave hopper closed.  
2. Drag bean container toward it.  
3. Release.

**Expected:** Beans are not consumed; container returns; hopper remains empty.

## **Scenario 05 — Successful Bean Transfer**

1. Open hopper.  
2. Drag container to target.  
3. Release.

**Expected:** Guided physical transfer, visible falling beans, hopper filled, supply consumed once.

## **Scenario 06 — Rapid Hopper Clicks**

1. Click to open.  
2. Click again during opening.

**Expected:** Lid reverses smoothly or reaches the latest valid target without overlapping animation or becoming stuck.

## **Scenario 07 — Power Toggle Before Brewing**

1. Load beans.  
2. Position cup.  
3. Power on.  
4. Power off.  
5. Power on.  
6. Press Make.

**Expected:** Preparatory state remains intact. Brewing begins normally.

## **Scenario 08 — Repeated Make Presses**

1. Prepare machine.  
2. Press Make.  
3. Press Make repeatedly while grinding/brewing.

**Expected:** Exactly one preparation cycle; no duplicated timers, audio, or coffee batches.

## **Scenario 09 — Cup Not Positioned**

1. Prepare beans.  
2. Power on.  
3. Brew coffee.  
4. Leave cup at initial position.  
5. Press Pour.

**Expected:** Coffee falls onto stage; cup remains empty; small spill accumulates.

## **Scenario 10 — Slight Misalignment**

1. Position cup near edge of receiving region.  
2. Complete brewing.  
3. Pour.

**Expected:** Some coffee enters cup, some misses; fill and spill volumes remain coherent.

## **Scenario 11 — Move Cup Away During Pour**

1. Align cup.  
2. Begin pouring.  
3. Allow partial fill.  
4. Drag cup away.

**Expected:** Cup retains collected coffee. New coffee falls onto stage.

## **Scenario 12 — Move Cup Into Active Stream**

1. Leave cup misaligned.  
2. Begin pouring.  
3. Move cup beneath stream.

**Expected:** Initial coffee spills; later coffee enters cup; previous spill remains.

## **Scenario 13 — Overflow**

1. Align empty cup.  
2. Prepare full batch.  
3. Begin pouring.  
4. Do not stop.

**Expected:** Cup fills, then visibly overflows a small amount, then stream ends automatically when batch is exhausted.

## **Scenario 14 — Early Stop**

1. Begin pouring.  
2. Stop after a short period.

**Expected:** Partial fill or partial spill remains. Machine enters COMPLETE. No resume is available for that batch.

## **Scenario 15 — Double Pour Input**

1. Enter READY\_TO\_POUR.  
2. Issue a rapid duplicate pointer event.

**Expected:** One intentional actuation must not accidentally initiate and terminate pouring in the same input gesture.

## **Scenario 16 — Reset While Brewing**

1. Begin brewing.  
2. Trigger operator reset.

**Expected:** Pending process ends; sounds stop; machine returns to fresh OFF state; no old brewing timer can later mark coffee ready.

## **Scenario 17 — Reset While Dragging**

1. Begin dragging cup or beans.  
2. Trigger reset.

**Expected:** Drag ends safely; pointer ownership is released; objects return to initial positions.

## **Scenario 18 — Reset During Pour**

1. Begin pouring.  
2. Trigger reset.

**Expected:** Stream and sound stop; cup empties; spill clears; beans are restored; scene returns to initial condition.

## **Scenario 19 — Inactivity Before Brewing**

1. Partially prepare machine.  
2. Stop interacting for 90 seconds.

**Expected:** Scene resets safely to original preparation state.

## **Scenario 20 — Inactivity After Brewing**

1. Reach READY\_TO\_POUR.  
2. Leave machine untouched for 75 seconds.

**Expected:** Scene returns to its initial condition.

## **Scenario 21 — Completion Auto-Reset**

1. Finish pouring.  
2. Leave the scene untouched for 20 seconds.

**Expected:** Automatic reset restores the exhibition for the next visitor.

## **Scenario 22 — Camera During Object Drag**

1. Begin orbiting the camera.  
2. Stop orbiting.  
3. Grab cup.  
4. Drag cup across scene.

**Expected:** Cup moves without the camera unintentionally orbiting.

## **Scenario 23 — Interrupt Cinematic Camera Move**

1. Trigger brewing or pouring.  
2. Begin manual camera exploration during a camera transition.

**Expected:** Manual camera control wins; machine processing continues.

## **Scenario 24 — Browser Visibility Change**

1. Begin grinding.  
2. Switch to another browser tab briefly.  
3. Return.

**Expected:** Process remains coherent, with no large catch-up jump.

For an extended absence exceeding the specified threshold, the session resets.

## **Scenario 25 — Repeated Visitor Sessions**

Complete at least ten successive cycles with different outcomes:

* Clean fill.  
* Partial fill.  
* Surface spill.  
* Overflow.  
* Early stop.  
* Reset during process.

**Expected:** No stale effects, unintended state carryover, accumulating resources, or degraded interaction correctness.

---

# **26\. Configurable Behavioral Parameters**

The implementation must centralize the following behavioral constants.

| Parameter | Baseline | Purpose |
| ----- | ----- | ----- |
| Grinding duration | 4.0 s | Mechanical preparation |
| Transition pause | 1.2 s | Cinematic anticipation |
| Brewing duration | 4.2 s | Coffee preparation |
| Cup capacity | 1.0 unit | Normalized usable capacity |
| Prepared batch | 1.30 units | Finite available coffee |
| Pour rate | 0.125 units/s | Controlled dispensing |
| Normal cup fill time | \~8.0 s | Expected fully aligned fill |
| Batch exhaustion time | \~10.4 s | Automatic stop if untouched |
| Prebrew inactivity reset | 90 s | Abandoned preparation recovery |
| Ready-state inactivity reset | 75 s | Abandoned prepared batch |
| Completion auto-reset | 20 s | Exhibition replay |
| Extended hidden-tab reset | 60 s | Interrupted session recovery |
| Visible reset transition | 1.0–1.5 s | Calm restoration |

The precise spatial parameters will be calibrated from the production asset.

They include:

* Cup movement bounds.  
* Cup mouth radius.  
* Coffee stream radius.  
* Ingredient-transfer tolerance.  
* Hopper hinge limits.  
* Button travel.  
* Interaction proxy dimensions.

All numeric values must be defined in a centralized configuration rather than scattered as unrelated hardcoded values.

---

# **27\. Formal Transition Acceptance Matrix**

| From | Command/event | Guard | To |
| ----- | ----- | ----- | ----- |
| OFF | Power On | No reset active | IDLE\_ON |
| IDLE\_ON | Power Off | No process active | OFF |
| IDLE\_ON | Make | Beans loaded, hopper closed, no transfer | GRINDING |
| GRINDING | Grinding elapsed | Active session valid | TRANSITION |
| TRANSITION | Pause elapsed | Active session valid | BREWING |
| BREWING | Brewing elapsed | Active session valid | READY\_TO\_POUR |
| READY\_TO\_POUR | Pour | Batch available | POURING |
| POURING | Pour | User stop | COMPLETE |
| POURING | Volume exhausted | Remaining volume reaches zero | COMPLETE |
| COMPLETE | Power | Completion stable | RESETTING |
| COMPLETE | Auto-reset timeout | No new interaction | RESETTING |
| OFF / IDLE\_ON | Inactivity timeout | Scene altered and no recent interaction | RESETTING |
| READY\_TO\_POUR | Inactivity timeout | No recent interaction | RESETTING |
| Any state | Operator Reset | Always available | RESETTING |
| RESETTING | Restoration complete | Initial state validated | OFF |

Commands without satisfied guards do not change the primary machine state.

Independent hopper, bean, cup, and camera interactions must obey the availability policies defined earlier.

---

# **28\. Quality & Acceptance Criteria**

## **28.1 Interaction Acceptance**

* Hopper opens and closes correctly.  
* Hopper remains operable when power is off.  
* Bean transfer requires an open hopper.  
* Bean transfer involves physical manipulation.  
* Beans cannot be added repeatedly.  
* Cup starts unaligned.  
* Cup can be dragged naturally.  
* Cup stays within valid bounds.  
* Cup can move during pouring.  
* Button actions have distinct roles.  
* Invalid actions do not change machine state incorrectly.

## **28.2 Process Acceptance**

* Make requires power.  
* Make requires beans.  
* Make requires closed hopper.  
* Cup alignment is not a Make prerequisite.  
* Grinding, pause, and brewing occur in sequence.  
* One Make action creates one batch.  
* Repeated Make input creates no duplicates.  
* Brewing never starts dispensing automatically.  
* Ready-to-pour remains stable until interaction or recovery.

## **28.3 Pour Acceptance**

* Pour starts only when ready.  
* Pour stops when pressed again.  
* Pour stop finalizes the batch.  
* Available coffee is finite.  
* Correct alignment fills the cup.  
* Partial alignment divides the resulting volume.  
* Misalignment creates a spill.  
* Cup movement changes incoming capture.  
* Existing cup volume remains when moved.  
* Overflow occurs only when cup capacity is exceeded.  
* Batch exhaustion automatically stops flow.  
* Volume accounting remains coherent.

## **28.4 Reset Acceptance**

* Initial state is restored exactly.  
* Beans return to supply.  
* Hopper becomes empty and closed.  
* Cup returns to initial position.  
* Coffee fill clears.  
* Surface spills clear.  
* Machine becomes OFF.  
* Camera returns to its initial composition.  
* Sound stops.  
* Pending operations are cancelled.  
* Multiple resets are harmless.  
* Auto-reset supports repeated exhibition sessions.

## **28.5 Reliability Acceptance**

* No stale timers after reset.  
* No duplicate audio loops.  
* No stuck pointer capture.  
* No incorrect camera input ownership.  
* No state/visual mismatch after rapid actions.  
* Background-tab interruption is handled.  
* Runtime recovery is coherent.  
* Repeated cycles do not degrade correctness.

---

# **29\. Approved Behavioral Decisions**

The following decisions are established for the new implementation.

| ID | Decision |
| ----- | ----- |
| B-001 | Preparation-first is the canonical visitor journey |
| B-002 | Beans can be added while power is off |
| B-003 | Power may be activated before preparation, but Make remains guarded |
| B-004 | Hopper operation uses click-to-toggle controlled hinge motion |
| B-005 | Bean preparation uses physical drag-to-transfer |
| B-006 | A successful bean transfer is allowed only into an open hopper |
| B-007 | Each cycle permits one bean-supply transfer |
| B-008 | The cup starts away from the correctly aligned position |
| B-009 | The cup moves through direct constrained dragging |
| B-010 | The cup remains movable during brewing and pouring |
| B-011 | Cup placement is not a brewing prerequisite |
| B-012 | Cup capture is calculated from actual spatial alignment |
| B-013 | Make requires power, beans, and a closed hopper |
| B-014 | A preparation cycle consists of grinding, pause, and brewing |
| B-015 | Grinding and brewing use a single authoritative timeline |
| B-016 | Brewing produces one finite coffee batch |
| B-017 | Pouring begins only through the Pour button |
| B-018 | A second Pour press stops and finalizes the current batch |
| B-019 | Coffee volume is finite, not unlimited |
| B-020 | Batch exhaustion automatically ends pouring |
| B-021 | The cup can fill, partially capture, miss, and overflow |
| B-022 | The liquid does not automatically follow the cup |
| B-023 | Volume accounting is internally consistent |
| B-024 | Power can toggle before brewing |
| B-025 | Normal Power presses cannot interrupt active processing |
| B-026 | Hopper and ingredient manipulation lock when brewing begins |
| B-027 | The completed physical result remains visible |
| B-028 | The experience contains no conventional visible instruction UI |
| B-029 | Physical feedback replaces textual error messages |
| B-030 | Object dragging takes priority over camera orbit |
| B-031 | Manual camera control takes priority over cinematic camera transitions |
| B-032 | Reset is available through an operator keyboard shortcut |
| B-033 | Pressing Power after completion initiates power-off and replay restoration |
| B-034 | Completed sessions automatically reset after 20 seconds of inactivity |
| B-035 | Abandoned preparation and ready states reset automatically |
| B-036 | Reset invalidates pending actions from the previous cycle |
| B-037 | Background-tab handling prevents temporal jumps |
| B-038 | The experience is temporary and requires no persistent backend state |
| B-039 | A single completed batch constitutes one exhibition cycle |
| B-040 | Physical and cinematic coherence take priority over simulation complexity |

These decisions form the behavioral source of truth for the new implementation.

Exact motion styling, shader methods, sound design, and visual presentation remain the responsibilities of Documents 04 and 05\.

---

# **30\. Implementation Handoff Requirements**

Before beginning full implementation, the engineering team must have:

1. A validated production GLB.  
2. Confirmed interactive object references.  
3. Confirmed hopper and button pivots.  
4. Confirmed bean transfer targets.  
5. Confirmed cup starting and target positions.  
6. Confirmed coffee outlet anchor.  
7. Confirmed cup interior and fill geometry.  
8. An authoritative machine-state implementation.  
9. A consistent command/transition interface.  
10. A unified timing system.  
11. A deterministic liquid-volume model.  
12. A cancellation-safe reset mechanism.  
13. An input ownership strategy.  
14. A test plan covering every scenario in this document.

Implementation must not introduce additional machine states, interaction modes, or user-facing controls without a documented reason.

New engineering abstractions are acceptable if they preserve these approved observable behaviors.

---

# **31\. Final Interaction Blueprint**

                        VISITOR ENTERS  
                               \|  
                               v  
                        INITIAL OFF STATE  
                               \|  
                               v  
                     FREE PHYSICAL EXPLORATION  
                               \|  
             \+-----------------+-----------------+  
             \|                 \|                 \|  
             v                 v                 v  
        OPEN HOPPER        MOVE CUP          PRESS POWER  
             \|                 \|                 \|  
             v                 v                 v  
       TRANSFER BEANS     CUP POSITION       MACHINE ON  
             \|                 \|                 \|  
             v                 \|                 \|  
       BEANS LOADED            \|                 \|  
             \|                 \|                 \|  
             v                 \|                 \|  
        CLOSE HOPPER           \|                 \|  
             \|                 \|                 \|  
             \+-----------------+-----------------+  
                               \|  
                               v  
                      PREPARATION CHECK  
                               \|  
                \+--------------+--------------+  
                \|                             \|  
                v                             v  
             INVALID                        VALID  
                \|                             \|  
                v                             v  
         REMAIN AVAILABLE                PRESS MAKE  
                                              \|  
                                              v  
                                           GRINDING  
                                              \|  
                                              v  
                                      MECHANICAL PAUSE  
                                              \|  
                                              v  
                                           BREWING  
                                              \|  
                                              v  
                                        READY TO POUR  
                                              \|  
                                              v  
                                         PRESS POUR  
                                              \|  
                                              v  
                                      DISPENSING ACTIVE  
                                              \|  
                   \+--------------------------+------------------+  
                   \|                          \|                  \|  
                   v                          v                  v  
             CUP ALIGNED               PARTIAL ALIGNMENT      NO CAPTURE  
                   \|                          \|                  \|  
                   v                          v                  v  
               CUP FILLS               FILL \+ SPILL          SURFACE SPILL  
                   \|  
                   v  
             CUP REACHES CAPACITY  
                   \|  
                   v  
             CONTINUED POURING  
                   \|  
                   v  
                OVERFLOW

       ALL POURING OUTCOMES  
                   \|  
           \+-------+--------+  
           \|                \|  
           v                v  
      USER STOPS      BATCH EXHAUSTED  
           \|                \|  
           \+-------+--------+  
                   \|  
                   v  
                COMPLETE  
                   \|  
           \+-------+--------+  
           \|                \|  
           v                v  
      PRESS POWER       AUTO-RESET  
           \|                \|  
           \+-------+--------+  
                   \|  
                   v  
                RESETTING  
                   \|  
                   v  
            INITIAL OFF STATE  
                   \|  
                   v  
              NEXT VISITOR  
---

# **32\. Final Behavioral Statement**

Ritual is a physical interaction experience built around preparation, mechanical performance, and user-controlled output.

The visitor discovers the machine, opens the hopper, adds beans, positions the cup, powers the appliance, and starts the preparation sequence.

The machine then performs its internal work.

Grinding creates energy.

A short pause introduces anticipation.

Brewing communicates transformation.

The prepared coffee waits for the visitor.

The visitor decides when to begin dispensing.

The liquid obeys the actual relationship between the outlet and the cup.

Correct placement produces a clean fill.

Misalignment produces a spill.

Continued dispensing may overfill the vessel.

Stopping the pour ends the batch.

The completed result remains visible before the scene returns to its initial condition.

Every action has a clear role.

Every state has a predictable meaning.

Every transition preserves physical logic.

Every visual consequence corresponds to an actual behavioral result.

The experience does not require conventional UI because the machine's components and responses communicate the process.

The visitor should never feel that they are operating an abstract state machine.

They should feel that they are operating a believable physical object.

**The visitor prepares.**

**The machine performs.**

**The visitor controls the result.**

**The system preserves the consequences.**

**The experience resets and begins again.**

---

**End of Document 03 — Interaction & Experience Specification**

**Status:** Behavioral Decisions Established — Ready for Engineering  
**Next Document:** RITUAL-04 — Cinematic & Sensory Design System  
**Authority:** Original Ritual creative vision and the behavioral decisions defined in this document.

