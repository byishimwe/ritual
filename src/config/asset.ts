/**
 * Measured asset contract for `public/assets/models/coffee_machine.glb`.
 *
 * Every number below was measured from the GLB's own accessor bounds, not
 * guessed. The model exports in arbitrary units with baked world-space
 * vertices (nodes are identity transforms except the lid hinge and the bean
 * pile), so a single uniform scale plus one offset adapts it to metres.
 *
 * Measured raw extents (glTF units, Y-up):
 *   body      X -1.3010..1.3010   Y -1.6408..1.2750   Z -1.6195..1.8103
 *   HopperLid origin (0.0003, 1.8425, -1.2964) — the hinge is the node origin
 *   coffeeCup X -0.3639..0.5893   Y -1.0710..-0.5684   Z 0.9100..1.6377
 *   coffeeSpout bottom face      Y -0.2597            Z 1.1165..1.2395
 *
 * Scale 0.12 m/unit gives 0.312 × 0.412 × 0.429 m — proportions preserved and
 * inside RITUAL-02's approved ranges (W 30–40, D 35–45, H 35–45 cm).
 *
 * See docs/implementation/ASSET-CONTRACT.md for the full audit.
 */

export const MODEL_SCALE = 0.12;

/** Raw-space offset applied before scaling so the base sits at y = 0 and the
 *  chassis footprint is centred on the origin. */
const OFFSET = { x: 0, y: 1.6408, z: -0.0954 } as const;

export function worldFromRaw(x: number, y: number, z: number): [number, number, number] {
  return [(x + OFFSET.x) * MODEL_SCALE, (y + OFFSET.y) * MODEL_SCALE, (z + OFFSET.z) * MODEL_SCALE];
}

export const ASSET = {
  url: '/assets/models/coffee_machine.glb',
  version: 'blender-glb-v1',
  scale: MODEL_SCALE,
  offset: OFFSET,
  /** Required renderable nodes; a missing one is a fatal contract error. */
  nodes: {
    body: 'body',
    lid: 'HopperLid',
    hopper: 'Hopper',
    spout: 'coffeeSpout',
    cup: 'coffeeCup',
    power: 'btnPower',
    make: 'btnMake',
    pour: 'btnPour',
    beanPile: 'coffeeBeans',
  },
  materials: {
    charcoalBody: 'mCharcoalBody',
    satinMetal: 'mSatinMetal',
    charcoalMetal: 'mCharcoalMetal',
    goldAccent: 'mGoldAccent',
    darkTrim: 'mDarkMetalTrim',
    buttonCap: 'mButtonCap',
    beans: 'mCoffeeBeans',
    ceramic: 'mCeramic',
    spout: 'mCoffeeSpout',
    hopperGlass: 'mGlassHopper',
  },
} as const;

/** Derived physical dimensions (metres). */
export const DIMENSIONS = {
  width: 2.602 * MODEL_SCALE, // 0.312
  depth: 3.4298 * MODEL_SCALE, // 0.412
  height: 3.5714 * MODEL_SCALE, // 0.429 (closed lid)
  counterY: 0,
} as const;

/** Semantic spatial anchors (world metres), all derived from measurements. */
export const ANCHORS = {
  machine: { x: 0, y: 0.2, z: 0.02 },
  hopperFocus: { x: 0, y: 0.4, z: -0.05 },
  pourFocus: { x: 0, y: 0.13, z: 0.14 },

  /** Lid hinge axis — the node's own origin. */
  lidHinge: { x: 0, y: 0.418, z: -0.167 },
  /** Centre of the hopper opening, at the glass rim. */
  hopperOpening: { x: 0, y: 0.4191, z: -0.0636 },
  hopperRadius: 0.0878,
  /** Where transferred beans settle. */
  beanTarget: { x: 0, y: 0.3523, z: -0.0685 },

  /** Nozzle exit: centre of the spout's bottom face. */
  coffeeExit: { x: 0, y: 0.16573, z: 0.12991 },

  /** Button centres, on the front fascia. */
  powerButton: { x: 0, y: 0.2739, z: 0.1602 },
  makeButton: { x: -0.036, y: 0.2739, z: 0.1602 },
  pourButton: { x: 0.036, y: 0.2739, z: 0.1602 },
} as const;

/**
 * Button centres in the asset's raw authoring units, measured from the button
 * meshes' own bounds. Their nodes are identity-transformed, so these are also
 * the local coordinates the press animation and hit proxies work in.
 */
export const BUTTON_RAW = {
  power: { x: 0, y: 0.6417, z: 1.4304 },
  make: { x: -0.3, y: 0.6417, z: 1.4304 },
  pour: { x: 0.3, y: 0.6417, z: 1.4304 },
  /** Hit proxy radius: 13 mm of comfortable clickability around an 8 mm cap. */
  hitRadius: 0.11,
} as const;

/**
 * Cup local origin in the asset's raw units.
 *
 * The cup's geometry is baked in world space and its mouth is a circle whose
 * rim centroid sits at raw x = 0, z = 1.2739 — *not* at the bounding-box centre,
 * because the handle extends to x = +0.589. The base of the vessel is at raw
 * y = -1.071. The adapter subtracts these so the cup group's origin is the
 * vessel's axis at its base, which is what all placement maths assumes.
 */
export const CUP_RAW = { axisX: 0, axisZ: 1.2739, baseY: -1.071 } as const;

/** Ceramic cup measurements and the volume model that follows from them. */
export const CUP = {
  /** Ideal receiving position: directly under the nozzle, on the drip grille. */
  placement: { x: 0, z: 0.1299 },
  /** Initial resting position: visibly to the left, on the lower tray floor. */
  start: { x: -0.084, z: 0.15 },
  /** Outer rim radius (visual), interior mouth radius (liquid-accepting). */
  outerRadius: 0.0467,
  mouthRadius: 0.039,
  /**
   * Effective capture radius: the last few millimetres of a ceramic rim are
   * rounded, so coffee striking there runs over the outside. Trimmed by 5 mm.
   */
  captureRadius: 0.034,
  /** Height of the cup's interior floor above its base plane. */
  interiorFloorOffset: 0.0059,
  /** Cup base rests here on the raised drip grille. */
  padTopY: 0.0684,
  /** …and here once slid off the grille onto the tray floor. */
  trayFloorY: 0.0529,
  /** Interior floor and maximum normal fill level (world Y on the pad). */
  interiorFloorY: 0.0743,
  fillMaxY: 0.1267,
  rimY: 0.1287,
  /** Heights relative to the cup's own base — used by the fill renderer, which
   *  is parented to the cup and must not depend on where the cup is standing. */
  localFloorY: 0.0743 - 0.0684,
  localFillMaxY: 0.1267 - 0.0684,
  localRimY: 0.1287 - 0.0684,
  /** Lift applied while dragging so the cup clears the grille step with grace. */
  dragLift: 0.004,
  /** Interior radius at the floor and at the maximum fill level. */
  interiorRadiusBottom: 0.0228,
  interiorRadiusTop: 0.039,
  /** Drip grille footprint in world XZ (cup centre inside ⇒ supported above). */
  pad: { halfX: 0.048, minZ: 0.1108, maxZ: 0.1708 },
} as const;

/** Coffee stream geometry. */
export const STREAM = {
  /** Visible radius at the nozzle and at impact. */
  radiusTop: 0.0055,
  radiusBottom: 0.0042,
  /** Effective radius used by capture maths (includes splash tolerance). */
  captureRadius: 0.009,
} as const;

/** Bean supply prop (built at runtime — the GLB has no movable container). */
export const BEAN_PROP = {
  rest: { x: -0.196, y: 0, z: 0.212 },
  /** Height the jar is carried at so it clears the machine and open lid. */
  carryY: 0.464,
  bodyRadius: 0.043,
  bodyHeight: 0.082,
  /** Local height of the mouth above the jar's base. */
  mouthHeight: 0.082,
  /**
   * Pose reached for an accepted transfer. Derived so that, at the calibrated
   * pour tilt, the jar's mouth sits just above the hopper opening:
   *   mouth = base + (0, h·cosθ, h·sinθ)
   */
  transfer: { x: 0, y: 0.3975, z: -0.1384 },
} as const;

/** Hopper lid hinge motion (RITUAL-04 §10.1–10.3). */
export const LID = {
  /**
   * Negative X rotation lifts the front edge of the lid around its rear hinge.
   * 96° puts the lid just past vertical, leaning back clear of the opening —
   * the legacy -135° would fold it flat against the machine's rear.
   */
  openAngle: -(96 * Math.PI) / 180,
} as const;

/** Machine-integrated indicator (RITUAL-04 §6.8). */
export const INDICATOR = {
  color: '#cba16c',
  off: 0,
  standby: 0.55,
  ready: 2.6,
  busy: 1.4,
  fault: 0.9,
} as const;

/** Camera framing (RITUAL-04 §7.2, §7.4–7.6). */
export const CAMERA = {
  fov: 35,
  hero: { azimuth: 30 * (Math.PI / 180), polar: 74 * (Math.PI / 180), distance: 1.12 },
  limits: {
    minAzimuth: -160 * (Math.PI / 180),
    maxAzimuth: 160 * (Math.PI / 180),
    minPolar: 62 * (Math.PI / 180),
    maxPolar: 98 * (Math.PI / 180),
    minDistance: 0.95,
    maxDistance: 1.8,
  },
  damping: 0.075,
} as const;
