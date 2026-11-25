import { CAMPAIGNS, expect, openDesk, startCampaign, test } from './fixtures'

for (const { id, title } of CAMPAIGNS) {
  test(`start ${title} from New campaign`, async ({ page }) => {
    const packRequests: string[] = []
    page.on('request', (r) => /\/assets\/.+\.js$/.test(r.url()) && packRequests.push(r.url()))

    await openDesk(page)
    // Packs are lazy: this one is not downloaded until it is needed.
    expect(packRequests.filter((u) => u.includes(`/${id}-`))).toEqual([])
    await startCampaign(page, title)

    expect(packRequests.filter((u) => u.includes(`/${id}-`)).length).toBeGreaterThan(0)
    const tab = page.getByRole('tab', { name: new RegExp(title) })
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    // The desk shows a page: a title, story text and something to choose.
    await expect(page.locator('article.day h2').first()).not.toBeEmpty()
    await expect(page.locator('article.day .narrative').first()).not.toBeEmpty()
    await expect(page.locator('.option-btn').first()).toBeVisible()
    await expect(page.getByText(/page 1 of \d+, begun/)).toBeVisible()
  })
}

test('picking a hero asks first; Go back and Esc start nothing', async ({ page }) => {
  await openDesk(page)
  await page.getByRole('button', { name: 'New campaign' }).click()
  await page.getByRole('button', { name: /^The Lamp at Brightwatch/ }).click()
  const choose = page.getByRole('button', { name: /^Choose / }).first()
  const begin = page.getByRole('button', { name: 'Begin', exact: true })
  const pick = (await begin.isVisible()) ? begin : choose
  await pick.click()
  const confirm = page.getByRole('button', { name: /^Yes, play as / })
  await expect(confirm).toBeFocused()
  await page.getByRole('button', { name: 'Go back' }).click()
  await expect(confirm).toHaveCount(0)
  await pick.click()
  await page.keyboard.press('Escape')
  await expect(confirm).toHaveCount(0)
  await expect(page.getByRole('tab', { name: /Lamp at Brightwatch/ })).toHaveCount(0)
  await pick.click()
  await confirm.click()
  await expect(page.getByRole('tab', { name: /Lamp at Brightwatch/ })).toBeVisible()
})
