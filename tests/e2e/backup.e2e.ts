import { readFile } from 'node:fs/promises'
import { expect, openDesk, startCampaign, test } from './fixtures'

const settingsButton = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /^Settings/ })

test('Export all, then Import in a fresh context restores the same tabs', async ({ page, browser, baseURL }, testInfo) => {
  await openDesk(page)
  await startCampaign(page, 'The Lamp at Brightwatch')
  await startCampaign(page, 'The Halcyon Debt')
  const tabs = async (p: typeof page) => (await p.getByRole('tab').filter({ hasText: /Brightwatch|Halcyon/ }).allInnerTexts()).map((t) => t.replace(/\s+/g, ' '))
  const original = await tabs(page)
  expect(original).toHaveLength(2)

  await settingsButton(page).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export all campaigns' }).click()
  const file = testInfo.outputPath('questender-all.json')
  await (await download).saveAs(file)
  expect(JSON.parse(await readFile(file, 'utf8'))).toMatchObject({ format: 'questender.bundle', campaigns: [{}, {}] })

  const fresh = await browser.newContext({ baseURL })
  try {
    await fresh.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const other = await fresh.newPage()
    const problems: string[] = []
    other.on('console', (m) => m.type() === 'error' && problems.push(m.text()))
    other.on('pageerror', (e) => problems.push(e.message))
    await openDesk(other)
    await expect(other.getByRole('tab').filter({ hasText: /Brightwatch|Halcyon/ })).toHaveCount(0)
    await other.locator('input[type="file"]').setInputFiles(file)
    await expect(other.getByRole('tab').filter({ hasText: /Brightwatch|Halcyon/ })).toHaveCount(2)
    expect(await tabs(other)).toEqual(original)
    await other.reload()
    await expect(other.getByRole('tab').filter({ hasText: /Brightwatch|Halcyon/ })).toHaveCount(2)
    expect(problems).toEqual([])
  } finally {
    await fresh.close()
  }
})

test('settings: the theme choice persists and the legal links work', async ({ page }) => {
  await openDesk(page)
  await startCampaign(page, 'The Ember Road')
  await settingsButton(page).click()
  const dialog = page.getByRole('dialog', { name: 'Settings' })
  await dialog.getByRole('radio', { name: 'Dark' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await settingsButton(page).click()
  await expect(dialog.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true')
  await dialog.getByRole('radio', { name: 'Light' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')

  await dialog.getByRole('link', { name: 'Privacy' }).click()
  await expect(page).toHaveURL(/\/questender\/privacy\.html$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy')
  await page.goBack()
  await settingsButton(page).click()
  await page.getByRole('dialog', { name: 'Settings' }).getByRole('link', { name: 'Terms' }).click()
  await expect(page).toHaveURL(/\/questender\/terms\.html$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use')
})
