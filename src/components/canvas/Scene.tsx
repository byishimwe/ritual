import { Suspense, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import { Lighting } from './Lighting';
import { StageEnvironment } from './StageEnvironment';
import { CoffeeMachine } from '../machine/CoffeeMachine';
import { CameraController } from '../../systems/camera/CameraController';
import { useCoffeeStore } from '../../systems/state/useCoffeeStore';
import { TIMING } from '../../config/experienceConfig';

export function Scene() {
  const reset = useCoffeeStore((s) => s.reset);
  const lastInteraction = useCoffeeStore((s) => s.lastInteraction);
  const experienceState = useCoffeeStore((s) => s.experienceState);
  const { gl, camera } = useThree();

  // Inactivity auto-reset
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (experienceState !== 'OFF' && Date.now() - lastInteraction > TIMING.inactivityReset) {
        reset();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [lastInteraction, experienceState, reset]);

  useEffect(() => {
    gl.shadowMap.enabled = true;
    // A slightly lifted exposure keeps the dark void from crushing the
    // machine's own highlights into pure black at this deliberately low
    // overall light level.
    gl.toneMappingExposure = 1.35;
  }, [gl]);

  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).__coffeeCamera = camera;
    }
  }, [camera]);

  return (
    <>
      <color attach="background" args={['#070708']} />
      <StageEnvironment />
      <Lighting />
      <Suspense fallback={null}>
        <CoffeeMachine />
      </Suspense>
      <CameraController />

      {/* Restrained post: only the brightest specular hits (steel, glass,
          gold trim) bloom, never the machine body itself; a light vignette
          keeps the eye on the object rather than the void edges. */}
      <EffectComposer multisampling={0}>
        {/* Focused on the machine's own footprint with a wide focus range,
            so every camera preset (default, hopper close-up, spout hero)
            keeps the whole machine, cup and coffee stream sharp — only the
            distant cove wall and void ever soften, the way a real product
            shot's background falls gently out of focus. */}
        <DepthOfField target={[0, 0.2, 0]} worldFocusRange={2.2} focalLength={0.01} bokehScale={2} />
        <Bloom
          mipmapBlur
          intensity={0.35}
          luminanceThreshold={0.86}
          luminanceSmoothing={0.2}
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.6} />
      </EffectComposer>
    </>
  );
}
