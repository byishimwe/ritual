import { TIMEOUTS } from '../config/experience';

/**
 * Browser visibility policy (RITUAL-03 §22.3–22.4, RITUAL-05 §30).
 *
 * Short interruptions pause the simulation and resume coherently; long ones
 * discard the stale session so the next visitor always meets a fresh scene.
 */
export function shouldResetAfterHidden(hiddenMs: number): boolean {
  return Number.isFinite(hiddenMs) && hiddenMs > TIMEOUTS.hiddenResetMs;
}

export interface VisibilitySnapshot {
  hidden: boolean;
  hiddenSince: number | null;
}

export class VisibilityTracker {
  private hidden = false;
  private hiddenSince: number | null = null;

  /** Returns true when the interruption exceeded the reset window. */
  onHidden(nowMs: number): void {
    if (this.hidden) return;
    this.hidden = true;
    this.hiddenSince = nowMs;
  }

  /** Returns the hidden duration in ms, or 0 if it was never hidden. */
  onVisible(nowMs: number): number {
    if (!this.hidden) return 0;
    const since = this.hiddenSince ?? nowMs;
    this.hidden = false;
    this.hiddenSince = null;
    return Math.max(0, nowMs - since);
  }

  get isHidden(): boolean {
    return this.hidden;
  }

  snapshot(): VisibilitySnapshot {
    return { hidden: this.hidden, hiddenSince: this.hiddenSince };
  }

  reset(): void {
    this.hidden = false;
    this.hiddenSince = null;
  }
}
