import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { RitualModel } from '../assets/ritualModel';
import { BEAN_PROP } from '../config/asset';
import { BEAN_MOTION } from '../config/experience';
import { engine } from '../state/experienceStore';
import { createSoftShadowMaterial } from './liquidGeometry';
import { attachHitProxy, cylinderProxy } from './proxies';
import { useInteractiveTarget, useRigSlot, useServices } from './services';

const BEAN_SCALE = 0.1;
const GRAVITY = 9.81;
const shadowGeometry = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

interface FallingBean {
  active: boolean;
  delay: number;
  origin: THREE.Vector3;
  velocity: THREE.Vector3;
  spin: THREE.Vector3;
  rotation: THREE.Euler;
}

function seededRandom(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

/**
 * The bean supply: a glass jar of roasted beans built at runtime, because the
 * authored model has no movable container (RITUAL-02 §6 permits a runtime prop).
 * The visitor lifts it, carries it over the open hopper and tips it; the beans
 * that fall are the ones that later appear inside the hopper.
 */
export function BeanSupply({ model }: { model: RitualModel }) {
  const services = useServices();
  const [jar, setJar] = useState<THREE.Group | null>(null);
  const beanStoreRef = useRef<THREE.InstancedMesh>(null);
  const fallingRef = useRef<THREE.InstancedMesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const lastGeneration = useRef(engine.getState().session.generation);

  const beanGeometry = useMemo(() => {
    if (model.beanGeometry) {
      const geometry = model.beanGeometry.clone();
      geometry.center();
      geometry.computeVertexNormals();
      return geometry;
    }
    // Fallback keeps the prop readable even if the pile could not be merged.
    return new THREE.SphereGeometry(0.05, 10, 8).scale(1.6, 1, 1);
  }, [model.beanGeometry]);

  const beanMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#44291b'),
        roughness: 0.5,
        metalness: 0,
      }),
    [],
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#cfd6d8'),
        roughness: 0.06,
        metalness: 0,
        transparent: true,
        opacity: 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        envMapIntensity: 1.4,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  );

  const metalMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#b7b9b7'),
        roughness: 0.34,
        metalness: 1,
        envMapIntensity: 1.2,
      }),
    [],
  );

  const shadowMaterial = useMemo(() => createSoftShadowMaterial(0.45), []);

  const geometry = useMemo(
    () => ({
      wall: new THREE.CylinderGeometry(
        BEAN_PROP.bodyRadius,
        BEAN_PROP.bodyRadius * 0.96,
        BEAN_PROP.bodyHeight,
        40,
        1,
        true,
      ),
      floor: new THREE.CircleGeometry(BEAN_PROP.bodyRadius * 0.955, 40).rotateX(-Math.PI / 2),
      baseRing: new THREE.TorusGeometry(BEAN_PROP.bodyRadius * 0.985, 0.0026, 8, 40).rotateX(Math.PI / 2),
      rim: new THREE.TorusGeometry(BEAN_PROP.bodyRadius, 0.0022, 8, 40).rotateX(Math.PI / 2),
    }),
    [],
  );

  const falling = useMemo<FallingBean[]>(
    () =>
      Array.from({ length: BEAN_MOTION.fallingBeans }, () => ({
        active: false,
        delay: 0,
        origin: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        spin: new THREE.Vector3(),
        rotation: new THREE.Euler(),
      })),
    [],
  );

  const hitProxy = useMemo(
    () =>
      jar
        ? attachHitProxy(
            jar,
            'beanSupply',
            () => cylinderProxy(BEAN_PROP.bodyRadius * 1.3, 0.09, 12),
            new THREE.Vector3(0, 0.045, 0),
          )
        : undefined,
    [jar],
  );

  useRigSlot('jar', jar ?? undefined);
  useInteractiveTarget('beanSupply', hitProxy);

  useEffect(() => {
    if (!jar) return;
    jar.position.set(BEAN_PROP.rest.x, 0, BEAN_PROP.rest.z);
  }, [jar]);

  useEffect(() => {
    return () => {
      for (const item of Object.values(geometry)) item.dispose();
      beanGeometry.dispose();
      beanMaterial.dispose();
      glassMaterial.dispose();
      metalMaterial.dispose();
      shadowMaterial.userData.dispose?.();
    };
  }, [geometry, beanGeometry, beanMaterial, glassMaterial, metalMaterial, shadowMaterial]);

  /** Packs the jar's interior with beans. */
  useEffect(() => {
    const mesh = beanStoreRef.current;
    if (!mesh) return;
    const random = seededRandom(97);
    const dummy = new THREE.Object3D();
    const inner = BEAN_PROP.bodyRadius * 0.62;
    for (let i = 0; i < mesh.count; i += 1) {
      const radius = Math.sqrt(random()) * inner;
      const angle = random() * Math.PI * 2;
      dummy.position.set(
        Math.cos(angle) * radius,
        0.012 + random() * 0.03,
        Math.sin(angle) * radius,
      );
      dummy.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
      dummy.scale.setScalar(BEAN_SCALE * (0.85 + random() * 0.3));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  const triggerFall = useCallback(() => {
    const mesh = fallingRef.current;
    if (!jar || !mesh) return;
    const mouth = jar.localToWorld(new THREE.Vector3(0, BEAN_PROP.mouthHeight, 0));
    const random = seededRandom(Math.floor(Math.random() * 100000) + 7);
    falling.forEach((bean, index) => {
      bean.active = true;
      bean.delay = index * 0.014 + random() * 0.03;
      bean.origin
        .copy(mouth)
        .add(
          new THREE.Vector3(
            (random() - 0.5) * 0.03,
            (random() - 0.5) * 0.006,
            (random() - 0.5) * 0.03,
          ),
        );
      // Release velocity is small: the container is tipped, not thrown.
      bean.velocity.set((random() - 0.5) * 0.22, 0.05 + random() * 0.1, 0.12 + random() * 0.18);
      bean.spin.set((random() - 0.5) * 9, (random() - 0.5) * 9, (random() - 0.5) * 9);
      bean.rotation.set(random() * 3, random() * 3, random() * 3);
    });
    mesh.visible = true;
  }, [falling, jar]);

  useRigSlot('triggerBeanFall', triggerFall);

  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);
    const snapshot = engine.getState();

    // A reset discards every pending transfer; no bean may keep falling into
    // the previous session (RITUAL-03 §22.2, RITUAL-06 G08).
    if (snapshot.session.generation !== lastGeneration.current) {
      lastGeneration.current = snapshot.session.generation;
      for (const bean of falling) bean.active = false;
      if (fallingRef.current) fallingRef.current.visible = false;
    }

    if (jar) {
      // While the transfer timeline owns the container, the frame loop leaves it
      // alone: one author per transform at any moment.
      const transferring = snapshot.beanSupply === 'TRANSFERRING';
      if (!transferring) {
        const dragging = snapshot.beanSupply === 'DRAGGING';
        const targetX = dragging ? services.jarTarget.x : BEAN_PROP.rest.x;
        const targetZ = dragging ? services.jarTarget.z : BEAN_PROP.rest.z;
        const targetY = dragging ? BEAN_PROP.carryY : 0;
        const follow = 1 - Math.exp(-dt * (dragging ? 26 : 9));
        jar.position.x += (targetX - jar.position.x) * follow;
        jar.position.z += (targetZ - jar.position.z) * follow;
        jar.position.y += (targetY - jar.position.y) * follow;
        jar.rotation.x += (0 - jar.rotation.x) * (1 - Math.exp(-dt * 10));
      }

      const empty = snapshot.beanSupply === 'LOADED';
      if (beanStoreRef.current) beanStoreRef.current.visible = !empty;

      if (shadowRef.current) {
        shadowRef.current.position.set(jar.position.x, 0.0009, jar.position.z);
        shadowRef.current.scale.setScalar(0.13 * (1 + jar.position.y * 0.7));
        const material = shadowRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = Math.max(0.08, 0.6 - jar.position.y * 0.9);
      }
    }

    // --- Falling beans -----------------------------------------------------
    const mesh = fallingRef.current;
    if (mesh) {
      let any = false;
      const dummy = new THREE.Object3D();
      falling.forEach((bean, index) => {
        if (!bean.active) return;
        bean.delay -= dt;
        if (bean.delay > 0) {
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
          any = true;
          return;
        }
        bean.velocity.y -= GRAVITY * dt;
        bean.origin.addScaledVector(bean.velocity, dt);
        bean.rotation.x += bean.spin.x * dt;
        bean.rotation.y += bean.spin.y * dt;
        bean.rotation.z += bean.spin.z * dt;
        any = true;

        if (bean.origin.y < 0.365) {
          bean.active = false;
          dummy.scale.setScalar(0);
        } else {
          dummy.position.copy(bean.origin);
          dummy.rotation.copy(bean.rotation);
          dummy.scale.setScalar(BEAN_SCALE);
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (!any) mesh.visible = false;
    }
  });

  return (
    <group name="BeanSupplyActor">
      <group ref={setJar} name="BeanJar">
        <mesh geometry={geometry.wall} material={glassMaterial} renderOrder={2} />
        <mesh geometry={geometry.floor} material={glassMaterial} position={[0, 0.001, 0]} />
        <mesh geometry={geometry.baseRing} material={metalMaterial} position={[0, 0.004, 0]} />
        <mesh geometry={geometry.rim} material={metalMaterial} position={[0, BEAN_PROP.bodyHeight, 0]} />
        <instancedMesh
          ref={beanStoreRef}
          args={[beanGeometry, beanMaterial, 34]}
          castShadow
          frustumCulled={false}
        />
      </group>

      <instancedMesh
        ref={fallingRef}
        args={[beanGeometry, beanMaterial, BEAN_MOTION.fallingBeans]}
        visible={false}
        frustumCulled={false}
      />

      <mesh ref={shadowRef} geometry={shadowGeometry} material={shadowMaterial} renderOrder={1} />
    </group>
  );
}
