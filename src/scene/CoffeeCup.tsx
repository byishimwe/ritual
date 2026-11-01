import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { RitualModel } from '../assets/ritualModel';
import { CUP } from '../config/asset';
import {
  CUP_INTERIOR_HEIGHT,
  interiorRadiusAtHeightFraction,
  volumeFractionToHeightFraction,
} from '../domain/cupGeometry';
import { cupSupportY } from '../domain/guards';
import { engine } from '../state/experienceStore';
import { applySurfaceRipples, createLiquidBody, createSoftShadowMaterial } from './liquidGeometry';
import { attachHitProxy, cylinderProxy } from './proxies';
import { useInteractiveTarget, useRigSlot } from './services';

const COFFEE_COLOR = '#24120b';
const shadowGeometry = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

/**
 * The ceramic cup and the coffee inside it.
 *
 * Placement is authoritative in the engine; this actor only eases toward the
 * committed position so dragging tracks the pointer closely and a released cup
 * settles. The liquid's height comes from the real volume and the vessel's
 * measured taper, never from elapsed time.
 */
export function CoffeeCup({ model }: { model: RitualModel }) {
  const root = model.cupRoot;
  const cupGroupRef = useRef<THREE.Group>(null);
  const liquidRef = useRef<THREE.Group>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const visualVolume = useRef(0);
  const visualSupport = useRef(CUP.trayFloorY);
  const lastHeight = useRef(-1);

  const liquidBody = useMemo(() => createLiquidBody(56), []);
  const surfaceGeometry = useMemo(() => new THREE.CircleGeometry(1, 56).rotateX(-Math.PI / 2), []);
  const rippleUniforms = useMemo(() => ({ uTime: { value: 0 }, uAmplitude: { value: 0.012 } }), []);

  const liquidMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(COFFEE_COLOR),
        roughness: 0.12,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.1,
      }),
    [],
  );

  const surfaceMaterial = useMemo(() => {
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(COFFEE_COLOR),
      roughness: 0.07,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.5,
    });
    applySurfaceRipples(material, rippleUniforms);
    return material;
  }, [rippleUniforms]);

  const shadowMaterial = useMemo(() => createSoftShadowMaterial(0.5), []);

  const hitProxy = useMemo(
    () =>
      attachHitProxy(
        root,
        'cup',
        () => cylinderProxy(0.052, 0.072, 12),
        new THREE.Vector3(0, 0.036, 0),
      ),
    [root],
  );

  useRigSlot('cup', root);
  useInteractiveTarget('cup', hitProxy);

  useEffect(() => {
    const body = liquidBody;
    return () => {
      body.dispose();
      shadowMaterial.userData.dispose?.();
    };
  }, [liquidBody, shadowMaterial]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const snapshot = engine.getState();
    const group = cupGroupRef.current;

    // --- Placement ---------------------------------------------------------
    if (group) {
      const tracking = snapshot.cup.dragging ? 24 : 11;
      const follow = 1 - Math.exp(-dt * tracking);
      group.position.x += (snapshot.cup.position.x - group.position.x) * follow;
      group.position.z += (snapshot.cup.position.z - group.position.z) * follow;

      // The well has a raised grille inside a lower tray. While dragging, the
      // vessel is carried a few millimetres above both surfaces, then settles
      // onto whichever one is actually beneath its base.
      const support = cupSupportY(group.position.x, group.position.z);
      const settle = 1 - Math.exp(-dt * (snapshot.cup.dragging ? 18 : 9));
      visualSupport.current += (support - visualSupport.current) * settle;
      const lift = snapshot.cup.dragging ? CUP.dragLift : 0;
      group.position.y = visualSupport.current + lift;
    }

    // --- Coffee ------------------------------------------------------------
    const target = snapshot.coffee.cupVolume;
    const rate = target > visualVolume.current ? 15 : 3.2;
    visualVolume.current += (target - visualVolume.current) * (1 - Math.exp(-dt * rate));
    if (target === 0 && visualVolume.current < 0.0004) visualVolume.current = 0;

    const volume = visualVolume.current;
    const liquid = liquidRef.current;
    if (liquid) {
      liquid.visible = volume > 0.0008;
      if (liquid.visible) {
        const heightFraction = volumeFractionToHeightFraction(volume);
        const height = Math.max(heightFraction * CUP_INTERIOR_HEIGHT, 0.0006);
        if (Math.abs(height - lastHeight.current) > 0.00015) {
          const topRadius = Math.max(
            interiorRadiusAtHeightFraction(heightFraction),
            CUP.interiorRadiusBottom + 0.0002,
          );
          liquidBody.update(CUP.interiorRadiusBottom, topRadius, height);
          lastHeight.current = height;
          if (surfaceRef.current) {
            surfaceRef.current.position.y = height;
            surfaceRef.current.scale.setScalar(Math.max(topRadius * 0.985, 0.001));
          }
        }
        rippleUniforms.uTime.value = state.clock.elapsedTime;
        rippleUniforms.uAmplitude.value = snapshot.machine === 'POURING' ? 0.016 : 0.007;
      }
    }

    // --- Contact shadow ----------------------------------------------------
    if (shadowRef.current && group) {
      shadowRef.current.position.set(group.position.x, visualSupport.current + 0.0007, group.position.z);
      shadowRef.current.scale.setScalar(0.083 + (snapshot.cup.dragging ? 0.012 : 0));
    }
  });

  return (
    <group name="CupActor">
      <group ref={cupGroupRef} name="CupPlacement">
        <primitive object={root} />
        <group ref={liquidRef} name="CupLiquid" position={[0, CUP.localFloorY, 0]} visible={false}>
          <mesh geometry={liquidBody.geometry} material={liquidMaterial} />
          <mesh ref={surfaceRef} geometry={surfaceGeometry} material={surfaceMaterial} />
        </group>
      </group>
      <mesh ref={shadowRef} geometry={shadowGeometry} material={shadowMaterial} renderOrder={1} />
    </group>
  );
}
