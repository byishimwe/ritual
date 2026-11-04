import { defineConfig, devices } from '@playwright/test';

/**
 * Browser-level integration test suite (RITUAL-06 §automated-testing).
 *
 * Builds a separate E2E artifact with explicit instrumentation, then serves it
 * with SwiftShader WebGL under CI and system Chrome locally. Never deploy it.
 */
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results/integration',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI
    ? [['list'], ['github'], ['json', { outputFile: 'test-results/integration-results.json' }]]
    : [['list'], ['json', { outputFile: 'test-results/integration-results.json' }]],
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
    command: 'npm run build:e2e && npm run preview -- --outDir dist-e2e --host 127.0.0.1 --port 5183 --strictPort',
    url: 'http://127.0.0.1:5183',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
