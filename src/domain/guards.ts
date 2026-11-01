import { CUP } from '../config/asset';
import { SPATIAL, TIMEOUTS } from '../config/experience';
import type { RejectionReason } from './commands';
import { CUP_INTERIOR_VOLUME_M3 } from './cupGeometry';
import type { ExperienceState, MachineState, ResetEligibility } from './types';

/**
 * Every rule that decides whether an action is allowed lives here, as pure
 * functions of state. The engine consults these; presentation never does its
 * own availability logic.
 */

const PROCESSING: readonly MachineState[] = ['GRINDING', 'TRANSITION', 'BREWING'];
const HOPPER_LOCKED: readonly MachineState[] = [
  'GRINDING',
  'TRANSITION',
  'BREWING',
  'READY_TO_POUR',
  'POURING',
  'COMPLETE',
  'RESETTING',
];

export function isProcessing(state: MachineState): boolean {
  return PROCESSING.includes(state);
}

export function isPowered(machine: MachineState): boolean {
  return machine !== 'OFF';
}

export function isHopperLocked(machine: MachineState): boolean {
  return HOPPER_LOCKED.includes(machine);
}

/** Hopper may be operated before and during standby, and reversed mid-motion. */
export function canToggleHopper(s: ExperienceState): boolean {
  if (s.machine !== 'OFF' && s.machine !== 'IDLE_ON') return false;
  if (s.beanSupply === 'TRANSFERRING') return false;
  return true;
}

export function canBeginBeanDrag(s: ExperienceState): boolean {
  if (s.machine !== 'OFF' && s.machine !== 'IDLE_ON') return false;
  return s.beanSupply === 'AVAILABLE';
}

export function canCommitBeanTransfer(s: ExperienceState): boolean {
  return (
    s.beanSupply === 'DRAGGING' &&
    s.hopper === 'OPEN' &&
    s.hopperMotion === 'IDLE' &&
    !s.beansLoaded &&
    (s.machine === 'OFF' || s.machine === 'IDLE_ON')
  );
}

/** Make: powered, beans loaded, lid fully closed, no transfer, one per cycle. */
export function canMake(s: ExperienceState): boolean {
  return (
    s.machine === 'IDLE_ON' &&
    s.beansLoaded &&
    s.hopper === 'CLOSED' &&
    s.hopperMotion === 'IDLE' &&
    s.beanSupply === 'LOADED' &&
    !s.cycle.makeCommitted
  );
}

export function makeRejection(s: ExperienceState): RejectionReason {
  if (s.machine === 'OFF') return 'not_powered';
  if (s.machine !== 'IDLE_ON') return 'wrong_state';
  if (!s.beansLoaded) return 'beans_missing';
  if (s.hopper === 'OPEN') return 'hopper_open';
  if (s.hopperMotion === 'MOVING') return 'hopper_moving';
  if (s.beanSupply === 'TRANSFERRING') return 'transfer_active';
  return 'cycle_already_committed';
}

export function canPressPour(s: ExperienceState): boolean {
  if (s.machine === 'POURING') return true;
  return s.machine === 'READY_TO_POUR' && s.coffee.remainingVolume > 0;
}

/** Power: toggles in standby, rejected mid-process, resets after completion. */
export function canPower(s: ExperienceState): boolean {
  return s.machine === 'OFF' || s.machine === 'IDLE_ON' || s.machine === 'COMPLETE';
}

export function canMoveCup(s: ExperienceState): boolean {
  return s.machine !== 'RESETTING';
}

export function isSessionDirty(s: ExperienceState): boolean {
  return (
    s.machine !== 'OFF' ||
    s.hopper === 'OPEN' ||
    s.hopperMotion === 'MOVING' ||
    s.beansLoaded ||
    s.beanSupply !== 'AVAILABLE' ||
    s.coffee.cupVolume > 0 ||
    s.coffee.missedVolume > 0 ||
    Math.abs(s.cup.position.x - CUP.start.x) > 1e-4 ||
    Math.abs(s.cup.position.z - CUP.start.z) > 1e-4
  );
}

/**
 * Which inactivity policy applies, if any (RITUAL-03 §19.3). Active machine
 * stages never reset for inactivity; an untouched OFF scene never resets.
 */
export function resetEligibility(s: ExperienceState): ResetEligibility {
  if (s.machine === 'RESETTING') return 'none';
  if (isProcessing(s.machine) || s.machine === 'POURING') return 'none';
  if (s.machine === 'COMPLETE') return 'complete';
  if (s.machine === 'READY_TO_POUR') return 'ready';
  if (s.machine === 'OFF' || s.machine === 'IDLE_ON') {
    return isSessionDirty(s) ? 'preparation' : 'none';
  }
  return 'none';
}

export const INACTIVITY_WINDOW_MS: Record<Exclude<ResetEligibility, 'none'>, number> = {
  complete: TIMEOUTS.completeMs,
  ready: TIMEOUTS.readyMs,
  preparation: TIMEOUTS.preparationMs,
  touch: TIMEOUTS.preparationMs,
};

/** Clamp a requested cup position into the machine's cup well. */
export function clampCupPosition(x: number, z: number): { x: number; z: number } {
  const safeX = Number.isFinite(x) ? x : CUP.start.x;
  const safeZ = Number.isFinite(z) ? z : CUP.start.z;
  return {
    x: Math.min(Math.max(safeX, SPATIAL.cupMinX), SPATIAL.cupMaxX),
    z: Math.min(Math.max(safeZ, SPATIAL.cupMinZ), SPATIAL.cupMaxZ),
  };
}

/** Cup surface support height: drip grille when centred, tray floor when off it. */
export function cupSupportY(x: number, z: number): number {
  const onPad = Math.abs(x) <= CUP.pad.halfX && z >= CUP.pad.minZ && z <= CUP.pad.maxZ;
  return onPad ? CUP.padTopY : CUP.trayFloorY;
}

/** Real cubic metres represented by one normalised cup unit (documentation). */
export const CUP_UNIT_LITRES = CUP_INTERIOR_VOLUME_M3 * 1000;
