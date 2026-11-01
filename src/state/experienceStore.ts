import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { ExperienceEngine } from '../domain/experienceEngine';
import type { ExperienceState } from '../domain/types';

/**
 * State exposure layer.
 *
 * The engine owns behaviour; this store merely publishes a read-only snapshot
 * of it for React consumers (indicator, diagnostics, operator overlay). It is
 * published on discrete changes only — never per frame — while continuous
 * values such as volumes are read straight from the engine by frame-driven
 * renderers.
 */
export const engine = new ExperienceEngine();

interface StoreShape {
  snapshot: Readonly<ExperienceState>;
  revision: number;
  publish: (snapshot: Readonly<ExperienceState>, revision: number) => void;
}

export const experienceStore = createStore<StoreShape>((set) => ({
  snapshot: structuredClone(engine.getState()),
  revision: engine.getRevision(),
  publish: (snapshot, revision) => set({ snapshot, revision }),
}));

let publishedRevision = -1;

/** Called by the runtime frame loop; cheap and idempotent. */
export function publishEngineState(): void {
  const revision = engine.getRevision();
  if (revision === publishedRevision) return;
  publishedRevision = revision;
  // Deep-copied so React consumers can never observe the engine mutating a
  // snapshot they are holding, and so a selector comparison is meaningful.
  experienceStore.getState().publish(structuredClone(engine.getState()), revision);
}

export function useExperience<T>(selector: (state: Readonly<ExperienceState>) => T): T {
  return useStore(experienceStore, (store) => selector(store.snapshot));
}

export function useRevision(): number {
  return useStore(experienceStore, (store) => store.revision);
}

/** Send a visitor command through the engine and republish immediately. */
export function dispatchCommand(command: Parameters<ExperienceEngine['command']>[0]): boolean {
  const result = engine.command(command);
  publishEngineState();
  return result.accepted;
}
