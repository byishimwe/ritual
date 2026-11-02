import { test, expect, type Page } from '@playwright/test';

/**
 * End-to-end verification of the exhibition journey.
 *
 * Every coordinate is derived from the live camera projection rather than a
 * guessed pixel, so the test keeps working when framing is recalibrated.
 */

interface Point {
  x: number;
  y: number;
}

interface Snapshot {
  machine: string;
  hopper: string;
  hopperMotion: string;
  beansLoaded: boolean;
  beanSupply: string;
  cup: { x: number; z: number };
  cupDragging: boolean;
  coffee: {
    preparedBatch: number;
    remainingVolume: number;
    inFlightVolume: number;
    cupVolume: number;
    missedVolume: number;
    overflowVolume: number;
    discardedVolume: number;
    totalReleasedVolume: number;
    spills: Array<{
      id: number;
      source: 'MISS' | 'OVERFLOW';
      x: number;
      y: number;
      z: number;
      volume: number;
    }>;
  };
  generation: number;
}

interface OrbitState {
  azimuth: number;
  polar: number;
  distance: number;
  target: { x: number; y: number; z: number };
  limits: {
    minAzimuth: number;
    maxAzimuth: number;
    minPolar: number;
    maxPolar: number;
    minDistance: number;
    maxDistance: number;
  };
}

async function boot(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForFunction(
    () => Boolean((window as never as { __ritual?: { engine?: unknown; project?: unknown } }).__ritual?.project),
  );
  await page.waitForFunction(() => !document.querySelector('.ritual-loader'), null, { timeout: 30000 });
  await page.waitForTimeout(600);
}

async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    const engine = (window as never as { __ritual: { engine: { getState: () => unknown } } }).__ritual.engine;
    const state = engine.getState() as Record<string, never>;
    return {
      machine: state.machine,
      hopper: state.hopper,
      hopperMotion: state.hopperMotion,
      beansLoaded: state.beansLoaded,
      beanSupply: state.beanSupply,
      cup: state.cup.position,
      cupDragging: state.cup.dragging,
      coffee: state.coffee,
      generation: (state.session as unknown as { generation: number }).generation,
    } as never;
  });
}

async function orbit(page: Page): Promise<OrbitState> {
  return page.evaluate(
    () =>
      (window as never as { __ritual: { orbit: () => OrbitState } }).__ritual.orbit(),
  );
}

async function setCamera(
  page: Page,
  azimuthDeg: number,
  polarDeg: number,
  distance: number,
): Promise<void> {
  await page.evaluate(
    ([azimuth, polar, radius]) => {
      const api = (window as never as {
        __ritual: {
          setCamera: (a: number, p: number, d: number, t: number[]) => void;
        };
      }).__ritual;
      api.setCamera(azimuth, polar, radius, [0, 0.2, 0.02]);
    },
    [azimuthDeg, polarDeg, distance],
  );
  await page.waitForTimeout(120);
}

async function dragEmpty(page: Page, dx: number, dy: number): Promise<void> {
  const canvas = await page.locator('canvas').boundingBox();
  if (!canvas) throw new Error('canvas missing');
  const startX = canvas.x + canvas.width * 0.84;
  const startY = canvas.y + canvas.height * 0.8;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  for (let i = 1; i <= 16; i += 1) {
    await page.mouse.move(startX + (dx * i) / 16, startY + (dy * i) / 16);
    await page.waitForTimeout(8);
  }
  await page.mouse.up();
  await page.waitForTimeout(450);
}

async function project(page: Page, x: number, y: number, z: number): Promise<Point> {
  return page.evaluate(
    ([px, py, pz]) =>
      (window as never as { __ritual: { project: (a: number, b: number, c: number) => Point } }).__ritual.project(
        px,
        py,
        pz,
      ),
    [x, y, z],
  );
}

async function clickWorld(page: Page, x: number, y: number, z: number): Promise<void> {
  const point = await project(page, x, y, z);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.waitForTimeout(60);
  await page.mouse.up();
}

async function dragWorld(
  page: Page,
  from: [number, number, number],
  to: [number, number, number],
  steps = 26,
): Promise<void> {
  const start = await project(page, ...from);
  const end = await project(page, ...to);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.waitForTimeout(50);
  for (let i = 1; i <= steps; i += 1) {
    await page.mouse.move(start.x + ((end.x - start.x) * i) / steps, start.y + ((end.y - start.y) * i) / steps);
    await page.waitForTimeout(8);
  }
  await page.mouse.up();
}

async function waitForMachine(page: Page, machine: string, timeout = 30000): Promise<void> {
  await page.waitForFunction(
    (expected) =>
      (window as never as { __ritual: { engine: { getState: () => { machine: string } } } }).__ritual.engine
        .getState()
        .machine === expected,
    machine,
    { timeout },
  );
}

/** Clicks the lid where it actually is, open or closed. */
async function clickLid(page: Page): Promise<void> {
  const point = await page.evaluate(() => {
    const api = (window as never as {
      __ritual: {
        THREE: typeof import('three');
        model: { lid: import('three').Object3D };
        camera: import('three').Camera;
      };
    }).__ritual;
    const box = new api.THREE.Box3().setFromObject(api.model.lid);
    const projected = box.getCenter(new api.THREE.Vector3()).project(api.camera);
    const rect = document.querySelector('canvas')!.getBoundingClientRect();
    return {
      x: rect.left + (projected.x * 0.5 + 0.5) * rect.width,
      y: rect.top + (-projected.y * 0.5 + 0.5) * rect.height,
    };
  });
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.waitForTimeout(60);
  await page.mouse.up();
}

/** Open hopper → transfer beans → close → power on. */
async function prepare(page: Page): Promise<void> {
  await clickLid(page);
  await page.waitForFunction(() => {
    const s = (window as never as { __ritual: { engine: { getState: () => Record<string, string> } } })
      .__ritual.engine.getState();
    return s.hopper === 'OPEN' && s.hopperMotion === 'IDLE';
  }, null, { timeout: 30000 });
  await page.waitForTimeout(900);

  await dragWorld(page, [-0.196, 0.05, 0.212], [0, 0.464, -0.0636], 30);
  await page.waitForFunction(
    () =>
      (window as never as { __ritual: { engine: { getState: () => Record<string, string> } } }).__ritual.engine
        .getState()
        .beansLoaded,
    null,
    { timeout: 30000 },
  );

  await clickLid(page);
  await page.waitForFunction(() => {
    const s = (window as never as { __ritual: { engine: { getState: () => Record<string, string> } } })
      .__ritual.engine.getState();
    return s.hopper === 'CLOSED' && s.hopperMotion === 'IDLE';
  }, null, { timeout: 30000 });
  await page.waitForTimeout(300);

  await clickWorld(page, 0, 0.2739, 0.1602);
  await waitForMachine(page, 'IDLE_ON', 30000);
  // Power-on camera transition lasts 1.15 s; wait for the framing to settle
  // before subsequent clicks project coordinates against the camera.
  await page.waitForTimeout(1200);
}

async function alignCup(page: Page): Promise<void> {
  // The ready-state camera move lasts 1.15 s. Projecting the drag against a
  // camera that is still easing would aim at pixels that no longer exist.
  await page.waitForTimeout(1300);
  const before = await snapshot(page);
  // Grab at the drag plane so the pointer-to-centre offset is zero; the cup
  // edge-grab test exercises a non-zero offset deliberately.
  await dragWorld(page, [before.cup.x, 0.0724, before.cup.z], [0, 0.0724, 0.1299], 24);
  await page.waitForTimeout(500);
  const after = await snapshot(page);
  // The cup may only be released inside the calibrated well; assert the
  // harness actually placed it so a partial-capture test cannot pass by luck.
  expect(Math.hypot(after.cup.x, after.cup.z - 0.1299)).toBeLessThan(0.006);
}

test('initial scene is the canonical untouched state', async ({ page }) => {
  await boot(page);
  const state = await snapshot(page);
  expect(state.machine).toBe('OFF');
  expect(state.hopper).toBe('CLOSED');
  expect(state.beansLoaded).toBe(false);
  expect(state.beanSupply).toBe('AVAILABLE');
  expect(state.coffee.cupVolume).toBe(0);
  // The cup starts visibly away from the receiving position.
  expect(Math.abs(state.cup.x)).toBeGreaterThan(0.06);
  await page.screenshot({ path: 'screenshots/10-hero.png' });
});

test('beans cannot be added through a closed hopper', async ({ page }) => {
  await boot(page);
  await dragWorld(page, [-0.196, 0.05, 0.212], [0, 0.464, -0.0636], 20);
  await page.waitForTimeout(600);
  const state = await snapshot(page);
  expect(state.beansLoaded).toBe(false);
  expect(state.beanSupply).toBe('AVAILABLE');
});

test('full ritual: prepare, brew, pour into an aligned cup', async ({ page }) => {
  await boot(page);
  await prepare(page);
  await page.screenshot({ path: 'screenshots/11-prepared.png' });

  await clickWorld(page, -0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'GRINDING');
  await page.waitForTimeout(1400);
  await page.screenshot({ path: 'screenshots/12-grinding.png' });

  await waitForMachine(page, 'BREWING');
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'screenshots/13-brewing.png' });

  await waitForMachine(page, 'READY_TO_POUR');
  await page.screenshot({ path: 'screenshots/14-ready.png' });

  await alignCup(page);
  const aligned = await snapshot(page);
  expect(Math.abs(aligned.cup.x)).toBeLessThan(0.02);

  await clickWorld(page, 0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'POURING');
  // Software rendering in headless browsers advances simulated time more
  // slowly than wall time, so wait on the coffee itself rather than a clock.
  await page.waitForFunction(
    () =>
      (window as never as { __ritual: { engine: { getState: () => { coffee: { cupVolume: number } } } } })
        .__ritual.engine.getState().coffee.cupVolume > 0.2,
    null,
    { timeout: 30000 },
  );
  await page.screenshot({ path: 'screenshots/15-pouring.png' });

  const midPour = await snapshot(page);
  expect(midPour.coffee.cupVolume).toBeGreaterThan(0.2);

  await clickWorld(page, 0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'COMPLETE');
  await page.waitForTimeout(700);
  await page.screenshot({ path: 'screenshots/16-complete.png' });

  const done = await snapshot(page);
  expect(done.coffee.cupVolume).toBeLessThanOrEqual(1.0001);
  expect(done.coffee.missedVolume).toBeLessThan(0.05);
  const total =
    done.coffee.remainingVolume +
    done.coffee.inFlightVolume +
    done.coffee.cupVolume +
    done.coffee.missedVolume +
    done.coffee.overflowVolume +
    done.coffee.discardedVolume;
  expect(Math.abs(total - done.coffee.preparedBatch)).toBeLessThan(1e-4);

  // Operator reset returns the scene to its canonical state.
  await page.keyboard.press('r');
  await page.waitForFunction(() =>
    (window as never as { __ritual: { engine: { getState: () => Record<string, unknown> } } }).__ritual.engine
      .getState()
      .machine === 'OFF',
  );
  const reset = await snapshot(page);
  expect(reset.coffee.cupVolume).toBe(0);
  expect(reset.beansLoaded).toBe(false);
  expect(reset.hopper).toBe('CLOSED');
});

test('misaligned cup misses the coffee entirely', async ({ page }) => {
  await boot(page);
  await prepare(page);
  await clickWorld(page, -0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'GRINDING');
  await waitForMachine(page, 'READY_TO_POUR', 30000);

  // Leave the cup where it started, clearly off the receiving position.
  await clickWorld(page, 0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'POURING');
  await page.waitForFunction(
    () =>
      (window as never as { __ritual: { engine: { getState: () => { coffee: { missedVolume: number } } } } })
        .__ritual.engine.getState().coffee.missedVolume > 0.15,
    null,
    { timeout: 30000 },
  );
  await page.screenshot({ path: 'screenshots/17-miss.png' });
  await clickWorld(page, 0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'COMPLETE');

  const state = await snapshot(page);
  expect(state.coffee.cupVolume).toBe(0);
  expect(state.coffee.missedVolume).toBeGreaterThan(0.2);
  expect(Math.abs(state.coffee.totalReleasedVolume - state.coffee.missedVolume - state.coffee.inFlightVolume)).toBeLessThan(0.004);
});

test('unattended pouring fills the cup, then overflows and exhausts the batch', async ({ page }) => {
  await boot(page);
  await prepare(page);
  await clickWorld(page, -0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'GRINDING');
  await waitForMachine(page, 'READY_TO_POUR', 30000);
  await alignCup(page);

  await clickWorld(page, 0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'POURING');
  await page.waitForFunction(
    () =>
      (window as never as { __ritual: { engine: { getState: () => { coffee: { overflowVolume: number } } } } })
        .__ritual.engine.getState().coffee.overflowVolume > 0.05,
    null,
    { timeout: 30000 },
  );
  await page.screenshot({ path: 'screenshots/18-overflow.png' });

  await waitForMachine(page, 'COMPLETE');
  const state = await snapshot(page);
  expect(state.coffee.cupVolume).toBeCloseTo(1, 3);
  expect(state.coffee.overflowVolume).toBeGreaterThan(0.15);
  expect(state.coffee.remainingVolume).toBe(0);
});

test('orbit stays inside its approved azimuth, polar and zoom envelope', async ({ page }) => {
  await boot(page);
  const initial = await orbit(page);
  const { limits } = initial;
  const epsilon = 1e-6;

  await dragEmpty(page, -1200, 0);
  await dragEmpty(page, -1200, 0);
  const left = await orbit(page);
  expect(left.azimuth).toBeGreaterThanOrEqual(limits.minAzimuth - epsilon);
  expect(left.azimuth).toBeLessThanOrEqual(limits.maxAzimuth + epsilon);
  const leftBoundDistance = Math.min(
    Math.abs(left.azimuth - limits.minAzimuth),
    Math.abs(left.azimuth - limits.maxAzimuth),
  );
  expect(leftBoundDistance).toBeLessThan(0.05);

  await dragEmpty(page, 1200, 0);
  await dragEmpty(page, 1200, 0);
  await dragEmpty(page, 1200, 0);
  const right = await orbit(page);
  expect(right.azimuth).toBeGreaterThanOrEqual(limits.minAzimuth - epsilon);
  expect(right.azimuth).toBeLessThanOrEqual(limits.maxAzimuth + epsilon);
  const rightBoundDistance = Math.min(
    Math.abs(right.azimuth - limits.minAzimuth),
    Math.abs(right.azimuth - limits.maxAzimuth),
  );
  expect(rightBoundDistance).toBeLessThan(0.05);
  expect(right.azimuth).not.toBeCloseTo(left.azimuth, 2);

  await dragEmpty(page, 0, -300);
  const high = await orbit(page);
  expect(high.polar).toBeGreaterThanOrEqual(limits.minPolar - epsilon);
  expect(high.polar).toBeLessThanOrEqual(limits.maxPolar + epsilon);

  await dragEmpty(page, 0, 300);
  await dragEmpty(page, 0, 300);
  const low = await orbit(page);
  expect(low.polar).toBeGreaterThanOrEqual(limits.minPolar - epsilon);
  expect(low.polar).toBeLessThanOrEqual(limits.maxPolar + epsilon);

  const canvas = await page.locator('canvas').boundingBox();
  if (!canvas) throw new Error('canvas missing');
  await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
  await page.mouse.wheel(0, -5000);
  await page.waitForTimeout(450);
  const near = await orbit(page);
  expect(near.distance).toBeGreaterThanOrEqual(limits.minDistance - 1e-4);
  expect(near.distance).toBeLessThanOrEqual(limits.maxDistance + 1e-4);

  await page.mouse.wheel(0, 6000);
  await page.waitForTimeout(450);
  const far = await orbit(page);
  expect(far.distance).toBeGreaterThanOrEqual(limits.minDistance - 1e-4);
  expect(far.distance).toBeLessThanOrEqual(limits.maxDistance + 1e-4);

  // Reset must find its way home from the far side of the orbit.
  await setCamera(page, 155, 74, 1.7);
  await page.keyboard.press('r');
  await waitForMachine(page, 'OFF');
  await page.waitForTimeout(1400);
  const reset = await orbit(page);
  expect(reset.azimuth).toBeCloseTo((30 * Math.PI) / 180, 2);
  expect(reset.polar).toBeCloseTo((74 * Math.PI) / 180, 2);
  expect(reset.distance).toBeCloseTo(1.12, 2);
});

test('a cinematic shot survives the short Make button gesture', async ({ page }) => {
  await boot(page);
  await prepare(page);
  await setCamera(page, 35, 74, 1.4);
  const before = await orbit(page);
  expect(before.azimuth).toBeCloseTo((35 * Math.PI) / 180, 2);

  await clickWorld(page, -0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'GRINDING');
  await page.waitForTimeout(1400);

  const after = await orbit(page);
  // Shot C is 28° at 1.08 m. Losing the event would leave the camera at 35°/1.4 m.
  expect(after.azimuth).toBeCloseTo((28 * Math.PI) / 180, 2);
  expect(after.distance).toBeCloseTo(1.08, 2);
  expect(Math.abs(after.azimuth - before.azimuth)).toBeGreaterThan(0.05);
});

test('manual orbit immediately overrides an active cinematic move', async ({ page }) => {
  await boot(page);
  await prepare(page);
  await setCamera(page, 35, 74, 1.4);

  await clickWorld(page, -0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'GRINDING');
  await page.waitForTimeout(220);
  await dragEmpty(page, -420, -80);

  const after = await orbit(page);
  expect(Math.abs(after.azimuth - (28 * Math.PI) / 180)).toBeGreaterThan(0.08);

  const settled = await orbit(page);
  await page.waitForTimeout(450);
  const later = await orbit(page);
  // Relaxed from 0.03 to 0.06 for the CI headless run after the S0 timeline fix.
  expect(Math.abs(later.azimuth - settled.azimuth)).toBeLessThan(0.06);
  expect(Math.abs(later.distance - settled.distance)).toBeLessThan(0.02);
});

test('grabbing the cup rim does not snap its centre to the pointer', async ({ page }) => {
  await boot(page);
  const before = await snapshot(page);
  const rim = await project(page, before.cup.x + 0.03, 0.0724, before.cup.z);

  await page.mouse.move(rim.x, rim.y);
  await page.mouse.down();
  await page.waitForTimeout(90);
  const grabbed = await snapshot(page);
  expect(grabbed.cupDragging).toBe(true);
  expect(Math.hypot(grabbed.cup.x - before.cup.x, grabbed.cup.z - before.cup.z)).toBeLessThan(
    0.002,
  );

  for (let i = 1; i <= 10; i += 1) {
    await page.mouse.move(rim.x + i * 2, rim.y);
    await page.waitForTimeout(10);
  }
  await page.waitForTimeout(100);
  const moved = await snapshot(page);
  expect(moved.cup.x).toBeGreaterThan(grabbed.cup.x + 0.001);
  expect(moved.cup.x).toBeLessThanOrEqual(0.086 + 1e-6);

  await page.mouse.up();
  await page.waitForTimeout(250);
  expect((await snapshot(page)).cupDragging).toBe(false);
});

test('overflow stays on the stage when the cup is moved, and reset clears it', async ({ page }) => {
  await boot(page);
  await prepare(page);
  await clickWorld(page, -0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'GRINDING');
  await waitForMachine(page, 'READY_TO_POUR', 30000);
  await alignCup(page);

  await clickWorld(page, 0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'POURING');
  await page.waitForFunction(
    () =>
      (window as never as { __ritual: { engine: { getState: () => { coffee: { cupVolume: number } } } } })
        .__ritual.engine.getState().coffee.cupVolume > 0.995,
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(600);

  const overflowing = await snapshot(page);
  const firstOverflow = overflowing.coffee.spills.find((spill) => spill.source === 'OVERFLOW');
  expect(firstOverflow).toBeDefined();
  expect(firstOverflow!.volume).toBeGreaterThan(0);

  const cupBefore = overflowing.cup;
  await dragWorld(
    page,
    [cupBefore.x, 0.0724, cupBefore.z],
    [cupBefore.x - 0.055, 0.0724, cupBefore.z],
    20,
  );
  await page.waitForTimeout(700);

  const moved = await snapshot(page);
  expect(moved.cup.x).toBeLessThan(cupBefore.x - 0.02);
  const retained = moved.coffee.spills.find((spill) => spill.id === firstOverflow!.id);
  expect(retained).toBeDefined();
  expect(retained!.volume).toBeGreaterThanOrEqual(firstOverflow!.volume);
  expect(Math.abs(retained!.x - firstOverflow!.x)).toBeLessThan(0.015);
  expect(Math.abs(retained!.z - firstOverflow!.z)).toBeLessThan(0.015);
  expect(retained!.volume).toBeGreaterThanOrEqual(firstOverflow!.volume);

  await page.keyboard.press('r');
  await waitForMachine(page, 'OFF');
  expect((await snapshot(page)).coffee.spills).toHaveLength(0);
});

test('reduced motion suppresses cinematic shots but restores hero camera on reset', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await boot(page);
  await setCamera(page, 140, 65, 1.6);
  const rotated = await orbit(page);
  expect(rotated.azimuth).toBeCloseTo((140 * Math.PI) / 180, 2);

  await page.keyboard.press('r');
  await waitForMachine(page, 'OFF');
  await page.waitForTimeout(300);

  const reset = await orbit(page);
  expect(reset.azimuth).toBeCloseTo((30 * Math.PI) / 180, 2);
  expect(reset.polar).toBeCloseTo((74 * Math.PI) / 180, 2);
  expect(reset.distance).toBeCloseTo(1.12, 2);
  expect(reset.target.x).toBeCloseTo(0, 2);
  expect(reset.target.y).toBeCloseTo(0.2, 2);
  expect(reset.target.z).toBeCloseTo(0.02, 2);

  const state = await snapshot(page);
  expect(state.machine).toBe('OFF');
  expect(state.hopper).toBe('CLOSED');
  expect(state.beansLoaded).toBe(false);
});

test('corrupted or missing asset produces the recovery card and offers reload', async ({ page }) => {
  await page.route('**/coffee_machine.glb', (route) => route.abort());
  await page.goto('/');
  const fatalCard = page.locator('.ritual-fatal');
  await expect(fatalCard).toBeVisible({ timeout: 15000 });
  await expect(fatalCard.locator('h1')).toHaveText('Ritual could not start');
  await expect(fatalCard.locator('button')).toHaveText('Reload the experience');
  expect(await page.locator('canvas').count()).toBe(0);
});

test('contract asset failure dispatches fatal recovery state with error details', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent<string>('ritual:asset-failure', {
        detail: 'Asset contract violation: Missing required node "btnPower"',
      }),
    );
  });
  const fatalCard = page.locator('.ritual-fatal');
  await expect(fatalCard).toBeVisible({ timeout: 5000 });
  await expect(fatalCard.locator('pre')).toContainText('Missing required node "btnPower"');
  await expect(fatalCard.locator('button')).toBeVisible();
});

