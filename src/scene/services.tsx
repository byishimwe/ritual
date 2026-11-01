import { createContext, useContext, useEffect, useMemo } from 'react';
import type * as THREE from 'three';

/**
 * Scene service registry.
 *
 * The 3D actors register the objects they own here; the director, the input
 * coordinator and the camera read them. This is the only shared mutable layer
 * in the presentation tier — machine *behaviour* still lives exclusively in the
 * domain engine, and nothing here may hold logical machine state.
 */

export type InteractiveKind = 'cup' | 'beanSupply' | 'lid' | 'power' | 'make' | 'pour';

export type ButtonKind = 'power' | 'make' | 'pour';

export interface Rig {
  machineRoot?: THREE.Group;
  lid?: THREE.Object3D;
  buttons?: Record<ButtonKind, THREE.Object3D>;
  /** Cloned button material whose emissive strength is the power indicator. */
  indicatorMaterial?: THREE.MeshStandardMaterial;
  cup?: THREE.Group;
  jar?: THREE.Group;
  pile?: THREE.Object3D;
  /** Fires the authored falling-bean burst; owned by the bean supply prop. */
  triggerBeanFall?: () => void;
}

export interface MotionApi {
  pressButton(kind: ButtonKind): void;
  releaseButton(kind: ButtonKind): void;
  /** Restrained, non-verbal acknowledgement that a control is unavailable. */
  rejectButton(kind: ButtonKind): void;
}

export interface JarTarget {
  x: number;
  z: number;
}

export interface Services {
  rig: Rig;
  targets: Map<InteractiveKind, THREE.Object3D>;
  /** Presentation-only pointer position for the carried bean container. */
  jarTarget: JarTarget;
  motion: MotionApi | null;
  reducedMotion: boolean;
}

const ServicesContext = createContext<Services | null>(null);

export function ServicesProvider({
  value,
  children,
}: {
  value: Services;
  children: React.ReactNode;
}) {
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices(): Services {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('Scene services are unavailable outside the experience canvas');
  return services;
}

export function createServices(reducedMotion: boolean): Services {
  return {
    rig: {},
    targets: new Map(),
    jarTarget: { x: 0, z: 0 },
    motion: null,
    reducedMotion,
  };
}

/** Binds a scene object to a rig slot for the lifetime of its component. */
export function useRigSlot<K extends keyof Rig>(key: K, object: Rig[K] | undefined): void {
  const { rig } = useServices();
  useEffect(() => {
    if (!object) return;
    rig[key] = object;
    return () => {
      if (rig[key] === object) delete rig[key];
    };
  }, [rig, key, object]);
}

/** Binds a mesh to an interaction slot for the lifetime of its component. */
export function useInteractiveTarget(kind: InteractiveKind, object: THREE.Object3D | undefined): void {
  const { targets } = useServices();
  useEffect(() => {
    if (!object) return;
    targets.set(kind, object);
    return () => {
      if (targets.get(kind) === object) targets.delete(kind);
    };
  }, [targets, kind, object]);
}

export function useServicesValue(reducedMotion: boolean): Services {
  return useMemo(() => createServices(reducedMotion), [reducedMotion]);
}
