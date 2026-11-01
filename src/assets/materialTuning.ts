import * as THREE from 'three';
import { ASSET } from '../config/asset';

/**
 * Final runtime material calibration (RITUAL-04 §5).
 *
 * The authored Blender materials are preserved — only their calibrated surface
 * response is adjusted, because the GLB ships a handful of them at values that
 * read as flat plastic under the studio rig (notably the housing at roughness
 * 0.68 and the glass at 0.4 constant alpha).
 */

const tuned = new WeakSet<THREE.Material>();

interface Tune {
  color?: string;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
}

const TUNING: Record<string, Tune> = {
  [ASSET.materials.charcoalBody]: {
    color: '#252729',
    roughness: 0.55,
    metalness: 0.0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.5,
  },
  [ASSET.materials.charcoalMetal]: {
    color: '#17191a',
    roughness: 0.44,
    metalness: 0.72,
  },
  [ASSET.materials.darkTrim]: {
    color: '#17191a',
    roughness: 0.32,
    metalness: 0.8,
  },
  [ASSET.materials.satinMetal]: {
    color: '#b7b9b7',
    roughness: 0.38,
    metalness: 1.0,
  },
  [ASSET.materials.goldAccent]: {
    roughness: 0.24,
    metalness: 1.0,
  },
  [ASSET.materials.ceramic]: {
    color: '#f1ebdf',
    roughness: 0.17,
    metalness: 0.0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.14,
  },
  [ASSET.materials.beans]: {
    color: '#44291b',
    roughness: 0.48,
    metalness: 0.0,
  },
  [ASSET.materials.spout]: {
    color: '#b7b9b7',
    roughness: 0.22,
    metalness: 1.0,
  },
  [ASSET.materials.hopperGlass]: {
    color: '#8d9297',
    roughness: 0.09,
    metalness: 0.0,
  },
  [ASSET.materials.buttonCap]: {
    roughness: 0.42,
    metalness: 0.05,
  },
};

function apply(material: THREE.Material): void {
  if (tuned.has(material)) return;
  tuned.add(material);

  const tune = TUNING[material.name];
  if (!tune) return;

  const standard = material as THREE.MeshPhysicalMaterial;
  if (tune.color !== undefined && standard.color) standard.color.set(tune.color);
  if (tune.roughness !== undefined) standard.roughness = tune.roughness;
  if (tune.metalness !== undefined && 'metalness' in standard) {
    standard.metalness = tune.metalness;
  }
  if (tune.clearcoat !== undefined && 'clearcoat' in standard) {
    standard.clearcoat = tune.clearcoat;
  }
  if (tune.clearcoatRoughness !== undefined && 'clearcoatRoughness' in standard) {
    standard.clearcoatRoughness = tune.clearcoatRoughness;
  }

  if (material.name === ASSET.materials.hopperGlass) {
    // Clear enough to read the beans, present enough to read the vessel.
    standard.transparent = true;
    standard.opacity = 0.34;
    standard.depthWrite = false;
    standard.envMapIntensity = 1.35;
    standard.side = THREE.FrontSide;
    if ('transmission' in standard) standard.transmission = 0.55;
    if ('thickness' in standard) standard.thickness = 0.004;
    if ('ior' in standard) standard.ior = 1.46;
  }

  if (material.name === ASSET.materials.goldAccent) {
    // Authored with a strong orange emissive; keep the accent, drop the glow.
    standard.emissive?.set('#8a4a10');
    standard.emissiveIntensity = 0.12;
  }

  if (material.name === ASSET.materials.ceramic) {
    standard.envMapIntensity = 1.0;
  }

  if (material.name === ASSET.materials.charcoalBody) {
    // The authored normal map is a high-frequency stone speckle. At 40 cm in
    // frame it reads as sparkling noise across what should be a calm,
    // semi-matte appliance finish, so the calibrated surface keeps no bump.
    standard.normalMap = null;
    standard.normalScale = new THREE.Vector2(0, 0);
    standard.envMapIntensity = 1.15;
  }

  standard.needsUpdate = true;
}

/** Applies the calibrated material pass once per shared material instance. */
export function tuneRitualMaterials(root: THREE.Object3D): void {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) if (material) apply(material);
  });
}

/** Height-based tint variation so 180 identical beans do not read as a solid. */
export function varyBeanPile(root: THREE.Object3D): void {
  let index = 0;
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const source = mesh.material as THREE.MeshStandardMaterial | undefined;
    if (!source) return;
    // Each baked bean keeps its own instance so tone variation is stable.
    const clone = source.clone();
    const variation = ((index * 37) % 11) / 11 - 0.5;
    clone.color = source.color.clone().offsetHSL(variation * 0.012, 0, variation * 0.045);
    clone.roughness = THREE.MathUtils.clamp(source.roughness + variation * 0.16, 0.3, 0.75);
    mesh.material = clone;
    mesh.rotation.y += index * 0.7;
    index += 1;
  });
}
