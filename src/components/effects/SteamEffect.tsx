import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCoffeeStore } from '../../systems/state/useCoffeeStore';

interface Props {
  cupRef?: THREE.Object3D;
}

const PARTICLE_COUNT = 40;

// A soft radial-gradient sprite (rather than PointsMaterial's default hard
// square) is what makes particles read as wispy vapor instead of a cloud
// of dots. Generated procedurally so no texture asset is needed.
function createSteamSprite(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255,255,255,0.85)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.45)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Custom point shader so each wisp can grow and fade independently (plain
// PointsMaterial only offers one uniform size/opacity for every particle,
// which is what made the previous version read as a static dot cloud
// rather than dissipating vapor).
const steamVertexShader = /* glsl */ `
  attribute float aSize;
  attribute float aOpacity;
  varying float vOpacity;
  void main() {
    vOpacity = aOpacity;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (220.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const steamFragmentShader = /* glsl */ `
  varying float vOpacity;
  uniform vec3 uColor;
  uniform sampler2D uMap;
  void main() {
    vec4 tex = texture2D(uMap, gl_PointCoord);
    gl_FragColor = vec4(uColor, tex.a * vOpacity);
  }
`;

export function SteamEffect({ cupRef }: Props) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const experienceState = useCoffeeStore((s) => s.experienceState);

  const sprite = useMemo(() => createSteamSprite(), []);

  const { positions, sizes, opacities, seeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const opacities = new Float32Array(PARTICLE_COUNT);
    const seeds = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      seeds[i * 3] = Math.random() * 10; // phase offset (staggers each wisp's life cycle)
      seeds[i * 3 + 1] = 0.55 + Math.random() * 0.5; // rise-speed variation
      seeds[i * 3 + 2] = Math.random() * Math.PI * 2; // drift phase
    }
    return { positions, sizes, opacities, seeds };
  }, []);

  // Real steam doesn't cut off the instant the pour stops, nor linger
  // forever once the cup has cooled — it stays through COMPLETE.
  const active =
    experienceState === 'BREWING' || experienceState === 'POURING_ACTIVE' || experienceState === 'COMPLETE';

  const anchorReady = useRef(false);
  const cupBaseX = useRef(0);
  const cupBaseZ = useRef(0);
  const cupTopY = useRef(0.05);
  const scratchBox = useMemo(() => new THREE.Box3(), []);
  const scratchVec = useMemo(() => new THREE.Vector3(), []);
  const spreadRadius = useRef(0.02);
  const globalFade = useRef(0);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points || !cupRef) return;

    globalFade.current = THREE.MathUtils.damp(globalFade.current, active ? 1 : 0, active ? 1 / 0.6 : 1 / 1.2, delta);
    points.visible = globalFade.current > 0.01;
    if (!points.visible) return;

    const parent = points.parent;
    if (parent && !anchorReady.current) {
      // Same fix as the coffee fill/stream: the cup's own .position is a
      // drag offset from rest (this GLB bakes each part's true placement
      // into its mesh vertices, not into the node transform), and its
      // bounding-box X is skewed by the handle — so X is taken as centered
      // under the spout (where the cup rests by design) rather than the
      // handle-skewed box center.
      cupRef.updateWorldMatrix(true, false);
      scratchBox.setFromObject(cupRef);
      const centerZ = (scratchBox.min.z + scratchBox.max.z) / 2;

      scratchVec.set(0, scratchBox.max.y, centerZ);
      parent.worldToLocal(scratchVec);
      cupTopY.current = scratchVec.y;
      cupBaseZ.current = scratchVec.z;
      cupBaseX.current = 0;

      const localDepth = (scratchBox.max.z - scratchBox.min.z) / parent.scale.z;
      spreadRadius.current = localDepth * 0.24;

      anchorReady.current = true;
    }

    const cupWorldX = cupBaseX.current + cupRef.position.x;
    const cupWorldZ = cupBaseZ.current + cupRef.position.z;
    points.position.set(cupWorldX, cupTopY.current, cupWorldZ);

    const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
    const sizeAttr = points.geometry.attributes.aSize as THREE.BufferAttribute;
    const opacityAttr = points.geometry.attributes.aOpacity as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    // Kept small and restrained — thin rising wisps read as real steam,
    // whereas a large soft blob reads as fog.
    const rise = spreadRadius.current * 5.5;
    const baseSize = spreadRadius.current * 1.4;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phase = seeds[i * 3];
      const speed = seeds[i * 3 + 1];
      const driftPhase = seeds[i * 3 + 2];
      const life = (t * 0.16 * speed + phase * 0.31) % 1;

      // Wisps wander further off-axis and slow down as they climb, the way
      // real steam disperses instead of travelling in a straight column.
      const height = life * rise;
      const wander = spreadRadius.current * (0.15 + life * 1.1);
      posAttr.array[i * 3] = Math.sin(t * 0.35 + driftPhase) * wander;
      posAttr.array[i * 3 + 1] = height;
      posAttr.array[i * 3 + 2] = Math.cos(t * 0.3 + driftPhase * 1.3) * wander;

      // Grows while rising, fades in at birth and out before it fully
      // disperses — no wisp pops in or out abruptly.
      const envelope = Math.sin(Math.PI * Math.min(life, 1));
      sizeAttr.array[i] = baseSize * (0.5 + life * 0.9);
      opacityAttr.array[i] = envelope * 0.22 * globalFade.current;
    }
    posAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} visible={false} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} count={PARTICLE_COUNT} itemSize={1} />
        <bufferAttribute attach="attributes-aOpacity" args={[opacities, 1]} count={PARTICLE_COUNT} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        vertexShader={steamVertexShader}
        fragmentShader={steamFragmentShader}
        uniforms={{
          uColor: { value: new THREE.Color('#FFF3E0') },
          uMap: { value: sprite },
        }}
      />
    </points>
  );
}
