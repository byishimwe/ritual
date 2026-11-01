import { CUP } from '../config/asset';

/**
 * Volume-to-height mapping for the ceramic cup.
 *
 * The cup's interior is a tapered frustum (measured radii 0.0228 m at the
 * interior floor and 0.039 m at the maximum fill level), so equal volume
 * increments produce unequal height increments. A precomputed table inverts
 * the exact frustum integral; linear interpolation between samples keeps the
 * visible surface within a fraction of a millimetre of the true level.
 */

const HEIGHT_M = CUP.fillMaxY - CUP.interiorFloorY;
const RADIUS_BOTTOM = CUP.interiorRadiusBottom;
const RADIUS_TOP = CUP.interiorRadiusTop;
const TABLE_STEPS = 128;

/** Exact volume of coffee between the interior floor and normalised height t. */
export function volumeAtHeightFraction(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  const h = clamped * HEIGHT_M;
  const slope = (RADIUS_TOP - RADIUS_BOTTOM) / HEIGHT_M;
  return (
    Math.PI *
    (RADIUS_BOTTOM * RADIUS_BOTTOM * h +
      RADIUS_BOTTOM * slope * h * h +
      (slope * slope * h * h * h) / 3)
  );
}

const FULL_VOLUME = volumeAtHeightFraction(1);

/** Table of normalised volume (0..1) sampled at even height fractions. */
const VOLUME_TO_HEIGHT_TABLE: number[] = Array.from({ length: TABLE_STEPS + 1 }, (_, i) =>
  volumeAtHeightFraction(i / TABLE_STEPS) / FULL_VOLUME,
);

/** Normalised cup volume (0..1 of capacity) → normalised height (0..1). */
export function volumeFractionToHeightFraction(volumeFraction: number): number {
  const v = Math.min(Math.max(volumeFraction, 0), 1);
  if (v <= 0) return 0;
  if (v >= 1) return 1;

  let lo = 0;
  let hi = TABLE_STEPS;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (VOLUME_TO_HEIGHT_TABLE[mid] <= v) lo = mid;
    else hi = mid;
  }
  const v0 = VOLUME_TO_HEIGHT_TABLE[lo];
  const v1 = VOLUME_TO_HEIGHT_TABLE[hi];
  const span = v1 - v0;
  const within = span > 1e-9 ? (v - v0) / span : 0;
  return (lo + within) / TABLE_STEPS;
}

/** World Y of the coffee surface for a given normalised cup volume. */
export function surfaceYForVolumeFraction(volumeFraction: number): number {
  return CUP.interiorFloorY + volumeFractionToHeightFraction(volumeFraction) * HEIGHT_M;
}

/** Interior radius at a normalised fill height — used to size the fill body. */
export function interiorRadiusAtHeightFraction(t: number): number {
  const clamped = Math.min(Math.max(t, 0), 1);
  return RADIUS_BOTTOM + (RADIUS_TOP - RADIUS_BOTTOM) * clamped;
}

export const CUP_INTERIOR_HEIGHT = HEIGHT_M;
export const CUP_INTERIOR_VOLUME_M3 = FULL_VOLUME;
