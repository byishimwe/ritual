import { useEffect, useState } from 'react';
import { ExperienceCanvas } from './scene/ExperienceCanvas';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { FatalError } from './components/ui/FatalError';
import { LoadingScreen } from './components/ui/LoadingScreen';

/**
 * Ritual — a cinematic espresso ritual.
 *
 * One machine, one process, one scene. The application shell exists only to
 * host the canvas, a loading state and a fatal-error fallback.
 */
export default function App() {
  const [assetFailure, setAssetFailure] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      setAssetFailure((event as CustomEvent<string>).detail);
    };
    window.addEventListener('ritual:asset-failure', handler);
    return () => window.removeEventListener('ritual:asset-failure', handler);
  }, []);

  if (assetFailure) return <FatalError detail={assetFailure} />;

  return (
    <ErrorBoundary>
      <main className="ritual-root">
        <ExperienceCanvas />
        <LoadingScreen />
      </main>
    </ErrorBoundary>
  );
}
