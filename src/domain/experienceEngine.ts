import { ANCHORS, CUP } from '../config/asset';
import { COFFEE, PARCEL_FALL_SECONDS, PROCESS_DURATIONS, SPATIAL } from '../config/experience';
import { captureFractionAt } from './capture';
import type { CommandResult, ExperienceCommand, RejectionReason } from './commands';
import type { ExperienceEvent, ExperienceEventListener } from './events';
import {
  canBeginBeanDrag,
  canCommitBeanTransfer,
  canMake,
  canMoveCup,
  canPressPour,
  canToggleHopper,
  clampCupPosition,
  makeRejection,
  resetEligibility,
  INACTIVITY_WINDOW_MS,
} from './guards';
import { createInitialState } from './initialState';
import type { CoffeeVolumeState, ExperienceState, ResetReason } from './types';

const EPS = COFFEE.epsilon;

function finishedBatch(): CoffeeVolumeState {
  return {
    preparedBatch: COFFEE.preparedBatch,
    remainingVolume: COFFEE.preparedBatch,
    inFlightVolume: 0,
    cupVolume: 0,
    missedVolume: 0,
    overflowVolume: 0,
    discardedVolume: 0,
    totalReleasedVolume: 0,
  };
}

/**
 * The single authority for machine behaviour.
 *
 * Commands are the only way in. Time advances only through `step`, which is
 * driven by the fixed-step simulation clock — never by ad-hoc timers. Parcels
 * of coffee carry their own arrival time so in-flight volume is conserved and
 * each arriving parcel is judged against the cup's position *at arrival*.
 */
export class ExperienceEngine {
  private state: ExperienceState;
  private readonly listeners = new Set<ExperienceEventListener>();
  /** Increments only on discrete changes; renderers read continuous values. */
  private revision = 0;

  constructor(now = 0) {
    this.state = createInitialState(now);
  }

  getState(): Readonly<ExperienceState> {
    return this.state;
  }

  getRevision(): number {
    return this.revision;
  }

  subscribe(listener: ExperienceEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(events: ExperienceEvent[]): void {
    for (const event of events) {
      for (const listener of this.listeners) listener(event);
    }
  }

  private touch(): void {
    this.revision += 1;
  }

  private accept(events: ExperienceEvent[] = []): CommandResult {
    this.touch();
    this.emit(events);
    return { accepted: true, events };
  }

  private reject(command: ExperienceCommand['type'], reason: RejectionReason): CommandResult {
    this.emit([{ type: 'COMMAND_REJECTED', command, reason }]);
    return { accepted: false, reason };
  }

  /** Meaningful visitor activity resets the inactivity clock (wall time). */
  noteActivity(now: number): void {
    this.state.session.lastInteractionAt = now;
  }

  command(command: ExperienceCommand, now = Date.now()): CommandResult {
    const s = this.state;

    // Reset is the only command that may run while resetting is refused.
    if (command.type === 'RESET') {
      if (s.machine === 'RESETTING') return this.reject('RESET', 'resetting');
      return this.beginReset(command.reason, now);
    }
    if (s.machine === 'RESETTING') {
      if (command.type === 'FINISH_RESET') return this.finishReset();
      return this.reject(command.type, 'resetting');
    }

    switch (command.type) {
      case 'FINISH_RESET':
        return this.reject(command.type, 'wrong_state');

      case 'NOTE_ACTIVITY':
        this.noteActivity(now);
        return { accepted: true, events: [] };

      case 'POWER': {
        if (s.machine === 'COMPLETE') {
          this.noteActivity(now);
          return this.beginReset('power_after_completion', now);
        }
        if (s.machine === 'OFF') {
          this.noteActivity(now);
          s.machine = 'IDLE_ON';
          return this.accept([{ type: 'MACHINE_POWERED_ON' }]);
        }
        if (s.machine === 'IDLE_ON') {
          this.noteActivity(now);
          s.machine = 'OFF';
          return this.accept([{ type: 'MACHINE_POWERED_OFF' }]);
        }
        return this.reject('POWER', 'wrong_state');
      }

      case 'TOGGLE_HOPPER': {
        if (!canToggleHopper(s)) return this.reject('TOGGLE_HOPPER', 'wrong_state');
        this.noteActivity(now);
        s.hopper = s.hopper === 'CLOSED' ? 'OPEN' : 'CLOSED';
        s.hopperMotion = 'MOVING';
        return this.accept([
          { type: s.hopper === 'OPEN' ? 'HOPPER_OPENING' : 'HOPPER_CLOSING' },
        ]);
      }

      case 'HOPPER_MOTION_COMPLETE': {
        // Acknowledge the hinge settling. Idempotent: no event if already idle.
        if (s.hopperMotion === 'IDLE') return { accepted: true, events: [] };
        s.hopperMotion = 'IDLE';
        return this.accept([
          { type: s.hopper === 'OPEN' ? 'HOPPER_OPENED' : 'HOPPER_CLOSED' },
        ]);
      }

      case 'BEGIN_BEAN_DRAG': {
        if (!canBeginBeanDrag(s)) return this.reject('BEGIN_BEAN_DRAG', 'supply_unavailable');
        this.noteActivity(now);
        s.beanSupply = 'DRAGGING';
        return this.accept([{ type: 'BEAN_DRAG_STARTED' }]);
      }

      case 'CANCEL_BEAN_DRAG': {
        if (s.beanSupply !== 'DRAGGING' && s.beanSupply !== 'TRANSFERRING') {
          return this.reject('CANCEL_BEAN_DRAG', 'supply_unavailable');
        }
        s.beanSupply = 'AVAILABLE';
        return this.accept([{ type: 'BEAN_DRAG_CANCELLED' }]);
      }

      case 'COMMIT_BEAN_TRANSFER': {
        if (!canCommitBeanTransfer(s)) {
          return this.reject(
            'COMMIT_BEAN_TRANSFER',
            s.beansLoaded ? 'already_loaded' : 'hopper_open',
          );
        }
        this.noteActivity(now);
        s.beanSupply = 'TRANSFERRING';
        return this.accept([{ type: 'BEAN_TRANSFER_STARTED' }]);
      }

      case 'COMPLETE_BEAN_TRANSFER': {
        if (s.beanSupply !== 'TRANSFERRING') {
          return this.reject('COMPLETE_BEAN_TRANSFER', 'transfer_active');
        }
        s.beanSupply = 'LOADED';
        s.beansLoaded = true;
        return this.accept([{ type: 'BEANS_LOADED' }]);
      }

      case 'BEGIN_CUP_DRAG': {
        if (!canMoveCup(s)) return this.reject('BEGIN_CUP_DRAG', 'resetting');
        this.noteActivity(now);
        s.cup.dragging = true;
        return this.accept([{ type: 'CUP_DRAG_STARTED' }]);
      }

      case 'SET_CUP_POSITION': {
        if (!canMoveCup(s)) return this.reject('SET_CUP_POSITION', 'resetting');
        const next = clampCupPosition(command.x, command.z);
        if (!Number.isFinite(next.x) || !Number.isFinite(next.z)) {
          return this.reject('SET_CUP_POSITION', 'invalid_input');
        }
        s.cup.position = next;
        this.noteActivity(now);
        return this.accept();
      }

      case 'END_CUP_DRAG': {
        if (!s.cup.dragging) return { accepted: true, events: [] };
        s.cup.dragging = false;
        // Subtle settling: only when already within a few millimetres of the
        // ideal spot, never a jump across the well (RITUAL-03 §8.8).
        const dx = s.cup.position.x - CUP.placement.x;
        const dz = s.cup.position.z - CUP.placement.z;
        if (Math.hypot(dx, dz) < SPATIAL.cupSnapRadius) {
          s.cup.position = { x: CUP.placement.x, z: CUP.placement.z };
        }
        return this.accept([{ type: 'CUP_DRAG_ENDED' }]);
      }

      case 'PRESS_MAKE': {
        if (!canMake(s)) return this.reject('PRESS_MAKE', makeRejection(s));
        this.noteActivity(now);
        s.machine = 'GRINDING';
        s.processElapsed = 0;
        s.cycle.makeCommitted = true;
        return this.accept([{ type: 'GRINDING_STARTED' }]);
      }

      case 'PRESS_POUR': {
        if (!canPressPour(s)) return this.reject('PRESS_POUR', 'wrong_state');
        this.noteActivity(now);
        if (s.machine === 'READY_TO_POUR') {
          s.machine = 'POURING';
          return this.accept([{ type: 'POUR_STARTED' }]);
        }
        return this.stopPour();
      }

      default:
        return this.reject('NOTE_ACTIVITY', 'invalid_input');
    }
  }

  /** Advances the mechanical stages and the coffee simulation by `dt` seconds. */
  step(dt: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    const s = this.state;
    switch (s.machine) {
      case 'GRINDING':
      case 'TRANSITION':
      case 'BREWING':
        this.advanceStage(dt);
        break;
      case 'POURING':
        this.advancePour(dt);
        break;
      case 'COMPLETE':
        // Coffee already in the air finishes falling after the tap closes.
        this.advanceParcels(dt);
        break;
      default:
        break;
    }
  }

  private advanceStage(dt: number): void {
    const s = this.state;
    let remaining = dt;
    let guard = 0;
    while (remaining > 0 && guard < 8) {
      guard += 1;
      const stage = s.machine;
      if (stage !== 'GRINDING' && stage !== 'TRANSITION' && stage !== 'BREWING') return;
      const duration = PROCESS_DURATIONS[stage];
      const elapsed = s.processElapsed + remaining;
      // A tolerance at the boundary keeps a stage that has been fed exactly
      // its duration (as accumulated fixed steps) from stalling one step short.
      if (elapsed + 1e-9 < duration) {
        s.processElapsed = elapsed;
        return;
      }
      const carry = elapsed - duration;
      s.processElapsed = 0;

      if (stage === 'GRINDING') {
        s.machine = 'TRANSITION';
        this.emit([{ type: 'GRINDING_FINISHED' }, { type: 'TRANSITION_STARTED' }]);
      } else if (stage === 'TRANSITION') {
        s.machine = 'BREWING';
        this.emit([{ type: 'BREWING_STARTED' }]);
      } else {
        // Brewing complete: exactly one finite batch is created here and only
        // here. Nothing dispenses until the visitor presses Pour.
        s.coffee = finishedBatch();
        s.machine = 'READY_TO_POUR';
        this.touch();
        this.emit([
          { type: 'BREWING_FINISHED' },
          { type: 'COFFEE_READY' },
        ]);
        return;
      }
      this.touch();
      remaining = carry;
    }
  }


  private advancePour(dt: number): void {
    const s = this.state;
    const emitted = Math.min(COFFEE.pourRate * dt, s.coffee.remainingVolume);
    if (emitted > 0) {
      s.coffee.remainingVolume = Math.max(0, s.coffee.remainingVolume - emitted);
      s.coffee.totalReleasedVolume += emitted;
      s.coffee.inFlightVolume += emitted;
      s.parcels.push({ amount: emitted, timeToArrival: PARCEL_FALL_SECONDS });
    }

    this.advanceParcels(dt);

    if (s.coffee.remainingVolume <= EPS) {
      s.coffee.remainingVolume = 0;
      s.machine = 'COMPLETE';
      this.touch();
      this.emit([{ type: 'BATCH_EXHAUSTED' }, { type: 'CYCLE_COMPLETED' }]);
    }
  }

  /**
   * Resolves every parcel that reaches the receiving plane this step.
   * Capture uses the cup position *now*, so moving the cup mid-pour changes
   * the outcome for coffee still in the air (RITUAL-05 §20.8).
   */
  private advanceParcels(dt: number): void {
    const s = this.state;
    if (s.parcels.length === 0) {
      s.coffee.inFlightVolume = 0;
      return;
    }

    const arriving: number[] = [];
    for (let i = s.parcels.length - 1; i >= 0; i -= 1) {
      const parcel = s.parcels[i];
      parcel.timeToArrival -= dt;
      if (parcel.timeToArrival <= 0) {
        arriving.push(parcel.amount);
        s.parcels.splice(i, 1);
      }
    }

    if (arriving.length > 0) {
      const fraction = captureFractionAt(s.cup.position, ANCHORS.coffeeExit);
      for (const amount of arriving) {
        const potentialCup = amount * fraction;
        const space = Math.max(0, COFFEE.cupCapacity - s.coffee.cupVolume);
        const captured = Math.min(potentialCup, space);
        s.coffee.cupVolume = Math.min(COFFEE.cupCapacity, s.coffee.cupVolume + captured);
        s.coffee.overflowVolume += potentialCup - captured;
        s.coffee.missedVolume += amount - potentialCup;
      }
    }

    // Recompute in-flight from the authoritative parcel list so the
    // conservation invariant never accumulates rounding drift.
    let inFlight = 0;
    for (const parcel of s.parcels) inFlight += parcel.amount;
    s.coffee.inFlightVolume = inFlight;
  }

  /** A deliberate second press ends dispensing and finalises the batch. */
  private stopPour(): CommandResult {
    const s = this.state;
    if (s.machine !== 'POURING') return this.reject('PRESS_POUR', 'wrong_state');
    s.coffee.discardedVolume += s.coffee.remainingVolume;
    s.coffee.remainingVolume = 0;
    s.machine = 'COMPLETE';
    return this.accept([{ type: 'POUR_STOPPED' }, { type: 'CYCLE_COMPLETED' }]);
  }

  private beginReset(reason: ResetReason, now: number): CommandResult {
    const s = this.state;
    const nextGeneration = s.session.generation + 1;
    const fresh = createInitialState(now);

    // Atomic logical restoration — the visual transition may still animate.
    this.state = {
      ...fresh,
      machine: 'RESETTING',
      session: {
        generation: nextGeneration,
        lastInteractionAt: now,
        resetReason: reason,
        resetStartedAt: now,
      },
    };
    this.touch();
    this.emit([{ type: 'RESET_STARTED', reason }]);
    return { accepted: true, events: [{ type: 'RESET_STARTED', reason }] };
  }

  private finishReset(): CommandResult {
    const s = this.state;
    s.machine = 'OFF';
    this.touch();
    this.emit([{ type: 'RESET_COMPLETED' }]);
    return { accepted: true, events: [{ type: 'RESET_COMPLETED' }] };
  }

  /**
   * Applies the state-specific inactivity policy. Returns true when a reset
   * was started. Machine-controlled stages never time out.
   */
  evaluateTimeouts(now: number): boolean {
    const s = this.state;
    const eligibility = resetEligibility(s);
    if (eligibility === 'none') return false;
    const windowMs = INACTIVITY_WINDOW_MS[eligibility];
    if (now - s.session.lastInteractionAt < windowMs) return false;
    const reason: ResetReason =
      eligibility === 'complete'
        ? 'inactivity_complete'
        : eligibility === 'ready'
          ? 'inactivity_ready'
          : 'inactivity_preparation';
    return this.command({ type: 'RESET', reason }, now).accepted;
  }
}
