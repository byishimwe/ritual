import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  AssetContractError,
  buildRitualModel,
} from '../../src/assets/ritualModel';

function mesh(
  name: string,
  size: [number, number, number],
  position: [number, number, number],
): THREE.Mesh {
  const object = new THREE.Mesh(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    new THREE.MeshBasicMaterial(),
  );
  object.name = name;
  object.position.set(...position);
  return object;
}

/**
 * Minimal raw-unit fixture with the same measured extents the real GLB has:
 * 3.42 m tall body before scale, 0.75 raw-unit cup, lid hinge at the rear.
 */
function makeSource(): THREE.Group {
  const root = new THREE.Group();

  root.add(mesh('body', [2.6, 3.5, 3.4], [0, 0.1092, 0]));
  root.add(mesh('HopperLid', [0.5, 0.08, 0.5], [0, 1.8425, -1.2964]));
  root.add(mesh('Hopper', [0.4, 0.4, 0.4], [0, 1.6, -0.06]));
  root.add(mesh('coffeeSpout', [0.1, 0.1, 0.1], [0, -0.26, 1.18]));
  root.add(mesh('coffeeCup', [0.75, 0.5, 0.75], [0, -0.8, 1.2739]));
  root.add(mesh('btnPower', [0.08, 0.08, 0.04], [0, 0.6417, 1.4304]));
  root.add(mesh('btnMake', [0.08, 0.08, 0.04], [-0.3, 0.6417, 1.4304]));
  root.add(mesh('btnPour', [0.08, 0.08, 0.04], [0.3, 0.6417, 1.4304]));

  const pile = new THREE.Group();
  pile.name = 'coffeeBeans';
  pile.position.set(0, 0.35, -0.06);
  pile.add(mesh('bean', [0.1, 0.06, 0.08], [0, 0, 0]));
  root.add(pile);

  return root;
}

function removeNode(source: THREE.Group, name: string): void {
  const node = source.getObjectByName(name);
  if (node) node.removeFromParent();
}

describe('asset contract validation', () => {
  it('accepts a complete, calibrated fixture', () => {
    const model = buildRitualModel(makeSource());
    expect(model.report.ok).toBe(true);
    expect(model.report.missing).toEqual([]);
    expect(model.report.invalid).toEqual([]);
    expect(model.report.machineHeight).toBeGreaterThan(0.3);
    expect(model.report.machineHeight).toBeLessThan(0.5);
    expect(model.report.cupDiameter).toBeGreaterThan(0.07);
    expect(model.report.cupDiameter).toBeLessThan(0.12);
  });

  it.each([
    'body',
    'HopperLid',
    'Hopper',
    'coffeeSpout',
    'coffeeCup',
    'btnPower',
    'btnMake',
    'btnPour',
    'coffeeBeans',
  ])('rejects a model missing required node %s', (name) => {
    const source = makeSource();
    removeNode(source, name);
    expect(() => buildRitualModel(source)).toThrowError(AssetContractError);
    try {
      buildRitualModel(source);
    } catch (error) {
      expect(error).toBeInstanceOf(AssetContractError);
      expect((error as AssetContractError).report.missing).toContain(name);
      expect((error as Error).message).toContain(name);
    }
  });

  it('rejects a required node with a non-finite transform', () => {
    const source = makeSource();
    const power = source.getObjectByName('btnPower');
    expect(power).toBeDefined();
    power!.position.x = Number.NaN;

    expect(() => buildRitualModel(source)).toThrowError(AssetContractError);
    try {
      buildRitualModel(source);
    } catch (error) {
      expect((error as AssetContractError).report.invalid).toContain('btnPower');
    }
  });

  it('rejects an implausible machine scale instead of rendering it', () => {
    const source = makeSource();
    const body = source.getObjectByName('body') as THREE.Mesh;
    body.geometry.dispose();
    body.geometry = new THREE.BoxGeometry(2.6, 1, 3.4);
    body.position.y = -1.1408;
    source.getObjectByName('HopperLid')!.position.y = 0.3;
    source.getObjectByName('Hopper')!.position.y = 0;
    source.getObjectByName('btnPower')!.position.y = 0;
    source.getObjectByName('btnMake')!.position.y = 0;
    source.getObjectByName('btnPour')!.position.y = 0;
    source.getObjectByName('coffeeBeans')!.position.y = 0;

    expect(() => buildRitualModel(source)).toThrowError(/machine height/);
  });

  it('rejects an implausible cup diameter', () => {
    const source = makeSource();
    const cup = source.getObjectByName('coffeeCup') as THREE.Mesh;
    cup.geometry.dispose();
    cup.geometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);

    expect(() => buildRitualModel(source)).toThrowError(/cup diameter/);
  });
});
