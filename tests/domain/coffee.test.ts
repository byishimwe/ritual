import { describe, expect, it } from 'vitest';
import { CUP } from '../../src/config/asset';
import { COFFEE } from '../../src/config/experience';
import { ExperienceEngine } from '../../src/domain/experienceEngine';
import { advanceSimulation } from '../../src/domain/simulationClock';
import type { ExperienceState } from '../../src/domain/types';
import { alignCup, brewBatch, placeCup } from './helpers';

const NOW = 20_000;

function invariantError(s: Readonly<ExperienceState>): number {
  const c = s.coffee;
  const total =
    c.remainingVolume + c.inFlightVolume + c.cupVolume + c.missedVolume + c.overflowVolume + c.discardedVolume;
  return Math.abs(c.preparedBatch - total);
}

function expectConserved(s: Readonly<ExperienceState>): void {
  expect(invariantError(s)).toBeLessThan(1e-6);
  expect(s.coffee.cupVolume).toBeGreaterThanOrEqual(0);
  expect(s.coffee.cupVolume).toBeLessThanOrEqual(COFFEE.cupCapacity + 1e-9);
  expect(s.coffee.remainingVolume).toBeGreaterThanOrEqual(0);
  expect(s.coffee.missedVolume).toBeGreaterThanOrEqual(0);
  expect(s.coffee.overflowVolume).toBeGreaterThanOrEqual(0);
  expect(Number.isFinite(s.coffee.cupVolume)).toBe(true);
}

describe('pour guards', () => {
  it('cannot pour before brewing completes', () => {
    const engine = new ExperienceEngine(NOW);
    expect(engine.command({ type: 'PRESS_POUR' }, NOW).accepted).toBe(false);
    engine.command({ type: 'POWER' }, NOW);
    expect(engine.command({ type: 'PRESS_POUR' }, NOW).accepted).toBe(false);
    expect(engine.getState().coffee.totalReleasedVolume).toBe(0);
  });

  it('starts pouring and emits only from the finite batch', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    advanceSimulation(engine, 1);
    const s = engine.getState();
    expect(s.coffee.totalReleasedVolume).toBeGreaterThan(0.1);
    expect(s.coffee.remainingVolume).toBeLessThan(1.3);
    expectConserved(s);
  });

  it('second press stops emission and finalises the batch', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    advanceSimulation(engine, 2);
    expect(engine.command({ type: 'PRESS_POUR' }, NOW).accepted).toBe(true);
    const stopped = engine.getState();
    expect(stopped.machine).toBe('COMPLETE');
    expect(stopped.coffee.discardedVolume).toBeGreaterThan(0);

    // In-flight coffee still lands, then the result is stable.
    advanceSimulation(engine, 0.5);
    expect(engine.getState().coffee.inFlightVolume).toBeCloseTo(0, 6);
    expectConserved(engine.getState());

    // Stopping is final: no resume for this batch.
    expect(engine.command({ type: 'PRESS_POUR' }, NOW).accepted).toBe(false);
    advanceSimulation(engine, 5);
    expect(engine.getState().coffee.cupVolume).toBeCloseTo(stopped.coffee.cupVolume, 6);
  });

  it('ends automatically when the batch is exhausted (~10.4 s of emission)', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    advanceSimulation(engine, 10.3);
    expect(engine.getState().machine).toBe('POURING');
    advanceSimulation(engine, 0.15);
    const s = engine.getState();
    expect(s.machine).toBe('COMPLETE');
    expect(s.coffee.remainingVolume).toBe(0);
    expectConserved(s);
  });
});

describe('geometric capture', () => {
  it('fully aligned cup fills to capacity then overflows only at capacity', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);

    advanceSimulation(engine, 7.9);
    expect(engine.getState().coffee.cupVolume).toBeLessThan(1.0);
    expect(engine.getState().coffee.overflowVolume).toBeCloseTo(0, 6);

    advanceSimulation(engine, 2.6);
    const s = engine.getState();
    expect(s.machine).toBe('COMPLETE');
    expect(s.coffee.cupVolume).toBeCloseTo(1.0, 3);
    expect(s.coffee.overflowVolume).toBeGreaterThan(0.2);
    expect(s.coffee.overflowVolume).toBeLessThan(0.31);
    expectConserved(s);
  });

  it('partially aligned cup splits the stream between fill and spill', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    // Inside the partial band: between R-S (0.025) and R+S (0.043).
    placeCup(engine, CUP.placement.x + 0.031, CUP.placement.z, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    advanceSimulation(engine, 5);
    const s = engine.getState();
    expect(s.coffee.cupVolume).toBeGreaterThan(0.05);
    expect(s.coffee.cupVolume).toBeLessThan(0.6);
    expect(s.coffee.missedVolume).toBeGreaterThan(0.05);
    expectConserved(s);
  });

  it('completely misaligned cup receives nothing and spills everything', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    placeCup(engine, CUP.placement.x + 0.08, CUP.placement.z, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    advanceSimulation(engine, 10.5);
    const s = engine.getState();
    expect(s.coffee.cupVolume).toBeCloseTo(0, 6);
    expect(s.coffee.missedVolume).toBeCloseTo(1.3, 2);
    expectConserved(s);
  });

  it('moving the cup during a pour changes future capture but keeps collected coffee', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    advanceSimulation(engine, 2);
    const collected = engine.getState().coffee.cupVolume;
    expect(collected).toBeGreaterThan(0.15);

    placeCup(engine, CUP.placement.x + 0.08, CUP.placement.z, NOW);
    advanceSimulation(engine, 1);
    const movedCup = engine.getState().coffee.cupVolume;
    const movedSpill = engine.getState().coffee.missedVolume;
    expect(movedCup).toBeGreaterThanOrEqual(collected - 1e-9);
    expect(movedCup).toBeLessThan(collected + 0.05);
    expect(movedSpill).toBeGreaterThan(0.05);
    expectConserved(engine.getState());

    // Bringing it back under the stream resumes capture of new coffee only.
    alignCup(engine, NOW);
    advanceSimulation(engine, 1);
    const backCup = engine.getState().coffee.cupVolume;
    const backSpill = engine.getState().coffee.missedVolume;
    expect(backCup).toBeGreaterThan(movedCup);
    expect(backSpill).toBeCloseTo(movedSpill, 6);
    expectConserved(engine.getState());
  });

  it('never exceeds cup capacity even with a long fully aligned pour', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    for (let i = 0; i < 70; i += 1) {
      advanceSimulation(engine, 0.15);
      expect(engine.getState().coffee.cupVolume).toBeLessThanOrEqual(COFFEE.cupCapacity + 1e-9);
      expectConserved(engine.getState());
    }
  });

  it('conserves volume across random frame deltas and cup moves', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    let seed = 7;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed / 2 ** 31;
    };
    for (let i = 0; i < 240; i += 1) {
      if (i % 17 === 0) {
        placeCup(engine, CUP.placement.x + (rand() - 0.5) * 0.16, CUP.placement.z, NOW);
      }
      advanceSimulation(engine, 0.01 + rand() * 0.05);
      expectConserved(engine.getState());
    }
  });
});
