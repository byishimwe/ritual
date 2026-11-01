import { SIMULATION } from '../config/experience';
import type { ExperienceEngine } from './experienceEngine';

/**
 * The one authoritative time source for machine behaviour.
 *
 * Real frame deltas are clamped and subdivided into fixed simulation steps, so
 * a long stall cannot skip or duplicate a stage boundary, and a tab restored
 * after being hidden cannot fast-forward the whole coffee process.
 */
export class SimulationClock {
  private accumulator = 0;
  private droppedSeconds = 0;

  /** Feeds a real frame delta (seconds) into the engine. Returns steps run. */
  advance(engine: ExperienceEngine, frameDeltaSeconds: number): number {
    const delta = Number.isFinite(frameDeltaSeconds) ? frameDeltaSeconds : 0;
    if (delta <= 0) return 0;

    const clamped = Math.min(delta, SIMULATION.maxFrameDelta);
    this.accumulator += clamped;

    let steps = 0;
    while (this.accumulator >= SIMULATION.step && steps < SIMULATION.maxSubsteps) {
      engine.step(SIMULATION.step);
      this.accumulator -= SIMULATION.step;
      steps += 1;
    }

    // Never bank unprocessed time: that is what turns a stall into a visible
    // catch-up jump later on.
    if (steps >= SIMULATION.maxSubsteps) {
      this.droppedSeconds += this.accumulator;
      this.accumulator = 0;
    }
    return steps;
  }

  /** For diagnostics only. */
  get droppedTime(): number {
    return this.droppedSeconds;
  }

  reset(): void {
    this.accumulator = 0;
  }
}

/**
 * Deterministic advancement for tests: consumes exactly `seconds` in fixed
 * steps, never sleeping for real time.
 */
export function advanceSimulation(engine: ExperienceEngine, seconds: number): void {
  let remaining = seconds;
  let guard = 0;
  while (remaining > 1e-12 && guard < 100_000) {
    guard += 1;
    const step = Math.min(SIMULATION.step, remaining);
    engine.step(step);
    remaining -= step;
  }
}
