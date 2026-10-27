import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import gsap from 'gsap';
import type * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CAMERA_PRESETS, ORBIT_LIMITS, TIMING } from '../../config/experienceConfig';
import { useCoffeeStore } from '../state/useCoffeeStore';

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const experienceState = useCoffeeStore((s) => s.experienceState);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    let preset = CAMERA_PRESETS.DEFAULT_HERO;
    if (experienceState === 'POWER_ON' || experienceState === 'READY_TO_BREW') {
      preset = CAMERA_PRESETS.HOPPER_CLOSEUP;
    } else if (
      experienceState === 'READY_TO_POUR' ||
      experienceState === 'POURING_ACTIVE' ||
      experienceState === 'COMPLETE'
    ) {
      preset = CAMERA_PRESETS.SPOUT_HERO;
    } else if (experienceState === 'GRINDING' || experienceState === 'PAUSE' || experienceState === 'BREWING') {
      preset = CAMERA_PRESETS.DEFAULT_HERO;
    }

    const cam = camera as THREE.PerspectiveCamera;
    const targetObj = { ...controls.target };

    gsap.to(cam.position, {
      x: preset.position[0],
      y: preset.position[1],
      z: preset.position[2],
      duration: TIMING.cameraTransition,
      ease: 'power3.inOut',
    });
    gsap.to(targetObj, {
      x: preset.target[0],
      y: preset.target[1],
      z: preset.target[2],
      duration: TIMING.cameraTransition,
      ease: 'power3.inOut',
      onUpdate: () => {
        controls.target.set(targetObj.x, targetObj.y, targetObj.z);
      },
    });
    gsap.to(cam, {
      fov: preset.fov,
      duration: TIMING.cameraTransition,
      ease: 'power3.inOut',
      onUpdate: () => cam.updateProjectionMatrix(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experienceState]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      minAzimuthAngle={ORBIT_LIMITS.minAzimuth}
      maxAzimuthAngle={ORBIT_LIMITS.maxAzimuth}
      minPolarAngle={ORBIT_LIMITS.minPolar}
      maxPolarAngle={ORBIT_LIMITS.maxPolar}
      minDistance={ORBIT_LIMITS.minDistance}
      maxDistance={ORBIT_LIMITS.maxDistance}
      dampingFactor={ORBIT_LIMITS.dampingFactor}
      enableDamping
      // A slow idle drift while nothing is happening — the exhibit keeps
      // its own quiet motion instead of sitting dead still, and stops the
      // instant the visitor takes hold of it (OrbitControls' own drag
      // handling always wins over this each frame).
      autoRotate={experienceState === 'OFF'}
      autoRotateSpeed={0.35}
    />
  );
}
