import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { useCoffeeStore } from '../../systems/state/useCoffeeStore';

// Cinematic product-photography hierarchy: key sculpts form, rim separates
// the silhouette from the void, top defines upper surfaces, fill only
// preserves shadow detail without flattening the image. Intensities follow
// that hierarchy — key > rim > top > fill — rather than being independently
// tuned per-light.
const KEY_COLOR_NEUTRAL = new THREE.Color('#FFF6EA');
const KEY_COLOR_WARM = new THREE.Color('#FFD9A8');

export function Lighting() {
  const experienceState = useCoffeeStore((s) => s.experienceState);
  const powered = experienceState !== 'OFF';
  const keyRef = useRef<THREE.DirectionalLight>(null);

  // The room itself warms almost imperceptibly once coffee starts flowing,
  // so the machine's own materials (not an obvious color-graded overlay)
  // carry the emotional shift toward the "ritual" payoff.
  const warm =
    experienceState === 'BREWING' || experienceState === 'POURING_ACTIVE' || experienceState === 'COMPLETE';

  useEffect(() => {
    const key = keyRef.current;
    if (!key) return;
    const target = warm ? KEY_COLOR_WARM : KEY_COLOR_NEUTRAL;
    gsap.to(key.color, { r: target.r, g: target.g, b: target.b, duration: 3, ease: 'sine.inOut' });
  }, [warm]);

  return (
    <>
      {/* A touch more ambient than a pure studio void would use — this is a
          product stage now, and fully black shadow pockets on the cove read
          as a lighting gap rather than a deliberate choice. */}
      <ambientLight intensity={0.09} />

      {/* KEY — large soft warm-neutral source, ~45° lateral / high elevation.
          A larger shadow radius softens the contact shadow into the kind of
          broad, gradual falloff a big diffused softbox produces, instead of
          a small hard-edged sun shadow. */}
      <directionalLight
        ref={keyRef}
        position={[-1.6, 2.6, 1.2]}
        intensity={2.5}
        color="#FFF6EA"
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-near={0.1}
        shadow-camera-far={5}
        shadow-camera-left={-0.7}
        shadow-camera-right={0.7}
        shadow-camera-top={0.7}
        shadow-camera-bottom={-0.7}
        shadow-bias={-0.0004}
        shadow-radius={7}
      />

      {/* RIM — subtle sculptural edge light, behind and offset from camera */}
      <spotLight
        position={[0.4, 1.1, -1.3]}
        intensity={1.6}
        color="#FFC98A"
        angle={0.45}
        penumbra={0.85}
        distance={4}
      />

      {/* TOP — soft overhead source, resembling an overhead softbox */}
      <directionalLight position={[0, 3, 0.2]} intensity={0.5} color="#F3EFE8" />

      {/* FILL — restrained but lifted slightly so the machine's shadow side
          keeps visible material detail instead of crushing to pure black. */}
      <directionalLight position={[1.6, 1.0, 0.7]} intensity={0.4} color="#CBD6E0" />

      {/* Practical indicator light near btnPower */}
      <pointLight position={[0, 0.32, 0.14]} intensity={powered ? 0.35 : 0} distance={0.15} color="#FFC98A" />
    </>
  );
}
