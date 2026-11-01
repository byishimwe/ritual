import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';

/**
 * The only HTML that appears before the experience begins.
 *
 * It is a technical loading state, not part of the art direction: one name, one
 * hairline progress rule, and nothing to read or operate.
 */
export function LoadingScreen() {
  const { active, progress } = useProgress();
  const [dismissed, setDismissed] = useState(false);
  const fading = !active && progress >= 100;

  useEffect(() => {
    if (!fading) return;
    const timer = window.setTimeout(() => setDismissed(true), 520);
    return () => window.clearTimeout(timer);
  }, [fading]);

  if (dismissed) return null;

  return (
    <div className={`ritual-loader${fading ? ' is-hiding' : ''}`} aria-live="polite">
      <div className="ritual-loader__word">Ritual</div>
      <div className="ritual-loader__rule">
        <span style={{ transform: `scaleX(${Math.min(1, Math.max(0.04, progress / 100))})` }} />
      </div>
    </div>
  );
}
