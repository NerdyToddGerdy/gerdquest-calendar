import { defineConfig } from 'vitest/config'

// Opt-in balance simulator; the normal `vitest run` only picks up tests/*.test.ts.
export default defineConfig({ test: { include: ['tests/sim/**/*.sim.ts'] } })
