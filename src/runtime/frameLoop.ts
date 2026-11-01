import type { ExperienceEngine } from '../domain/experienceEngine';
import type { SimulationClock } from '../domain/simulationClock';

export interface FrameAdvanceOptions {
  deltaSeconds: number;
  nowMs: number;
  /** True while the tab is hidden, the context is lost, or reset is animating. */
  suspended: boolean;
  /** Apply inactivity policy after advancing (default true). */
  evaluateTimeouts?: boolean;
}

/**
 * One deliberate update order for every frame (RITUAL-05 §11).
 *
 * Presentation systems read the engine afterwards; they never advance it.
 * Cup position is already committed to the engine by the interaction layer
 * before this runs, which is what keeps capture correct for the current step.
 */
export function advanceFrame(
  engine: ExperienceEngine,
  clock: SimulationClock,
  options: FrameAdvanceOptions,
): number {
  if (options.suspended) {
    // Drop any debt accumulated while suspended: resuming must not fast-forward.
    clock.reset();
    return 0;
  }
  const steps = clock.advance(engine, options.deltaSeconds);
  if (options.evaluateTimeouts !== false) engine.evaluateTimeouts(options.nowMs);
  return steps;
}
