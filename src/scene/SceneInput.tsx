import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { audio } from '../audio/audioEngine';
import { BEAN_PROP, CUP } from '../config/asset';
import { engine, dispatchCommand } from '../state/experienceStore';
import {
  clampToStage,
  exceedsClickSlop,
  isBeanReleaseAccepted,
} from '../interactions/spatialValidation';
import type { ButtonKind, InteractiveKind, Services } from './services';
import { useServices } from './services';

type GestureKind = 'cup' | 'beanSupply' | ButtonKind | 'lid';

interface Gesture {
  kind: GestureKind;
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
  buttonAccepted: boolean;
}

const CUP_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(CUP.padTopY + CUP.dragLift));
const JAR_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BEAN_PROP.carryY);
const PRESS_COMMANDS: Record<ButtonKind, () => boolean> = {
  power: () => dispatchCommand({ type: 'POWER' }),
  make: () => dispatchCommand({ type: 'PRESS_MAKE' }),
  pour: () => dispatchCommand({ type: 'PRESS_POUR' }),
};

function contains(owner: THREE.Object3D, candidate: THREE.Object3D): boolean {
  let node: THREE.Object3D | null = candidate;
  while (node) {
    if (node === owner) return true;
    node = node.parent;
  }
  return false;
}

/**
 * Single owner for every pointer gesture on the scene (RITUAL-03 §11).
 *
 * The pointer-down listener runs in the capture phase: if the ray hits a
 * physical control the event never reaches OrbitControls, so one gesture can
 * never both drag the cup and orbit the camera. When nothing interactive is
 * hit, the event is left untouched and the camera behaves normally.
 */
export function SceneInput({ onGestureChange }: { onGestureChange?: (active: boolean) => void }) {
  const services = useServices();
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const planePoint = useMemo(() => new THREE.Vector3(), []);
  const gesture = useRef<Gesture | null>(null);
  const lastScrape = useRef(0);
  const gestureCallback = useRef(onGestureChange);
  gestureCallback.current = onGestureChange;

  useEffect(() => {
    const element = gl.domElement;

    const toNdc = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
    };

    const pick = (event: PointerEvent): InteractiveKind | null => {
      if (services.targets.size === 0) return null;
      toNdc(event);
      const objects = Array.from(services.targets.values());
      const hits = raycaster.intersectObjects(objects, true);
      if (hits.length === 0) return null;
      const hit = hits[0].object;
      for (const [kind, object] of services.targets) {
        if (contains(object, hit)) return kind;
      }
      return null;
    };

    const updateCup = (event: PointerEvent) => {
      toNdc(event);
      if (!raycaster.ray.intersectPlane(CUP_PLANE, planePoint)) return;
      dispatchCommand({ type: 'SET_CUP_POSITION', x: planePoint.x, z: planePoint.z });
    };

    const updateJar = (event: PointerEvent) => {
      toNdc(event);
      if (!raycaster.ray.intersectPlane(JAR_PLANE, planePoint)) return;
      const clamped = clampToStage({ x: planePoint.x, z: planePoint.z });
      services.jarTarget.x = clamped.x;
      services.jarTarget.z = clamped.z;
    };

    const endGesture = (cancelled = false) => {
      const active = gesture.current;
      if (!active) return;
      gesture.current = null;

      if (element.hasPointerCapture?.(active.pointerId)) {
        element.releasePointerCapture(active.pointerId);
      }

      switch (active.kind) {
        case 'cup': {
          dispatchCommand({ type: 'END_CUP_DRAG' });
          break;
        }
        case 'beanSupply': {
          // Judge the drop where the visitor aimed, not where the prop's eased
          // follow happens to be this frame; a quick, valid flick must count.
          const position = services.jarTarget;
          // A cancelled pointer never consumes beans. Releasing over the
          // hopper only commits when the machine can actually accept them
          // (it may still be closed); otherwise the prop returns to supply.
          const releasedOverHopper =
            !cancelled &&
            engine.getState().beanSupply === 'DRAGGING' &&
            isBeanReleaseAccepted({ x: position.x, z: position.z });
          const committed =
            releasedOverHopper && dispatchCommand({ type: 'COMMIT_BEAN_TRANSFER' });
          if (!committed) dispatchCommand({ type: 'CANCEL_BEAN_DRAG' });
          break;
        }
        case 'power':
        case 'make':
        case 'pour': {
          if (active.buttonAccepted) services.motion?.releaseButton(active.kind);
          break;
        }
        default:
          break;
      }

      gestureCallback.current?.(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (gesture.current) return;
      audio.unlock();

      if (engine.getState().machine === 'RESETTING') return;
      const kind = pick(event);
      if (!kind) return;

      // Claim ownership: OrbitControls must not also start a rotation.
      event.stopPropagation();
      event.preventDefault();
      element.setPointerCapture?.(event.pointerId);

      const base: Gesture = {
        kind,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
        buttonAccepted: false,
      };

      if (kind === 'lid') {
        dispatchCommand({ type: 'TOGGLE_HOPPER' });
        element.releasePointerCapture?.(event.pointerId);
        return;
      }

      if (kind === 'power' || kind === 'make' || kind === 'pour') {
        const accepted = PRESS_COMMANDS[kind]();
        base.buttonAccepted = accepted;
        if (accepted) services.motion?.pressButton(kind);
        else services.motion?.rejectButton(kind);
        gesture.current = base;
        gestureCallback.current?.(true);
        return;
      }

      if (kind === 'cup') {
        if (!dispatchCommand({ type: 'BEGIN_CUP_DRAG' })) {
          element.releasePointerCapture?.(event.pointerId);
          return;
        }
        gesture.current = base;
        gestureCallback.current?.(true);
        updateCup(event);
        return;
      }

      // Bean container.
      if (!dispatchCommand({ type: 'BEGIN_BEAN_DRAG' })) {
        element.releasePointerCapture?.(event.pointerId);
        return;
      }
      gesture.current = base;
      gestureCallback.current?.(true);
      updateJar(event);
    };

    const onPointerMove = (event: PointerEvent) => {
      const active = gesture.current;
      if (!active || active.pointerId !== event.pointerId) return;

      if (!active.moved && exceedsClickSlop(event.clientX - active.startX, event.clientY - active.startY)) {
        active.moved = true;
      }

      if (active.kind === 'cup') {
        updateCup(event);
        const now = performance.now();
        if (active.moved && now - lastScrape.current > 95) {
          lastScrape.current = now;
          audio.cupScrape(0.6);
        }
      } else if (active.kind === 'beanSupply') {
        updateJar(event);
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      const active = gesture.current;
      if (!active || active.pointerId !== event.pointerId) return;
      endGesture(false);
    };

    const onPointerCancel = (event: PointerEvent) => {
      const active = gesture.current;
      if (!active || active.pointerId !== event.pointerId) return;
      endGesture(true);
    };

    const onLostCapture = () => {
      endGesture(true);
    };

    const onBlur = () => {
      endGesture(true);
    };

    element.addEventListener('pointerdown', onPointerDown, { capture: true });
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerCancel);
    element.addEventListener('lostpointercapture', onLostCapture);
    window.addEventListener('blur', onBlur);

    const unsubscribe = engine.subscribe((event) => {
      if (event.type === 'RESET_STARTED') endGesture(true);
    });

    return () => {
      element.removeEventListener('pointerdown', onPointerDown, { capture: true });
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerCancel);
      element.removeEventListener('lostpointercapture', onLostCapture);
      window.removeEventListener('blur', onBlur);
      unsubscribe();
    };
  }, [camera, gl, pointer, raycaster, services, planePoint]);

  return null;
}

export type { Services };
