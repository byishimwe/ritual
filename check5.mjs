import { chromium } from 'playwright';

const browser = await chromium.launch({
  executablePath: 'C:\\Users\\Adeod\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe',
});
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
page.on('pageerror', (err) => console.log('[pageerror]', err.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('[console.error]', msg.text());
});
await page.goto('http://localhost:5173', { timeout: 30000 });
await page.waitForTimeout(5000);

async function state() {
  return page.evaluate(() => {
    const s = window.__coffeeStore?.getState();
    if (!s) return null;
    return {
      experienceState: s.experienceState,
      hopperState: s.hopperState,
      beansAdded: s.beansAdded,
      cupAligned: s.cupAligned,
    };
  });
}

async function screenPosOf(nodeName) {
  return page.evaluate((name) => {
    const node = window.__coffeeNodes?.[name];
    const camera = window.__coffeeCamera;
    const THREE = window.__THREE_NS;
    if (!node || !camera || !THREE) return null;
    node.updateWorldMatrix(true, false);
    const box = new THREE.Box3().setFromObject(node);
    const vec = box.getCenter(new THREE.Vector3());
    vec.project(camera);
    const canvas = document.querySelector('canvas');
    const x = (vec.x * 0.5 + 0.5) * canvas.clientWidth;
    const y = (-vec.y * 0.5 + 0.5) * canvas.clientHeight;
    return { x, y };
  }, nodeName);
}

async function clickNode(nodeName, label) {
  const pos = await screenPosOf(nodeName);
  if (!pos) {
    console.log('MISSING_NODE_OR_CAMERA', nodeName);
    return;
  }
  await page.mouse.click(pos.x, pos.y);
  console.log('click', label, JSON.stringify(pos), '-> state:', JSON.stringify(await state()));
}

console.log('initial state', JSON.stringify(await state()));

await clickNode('btnPower', 'power');
await page.waitForTimeout(1000);
console.log('state after power+wait', JSON.stringify(await state()));

await clickNode('HopperLid', 'lid-open');
await page.waitForTimeout(700);
console.log('state after lid-open+wait', JSON.stringify(await state()));

await clickNode('coffeeBeans', 'beans');
await page.waitForTimeout(300);
console.log('state after beans+wait', JSON.stringify(await state()));

await clickNode('HopperLid', 'lid-close');
await page.waitForTimeout(700);
console.log('state after lid-close+wait', JSON.stringify(await state()));

await clickNode('btnMake', 'make');
await page.waitForTimeout(500);
console.log('state after make+wait', JSON.stringify(await state()));

await page.waitForTimeout(9500);
console.log('state after grind+pause+brew wait', JSON.stringify(await state()));
await page.screenshot({ path: 'g-ready-to-pour.png' });

await clickNode('btnPour', 'pour');
await page.waitForTimeout(1500);
console.log('state after pour+wait', JSON.stringify(await state()));
await page.screenshot({ path: 'g-pouring.png' });

// --- Now test the misaligned case: reset, redo prep, drag cup away, brew, pour ---
await page.keyboard.press('r');
await page.waitForTimeout(500);
console.log('state after reset', JSON.stringify(await state()));

await clickNode('btnPower', 'power2');
await page.waitForTimeout(1000);
await clickNode('HopperLid', 'lid-open2');
await page.waitForTimeout(700);
await clickNode('coffeeBeans', 'beans2');
await page.waitForTimeout(300);
await clickNode('HopperLid', 'lid-close2');
await page.waitForTimeout(700);

// Drag the cup away from center using a real pointer drag sequence.
const cupPos = await screenPosOf('coffeeCup');
console.log('cup screen pos before drag', JSON.stringify(cupPos));
await page.mouse.move(cupPos.x, cupPos.y);
await page.mouse.down();
await page.mouse.move(cupPos.x + 300, cupPos.y, { steps: 15 });
await page.mouse.up();
await page.waitForTimeout(400);
console.log('state after cup drag', JSON.stringify(await state()));
const cupRawX = await page.evaluate(() => window.__coffeeNodes?.coffeeCup?.position.x);
console.log('cup.position.x (raw)', cupRawX);

await clickNode('btnMake', 'make2');
await page.waitForTimeout(9500);
console.log('state ready to pour (misaligned)', JSON.stringify(await state()));

await clickNode('btnPour', 'pour2');
await page.waitForTimeout(2000);
console.log('state pouring (misaligned)', JSON.stringify(await state()));
await page.screenshot({ path: 'g-pouring-misaligned.png' });

console.log('DONE');
await browser.close();
