import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CAMERA } from '../config/asset';
import type { ExperienceEvent } from '../domain/events';
import { dispatchCommand, engine } from '../state/experienceStore';
import { useServices } from './services';

const deg = (value: number) => (value * Math.PI) / 180;

type Shot = {
  azimuth: number;
  polar: number;
  distance: number;
  target: [number, number, number];
};

/**
 * Shot library (RITUAL-04 §8). Angles are absolute, measured from the front of
 * the machine, and every shot stays inside the orbit envelope so a tween can
 * never place the camera somewhere the visitor could not have gone.
 */
const HERO: Shot = {
  azimuth: CAMERA.hero.azimuth,
  polar: CAMERA.hero.polar,
  distance: CAMERA.hero.distance,
  target: [0, 0.2, 0.02],
};

const SHOTS: Partial<Record<ExperienceEvent['type'], Shot>> = {
  MACHINE_POWERED_ON: { azimuth: deg(27), polar: deg(73), distance: 1.14, target: [0, 0.22, 0.02] },
  // The hopper framing must still include the bean jar on the counter; a
  // tighter crop would hide the object the visitor is about to pick up.
  HOPPER_OPENING: { azimuth: deg(26), polar: deg(72), distance: 1.32, target: [0, 0.26, 0.02] },
  BEAN_TRANSFER_STARTED: { azimuth: deg(24), polar: deg(68), distance: 1.3, target: [0, 0.3, -0.02] },
  GRINDING_STARTED: { azimuth: deg(28), polar: deg(73), distance: 1.08, target: [0, 0.24, 0.03] },
  BREWING_STARTED: { azimuth: deg(30), polar: deg(74), distance: 1.14, target: [0, 0.22, 0.05] },
  COFFEE_READY: { azimuth: deg(26), polar: deg(76), distance: 1.2, target: [0, 0.18, 0.08] },
  POUR_STARTED: { azimuth: deg(22), polar: deg(78), distance: 1.02, target: [0, 0.14, 0.1] },
  CYCLE_COMPLETED: { azimuth: deg(30), polar: deg(77), distance: 1.16, target: [0, 0.15, 0.09] },
  RESET_STARTED: HERO,
  // Also fires after the visual restoration, so a reset begun mid-drag (when
  // the camera yields) still returns to the hero composition.
  RESET_COMPLETED: HERO,
};

const MAX_AZIMUTH_DELTA = deg(58);
/** A deferred shot older than this belongs to a stage the visitor has left. */
const MAX_PENDING_SHOT_MS = 2400;

interface PendingShot {
  shot: Shot;
  generation: number;
  requestedAt: number;
}

/** Events that mean the visitor has finished holding a physical object. */
const MANIPULATION_END: ReadonlySet<ExperienceEvent['type']> = new Set([
  'CUP_DRAG_ENDED',
  'BEANS_LOADED',
  'BEAN_DRAG_CANCELLED',
  'HOPPER_OPENED',
  'HOPPER_CLOSED',
]);

/**
 * Constrained orbit camera with restrained choreography.
 *
 * Three concerns are deliberately separate: manual orbit always wins, an
 * active object drag defers a shot instead of discarding it, and only one
 * latest-relevant shot can wait. A short button press therefore cannot erase
 * the response to its own domain event (RITUAL-04 §7.13–7.15).
 */
export function CameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const services = useServices();
  const tween = useRef<gsap.core.Tween | null>(null);
  const pending = useRef<PendingShot | null>(null);

  // Framings for visual review and browser tests.
  useEffect(() => {
    if (import.meta.env.MODE !== 'e2e') return;
    const host = window as unknown as { __ritual?: Record<string, unknown> };
    const api = (host.__ritual = host.__ritual ?? {});
    api.THREE = THREE;
    api.camera = camera;
    api.scene = scene;
    api.cameraMotion = () => ({ active: Boolean(tween.current?.isActive()), pending: pending.current });
    api.project = (x: number, y: number, z: number) => {
      camera.updateWorldMatrix(true, false);
      const point = new THREE.Vector3(x, y, z).project(camera);
      const rect = gl.domElement.getBoundingClientRect();
      return {
        x: rect.left + (point.x * 0.5 + 0.5) * rect.width,
        y: rect.top + (-point.y * 0.5 + 0.5) * rect.height,
      };
    };
    api.setCamera = (
      azimuthDeg: number,
      polarDeg: number,
      distance: number,
      target: [number, number, number],
    ) => {
      const controls = controlsRef.current;
      if (!controls) return;
      tween.current?.kill();
      const targetVector = new THREE.Vector3(...target);
      controls.target.copy(targetVector);
      camera.position
        .copy(targetVector)
        .add(
          new THREE.Vector3().setFromSpherical(
            new THREE.Spherical(distance, deg(polarDeg), deg(azimuthDeg)),
          ),
        );
      controls.update();
    };
    api.orbit = () => {
      const controls = controlsRef.current;
      if (!controls) return null;
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      return {
        azimuth: spherical.theta,
        polar: spherical.phi,
        distance: spherical.radius,
        target: { x: controls.target.x, y: controls.target.y, z: controls.target.z },
        limits: {
          minAzimuth: controls.minAzimuthAngle,
          maxAzimuth: controls.maxAzimuthAngle,
          minPolar: controls.minPolarAngle,
          maxPolar: controls.maxPolarAngle,
          minDistance: controls.minDistance,
          maxDistance: controls.maxDistance,
        },
      };
    };
    return () => {
      for (const key of ['THREE', 'camera', 'scene', 'project', 'setCamera', 'orbit', 'cameraMotion']) delete api[key];
    };
  }, [camera, gl, scene]);

  // Opening composition: a calm, stable three-quarter hero.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const target = new THREE.Vector3(...HERO.target);
    const spherical = new THREE.Spherical(HERO.distance, HERO.polar, HERO.azimuth);
    const offset = new THREE.Vector3().setFromSpherical(spherical);
    controls.target.copy(target);
    camera.position.copy(target).add(offset);
    camera.lookAt(target);
    controls.update();
  }, [camera]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const yieldControl = () => {
      tween.current?.kill();
      tween.current = null;
      dispatchCommand({ type: 'NOTE_ACTIVITY' });
    };
    controls.addEventListener('start', yieldControl);
    return () => controls.removeEventListener('start', yieldControl);
  }, []);

  useEffect(() => {
    const applyShot = (shot: Shot, force: boolean): boolean => {
      const controls = controlsRef.current;
      if (!controls) return false;

      // In reduced-motion mode, non-essential cinematic moves are suppressed.
      // Essential reset shots immediately restore the canonical hero composition
      // without disorienting transitions.
      if (services.reducedMotion) {
        if (!force) return false;
        tween.current?.kill();
        tween.current = null;
        const targetVector = new THREE.Vector3(...shot.target);
        controls.target.copy(targetVector);
        camera.position
          .copy(targetVector)
          .add(
            new THREE.Vector3().setFromSpherical(
              new THREE.Spherical(shot.distance, shot.polar, shot.azimuth),
            ),
          );
        controls.update();
        return true;
      }

      const current = new THREE.Spherical().setFromVector3(
        camera.position.clone().sub(controls.target),
      );
      let delta = shot.azimuth - current.theta;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;

      // A large unexpected rotation would take the camera away from the view
      // the visitor chose; skip it rather than fighting them.
      if (!force && Math.abs(delta) > MAX_AZIMUTH_DELTA) return false;

      tween.current?.kill();
      const proxy = {
        theta: current.theta,
        phi: current.phi,
        radius: current.radius,
        tx: controls.target.x,
        ty: controls.target.y,
        tz: controls.target.z,
      };

      tween.current = gsap.to(proxy, {
        theta: current.theta + delta,
        phi: shot.polar,
        radius: shot.distance,
        tx: shot.target[0],
        ty: shot.target[1],
        tz: shot.target[2],
        duration: 1.15,
        ease: 'power2.inOut',
        onUpdate: () => {
          const offset = new THREE.Vector3().setFromSpherical(
            new THREE.Spherical(proxy.radius, proxy.phi, proxy.theta),
          );
          controls.target.set(proxy.tx, proxy.ty, proxy.tz);
          camera.position.copy(controls.target).add(offset);
          controls.update();
        },
      });
      return true;
    };

    const holdingObject = (): boolean => {
      const state = engine.getState();
      return (
        state.cup.dragging ||
        state.beanSupply === 'DRAGGING' ||
        state.beanSupply === 'TRANSFERRING'
      );
    };

    const requestShot = (eventType: ExperienceEvent['type'], shot: Shot) => {
      // Reset is the one move that must always find its way home, even from
      // the far side of the orbit, even if a prop was held, and even under
      // prefers-reduced-motion.
      if (eventType === 'RESET_STARTED' || eventType === 'RESET_COMPLETED') {
        pending.current = null;
        applyShot(shot, true);
        return;
      }

      if (services.reducedMotion) return;

      if (holdingObject()) {
        pending.current = {
          shot,
          generation: engine.getState().session.generation,
          requestedAt: performance.now(),
        };
        return;
      }

      pending.current = null;
      applyShot(shot, false);
    };

    const flushPending = () => {
      const waiting = pending.current;
      if (!waiting) return;
      const state = engine.getState();
      if (waiting.generation !== state.session.generation) {
        pending.current = null;
        return;
      }
      if (holdingObject()) return;
      pending.current = null;
      if (performance.now() - waiting.requestedAt > MAX_PENDING_SHOT_MS) return;
      applyShot(waiting.shot, false);
    };

    const unsubscribe = engine.subscribe((event) => {
      // Taking hold of a prop always stops camera movement, even if a guided
      // shot was already running when the visitor reached for it.
      if (event.type === 'CUP_DRAG_STARTED' || event.type === 'BEAN_DRAG_STARTED') {
        tween.current?.kill();
        tween.current = null;
        pending.current = null;
        return;
      }

      const shot = SHOTS[event.type];
      if (shot) {
        requestShot(event.type, shot);
        return;
      }
      if (MANIPULATION_END.has(event.type)) flushPending();
    });

    return () => {
      unsubscribe();
      tween.current?.kill();
      tween.current = null;
      pending.current = null;
    };
  }, [camera, services]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={CAMERA.damping * 1.4}
      rotateSpeed={0.55}
      zoomSpeed={0.6}
      minAzimuthAngle={CAMERA.limits.minAzimuth}
      maxAzimuthAngle={CAMERA.limits.maxAzimuth}
      minPolarAngle={CAMERA.limits.minPolar}
      maxPolarAngle={CAMERA.limits.maxPolar}
      minDistance={CAMERA.limits.minDistance}
      maxDistance={CAMERA.limits.maxDistance}
      target={[0, 0.2, 0.02]}
    />
  );
}
