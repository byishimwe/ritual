import type { CameraPreset } from '../types';

export const NODE_NAMES = {
  root: 'machineCoffeeRoot',
  body: 'body',
  btnPower: 'btnPower',
  btnMake: 'btnMake',
  btnPour: 'btnPour',
  hopper: 'Hopper',
  hopperLid: 'HopperLid',
  spout: 'coffeeSpout',
  cup: 'coffeeCup',
  beans: 'coffeeBeans',
} as const;

export const MATERIAL_NAMES = {
  satinMetal: 'matSatinMetal',
  charcoalBody: 'matCharcoalBody',
  glassHopper: 'matGlassHopper',
  ceramic: 'matCeramic',
  beans: 'mCoffeeBeans',
  darkMetalTrim: 'matDarkMetalTrim',
} as const;

export const MATERIAL_PARAMS = {
  satinMetal: { color: '#C0C4C8', metalness: 1.0, roughness: 0.32 },
  charcoalBody: { color: '#222528', metalness: 0.0, roughness: 0.55 },
  glassHopper: {
    color: '#3A3D40',
    roughness: 0.08,
    transmission: 1.0,
    opacity: 0.4,
    ior: 1.49,
    transparent: true,
  },
  ceramic: {
    color: '#F0ECE1',
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
  },
  beans: { color: '#3D2314', roughness: 0.45, clearcoat: 0.3 },
  coffeeLiquid: { color: '#1A0D06', roughness: 0.1 },
  darkMetalTrim: { color: '#35383B', metalness: 1.0, roughness: 0.25 },
} as const;

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  DEFAULT_HERO: { position: [0.55, 0.42, 1.05], target: [0.0, 0.2, 0.0], fov: 35 },
  HOPPER_CLOSEUP: { position: [0.2, 0.55, 0.6], target: [0.0, 0.36, 0.0], fov: 30 },
  SPOUT_HERO: { position: [0.0, 0.18, 0.5], target: [0.0, 0.12, 0.0], fov: 28 },
};

export const ORBIT_LIMITS = {
  minAzimuth: (-160 * Math.PI) / 180,
  maxAzimuth: (160 * Math.PI) / 180,
  minPolar: (45 * Math.PI) / 180,
  maxPolar: (85 * Math.PI) / 180,
  minDistance: 0.8,
  maxDistance: 2.2,
  dampingFactor: 0.05,
};

export const TIMING = {
  buttonPress: 0.12,
  hopperLidRotation: 0.6,
  grinding: 3500,
  pause: 1500,
  brewing: 4000,
  cameraTransition: 1.8,
  maxPourDuration: 12000,
  inactivityReset: 45000,
};

export const HOPPER_LID_ROTATION_OPEN = (-135 * Math.PI) / 180;
export const BUTTON_PRESS_DEPTH = -0.003;

// Cup-drag geometry, in real-world meters. The cup's actual THREE.Object3D
// position lives in the model's raw (pre-auto-fit) local units, so callers
// must convert these to that space via the fit group's scale factor.
export const CUP_DRAG_RANGE_M = 0.07;
export const CUP_ALIGNMENT_TOLERANCE_M = 0.015;
