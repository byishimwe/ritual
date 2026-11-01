import { describe, expect, it } from 'vitest';
import { CUP } from '../../src/config/asset';
import { ExperienceEngine } from '../../src/domain/experienceEngine';
import { advanceSimulation } from '../../src/domain/simulationClock';
import { alignCup, brewBatch, prepareMachine, withEvents } from './helpers';

const NOW = 40_000;

function expectPristine(engine: ExperienceEngine): void {
  const s = engine.getState();
  expect(s.machine).toBe('OFF');
  expect(s.hopper).toBe('CLOSED');
  expect(s.hopperMotion).toBe('IDLE');
  expect(s.beansLoaded).toBe(false);
  expect(s.beanSupply).toBe('AVAILABLE');
  expect(s.cup.position.x).toBeCloseTo(CUP.start.x, 9);
  expect(s.cup.position.z).toBeCloseTo(CUP.start.z, 9);
  expect(s.cup.dragging).toBe(false);
  expect(s.processElapsed).toBe(0);
  expect(s.parcels).toHaveLength(0);
  expect(s.cycle.makeCommitted).toBe(false);
  expect(s.coffee.cupVolume).toBe(0);
  expect(s.coffee.missedVolume).toBe(0);
  expect(s.coffee.overflowVolume).toBe(0);
  expect(s.coffee.remainingVolume).toBe(0);
  expect(s.coffee.inFlightVolume).toBe(0);
  expect(s.coffee.discardedVolume).toBe(0);
}

describe('reset', () => {
  it('from OFF is atomic and requires FINISH_RESET to become OFF again', () => {
    const engine = new ExperienceEngine(NOW);
    const { events } = withEvents(engine);
    expect(engine.command({ type: 'RESET', reason: 'operator' }, NOW).accepted).toBe(true);
    expect(engine.getState().machine).toBe('RESETTING');
    expect(events.filter((e) => e.type === 'RESET_STARTED')).toHaveLength(1);
    expect(engine.command({ type: 'FINISH_RESET' }, NOW).accepted).toBe(true);
    expect(engine.getState().machine).toBe('OFF');
    expect(events.filter((e) => e.type === 'RESET_COMPLETED')).toHaveLength(1);
    expectPristine(engine);
  });

  it('clears a loaded, powered, cup-positioned session', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'RESET', reason: 'operator' }, NOW);
    engine.command({ type: 'FINISH_RESET' }, NOW);
    expectPristine(engine);
  });

  it('works from every machine state', () => {
    const states: Array<(e: ExperienceEngine) => void> = [
      () => undefined,
      (e) => e.command({ type: 'POWER' }, NOW),
      (e) => prepareMachine(e, NOW),
      (e) => {
        prepareMachine(e, NOW);
        e.command({ type: 'PRESS_MAKE' }, NOW);
        advanceSimulation(e, 5);
      },
      (e) => brewBatch(e, NOW),
      (e) => {
        brewBatch(e, NOW);
        alignCup(e, NOW);
        e.command({ type: 'PRESS_POUR' }, NOW);
        advanceSimulation(e, 1);
      },
      (e) => {
        brewBatch(e, NOW);
        alignCup(e, NOW);
        e.command({ type: 'PRESS_POUR' }, NOW);
        e.command({ type: 'PRESS_POUR' }, NOW);
      },
    ];
    for (const build of states) {
      const engine = new ExperienceEngine(NOW);
      build(engine);
      expect(engine.command({ type: 'RESET', reason: 'operator' }, NOW).accepted).toBe(true);
      expect(engine.command({ type: 'FINISH_RESET' }, NOW).accepted).toBe(true);
      expectPristine(engine);
    }
  });

  it('invalidates work from the previous session', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW);
    engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW);
    const generationBefore = engine.getState().session.generation;

    engine.command({ type: 'RESET', reason: 'operator' }, NOW);
    const generationAfter = engine.getState().session.generation;
    expect(generationAfter).toBe(generationBefore + 1);

    // A delayed transfer completion from the old session must not load beans.
    expect(engine.command({ type: 'COMPLETE_BEAN_TRANSFER' }, NOW).accepted).toBe(false);
    engine.command({ type: 'FINISH_RESET' }, NOW);
    expect(engine.getState().beansLoaded).toBe(false);
  });

  it('rejects visitor commands while resetting', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'RESET', reason: 'operator' }, NOW);
    for (const command of [
      { type: 'POWER' as const },
      { type: 'TOGGLE_HOPPER' as const },
      { type: 'PRESS_MAKE' as const },
      { type: 'PRESS_POUR' as const },
      { type: 'BEGIN_BEAN_DRAG' as const },
      { type: 'SET_CUP_POSITION' as const, x: 0, z: 0 },
    ]) {
      expect(engine.command(command, NOW).accepted).toBe(false);
    }
    expect(engine.getState().machine).toBe('RESETTING');
  });

  it('is idempotent', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);

    engine.command({ type: 'RESET', reason: 'operator' }, NOW);
    expect(engine.command({ type: 'RESET', reason: 'operator' }, NOW).accepted).toBe(false);
    engine.command({ type: 'FINISH_RESET' }, NOW);
    expect(engine.command({ type: 'RESET', reason: 'operator' }, NOW).accepted).toBe(true);
    engine.command({ type: 'FINISH_RESET' }, NOW);

    expectPristine(engine);
    const snapshot = JSON.stringify(engine.getState().coffee);
    expect(snapshot).toContain('"cupVolume":0');
  });

  it('stops a pour and clears in-flight coffee', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    advanceSimulation(engine, 2);
    expect(engine.getState().coffee.inFlightVolume).toBeGreaterThan(0);

    engine.command({ type: 'RESET', reason: 'operator' }, NOW);
    expect(engine.getState().parcels).toHaveLength(0);
    expect(engine.getState().coffee.inFlightVolume).toBe(0);

    // No parcel may arrive after the reset.
    advanceSimulation(engine, 1);
    expect(engine.getState().coffee.cupVolume).toBe(0);
    expect(engine.getState().coffee.missedVolume).toBe(0);
  });

  it('power during COMPLETE becomes a reset with the approved reason', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    expect(engine.getState().machine).toBe('COMPLETE');
    expect(engine.command({ type: 'POWER' }, NOW).accepted).toBe(true);
    const s = engine.getState();
    expect(s.machine).toBe('RESETTING');
    expect(s.session.resetReason).toBe('power_after_completion');
  });
});
