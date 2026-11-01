import * as THREE from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import { ASSET, CUP_RAW, MODEL_SCALE } from '../config/asset';
import { SPATIAL } from '../config/experience';
import { tuneRitualMaterials } from './materialTuning';

/**
 * Runtime adapter between the authored Blender export and the semantic contract
 * the application needs (RITUAL-02 §7, RITUAL-05 §6).
 *
 * The GLB bakes almost every part into world-space vertex data with identity
 * node transforms. Two parts are the exception and carry their own transform:
 * `HopperLid` (whose origin *is* the rear hinge) and `coffeeBeans` (the pile's
 * parent transform). Both are preserved exactly, which is why the lid can be
 * animated by rotating that node about its local X axis.
 */

export interface RitualModel {
  /** Scaled machine wrapper: positioned in metres, children authored in raw units. */
  machineRoot: THREE.Group;
  /** Cup wrapper in metres; origin at the vessel's axis on its base plane. */
  cupRoot: THREE.Group;
  cupObject: THREE.Object3D;
  lid: THREE.Object3D;
  hopper: THREE.Object3D;
  spout: THREE.Object3D;
  beanPile: THREE.Object3D;
  buttons: Record<'power' | 'make' | 'pour', THREE.Object3D>;
  /** One bean in pile-local units, for instanced effects. */
  beanGeometry: THREE.BufferGeometry | null;
  beanMaterial: THREE.Material | null;
  /** Raw-unit press travel converted from the calibrated world distance. */
  buttonTravelRaw: number;
  report: AssetReport;
}

export interface AssetReport {
  ok: boolean;
  missing: string[];
  notes: string[];
  machineHeight: number;
  cupDiameter: number;
}

const cache = new WeakMap<THREE.Object3D, RitualModel>();

function byName(root: THREE.Object3D, name: string): THREE.Object3D | null {
  return root.getObjectByName(name) ?? null;
}

interface ConsolidatedPile {
  merged: THREE.Mesh | null;
  sample: THREE.BufferGeometry | null;
  material: THREE.Material | null;
}

/**
 * Collapses the 180 baked bean meshes into one geometry with per-bean vertex
 * tinting. This drops ~180 draw calls, which matters because the pile is
 * visible for most of the session (RITUAL-04 §5.5, RITUAL-06 performance).
 */
function consolidateBeanPile(pile: THREE.Object3D): ConsolidatedPile {
  const meshes: THREE.Mesh[] = [];
  pile.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
  });
  if (meshes.length === 0) return { merged: null, sample: null, material: null };

  const pileInverse = new THREE.Matrix4().copy(pile.matrixWorld).invert();
  const geometries: THREE.BufferGeometry[] = [];
  let sample: THREE.BufferGeometry | null = null;

  meshes.forEach((mesh, index) => {
    const geometry = mesh.geometry.clone();
    const matrix = new THREE.Matrix4().multiplyMatrices(pileInverse, mesh.matrixWorld);
    geometry.applyMatrix4(matrix);
    if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();

    // Three warm brown registers with small deterministic offsets: enough
    // variation that the pile reads as individual beans, never as one mass.
    const tone = [0.86, 1.0, 1.12][index % 3] * (0.94 + ((index * 29) % 13) / 220);
    const count = geometry.getAttribute('position').count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      colors[i * 3] = tone;
      colors[i * 3 + 1] = tone;
      colors[i * 3 + 2] = tone;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    if (!sample) sample = geometry.clone();
    geometries.push(geometry);
  });

  const material = new THREE.MeshStandardMaterial({
    name: 'mCoffeeBeansMerged',
    color: new THREE.Color('#44291b'),
    roughness: 0.5,
    metalness: 0,
    vertexColors: true,
  });

  const mergedGeometry = mergeBufferGeometries(geometries, false);
  for (const geometry of geometries) geometry.dispose();

  if (!mergedGeometry) {
    // Merging is a performance optimisation, never a correctness requirement.
    return { merged: null, sample, material };
  }

  const merged = new THREE.Mesh(mergedGeometry, material);
  merged.name = 'coffeeBeansMerged';
  merged.castShadow = true;
  merged.receiveShadow = true;
  merged.frustumCulled = false;
  pile.clear();
  pile.add(merged);

  return { merged, sample, material };
}

export function buildRitualModel(source: THREE.Object3D): RitualModel {
  const cached = cache.get(source);
  if (cached) return cached;

  source.updateMatrixWorld(true);

  const body = byName(source, ASSET.nodes.body);
  const lid = byName(source, ASSET.nodes.lid);
  const hopper = byName(source, ASSET.nodes.hopper);
  const spout = byName(source, ASSET.nodes.spout);
  const cup = byName(source, ASSET.nodes.cup);
  const power = byName(source, ASSET.nodes.power);
  const make = byName(source, ASSET.nodes.make);
  const pour = byName(source, ASSET.nodes.pour);
  const pile = byName(source, ASSET.nodes.beanPile);

  const required = [
    ['body', body],
    ['HopperLid', lid],
    ['Hopper', hopper],
    ['coffeeSpout', spout],
    ['coffeeCup', cup],
    ['btnPower', power],
    ['btnMake', make],
    ['btnPour', pour],
    ['coffeeBeans', pile],
  ] as const;

  const missing = required.filter(([, node]) => !node).map(([name]) => name);
  const notes: string[] = [];

  // --- Machine wrapper: one scale + one offset adapts the authored units. ---
  const machineRoot = new THREE.Group();
  machineRoot.name = 'RitualMachine';
  machineRoot.scale.setScalar(MODEL_SCALE);
  machineRoot.position.set(
    ASSET.offset.x * MODEL_SCALE,
    ASSET.offset.y * MODEL_SCALE,
    ASSET.offset.z * MODEL_SCALE,
  );

  for (const node of [body, lid, hopper, spout, power, make, pour, pile]) {
    if (node) machineRoot.add(node);
  }

  machineRoot.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // Baked vertices mean the loader's bounding sphere is already correct, but
    // disabling culling keeps the machine whole at the extreme orbit angles.
    mesh.frustumCulled = false;
  });

  tuneRitualMaterials(machineRoot);

  const pileResult = pile ? consolidateBeanPile(pile) : { merged: null, sample: null, material: null };
  if (pile) pile.visible = false;

  // --- Cup wrapper: recentre onto the vessel's axis and base plane. ---
  const cupRoot = new THREE.Group();
  cupRoot.name = 'RitualCup';
  const cupScale = new THREE.Group();
  cupScale.name = 'RitualCupScale';
  cupScale.scale.setScalar(MODEL_SCALE);
  if (cup) {
    cup.position.set(-CUP_RAW.axisX, -CUP_RAW.baseY, -CUP_RAW.axisZ);
    cup.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;
    });
    cupScale.add(cup);
    cupRoot.add(cupScale);
  }

  const machineBox = new THREE.Box3().setFromObject(machineRoot);
  const machineHeight = machineBox.max.y - machineBox.min.y;
  if (machineHeight < 0.3 || machineHeight > 0.5) {
    notes.push(
      `machine height ${machineHeight.toFixed(3)} m is outside the authored 0.30–0.50 m range`,
    );
  }

  if (Math.abs(machineBox.min.y) > 0.004) {
    notes.push(`machine base sits at y=${machineBox.min.y.toFixed(4)} instead of 0`);
  }

  const cupBox = new THREE.Box3().setFromObject(cupRoot);
  const cupDiameter = Math.max(cupBox.max.x - cupBox.min.x, cupBox.max.z - cupBox.min.z);
  if (cupDiameter < 0.07 || cupDiameter > 0.12) {
    notes.push(`cup diameter ${cupDiameter.toFixed(3)} m is outside the expected 0.07–0.12 m`);
  }

  const model: RitualModel = {
    machineRoot,
    cupRoot,
    cupObject: cup ?? new THREE.Object3D(),
    lid: lid ?? new THREE.Object3D(),
    hopper: hopper ?? new THREE.Object3D(),
    spout: spout ?? new THREE.Object3D(),
    beanPile: pile ?? new THREE.Object3D(),
    buttons: {
      power: power ?? new THREE.Object3D(),
      make: make ?? new THREE.Object3D(),
      pour: pour ?? new THREE.Object3D(),
    },
    beanGeometry: pileResult.sample,
    beanMaterial: pileResult.material,
    buttonTravelRaw: SPATIAL.buttonTravel / MODEL_SCALE,
    report: {
      ok: missing.length === 0,
      missing,
      notes,
      machineHeight,
      cupDiameter,
    },
  };

  cache.set(source, model);
  return model;
}

/** Broad machine focus used for framing when a named anchor is unavailable. */
export function machineFocusPoint(out = new THREE.Vector3()): THREE.Vector3 {
  return out.set(0, 0.2, 0.02);
}
