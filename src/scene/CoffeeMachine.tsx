import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import type { RitualModel } from '../assets/ritualModel';
import { ASSET, BUTTON_RAW, INDICATOR, MODEL_SCALE } from '../config/asset';
import { engine } from '../state/experienceStore';
import { attachHitProxy, sphereProxy } from './proxies';
import { useInteractiveTarget, useRigSlot, useServices } from './services';

const BASE_POSITION = new THREE.Vector3(
  ASSET.offset.x * MODEL_SCALE,
  ASSET.offset.y * MODEL_SCALE,
  ASSET.offset.z * MODEL_SCALE,
);

/**
 * The machine actor.
 *
 * Owns the authored GLB wrapper, the power indicator and the mechanical
 * vibration. It never decides *whether* the machine runs — it reads the
 * authoritative state and expresses it physically.
 */
export function CoffeeMachine({ model }: { model: RitualModel }) {
  const services = useServices();

  const indicatorMaterial = useMemo(() => {
    let mesh: THREE.Mesh | null = null;
    model.buttons.power.traverse((child) => {
      if (!mesh && (child as THREE.Mesh).isMesh) mesh = child as THREE.Mesh;
    });
    if (!mesh) return undefined;
    const target = mesh as THREE.Mesh;
    const cached = target.userData.ritualIndicatorMaterial as THREE.MeshStandardMaterial | undefined;
    if (cached) return cached;
    if (Array.isArray(target.material)) return undefined;

    const source = target.material as THREE.MeshStandardMaterial;
    const clone = source.clone();
    clone.name = 'mPowerIndicator';
    clone.emissive = new THREE.Color(INDICATOR.color);
    // The button's icon texture doubles as the emissive mask, so exactly the
    // symbol lights up — a physical appliance indicator, not a glow effect.
    clone.emissiveMap = source.map ?? null;
    clone.emissiveIntensity = INDICATOR.off;
    target.material = clone;
    target.userData.ritualIndicatorMaterial = clone;
    return clone;
  }, [model]);

  const hitTargets = useMemo(() => {
    const build = (kind: 'power' | 'make' | 'pour') => {
      const raw = BUTTON_RAW[kind];
      const button = model.buttons[kind];
      return attachHitProxy(
        button,
        kind,
        () => sphereProxy(BUTTON_RAW.hitRadius, 10),
        new THREE.Vector3(raw.x, raw.y, raw.z),
      );
    };
    return { power: build('power'), make: build('make'), pour: build('pour') };
  }, [model]);

  useRigSlot('machineRoot', model.machineRoot);
  useRigSlot('lid', model.lid);
  useRigSlot('buttons', model.buttons);
  useRigSlot('indicatorMaterial', indicatorMaterial);

  useInteractiveTarget('lid', model.lid);
  useInteractiveTarget('power', hitTargets.power);
  useInteractiveTarget('make', hitTargets.make);
  useInteractiveTarget('pour', hitTargets.pour);

  useFrame((state) => {
    const machine = engine.getState().machine;
    const time = state.clock.elapsedTime;
    const grinding = machine === 'GRINDING';
    const brewing = machine === 'BREWING';
    const amplitude = grinding ? 0.00016 : brewing ? 0.0001 : 0;
    const damping = services.reducedMotion ? 0.5 : 1;

    if (amplitude === 0) {
      model.machineRoot.position.copy(BASE_POSITION);
      model.machineRoot.rotation.z = 0;
      return;
    }

    // Mechanical vibration belongs to the machine, never to the viewer.
    const x = Math.sin(time * 47.3) * amplitude * damping;
    const y = Math.sin(time * 61.7 + 1.3) * amplitude * 0.6 * damping;
    model.machineRoot.position.set(BASE_POSITION.x + x, BASE_POSITION.y + y, BASE_POSITION.z);
    model.machineRoot.rotation.z = Math.sin(time * 33.1) * 0.0004 * damping;
  });

  return <primitive object={model.machineRoot} />;
}
