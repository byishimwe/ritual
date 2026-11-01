import { describe, expect, it } from 'vitest';
import { ExperienceEngine } from '../../src/domain/experienceEngine';
import { SimulationClock, advanceSimulation } from '../../src/domain/simulationClock';
import { advanceFrame } from '../../src/runtime/frameLoop';
import { VisibilityTracker, shouldResetAfterHidden } from '../../src/runtime/visibilityPolicy';
import { prepareMachine } from './helpers';

const NOW = 30_000;

describe('simulation clock', () => {
  it('clamps a stalled frame so no stage is skipped', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    const clock = new SimulationClock();

    // A 5-second stall must not advance the machine by 5 seconds.
    clock.advance(engine, 5);
    expect(engine.getState().machine).toBe('GRINDING');
    expect(engine.getState().processElapsed).toBeLessThanOrEqual(0.11);

    // Even a huge delta cannot run through grinding + pause + brewing.
    const steps = clock.advance(engine, 1000);
    expect(steps).toBeLessThanOrEqual(6);
    expect(engine.getState().machine).toBe('GRINDING');
  });

  it('ignores negative and non-finite deltas', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    const clock = new SimulationClock();
    clock.advance(engine, -1);
    clock.advance(engine, Number.NaN);
    clock.advance(engine, Number.POSITIVE_INFINITY);
    expect(engine.getState().processElapsed).toBe(0);
  });

  it('carries leftover time into the next stage exactly once', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    advanceSimulation(engine, 3.8);
    expect(engine.getState().machine).toBe('GRINDING');

    // A single step that crosses the boundary applies the remainder to the
    // new stage rather than discarding it or repeating the transition.
    engine.step(0.5);
    const s = engine.getState();
    expect(s.machine).toBe('TRANSITION');
    expect(s.processElapsed).toBeCloseTo(0.3, 6);
  });

  it('does not advance while suspended', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    const clock = new SimulationClock();

    advanceFrame(engine, clock, { deltaSeconds: 0.5, nowMs: NOW, suspended: true });
    expect(engine.getState().processElapsed).toBe(0);

    advanceFrame(engine, clock, { deltaSeconds: 1 / 60, nowMs: NOW, suspended: false });
    expect(engine.getState().processElapsed).toBeGreaterThan(0);
  });

  it('resumes without a catch-up jump after a short suspension', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    const clock = new SimulationClock();
    for (let i = 0; i < 60; i += 1) {
      advanceFrame(engine, clock, { deltaSeconds: 1 / 60, nowMs: NOW, suspended: i > 20 && i < 55 });
    }
    expect(engine.getState().processElapsed).toBeLessThan(1.1);
  });
});

describe('visibility policy', () => {
  it('resets only after the 60 s hidden window', () => {
    expect(shouldResetAfterHidden(59_999)).toBe(false);
    expect(shouldResetAfterHidden(60_000)).toBe(false);
    expect(shouldResetAfterHidden(60_001)).toBe(true);
  });

  it('reports the hidden duration once', () => {
    const tracker = new VisibilityTracker();
    tracker.onHidden(1_000);
    tracker.onHidden(2_000); // duplicate events keep the first timestamp
    expect(tracker.isHidden).toBe(true);
    expect(tracker.onVisible(3_000)).toBe(2_000);
    expect(tracker.isHidden).toBe(false);
    expect(tracker.onVisible(4_000)).toBe(0);
  });
});

describe('inactivity policy', () => {
  it('never resets an untouched OFF scene', () => {
    const engine = new ExperienceEngine(NOW);
    expect(engine.evaluateTimeouts(NOW + 600_000)).toBe(false);
    expect(engine.getState().machine).toBe('OFF');
  });

  it('resets abandoned preparation after 90 s', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    expect(engine.evaluateTimeouts(NOW + 89_000)).toBe(false);
    expect(engine.getState().machine).toBe('IDLE_ON');
    expect(engine.evaluateTimeouts(NOW + 90_001)).toBe(true);
    expect(engine.getState().machine).toBe('RESETTING');
  });

  it('resets a prepared batch after 75 s', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    advanceSimulation(engine, 9.4);
    const readyAt = NOW + 5_000;
    engine.command({ type: 'NOTE_ACTIVITY' }, readyAt);
    expect(engine.evaluateTimeouts(readyAt + 74_000)).toBe(false);
    expect(engine.evaluateTimeouts(readyAt + 75_001)).toBe(true);
  });

  it('resets a completed result after 20 s', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    advanceSimulation(engine, 9.4);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    expect(engine.getState().machine).toBe('COMPLETE');
    expect(engine.evaluateTimeouts(NOW + 19_000)).toBe(false);
    expect(engine.evaluateTimeouts(NOW + 20_001)).toBe(true);
  });

  it('does not reset during grinding, pause or brewing', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    expect(engine.evaluateTimeouts(NOW + 600_000)).toBe(false);
    expect(engine.getState().machine).toBe('GRINDING');
    advanceSimulation(engine, 4.6);
    expect(engine.evaluateTimeouts(NOW + 600_000)).toBe(false);
    expect(engine.getState().machine).toBe('TRANSITION');
    advanceSimulation(engine, 0.7);
    expect(engine.evaluateTimeouts(NOW + 600_000)).toBe(false);
    expect(engine.getState().machine).toBe('BREWING');
  });

  it('does not reset during an active pour', () => {
    const engine = new ExperienceEngine(NOW);
    prepareMachine(engine, NOW);
    engine.command({ type: 'PRESS_MAKE' }, NOW);
    advanceSimulation(engine, 9.4);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    expect(engine.evaluateTimeouts(NOW + 600_000)).toBe(false);
    expect(engine.getState().machine).toBe('POURING');
  });
});
