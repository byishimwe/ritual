import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useState } from 'react';
import * as THREE from 'three';
import { CAMERA } from '../config/asset';
import { ExperienceRuntime } from '../runtime/ExperienceRuntime';
import { detectQuality } from '../runtime/qualityManager';
import { CameraRig } from './CameraRig';
import { RitualScene } from './RitualScene';
import { SceneInput } from './SceneInput';
import { ServicesProvider, useServicesValue } from './services';
import { StudioLighting } from './StudioLighting';
import { StudioStage } from './StudioStage';

/**
 * Canvas host.
 *
 * The whole experience is one WebGL surface: no navigation, no panels, no
 * overlays. The only HTML that ever appears over it is the loading state and a
 * fatal-error recovery card.
 */
export function ExperienceCanvas() {
  const quality = useMemo(() => detectQuality(), []);
  const services = useServicesValue(quality.reducedMotion);
  const [gestureActive, setGestureActive] = useState(false);

  return (
    <Canvas
      className="ritual-canvas"
      shadows={quality.shadows}
      dpr={quality.dpr}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{
        fov: CAMERA.fov,
        near: 0.05,
        far: 24,
        position: [0.6, 0.53, 1.06],
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.96;
        scene.background = new THREE.Color('#3e3c38');
      }}
    >
      <ServicesProvider value={services}>
        <StudioStage />
        <StudioLighting quality={quality.tier} />
        <CameraRig suspended={gestureActive} />
        <SceneInput onGestureChange={setGestureActive} />
        <Suspense fallback={null}>
          <RitualScene />
        </Suspense>
        <ExperienceRuntime />
      </ServicesProvider>
    </Canvas>
  );
}
