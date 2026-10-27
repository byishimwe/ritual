import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCoffeeStore } from '../../systems/state/useCoffeeStore';
import { MATERIAL_PARAMS, CUP_ALIGNMENT_TOLERANCE_M } from '../../config/experienceConfig';

interface Props {
  spoutRef?: THREE.Object3D;
  cupRef?: THREE.Object3D;
}

const FILL_DURATION_S = 8;

// The surface ripple shader displaces vertices in LOCAL space (before the
// mesh's own scale is applied), so its geometry is authored at this fixed
// base radius and only ever resized via mesh.scale — the ripple frequency,
// falloff and the shader's own uRadius edge-fade all assume this constant,
// never the cup's real (dynamically computed) radius.
const SURFACE_BASE_RADIUS = 0.032;

const STREAM_RADIAL_SEGMENTS = 16;
const STREAM_HEIGHT_SEGMENTS = 14;

// A flat-shaded, unlit stream reads as a rigid painted strip no matter how
// it's colored — roundness only reads once real light wraps around the
// surface. This is a genuinely lit (MeshPhysicalMaterial) tapered cylinder;
// the scene's own key/rim/fill lights are what make it look like a round,
// glossy liquid column instead of a rod. Its vertices are nudged every
// frame (see wobbleStreamGeometry) for a slightly organic, non-rigid look.
function wobbleStreamGeometry(geometry: THREE.BufferGeometry, basePositions: Float32Array, t: number) {
  const posAttr = geometry.attributes.position as THREE.BufferAttribute;
  const arr = posAttr.array as Float32Array;
  const count = posAttr.count;
  for (let i = 0; i < count; i++) {
    const bx = basePositions[i * 3];
    const by = basePositions[i * 3 + 1];
    const bz = basePositions[i * 3 + 2];
    // by spans -0.5 (bottom) to +0.5 (top) on the authored unit cylinder;
    // normalize to a 0..1 "v" so the wobble frequency reads consistently.
    const v = by + 0.5;
    const bulge = 1 + Math.sin(v * 28 - t * 6.5) * 0.06 + Math.sin(v * 9 - t * 2.8) * 0.035;
    arr[i * 3] = bx * bulge;
    arr[i * 3 + 1] = by;
    arr[i * 3 + 2] = bz * bulge;
  }
  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

// The surface ripple shader does its own lighting (rather than relying on
// scene lights) because the ripple displacement is analytic and fast to
// differentiate — an actual Points/Mesh-based normal recompute couldn't
// resolve the ripple's fine detail without an impractically dense grid.
// The normal is derived from the height field's own gradient, then lit
// against the scene's key light direction so it reads as a genuinely wet,
// glossy surface instead of a flat painted disc.
const surfaceVertexShader = /* glsl */ `
  varying vec2 vPlanar;
  varying float vHeight;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uImpact;

  float heightAt(vec2 p) {
    float r = length(p);
    float ripple = uImpact * sin(r * 60.0 - uTime * 10.0) * exp(-r * 10.0) * 0.003;
    float idle = sin(uTime * 1.15 + p.x * 13.0) * cos(uTime * 0.9 + p.y * 9.0) * 0.00035;
    return ripple + idle;
  }

  void main() {
    vPlanar = position.xy;
    float h = heightAt(position.xy);
    vHeight = h;

    // Analytic gradient (central difference) of the height field gives a
    // real surface normal for the ripples without needing extra geometry
    // density — CircleGeometry has no interior rings to displace.
    float eps = 0.0025;
    float hx = heightAt(position.xy + vec2(eps, 0.0)) - heightAt(position.xy - vec2(eps, 0.0));
    float hy = heightAt(position.xy + vec2(0.0, eps)) - heightAt(position.xy - vec2(0.0, eps));
    vec3 localNormal = normalize(vec3(-hx / (2.0 * eps), -hy / (2.0 * eps), 1.0) * 0.02 + vec3(0.0, 0.0, 1.0));
    vNormalW = normalize(normalMatrix * localNormal);

    vec3 pos = position + vec3(0.0, 0.0, h);
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const surfaceFragmentShader = /* glsl */ `
  varying vec2 vPlanar;
  varying float vHeight;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  uniform vec3 uColor;
  uniform float uRadius;
  void main() {
    float r = length(vPlanar);
    float edge = smoothstep(uRadius * 0.62, uRadius, r) * 0.1;

    vec3 N = normalize(vNormalW);
    // Approximates this scene's key light (Lighting.tsx: warm, upper-left)
    // and its rim light, so the coffee catches the same highlights as the
    // machine around it rather than looking lit from nowhere.
    vec3 keyDir = normalize(vec3(-1.6, 2.6, 1.2));
    vec3 rimDir = normalize(vec3(0.4, 1.1, -1.3));
    vec3 viewDir = normalize(cameraPosition - vWorldPos);

    float diff = max(dot(N, keyDir), 0.0);
    vec3 halfDir = normalize(keyDir + viewDir);
    float spec = pow(max(dot(N, halfDir), 0.0), 60.0);
    float rimSpec = pow(max(dot(N, normalize(rimDir + viewDir)), 0.0), 50.0) * 0.5;

    vec3 base = uColor * (0.42 + diff * 0.5 + edge);
    vec3 color = base + vec3(1.0, 0.93, 0.82) * (spec * 0.8 + rimSpec);
    gl_FragColor = vec4(color, 0.97);
  }
`;

export function LiquidStream({ spoutRef, cupRef }: Props) {
  const streamRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const surfaceRef = useRef<THREE.Mesh>(null);
  const streamMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const surfaceMatRef = useRef<THREE.ShaderMaterial>(null);
  const tickPour = useCoffeeStore((s) => s.tickPour);
  const experienceState = useCoffeeStore((s) => s.experienceState);
  const alignCup = useCoffeeStore((s) => s.alignCup);
  const fillScale = useRef(0);
  const streamIntensity = useRef(0);
  const rippleStrength = useRef(0);
  const lastAligned = useRef<boolean | null>(null);

  // CylinderGeometry's radiusTop sits at local +Y, which quaternion
  // .setFromUnitVectors below points along spout→target — i.e. radiusTop
  // lands at the CUP end and radiusBottom at the SPOUT end. A real stream
  // narrows as gravity accelerates it, so the cup end must be the *narrow*
  // one — radiusTop < radiusBottom here (this was previously reversed,
  // which read as coffee widening toward the cup, i.e. flowing backwards).
  const streamGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.55, 1, 1, STREAM_RADIAL_SEGMENTS, STREAM_HEIGHT_SEGMENTS, true),
    [],
  );
  const streamBasePositions = useMemo(
    () => (streamGeometry.attributes.position.array as Float32Array).slice(),
    [streamGeometry],
  );
  useEffect(() => () => streamGeometry.dispose(), [streamGeometry]);

  // A reset sets the store's cupAligned back to false directly, bypassing
  // the change-detection below — force a resync next frame so a re-centered
  // cup (position never actually moved) doesn't leave the store stuck out
  // of sync with reality.
  useEffect(() => {
    if (experienceState === 'OFF') {
      lastAligned.current = null;
      fillScale.current = 0;
      streamIntensity.current = 0;
      rippleStrength.current = 0;
    }
  }, [experienceState]);

  if (import.meta.env.DEV) {
    (window as any).__liquidStreamRefs = { streamRef, bodyRef, surfaceRef };
  }

  const surfaceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(MATERIAL_PARAMS.coffeeLiquid.color) },
      uImpact: { value: 0 },
      uRadius: { value: SURFACE_BASE_RADIUS },
    }),
    [],
  );

  const spoutTipLocal = useMemo(() => new THREE.Vector3(), []);
  const targetLocal = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const cylinderAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const anchorReady = useRef(false);
  const scratchBox = useMemo(() => new THREE.Box3(), []);
  const scratchVec = useMemo(() => new THREE.Vector3(), []);

  // Derived once from the cup's actual geometry (never hand-guessed) so the
  // liquid always sits inside THIS cup regardless of the source model's raw
  // export units — a fixed constant here previously anchored the coffee to
  // the wrong height entirely once the auto-fit scale was accounted for.
  const fillBottomY = useRef(0);
  const fillTopY = useRef(0.01);
  const fillRadiusTop = useRef(0.03);
  const fillRadiusBottom = useRef(0.026);
  // A real espresso stream is roughly a tenth of the cup's radius; deriving
  // it from the cup (rather than a hardcoded guess) keeps it correctly
  // scaled regardless of this model's raw export units — a fixed constant
  // here previously rendered as a sub-millimeter, invisible hairline.
  const streamRadius = useRef(0.003);
  // The cup node's own .position is a drag OFFSET from rest (0,0,0 at rest —
  // this GLB freezes translations, baking each part's true placement into
  // its mesh vertices instead). The cup's actual resting X/Z must come from
  // its geometry, then the live drag offset is added on top each frame.
  const cupBaseX = useRef(0);
  const cupBaseZ = useRef(0);
  // quaternion.setFromUnitVectors is recomputed from scratch every frame
  // (it has to be, to track the moving target), so a plain rotateY() call
  // wouldn't accumulate across frames — the spin angle is tracked here and
  // re-applied on top of that base orientation each frame instead.
  const streamSpin = useRef(0);

  useFrame((state, delta) => {
    const pouring = experienceState === 'POURING_ACTIVE';
    if (pouring) tickPour(delta * 1000);

    const t = state.clock.elapsedTime;
    if (surfaceMatRef.current) surfaceMatRef.current.uniforms.uTime.value = t;

    if (!spoutRef || !cupRef) {
      if (streamRef.current) streamRef.current.visible = false;
      if (surfaceRef.current) surfaceRef.current.visible = false;
      return;
    }

    const parentScale = streamRef.current?.parent?.scale.x || 1;
    const aligned = Math.abs(cupRef.position.x * parentScale) < CUP_ALIGNMENT_TOLERANCE_M;
    if (aligned !== lastAligned.current) {
      lastAligned.current = aligned;
      alignCup(aligned);
    }

    const parent = streamRef.current?.parent;
    if (!parent) return;

    if (!anchorReady.current) {
      spoutRef.updateWorldMatrix(true, false);
      scratchBox.setFromObject(spoutRef);
      scratchVec.set(
        (scratchBox.min.x + scratchBox.max.x) / 2,
        scratchBox.min.y,
        (scratchBox.min.z + scratchBox.max.z) / 2,
      );
      parent.worldToLocal(spoutTipLocal.copy(scratchVec));

      // Cup interior, derived from its real bounding box rather than a
      // guessed constant. The box's X extent is skewed wide by the handle,
      // so the radius is based on depth (Z) alone, then shrunk in from the
      // outer wall. The fill line stops short of the true rim (a real cup
      // is never poured to the absolute brim) and starts a little above the
      // outer base to clear the foot/wall thickness.
      cupRef.updateWorldMatrix(true, false);
      scratchBox.setFromObject(cupRef);
      const centerX = (scratchBox.min.x + scratchBox.max.x) / 2;
      const centerZ = (scratchBox.min.z + scratchBox.max.z) / 2;

      scratchVec.set(centerX, scratchBox.min.y, centerZ);
      parent.worldToLocal(scratchVec);
      const bottomLocalY = scratchVec.y;

      scratchVec.set(centerX, scratchBox.max.y, centerZ);
      parent.worldToLocal(scratchVec);
      const topLocalY = scratchVec.y;
      cupBaseZ.current = scratchVec.z;

      // The cup's own bounding-box X center is skewed toward the handle
      // (the handle sticks out to one side, pulling the AABB center with
      // it), which would render the liquid clipping through the cup wall.
      // The cup rests centered under the spout by design, so the spout's
      // own (handle-free, genuinely centered) X is the correct anchor.
      cupBaseX.current = spoutTipLocal.x;

      // A ceramic cup's interior is rounded at the base (not a straight-
      // walled cylinder), so its usable radius shrinks much faster near the
      // bottom than a gentle linear taper suggests. Starting the fill well
      // above the outer base and narrowing the bottom radius aggressively
      // keeps the liquid inside that curve instead of poking through the
      // wall near the foot.
      const localHeight = topLocalY - bottomLocalY;
      fillBottomY.current = bottomLocalY + localHeight * 0.3;
      fillTopY.current = bottomLocalY + localHeight * 0.8;

      const localDepth = (scratchBox.max.z - scratchBox.min.z) / parent.scale.z;
      const outerRadius = localDepth * 0.5;
      fillRadiusTop.current = outerRadius * 0.66;
      fillRadiusBottom.current = outerRadius * 0.3;
      streamRadius.current = fillRadiusTop.current * 0.14;

      anchorReady.current = true;
    }

    // Fill level rises only while actively pouring into an aligned cup — a
    // misaligned pour drains to the drip tray (DripPuddle) instead.
    if (pouring && aligned) {
      fillScale.current = Math.min(fillScale.current + delta / FILL_DURATION_S, 1);
    }

    // Attack/release envelopes so the stream starts and stops like a real
    // tap rather than snapping on/off, and ripples build up then settle
    // gradually instead of cutting instantly.
    const streamTarget = pouring ? 1 : 0;
    const streamRate = pouring ? 1 / 0.18 : 1 / 0.4;
    streamIntensity.current = THREE.MathUtils.damp(streamIntensity.current, streamTarget, streamRate, delta);

    const rippleTarget = pouring && aligned ? 1 : 0;
    const rippleRate = pouring && aligned ? 1 / 0.15 : 1 / 1.6;
    rippleStrength.current = THREE.MathUtils.damp(rippleStrength.current, rippleTarget, rippleRate, delta);

    const streamOn = streamIntensity.current > 0.003;
    const cupWorldX = cupBaseX.current + cupRef.position.x;
    const cupWorldZ = cupBaseZ.current + cupRef.position.z;

    if (streamRef.current) {
      streamRef.current.visible = streamOn;
      if (streamOn) {
        if (aligned) {
          const surfaceLocalY =
            fillBottomY.current + (fillTopY.current - fillBottomY.current) * fillScale.current;
          targetLocal.set(cupWorldX, surfaceLocalY, cupWorldZ);
        } else {
          targetLocal.set(spoutTipLocal.x, 0.01, spoutTipLocal.z);
        }
        const dist = spoutTipLocal.distanceTo(targetLocal);
        // Thins toward a trickle as it tapers off, never a hard cutoff.
        const widthScale = streamRadius.current * (0.25 + 0.75 * streamIntensity.current);
        streamRef.current.scale.set(widthScale, Math.max(dist, 0.01), widthScale);
        streamRef.current.position.copy(spoutTipLocal).lerp(targetLocal, 0.5);
        direction.copy(targetLocal).sub(spoutTipLocal).normalize();
        streamRef.current.quaternion.setFromUnitVectors(cylinderAxis, direction);
        // A slow continuous turn sweeps the specular highlight around the
        // tube over time — a cheap, robust way to read as "moving liquid"
        // rather than a static painted rod, without per-vertex shader risk.
        streamSpin.current += delta * 1.6;
        streamRef.current.rotateY(streamSpin.current);
        wobbleStreamGeometry(streamGeometry, streamBasePositions, t);
      }
      if (streamMatRef.current) streamMatRef.current.opacity = streamIntensity.current;
    }

    if (bodyRef.current && surfaceRef.current) {
      const visible = fillScale.current > 0.001;
      bodyRef.current.visible = visible;
      surfaceRef.current.visible = visible;

      const fillHeight = (fillTopY.current - fillBottomY.current) * fillScale.current;
      const surfaceRadius = THREE.MathUtils.lerp(fillRadiusBottom.current, fillRadiusTop.current, fillScale.current);

      bodyRef.current.position.set(cupWorldX, fillBottomY.current + fillHeight * 0.5, cupWorldZ);
      bodyRef.current.scale.set(surfaceRadius, Math.max(fillHeight, 0.0001), surfaceRadius);

      const surfaceY = fillBottomY.current + fillHeight;
      surfaceRef.current.position.set(cupWorldX, surfaceY, cupWorldZ);
      surfaceRef.current.scale.setScalar(surfaceRadius / SURFACE_BASE_RADIUS);
      if (surfaceMatRef.current) {
        surfaceMatRef.current.uniforms.uImpact.value = rippleStrength.current;
      }
    }
  });

  return (
    <>
      <mesh
        ref={streamRef}
        geometry={streamGeometry}
        visible={false}
        frustumCulled={false}
        renderOrder={10}
      >
        <meshPhysicalMaterial
          ref={streamMatRef}
          color="#2E1710"
          roughness={0.22}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>
      {cupRef && (
        <>
          <mesh ref={bodyRef} visible={false}>
            {/* Unit cylinder — resized entirely via mesh.scale each frame,
                so no shader/geometry constant needs to match this model's
                actual cup dimensions ahead of time. */}
            <cylinderGeometry args={[1, 1, 1, 24, 1, false]} />
            <meshPhysicalMaterial color={MATERIAL_PARAMS.coffeeLiquid.color} roughness={0.14} clearcoat={0.5} />
          </mesh>
          <mesh ref={surfaceRef} rotation={[-Math.PI / 2, 0, 0]} visible={false} renderOrder={5}>
            <circleGeometry args={[SURFACE_BASE_RADIUS, 48]} />
            <shaderMaterial
              ref={surfaceMatRef}
              transparent
              vertexShader={surfaceVertexShader}
              fragmentShader={surfaceFragmentShader}
              uniforms={surfaceUniforms}
            />
          </mesh>
        </>
      )}
    </>
  );
}
