import { defineConfig } from 'vitest/config';

// Playwright drives its own runner; Vitest must not collect its specs.
export default defineConfig({
  test: {
    include: ['tests/domain/**/*.test.ts'],
  },
});
