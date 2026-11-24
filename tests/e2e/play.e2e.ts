import { campaign, loadCampaigns, pageDate } from '@questender/engine/campaign'
import { CAL_VIEWS } from '@questender/engine/calview'
import { BUNDLED_CATALOG } from '@questender/engine/content/bundled'
import { expect, finishPage, openDesk, pageLines, startCampaign, test, TODAY } from './fixtures'

test('play a check, finish the page and turn it with the arrow', async ({ page }) => {
  await openDesk(page)
  await startCampaign(page, 'The Lamp at Brightwatch')

  await page.locator('.option-btn').first().click()
  await expect(page.locator('.roll-panel')).toBeVisible()
  await expect(page.locator('.roll-panel .total')).toContainText(/total\s*-?\d+/i)
  await page.getByRole('button', { name: 'Accept result' }).click()
  await expect(page.locator('.roll-panel')).toHaveCount(0)
  await expect(page.locator('.result').first()).toContainText(/You rolled \d+/)

  await finishPage(page)
  const next = page.getByRole('button', { name: 'Next day' })
  await expect(next).toBeEnabled()
  const before = await page.locator('.datebar h2').innerText()
  await next.click()
  await expect(page.locator('.datebar h2')).not.toHaveText(before)
  // The page just played is in the Journal.
  await page.getByRole('button', { name: 'Journal' }).click()
  await expect(page.getByRole('button', { name: 'Journal' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText(/You rolled \d+/).first()).toBeVisible()
})

test('the selected campaign decides when the arrow moves on; the other one reads "behind"', async ({ page }) => {
  await openDesk(page)
  await startCampaign(page, 'The Lamp at Brightwatch')
  await startCampaign(page, 'The Ember Road')
  const brightwatch = page.getByRole('tab', { name: /Brightwatch/ })
  const ember = page.getByRole('tab', { name: /Ember Road/ })
  await expect(ember).toHaveAttribute('aria-selected', 'true')
  // Brightwatch began earlier, so it is already behind on the date Ember Road starts.
  await expect(brightwatch).toContainText(/\d+ behind/)
  await expect(page.getByRole('button', { name: 'Next day' })).toBeDisabled()

  await finishPage(page)
  await expect(page.getByRole('button', { name: 'Next day' })).toBeEnabled()
  const before = await page.locator('.datebar h2').innerText()
  await page.getByRole('button', { name: 'Next day' }).click()
  await expect(page.locator('.datebar h2')).not.toHaveText(before)
  await expect(page.getByRole('tab', { name: /Brightwatch/ })).toContainText(/\d+ behind/)
})

test('no future page titles show on the desk or in any calendar layout', async ({ page }) => {
  await loadCampaigns(BUNDLED_CATALOG.map((e) => e.id))
  await openDesk(page)
  await startCampaign(page, 'The Lamp at Brightwatch')
  await startCampaign(page, 'The Starwake')

  const slots = await page.evaluate(() => JSON.parse(localStorage.getItem('questender.slots')!) as { campaignId: string; startDate: string }[])
  expect(slots).toHaveLength(2)
  const later = new Set<string>()
  const allowed = new Set<string>()
  for (const { campaignId, startDate } of slots) {
    const c = campaign(campaignId)
    c.pages.forEach((day, i) => (pageDate(c, i, startDate) > TODAY ? later : allowed).add(day.title))
  }
  for (const t of allowed) later.delete(t)
  expect(later.size).toBeGreaterThan(100)

  const expectNoPeeking = async (where: string) => {
    const lines = await pageLines(page)
    // A title shows up as a heading or label of its own; long ones are also caught inside other text.
    const leaked = [...later].filter((t) => lines.includes(t) || (t.split(' ').length >= 4 && lines.some((l) => l.includes(t))))
    expect(leaked, `future titles visible in ${where}`).toEqual([])
  }

  await expectNoPeeking('the Day view')
  await page.getByRole('tab', { name: 'Calendar' }).click()
  await expect(page.getByRole('tablist', { name: 'Calendar layout' })).toBeVisible()
  for (const { label } of CAL_VIEWS) {
    await page.getByRole('tab', { name: label, exact: true }).click()
    await expect(page.getByRole('tab', { name: label, exact: true })).toHaveAttribute('aria-selected', 'true')
    await expectNoPeeking(`the ${label} calendar`)
  }
  await page.getByRole('tab', { name: 'Day', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Next day' })).toBeVisible()
})
