import { describe, expect, it } from 'vitest';
import { CUP } from '../../src/config/asset';
import { ExperienceEngine } from '../../src/domain/experienceEngine';
import { advanceSimulation } from '../../src/domain/simulationClock';
import { alignCup, brewBatch, prepareMachine, withEvents } from './helpers';

const NOW = 10_000;

describe('initial state', () => {
  it('starts OFF, hopper closed and empty, supply available, cup empty and unaligned', () => {
    const engine = new ExperienceEngine(NOW);
    const s = engine.getState();
    expect(s.machine).toBe('OFF');
    expect(s.hopper).toBe('CLOSED');
    expect(s.hopperMotion).toBe('IDLE');
    expect(s.beansLoaded).toBe(false);
    expect(s.beanSupply).toBe('AVAILABLE');
    expect(s.coffee.cupVolume).toBe(0);
    expect(s.coffee.remainingVolume).toBe(0);
    expect(s.coffee.preparedBatch).toBe(0);
    expect(s.cup.position.x).toBe(CUP.start.x);
    expect(s.cup.position.z).toBe(CUP.start.z);
    // The cup must not begin on the receiving position.
    expect(Math.hypot(s.cup.position.x - CUP.placement.x, s.cup.position.z - CUP.placement.z)).
      toBeGreaterThan(0.03);
    expect(s.session.generation).toBe(0);
  });
});

describe('power', () => {
  it('activates the machine from OFF', () => {
    const engine = new ExperienceEngine(NOW);
    expect(engine.command({ type: 'POWER' }, NOW).accepted).toBe(true);
    expect(engine.getState().machine).toBe('IDLE_ON');
  });

  it('switches off from IDLE_ON while preserving preparation', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'POWER' }, NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW);
    engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW);
    engine.command({ type: 'COMPLETE_BEAN_TRANSFER' }, NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);

    expect(engine.command({ type: 'POWER' }, NOW).accepted).toBe(true);
    const off = engine.getState();
    expect(off.machine).toBe('OFF');
    expect(off.beansLoaded).toBe(true);
    expect(off.beanSupply).toBe('LOADED');
    expect(off.hopper).toBe('CLOSED');

    expect(engine.command({ type: 'POWER' }, NOW).accepted).toBe(true);
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(true);
  });

  it('is rejected during mechanical processing', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    expect(engine.command({ type: 'POWER' }, NOW).accepted).toBe(false);
    expect(engine.getState().machine).toBe('GRINDING');
  });

  it('is rejected while ready and while pouring', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    expect(engine.command({ type: 'POWER' }, NOW).accepted).toBe(false);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    expect(engine.command({ type: 'POWER' }, NOW).accepted).toBe(false);
    expect(engine.getState().machine).toBe('POURING');
  });
});

describe('hopper', () => {
  it('opens and closes while the machine is off', () => {
    const engine = new ExperienceEngine(NOW);
    expect(engine.command({ type: 'TOGGLE_HOPPER' }, NOW).accepted).toBe(true);
    expect(engine.getState().hopper).toBe('OPEN');
    expect(engine.getState().hopperMotion).toBe('MOVING');
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    expect(engine.getState().hopperMotion).toBe('IDLE');
    expect(engine.command({ type: 'TOGGLE_HOPPER' }, NOW).accepted).toBe(true);
    expect(engine.getState().hopper).toBe('CLOSED');
  });

  it('retargets during motion instead of stacking animations', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    expect(engine.getState().hopper).toBe('OPEN');
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    expect(engine.getState().hopper).toBe('CLOSED');
    expect(engine.getState().hopperMotion).toBe('MOVING');
  });

  it('locks from grinding through completion', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    expect(engine.command({ type: 'TOGGLE_HOPPER' }, NOW).accepted).toBe(false);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    expect(engine.command({ type: 'TOGGLE_HOPPER' }, NOW).accepted).toBe(false);
  });

  it('cannot close during an accepted bean transfer', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW);
    engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW);
    expect(engine.command({ type: 'TOGGLE_HOPPER' }, NOW).accepted).toBe(false);
  });
});

describe('coffee beans', () => {
  it('can be added while the machine is OFF', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    expect(engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW).accepted).toBe(true);
    expect(engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW).accepted).toBe(true);
    expect(engine.command({ type: 'COMPLETE_BEAN_TRANSFER' }, NOW).accepted).toBe(true);
    const s = engine.getState();
    expect(s.machine).toBe('OFF');
    expect(s.beansLoaded).toBe(true);
    expect(s.beanSupply).toBe('LOADED');
  });

  it('can be added while powered on', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'POWER' }, NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW);
    expect(engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW).accepted).toBe(true);
    expect(engine.command({ type: 'COMPLETE_BEAN_TRANSFER' }, NOW).accepted).toBe(true);
    expect(engine.getState().machine).toBe('IDLE_ON');
    expect(engine.getState().beansLoaded).toBe(true);
  });

  it('cannot be transferred into a closed hopper', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW);
    expect(engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW).accepted).toBe(false);
    expect(engine.getState().beansLoaded).toBe(false);
  });

  it('cannot be duplicated in one cycle', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW);
    engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW);
    engine.command({ type: 'COMPLETE_BEAN_TRANSFER' }, NOW);
    // A second attempt: the supply is consumed, so no drag can begin.
    expect(engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW).accepted).toBe(false);
    expect(engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW).accepted).toBe(false);
    expect(engine.getState().beanSupply).toBe('LOADED');
  });
});

describe('make guards', () => {
  it('fails without power', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW);
    engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW);
    engine.command({ type: 'COMPLETE_BEAN_TRANSFER' }, NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(false);
    expect(engine.getState().machine).toBe('OFF');
  });

  it('fails without beans', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'POWER' }, NOW);
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(false);
    expect(engine.getState().machine).toBe('IDLE_ON');
  });

  it('fails with the hopper open', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'POWER' }, NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW);
    engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW);
    engine.command({ type: 'COMPLETE_BEAN_TRANSFER' }, NOW);
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(false);
    expect(engine.getState().machine).toBe('IDLE_ON');
  });

  it('fails while the lid is still settling closed', () => {
    const engine = new ExperienceEngine(NOW);
    engine.command({ type: 'POWER' }, NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    engine.command({ type: 'BEGIN_BEAN_DRAG' }, NOW);
    engine.command({ type: 'COMMIT_BEAN_TRANSFER' }, NOW);
    engine.command({ type: 'COMPLETE_BEAN_TRANSFER' }, NOW);
    engine.command({ type: 'TOGGLE_HOPPER' }, NOW); // closing, motion MOVING
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(false);
    engine.command({ type: 'HOPPER_MOTION_COMPLETE' }, NOW);
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(true);
  });

  it('succeeds with valid prerequisites and locks the ingredient', () => {
    const engine = new ExperienceEngine(NOW);
    expect(prepareMachine(engine, NOW)).toBe(true);
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(true);
    const s = engine.getState();
    expect(s.machine).toBe('GRINDING');
    expect(s.cycle.makeCommitted).toBe(true);
    expect(s.beansLoaded).toBe(true);
    expect(engine.command({ type: 'TOGGLE_HOPPER' }, NOW).accepted).toBe(false);
  });

  it('rejects repeated Make presses during processing', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    advanceSimulation(engine, 1);
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(false);
    advanceSimulation(engine, 4);
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(false);
    advanceSimulation(engine, 5);
    expect(engine.getState().machine).toBe('READY_TO_POUR');
    expect(engine.command({ type: 'PRESS_MAKE' }, NOW).accepted).toBe(false);
  });
});

describe('mechanical preparation timing', () => {
  it('grinds for exactly 4.0 s and then pauses exactly once', () => {
    const engine = new ExperienceEngine(NOW);
    const { events } = withEvents(engine);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    events.length = 0;

    advanceSimulation(engine, 3.99);
    expect(engine.getState().machine).toBe('GRINDING');

    advanceSimulation(engine, 0.02);
    expect(engine.getState().machine).toBe('TRANSITION');
    expect(events.filter((e) => e.type === 'GRINDING_FINISHED')).toHaveLength(1);
    expect(events.filter((e) => e.type === 'TRANSITION_STARTED')).toHaveLength(1);

    // 0.01 s already carried into the pause, so 1.18 s more keeps it there.
    advanceSimulation(engine, 1.18);
    expect(engine.getState().machine).toBe('TRANSITION');
    expect(events.filter((e) => e.type === 'GRINDING_FINISHED')).toHaveLength(1);

    advanceSimulation(engine, 0.05);
    expect(engine.getState().machine).toBe('BREWING');
    expect(events.filter((e) => e.type === 'BREWING_STARTED')).toHaveLength(1);
  });

  it('brews for exactly 4.2 s and creates exactly one batch', () => {
    const engine = new ExperienceEngine(NOW);
    const { events } = withEvents(engine);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    events.length = 0;

    advanceSimulation(engine, 5.21);
    expect(engine.getState().machine).toBe('BREWING');

    advanceSimulation(engine, 4.18);
    expect(engine.getState().machine).toBe('BREWING');

    advanceSimulation(engine, 0.02);
    const s = engine.getState();
    expect(s.machine).toBe('READY_TO_POUR');
    expect(s.coffee.preparedBatch).toBeCloseTo(1.3, 10);
    expect(s.coffee.remainingVolume).toBeCloseTo(1.3, 10);
    expect(events.filter((e) => e.type === 'COFFEE_READY')).toHaveLength(1);
    expect(events.filter((e) => e.type === 'BREWING_FINISHED')).toHaveLength(1);

    // No automatic dispensing, ever.
    advanceSimulation(engine, 2);
    expect(engine.getState().machine).toBe('READY_TO_POUR');
    expect(engine.getState().coffee.cupVolume).toBe(0);
    expect(engine.getState().coffee.totalReleasedVolume).toBe(0);
  });

  it('reaches READY after 9.4 s of processing and not before', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    advanceSimulation(engine, 9.39);
    expect(engine.getState().machine).not.toBe('READY_TO_POUR');
    advanceSimulation(engine, 0.02);
    expect(engine.getState().machine).toBe('READY_TO_POUR');
  });
});

describe('rapid input', () => {
  it('keeps invariants valid under a burst of commands', () => {
    const engine = new ExperienceEngine(NOW);
    const commands = [
      { type: 'POWER' as const },
      { type: 'TOGGLE_HOPPER' as const },
      { type: 'TOGGLE_HOPPER' as const },
      { type: 'POWER' as const },
      { type: 'PRESS_MAKE' as const },
      { type: 'PRESS_POUR' as const },
      { type: 'PRESS_POUR' as const },
      { type: 'BEGIN_BEAN_DRAG' as const },
      { type: 'CANCEL_BEAN_DRAG' as const },
      { type: 'SET_CUP_POSITION' as const, x: 99, z: -99 },
    ];
    for (const command of commands) engine.command(command, NOW);
    const s = engine.getState();
    expect(Number.isFinite(s.cup.position.x)).toBe(true);
    expect(s.cup.position.x).toBeLessThanOrEqual(0.086);
    expect(s.cup.position.x).toBeGreaterThanOrEqual(-0.086);
    expect(s.coffee.cupVolume).toBeGreaterThanOrEqual(0);
    expect(s.coffee.remainingVolume).toBeGreaterThanOrEqual(0);
    expect(engine.command({ type: 'PRESS_POUR' }, NOW).accepted).toBe(false);
  });
});

describe('full alignment pour', () => {
  it('starts only when ready and fills the cup from captured volume', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    expect(engine.command({ type: 'PRESS_POUR' }, NOW).accepted).toBe(true);
    expect(engine.getState().machine).toBe('POURING');

    advanceSimulation(engine, 8.0);
    const s = engine.getState();
    expect(s.coffee.cupVolume).toBeGreaterThan(0.9);
    expect(s.coffee.cupVolume).toBeLessThanOrEqual(1.0 + 1e-9);
    expect(s.coffee.missedVolume).toBeLessThan(0.03);
  });
});
