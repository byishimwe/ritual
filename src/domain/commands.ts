import type { ExperienceEvent } from './events';
import type { ResetReason } from './types';

export type ExperienceCommand =
  | { type: 'POWER' }
  | { type: 'TOGGLE_HOPPER' }
  | { type: 'HOPPER_MOTION_COMPLETE' }
  | { type: 'BEGIN_BEAN_DRAG' }
  | { type: 'CANCEL_BEAN_DRAG' }
  | { type: 'COMMIT_BEAN_TRANSFER' }
  | { type: 'COMPLETE_BEAN_TRANSFER' }
  | { type: 'BEGIN_CUP_DRAG' }
  | { type: 'SET_CUP_POSITION'; x: number; z: number }
  | { type: 'END_CUP_DRAG' }
  | { type: 'PRESS_MAKE' }
  | { type: 'PRESS_POUR' }
  | { type: 'RESET'; reason: ResetReason }
  | { type: 'FINISH_RESET' }
  | { type: 'NOTE_ACTIVITY' };

export type RejectionReason =
  | 'wrong_state'
  | 'not_powered'
  | 'beans_missing'
  | 'hopper_open'
  | 'hopper_moving'
  | 'transfer_active'
  | 'already_loaded'
  | 'supply_unavailable'
  | 'batch_finished'
  | 'cycle_already_committed'
  | 'resetting'
  | 'invalid_input';

export type CommandResult =
  | { accepted: true; events: ExperienceEvent[] }
  | { accepted: false; reason: RejectionReason };
