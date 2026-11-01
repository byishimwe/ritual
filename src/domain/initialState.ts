import { CUP } from '../config/asset';
import type { ExperienceState } from './types';

/**
 * Canonical fresh session. Always produced by this factory — never by cloning
 * a previously mutated object (RITUAL-05 §28.7).
 */
export function createInitialState(now = 0): ExperienceState {
  return {
    machine: 'OFF',
    hopper: 'CLOSED',
    hopperMotion: 'IDLE',
    beansLoaded: false,
    beanSupply: 'AVAILABLE',
    cup: { position: { x: CUP.start.x, z: CUP.start.z }, dragging: false },
    coffee: {
      preparedBatch: 0,
      remainingVolume: 0,
      inFlightVolume: 0,
      cupVolume: 0,
      missedVolume: 0,
      overflowVolume: 0,
      discardedVolume: 0,
      totalReleasedVolume: 0,
    },
    processElapsed: 0,
    parcels: [],
    session: { generation: 0, lastInteractionAt: now, resetReason: null, resetStartedAt: 0 },
    cycle: { makeCommitted: false },
  };
}
