import { defineConfig } from '@playwright/test';
import integration from './playwright.config';

export default defineConfig({
  ...integration,
  testDir: './tests/production',
  outputDir: 'test-results/production',
  timeout: 180_000,
  reporter: process.env.CI
    ? [['list'], ['github'], ['json', { outputFile: 'test-results/production-results.json' }]]
    : [['list'], ['json', { outputFile: 'test-results/production-results.json' }]],
  use: { ...integration.use, baseURL: 'http://127.0.0.1:5184' },
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5184 --strictPort',
    url: 'http://127.0.0.1:5184',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
