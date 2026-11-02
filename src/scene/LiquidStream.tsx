import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ANCHORS, CUP, STREAM } from '../config/asset';
import { COFFEE, MOTION } from '../config/experience';
import { captureFractionAt } from '../domain/capture';
import { CUP_INTERIOR_HEIGHT, volumeFractionToHeightFraction } from '../domain/cupGeometry';
import { engine } from '../state/experienceStore';
import { useServices } from './services';

/** Top of the drip grille — where coffee lands when it misses the cup. */
const GRILLE_TOP = CUP.padTopY + 0.0011;

const vertexShader = /* glsl */ `
  uniform float uLength;
  uniform float uGirth;
  uniform float uDetach;
  uniform float uTime;
  uniform float uRadiusTop;
  uniform float uRadiusBottom;

  varying vec3 vNormalView;
  varying vec3 vWorld;
  varying float vT;

  void main() {
    // uv.y is 1 at the nozzle and 0 at impact, so t runs downward.
    float t = 1.0 - uv.y;

    float taper = mix(uRadiusTop, uRadiusBottom, t);
    // Two slow, out-of-phase wobbles: a poured stream is never a perfect rod,
    // but it must never look like a wobbling rope either.
    float wobble = 1.0
      + 0.055 * sin(t * 7.0 + uTime * 5.5) * t
      + 0.028 * sin(t * 19.0 - uTime * 3.1) * t;
    float collar = 1.0 + 0.3 * smoothstep(0.9, 1.0, t);
    float radius = taper * wobble * collar * uGirth;

    vec3 n = normalize(normal);
    // The top of the column recedes to the landing surface as the tail clears,
    // leaving a short falling segment rather than a collapsed disc.
    float drop = (uDetach * uLength) + t * uLength * (1.0 - uDetach);

    vec3 transformed = vec3(n.x * radius, -drop, n.z * radius);
    vec4 world = modelMatrix * vec4(transformed, 1.0);

    vT = t;
    vWorld = world.xyz;
    vNormalView = normalize(mat3(modelMatrix) * n);

    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec3 vNormalView;
  varying vec3 vWorld;
  varying float vT;

  void main() {
    vec3 N = normalize(vNormalView);
    vec3 V = normalize(cameraPosition - vWorld);

    vec3 keyDir = normalize(vec3(-0.55, 0.72, 0.42));
    vec3 rimDir = normalize(vec3(0.72, 0.32, -0.35));

    float diffuse = max(dot(N, keyDir), 0.0);
    vec3 keyHalf = normalize(keyDir + V);
    float keySpec = pow(max(dot(N, keyHalf), 0.0), 72.0);
    vec3 rimHalf = normalize(rimDir + V);
    float rimSpec = pow(max(dot(N, rimHalf), 0.0), 26.0);
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.4);

    vec3 color = uColor * (0.4 + 0.55 * diffuse);
    color += vec3(0.92, 0.86, 0.78) * keySpec * 0.6;
    color += vec3(0.65, 0.63, 0.6) * rimSpec * 0.16;
    color += vec3(fresnel) * 0.055;
    color *= 1.0 - 0.18 * smoothstep(0.75, 1.0, vT);

    gl_FragColor = vec4(color, uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface StreamUniforms {
  [key: string]: THREE.IUniform;
  uLength: { value: number };
  uGirth: { value: number };
  uDetach: { value: number };
  uTime: { value: number };
  uRadiusTop: { value: number };
  uRadiusBottom: { value: number };
  uColor: { value: THREE.Color };
  uOpacity: { value: number };
}

function createUniforms(): StreamUniforms {
  return {
    uLength: { value: 0.1 },
    uGirth: { value: 1 },
    uDetach: { value: 0 },
    uTime: { value: 0 },
    uRadiusTop: { value: STREAM.radiusTop },
    uRadiusBottom: { value: STREAM.radiusBottom },
    uColor: { value: new THREE.Color('#24120b') },
    uOpacity: { value: 1 },
  };
}

function createMaterial(uniforms: StreamUniforms): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: true,
  });
}

/**
 * The pour.
 *
 * A full stream falls from the measured nozzle into the receiving surface. When
 * the cup is only partially under the stream, the captured column narrows and a
 * second runoff column leaves the rim for the grille, so the visible split
 * agrees with the authoritative capture fraction instead of pretending all of
 * the coffee entered the cup. Neither column bends sideways.
 */
export function LiquidStream() {
  const services = useServices();
  const primaryUniforms = useMemo(() => createUniforms(), []);
  const runoffUniforms = useMemo(() => createUniforms(), []);
  const primaryMaterial = useMemo(() => createMaterial(primaryUniforms), [primaryUniforms]);
  const runoffMaterial = useMemo(() => createMaterial(runoffUniforms), [runoffUniforms]);

  const geometry = useMemo(() => {
    const cylinder = new THREE.CylinderGeometry(1, 1, 1, 14, 26, true);
    cylinder.computeVertexNormals();
    return cylinder;
  }, []);

  const primaryRef = useRef<THREE.Mesh>(null);
  const runoffRef = useRef<THREE.Mesh>(null);
  const visual = useRef({
    active: false,
    grow: 0,
    detach: 0,
    primaryLength: 0.1,
    runoffLength: 0.06,
  });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const snapshot = engine.getState();
    const primary = primaryRef.current;
    const runoff = runoffRef.current;
    if (!primary || !runoff) return;

    const pouring = snapshot.machine === 'POURING';
    const visualState = visual.current;

    if (pouring) {
      visualState.active = true;
      visualState.detach = 0;
      visualState.grow = Math.min(1, visualState.grow + dt / MOTION.streamIn);
    } else if (visualState.active) {
      visualState.grow = Math.max(0, visualState.grow - dt / MOTION.streamIn);
      visualState.detach = Math.min(1, visualState.detach + dt / MOTION.streamOut);
      if (visualState.detach >= 0.92) {
        visualState.active = false;
        visualState.grow = 0;
        visualState.detach = 0;
      }
    }

    const visible = visualState.active && visualState.grow > 0.01 && visualState.detach < 0.92;
    primary.visible = visible;
    if (!visible) {
      runoff.visible = false;
      return;
    }

    const cup = services.rig.cup;
    if (cup) {
      cup.getWorldPosition(cupWorld);
    }

    // Evaluate capture fraction directly from the authoritative domain state
    // so presentation and simulation are perfectly synchronized.
    const capture = cup
      ? captureFractionAt(snapshot.cup.position, ANCHORS.coffeeExit)
      : 0;

    let cupX: number = ANCHORS.coffeeExit.x;
    let cupZ: number = ANCHORS.coffeeExit.z;
    let rimY: number = GRILLE_TOP;
    let landingY = GRILLE_TOP;
    if (cup) {
      cupX = cupWorld.x;
      cupZ = cupWorld.z;
      rimY = cupWorld.y + CUP.localRimY - 0.002;
    }
    if (capture > 0.02 && cup) {
      const heightFraction = volumeFractionToHeightFraction(snapshot.coffee.cupVolume);
      landingY = cupWorld.y + CUP.localFloorY + heightFraction * CUP_INTERIOR_HEIGHT;
      landingY = Math.min(landingY, cupWorld.y + CUP.localRimY - 0.001);
    }

    const overflowing =
      snapshot.coffee.cupVolume >= COFFEE.cupCapacity - 0.002 &&
      snapshot.coffee.overflowVolume > 0;
    const partial = capture > 0.02 && capture < 0.98;
    const runoffVisible = Boolean(cup) && (partial || (overflowing && capture > 0.9));
    const runoffFraction = partial
      ? Math.max(0, 1 - capture)
      : overflowing
        ? 0.65
        : 0;

    const targetLength = Math.max(ANCHORS.coffeeExit.y - landingY, 0.012);
    const lengthFollow = 1 - Math.exp(-dt * 18);
    visualState.primaryLength += (targetLength - visualState.primaryLength) * lengthFollow;

    const mainGirth = partial ? Math.max(0.12, Math.sqrt(capture)) : 1;
    const fade = Math.pow(1 - visualState.detach, 1.4);
    primaryUniforms.uLength.value = visualState.primaryLength * visualState.grow;
    primaryUniforms.uDetach.value = visualState.detach;
    primaryUniforms.uGirth.value =
      (pouring ? Math.max(visualState.grow, 0.25) : Math.max(0.18, 1 - visualState.detach)) *
      mainGirth;
    primaryUniforms.uTime.value = state.clock.elapsedTime;
    primaryUniforms.uOpacity.value = pouring ? 1 : fade;
    primary.position.set(ANCHORS.coffeeExit.x, ANCHORS.coffeeExit.y, ANCHORS.coffeeExit.z);

    runoff.visible = visible && runoffVisible;
    if (!runoff.visible) return;

    // The missed fraction runs over the near rim and falls to the grille. It
    // starts at the rim, not at the nozzle, so it does not read as a second
    // nozzle; it is the consequence of coffee striking the rim.
    const dx = ANCHORS.coffeeExit.x - cupX;
    const dz = ANCHORS.coffeeExit.z - cupZ;
    const distance = Math.hypot(dx, dz) || 1;
    const outwardX = dx / distance;
    const outwardZ = dz / distance;
    const rimOffset = CUP.outerRadius * 0.82;
    const startY = Math.max(rimY, GRILLE_TOP + 0.012);
    const runoffTarget = Math.max(startY - GRILLE_TOP, 0.012);
    visualState.runoffLength += (runoffTarget - visualState.runoffLength) * lengthFollow;

    runoff.position.set(
      cupX + outwardX * rimOffset,
      startY,
      cupZ + outwardZ * rimOffset,
    );
    runoffUniforms.uLength.value = visualState.runoffLength * visualState.grow;
    runoffUniforms.uDetach.value = visualState.detach;
    runoffUniforms.uGirth.value =
      Math.max(0.1, Math.sqrt(Math.max(runoffFraction, 0.04))) *
      (pouring ? Math.max(visualState.grow, 0.25) : Math.max(0.18, 1 - visualState.detach));
    runoffUniforms.uTime.value = state.clock.elapsedTime;
    runoffUniforms.uOpacity.value = (pouring ? 1 : fade) * 0.85;
  });

  return (
    <>
      <mesh
        ref={primaryRef}
        geometry={geometry}
        material={primaryMaterial}
        name="CoffeeStream"
        position={[ANCHORS.coffeeExit.x, ANCHORS.coffeeExit.y, ANCHORS.coffeeExit.z]}
        visible={false}
        frustumCulled={false}
        renderOrder={3}
      />
      <mesh
        ref={runoffRef}
        geometry={geometry}
        material={runoffMaterial}
        name="CoffeeRunoff"
        visible={false}
        frustumCulled={false}
        renderOrder={3}
      />
    </>
  );
}

const cupWorld = new THREE.Vector3();
