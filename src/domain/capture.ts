import { CUP, STREAM } from '../config/asset';
import type { Vec2 } from './types';

/**
 * Geometric coffee capture (RITUAL-03 §9).
 *
 * The cup centre and the stream footprint are compared in the horizontal
 * receiving plane. Inside `R - S` the whole stream lands in the cup; beyond
 * `R + S` none of it does; between the two the fraction falls off smoothly so
 * a cup dragged across the stream produces a continuous, readable change.
 */

function smootherStep(t: number): number {
  const x = Math.min(Math.max(t, 0), 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function captureFraction(
  distance: number,
  mouthRadius = CUP.captureRadius,
  streamRadius = STREAM.captureRadius,
): number {
  if (!Number.isFinite(distance)) return 0;
  const full = mouthRadius - streamRadius;
  const none = mouthRadius + streamRadius;
  if (distance <= full) return 1;
  if (distance >= none) return 0;
  return 1 - smootherStep((distance - full) / Math.max(none - full, 1e-9));
}

export function cupStreamDistance(cupPosition: Vec2, exit: { x: number; z: number }): number {
  const dx = cupPosition.x - exit.x;
  const dz = cupPosition.z - exit.z;
  return Math.hypot(dx, dz);
}

/** Convenience for presentation and tests: capture for a cup position. */
export function captureFractionAt(cupPosition: Vec2, exit: { x: number; z: number }): number {
  return captureFraction(cupStreamDistance(cupPosition, exit));
}

/**
 * How far the cup can be from the ideal position before coffee stops
 * reaching it entirely. Used to document and test the reachable outcomes.
 */
export const CAPTURE_LIMITS = {
  fullCaptureDistance: CUP.captureRadius - STREAM.captureRadius,
  zeroCaptureDistance: CUP.captureRadius + STREAM.captureRadius,
} as const;
