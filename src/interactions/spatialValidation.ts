import { ANCHORS } from '../config/asset';
import { SPATIAL } from '../config/experience';

/**
 * Spatial acceptance rules for direct manipulation.
 *
 * These are pure functions so the interaction layer's tolerances can be tested
 * without a renderer (RITUAL-05 §18).
 */

export interface Point2 {
  x: number;
  z: number;
}

/** Was the bean container released over the hopper mouth? */
export function isBeanReleaseAccepted(
  jar: Point2,
  opening: Point2 = ANCHORS.hopperOpening,
  tolerance = SPATIAL.beanDropTolerance,
): boolean {
  return Math.hypot(jar.x - opening.x, jar.z - opening.z) <= tolerance;
}

/** Has the pointer travelled far enough to count as a drag rather than a click? */
export function exceedsClickSlop(
  dx: number,
  dy: number,
  slop = SPATIAL.clickSlopPx,
): boolean {
  return Math.hypot(dx, dy) > slop;
}

/** Clamp a carried prop to a handling region around the stage. */
export function clampToStage(
  point: Point2,
  bounds = { minX: -0.42, maxX: 0.42, minZ: -0.34, maxZ: 0.34 },
): Point2 {
  return {
    x: Math.min(Math.max(point.x, bounds.minX), bounds.maxX),
    z: Math.min(Math.max(point.z, bounds.minZ), bounds.maxZ),
  };
}
