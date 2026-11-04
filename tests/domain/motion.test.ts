import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as THREE from 'three';
import gsap from 'gsap';
import { LID } from '../../src/config/asset';
import { createDirector, type Director } from '../../src/motion/experienceDirector';
import { createServices } from '../../src/scene/services';
import { engine } from '../../src/state/experienceStore';

let director: Director | undefined;
beforeEach(() => {
  engine.command({ type: 'RESET', reason: 'operator' });
  engine.command({ type: 'FINISH_RESET' });
});
afterEach(() => director?.dispose());

describe('physical motion ownership', () => {
  it('rapid hinge reversals retain only the current tween and settle the actual hinge', () => {
    const services = createServices(false);
    const lid = new THREE.Object3D();
    services.rig.lid = lid;
    director = createDirector(services);
    const events: string[] = [];
    const unsubscribe = engine.subscribe(event => events.push(event.type));
    for (let i = 0; i < 25; i++) {
      engine.command({ type: 'TOGGLE_HOPPER' });
      const live = gsap.globalTimeline.getTweensOf(lid.rotation);
      expect(live).toHaveLength(1);
      expect(director.diagnostics?.().pendingTweens).toBe(1);
    }
    gsap.globalTimeline.totalTime(gsap.globalTimeline.totalTime() + 0.8, false);
    expect(lid.rotation.x).toBeCloseTo(LID.openAngle, 5);
    expect(engine.getState().hopperMotion).toBe('IDLE');
    expect(events.filter(event => event === 'HOPPER_OPENED')).toHaveLength(1);
    expect(events).not.toContain('HOPPER_CLOSED');
    expect(director.diagnostics?.().pendingTweens).toBe(0);
    director.dispose();
    expect(gsap.globalTimeline.getTweensOf(lid.rotation)).toHaveLength(0);
    unsubscribe();
  });

  it('a reset interrupts hinge motion and its old completion cannot change the new session', () => {
    const services = createServices(false);
    const lid = new THREE.Object3D();
    services.rig.lid = lid;
    director = createDirector(services);
    engine.command({ type: 'TOGGLE_HOPPER' });
    const stale = gsap.globalTimeline.getTweensOf(lid.rotation)[0];
    engine.command({ type: 'RESET', reason: 'operator' });
    const generation = engine.getState().session.generation;
    stale.progress(1);
    expect(engine.getState().machine).toBe('RESETTING');
    expect(engine.getState().hopper).toBe('CLOSED');
    gsap.globalTimeline.totalTime(gsap.globalTimeline.totalTime() + 1.4, false);
    expect(engine.getState().machine).toBe('OFF');
    expect(engine.getState().session.generation).toBe(generation);
    expect(lid.rotation.x).toBeCloseTo(0, 5);
  });
});
