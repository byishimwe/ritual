import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { createStudioEnvironment } from '../assets/studioEnvironment';

/**
 * Studio rig (RITUAL-04 §6).
 *
 * Key from the front-left, cool fill from the right, restrained rim from behind.
 * The reflection environment is generated procedurally so the exhibition machine
 * needs no network access, and it stays stable while the visitor orbits.
 */
export function StudioLighting({ quality = 'high' }: { quality?: 'high' | 'medium' | 'low' }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  const environment = useMemo(() => createStudioEnvironment(gl), [gl]);

  useEffect(() => {
    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.6;
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      environment.dispose();
    };
  }, [scene, environment]);

  const shadowSize = quality === 'high' ? 2048 : quality === 'medium' ? 1024 : 512;

  return (
    <group name="StudioLighting">
      <hemisphereLight args={['#c9ced1', '#332c25', 0.26]} />

      {/* Key: large, soft, warm-neutral, front-left. */}
      <directionalLight
        position={[-1.05, 1.55, 1.15]}
        intensity={1.95}
        color="#fff2e3"
        castShadow={quality !== 'low'}
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-camera-near={0.1}
        shadow-camera-far={5}
        shadow-camera-left={-0.62}
        shadow-camera-right={0.62}
        shadow-camera-top={0.62}
        shadow-camera-bottom={-0.42}
        shadow-bias={-0.00035}
        shadow-normalBias={0.012}
        shadow-radius={4}
        target-position={[0, 0.18, 0]}
      />

      {/* Fill: cooler and much weaker, opposite the key. */}
      <directionalLight position={[1.5, 0.95, 0.85]} intensity={0.34} color="#dce6f5" />

      {/* Rim: defines the charcoal silhouette and the hopper glass edge. */}
      <directionalLight position={[0.75, 1.15, -1.5]} intensity={1.7} color="#ffe9d0" />

      {/* A soft bounce off the stone, so the machine's underside is never black. */}
      <directionalLight position={[0, -0.6, 0.9]} intensity={0.12} color="#c9b9a4" />
    </group>
  );
}
