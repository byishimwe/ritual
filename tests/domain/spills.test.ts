import { describe, expect, it } from 'vitest';
import { ANCHORS, CUP } from '../../src/config/asset';
import { ExperienceEngine } from '../../src/domain/experienceEngine';
import { advanceSimulation } from '../../src/domain/simulationClock';
import type { ExperienceState } from '../../src/domain/types';
import { alignCup, brewBatch, placeCup } from './helpers';

const NOW = 60_000;

function spillVolume(state: Readonly<ExperienceState>): number {
  return state.coffee.spills.reduce((total, deposit) => total + deposit.volume, 0);
}

function startOverflowing(engine: ExperienceEngine): void {
  brewBatch(engine, NOW);
  alignCup(engine, NOW);
  engine.command({ type: 'PRESS_POUR' }, NOW);
  // Past the normal 8 s fill; the cup is full and overflow is landing.
  advanceSimulation(engine, 8.8);
}

describe('persistent spill deposits', () => {
  it('records a missed stream beneath the fixed outlet and never moves it with the cup', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    placeCup(engine, CUP.placement.x + 0.08, CUP.placement.z, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    advanceSimulation(engine, 3);

    const first = engine.getState().coffee.spills.find((deposit) => deposit.source === 'MISS');
    expect(first).toBeDefined();
    const recorded = { ...first! };
    expect(recorded.x).toBeCloseTo(ANCHORS.coffeeExit.x, 9);
    expect(recorded.z).toBeCloseTo(ANCHORS.coffeeExit.z, 9);

    placeCup(engine, CUP.placement.x - 0.04, CUP.placement.z, NOW);
    advanceSimulation(engine, 1);

    const after = engine.getState().coffee.spills.find((deposit) => deposit.id === recorded.id);
    expect(after).toBeDefined();
    expect(after!.x).toBeCloseTo(recorded.x, 9);
    expect(after!.y).toBeCloseTo(recorded.y, 9);
    expect(after!.z).toBeCloseTo(recorded.z, 9);
    expect(after!.volume).toBeGreaterThan(recorded.volume);
  });

  it('leaves an overflow puddle behind when the full cup is moved', () => {
    const engine = new ExperienceEngine(NOW);
    startOverflowing(engine);

    const deposits = engine.getState().coffee.spills.filter((deposit) => deposit.source === 'OVERFLOW');
    expect(deposits.length).toBeGreaterThan(0);
    const original = { ...deposits[0] };
    expect(original.volume).toBeGreaterThan(0);
    expect(original.x).toBeCloseTo(CUP.placement.x, 6);

    placeCup(engine, CUP.placement.x + 0.06, CUP.placement.z, NOW);
    advanceSimulation(engine, 0.6);

    const retained = engine.getState().coffee.spills.find((deposit) => deposit.id === original.id);
    expect(retained).toBeDefined();
    expect(retained!.x).toBeCloseTo(original.x, 9);
    expect(retained!.y).toBeCloseTo(original.y, 9);
    expect(retained!.z).toBeCloseTo(original.z, 9);
    expect(retained!.volume).toBeGreaterThanOrEqual(original.volume);
  });

  it('adds new overflow at the cup’s new position, not over the old puddle', () => {
    const engine = new ExperienceEngine(NOW);
    startOverflowing(engine);
    const originalX = engine.getState().coffee.spills.find((deposit) => deposit.source === 'OVERFLOW')!.x;

    placeCup(engine, CUP.placement.x + 0.02, CUP.placement.z, NOW);
    advanceSimulation(engine, 0.5);

    const overflow = engine.getState().coffee.spills.filter((deposit) => deposit.source === 'OVERFLOW');
    expect(overflow.some((deposit) => Math.abs(deposit.x - CUP.placement.x - 0.02) < 0.012)).toBe(true);
    expect(Math.abs(originalX - CUP.placement.x)).toBeLessThan(0.001);
  });

  it('keeps the deposit list bounded while conserving all spilled volume', () => {
    const engine = new ExperienceEngine(NOW);
    brewBatch(engine, NOW);
    alignCup(engine, NOW);
    engine.command({ type: 'PRESS_POUR' }, NOW);
    advanceSimulation(engine, 8.2);

    for (let i = 0; i < 30; i += 1) {
      const offset = Math.sin(i * 0.7) * 0.07;
      placeCup(engine, CUP.placement.x + offset, CUP.placement.z, NOW);
      advanceSimulation(engine, 0.08);
      expect(engine.getState().coffee.spills.length).toBeLessThanOrEqual(10);
    }

    const state = engine.getState();
    expect(spillVolume(state)).toBeCloseTo(
      state.coffee.missedVolume + state.coffee.overflowVolume,
      8,
    );
  });

  it('clears every deposit on reset', () => {
    const engine = new ExperienceEngine(NOW);
    startOverflowing(engine);
    expect(engine.getState().coffee.spills.length).toBeGreaterThan(0);

    engine.command({ type: 'RESET', reason: 'operator' }, NOW);
    expect(engine.getState().coffee.spills).toHaveLength(0);

    advanceSimulation(engine, 1);
    expect(engine.getState().coffee.spills).toHaveLength(0);
  });
});
