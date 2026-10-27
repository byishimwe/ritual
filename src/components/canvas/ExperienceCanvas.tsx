import { Canvas } from '@react-three/fiber';
import { VSMShadowMap } from 'three';
import { Scene } from './Scene';
import { useCoffeeStore } from '../../systems/state/useCoffeeStore';

export function ExperienceCanvas() {
  const reset = useCoffeeStore((s) => s.reset);

  const handleDoubleClick = () => reset();

  return (
    <div style={{ width: '100vw', height: '100vh' }} onDoubleClick={handleDoubleClick}>
      <Canvas
        shadows={{ type: VSMShadowMap }}
        dpr={[1, 2]}
        camera={{ position: [0.55, 0.42, 1.05], fov: 35, near: 0.01, far: 20 }}
        gl={{ antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
