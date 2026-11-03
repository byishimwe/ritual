import { defineConfig, devices } from '@playwright/test';

/**
 * Browser-level integration test suite (RITUAL-06 §automated-testing).
 *
 * Runs against the Vite dev server with SwiftShader software WebGL under CI,
 * and Chrome under local verification.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['github']] : [['list']],
  use: {
    ...devices['Desktop Chrome'],
    channel: process.env.PLAYWRIGHT_CHANNEL || (process.env.CI ? undefined : 'chrome'),
    baseURL: 'http://127.0.0.1:5183',
    viewport: { width: 1024, height: 612 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      args: process.env.CI
        ? [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu-watchdog',
            '--use-gl=angle',
            '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader',
            '--hide-scrollbars',
          ]
        : ['--enable-unsafe-swiftshader', '--use-gl=angle', '--hide-scrollbars'],
    },
  },
  webServer: {
    command: process.env.CI
      ? 'npm run preview -- --host 127.0.0.1 --port 5183 --strictPort'
      : 'npm run dev -- --host 127.0.0.1 --port 5183 --strictPort',
    url: 'http://127.0.0.1:5183',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
