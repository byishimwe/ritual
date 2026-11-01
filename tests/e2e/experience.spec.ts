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
  };
  generation: number;
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

async function waitForMachine(page: Page, machine: string, timeout = 20000): Promise<void> {
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
  await page.waitForFunction(() =>
    (window as never as { __ritual: { engine: { getState: () => Record<string, string> } } }).__ritual.engine
      .getState()
      .hopper === 'OPEN',
  );
  await page.waitForTimeout(900);

  await dragWorld(page, [-0.196, 0.05, 0.212], [0, 0.464, -0.0636], 30);
  await page.waitForFunction(
    () =>
      (window as never as { __ritual: { engine: { getState: () => Record<string, string> } } }).__ritual.engine
        .getState()
        .beanSupply === 'LOADED',
    null,
    { timeout: 15000 },
  );

  await clickLid(page);
  await page.waitForFunction(() => {
    const state = (window as never as { __ritual: { engine: { getState: () => Record<string, string> } } })
      .__ritual.engine.getState();
    return state.hopper === 'CLOSED' && state.hopperMotion === 'IDLE';
  });

  await clickWorld(page, 0, 0.2739, 0.1602);
  await waitForMachine(page, 'IDLE_ON');
}

async function alignCup(page: Page): Promise<void> {
  // The ready-state camera move lasts 1.15 s. Projecting the drag against a
  // camera that is still easing would aim at pixels that no longer exist.
  await page.waitForTimeout(1300);
  const before = await snapshot(page);
  await dragWorld(page, [before.cup.x, 0.09, before.cup.z], [0, 0.0724, 0.1299], 24);
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

  await waitForMachine(page, 'BREWING', 12000);
  await page.waitForTimeout(900);
  await page.screenshot({ path: 'screenshots/13-brewing.png' });

  await waitForMachine(page, 'READY_TO_POUR', 12000);
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
  await waitForMachine(page, 'READY_TO_POUR', 20000);

  // Leave the cup where it started, clearly off the receiving position.
  await clickWorld(page, 0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'POURING');
  await page.waitForTimeout(2200);
  await page.screenshot({ path: 'screenshots/17-miss.png' });
  await clickWorld(page, 0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'COMPLETE');

  const state = await snapshot(page);
  expect(state.coffee.cupVolume).toBe(0);
  expect(state.coffee.missedVolume).toBeGreaterThan(0.2);
  expect(Math.abs(state.coffee.totalReleasedVolume - state.coffee.missedVolume)).toBeLessThan(1e-4);
});

test('unattended pouring fills the cup, then overflows and exhausts the batch', async ({ page }) => {
  await boot(page);
  await prepare(page);
  await clickWorld(page, -0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'READY_TO_POUR', 20000);
  await alignCup(page);

  await clickWorld(page, 0.036, 0.2739, 0.1602);
  await waitForMachine(page, 'POURING');
  await page.waitForTimeout(9200);
  await page.screenshot({ path: 'screenshots/18-overflow.png' });

  await waitForMachine(page, 'COMPLETE', 20000);
  const state = await snapshot(page);
  expect(state.coffee.cupVolume).toBeCloseTo(1, 3);
  expect(state.coffee.overflowVolume).toBeGreaterThan(0.15);
  expect(state.coffee.remainingVolume).toBe(0);
});
