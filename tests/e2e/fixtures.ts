import { expect, test as base, type Page } from '@playwright/test'

/** The pinned "today" for every game test (a Wednesday). Needs the VITE_E2E build the config makes. */
export const TODAY = '2026-03-18'

export const CAMPAIGNS = [
  { id: 'brightwatch', title: 'The Lamp at Brightwatch' },
  { id: 'emberroad', title: 'The Ember Road' },
  { id: 'halcyon', title: 'The Halcyon Debt' },
  { id: 'starwake', title: 'The Starwake' },
  { id: 'verdant', title: 'The Verdant Accord' },
] as const

/**
 * `test` with two guarantees on every spec: nothing leaves the machine (the
 * any off-site request gets an empty answer; fonts are self-hosted), and the page logs no console
 * errors, page errors or failed requests.
 */
export const test = base.extend<{ problems: string[] }>({
  problems: [
    async ({ context, page }, use) => {
      const problems: string[] = []
      await context.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.fulfill({ status: 200, contentType: 'text/css', body: '' }))
      page.on('console', (m) => m.type() === 'error' && !m.location().url.includes('/definitely-not-a-page') && problems.push(`console: ${m.text()}`))
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))
      // Aborted requests are just navigations interrupting a load.
      page.on('requestfailed', (r) => r.failure()?.errorText !== 'net::ERR_ABORTED' && problems.push(`requestfailed: ${r.url()}`))
      page.on('response', (r) => {
        // 404.html is expected to be served with a 404, only for the bogus path under test.
        if (r.status() >= 400 && !r.url().includes('/definitely-not-a-page')) problems.push(`http ${r.status()}: ${r.url()}`)
      })
      await use(problems)
      expect(problems, 'browser problems').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }

/** Open the game with "today" pinned. */
export async function openDesk(page: Page, today = TODAY) {
  await page.goto(`play/?today=${today}`)
  await expect(page.getByRole('button', { name: 'New campaign' })).toBeVisible()
}

/** From the desk: New campaign, pick the campaign, begin (with the first hero if it offers a choice). */
export async function startCampaign(page: Page, title: string) {
  await page.getByRole('button', { name: 'New campaign' }).click()
  await page.getByRole('button', { name: new RegExp(`^${title}`) }).click()
  const begin = page.getByRole('button', { name: 'Begin', exact: true })
  const choose = page.getByRole('button', { name: /^Choose / }).first()
  await expect(begin.or(choose)).toBeVisible()
  await (await begin.isVisible() ? begin : choose).click()
  await page.getByRole('button', { name: /^Yes, play as / }).click()
  await expect(page.getByRole('tab', { name: new RegExp(title) })).toBeVisible()
}

/** Play whatever is open on the selected page until it reports "Page complete" (choose, roll, accept). */
export async function finishPage(page: Page) {
  const done = page.locator('.day-footer', { hasText: 'Page complete' })
  for (let i = 0; i < 12 && !(await done.isVisible()); i++) {
    const before = await page.locator('.step.done').count()
    await page.locator('.step:not(.done) .option-btn:enabled').first().click()
    const accept = page.getByRole('button', { name: 'Accept result' })
    await expect(accept.or(page.locator('.step.done').nth(before))).toBeVisible()
    if (await accept.isVisible()) await accept.click()
  }
  await expect(done).toBeVisible()
}

/** Every line of visible text plus every aria-label / title / alt value: what a player (or screen reader) could find on the page. */
export async function pageLines(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const attrs = [...document.querySelectorAll('[aria-label],[title],[alt]')].flatMap((e) => ['aria-label', 'title', 'alt'].map((a) => e.getAttribute(a) ?? ''))
    return [...document.body.innerText.split('\n'), ...attrs].map((l) => l.trim()).filter(Boolean)
  })
}

/** Open Settings, press Export all campaigns, and return the code shown in the dialog. */
export async function exportAllCode(page: Page): Promise<string> {
  await page.getByRole('button', { name: /^Settings/ }).click()
  await page.getByRole('button', { name: 'Export all campaigns' }).click()
  const dialog = page.getByRole('dialog', { name: 'Export all campaigns' })
  const field = dialog.getByRole('textbox', { name: 'Save code' })
  await expect(field).toHaveValue(/^GQC2u?\./)
  const code = await field.inputValue()
  await dialog.getByRole('button', { name: 'Done' }).click()
  return code
}

/** Paste a code (or JSON text) into the Import dialog opened from the title screen. */
export async function importCode(page: Page, code: string) {
  await page.getByRole('button', { name: /^or import a save/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Import a save' })
  await dialog.getByRole('textbox', { name: 'Paste a save code' }).fill(code)
  await dialog.getByRole('button', { name: 'Open this code' }).click()
}
