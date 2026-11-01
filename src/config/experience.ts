/**
 * Central behavioural constants.
 *
 * Every value here is a calibrated baseline from RITUAL-03 §26 / RITUAL-04 §28.
 * Nothing in the presentation layer may hardcode its own copy of these.
 */

/** Mechanical preparation stages (RITUAL-03 §12.2). */
export const PROCESS_DURATIONS = {
  GRINDING: 4.0,
  TRANSITION: 1.2,
  BREWING: 4.2,
} as const;

export const TOTAL_PROCESS_SECONDS =
  PROCESS_DURATIONS.GRINDING + PROCESS_DURATIONS.TRANSITION + PROCESS_DURATIONS.BREWING; // 9.4

/** Normalised coffee volumes (RITUAL-03 §14.2). */
export const COFFEE = {
  /** Usable cup capacity, in cup units. */
  cupCapacity: 1.0,
  /** One Make action yields exactly one finite batch. */
  preparedBatch: 1.3,
  /** Dispensing rate, cup units per second. */
  pourRate: 0.125,
  /** Floating-point slack for conservation checks. */
  epsilon: 1e-6,
} as const;

/**
 * How long a parcel of coffee takes to fall from the nozzle to the receiving
 * surface. Computed from the measured outlet height (~0.10 m) and gravity:
 * sqrt(2h/g) ≈ 0.143 s. Kept a constant so arrival is deterministic.
 */
export const PARCEL_FALL_SECONDS = 0.143;

/** Simulation scheduling (RITUAL-05 §9). */
export const SIMULATION = {
  step: 1 / 60,
  maxFrameDelta: 0.1,
  maxSubsteps: 6,
} as const;

/** Session inactivity policy (RITUAL-03 §19.3, §22.4). */
export const TIMEOUTS = {
  /** Abandoned pre-brew preparation (scene changed). */
  preparationMs: 90_000,
  /** Prepared batch waiting for the visitor. */
  readyMs: 75_000,
  /** Completed result left untouched. */
  completeMs: 20_000,
  /** Hidden-tab interruption that discards the session. */
  hiddenResetMs: 60_000,
} as const;

/** Presentation timings (RITUAL-04 §10). */
export const MOTION = {
  hopperOpen: 0.7,
  hopperClose: 0.55,
  buttonPressIn: 0.08,
  buttonPressOut: 0.14,
  cupSettle: 0.16,
  cupStepSettle: 0.26,
  cupLift: 0.12,
  /** Bean container lift into the handling pose. */
  beanPickup: 0.22,
  /** Full transfer choreography: lift, tilt, release, settle, return. */
  beanTiltIn: 0.45,
  beanPour: 0.85,
  beanReturn: 0.55,
  beanTransfer: 1.6,
  /** Reset restoration. */
  reset: 1.3,
  /** Stream reveal and pinch. */
  streamIn: 0.22,
  streamOut: 0.3,
} as const;

/** Bean transfer choreography shared by the director and the prop. */
export const BEAN_MOTION = {
  /** Tilt reached while pouring, radians. */
  pourTilt: 1.15,
  /** Number of beans animated in the falling stream. */
  fallingBeans: 26,
} as const;

/** Physical tolerances (RITUAL-03 §9.3, RITUAL-05 §18). */
export const SPATIAL = {
  /** Horizontal travel of a button along its mounting axis, in metres. */
  buttonTravel: 0.0024,
  /** Release this close to the hopper mouth and the transfer is accepted. */
  beanDropTolerance: 0.095,
  /** Release inside this radius and the cup eases onto the ideal spot. */
  cupSnapRadius: 0.008,
  /**
   * Cup drag bounds: the machine's own cup well (tray floor x ±0.132,
   * z 0.093..0.200) inset so the vessel always stays on solid surface.
   */
  cupMinX: -0.086,
  cupMaxX: 0.086,
  cupMinZ: 0.126,
  cupMaxZ: 0.158,
  /** Pointer travel, in pixels, beyond which a press becomes a drag. */
  clickSlopPx: 4,
} as const;
