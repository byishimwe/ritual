import { CUP } from '../../src/config/asset';
import { advanceSimulation } from '../../src/domain/simulationClock';
import type { ExperienceEngine } from '../../src/domain/experienceEngine';
import type { ExperienceEvent } from '../../src/domain/events';

export function withEvents(engine: ExperienceEngine) {
  const events: ExperienceEvent[] = [];
  engine.subscribe((event) => events.push(event));
  return { events, clear: () => events.splice(0, events.length) };
}

/** Open the hopper, transfer beans, close it and power on. Returns success. */
export function prepareMachine(engine: ExperienceEngine, now = 1000): boolean {
  const steps = [
    { type: 'TOGGLE_HOPPER' as const },
    { type: 'HOPPER_MOTION_COMPLETE' as const },
    { type: 'BEGIN_BEAN_DRAG' as const },
    { type: 'COMMIT_BEAN_TRANSFER' as const },
    { type: 'COMPLETE_BEAN_TRANSFER' as const },
    { type: 'TOGGLE_HOPPER' as const },
    { type: 'HOPPER_MOTION_COMPLETE' as const },
    { type: 'POWER' as const },
  ];
  let allAccepted = true;
  for (const step of steps) {
    if (!engine.command(step, now).accepted) allAccepted = false;
  }
  return allAccepted;
}

/** Reach READY_TO_POUR with a fresh batch. Asserts nothing; returns success. */
export function brewBatch(engine: ExperienceEngine, now = 1000): boolean {
  if (!prepareMachine(engine, now)) return false;
  if (!engine.command({ type: 'PRESS_MAKE' }, now).accepted) return false;
  advanceSimulation(engine, 9.4);
  return engine.getState().machine === 'READY_TO_POUR';
}

export function placeCup(engine: ExperienceEngine, x: number, z: number, now = 1000): void {
  engine.command({ type: 'SET_CUP_POSITION', x, z }, now);
}

export function alignCup(engine: ExperienceEngine, now = 1000): void {
  placeCup(engine, CUP.placement.x, CUP.placement.z, now);
}

export { CUP };
