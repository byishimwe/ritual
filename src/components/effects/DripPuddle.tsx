import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCoffeeStore } from '../../systems/state/useCoffeeStore';
import { MATERIAL_PARAMS } from '../../config/experienceConfig';

interface Props {
  spoutRef?: THREE.Object3D;
}

export function DripPuddle({ spoutRef }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0);
  const experienceState = useCoffeeStore((s) => s.experienceState);
  const cupAligned = useCoffeeStore((s) => s.cupAligned);
  const spoutWorld = useRef(new THREE.Vector3());
  const spoutLocal = useRef(new THREE.Vector3());

  useFrame((_state, delta) => {
    const mesh = meshRef.current;
    if (!mesh || !spoutRef || !mesh.parent) return;
    const missing = experienceState === 'POURING_ACTIVE' && !cupAligned;
    if (missing) {
      scaleRef.current = Math.min(scaleRef.current + delta * 0.15, 1);
    } else if (experienceState === 'OFF') {
      scaleRef.current = 0;
    }
    mesh.visible = scaleRef.current > 0.01;
    mesh.scale.setScalar(scaleRef.current);
    spoutRef.getWorldPosition(spoutWorld.current);
    mesh.parent.worldToLocal(spoutLocal.current.copy(spoutWorld.current));
    mesh.position.set(spoutLocal.current.x, 0.001, spoutLocal.current.z);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <circleGeometry args={[0.035, 24]} />
      <meshStandardMaterial color={MATERIAL_PARAMS.coffeeLiquid.color} roughness={0.2} transparent opacity={0.85} />
    </mesh>
  );
}
