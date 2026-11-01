import { describe, expect, it } from 'vitest';
import { ANCHORS, CUP, STREAM } from '../../src/config/asset';
import { CAPTURE_LIMITS, captureFraction } from '../../src/domain/capture';
import { clampCupPosition, cupSupportY } from '../../src/domain/guards';
import {
  CUP_INTERIOR_VOLUME_M3,
  interiorRadiusAtHeightFraction,
  surfaceYForVolumeFraction,
  volumeAtHeightFraction,
  volumeFractionToHeightFraction,
} from '../../src/domain/cupGeometry';

describe('capture geometry', () => {
  it('captures everything inside R - S and nothing beyond R + S', () => {
    expect(captureFraction(0)).toBe(1);
    expect(captureFraction(CAPTURE_LIMITS.fullCaptureDistance - 1e-6)).toBe(1);
    expect(captureFraction(CAPTURE_LIMITS.zeroCaptureDistance + 1e-6)).toBe(0);
  });

  it('varies continuously across the rim band', () => {
    const samples: number[] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i += 1) {
      const d =
        CAPTURE_LIMITS.fullCaptureDistance +
        ((CAPTURE_LIMITS.zeroCaptureDistance - CAPTURE_LIMITS.fullCaptureDistance) * i) / steps;
      samples.push(captureFraction(d));
    }
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]).toBeLessThanOrEqual(samples[i - 1] + 1e-12);
      expect(samples[i]).toBeGreaterThanOrEqual(0);
      expect(samples[i]).toBeLessThanOrEqual(1);
    }
    expect(samples[0]).toBeGreaterThan(0.99);
    expect(samples[samples.length - 1]).toBeLessThan(0.01);
    expect(samples[Math.floor(samples.length / 2)]).toBeGreaterThan(0.3);
    expect(samples[Math.floor(samples.length / 2)]).toBeLessThan(0.7);
  });

  it('is measured from the nozzle, not the machine centre', () => {
    expect(ANCHORS.coffeeExit.x).toBeCloseTo(0, 6);
    expect(ANCHORS.coffeeExit.z).toBeCloseTo(0.1299, 4);
  });

  it('lets the cup well reach a complete miss', () => {
    const worstCase = CUP.placement.x + 0.086;
    expect(worstCase - CUP.placement.x).toBeGreaterThan(CAPTURE_LIMITS.zeroCaptureDistance);
  });

  it('has a stream narrower than the cup mouth', () => {
    expect(STREAM.captureRadius).toBeLessThan(CUP.captureRadius);
  });
});

describe('cup placement bounds', () => {
  it('clamps to the machine cup well and survives invalid input', () => {
    expect(clampCupPosition(9, -9)).toEqual({ x: 0.086, z: 0.126 });
    expect(clampCupPosition(Number.NaN, Number.NaN).x).toBe(CUP.start.x);
    expect(clampCupPosition(0, 0.14)).toEqual({ x: 0, z: 0.14 });
  });

  it('rests on the drip grille only when centred over it', () => {
    expect(cupSupportY(CUP.placement.x, CUP.placement.z)).toBe(CUP.padTopY);
    expect(cupSupportY(CUP.start.x, CUP.start.z)).toBe(CUP.trayFloorY);
  });
});

describe('cup interior volume mapping', () => {
  it('has a plausible physical capacity for its measured geometry', () => {
    // ~156 ml for a 9.3 cm-wide ceramic cup: credible for the model.
    expect(CUP_INTERIOR_VOLUME_M3 * 1000).toBeGreaterThan(0.1);
    expect(CUP_INTERIOR_VOLUME_M3 * 1000).toBeLessThan(0.25);
  });

  it('maps volume to height monotonically and within the cup', () => {
    let previous = -1;
    for (let f = 0; f <= 1.0001; f += 0.02) {
      const t = volumeFractionToHeightFraction(Math.min(f, 1));
      expect(t).toBeGreaterThanOrEqual(previous - 1e-9);
      previous = t;
      const y = surfaceYForVolumeFraction(Math.min(f, 1));
      expect(y).toBeGreaterThanOrEqual(CUP.interiorFloorY - 1e-9);
      expect(y).toBeLessThanOrEqual(CUP.fillMaxY + 1e-9);
    }
    expect(volumeFractionToHeightFraction(0)).toBe(0);
    expect(volumeFractionToHeightFraction(1)).toBe(1);
  });

  it('accounts for the taper: the cup widens, so half the volume sits above mid-height', () => {
    const halfHeight = volumeFractionToHeightFraction(0.5);
    expect(halfHeight).toBeGreaterThan(0.5);
    expect(halfHeight).toBeLessThan(0.8);
  });

  it('is consistent with its own height-to-volume integral', () => {
    for (const t of [0.1, 0.25, 0.5, 0.75, 0.95]) {
      const ratio = volumeAtHeightFraction(t) / volumeAtHeightFraction(1);
      expect(volumeFractionToHeightFraction(ratio)).toBeCloseTo(t, 2);
    }
    expect(interiorRadiusAtHeightFraction(0)).toBeLessThan(interiorRadiusAtHeightFraction(1));
  });
});
