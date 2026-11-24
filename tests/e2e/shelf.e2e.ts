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
  const file = testInfo.outputPath('questender-all.json')
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
