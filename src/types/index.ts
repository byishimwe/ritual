export type ExperienceState =
  | 'OFF'
  | 'POWER_ON'
  | 'READY_TO_BREW'
  | 'GRINDING'
  | 'PAUSE'
  | 'BREWING'
  | 'READY_TO_POUR'
  | 'POURING_ACTIVE'
  | 'COMPLETE';

export type HopperState = 'CLOSED' | 'OPEN';

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface CoffeeStoreState {
  experienceState: ExperienceState;
  hopperState: HopperState;
  beansAdded: boolean;
  cupAligned: boolean;
  pourElapsed: number;
  overflowing: boolean;
  lastInteraction: number;

  powerOn: () => void;
  powerOff: () => void;
  openHopper: () => void;
  closeHopper: () => void;
  addBeans: () => void;
  alignCup: (aligned: boolean) => void;
  pressMake: () => void;
  pressPour: () => void;
  tickPour: (dt: number) => void;
  registerInteraction: () => void;
  reset: () => void;
  canMake: () => boolean;
  canPour: () => boolean;
}
