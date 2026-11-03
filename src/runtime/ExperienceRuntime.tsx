import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { audio } from '../audio/audioEngine';
import { advanceSimulation, SimulationClock } from '../domain/simulationClock';
import { createDirector } from '../motion/experienceDirector';
import { advanceFrame } from './frameLoop';
import { engine, publishEngineState } from '../state/experienceStore';
import { shouldResetAfterHidden, VisibilityTracker } from './visibilityPolicy';
import { useServices } from '../scene/services';

/**
 * The one place where time enters the experience.
 *
 * Frame deltas are clamped and subdivided by the simulation clock; visibility,
 * context loss and the operator reset are handled here; nothing else in the
 * application is allowed to advance or interrupt the machine.
 */
export function ExperienceRuntime() {
  const services = useServices();
  const gl = useThree((state) => state.gl);

  const isAutomated = typeof navigator !== 'undefined' && Boolean(navigator.webdriver);
  const timeScale = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const param = new URLSearchParams(window.location.search).get('timeScale');
    if (param) {
      const val = parseFloat(param);
      if (Number.isFinite(val) && val > 0 && val <= 5) return val;
    }
    return 1;
  }, []);

  const clock = useMemo(
    () =>
      new SimulationClock(
        isAutomated || timeScale > 1
          ? { maxFrameDelta: 1.0, maxSubsteps: 120 }
          : undefined,
      ),
    [isAutomated, timeScale],
  );
  const tracker = useMemo(() => new VisibilityTracker(), []);
  const contextLost = useRef(false);

  useEffect(() => {
    const director = createDirector(services);
    services.motion = director;
    return () => director.dispose();
  }, [services]);

  // Development and test inspection handle: used by the browser test harness
  // to read authoritative state and advance simulation. Never attached in an
  // exhibition visitor session.
  useEffect(() => {
    if (!import.meta.env.DEV && !window.location.search.includes('test')) return;
    const host = window as unknown as { __ritual?: Record<string, unknown> };
    host.__ritual = {
      ...(host.__ritual ?? {}),
      engine,
      advance: (seconds: number) => {
        advanceSimulation(engine, seconds);
        publishEngineState();
      },
    };
  }, []);

  // --- Tab visibility --------------------------------------------------------
  useEffect(() => {
    const handleVisibility = () => {
      const now = Date.now();
      if (document.hidden) {
        clock.reset();
        tracker.onHidden(now);
        audio.suspend();
        return;
      }

      const hiddenMs = tracker.onVisible(now);
      clock.reset();
      if (shouldResetAfterHidden(hiddenMs)) {
        // Long interruption: the session is discarded, so the context must not
        // try to re-arm the previous session's loops before the reset clears them.
        audio.stopAll();
        engine.command({ type: 'RESET', reason: 'hidden' }, now);
      } else {
        audio.resume(engine.getState().machine);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [clock, tracker]);

  // --- Operator reset --------------------------------------------------------
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== 'r' && event.key !== 'R') return;
      event.preventDefault();
      engine.command({ type: 'RESET', reason: 'operator' });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // --- WebGL context loss ----------------------------------------------------
  useEffect(() => {
    const canvas = gl.domElement;
    const handleLost = (event: Event) => {
      event.preventDefault();
      contextLost.current = true;
      clock.reset();
      audio.stopAll();
    };
    const handleRestored = () => {
      contextLost.current = false;
      clock.reset();
      engine.command({ type: 'RESET', reason: 'context_recovery' });
    };

    canvas.addEventListener('webglcontextlost', handleLost);
    canvas.addEventListener('webglcontextrestored', handleRestored);
    return () => {
      canvas.removeEventListener('webglcontextlost', handleLost);
      canvas.removeEventListener('webglcontextrestored', handleRestored);
    };
  }, [gl, clock]);

  useFrame((_state, delta) => {
    advanceFrame(engine, clock, {
      deltaSeconds: delta * timeScale,
      nowMs: Date.now(),
      suspended: document.hidden || contextLost.current,
    });
    publishEngineState();
  });

  return null;
}
