import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_PORT ?? 4173)
const CI = !!process.env.CI

// Local escape hatch when Playwright's own Chromium cannot be downloaded:
//   E2E_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:e2e
// Never set in CI.
const executablePath = !CI ? process.env.E2E_CHROME_PATH : undefined

export default defineConfig({
  testDir: '.',
  testMatch: '*.e2e.ts',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [['list'], ['html', { open: 'never', outputFolder: '../../playwright-report' }]] : 'list',
  outputDir: '../../test-results',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}/gerdquest-calendar/`,
    trace: 'retain-on-failure',
    timezoneId: 'UTC',
    locale: 'en-US',
    serviceWorkers: 'block',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } } }],
  // Build once (with the test-only ?today= pin compiled in) and serve it under /gerdquest-calendar/.
  webServer: {
    command: `${process.env.E2E_SKIP_BUILD ? '' : 'npx vite build --outDir dist-e2e --emptyOutDir && '}node tests/e2e/serve.mjs dist-e2e ${PORT}`,
    url: `http://127.0.0.1:${PORT}/gerdquest-calendar/`,
    cwd: '../..',
    env: { VITE_E2E: '1' },
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
})
