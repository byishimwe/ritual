import { defineConfig } from 'vitest/config';

// Playwright drives its own runner; Vitest must not collect its specs.
export default defineConfig({
  test: {
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
  },
});
