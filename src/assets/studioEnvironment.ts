import * as THREE from 'three';

/**
 * Procedural product-photography environment (RITUAL-04 §6.6).
 *
 * A small scene of large emissive panels is rendered once into a PMREM. This
 * gives satin metal broad, stable reflection bands and gives the charcoal
 * housing a readable edge — without shipping an HDR file or reaching the
 * network, which an exhibition machine may not have.
 */

const PANELS: Array<{
  size: [number, number];
  position: [number, number, number];
  look: [number, number, number];
  color: string;
  intensity: number;
}> = [
  // Large overhead key softbox, slightly front-left.
  { size: [7, 4.5], position: [-2.6, 5.4, 3.2], look: [0, 0.3, 0], color: '#fff4e6', intensity: 9 },
  // Cooler, weaker fill panel on the right.
  { size: [6, 5], position: [4.6, 2.4, 2.2], look: [0, 0.2, 0], color: '#e8f0ff', intensity: 3.2 },
  // Narrow rear rim strip for edge separation.
  { size: [2.2, 6], position: [1.4, 2.8, -4.6], look: [0, 0.3, 0], color: '#fff1e2', intensity: 5.5 },
  // Very soft bounce from the counter side.
  { size: [8, 3], position: [0, -1.4, 1.5], look: [0, 0.4, 0], color: '#6b6459', intensity: 0.9 },
];

export interface StudioEnvironment {
  texture: THREE.Texture;
  dispose: () => void;
}

export function createStudioEnvironment(renderer: THREE.WebGLRenderer): StudioEnvironment {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#1a1815');

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.MeshBasicMaterial[] = [];
  const lookAt = new THREE.Vector3();

  for (const panel of PANELS) {
    const geometry = new THREE.PlaneGeometry(panel.size[0], panel.size[1]);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(panel.color).multiplyScalar(panel.intensity),
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...panel.position);
    lookAt.set(...panel.look);
    mesh.lookAt(lookAt);
    scene.add(mesh);
    geometries.push(geometry);
    materials.push(material);
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const target = pmrem.fromScene(scene, 0.02, 0.1, 100);
  pmrem.dispose();

  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();

  return {
    texture: target.texture,
    dispose: () => {
      target.dispose();
    },
  };
}
