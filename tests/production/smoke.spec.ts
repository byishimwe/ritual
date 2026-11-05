import { test, expect, type Page } from '@playwright/test';
import { PerspectiveCamera, Spherical, Vector3 } from 'three';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { PNG } from 'pngjs';

type NativeVoice = { type: string; frequency: number; automated: boolean };
const observedAudio = new WeakMap<Page, NativeVoice[]>();
test.afterEach(async ({ page }, info) => {
  if (info.status === info.expectedStatus) return;
  await info.attach('native-audio-observations', {
    body: JSON.stringify({ url: page.url(), voices: observedAudio.get(page) ?? [] }),
    contentType: 'application/json',
  });
});

// Black-box verification: no engine handle or injection of application code.
// Reduced motion keeps the authored hero camera still for physical targeting.
function project(page: Page, x: number, y: number, z: number) {
  const { width, height } = page.viewportSize()!;
  const camera = new PerspectiveCamera(35, width / height, 0.05, 24);
  const target = new Vector3(0, 0.2, 0.02);
  camera.position.copy(target).add(new Vector3().setFromSpherical(new Spherical(1.12, 74 * Math.PI / 180, 30 * Math.PI / 180)));
  camera.lookAt(target);
  camera.updateMatrixWorld();
  const point = new Vector3(x, y, z).project(camera);
  return { x: (point.x * 0.5 + 0.5) * width, y: (-point.y * 0.5 + 0.5) * height };
}

async function click(page: Page, x: number, y: number, z: number) {
  const p = project(page, x, y, z);
  await page.mouse.click(p.x, p.y, { delay: 80 });
}

async function drag(page: Page, from: number[], to: number[]) {
  const a = project(page, from[0], from[1], from[2]);
  const b = project(page, to[0], to[1], to[2]);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 10 });
  await page.mouse.up();
}

function pixelScale(page: Page) { return page.viewportSize()!.width / 1024; }

async function darkCupPixels(page: Page) {
  const scale = pixelScale(page);
  const p = project(page, 0, 0.125, 0.1299);
  const png = await page.screenshot({ clip: {
    x: Math.round(p.x - 18 * scale), y: Math.round(p.y - 8 * scale),
    width: Math.round(36 * scale), height: Math.round(16 * scale),
  } });
  const { data, width } = PNG.sync.read(png);
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % width;
    // Exclude the stream; compare an equivalent pixel density at either size.
    if (Math.abs(x - width / 2) > 5 * scale && data[i] < 110 && data[i + 1] < 85 && data[i + 2] < 70) count++;
  }
  return count / (scale * scale);
}

function changedPixels(before: Buffer, after: Buffer) {
  const a = PNG.sync.read(before).data, b = PNG.sync.read(after).data;
  let changed = 0;
  for (let i = 0; i < a.length; i += 4) {
    if (Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2])) > 15) changed++;
  }
  return changed / (a.length / 4);
}

async function checkpoint(name: string, png: Buffer) {
  await mkdir('test-results/production', { recursive: true });
  await writeFile(`test-results/production/${name}.png`, png);
  return png;
}

async function waitForVisualRest(page: Page, before: Buffer, requireChange = true) {
  let previous = before;
  let moved = !requireChange;
  let stableFrames = 0;
  await expect.poll(async () => {
    const current = await page.screenshot();
    moved ||= changedPixels(before, current) > 0.0001;
    const difference = changedPixels(previous, current);
    stableFrames = difference < 0.00002 ? stableFrames + 1 : 0;
    previous = current;
    return moved && stableFrames >= 2;
  }, { message: 'Physical presentation must change and settle', timeout: 120000, intervals: [200, 400, 800] }).toBe(true);
  return previous;
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
  const voices: NativeVoice[] = [];
  observedAudio.set(page, voices);
  const hasVoice = (type: string, frequency: number) => voices.some(v => v.type === type && v.frequency === frequency);
  // Observe the browser audio boundary without obtaining an engine handle or
  // advancing time. Calls still reach the unmodified native implementation.
  await page.exposeFunction('observeNativeVoice', (voice: NativeVoice) => voices.push(voice));
  await page.addInitScript(() => {
    const observe = (type: string, frequency: number, automated = false) => {
      void (window as unknown as { observeNativeVoice: (voice: { type: string; frequency: number; automated: boolean }) => Promise<void> })
        .observeNativeVoice({ type, frequency, automated });
    };
    // Read native scheduling, including future notes whose .value is still 440.
    const scheduled = new WeakMap<AudioParam, number>();
    const setValue = AudioParam.prototype.setValueAtTime;
    AudioParam.prototype.setValueAtTime = function (value: number, time: number) {
      if (!scheduled.has(this)) scheduled.set(this, value);
      return setValue.call(this, value, time);
    };
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (when?: number) {
      observe(this.type, scheduled.get(this.frequency) ?? this.frequency.value, scheduled.has(this.frequency));
      start.call(this, when);
    };
    // The existing opening-completion hiss is identifiable in the native graph.
    const destinations = new WeakMap<AudioNode, AudioNode>();
    const connect = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (...args: unknown[]) {
      destinations.set(this, args[0] as AudioNode);
      return Reflect.apply(connect, this, args);
    } as AudioNode['connect'];
    const bufferStart = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args: Parameters<AudioBufferSourceNode['start']>) {
      const filter = destinations.get(this);
      if (filter instanceof BiquadFilterNode && filter.type === 'highpass' && filter.frequency.value === 5200) observe('hiss', 5200);
      Reflect.apply(bufferStart, this, args);
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
  const canonical = await checkpoint('canonical', await waitForVisualRest(page, await page.screenshot(), false));

  await test.step('Open, transfer, close, align and power using pointer events', async () => {
    await click(page, 0, 0.419, -0.064);
    await expect.poll(() => hasVoice('hiss', 5200), { message: 'Native opening-completion hiss must precede the bean drop', timeout: 120000 }).toBe(true);
    const open = await checkpoint('open', await waitForVisualRest(page, canonical));
    await drag(page, [-0.196, 0.05, 0.212], [0, 0.464, -0.0636]);
    await expect.poll(() => voices.filter(v => v.type === 'triangle' && !v.automated && v.frequency >= 480 && v.frequency <= 980).length, {
      message: 'All seven native bean-settle notes must follow the real transfer completion', timeout: 180000,
    }).toBe(7);
    const loaded = await checkpoint('loaded', await waitForVisualRest(page, open));
    // Local lid midpoint rotated -96 degrees about the measured rear hinge.
    await click(page, 0, 0.521, -0.178);
    await checkpoint('closed', await waitForVisualRest(page, loaded));
    await drag(page, [-0.084, 0.0724, 0.15], [0, 0.0724, 0.1299]);
    await click(page, 0, 0.2739, 0.1602);
    await page.waitForTimeout(800);
  });
  const empty = await darkCupPixels(page);
  await click(page, -0.036, 0.2739, 0.1602);
  await expect.poll(() => hasVoice('sawtooth', 128), { message: 'Make must actually start the native grinder', timeout: 15000 }).toBe(true);
  // Even the hostile URL must preserve the actual preparation timing.
  await page.waitForTimeout(2500);
  expect(hasVoice('sine', 880)).toBe(false);
  await click(page, 0.036, 0.2739, 0.1602);
  expect(await darkCupPixels(page)).toBeLessThanOrEqual(empty + 5);
  await expect.poll(() => hasVoice('sine', 880) && hasVoice('sine', 1320), {
    message: 'Actual preparation must reach its audible ready cue before Pour', timeout: 180000,
  }).toBe(true);
  await click(page, 0.036, 0.2739, 0.1602);
  await expect.poll(() => darkCupPixels(page), { timeout: 120000, intervals: [1000] }).toBeGreaterThan(empty + 30);
  await page.screenshot({ path: 'test-results/production/visitor-pour.png' });
  await click(page, 0.036, 0.2739, 0.1602);
  const completed = await page.screenshot();
  await page.keyboard.press('r');
  await waitForVisualRest(page, completed);
  const reset = await page.screenshot({ path: 'test-results/production/reset.png' });
  expect(changedPixels(canonical, reset), 'Reset visibly restores the canonical scene').toBeLessThan(0.0015);
  expect(await page.evaluate(() => '__ritual' in window)).toBe(false);
  expect(errors).toEqual([]);
});
