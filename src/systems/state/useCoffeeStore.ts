import { create } from 'zustand';
import type { CoffeeStoreState } from '../../types';
import { TIMING } from '../../config/experienceConfig';

let grindTimeout: ReturnType<typeof setTimeout> | null = null;
let pauseTimeout: ReturnType<typeof setTimeout> | null = null;
let brewTimeout: ReturnType<typeof setTimeout> | null = null;

function clearBrewTimers() {
  if (grindTimeout) clearTimeout(grindTimeout);
  if (pauseTimeout) clearTimeout(pauseTimeout);
  if (brewTimeout) clearTimeout(brewTimeout);
  grindTimeout = pauseTimeout = brewTimeout = null;
}

function reevaluateReady(
  get: () => CoffeeStoreState,
  set: (partial: Partial<CoffeeStoreState>) => void,
) {
  const st = get();
  if (st.experienceState === 'POWER_ON' && st.beansAdded && st.hopperState === 'CLOSED') {
    set({ experienceState: 'READY_TO_BREW' });
  }
}

export const useCoffeeStore = create<CoffeeStoreState>((set, get) => ({
  experienceState: 'OFF',
  hopperState: 'CLOSED',
  beansAdded: false,
  cupAligned: false,
  pourElapsed: 0,
  overflowing: false,
  lastInteraction: Date.now(),

  registerInteraction: () => set({ lastInteraction: Date.now() }),

  powerOn: () => {
    if (get().experienceState !== 'OFF') return;
    set({ experienceState: 'POWER_ON' });
    get().registerInteraction();
  },

  powerOff: () => {
    clearBrewTimers();
    set({
      experienceState: 'OFF',
      hopperState: 'CLOSED',
      beansAdded: false,
      cupAligned: false,
      pourElapsed: 0,
      overflowing: false,
    });
  },

  openHopper: () => {
    const s = get().experienceState;
    if (s === 'GRINDING' || s === 'PAUSE' || s === 'BREWING') return;
    set({ hopperState: 'OPEN' });
    get().registerInteraction();
  },

  closeHopper: () => {
    const s = get().experienceState;
    if (s === 'GRINDING' || s === 'PAUSE' || s === 'BREWING') return;
    set({ hopperState: 'CLOSED' });
    reevaluateReady(get, set);
    get().registerInteraction();
  },

  addBeans: () => {
    const s = get().experienceState;
    if (s === 'OFF' || s === 'GRINDING' || s === 'PAUSE' || s === 'BREWING') return;
    if (get().hopperState !== 'OPEN') return;
    set({ beansAdded: true });
    get().registerInteraction();
  },

  alignCup: (aligned: boolean) => {
    set({ cupAligned: aligned });
    reevaluateReady(get, set);
    get().registerInteraction();
  },

  canMake: () => {
    const st = get();
    return (
      (st.experienceState === 'POWER_ON' || st.experienceState === 'READY_TO_BREW') &&
      st.beansAdded &&
      st.hopperState === 'CLOSED'
    );
  },

  canPour: () => get().experienceState === 'READY_TO_POUR',

  pressMake: () => {
    if (!get().canMake()) return;
    clearBrewTimers();
    set({ experienceState: 'GRINDING' });
    get().registerInteraction();

    grindTimeout = setTimeout(() => {
      set({ experienceState: 'PAUSE' });
      pauseTimeout = setTimeout(() => {
        set({ experienceState: 'BREWING' });
        brewTimeout = setTimeout(() => {
          set({ experienceState: 'READY_TO_POUR' });
        }, TIMING.brewing);
      }, TIMING.pause);
    }, TIMING.grinding);
  },

  pressPour: () => {
    const s = get().experienceState;
    if (s === 'READY_TO_POUR') {
      set({ experienceState: 'POURING_ACTIVE', pourElapsed: 0, overflowing: false });
    } else if (s === 'POURING_ACTIVE') {
      set({ experienceState: 'COMPLETE' });
    }
    get().registerInteraction();
  },

  tickPour: (dt: number) => {
    const st = get();
    if (st.experienceState !== 'POURING_ACTIVE') return;
    const elapsed = st.pourElapsed + dt;
    set({
      pourElapsed: elapsed,
      overflowing: elapsed > TIMING.maxPourDuration,
    });
  },

  reset: () => {
    clearBrewTimers();
    set({
      experienceState: 'OFF',
      hopperState: 'CLOSED',
      beansAdded: false,
      cupAligned: false,
      pourElapsed: 0,
      overflowing: false,
      lastInteraction: Date.now(),
    });
  },
}));
