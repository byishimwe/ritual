import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { createNoise2D } from '../../utils/noise';
import { useCoffeeStore } from '../../systems/state/useCoffeeStore';
import { soundManager } from '../../systems/audio/soundManager';
import {
  MATERIAL_PARAMS,
  HOPPER_LID_ROTATION_OPEN,
  BUTTON_PRESS_DEPTH,
  TIMING,
  CUP_DRAG_RANGE_M,
  CUP_ALIGNMENT_TOLERANCE_M,
} from '../../config/experienceConfig';
import { LiquidStream } from './LiquidStream';
import { SteamEffect } from '../effects/SteamEffect';
import { DripPuddle } from '../effects/DripPuddle';

const GLB_PATH = '/assets/models/coffee_machine.glb';
// Real-world target height of the machine chassis (spec: 40cm), used to
// auto-normalize whatever arbitrary unit scale the source file was exported in.
const TARGET_HEIGHT_M = 0.4;

function applyMaterial(mesh: THREE.Mesh, params: Record<string, unknown>) {
  const mat = new THREE.MeshPhysicalMaterial(params as THREE.MeshPhysicalMaterialParameters);
  mesh.material = mat;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mat;
}

export function CoffeeMachine() {
  const { scene } = useGLTF(GLB_PATH);
  const { camera, gl } = useThree();
  const rootRef = useRef<THREE.Group>(null);
  const fitRef = useRef<THREE.Group>(null);
  const noise = useMemo(() => createNoise2D(), []);
  const dragRaycaster = useMemo(() => new THREE.Raycaster(), []);
  const dragPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  // Auto-fit: normalize the model's arbitrary export scale to real-world
  // meters (40cm tall), center it on X/Z, and sit its base on the stage.
  useLayoutEffect(() => {
    const fit = fitRef.current;
    if (!fit) return;
    // Reset before measuring so a re-run (e.g. React StrictMode's double effect
    // invocation in dev) measures the model's raw geometry, not its own prior fit.
    fit.scale.setScalar(1);
    fit.position.set(0, 0, 0);
    scene.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const rawScale = size.y > 0 ? TARGET_HEIGHT_M / size.y : 1;
    const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : 1;
    fit.scale.setScalar(scale);
    fit.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    if (import.meta.env.DEV) {
      console.debug(
        '[CoffeeMachine] size',
        size.toArray(),
        'center',
        center.toArray(),
        'min',
        box.min.toArray(),
        'scale',
        scale,
        'fitPos',
        fit.position.toArray(),
      );
    }
  }, [scene]);

  const experienceState = useCoffeeStore((s) => s.experienceState);
  const hopperState = useCoffeeStore((s) => s.hopperState);
  const powerOn = useCoffeeStore((s) => s.powerOn);
  const powerOff = useCoffeeStore((s) => s.powerOff);
  const openHopper = useCoffeeStore((s) => s.openHopper);
  const closeHopper = useCoffeeStore((s) => s.closeHopper);
  const addBeans = useCoffeeStore((s) => s.addBeans);
  const alignCup = useCoffeeStore((s) => s.alignCup);
  const pressMake = useCoffeeStore((s) => s.pressMake);
  const pressPour = useCoffeeStore((s) => s.pressPour);
  const canMake = useCoffeeStore((s) => s.canMake);
  const canPour = useCoffeeStore((s) => s.canPour);
  const registerInteraction = useCoffeeStore((s) => s.registerInteraction);

  const nodes = useMemo(() => {
    const found: Record<string, THREE.Object3D> = {};
    scene.traverse((child) => {
      if (
        [
          'body',
          'btnPower',
          'btnMake',
          'btnPour',
          'Hopper',
          'HopperLid',
          'coffeeSpout',
          'coffeeCup',
          'coffeeBeans',
        ].includes(child.name)
      ) {
        found[child.name] = child;
      }
    });
    return found;
  }, [scene]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).__coffeeNodes = nodes;
      (window as any).__coffeeStore = useCoffeeStore;
      (window as any).__THREE_NS = THREE;
    }
  }, [nodes]);

  // Apply materials on mount
  useEffect(() => {
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const matName = (child.material as THREE.Material)?.name ?? '';
      if (matName === 'mCharcoalBody') applyMaterial(child, MATERIAL_PARAMS.charcoalBody);
      else if (matName === 'mSatinMetal' || matName === 'mButtonCap')
        applyMaterial(child, MATERIAL_PARAMS.satinMetal);
      else if (matName === 'mDarkMetalTrim' || matName === 'mCharcoalMetal')
        applyMaterial(child, MATERIAL_PARAMS.darkMetalTrim);
      else if (matName === 'mGlassHopper') applyMaterial(child, MATERIAL_PARAMS.glassHopper);
      else if (matName === 'mCeramic') applyMaterial(child, MATERIAL_PARAMS.ceramic);
      else if (matName === 'mCoffeeBeans') applyMaterial(child, MATERIAL_PARAMS.beans);
      else {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // Hopper lid rotation animation
  useEffect(() => {
    const lid = nodes.HopperLid;
    if (!lid) return;
    gsap.to(lid.rotation, {
      x: hopperState === 'OPEN' ? HOPPER_LID_ROTATION_OPEN : 0,
      duration: TIMING.hopperLidRotation,
      ease: 'back.out(1.2)',
    });
  }, [hopperState, nodes.HopperLid]);

  // Beans drop / grind visual
  useEffect(() => {
    const beans = nodes.coffeeBeans;
    if (!beans) return;
    if (experienceState === 'GRINDING') {
      gsap.to(beans.scale, { x: 0.8, y: 0.8, z: 0.8, duration: TIMING.grinding / 1000, ease: 'power1.inOut' });
    } else if (experienceState === 'OFF') {
      gsap.to(beans.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
    }
  }, [experienceState, nodes.coffeeBeans]);

  // Returning to OFF (power-off or a full reset) must leave nothing visually
  // stuck from the previous run — snap the cup back under the spout even if
  // it was dragged away and never realigned.
  useEffect(() => {
    if (experienceState !== 'OFF') return;
    const cup = nodes.coffeeCup;
    if (!cup) return;
    gsap.to(cup.position, { x: 0, duration: 0.4, ease: 'power2.out' });
    alignCup(true);
  }, [experienceState, nodes.coffeeCup, alignCup]);

  // Audio + camera side-effects driven by state transitions
  const prevState = useRef(experienceState);
  useEffect(() => {
    if (prevState.current === experienceState) return;
    prevState.current = experienceState;
    if (experienceState === 'GRINDING') soundManager.grindLoop();
    if (experienceState === 'PAUSE') soundManager.stopLoop('grind');
    if (experienceState === 'BREWING') {
      soundManager.pumpLoop();
      soundManager.steamHiss(1.2);
    }
    if (experienceState === 'READY_TO_POUR') soundManager.stopLoop('pump');
    if (experienceState === 'POURING_ACTIVE') {
      soundManager.pourLoop();
      soundManager.steamHiss(2);
    }
    if (experienceState === 'COMPLETE' || experienceState === 'OFF') {
      soundManager.stopAll();
    }
  }, [experienceState]);

  // Machine vibration during grinding/brewing
  useFrame((state) => {
    const root = rootRef.current;
    if (!root) return;
    const t = state.clock.elapsedTime;
    if (experienceState === 'GRINDING' || experienceState === 'BREWING') {
      const n = noise(t * 45, 0);
      root.position.y = n * 0.0015;
    } else if (root.position.y !== 0) {
      root.position.y = THREE.MathUtils.lerp(root.position.y, 0, 0.2);
    }
  });

  function pressButton(mesh: THREE.Object3D | undefined) {
    if (!mesh) return;
    soundManager.click();
    gsap.to(mesh.position, {
      y: mesh.userData.baseY + BUTTON_PRESS_DEPTH,
      duration: TIMING.buttonPress,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });
  }

  useEffect(() => {
    [nodes.btnPower, nodes.btnMake, nodes.btnPour].forEach((btn) => {
      if (btn && btn.userData.baseY === undefined) btn.userData.baseY = btn.position.y;
    });
  }, [nodes.btnPower, nodes.btnMake, nodes.btnPour]);

  const handlePower = (e: any) => {
    e.stopPropagation();
    registerInteraction();
    pressButton(nodes.btnPower);
    if (experienceState === 'OFF') powerOn();
    else powerOff();
  };

  const handleMake = (e: any) => {
    e.stopPropagation();
    registerInteraction();
    if (!canMake()) return;
    pressButton(nodes.btnMake);
    pressMake();
  };

  const handlePour = (e: any) => {
    e.stopPropagation();
    registerInteraction();
    if (!canPour() && experienceState !== 'POURING_ACTIVE') return;
    pressButton(nodes.btnPour);
    pressPour();
  };

  const lidLocked = experienceState === 'GRINDING' || experienceState === 'PAUSE' || experienceState === 'BREWING';

  const handleLidClick = (e: any) => {
    e.stopPropagation();
    if (lidLocked) return;
    registerInteraction();
    if (hopperState === 'CLOSED') openHopper();
    else closeHopper();
  };

  const handleBeansClick = (e: any) => {
    e.stopPropagation();
    if (hopperState !== 'OPEN') return;
    registerInteraction();
    soundManager.beanDrop();
    addBeans();
  };

  // Cup drag along X axis
  const dragState = useRef<{ dragging: boolean; startX: number; startPosX: number }>({
    dragging: false,
    startX: 0,
    startPosX: 0,
  });

  // Raycasting against the cup's own (small) geometry freezes once the
  // pointer drifts outside its screen-space footprint — a known limitation
  // of captured-pointer intersection in R3F. Instead, raycast every move
  // against a fixed invisible ground plane through the cup's current world
  // height, so tracking stays accurate across the whole drag regardless of
  // how far the cursor has moved from the object.
  function pointerToPlaneX(e: any): number | null {
    const rect = gl.domElement.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    dragRaycaster.setFromCamera({ x: ndcX, y: ndcY } as THREE.Vector2, camera);
    const hit = new THREE.Vector3();
    const didHit = dragRaycaster.ray.intersectPlane(dragPlane, hit);
    return didHit ? hit.x : null;
  }

  const handleCupPointerDown = (e: any) => {
    e.stopPropagation();
    const cup = nodes.coffeeCup;
    const fitGroup = fitRef.current;
    if (!cup || !fitGroup) return;
    const cupWorld = cup.getWorldPosition(new THREE.Vector3());
    dragPlane.constant = -cupWorld.y;
    const startX = pointerToPlaneX(e);
    if (startX === null) return;
    dragState.current.dragging = true;
    dragState.current.startX = startX;
    dragState.current.startPosX = cup.position.x;
    (e.target as Element)?.setPointerCapture?.(e.pointerId);
  };

  const handleCupPointerMove = (e: any) => {
    if (!dragState.current.dragging) return;
    const cup = nodes.coffeeCup;
    const fitScale = fitRef.current?.scale.x || 1;
    if (!cup) return;
    const worldX = pointerToPlaneX(e);
    if (worldX === null) return;
    const worldDelta = worldX - dragState.current.startX;
    const localDelta = worldDelta / fitScale;
    const rawRange = CUP_DRAG_RANGE_M / fitScale;
    cup.position.x = THREE.MathUtils.clamp(dragState.current.startPosX + localDelta, -rawRange, rawRange);
    registerInteraction();
  };

  const handleCupPointerUp = () => {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const cup = nodes.coffeeCup;
    const fitScale = fitRef.current?.scale.x || 1;
    if (!cup) return;
    const aligned = Math.abs(cup.position.x * fitScale) < CUP_ALIGNMENT_TOLERANCE_M;
    if (aligned) {
      gsap.to(cup.position, { x: 0, duration: 0.25, ease: 'power2.out' });
      soundManager.cupSlide();
    }
    alignCup(aligned);
  };

  return (
    <group ref={rootRef} name="machineCoffeeRoot">
      <group ref={fitRef}>
        <primitive object={scene} />

        {nodes.btnPower && (
          <primitive object={nodes.btnPower} onClick={handlePower} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')} />
        )}
        {nodes.btnMake && <primitive object={nodes.btnMake} onClick={handleMake} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')} />}
        {nodes.btnPour && <primitive object={nodes.btnPour} onClick={handlePour} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')} />}
        {nodes.HopperLid && (
          <primitive object={nodes.HopperLid} onClick={handleLidClick} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = 'auto')} />
        )}
        {nodes.coffeeBeans && (
          <primitive object={nodes.coffeeBeans} onClick={handleBeansClick} onPointerOver={() => (document.body.style.cursor = 'grab')} onPointerOut={() => (document.body.style.cursor = 'auto')} />
        )}
        {nodes.coffeeCup && (
          <primitive
            object={nodes.coffeeCup}
            onPointerDown={handleCupPointerDown}
            onPointerMove={handleCupPointerMove}
            onPointerUp={handleCupPointerUp}
            onPointerOver={() => (document.body.style.cursor = 'grab')}
            onPointerOut={() => (document.body.style.cursor = 'auto')}
          />
        )}

        <LiquidStream spoutRef={nodes.coffeeSpout} cupRef={nodes.coffeeCup} />
        <SteamEffect cupRef={nodes.coffeeCup} />
        <DripPuddle spoutRef={nodes.coffeeSpout} />
      </group>
    </group>
  );
}

useGLTF.preload(GLB_PATH);
