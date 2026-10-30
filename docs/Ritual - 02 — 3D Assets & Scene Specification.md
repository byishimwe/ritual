# **Ritual**

## **02 — 3D Assets & Scene Specification**

**Project:** Ritual  
**Tagline:** The Choreography of Espresso  
**Document ID:** RITUAL-02  
**Version:** 1.0 — Production Asset Specification  
**Date:** October 27, 2026  
**Status:** Draft — Pending Asset Verification  
**Project Type:** Cinematic Interactive 3D Web Experience  
**Parent Documents:** RITUAL-00 — Project Definition & Scope; RITUAL-01 — Reference & Concept  
**Primary Tools:** Blender, glTF/GLB, Three.js / React Three Fiber  
**Purpose:** Define the 3D asset, spatial, material, and scene requirements necessary to construct the approved Ritual experience.

---

# **1\. Document Purpose & Authority**

## **1.1 Purpose**

This document establishes the production specification for Ritual's three-dimensional assets and scene composition.

It translates the artistic and physical intentions established in Document 01 into a structured asset contract suitable for Blender production and real-time web integration.

It defines:

* Physical dimensions and proportions.  
* Coordinate systems and units.  
* Scene organization.  
* Asset hierarchy and naming conventions.  
* Static and interactive geometry.  
* Animation pivots and transforms.  
* Materials and texture requirements.  
* Coffee beans and container preparation.  
* Cup placement and liquid reference geometry.  
* Interaction attachment points.  
* Environmental composition.  
* Blender-to-GLB export requirements.  
* Performance considerations.  
* Asset validation and acceptance criteria.

The document must enable a developer or technical artist to integrate the approved 3D assets without guessing how the objects are structured or how they are intended to move.

## **1.2 Source of Authority**

This specification follows:

1. RITUAL-00 — Project Definition & Scope.  
2. RITUAL-01 — Reference & Concept.  
3. The original Blender modeling and design decisions.  
4. Any subsequent explicitly approved asset revisions.

The previous web implementation does not define the project's asset requirements, node naming, interaction structure, or scene design.

## **1.3 Verification Classification**

The document distinguishes three levels of information.

**Confirmed:** An established creative or physical requirement from the approved concept.

**Specified:** A proposed production convention defined here for the new implementation. It becomes binding once this document is approved and the asset is brought into compliance.

**To Verify:** A property that must be checked directly in Blender or the final GLB rather than assumed.

This distinction is especially important for exact object names, transforms, material assignments, and pivots.

## **1.4 Scope Boundary**

This document defines the objects and spatial structure required to support interaction.

It does not define the complete behavior of the machine-state system, final motion curves, camera timelines, shader implementations, or application architecture.

Those responsibilities belong to Documents 03, 04, and 05\.

---

# **2\. Asset Production Philosophy**

## **2.1 The Model Is Both a Product and an Interface**

The coffee machine must satisfy two requirements simultaneously.

**Visual requirement:** It must look like a believable, premium consumer espresso machine.

**Interaction requirement:** Its physical parts must be independently addressable and capable of meaningful transformation.

A visually accurate machine with incorrectly organized geometry is not an acceptable production asset.

Likewise, a technically convenient collection of interaction objects that does not resemble a convincing product is not acceptable.

Both requirements are equally important.

## **2.2 Geometry Should Serve the Experience**

Each component must justify its inclusion through at least one of the following:

* Physical recognizability.  
* Interaction.  
* Mechanical communication.  
* Material contrast.  
* Composition.  
* Believable structural detail.

Avoid modeling details that have no meaningful visual or interaction impact.

## **2.3 Physical Complexity vs Runtime Complexity**

The model should contain enough geometric detail to produce a convincing hero object.

However, detail must be allocated according to how the object will appear in the browser.

More geometry is justified for:

* The primary silhouette.  
* Visible bevels.  
* The front fascia.  
* Hopper.  
* Buttons.  
* Coffee spout.  
* Cup rim and handle.

Less geometry is justified for:

* Hidden internal structures.  
* Inaccessible rear details.  
* Small features never visible at meaningful scale.  
* Repeated decorative surfaces.  
* Internal systems represented only through sound or animation.

## **2.4 Blender and Web Responsibilities**

| Responsibility | Blender | Web |
| ----- | ----- | ----- |
| Primary geometry | Yes | Load and position |
| Physical materials | Author base PBR properties | Render and refine as needed |
| Object hierarchy | Yes | Consume and control |
| Pivot placement | Yes | Animate transforms |
| UVs and textures | Yes | Load and display |
| Interactive hit regions | Optional authored references | Final hit testing |
| Hopper animation | Prepare hierarchy | Execute interactively |
| Button animation | Prepare hierarchy | Execute interactively |
| Cup movement | Prepare object and anchors | Execute interactively |
| Bean transfer | Provide visual assets | Choreograph movement and falling |
| Grinding representation | Provide necessary geometry | Coordinate animation and state |
| Coffee stream | No final liquid simulation required | Generate dynamically |
| Cup filling | Provide interior geometry/anchors | Render dynamically |
| Steam | No final simulation required | Generate dynamically |
| Spills and overflow | Provide landing geometry/anchors | Generate dynamically |
| Stage lighting | Preview only | Final runtime lighting |
| Camera | Preview only | Final interactive/cinematic camera |
| Audio | Not applicable | Runtime |
| Postprocessing | Not applicable | Runtime |

The web implementation should not compensate for preventable asset mistakes, such as an incorrectly positioned hopper hinge or unaddressable button geometry.

---

# **3\. Machine Type & Physical Dimensions**

## **3.1 Machine Classification**

**Automatic Bean-to-Cup Espresso Coffee Machine**

The machine must remain recognizable as a compact consumer appliance.

It must not resemble a commercial café machine, futuristic device, or abstract industrial mechanism.

## **3.2 Reference Dimensions**

The original concept established these approximate proportions:

| Dimension | Reference target |
| ----- | ----- |
| Width | 35 cm |
| Depth | 40 cm |
| Height | 40 cm |

Acceptable initial reference ranges:

| Dimension | Reference range |
| ----- | ----- |
| Width | 30–40 cm |
| Depth | 35–45 cm |
| Height | 35–45 cm |

The exact dimensions of the approved Blender model must be measured before the asset contract is finalized.

These values are not a reason to distort an already approved, proportionally correct model.

## **3.3 Proportion Objectives**

The machine must provide:

* A strong primary body silhouette.  
* Enough height for a recognizable upper bean hopper.  
* Sufficient front surface for three controls.  
* A clearly defined outlet area.  
* Space for a cup beneath the outlet.  
* Convincing depth in three-quarter presentation.  
* A stable base and plausible contact with the supporting surface.

## **3.4 Relative Scale**

All components must remain proportionally believable.

The cup should look appropriately sized for the machine and the coffee outlet.

The buttons should be easy to see without becoming oversized.

The beans should remain small enough to represent roasted beans but large enough to read during the transfer interaction.

The hopper should appear capable of receiving the displayed ingredient.

---

# **4\. Unit System & Coordinate Conventions**

## **4.1 Real-World Units**

**Specified production convention:**

One Blender scene unit represents one meter.

Examples:

| Real-world dimension | Scene value |
| ----- | ----- |
| 1 mm | 0.001 |
| 1 cm | 0.01 |
| 10 cm | 0.10 |
| 35 cm | 0.35 |
| 40 cm | 0.40 |

The intended machine body dimensions are therefore approximately:

**0.35 m × 0.40 m × 0.40 m**

The asset should be exported at correct physical scale.

The runtime should not need to guess or automatically normalize the product to an assumed height.

## **4.2 Blender Coordinate System**

Blender uses:

* X: Horizontal.  
* Y: Depth.  
* Z: Vertical/up.

For the production asset, the proposed orientation is:

* \+X: Machine right.  
* −X: Machine left.  
* −Y: Machine front.  
* \+Y: Machine rear.  
* \+Z: Up.

## **4.3 Runtime Coordinate System**

Three.js / React Three Fiber conventionally uses Y as the vertical axis.

The intended runtime orientation is:

* \+X: Machine right.  
* −X: Machine left.  
* \+Y: Up.  
* \+Z: Machine front.  
* −Z: Machine rear.

The glTF export pipeline should perform the appropriate axis conversion.

Do not manually rotate individual child objects in the runtime to compensate for inconsistent source orientation.

## **4.4 World Origin**

The machine's logical root should be located at the horizontal center of the main chassis footprint, at the level of its resting base.

For runtime purposes:

* Machine center: X \= 0\.  
* Machine base: Y \= 0\.  
* Machine horizontal center: Z \= 0\.

This is a coordinate convention, not a statement that all mesh vertices are centered.

The machine's geometry should extend upward from the base.

The supporting stage should align with the machine's contact plane.

## **4.5 Root Transform**

The production asset root should have:

* Position: zero.  
* Rotation: identity.  
* Scale: one.

Avoid depending on corrective rotations or nonuniform scales at the application level.

The machine's actual modeled proportions should determine its size.

## **4.6 Consistent Spatial References**

All of the following must use the same final coordinate convention:

* Camera targets.  
* Hopper hinge.  
* Bean transfer destination.  
* Button press directions.  
* Cup start position.  
* Cup alignment target.  
* Coffee outlet origin.  
* Liquid stream.  
* Cup-fill geometry.  
* Spill contact region.  
* Ground and shadow contact.

This prevents the visual and interaction systems from developing incompatible spatial assumptions.

---

# **5\. Scene Composition & Asset Groups**

## **5.1 Primary Scene Structure**

Ritual is a single centered product-stage composition.

The visible scene consists of:

1. Coffee machine.  
2. Bean supply/container.  
3. Ceramic cup.  
4. Supporting surface.  
5. Minimal background.  
6. Lighting and necessary environmental effects.

The machine remains the dominant object.

## **5.2 Asset Separation Strategy**

The production asset should distinguish three primary physical actors:

**Machine:** Primarily static structure with independently animated mechanical components.

**Bean supply:** A movable object or container involved in preparation.

**Cup:** A movable receiving vessel with geometry suitable for dynamic coffee filling.

These actors should have separate roots.

Do not merge the cup or ingredient container into the machine body.

## **5.3 Runtime Environment**

The countertop, backdrop, lights, camera, dynamic liquid, and atmospheric effects should be owned by the runtime scene.

They do not need to be permanently baked into the GLB.

This gives the web implementation independent control over:

* Light direction.  
* Reflections.  
* Background appearance.  
* Camera composition.  
* Device adaptation.  
* State-dependent effects.  
* Performance.

## **5.4 Asset Boundary**

The exported production asset should contain the machine and the props that require authored product geometry.

It should not contain an unnecessary full kitchen, a complete studio room, decorative environment, or baked scene lighting.

---

# **6\. Production Asset Hierarchy**

## **6.1 Naming Philosophy**

The hierarchy must be readable, predictable, and stable.

Use clear English names describing functional responsibility.

Avoid generic Blender names such as:

* `Cube.001`  
* `Cylinder.003`  
* `Empty.008`  
* `Mesh`  
* `Object.019`

Avoid names that depend on mesh creation order.

Interaction code should be able to locate physical parts reliably.

## **6.2 Canonical Naming Convention**

The following hierarchy is the proposed production contract for the approved asset.

These exact names should be finalized during the Blender asset audit. They are not asserted to already exist.

### **Root Asset**

* `RitualAssetRoot`  
  * `MachineRoot`  
  * `BeanPropRoot`  
  * `CupRoot`  
  * `SceneAnchors`

### **MachineRoot**

* `MachineRoot`  
  * `Chassis`  
    * `BodyShell`  
    * `FrontFascia`  
    * `SidePanels`  
    * `Base`  
    * `FunctionalTrim`  
  * `HopperAssembly`  
    * `HopperVessel`  
    * `HopperOpeningAnchor`  
    * `HopperLidPivot`  
      * `HopperLid`  
    * `HopperBeansVisual`  
    * `HopperBeanTarget`  
  * `ControlAssembly`  
    * `PowerButtonPivot`  
      * `PowerButton`  
    * `MakeButtonPivot`  
      * `MakeButton`  
    * `PourButtonPivot`  
      * `PourButton`  
    * `StatusIndicator` (if retained)  
  * `DispenserAssembly`  
    * `CoffeeSpout`  
    * `CoffeeExitAnchor`  
  * `CupSupportAssembly`  
    * `CupPlatform`  
    * `DripSurface`  
  * `ProcessingAssembly` (only if required)  
    * `ProcessingVisuals`

### **BeanPropRoot**

* `BeanPropRoot`  
  * `BeanContainer`  
  * `BeanSupplyVisual`  
  * `BeanGripAnchor`  
  * `BeanPourAnchor`

### **CupRoot**

* `CupRoot`  
  * `CupBody`  
  * `CupInterior`  
  * `CupGripAnchor`  
  * `CupMouthAnchor`  
  * `CupInnerBottomAnchor`  
  * `CupFillMaxAnchor`

### **SceneAnchors**

* `SceneAnchors`  
  * `CupStartAnchor`  
  * `CupPlacementAnchor`  
  * `BeanStartAnchor`  
  * `BeanPourTargetAnchor`  
  * `SpillSurfaceAnchor`  
  * `MachineFocusAnchor`  
  * `HopperFocusAnchor`  
  * `PourFocusAnchor`

## **6.3 Structural Rules**

The hierarchy must satisfy the following:

* The machine, cup, and bean prop have independent root transforms.  
* Static machine meshes are grouped under the machine root.  
* Moving parts have suitable pivot parents.  
* Visual meshes are children of their relevant animated pivot.  
* Logical placement anchors are not accidentally deformed by animation.  
* The cup's fill anchors move with the cup.  
* The hopper's receiving anchor remains attached to the machine, not the movable bean container.  
* The outlet anchor remains aligned with the actual dispensing nozzle.  
* Scene anchors are available to runtime systems without requiring hardcoded guessed offsets.

## **6.4 Blender Collections vs Object Parenting**

Blender collections may be used for editor organization.

However, the web runtime depends on the exported object/node graph.

Collections alone should not be used as a substitute for intentional parent-child transforms.

Use named objects and empties to define relationships that need to survive glTF export.

## **6.5 Exact Name Stability**

Once the asset contract is approved:

* Names are case-sensitive.  
* Interactive nodes must retain stable names.  
* Exported names must be verified.  
* Automatic suffixes must be removed.  
* Names must not be silently changed during optimization.  
* Any intentional rename must update the asset contract and relevant consuming code.

---

# **7\. Static Machine Geometry**

## **7.1 Main Body**

The body provides the dominant visual silhouette.

It should be a coherent manufactured form.

Requirements:

* Clean visible silhouette.  
* Convincing bevels.  
* Appropriate material boundaries.  
* Correct normals.  
* No overlapping external surfaces.  
* No unnecessary hidden geometry.  
* Suitable contact with the supporting surface.

## **7.2 Front Fascia**

The fascia visually organizes the controls and coffee outlet.

It should remain legible in the initial three-quarter view.

Its material treatment may use brushed satin metal, charcoal, or a controlled combination.

Its geometry must allow the buttons to move without visibly intersecting surrounding surfaces.

## **7.3 Side Panels**

Side panels should establish the machine's depth and manufacturing quality.

Large surfaces should respond well to soft lighting.

Fine details should be limited to features that improve realism when visible.

## **7.4 Base**

The machine base should sit correctly on the intended supporting plane.

Avoid visually floating geometry.

The underside need not contain detailed hidden machinery.

## **7.5 Cup Platform**

The cup platform should establish a convincing receiving area beneath the outlet.

It must have enough usable space for the cup and its intended movements.

The geometry should permit plausible cup contact, shadows, and spill positioning.

## **7.6 Coffee Outlet**

The outlet must visibly belong to the machine and provide a precise liquid origin.

If the physical design includes more than one nozzle, the final asset contract must identify each exit independently.

The concept does not require multiple independently simulated streams unless the selected design and artistic direction justify them.

## **7.7 Processing Region**

Internal mechanical details are optional.

Where included, they should exist to support the illusion of grinding or brewing.

The production should avoid building hidden mechanical complexity that adds no useful visual feedback.

---

# **8\. Hopper Assembly**

## **8.1 Hopper Structure**

The hopper is one of the central interaction elements.

It must remain visually recognizable as a receptacle for whole coffee beans.

Its opening should be clear when the lid is raised.

The vessel may be transparent or lightly tinted.

## **8.2 Hopper Lid Pivot**

The hopper lid must rotate around a physically plausible hinge.

The pivot origin should be located at the hinge axis, typically along the rear edge of the lid.

Do not place the animation pivot at the lid's geometric center.

An incorrect origin would cause the lid to rotate unnaturally through surrounding geometry.

## **8.3 Pivot Hierarchy**

The specified structure is:

`HopperLidPivot` → `HopperLid`

The pivot remains fixed at the hinge.

The lid is offset relative to the pivot so that rotation produces the intended physical movement.

The pivot may be represented by a named Blender Empty exported as a glTF node.

## **8.4 Lid Rest Position**

The exported asset should default to the lid's closed position.

The closed state is the canonical initial condition.

The visual mesh should fit naturally against the hopper body.

## **8.5 Lid Opening Angle**

The exact angle must be verified against the modeled hinge and surrounding geometry.

An initial design range of approximately 90–120 degrees may be evaluated, but it is not a fixed requirement.

The correct angle is the one that:

* Clearly exposes the hopper.  
* Avoids collisions.  
* Preserves mechanical plausibility.  
* Remains visually readable.  
* Supports bean insertion.

The runtime will animate between the approved closed and open orientations.

## **8.6 Hopper Opening Anchor**

`HopperOpeningAnchor` identifies the logical entrance of the hopper.

It is useful for:

* Bean transfer.  
* Placement guidance.  
* Ingredient animation.  
* Camera framing.  
* Interaction validation.

The anchor should lie at the useful center of the hopper opening, not at an arbitrary point in the mesh's bounding box.

## **8.7 Bean Target**

`HopperBeanTarget` defines where transferred beans should arrive and settle.

It must remain spatially consistent with the visible container.

## **8.8 Hopper Beans Visual**

The hopper must support at least two visual conditions:

**Empty:** Before the visitor adds beans.

**Filled:** After successful bean transfer.

The filled visual may use selected modeled beans, instances, or a simplified interior bean representation.

The rendering method will be chosen later.

The source geometry should not force the hopper to appear permanently full.

## **8.9 Animation Constraints**

Opening and closing must not:

* Rotate the entire hopper.  
* Deform the vessel.  
* Move the hinge.  
* Intersect the chassis.  
* Displace the bean target unexpectedly.  
* Require negative or nonuniform scaling.

---

# **9\. Coffee Beans & Transfer Prop**

## **9.1 Interaction Requirement**

The visitor must physically add coffee beans to the machine.

A simple click that instantly changes a boolean is not sufficient as the visible experience.

The transfer must be spatially understandable.

## **9.2 Ingredient Representation**

The initial scene must provide a visible bean supply.

This may be presented in a small container or another clearly graspable physical arrangement consistent with the original concept.

The exact final container design should remain restrained and believable.

It should not introduce unnecessary visual competition.

## **9.3 Independent Actor**

`BeanPropRoot` must be independent from `MachineRoot`.

This allows the bean supply to be picked up, moved, tilted, and returned or restored during reset.

## **9.4 Bean Container Origin**

The bean prop's transform origin should support predictable movement and rotation.

If the transfer involves tilting a container, the pivot must allow a visually believable pour.

The prop should not orbit around the machine or rotate around an unrelated world-space point.

## **9.5 Required Anchors**

**BeanGripAnchor:** Defines a stable handling reference.

**BeanPourAnchor:** Defines the location from which beans visually leave the container.

**BeanPourTargetAnchor:** Defines the corresponding target near or inside the hopper.

These references support an authored movement path without relying on accidental geometry centers.

## **9.6 Bean Geometry**

Individual beans should have:

* Recognizable roasted-bean shape.  
* Slight surface variation.  
* A visible central crease where useful.  
* Believable relative scale.  
* Natural dark-brown coloring.

However, large numbers of individually detailed meshes should not be introduced unnecessarily.

## **9.7 Bean Transfer Visual States**

The asset must support a coherent progression:

1. Beans visible in the supply.  
2. Supply is picked up or manipulated.  
3. Supply moves toward the open hopper.  
4. Beans visually leave the supply.  
5. Beans fall through the hopper opening.  
6. Beans settle inside.  
7. The supply no longer displays the original full amount.

The exact animation method belongs in Document 04\.

## **9.8 Efficient Rendering**

Repeated beans may use instancing or controlled procedural geometry.

It is not necessary to simulate hundreds of independent rigid bodies.

The quality requirement is visual credibility, not detailed collision simulation.

## **9.9 Preparation-First Constraint**

The bean interaction must be possible while the machine is powered off.

The 3D asset must not imply that the bean container is permanently attached to an active machine mechanism.

The initial state must visually support the preparation-first experience.

---

# **10\. Physical Button Assets**

## **10.1 Control Inventory**

The machine contains exactly three primary physical buttons:

* Power.  
* Make.  
* Pour.

These are essential interaction objects, not decorative geometry.

## **10.2 Independent Geometry**

Each button must be independently addressable.

Do not merge the three button surfaces into one static fascia mesh.

The surrounding fascia may remain static.

## **10.3 Button Pivot Hierarchy**

Each button should use a stable animation parent:

* `PowerButtonPivot` → `PowerButton`  
* `MakeButtonPivot` → `MakeButton`  
* `PourButtonPivot` → `PourButton`

This makes press animation independent of the rest of the machine.

## **10.4 Press Direction**

A button should travel inward relative to its mounting surface.

If the button is mounted on a vertical front fascia, its press direction should follow the local surface normal rather than assuming movement always occurs on the vertical world axis.

If the button is angled, its motion must follow the angled control assembly.

## **10.5 Press Travel**

The proposed physical travel is small, approximately 1–3 mm.

The final value must be chosen through visual testing of the actual button geometry and camera scale.

The motion must be visible without resembling an exaggerated spring-loaded control.

## **10.6 Control Geometry**

Buttons should include:

* A visible pressable surface.  
* Sufficient surrounding clearance.  
* Appropriate bevels.  
* Material treatment distinguishing the controls from the body.  
* Stable geometry during animation.

## **10.7 Interaction Hit Areas**

Very small physical button meshes may be difficult to select in a browser.

The runtime may use larger invisible interaction proxies aligned with the button geometry.

If authored in Blender, these proxies must be explicitly named, exportable, and distinct from rendered material surfaces.

Alternatively, they may be generated at runtime.

The user should still perceive that they are pressing the physical button itself.

## **10.8 Visual Symbols**

Subtle physical markings or symbols may be considered where necessary to identify the controls.

They must look like real appliance features.

Avoid external HTML labels, tooltips, or screen-space instructions.

The final iconography should be reviewed for clarity and consistency.

---

# **11\. Coffee Outlet & Dispensing Anchors**

## **11.1 Outlet Geometry**

The coffee outlet must provide a recognizable source for the liquid stream.

It should be visually connected to the machine's frontal dispensing area.

## **11.2 Coffee Exit Anchor**

`CoffeeExitAnchor` is the required reference for liquid emission.

The anchor should be positioned at the actual nozzle opening, with the correct physical orientation.

It should not be inferred from the center of the entire coffee-spout mesh.

## **11.3 Anchor Orientation**

The outlet reference should provide enough information for the runtime to determine where the stream begins.

The stream's visible path should descend under the intended gravity direction.

The nozzle geometry must not force the liquid to emerge through a solid surface.

## **11.4 Multiple Nozzles**

If the approved model contains two separate nozzle exits, define one anchor per exit.

Names may follow the same contract, for example:

* `CoffeeExitAnchor_L`  
* `CoffeeExitAnchor_R`

Whether to render one combined stream or two distinct streams is a cinematic and engineering decision.

The number of streams must match the final approved outlet design.

## **11.5 Relationship to the Cup**

The outlet anchor and `CupPlacementAnchor` must define a physically sensible relationship.

A cup positioned correctly should sit beneath the nozzle without intersecting the machine.

The vertical stream must intersect the cup opening rather than the handle, external wall, or supporting platform.

---

# **12\. Ceramic Cup Asset**

## **12.1 Role**

The cup is the destination for the final prepared coffee.

It is also a central interaction object because its placement affects the outcome.

## **12.2 Geometry Requirements**

The cup should have:

* A believable ceramic body.  
* Actual visual depth.  
* A readable opening.  
* Reasonable wall thickness.  
* A visible rim.  
* Interior geometry.  
* A suitable base.  
* A physically plausible handle if the selected design includes one.

A solid cylinder with a flat top is not sufficient.

## **12.3 Approximate Scale**

The cup must be proportionally appropriate for a consumer espresso machine.

Reference ranges may include:

* Cup height: approximately 5–9 cm.  
* Mouth diameter: approximately 6–9 cm.

The final dimensions should follow the approved cup design and dispensing clearance.

The exact cup capacity does not need to reproduce a particular commercial vessel.

## **12.4 Cup Origin**

The cup root should be located at the horizontal center of its base, on the resting plane.

This permits simple translation while preserving correct contact with the surface.

The handle should not shift the logical root away from the cup's central body.

## **12.5 Independent Movement**

`CupRoot` must be independent from the machine assembly.

Movement should transform the entire cup, including its visible geometry and all liquid-related anchors.

Do not animate only the ceramic mesh while leaving the fill surface or interaction reference behind.

## **12.6 Cup Interior**

The cup must contain suitable interior geometry for rendering a rising liquid level.

It should support visible liquid without exposing gaps or intersecting the walls.

The interior should be physically coherent with the rim and external body.

## **12.7 Cup Fill Anchors**

The following references are specified:

**CupInnerBottomAnchor:** Defines the minimum visible liquid level.

**CupFillMaxAnchor:** Defines the maximum normal fill level below the rim.

**CupMouthAnchor:** Defines the cup opening's center and orientation.

These anchors must move with the cup.

## **12.8 Liquid Geometry Responsibility**

Do not permanently model the cup as full of coffee in the production GLB.

The initial condition is an empty cup.

Dynamic liquid geometry and the fill surface belong to the runtime.

## **12.9 Initial Cup Position**

The cup must begin in a visible, physically reasonable resting position.

It should not already be correctly aligned beneath the coffee outlet.

This preserves the original cup-placement interaction.

The initial position should be close enough to the machine to make the intended relationship discoverable.

The exact coordinates will be finalized against the actual machine dimensions and interaction range.

## **12.10 Cup Alignment Target**

`CupPlacementAnchor` defines the intended receiving position.

It should be situated so that the cup can receive the coffee stream without intersection with the machine.

Correct placement must feel natural, not demand pixel-perfect precision.

## **12.11 Movement Constraints**

The cup should move within a controlled physical region.

The allowed motion must:

* Keep the cup on an appropriate supporting surface.  
* Prevent movement through the machine.  
* Allow correct alignment.  
* Allow visible misalignment.  
* Support the intended spill behavior.  
* Avoid accidental movement outside the useful scene.

The exact drag axes and bounds belong in Document 03\.

---

# **13\. Spatial Relationships & Physical Anchors**

## **13.1 Why Anchors Matter**

Important runtime positions should be defined by authored spatial references rather than arbitrary offsets guessed after importing the model.

These references make the scene easier to maintain.

If the machine changes proportionally, related behavior can follow the updated anchors.

## **13.2 Required Anchor Inventory**

| Anchor | Primary responsibility |
| ----- | ----- |
| `HopperOpeningAnchor` | Center of ingredient entry |
| `HopperBeanTarget` | Bean landing/settling reference |
| `BeanStartAnchor` | Initial ingredient position |
| `BeanPourAnchor` | Bean emission point on container |
| `BeanPourTargetAnchor` | Ingredient-transfer target |
| `CupStartAnchor` | Initial cup resting position |
| `CupPlacementAnchor` | Correct cup receiving position |
| `CupMouthAnchor` | Center/orientation of cup opening |
| `CupInnerBottomAnchor` | Minimum fill surface |
| `CupFillMaxAnchor` | Maximum normal fill surface |
| `CoffeeExitAnchor` | Origin of dispensed coffee |
| `SpillSurfaceAnchor` | Approximate receiving surface beneath outlet |
| `MachineFocusAnchor` | Main product camera target |
| `HopperFocusAnchor` | Hopper composition target |
| `PourFocusAnchor` | Outlet/cup composition target |

## **13.3 Anchor Representation**

Anchors should be lightweight transform nodes.

In Blender, named empties are suitable for this role.

They should not create visible geometry in the final rendered scene.

## **13.4 Local vs World Coordinates**

Each anchor must have a clear parent.

Examples:

* Coffee outlet anchor: machine/dispenser.  
* Hopper target: hopper/machine.  
* Cup fill anchors: cup.  
* Bean pour anchor: bean prop.  
* Cup start and placement anchors: stable scene/reference root.

An anchor that belongs to a movable object must move with that object.

An anchor defining a fixed destination should not unintentionally move when a prop is dragged.

## **13.5 Camera References**

Focus anchors should describe meaningful composition targets.

They do not prescribe final camera positions.

For example, `HopperFocusAnchor` describes where the camera should look, not necessarily where the camera should move.

The final framing and transition design belong in Document 04\.

## **13.6 Spatial Validation**

During testing, visualize anchors with temporary helper markers and lines.

Confirm that:

* Hopper targets lie inside the hopper.  
* Coffee exits from the nozzle.  
* Cup placement is physically reachable.  
* Cup fill references lie inside the cup.  
* Spill positions lie on the supporting surface.  
* Camera targets are meaningful.  
* Animated pivots remain stable.

These helpers must be disabled in the production presentation.

---

# **14\. Interaction Geometry & Raycasting**

## **14.1 Interaction Targets**

The primary targetable objects are:

* Hopper lid.  
* Bean supply/container.  
* Cup.  
* Power button.  
* Make button.  
* Pour button.

## **14.2 Direct Mesh Interaction**

Where possible, the actual visible geometry should provide the interaction surface.

This maintains correspondence between the object the visitor sees and the object receiving the input.

## **14.3 Optional Interaction Proxies**

Small or irregular meshes may benefit from invisible hit regions.

Examples:

* Small button surfaces.  
* Narrow lid handles.  
* Fine ceramic handles.  
* Irregular bean containers.

Proxies should:

* Follow the correct object.  
* Avoid overlapping unrelated interactions.  
* Be appropriately sized for pointer selection.  
* Remain invisible.  
* Not contribute unintended shadows or reflections.  
* Be clearly separated from the visual asset.

## **14.4 Hit Priority**

When multiple objects overlap under the pointer, the interaction system must respond to the intended accessible object.

For example, clicking a button should not accidentally select the entire machine body.

## **14.5 Dragging**

The cup and bean supply require continuous pointer interaction.

Their roots must support stable transforms during dragging or scripted physical manipulation.

The runtime may use raycasting against constrained planes or another controlled spatial mapping.

The asset must provide suitable origins and bounds.

## **14.6 No Physics Engine Requirement**

The physical illusion should be achieved through carefully controlled transformations unless simulation offers a clear advantage.

A full rigid-body physics engine is not required for the core experience.

---

# **15\. Material & Texture Specification**

## **15.1 Material Philosophy**

Materials must preserve the warm, premium, believable product identity.

They should use physically based rendering properties appropriate to their intended physical substances.

Material quality depends on lighting, roughness, reflections, geometry, and scale—not texture complexity alone.

## **15.2 Primary Material Library**

The production asset should use consistently named materials.

| Material ID | Intended surface |
| ----- | ----- |
| `MAT_CharcoalBody` | Main machine housing |
| `MAT_SatinMetal` | Brushed metal fascia and trim |
| `MAT_DarkTrim` | Dark functional trim |
| `MAT_Button` | Physical button surfaces |
| `MAT_HopperGlass` | Transparent hopper |
| `MAT_Ceramic` | Cup |
| `MAT_CoffeeBean` | Roasted beans |
| `MAT_Rubber` | Functional rubber components where needed |
| `MAT_StatusIndicator` | Physical indicator surface, if included |

Coffee liquid, steam, and dynamic spills may use separate runtime materials.

## **15.3 Charcoal Body**

Target properties:

* Dark neutral charcoal.  
* Semi-matte or softly satin finish.  
* Controlled reflections.  
* Clear form under large area lighting.  
* No excessively glossy plastic appearance.

A roughness range around 0.4–0.7 can be explored, depending on whether the modeled surface is painted metal or plastic.

These values are visual starting points, not mandatory final shader parameters.

## **15.4 Satin Metal**

Target properties:

* Light or medium neutral metallic appearance.  
* Soft stretched highlights where appropriate.  
* Believable brushed surface character.  
* Controlled roughness.

A roughness range around 0.25–0.5 may be explored.

Strong mirror reflections should be avoided unless supported by the selected physical reference.

## **15.5 Hopper**

The hopper should appear transparent or lightly tinted.

Required qualities:

* Recognizable surface thickness.  
* Appropriate reflections.  
* Readable interior beans.  
* Clear silhouette.  
* No extreme glass distortion.

The final web material may need adjustments beyond standard glTF material settings to achieve the desired appearance.

## **15.6 Ceramic**

The cup should use a warm white or off-white ceramic finish.

It should exhibit:

* Smooth highlights.  
* Subtle roughness.  
* Clean shape definition.  
* Believable surface response.  
* Sufficient contrast with the coffee.

Avoid a pure emissive white appearance.

## **15.7 Coffee Beans**

The bean material should contain subtle tonal variation.

The color should remain natural and warm.

Surface detail may come from geometry, textures, or restrained material variation.

Avoid identical, overly shiny beans that look manufactured from plastic.

## **15.8 Material Naming & Reuse**

Reuse identical materials where appropriate.

Avoid generating many duplicate materials with only insignificant differences.

Material reuse improves maintainability and may reduce runtime overhead.

---

# **16\. Textures, UVs & Blender Material Compatibility**

## **16.1 Texture Strategy**

Use textures where they provide meaningful visual information.

Examples include:

* Subtle surface roughness variation.  
* Brushed metal detail.  
* Coffee bean coloration.  
* Selected surface imperfections.  
* Normal mapping where appropriate.

Avoid textures that add noise without improving realism.

## **16.2 UV Preparation**

Any mesh requiring image textures must have suitable UVs.

UVs should avoid:

* Unnecessary distortion.  
* Obvious seams on prominent surfaces.  
* Inconsistent texture scale.  
* Excessive wasted texture area.  
* Overlapping islands when unique maps are required.

Simple uniform materials may not require complex texture layouts.

## **16.3 Texture Resolution**

Start with a resolution appropriate to the visible scale.

As an initial guideline:

* 512 px for small or low-importance details.  
* 1024 px for common material maps.  
* 2048 px only for prominent surfaces whose detail visibly requires it.

These are guidelines, not requirements to assign every mesh an individual texture.

## **16.4 Physically Based Materials**

Prefer Blender Principled BSDF configurations compatible with glTF export.

The exporter should preserve ordinary supported PBR properties wherever possible.

Complex Blender-only procedural node networks should not be assumed to render identically in Three.js.

## **16.5 Procedural Textures**

When a procedural Blender material is essential to the visual result:

* Bake its required information to supported textures, or  
* Recreate the effect intentionally in the runtime material.

Do not rely on accidental differences between Blender and web rendering.

## **16.6 Normal Maps**

Normal maps must use the convention expected by the glTF pipeline.

The final exported normal direction should be checked on curved and reflective surfaces.

## **16.7 Texture Color Space**

Base-color textures should use appropriate color interpretation.

Data textures such as roughness, metalness, and normal maps must not be incorrectly treated as color images.

The export and runtime should preserve these distinctions.

## **16.8 Transparent Materials**

Transparency may require special rendering treatment.

Hopper glass should be checked for:

* Correct surface ordering.  
* Correct reflections.  
* Interior bean visibility.  
* Depth and transparency artifacts.  
* Compatibility with the chosen lighting.

The Blender viewport preview is not final proof of web appearance.

---

# **17\. Geometry Quality & Optimization**

## **17.1 Silhouette First**

The most important geometry is the geometry that defines the visible product shape.

Bevels should be preserved where they significantly improve material highlights and contour quality.

## **17.2 Polygon Distribution**

Allocate geometry according to:

* Screen-space size.  
* Curvature.  
* Visibility.  
* Animation needs.  
* Silhouette importance.

Avoid giving hidden internal surfaces the same geometric detail as prominent external parts.

## **17.3 Mesh Cleanup**

The Blender scene must be checked for:

* Duplicate geometry.  
* Floating vertices.  
* Invalid faces.  
* Nonmanifold geometry where inappropriate.  
* Reversed normals.  
* Unnecessary internal faces.  
* Degenerate triangles.  
* Overlapping external surfaces.  
* Unapplied problematic transforms.  
* Unused modifiers and temporary objects.

## **17.4 Shading**

Use appropriate smooth shading, custom normals, and bevel support where necessary.

Large manufactured surfaces should not display unwanted faceting.

Hard edges should retain their intended structure.

## **17.5 Repeated Geometry**

Coffee beans and other repeated elements should be structured so the runtime can draw them efficiently.

Instancing may be appropriate where large numbers of identical or similar objects are required.

## **17.6 Material Complexity**

Prefer a small coherent material library over numerous near-duplicate materials.

Expensive special materials should be limited to surfaces where they provide meaningful visual benefit.

## **17.7 Performance Budget**

The final production budget must be validated using the intended exhibition hardware.

Before optimization, measure:

* Triangle count.  
* Draw calls.  
* Material count.  
* Texture memory.  
* GPU resource usage.  
* GLB transfer size.  
* Parse/loading time.  
* Runtime frame time.

Do not assume that a small GLB file necessarily produces a fast scene.

Likewise, do not sacrifice visible product quality to meet an arbitrary polygon count without profiling.

## **17.8 Optimization Sequence**

Preferred order:

1. Remove unused assets.  
2. Clean duplicate geometry.  
3. Simplify unseen details.  
4. Reduce unnecessary material splits.  
5. Reuse geometry and materials.  
6. Instance repeated objects where appropriate.  
7. Optimize texture resolution.  
8. Consider compression.  
9. Profile actual runtime behavior.  
10. Make additional changes based on measured bottlenecks.

---

# **18\. Export Preparation**

## **18.1 Production Source**

Maintain an editable Blender source file separate from the final exported GLB.

Suggested naming:

* `ritual_machine.blend`  
* `ritual_machine.glb`

These filenames are specified conventions rather than claims about existing files.

## **18.2 Source Organization**

The Blender project should remain understandable.

Use:

* Clearly named collections.  
* Stable object names.  
* Intentional parenting.  
* Dedicated pivot empties.  
* Clean transforms.  
* Defined materials.  
* Separated interactive objects.  
* A dedicated export collection or equivalent export selection.

## **18.3 Transform Preparation**

Before export:

* Confirm physical units.  
* Confirm front/up orientation.  
* Confirm root position.  
* Confirm expected scale.  
* Confirm animation pivots.  
* Remove accidental transforms.  
* Ensure no unintended nonuniform scaling.

Applying transforms must not destroy necessary pivot behavior or authored spatial relationships.

For animated parts, the pivot parent and visual child should be evaluated together.

## **18.4 Default Pose**

Export the machine in its canonical initial visual state:

* Machine powered off.  
* Hopper lid closed.  
* Hopper awaiting beans.  
* Bean supply visible.  
* Cup empty.  
* Cup at its designated starting position.  
* Buttons unpressed.  
* No active coffee stream.  
* No active steam or spill.  
* No prefilled coffee.

## **18.5 Runtime-Owned Animation**

Interactive animations are primarily executed by the web application.

The GLB does not need to contain baked sequences for:

* Opening the hopper.  
* Pressing buttons.  
* Dragging the cup.  
* Moving the bean supply.  
* Grinding.  
* Brewing.  
* Pouring.  
* Filling.  
* Steam.  
* Reset.

Blender may contain preview animations, but those should not accidentally conflict with runtime transform control.

## **18.6 Export Format**

Use glTF 2.0 binary format:

**`.glb`**

The export must preserve:

* Geometry.  
* Hierarchy.  
* Node transforms.  
* Materials.  
* UVs.  
* Required textures.  
* Names.  
* Animation reference nodes.

## **18.7 Lighting & Camera Export**

Do not depend on Blender scene lights or cameras as production runtime requirements.

They may be used for authoring previews.

The final web scene will define its own camera and lighting systems.

## **18.8 External Resources**

Where possible, the production GLB should be self-contained for straightforward loading.

If external texture files or compression decoders are required, they must be explicitly documented.

The build must not rely on files accidentally present only on the author's local computer.

## **18.9 GLB Validation**

After export, open the file in a glTF-compatible viewer or a minimal Three.js test scene.

Verify:

* Correct scale.  
* Correct orientation.  
* Material integrity.  
* Hierarchy.  
* Node names.  
* Pivot positions.  
* All required props.  
* Correct initial pose.  
* No missing textures.  
* No unintended hidden or duplicate objects.

A successful export dialog is not sufficient evidence that the asset is ready.

---

# **19\. Runtime Scene Contract**

## **19.1 Scene Ownership**

The runtime scene should own:

* Scene root.  
* Product asset instance.  
* Lighting.  
* Environment.  
* Camera.  
* Shadows.  
* Dynamic effects.  
* Interactive controllers.  
* Audio references.

The exported product should remain an asset inside that scene rather than an entire prebuilt application world.

## **19.2 Asset Loading**

Load the production GLB using a standard glTF-compatible loader.

Preserve its intended hierarchy.

The application should validate the availability of required nodes before enabling dependent interactions.

Missing essential nodes must be treated as integration errors, not silently ignored.

## **19.3 Root Placement**

Place the machine so its base aligns with the stage surface.

Avoid scaling the entire assembly based on its combined bounding box, especially when the asset also contains off-center cup and ingredient props.

The machine's verified physical dimensions and root should determine placement.

## **19.4 Dynamic Object References**

The runtime must retain independent references to:

* Hopper lid pivot.  
* Three button pivots.  
* Bean supply root.  
* Cup root.  
* Hopper target.  
* Coffee outlet anchor.  
* Cup-fill anchors.  
* Cup placement target.  
* Spill surface.

## **19.5 Runtime-Generated Elements**

The following may be generated separately:

* Coffee stream.  
* Coffee fill body/surface.  
* Droplets.  
* Spill/puddle.  
* Steam.  
* Dust or subtle atmosphere.  
* Temporary interaction helpers.

They should be spatially attached to the correct authored anchors.

## **19.6 State-Driven Visibility**

The scene must support visual changes such as:

* Empty versus filled hopper.  
* Bean supply depletion.  
* Machine indicator activation.  
* Coffee stream appearing/disappearing.  
* Fill level changes.  
* Steam activation.  
* Spill accumulation.

These conditions must reflect the experience state rather than independent arbitrary animation.

## **19.7 Visual Transform Consistency**

Any animated object must preserve the spatial relationship of its child references.

For example:

* Cup fill follows the cup.  
* Button visuals follow their pivots.  
* Hopper lid follows its hinge.  
* Bean emission follows the ingredient container.  
* Liquid emission follows the spout reference.

---

# **20\. Environment & Product Stage**

## **20.1 Stage Concept**

The environment is a restrained product stage.

Its visual language should sit between a believable countertop and a premium product-photography setup.

It should not feel like an unbounded abstract void or a fully furnished kitchen.

## **20.2 Supporting Surface**

The machine must sit on a believable surface.

Suitable treatments include:

* Fine stone.  
* Neutral composite.  
* Restrained natural wood.

The selected surface should:

* Support realistic shadows.  
* Establish physical scale.  
* Provide material contrast.  
* Remain visually unobtrusive.  
* Accommodate the cup and ingredient container.  
* Support visible spill behavior.

## **20.3 Background**

The background should provide soft environmental separation.

Possible approaches include:

* Neutral studio backdrop.  
* Continuous wall/floor treatment.  
* Restrained photographic cyclorama.  
* Minimal environmental geometry.

The final design should preserve warm minimalism and product realism.

## **20.4 Lighting Ownership**

Lighting must be authored in the runtime.

The scene will require a deliberate combination of:

* Soft key light.  
* Restrained fill.  
* Edge separation.  
* Environment reflections.  
* Contact shadows.  
* Optional machine-integrated lighting.

The exact configuration is defined in Document 04\.

## **20.5 Contact & Grounding**

The machine, cup, and bean container must visually rest on their supporting surfaces.

Their geometry and placement must support realistic contact shadows.

Avoid floating props, intersecting surfaces, or oversized shadows inconsistent with the lighting.

## **20.6 Initial Composition**

The first rendered frame should clearly show:

* The machine.  
* The hopper.  
* The bean supply.  
* The cup.  
* The control area.  
* The outlet.  
* Enough supporting surface to establish the physical scene.

The visual hierarchy should read immediately.

## **20.7 Product Dominance**

The machine must occupy the dominant share of attention.

The ingredient and cup should be noticeable without feeling equally visually massive.

The background should never attract more attention than the product.

---

# **21\. Camera & Scene Reference Geometry**

## **21.1 Camera Dependency**

The asset must support a controlled three-quarter opening view and near-complete constrained horizontal inspection.

Its geometry should remain convincing from the reachable angles.

## **21.2 Framing References**

The following scene anchors are specified:

* `MachineFocusAnchor`  
* `HopperFocusAnchor`  
* `PourFocusAnchor`

They establish semantic points of interest.

The final camera positions are determined by composition, not by arbitrary object centers.

## **21.3 Hero Composition**

The opening camera should favor a view that reveals:

* Front fascia.  
* Some side depth.  
* Hopper.  
* Buttons.  
* Outlet.  
* Cup.  
* Ingredient supply.

The camera should not obscure the hopper or cup with an unnecessarily dramatic angle.

## **21.4 Camera Range Compatibility**

The asset should be checked through the intended horizontal orbit range, approximately ±150–170° as a concept reference.

Its rear and sides should not contain glaring production errors visible during legitimate exploration.

However, these areas do not require the same detail allocation as the hero-facing features.

## **21.5 Interaction Readability**

Important interactable objects must remain reachable from appropriate camera positions.

The visitor should not need to locate a precise hidden viewpoint before every required action.

## **21.6 Camera Collision**

The asset should provide appropriate spatial bounds so the camera can avoid entering or clipping through the machine.

Final camera collision and distance handling belong in Document 04/05.

---

# **22\. Blender-to-Web Visual Consistency**

## **22.1 Principle**

The exported asset should resemble the approved Blender reference while acknowledging that different renderers may produce different lighting and material responses.

## **22.2 Reference Renders**

Before integration, capture reference images of:

* Default three-quarter view.  
* Front.  
* Side.  
* Rear.  
* Top.  
* Hopper open.  
* Beans/container.  
* Cup.  
* Material close-ups.

These references will support visual comparison during web integration.

## **22.3 Material Verification**

Compare the Blender reference and runtime rendering for:

* Body color.  
* Metal reflectivity.  
* Hopper transparency.  
* Ceramic appearance.  
* Bean colors.  
* Bevel highlights.  
* Surface roughness.

Adjust runtime lighting or supported material parameters as needed without changing the approved product identity.

## **22.4 Scale Verification**

Place temporary scale references or inspect numerical dimensions to confirm the machine and props remain physically plausible.

A visually pleasing camera composition must not conceal incorrect asset scale.

## **22.5 No Accidental Redesign**

Integration must not change the product silhouette, core materials, button layout, or physical component relationships merely to make implementation easier.

Any actual asset redesign requires an explicit creative decision.

---

# **23\. Asset Validation & Acceptance Testing**

## **23.1 Geometry Validation**

* Machine silhouette matches the approved design.  
* Overall dimensions are recorded.  
* Chassis rests correctly on its base plane.  
* Bevels and surface curvature are visually acceptable.  
* No obvious duplicate geometry remains.  
* Normals are correct.  
* No problematic z-fighting exists.  
* Prominent surfaces shade correctly.  
* Unnecessary hidden geometry has been reviewed.

## **23.2 Hierarchy Validation**

* Machine root exists.  
* Bean supply has an independent root.  
* Cup has an independent root.  
* Hopper lid has a suitable hinge pivot.  
* Each button can be animated independently.  
* Required placement anchors exist.  
* Required naming is stable.  
* Exported hierarchy matches the approved contract.  
* No unexpected automatic name suffixes remain.

## **23.3 Interaction Validation**

* Hopper can open without intersection.  
* Hopper can close to its exact resting pose.  
* Bean container can move toward the hopper.  
* Beans can visibly enter the hopper.  
* Hopper supports empty and filled conditions.  
* Buttons can depress inward plausibly.  
* Cup can be moved independently.  
* Cup has reachable aligned and misaligned positions.  
* All primary interaction surfaces are usable.

## **23.4 Liquid Preparation Validation**

* Coffee exit anchor matches the visible nozzle.  
* Cup mouth anchor is centered correctly.  
* Cup interior supports dynamic filling.  
* Maximum fill reference is below the rim.  
* Liquid can be represented without intersecting cup walls.  
* Spill surface is correctly positioned.  
* Cup movement preserves fill anchor alignment.

## **23.5 Material Validation**

* Charcoal body remains readable.  
* Satin metal has controlled highlights.  
* Hopper material reveals its contents.  
* Bean material is recognizable.  
* Ceramic material looks believable.  
* No essential textures are missing.  
* Normal and roughness maps behave correctly.  
* Exported material assignments are valid.

## **23.6 Export Validation**

* Production GLB exports successfully.  
* File loads in a glTF viewer.  
* Orientation is correct.  
* Real-world scale is preserved.  
* Root transform is predictable.  
* Required nodes are addressable.  
* Textures load.  
* Default pose is correct.  
* No unintended cameras/lights are required.  
* No unexpected assets are included.

## **23.7 Performance Validation**

* Triangle count has been measured.  
* Draw calls have been measured.  
* Material count has been reviewed.  
* Texture memory has been reviewed.  
* Load time has been tested.  
* Visual quality is acceptable after optimization.  
* Repeated instances are efficient.  
* Asset performance is acceptable on the target device.

---

# **24\. Production Handoff Package**

## **24.1 Required Files**

The final asset package should include:

**Source**

`ritual_machine.blend`

**Production Export**

`ritual_machine.glb`

**Supporting Assets**

Any required external texture files, if not embedded in the GLB.

**Reference**

Approved product reference images and Blender renders.

**Manifest**

A written record of the exported node hierarchy, dimensions, and relevant transforms.

## **24.2 Asset Manifest**

The manifest should contain:

* Blender version used.  
* Exporter version/settings if relevant.  
* Production asset version.  
* Machine dimensions.  
* Coordinate orientation.  
* Root transforms.  
* Required node names.  
* Interactive pivot names.  
* Important anchor positions.  
* Material names.  
* Texture dependencies.  
* Known limitations.  
* Export verification date.

## **24.3 Export Verification Record**

After the final export is prepared, record the actual asset properties rather than relying solely on the design specification.

At minimum:

| Property | Verification |
| ----- | ----- |
| Exact machine width | To measure |
| Exact machine depth | To measure |
| Exact machine height | To measure |
| Cup dimensions | To measure |
| Hopper lid pivot | To inspect |
| Button pivot axes | To inspect |
| Coffee outlet origin | To inspect |
| Cup initial position | To define and validate |
| Bean container initial position | To define and validate |
| Actual GLB node names | To inspect |
| Actual material names | To inspect |
| Export file size | To measure |
| Visible triangle count | To measure |
| Runtime loading success | To test |

This record separates actual Blender facts from proposed production conventions.

---

# **25\. Production Risks & Safeguards**

| Risk | Consequence | Safeguard |
| ----- | ----- | ----- |
| Wrong machine scale | Camera and effects appear incorrect | Export at real-world scale and measure |
| Wrong axis orientation | Asset faces the wrong direction | Validate Blender/glTF conversion |
| Wrong lid pivot | Lid rotates unnaturally | Author hinge parent at physical axis |
| Buttons merged into body | Physical controls cannot animate | Preserve independent nodes |
| Cup merged into machine | Placement interaction becomes difficult | Independent cup root |
| No cup interior | Liquid filling looks artificial | Model interior and fill anchors |
| Incorrect nozzle anchor | Coffee exits from wrong position | Place and verify explicit anchor |
| Beans permanently modeled in hopper | Preparation has no visible effect | Support empty/filled states |
| Misaligned ingredient anchors | Beans appear to miss hopper | Verify transfer geometry |
| Excessive polygon detail | Unnecessary GPU cost | Optimize based on visibility |
| Blender-only shader reliance | Material breaks in web | Use compatible PBR/baked textures |
| Unstable node names | Runtime references break | Lock and verify export hierarchy |
| Incorrect prop starting positions | Interaction loses meaning | Define canonical non-completed starting layout |
| Lighting baked into asset | Runtime art direction becomes inflexible | Keep lighting runtime-owned |
| Overly complex export | Integration becomes fragile | Preserve a clean minimal asset contract |

---

# **26\. Requirements & Decisions Register**

## **26.1 Confirmed Creative Requirements**

| ID | Decision | Status |
| ----- | ----- | ----- |
| A-001 | Automatic bean-to-cup espresso machine | Confirmed |
| A-002 | Compact consumer-appliance proportions | Confirmed |
| A-003 | Approximate design dimensions 35 × 40 × 40 cm | Confirmed reference |
| A-004 | Warm minimalism and believable product design | Confirmed |
| A-005 | Charcoal and satin metal as primary machine materials | Confirmed |
| A-006 | Transparent or tinted hopper | Confirmed |
| A-007 | Warm white/off-white ceramic cup | Confirmed |
| A-008 | Independently operable hopper lid | Confirmed |
| A-009 | Physical coffee-bean transfer | Confirmed |
| A-010 | Independently movable cup | Confirmed |
| A-011 | Exactly three primary buttons | Confirmed |
| A-012 | Dedicated coffee outlet | Confirmed |
| A-013 | Cup position affects dispensing result | Confirmed |
| A-014 | Runtime-controlled dynamic coffee | Confirmed direction |
| A-015 | Minimal centered product stage | Confirmed |
| A-016 | Controlled three-quarter product presentation | Confirmed |
| A-017 | No full kitchen environment | Confirmed |
| A-018 | No conventional screen-space UI | Confirmed |
| A-019 | Preparation-first initial experience | Confirmed |
| A-020 | Empty cup and closed hopper in initial state | Confirmed |

## **26.2 Specified Production Conventions**

| ID | Specification | Status |
| ----- | ----- | ----- |
| S-001 | Meter-based spatial units | Specified |
| S-002 | Machine-root origin at base footprint center | Specified |
| S-003 | Runtime machine front faces \+Z | Specified |
| S-004 | Independent machine, bean, and cup roots | Specified |
| S-005 | Named pivots for lid and buttons | Specified |
| S-006 | Named anchors for ingredient transfer | Specified |
| S-007 | Named anchors for cup alignment and fill | Specified |
| S-008 | Named coffee outlet reference | Specified |
| S-009 | Blender exports the physical model; runtime owns effects | Specified |
| S-010 | Initial cup position is not already aligned | Specified |
| S-011 | glTF 2.0 binary production export | Specified |
| S-012 | Dynamic interactions are primarily runtime-controlled | Specified |
| S-013 | Stable descriptive node naming | Specified |
| S-014 | Runtime lighting and camera are independent of Blender previews | Specified |

These conventions should be validated against the source model and approved as the final asset contract before implementation depends on them.

## **26.3 Outstanding Asset Verification**

| ID | Item | Status |
| ----- | ----- | ----- |
| V-001 | Exact dimensions of the final Blender model | To Verify |
| V-002 | Exact object hierarchy | To Verify |
| V-003 | Hopper pivot position and axis | To Verify |
| V-004 | Hopper opening angle | To Verify |
| V-005 | Button movement axes and distances | To Verify |
| V-006 | Bean container geometry and transfer pivot | To Verify |
| V-007 | Cup geometry and interior | To Verify |
| V-008 | Final cup start and target coordinates | To Verify |
| V-009 | Coffee outlet count and precise anchors | To Verify |
| V-010 | Exact material assignments | To Verify |
| V-011 | Texture dependencies | To Verify |
| V-012 | Exported GLB hierarchy and transform validity | To Verify |
| V-013 | Asset geometry/performance metrics | To Verify |
| V-014 | Final stage proportions and composition | To Verify |

---

# **27\. Asset Definition of Done**

The 3D asset package is considered ready for implementation when:

**Physical design**

* The machine matches the approved reference concept.  
* Proportions and material hierarchy are coherent.  
* All important physical components are present.

**Interactive structure**

* Moving objects are independent.  
* Pivots are correct.  
* Bean transfer is spatially possible.  
* Cup placement is spatially possible.  
* Buttons can be independently animated.  
* Liquid and fill references are available.

**Technical validity**

* The coordinate system is consistent.  
* Scale is correct.  
* The hierarchy is clean.  
* Names are stable.  
* Materials and textures export correctly.  
* The GLB loads without errors.

**Visual quality**

* The machine looks believable.  
* Major surfaces shade correctly.  
* Materials remain readable.  
* The silhouette is strong.  
* No significant geometry artifacts remain.

**Handoff**

* Editable source exists.  
* Production export exists.  
* Required anchors are documented.  
* Asset metadata is recorded.  
* The runtime team can integrate the model without reconstructing missing spatial information.

---

# **28\. Final 3D Production Statement**

Ritual's 3D assets must form a coherent physical system rather than a static collection of models.

The machine provides the structural and visual center.

The hopper creates the ingredient destination.

The bean supply creates a meaningful preparation action.

The cup creates a movable output destination.

The buttons provide recognizable physical control.

The outlet defines the origin of the final coffee stream.

Materials, geometry, scale, and composition make the machine believable.

The hierarchy, pivots, and spatial anchors make it operable.

The environment makes it feel physically present.

The runtime transforms these prepared assets into a responsive cinematic experience.

Every part should exist for a reason.

Every moving part should have a reliable pivot.

Every important spatial relationship should be defined.

Every material should support the object's identity.

Every exported asset should be predictable.

The goal is not to model everything.

The goal is to model precisely what the experience needs, at a level of quality that allows the final website to feel convincingly physical.

**Believable geometry.**

**Deliberate hierarchy.**

**Correct physical scale.**

**Interaction-ready assets.**

**Cinematic composition.**

**One coherent product.**

---

**End of Document 02 — 3D Assets & Scene Specification**

**Status:** Draft — Pending Final Blender/GLB Verification  
**Next Document:** RITUAL-03 — Interaction & Experience Specification  
**Implementation Authority:** Approved Ritual documentation and verified production assets.