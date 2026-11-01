import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ANCHORS, CUP, STREAM } from '../config/asset';
import { MOTION } from '../config/experience';
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
  }
`;

/**
 * The pour.
 *
 * A single vertical column from the measured nozzle to whatever it actually
 * lands on — the liquid surface inside the cup when any of the stream is
 * captured, otherwise the grille. It never bends sideways: capture is a
 * geometric fact, not a visual convenience (RITUAL-04 §13).
 */
export function LiquidStream() {
  const services = useServices();
  const uniforms = useMemo(
    () => ({
      uLength: { value: 0.1 },
      uGirth: { value: 1 },
      uDetach: { value: 0 },
      uTime: { value: 0 },
      uRadiusTop: { value: STREAM.radiusTop },
      uRadiusBottom: { value: STREAM.radiusBottom },
      uColor: { value: new THREE.Color('#24120b') },
      uOpacity: { value: 1 },
    }),
    [],
  );

  const geometry = useMemo(() => {
    const cylinder = new THREE.CylinderGeometry(1, 1, 1, 14, 26, true);
    cylinder.computeVertexNormals();
    return cylinder;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
      }),
    [uniforms],
  );

  const meshRef = useRef<THREE.Mesh>(null);
  const stateRef = useRef({ active: false, grow: 0, detach: 0, length: 0.1 });

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const snapshot = engine.getState();
    const mesh = meshRef.current;
    if (!mesh) return;

    const pouring = snapshot.machine === 'POURING';
    const visual = stateRef.current;

    if (pouring) {
      visual.active = true;
      visual.detach = 0;
      visual.grow = Math.min(1, visual.grow + dt / MOTION.streamIn);
    } else if (visual.active) {
      visual.grow = Math.max(0, visual.grow - dt / MOTION.streamIn);
      visual.detach = Math.min(1, visual.detach + dt / MOTION.streamOut);
      if (visual.detach >= 1) {
        visual.active = false;
        visual.grow = 0;
      }
    }

    mesh.visible = visual.active && (visual.grow > 0.01 || visual.detach < 0.99);
    if (!mesh.visible) return;

    // Where the coffee actually arrives, evaluated from the cup's committed
    // position — not from where it was when the droplet left the nozzle.
    const capture = captureFractionAt(snapshot.cup.position, ANCHORS.coffeeExit);
    const cup = services.rig.cup;
    let landingY = GRILLE_TOP;
    if (capture > 0.02 && cup) {
      cup.getWorldPosition(cupWorld);
      const heightFraction = volumeFractionToHeightFraction(snapshot.coffee.cupVolume);
      landingY = cupWorld.y + CUP.localFloorY + heightFraction * CUP_INTERIOR_HEIGHT;
      landingY = Math.min(landingY, cupWorld.y + CUP.localRimY - 0.001);
    }

    const targetLength = Math.max(ANCHORS.coffeeExit.y - landingY, 0.012);
    const lengthFollow = 1 - Math.exp(-dt * 18);
    visual.length += (targetLength - visual.length) * lengthFollow;

    uniforms.uLength.value = visual.length * visual.grow;
    uniforms.uDetach.value = visual.detach;
    uniforms.uGirth.value = pouring ? Math.max(visual.grow, 0.25) : Math.max(0.18, 1 - visual.detach);
    uniforms.uTime.value = state.clock.elapsedTime;

    mesh.position.set(ANCHORS.coffeeExit.x, ANCHORS.coffeeExit.y, ANCHORS.coffeeExit.z);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      name="CoffeeStream"
      position={[ANCHORS.coffeeExit.x, ANCHORS.coffeeExit.y, ANCHORS.coffeeExit.z]}
      visible={false}
      frustumCulled={false}
      renderOrder={3}
    />
  );
}

const cupWorld = new THREE.Vector3();
