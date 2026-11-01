import { ExperienceCanvas } from './scene/ExperienceCanvas';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingScreen } from './components/ui/LoadingScreen';

/**
 * Ritual — a cinematic espresso ritual.
 *
 * One machine, one process, one scene. The application shell exists only to
 * host the canvas, a loading state and a fatal-error fallback.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <main className="ritual-root">
        <ExperienceCanvas />
        <LoadingScreen />
      </main>
    </ErrorBoundary>
  );
}
