import { test, expect, type Page } from '@playwright/test';
import { PerspectiveCamera, Spherical, Vector3 } from 'three';
import { readFile, readdir } from 'node:fs/promises';

// Black-box verification: no engine handle or injection of application code.
// Reduced motion keeps the authored hero camera still for physical targeting.
function project(x: number, y: number, z: number) {
  const camera = new PerspectiveCamera(35, 1024 / 612, 0.05, 24);
  const target = new Vector3(0, 0.2, 0.02);
  camera.position.copy(target).add(new Vector3().setFromSpherical(new Spherical(1.12, 74 * Math.PI / 180, 30 * Math.PI / 180)));
  camera.lookAt(target);
  camera.updateMatrixWorld();
  const point = new Vector3(x, y, z).project(camera);
  return { x: (point.x * 0.5 + 0.5) * 1024, y: (-point.y * 0.5 + 0.5) * 612 };
}

async function click(page: Page, x: number, y: number, z: number) {
  const p = project(x, y, z);
  await page.mouse.click(p.x, p.y, { delay: 80 });
}

async function drag(page: Page, from: number[], to: number[]) {
  const a = project(from[0], from[1], from[2]);
  const b = project(to[0], to[1], to[2]);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 10 });
  await page.mouse.up();
}

async function darkCupPixels(page: Page) {
  const p = project(0, 0.125, 0.1299);
  const png = await page.screenshot({ clip: { x: Math.round(p.x - 18), y: Math.round(p.y - 8), width: 36, height: 16 } });
  return page.evaluate(async data => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const rgba = context.getImageData(0, 0, image.width, image.height).data;
    let count = 0;
    for (let i = 0; i < rgba.length; i += 4) {
      const x = (i / 4) % image.width;
      // Exclude the narrow stream itself: observe coffee across the cup mouth.
      if (Math.abs(x - image.width / 2) > 5 && rgba[i] < 110 && rgba[i + 1] < 85 && rgba[i + 2] < 70) count++;
    }
    return count;
  }, png.toString('base64'));
}

async function changedPixels(page: Page, before: Buffer, after: Buffer) {
  return page.evaluate(async ([before, after]) => {
    const decode = async (base64: string) => {
      const image = new Image(); image.src = `data:image/png;base64,${base64}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d')!;
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height).data;
    };
    const a = await decode(before), b = await decode(after);
    let changed = 0;
    for (let i = 0; i < a.length; i += 4) {
      if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 15) changed++;
    }
    return changed / (a.length / 4);
  }, [before.toString('base64'), after.toString('base64')]);
}

async function waitForVisualRest(page: Page, before: Buffer, requireChange = true) {
  let previous = before;
  let moved = !requireChange;
  let stableFrames = 0;
  await expect.poll(async () => {
    const current = await page.screenshot();
    moved ||= await changedPixels(page, before, current) > 0.0001;
    const difference = await changedPixels(page, previous, current);
    stableFrames = difference < 0.00002 ? stableFrames + 1 : 0;
    previous = current;
    return moved && stableFrames >= 2;
  }, { message: 'Physical presentation must change and settle', timeout: 45000, intervals: [200, 400, 800] }).toBe(true);
}

test('normal bundles contain no E2E API and query strings cannot enable it', async ({ page }) => {
  const bundles = (await readdir('dist/assets')).filter(name => name.endsWith('.js'));
  expect(bundles.length).toBeGreaterThan(0);
  for (const name of bundles) expect(await readFile(`dist/assets/${name}`, 'utf8')).not.toContain('__ritual');
  for (const query of ['', '?test=true', '?test=false&timeScale=0.1', '?timeScale=5']) {
    await page.goto(`/${query}${query ? '&' : '?'}quality=low`);
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('.ritual-loader')).toHaveCount(0, { timeout: 30000 });
    expect(await page.evaluate(() => '__ritual' in window)).toBe(false);
  }
});

test('production artifact rejects test parameters and completes a physical visitor journey', async ({ page }) => {
  const errors: string[] = [];
  const tones: number[] = [];
  // Observe the browser audio boundary without obtaining an engine handle or
  // advancing time. Calls still reach the unmodified native implementation.
  await page.exposeFunction('observeOscillatorStart', (frequency: number) => tones.push(frequency));
  await page.addInitScript(() => {
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (when?: number) {
      if (this.type === 'sine') {
        void (window as unknown as { observeOscillatorStart: (frequency: number) => Promise<void> })
          .observeOscillatorStart(this.frequency.value);
      }
      start.call(this, when);
    };
  });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('requestfailed', r => errors.push(`${r.url()}: ${r.failure()?.errorText}`));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?quality=low&test=true&timeScale=5');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('.ritual-loader')).toHaveCount(0, { timeout: 30000 });
  expect(await page.evaluate(() => '__ritual' in window)).toBe(false);
  await expect(page.locator('button,nav,input')).toHaveCount(0);
  const glb = await page.request.get('/assets/models/coffee_machine.glb');
  expect(glb.status()).toBe(200);
  expect((await glb.body()).subarray(0, 4).toString()).toBe('glTF');
  await waitForVisualRest(page, await page.screenshot(), false);
  const canonical = await page.screenshot();

  await test.step('Open, transfer, close, align and power using pointer events', async () => {
    await click(page, 0, 0.419, -0.064);
    await waitForVisualRest(page, canonical);
    const open = await page.screenshot();
    await drag(page, [-0.196, 0.05, 0.212], [0, 0.464, -0.0636]);
    await waitForVisualRest(page, open);
    const loaded = await page.screenshot();
    // Local lid midpoint rotated -96 degrees about the measured rear hinge.
    await click(page, 0, 0.521, -0.178);
    await waitForVisualRest(page, loaded);
    await drag(page, [-0.084, 0.0724, 0.15], [0, 0.0724, 0.1299]);
    await click(page, 0, 0.2739, 0.1602);
    await page.waitForTimeout(800);
  });
  const empty = await darkCupPixels(page);
  await click(page, -0.036, 0.2739, 0.1602);
  // Even the hostile URL must preserve the actual preparation timing.
  await page.waitForTimeout(2500);
  expect(tones).not.toContain(880);
  await click(page, 0.036, 0.2739, 0.1602);
  expect(await darkCupPixels(page)).toBeLessThanOrEqual(empty + 5);
  await expect.poll(() => tones.includes(880) && tones.includes(1320), {
    message: 'Actual preparation must reach its audible ready cue before Pour', timeout: 90000,
  }).toBe(true);
  await click(page, 0.036, 0.2739, 0.1602);
  await expect.poll(() => darkCupPixels(page), { timeout: 45000, intervals: [1000] }).toBeGreaterThan(empty + 30);
  await page.screenshot({ path: 'test-results/production/visitor-pour.png' });
  await click(page, 0.036, 0.2739, 0.1602);
  const completed = await page.screenshot();
  await page.keyboard.press('r');
  await waitForVisualRest(page, completed);
  const reset = await page.screenshot({ path: 'test-results/production/reset.png' });
  expect(await changedPixels(page, canonical, reset), 'Reset visibly restores the canonical scene').toBeLessThan(0.0015);
  expect(await page.evaluate(() => '__ritual' in window)).toBe(false);
  expect(errors).toEqual([]);
});
