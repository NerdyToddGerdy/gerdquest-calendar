import { readFile } from 'node:fs/promises'
import { expect, finishPage, openDesk, startCampaign, test } from './fixtures'

const shelfTab = (page: import('@playwright/test').Page) => page.getByRole('tab', { name: 'Shelf', exact: true })

test('finishing a page earns First light, shown by a toast and on the shelf, and survives export and import', async ({ page, browser, baseURL }, testInfo) => {
  await openDesk(page)
  await startCampaign(page, 'The Lamp at Brightwatch')

  await shelfTab(page).click()
  const first = page.getByRole('listitem').filter({ hasText: 'First light' })
  await expect(first).toHaveCount(0) // unearned achievements read as ???
  await expect(page.getByText('Finish a page.')).toBeVisible()
  await page.getByRole('tab', { name: 'Day', exact: true }).click()

  await finishPage(page)
  await expect(page.getByRole('status').filter({ hasText: 'First light' })).toBeVisible()

  await shelfTab(page).click()
  await expect(first).toContainText('Your first page is done')
  await expect(page.getByText('Finish a page.')).toHaveCount(0)

  await page.getByRole('button', { name: /^Settings/ }).click()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export all campaigns' }).click()
  const file = testInfo.outputPath('gerdquest-all.json')
  await (await download).saveAs(file)
  const bundle = JSON.parse(await readFile(file, 'utf8'))
  expect(bundle.progress.achievements.map((a: { id: string }) => a.id)).toContain('first-light')

  const fresh = await browser.newContext({ baseURL })
  try {
    await fresh.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const other = await fresh.newPage()
    const problems: string[] = []
    other.on('console', (m) => m.type() === 'error' && problems.push(m.text()))
    other.on('pageerror', (e) => problems.push(e.message))
    await openDesk(other)
    await other.locator('input[type="file"]').setInputFiles(file)
    await expect(other.getByRole('tab', { name: /Brightwatch/ })).toBeVisible()
    await shelfTab(other).click()
    await expect(other.getByRole('listitem').filter({ hasText: 'First light' })).toContainText('Your first page is done')
    expect(problems).toEqual([])
  } finally {
    await fresh.close()
  }
})

test('starting a campaign grants the hero’s token, which sits top right and can be picked', async ({ page }) => {
  await openDesk(page)
  // Before any campaign, the token button holds the plain token.
  const token = page.getByRole('button', { name: /^Your token: plain token, plain border/ })
  await expect(token).toBeVisible()

  await startCampaign(page, 'The Lamp at Brightwatch')
  await expect(token).toBeVisible()

  // Top right of the bar, beside the Settings button.
  const settings = await page.getByRole('button', { name: /^Settings/ }).boundingBox()
  const box = await token.boundingBox()
  expect(box && settings && box.x > settings.x && Math.abs(box.y - settings.y) < 8).toBe(true)
  expect(box?.width).toBeGreaterThanOrEqual(36)

  await token.click()
  const dialog = page.getByRole('dialog', { name: 'Your token' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('radio', { name: /Wren Ashvale/ })).toBeVisible() // earned by starting with Wren
  await expect(dialog.getByText('???').first()).toBeVisible() // unearned rims and emblems stay hidden
  await dialog.getByRole('radio', { name: /Wren Ashvale/ }).click()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('button', { name: /^Your token: Wren Ashvale, plain border/ })).toBeVisible()

  // The choice survives a reload.
  await page.reload()
  await expect(page.getByRole('button', { name: /^Your token: Wren Ashvale, plain border/ })).toBeVisible()
})
