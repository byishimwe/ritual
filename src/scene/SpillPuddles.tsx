import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ANCHORS, CUP } from '../config/asset';
import { engine } from '../state/experienceStore';
import { useServices } from './services';

const GRILLE_TOP = CUP.padTopY + 0.0009;

function createPuddleAlpha(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, size, size);
    // Overlapping soft lobes give an organic edge without any texture asset.
    const lobes = [
      [0.5, 0.5, 0.42],
      [0.36, 0.56, 0.26],
      [0.62, 0.44, 0.24],
      [0.52, 0.63, 0.2],
      [0.58, 0.36, 0.18],
    ];
    for (const [cx, cy, radius] of lobes) {
      const gradient = context.createRadialGradient(
        cx * size,
        cy * size,
        0,
        cx * size,
        cy * size,
        radius * size,
      );
      gradient.addColorStop(0, 'rgba(255,255,255,0.85)');
      gradient.addColorStop(0.62, 'rgba(255,255,255,0.55)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const geometry = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

/**
 * Spilled and overflowed coffee.
 *
 * Both pools are driven strictly by the accumulated volumes: the missed stream
 * pools on the drip grille under the nozzle, overflow runs down the cup and
 * gathers under it. Nothing grows when no coffee is being lost (RITUAL-04 §15).
 */
export function SpillPuddles() {
  const services = useServices();
  const missRef = useRef<THREE.Mesh>(null);
  const overflowRef = useRef<THREE.Mesh>(null);
  const visual = useRef({ missed: 0, overflow: 0 });

  const alphaMap = useMemo(() => createPuddleAlpha(), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#24120b'),
        roughness: 0.06,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        transparent: true,
        opacity: 0.92,
        alphaMap,
        depthWrite: false,
        envMapIntensity: 1.2,
      }),
    [alphaMap],
  );

  useEffect(() => () => {
    alphaMap.dispose();
    material.dispose();
  }, [alphaMap, material]);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);
    const snapshot = engine.getState();
    const { missedVolume, overflowVolume } = snapshot.coffee;

    const ease = (current: number, target: number) => {
      const rate = target > current ? 9 : 3.4;
      return current + (target - current) * (1 - Math.exp(-dt * rate));
    };

    visual.current.missed = ease(visual.current.missed, missedVolume);
    visual.current.overflow = ease(visual.current.overflow, overflowVolume);

    const miss = missRef.current;
    if (miss) {
      const volume = visual.current.missed;
      miss.visible = volume > 0.002;
      if (miss.visible) {
        miss.position.set(ANCHORS.coffeeExit.x, GRILLE_TOP, ANCHORS.coffeeExit.z);
        miss.scale.setScalar(Math.min(0.056, 0.011 + 0.048 * Math.sqrt(volume)) * 2.2);
        (miss.material as THREE.MeshPhysicalMaterial).opacity = Math.min(0.92, 0.35 + volume * 1.4);
      }
    }

    const spilled = overflowRef.current;
    if (spilled) {
      const volume = visual.current.overflow;
      spilled.visible = volume > 0.002;
      const cup = services.rig.cup;
      if (spilled.visible && cup) {
        cup.getWorldPosition(cupWorld);
        // Overflow runs off the raised grille and gathers on the lower tray in
        // front of the cup, where it can actually be seen past the cup body.
        spilled.position.set(
          cupWorld.x,
          CUP.trayFloorY + 0.0008,
          Math.max(cupWorld.z + 0.04, CUP.pad.maxZ - 0.001),
        );
        spilled.scale.setScalar(Math.min(0.15, 0.05 + 0.12 * Math.sqrt(volume)));
        (spilled.material as THREE.MeshPhysicalMaterial).opacity = Math.min(0.9, 0.35 + volume * 1.8);
      }
    }
  });

  return (
    <group name="Spills">
      <mesh ref={missRef} geometry={geometry} material={material} visible={false} renderOrder={2} />
      <mesh ref={overflowRef} geometry={geometry} material={material} visible={false} renderOrder={2} />
    </group>
  );
}

const cupWorld = new THREE.Vector3();
