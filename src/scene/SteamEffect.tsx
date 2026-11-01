import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { CUP } from '../config/asset';
import { engine } from '../state/experienceStore';
import { useServices } from './services';

const COUNT = 22;
const RISE = 0.16;

const vertexShader = /* glsl */ `
  attribute float aAlpha;
  attribute float aSize;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (320.0 / max(-mvPosition.z, 0.001));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.04, d) * vAlpha * uOpacity;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

/**
 * Restrained vapour from hot coffee.
 *
 * Steam exists only when there is coffee in the cup, and its density follows
 * that volume — an empty vessel produces nothing (RITUAL-04 §16).
 */
export function SteamEffect({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const services = useServices();
  const count = reducedMotion ? Math.round(COUNT * 0.5) : COUNT;

  const { geometry, alphas, sizes } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const alphaAttribute = new Float32Array(COUNT);
    const sizeAttribute = new Float32Array(COUNT);
    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    buffer.setAttribute('aAlpha', new THREE.BufferAttribute(alphaAttribute, 1));
    buffer.setAttribute('aSize', new THREE.BufferAttribute(sizeAttribute, 1));
    buffer.setDrawRange(0, count);
    return { geometry: buffer, alphas: alphaAttribute, sizes: sizeAttribute };
  }, [count]);

  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color('#efe9de') }, uOpacity: { value: 0 } }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      }),
    [uniforms],
  );

  const pointsRef = useRef<THREE.Points>(null);
  const state = useRef(
    Array.from({ length: COUNT }, (_, index) => ({
      phase: ((index * 137) % COUNT) / COUNT,
      speed: 0.11 + ((index * 31) % 17) / 120,
      offsetX: (((index * 53) % 23) / 23 - 0.5) * 0.032,
      offsetZ: (((index * 71) % 19) / 19 - 0.5) * 0.03,
      wobble: (index % 7) * 0.9,
    })),
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 0.1);
    const points = pointsRef.current;
    const cup = services.rig.cup;
    if (!points || !cup) return;

    const snapshot = engine.getState();
    const volume = snapshot.coffee.cupVolume;
    const targetOpacity = Math.min(1, volume * 2.4) * 0.38;
    uniforms.uOpacity.value +=
      (targetOpacity - uniforms.uOpacity.value) * (1 - Math.exp(-dt * 1.6));

    points.visible = uniforms.uOpacity.value > 0.004;
    if (!points.visible) return;

    cup.getWorldPosition(cupWorld);
    const mouthY = cupWorld.y + CUP.localRimY;
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const time = frame.clock.elapsedTime;

    for (let i = 0; i < COUNT; i += 1) {
      const particle = state.current[i];
      particle.phase = (particle.phase + dt * particle.speed) % 1;

      const life = particle.phase;
      const spread = 0.012 + life * 0.05;
      const x =
        cupWorld.x + particle.offsetX * (1 + life * 2.2) + Math.sin(time * 0.7 + particle.wobble) * spread;
      const z =
        cupWorld.z + particle.offsetZ * (1 + life * 2.2) + Math.cos(time * 0.55 + particle.wobble) * spread;
      const y = mouthY + life * RISE;

      positions.setXYZ(i, x, y, z);
      alphas[i] = Math.sin(Math.PI * life) * (i < count ? 1 : 0);
      sizes[i] = (reducedMotion ? 0.016 : 0.022) + life * 0.035;
    }

    positions.needsUpdate = true;
    (geometry.getAttribute('aAlpha') as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} renderOrder={4} />;
}

const cupWorld = new THREE.Vector3();
