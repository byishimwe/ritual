/** Authoritative behavioural types. Nothing here may import Three.js or React. */

export type MachineState =
  | 'OFF'
  | 'IDLE_ON'
  | 'GRINDING'
  | 'TRANSITION'
  | 'BREWING'
  | 'READY_TO_POUR'
  | 'POURING'
  | 'COMPLETE'
  | 'RESETTING';

export type HopperState = 'CLOSED' | 'OPEN';

/** Hinge motion completion — brewing requires a fully settled closed lid. */
export type HopperMotion = 'IDLE' | 'MOVING';

export type BeanSupplyState = 'AVAILABLE' | 'DRAGGING' | 'TRANSFERRING' | 'LOADED';

export type ResetReason =
  | 'operator'
  | 'power_after_completion'
  | 'inactivity_complete'
  | 'inactivity_ready'
  | 'inactivity_preparation'
  | 'hidden'
  | 'context_recovery';

export interface Vec2 {
  x: number;
  z: number;
}

/** Finite coffee accounting. `preparedBatch` is constant for a cycle. */
export interface CoffeeVolumeState {
  preparedBatch: number;
  remainingVolume: number;
  inFlightVolume: number;
  cupVolume: number;
  missedVolume: number;
  overflowVolume: number;
  discardedVolume: number;
  totalReleasedVolume: number;
}

/** A parcel of coffee currently falling from the nozzle. */
export interface LiquidParcel {
  amount: number;
  timeToArrival: number;
}

export interface SessionState {
  generation: number;
  /** Wall-clock ms of the last meaningful visitor interaction. */
  lastInteractionAt: number;
  resetReason: ResetReason | null;
  resetStartedAt: number;
}

export interface ExperienceState {
  machine: MachineState;
  hopper: HopperState;
  hopperMotion: HopperMotion;
  beansLoaded: boolean;
  beanSupply: BeanSupplyState;
  cup: { position: Vec2; dragging: boolean };
  coffee: CoffeeVolumeState;
  /** Seconds elapsed inside the current mechanical stage. */
  processElapsed: number;
  parcels: LiquidParcel[];
  session: SessionState;
  cycle: { makeCommitted: boolean };
}

export type ResetEligibility = 'touch' | 'complete' | 'ready' | 'preparation' | 'none';
