/**
 * Quality tiers (RITUAL-06 §performance).
 *
 * Behaviour is identical in every tier — only shadow resolution, steam density
 * and postprocessing change. The exhibition machine can force a tier with
 * `?quality=low` if the projector or integrated GPU needs it.
 */

export type QualityTier = 'high' | 'medium' | 'low';

export interface QualityProfile {
  tier: QualityTier;
  dpr: [number, number];
  shadows: boolean;
  postprocessing: boolean;
  reducedMotion: boolean;
}

function resolveTier(): QualityTier {
  const override = new URLSearchParams(window.location.search).get('quality');
  if (override === 'high' || override === 'medium' || override === 'low') return override;

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
  if (cores >= 8 && memory >= 8) return 'high';
  if (cores >= 4) return 'medium';
  return 'low';
}

export function detectQuality(): QualityProfile {
  const tier = resolveTier();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dpr: [number, number] =
    tier === 'high' ? [1, 1.75] : tier === 'medium' ? [1, 1.4] : [0.85, 1];

  return {
    tier,
    dpr,
    shadows: tier !== 'low',
    postprocessing: tier === 'high' && !reducedMotion,
    reducedMotion,
  };
}
