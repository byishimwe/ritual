import * as THREE from 'three';

/**
 * The coffee body inside the cup.
 *
 * The vessel tapers (interior radius 22.8 mm at the floor, 39 mm at the fill
 * line), so the liquid is a frustum whose top radius must be recomputed as it
 * rises. The ring buffer is updated in place rather than rebuilt, so a full
 * pour allocates nothing (RITUAL-04 §14.6, RITUAL-05 §23).
 */

export interface LiquidBody {
  geometry: THREE.BufferGeometry;
  update: (radiusBottom: number, radiusTop: number, height: number) => void;
  dispose: () => void;
}

export function createLiquidBody(segments = 56): LiquidBody {
  const ringCount = 2;
  const vertexCount = segments * ringCount + 2;
  const positions = new Float32Array(vertexCount * 3);
  const geometry = new THREE.BufferGeometry();

  const indices: number[] = [];
  for (let i = 0; i < segments; i += 1) {
    const next = (i + 1) % segments;
    const lower = i;
    const lowerNext = next;
    const upper = segments + i;
    const upperNext = segments + next;
    indices.push(lower, upper, upperNext, lower, upperNext, lowerNext);
  }

  // Bottom centre cap so the column never appears hollow from a low angle.
  const bottomCentre = segments * ringCount;
  for (let i = 0; i < segments; i += 1) {
    indices.push(bottomCentre, (i + 1) % segments, i);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);

  const update = (radiusBottom: number, radiusTop: number, height: number) => {
    const array = geometry.getAttribute('position') as THREE.BufferAttribute;
    const data = array.array as Float32Array;
    for (let i = 0; i < segments; i += 1) {
      const angle = (i / segments) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const lowerIndex = i * 3;
      data[lowerIndex] = cos * radiusBottom;
      data[lowerIndex + 1] = 0;
      data[lowerIndex + 2] = sin * radiusBottom;

      const upperIndex = (segments + i) * 3;
      data[upperIndex] = cos * radiusTop;
      data[upperIndex + 1] = height;
      data[upperIndex + 2] = sin * radiusTop;
    }
    const centreIndex = bottomCentre * 3;
    data[centreIndex] = 0;
    data[centreIndex + 1] = 0;
    data[centreIndex + 2] = 0;

    array.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  };

  update(0.02, 0.03, 0.01);

  return {
    geometry,
    update,
    dispose: () => geometry.dispose(),
  };
}

export interface RippleUniforms {
  uTime: { value: number };
  uAmplitude: { value: number };
}

/**
 * Adds a slow, low-amplitude surface ripple to a physical material. The
 * analytic derivative also perturbs the normal, so the specular highlight
 * moves with the surface instead of sliding across a flat disc.
 */
export function applySurfaceRipples(
  material: THREE.MeshPhysicalMaterial,
  uniforms: RippleUniforms,
): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uAmplitude = uniforms.uAmplitude;

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform float uTime;
         uniform float uAmplitude;
         float ritualWave(vec2 p) {
           return sin(p.x * 9.0 + uTime * 1.7) * cos(p.y * 11.0 - uTime * 1.3)
                + 0.5 * sin((p.x + p.y) * 6.0 - uTime * 0.9);
         }`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>
         {
           float slopeX = 9.0 * cos(position.x * 9.0 + uTime * 1.7) * cos(position.z * 11.0 - uTime * 1.3)
                        + 3.0 * cos((position.x + position.z) * 6.0 - uTime * 0.9);
           float slopeZ = -11.0 * sin(position.x * 9.0 + uTime * 1.7) * sin(position.z * 11.0 - uTime * 1.3)
                        + 3.0 * cos((position.x + position.z) * 6.0 - uTime * 0.9);
           objectNormal.x -= slopeX * uAmplitude * 0.55;
           objectNormal.z -= slopeZ * uAmplitude * 0.55;
         }`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
         transformed.y += ritualWave(position.xz) * uAmplitude;`,
      );
  };
  material.needsUpdate = true;
}

/** Pre-rendered soft shadow ellipse for props that move. */
export function createSoftShadowMaterial(opacity = 0.4): THREE.MeshBasicMaterial {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(0,0,0,${opacity})`);
    gradient.addColorStop(0.5, `rgba(0,0,0,${opacity * 0.45})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  material.userData.dispose = () => {
    texture.dispose();
    material.dispose();
  };
  return material;
}
