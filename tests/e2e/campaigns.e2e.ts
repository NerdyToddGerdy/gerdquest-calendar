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
