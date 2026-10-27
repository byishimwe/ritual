import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

const DUST_COUNT = 18;

// A faint volumetric shaft along the key light's own direction — the one
// piece of "cinematic void" language the scene was still missing. Kept to
// a whisper (peak alpha ~0.05) so it reads as light finding dust in a dark
// room, never as a literal visible beam or a game-engine god-ray.
const KEY_LIGHT_DIR = new THREE.Vector3(-1.6, 2.6, 1.2).normalize();

const shaftVertexShader = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const shaftFragmentShader = /* glsl */ `
  varying vec3 vPos;
  uniform float uTime;
  uniform vec3 uColor;
  void main() {
    float radial = 1.0 - smoothstep(0.0, 1.0, length(vPos.xz) * 2.0);
    float lengthFade = smoothstep(0.0, 0.2, vPos.y + 0.5) * smoothstep(1.0, 0.55, vPos.y + 0.5);
    // A very slow drift, as if the studio air itself is barely moving —
    // never a distinct animated stripe.
    float drift = 0.85 + 0.15 * sin(uTime * 0.12 + vPos.y * 3.0);
    float alpha = radial * lengthFade * drift * 0.11;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function LightShaft() {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), KEY_LIGHT_DIR);
    return q;
  }, []);
  // Positioned and sized so its widest (base) end stays well clear of the
  // floor — at the original closer/taller placement, the cone's base
  // dipped fractionally below y=0 and its edge intersecting the cove
  // produced a visible thin arc across the floor.
  const position = useMemo(() => KEY_LIGHT_DIR.clone().multiplyScalar(2.0), []);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh ref={meshRef} position={position} quaternion={quaternion} renderOrder={-5}>
      <cylinderGeometry args={[0.05, 0.7, 2.2, 24, 1, true]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={shaftVertexShader}
        fragmentShader={shaftFragmentShader}
        uniforms={{ uTime: { value: 0 }, uColor: { value: new THREE.Color('#FFF3E0') } }}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </mesh>
  );
}

// Barely-visible motes drifting through the key light — physical dust in a
// studio beam, not a magical particle effect. They should only ever read
// as a faint shimmer, never as individually identifiable sparkles.
function DustMotes() {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3);
    const seeds = new Float32Array(DUST_COUNT * 2);
    for (let i = 0; i < DUST_COUNT; i++) {
      // Clustered around the machine and the key light's path rather than
      // scattered across the whole void, so motes only ever appear where a
      // studio beam would plausibly catch them.
      positions[i * 3] = -0.5 + Math.random() * 0.9;
      positions[i * 3 + 1] = 0.1 + Math.random() * 0.6;
      positions[i * 3 + 2] = -0.1 + Math.random() * 0.7;
      seeds[i * 2] = Math.random() * 100;
      seeds[i * 2 + 1] = 0.015 + Math.random() * 0.02;
    }
    return { positions, seeds };
  }, []);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;
    const posAttr = points.geometry.attributes.position as THREE.BufferAttribute;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < DUST_COUNT; i++) {
      const seed = seeds[i * 2];
      const speed = seeds[i * 2 + 1];
      const y = (posAttr.array[i * 3 + 1] as number) + speed * 0.016;
      posAttr.array[i * 3 + 1] = y > 0.75 ? 0.05 : y;
      posAttr.array[i * 3] += Math.sin(t * 0.15 + seed) * 0.0004;
      posAttr.array[i * 3 + 2] += Math.cos(t * 0.12 + seed) * 0.0004;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={DUST_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.0022} color="#FFEFDD" transparent opacity={0.08} depthWrite={false} sizeAttenuation />
    </points>
  );
}

// A studio "infinity cove" — floor and backdrop as one continuous surface,
// curving smoothly from flat countertop into a wall rather than meeting it
// at a hard corner. Built as a radial height field (flat within
// COVE_FLOOR_RADIUS, easing up into a wall beyond it) instead of a true
// swept profile: the camera stays elevated and orbits a limited range, so
// a much simpler radially-symmetric rise reads convincingly as a cove from
// every reachable angle without the cost or fragility of an exact arc-
// length-preserving sweep.
const COVE_FLOOR_RADIUS = 0.95;
const COVE_WALL_HEIGHT = 3.4;
const COVE_CURVE_WIDTH = 2.4;
const COVE_OUTER_RADIUS = 9;

function buildCoveGeometry() {
  // Denser than the first pass: a radially-symmetric height field built
  // from discrete rings can under-sample into visible concentric banding
  // wherever per-vertex shading varies with radius (this is what the
  // earlier baked-in AO ring and positional "grain" jitter turned into —
  // both removed below; ContactShadows already handles real grounding, and
  // a uniform matte color reads as clean stone rather than a faint target
  // pattern radiating from the machine).
  const rings = 90;
  const segments = 140;
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let ring = 0; ring <= rings; ring++) {
    const u = ring / rings;
    const r = COVE_OUTER_RADIUS * Math.pow(u, 1.6);
    const rise = Math.max(0, r - COVE_FLOOR_RADIUS);
    const y = COVE_WALL_HEIGHT * (1 - Math.exp(-rise / COVE_CURVE_WIDTH));

    for (let seg = 0; seg <= segments; seg++) {
      const angle = (seg / segments) * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      positions.push(x, y, z);
      normals.push(0, 1, 0); // replaced by computeVertexNormals below
    }
  }

  const ringVerts = segments + 1;
  for (let ring = 0; ring < rings; ring++) {
    for (let seg = 0; seg < segments; seg++) {
      const a = ring * ringVerts + seg;
      const b = a + ringVerts;
      const c = a + 1;
      const d = b + 1;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function InfinityCove() {
  const geometry = useMemo(() => buildCoveGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#2E271C" roughness={0.92} metalness={0.04} side={THREE.DoubleSide} dithering />
    </mesh>
  );
}

// The exhibit has no table or plinth — the machine sits in a large dark
// architectural void. This gradient "void" sphere replaces a literal
// backdrop wall: a soft vertical luminosity shift (brighter near the
// machine's height, darker toward the poles) reads as atmospheric depth
// without the obvious radial "spotlight-on-a-wall" look a cyclorama gives.
const voidVertexShader = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const voidFragmentShader = /* glsl */ `
  varying vec3 vPos;
  uniform vec3 uHorizonColor;
  uniform vec3 uVoidColor;
  uniform float uHorizonY;
  uniform float uSpread;
  void main() {
    float d = (vPos.y - uHorizonY) / uSpread;
    float t = 1.0 - exp(-d * d);
    vec3 color = mix(uHorizonColor, uVoidColor, t);
    // This gradient is smooth and very dark, which is exactly the
    // combination an 8-bit framebuffer quantizes into visible concentric
    // banding rings (matching the sphere's own iso-brightness contours) —
    // a per-pixel dither breaks the bands up into imperceptible grain.
    float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 128.0;
    gl_FragColor = vec4(color + dither, 1.0);
  }
`;

export function StageEnvironment() {
  // Low contrast + a very wide spread deliberately keep this well short of
  // a visible seam: a Y-keyed gradient on a sphere viewed from near its
  // center compresses fastest right at the visual horizon, so anything
  // punchier here reads as a hard studio-cyclorama line exactly where the
  // floor's geometric horizon already sits — the one thing this void must
  // never look like.
  const voidUniforms = useMemo(
    () => ({
      uHorizonColor: { value: new THREE.Color('#141210') },
      uVoidColor: { value: new THREE.Color('#08090a') },
      uHorizonY: { value: 0.3 },
      uSpread: { value: 6.5 },
    }),
    [],
  );

  return (
    <>
      {/* Dark architectural void — large enough that no edge is ever visible */}
      <mesh renderOrder={-10}>
        <sphereGeometry args={[9, 32, 24]} />
        <shaderMaterial
          side={THREE.BackSide}
          vertexShader={voidVertexShader}
          fragmentShader={voidFragmentShader}
          uniforms={voidUniforms}
          depthWrite={false}
          fog={false}
        />
      </mesh>

      {/* A handful of soft, mostly-unseen reflection sources — an "invisible
          studio" that gives metal/glass believable reflections without ever
          reading as a visible lighting rig. */}
      <Environment resolution={128} background={false}>
        <Lightformer form="rect" intensity={1.4} color="#FFF3E2" position={[-2, 2.6, 1.6]} scale={[2.4, 2.4, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#D9E2EA" position={[2.2, 1.4, 1]} scale={[1.8, 1.8, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#2A2622" position={[0, 1.6, -2.4]} scale={[2.6, 1.8, 1]} />
      </Environment>

      {/* The studio stage itself — countertop and backdrop wall as one
          continuous surface, replacing the old flat floor disc. */}
      <InfinityCove />

      {/* Dedicated soft blob shadow directly under the machine — the sun
          shadow alone reads a little thin at this light intensity; this
          gives the base of the machine real, grounded weight. */}
      {/* Raised well clear of the cove surface — at 0.001 the two nearly-
          coplanar planes z-fought at the shadow plane's silhouette edge,
          showing up as a thin stray curved seam across the floor. */}
      <ContactShadows position={[0, 0.008, 0]} opacity={0.62} scale={1.5} blur={2.0} far={0.55} resolution={512} color="#000000" />

      {/* Extremely low-density atmosphere for foreground/background separation —
          tuned to fully fade before the cove wall could ever seam against the
          void sphere behind it. */}
      <fog attach="fog" args={['#0a0806', 2.4, 6.5]} />

      <DustMotes />
      <LightShaft />
    </>
  );
}
