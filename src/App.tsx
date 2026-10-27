import { Suspense, useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { ExperienceCanvas } from './components/canvas/ExperienceCanvas';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useCoffeeStore } from './systems/state/useCoffeeStore';

function App() {
  const [loading, setLoading] = useState(true);
  const { active, progress } = useProgress();
  const hasStarted = useRef(false);
  if (active || progress > 0) hasStarted.current = true;
  const reset = useCoffeeStore((s) => s.reset);

  // Tie the loading overlay to the real GLB fetch/parse, not a guessed
  // duration — a fixed timer would fade the overlay away before the model
  // (an 8MB GLB) is actually ready on slower connections, exposing a blank
  // canvas underneath (the Suspense boundary renders nothing until resolved).
  useEffect(() => {
    if (!hasStarted.current || active || progress < 100) return;
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [active, progress]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') reset();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [reset]);

  return (
    <>
      <Suspense fallback={null}>
        <ExperienceCanvas />
      </Suspense>
      <LoadingScreen visible={loading} />
    </>
  );
}

export default App;
