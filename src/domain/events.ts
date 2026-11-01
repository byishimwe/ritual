import type { ResetReason } from './types';

/** Domain events are facts: emitted once per real transition, never per frame. */
export type ExperienceEvent =
  | { type: 'HOPPER_OPENING' }
  | { type: 'HOPPER_CLOSING' }
  | { type: 'HOPPER_OPENED' }
  | { type: 'HOPPER_CLOSED' }
  | { type: 'BEAN_DRAG_STARTED' }
  | { type: 'BEAN_TRANSFER_STARTED' }
  | { type: 'BEANS_LOADED' }
  | { type: 'BEAN_DRAG_CANCELLED' }
  | { type: 'MACHINE_POWERED_ON' }
  | { type: 'MACHINE_POWERED_OFF' }
  | { type: 'GRINDING_STARTED' }
  | { type: 'GRINDING_FINISHED' }
  | { type: 'TRANSITION_STARTED' }
  | { type: 'BREWING_STARTED' }
  | { type: 'BREWING_FINISHED' }
  | { type: 'COFFEE_READY' }
  | { type: 'POUR_STARTED' }
  | { type: 'POUR_STOPPED' }
  | { type: 'BATCH_EXHAUSTED' }
  | { type: 'CYCLE_COMPLETED' }
  | { type: 'CUP_DRAG_STARTED' }
  | { type: 'CUP_DRAG_ENDED' }
  | { type: 'RESET_STARTED'; reason: ResetReason }
  | { type: 'RESET_COMPLETED' }
  | { type: 'COMMAND_REJECTED'; command: string; reason: string };

export type ExperienceEventListener = (event: ExperienceEvent) => void;
