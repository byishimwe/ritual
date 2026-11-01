import { defineConfig, devices } from '@playwright/test';

/**
 * Browser verification for the exhibition build.
 *
 * The system Chrome is used (`channel: 'chrome'`) so the harness needs no
 * separate browser download; SwiftShader is allowed so WebGL works on headless
 * machines without a GPU.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 240_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    baseURL: 'http://localhost:5183',
    viewport: { width: 1440, height: 861 },
    launchOptions: {
      args: ['--enable-unsafe-swiftshader', '--use-gl=angle', '--hide-scrollbars'],
    },
  },
  webServer: {
    command: 'npm run dev -- --port 5183 --strictPort',
    url: 'http://localhost:5183',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
