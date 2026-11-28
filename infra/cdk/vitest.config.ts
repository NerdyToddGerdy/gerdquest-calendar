import { defineConfig } from 'vitest/config';

// Synthesizing bundles each Lambda with esbuild, so give tests room.
export default defineConfig({
  test: { include: ['test/**/*.test.ts'], testTimeout: 60_000, hookTimeout: 60_000 },
});
