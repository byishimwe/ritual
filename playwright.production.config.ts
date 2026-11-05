import { defineConfig } from '@playwright/test';
import integration from './playwright.config';

export default defineConfig({
  ...integration,
  testDir: './tests/production',
  outputDir: 'test-results/production',
  // The normal clock deliberately clamps stalled frames to 0.1 s. The real
  // 9.4 s preparation alone needs 94 frames (~94 wall seconds at 1 FPS), in
  // addition to physical motion, loading, filling and reset. No test clock is
  // available in this artifact; give the observed real-time journey a budget.
  timeout: 600_000,
  reporter: process.env.CI
    ? [['list'], ['github'], ['json', { outputFile: 'test-results/production-results.json' }]]
    : [['list'], ['json', { outputFile: 'test-results/production-results.json' }]],
  use: {
    ...integration.use,
    // Regular Chromium's new headless mode matches the visitor browser more
    // closely than the separate headless shell, including WebGL/compositing.
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.env.CI ? 'chromium' : 'chrome'),
    baseURL: 'http://127.0.0.1:5184',
    viewport: process.env.CI ? { width: 384, height: 230 } : { width: 1024, height: 612 },
    // Continuous trace screencasts force GPU readbacks on every frame and can
    // starve the real-time clock under software WebGL. Keep action/DOM/source
    // traces, explicit visual checkpoints and failure screenshots instead.
    trace: { mode: 'retain-on-failure', screenshots: false, snapshots: true, sources: true },
  },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5184 --strictPort',
    url: 'http://127.0.0.1:5184',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
