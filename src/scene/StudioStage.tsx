import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

export const BACKDROP_COLOR = '#3e3c38';

/** A very faint stone variation so the countertop is not a perfect void. */
function addSurfaceVariation(material: THREE.MeshStandardMaterial): void {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vStagePosition;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvStagePosition = (modelMatrix * vec4(position, 1.0)).xyz;',
      );

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vStagePosition;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
         float grain = sin(vStagePosition.x * 41.0) * cos(vStagePosition.z * 37.0);
         float broad = sin(vStagePosition.x * 7.0 + vStagePosition.z * 5.0);
         diffuseColor.rgb *= 1.0 + grain * 0.008 + broad * 0.014;`,
      );
  };
  material.needsUpdate = true;
}

/**
 * The studio space: a warm stone counter that dissolves into the backdrop.
 *
 * Fog matched to the background colour means the counter reads as an infinite
 * surface from every permitted orbit angle, with no visible edge or horizon
 * seam (RITUAL-04 §3, §5.8).
 */
export function StudioStage() {
  const scene = useThree((state) => state.scene);

  const floorMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#6d675e'),
      roughness: 0.9,
      metalness: 0.0,
      envMapIntensity: 0.35,
    });
    addSurfaceVariation(material);
    return material;
  }, []);

  useEffect(() => {
    const previousFog = scene.fog;
    const previousBackground = scene.background;
    scene.fog = new THREE.Fog(new THREE.Color(BACKDROP_COLOR), 2.1, 6.4);
    scene.background = new THREE.Color(BACKDROP_COLOR);
    return () => {
      scene.fog = previousFog;
      scene.background = previousBackground;
    };
  }, [scene]);

  return (
    <mesh
      name="StudioCounter"
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
      material={floorMaterial}
    >
      <circleGeometry args={[9, 96]} />
    </mesh>
  );
}
