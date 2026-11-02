import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { engine } from '../state/experienceStore';
import type { SpillDeposit } from '../domain/types';

/**
 * Spilled and overflowed coffee.
 *
 * The engine records where each parcel actually landed; this component only
 * draws those deposits. It never derives a puddle position from the cup, so
 * coffee that has reached the countertop stays there when the cup is moved.
 *
 * A fixed pool of meshes and a bounded authoritative deposit list keep the
 * effect allocation-free after start-up, even while a full cup is dragged
 * across the stream.
 */

const MAX_VISUAL_SPILLS = 10;

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

interface VisualDeposit {
  volume: number;
  x: number;
  y: number;
  z: number;
  maxWidth: number;
}

export function SpillPuddles() {
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  const visual = useRef<VisualDeposit[]>(
    Array.from({ length: MAX_VISUAL_SPILLS }, () => ({
      volume: 0,
      x: 0,
      y: 0,
      z: 0,
      maxWidth: 0.12,
    })),
  );

  const alphaMap = useMemo(() => createPuddleAlpha(), []);
  const materials = useMemo(
    () =>
      Array.from(
        { length: MAX_VISUAL_SPILLS },
        () =>
          new THREE.MeshPhysicalMaterial({
            color: new THREE.Color('#24120b'),
            roughness: 0.06,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0.04,
            transparent: true,
            opacity: 0,
            alphaMap,
            depthWrite: false,
            envMapIntensity: 1.2,
          }),
      ),
    [alphaMap],
  );

  useEffect(
    () => () => {
      alphaMap.dispose();
      for (const material of materials) material.dispose();
    },
    [alphaMap, materials],
  );

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);
    const deposits: readonly SpillDeposit[] = engine.getState().coffee.spills;

    for (let i = 0; i < MAX_VISUAL_SPILLS; i += 1) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      const slot = visual.current[i];
      const deposit = deposits[i];

      const target = deposit?.volume ?? 0;
      const rate = target > slot.volume ? 9 : 3.4;
      slot.volume += (target - slot.volume) * (1 - Math.exp(-dt * rate));
      if (target === 0 && slot.volume < 0.001) slot.volume = 0;

      mesh.visible = slot.volume > 0.002;
      if (!mesh.visible) {
        materials[i].opacity = 0;
        continue;
      }

      if (deposit) {
        slot.x = deposit.x;
        slot.y = deposit.y;
        slot.z = deposit.z;
        slot.maxWidth = deposit.source === 'MISS' ? 0.115 : 0.16;
        mesh.position.set(deposit.x, deposit.y, deposit.z);
      } else {
        mesh.position.set(slot.x, slot.y, slot.z);
      }

      const width = Math.min(slot.maxWidth, 0.032 + slot.maxWidth * 0.82 * Math.sqrt(slot.volume));
      mesh.scale.setScalar(width);
      materials[i].opacity = Math.min(0.92, 0.3 + slot.volume * 1.5);
    }
  });

  return (
    <group name="Spills">
      {Array.from({ length: MAX_VISUAL_SPILLS }, (_, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            meshRefs.current[index] = mesh;
          }}
          geometry={geometry}
          material={materials[index]}
          visible={false}
          renderOrder={2}
        />
      ))}
    </group>
  );
}
