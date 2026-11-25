import { readFile, writeFile } from 'node:fs/promises'
import { exportAllCode, expect, importCode, openDesk, startCampaign, test } from './fixtures'

const settingsButton = (page: import('@playwright/test').Page) => page.getByRole('button', { name: /^Settings/ })

test('Export all, then Import in a fresh context restores the same tabs', async ({ page, browser, baseURL }) => {
  await openDesk(page)
  await startCampaign(page, 'The Lamp at Brightwatch')
  await startCampaign(page, 'The Halcyon Debt')
  const tabs = async (p: typeof page) => (await p.getByRole('tab').filter({ hasText: /Brightwatch|Halcyon/ }).allInnerTexts()).map((t) => t.replace(/\s+/g, ' '))
  const original = await tabs(page)
  expect(original).toHaveLength(2)

  const code = await exportAllCode(page)
  expect(code.startsWith('GQC1')).toBe(true)
  expect(code).not.toMatch(/\s/)

  const fresh = await browser.newContext({ baseURL })
  try {
    await fresh.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const other = await fresh.newPage()
    const problems: string[] = []
    other.on('console', (m) => m.type() === 'error' && problems.push(m.text()))
    other.on('pageerror', (e) => problems.push(e.message))
    await openDesk(other)
    await expect(other.getByRole('tab').filter({ hasText: /Brightwatch|Halcyon/ })).toHaveCount(0)
    await importCode(other, code)
    await expect(other.getByRole('tab').filter({ hasText: /Brightwatch|Halcyon/ })).toHaveCount(2)
    expect(await tabs(other)).toEqual(original)
    await other.reload()
    await expect(other.getByRole('tab').filter({ hasText: /Brightwatch|Halcyon/ })).toHaveCount(2)
    expect(problems).toEqual([])
  } finally {
    await fresh.close()
  }
})

test('Export code dialog: copy and save work, Esc closes and returns focus', async ({ page, context }, testInfo) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await openDesk(page)
  await startCampaign(page, 'The Ember Road')
  const exportBtn = page.getByRole('button', { name: 'Export', exact: true })
  await exportBtn.click()
  const dialog = page.getByRole('dialog', { name: /^Export / })
  const field = dialog.getByRole('textbox', { name: 'Save code' })
  await expect(field).toHaveValue(/^GQC1u?\./)
  const code = await field.inputValue()
  await expect(dialog).toContainText(/about [\d,]+ characters/)
  await page.bringToFront()
  await dialog.getByRole('button', { name: 'Copy code' }).click()
  await expect(dialog.getByRole('status')).toContainText('copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code)

  const download = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Save as text file' }).click()
  const saved = await download
  expect(saved.suggestedFilename()).toMatch(/^gerdquest-emberroad-\d{4}-\d{2}-\d{2}-\d{4}-\d{2}-\d{2}\.txt$/)
  const file = testInfo.outputPath('code.txt')
  await saved.saveAs(file)
  expect(await readFile(file, 'utf8')).toBe(code)

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(exportBtn).toBeFocused()
})

test('Import dialog: a code file, an old .json file, and a mistyped code', async ({ page, browser, baseURL }, testInfo) => {
  await openDesk(page)
  await startCampaign(page, 'The Ember Road')
  const code = await exportAllCode(page)
  const txt = testInfo.outputPath('code.txt')
  await writeFile(txt, code + '\n')

  const fresh = await browser.newContext({ baseURL })
  try {
    await fresh.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const other = await fresh.newPage()
    await openDesk(other)
    await other.getByRole('button', { name: /^or import a save/ }).click()
    const dialog = other.getByRole('dialog', { name: 'Import a save' })
    await dialog.getByRole('textbox', { name: 'Paste a save code' }).fill(code.slice(0, code.length - 40))
    await dialog.getByRole('button', { name: 'Open this code' }).click()
    await expect(dialog.getByRole('alert')).toContainText('incomplete or mistyped')
    await dialog.getByLabel('Save file').setInputFiles(txt)
    await expect(other.getByRole('tab', { name: /Ember Road/ })).toBeVisible()
    await expect(dialog).toHaveCount(0)
  } finally {
    await fresh.close()
  }
})

test('Import dialog still opens an old .json export file', async ({ page, browser, baseURL }, testInfo) => {
  await openDesk(page)
  await startCampaign(page, 'The Ember Road')
  const code = await exportAllCode(page)
  const json = await page.evaluate(async (c) => {
    // Rebuild the old-style file from the code, as the previous export wrote it.
    const text = c.replace(/^GQC1u?\./, '').split('.')[0].replace(/-/g, '+').replace(/_/g, '/')
    const bin = Uint8Array.from(atob(text), (ch) => ch.charCodeAt(0))
    const out = await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text()
    return JSON.stringify(JSON.parse(out), null, 2)
  }, code)
  const file = testInfo.outputPath('gerdquest-all.json')
  await writeFile(file, json)

  const fresh = await browser.newContext({ baseURL })
  try {
    await fresh.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }))
    const other = await fresh.newPage()
    await openDesk(other)
    await other.getByRole('button', { name: /^or import a save/ }).click()
    await other.getByRole('dialog', { name: 'Import a save' }).getByLabel('Save file').setInputFiles(file)
    await expect(other.getByRole('tab', { name: /Ember Road/ })).toBeVisible()
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
  await expect(page).toHaveURL(/\/gerdquest-calendar\/privacy\.html$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy')
  await page.goBack()
  await settingsButton(page).click()
  await page.getByRole('dialog', { name: 'Settings' }).getByRole('link', { name: 'Terms' }).click()
  await expect(page).toHaveURL(/\/gerdquest-calendar\/terms\.html$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use')
})
