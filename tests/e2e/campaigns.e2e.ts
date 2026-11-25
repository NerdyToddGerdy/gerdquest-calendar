import { CAMPAIGNS, expect, finishPage, openDesk, startCampaign, test } from './fixtures'

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

test('a mid-story hand-off asks first, names who steps aside, and Go back changes nothing', async ({ page }) => {
  await openDesk(page)
  await startCampaign(page, 'The Verdant Accord')
  // Age the save by a month so the prologue pages are all unlocked, then play Agathe's
  // pages until the muster, where the story passes to a chosen hero.
  await page.evaluate(() => {
    const shift = (d: string) => new Date(Date.parse(d) - 28 * 864e5).toISOString().slice(0, 10)
    const metas = JSON.parse(localStorage.getItem('questender.slots')!) as { slotId: string; startDate: string }[]
    for (const m of metas) {
      const key = `questender.slot.${m.slotId}`
      const st = JSON.parse(localStorage.getItem(key)!)
      st.startDate = m.startDate = shift(st.startDate)
      localStorage.setItem(key, JSON.stringify(st))
    }
    localStorage.setItem('questender.slots', JSON.stringify(metas))
  })
  await page.reload()
  await page.getByRole('tab', { name: /Verdant Accord/ }).click()
  const heading = page.locator('article.day h2').first()
  for (let i = 0; i < 8 && !(await heading.innerText()).includes('The Muster'); i++) {
    await finishPage(page)
    const before = await heading.innerText()
    await page.getByRole('button', { name: /^Turn to the next page/ }).click()
    await expect(heading).not.toHaveText(before)
    await expect(page.locator('article.day')).toHaveCount(1) // the page-turn animation has finished
  }
  await expect(heading).toContainText('The Muster at the Ferry Inn')

  const hero = () => page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('questender.slots')!)) + JSON.stringify(Object.entries(localStorage).filter(([k]) => k !== 'questender.slots')))
  const before = await hero()
  await page.locator('.option-btn', { hasText: 'Brannoc Tull, Wagon Guard' }).click()
  const dialog = page.getByRole('dialog', { name: 'Play as Brannoc?' })
  await expect(dialog).toContainText(/Agathe Rook’s story ends here; Brannoc Tull carries on\./)
  await expect(page.getByRole('button', { name: 'Yes, play as Brannoc' })).toBeFocused()

  await page.getByRole('button', { name: 'Go back' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('.step:not(.done) .option-btn:enabled').first()).toBeVisible()
  expect(await hero()).toBe(before)

  await page.locator('.option-btn', { hasText: 'Brannoc Tull, Wagon Guard' }).click()
  await page.getByRole('button', { name: 'Yes, play as Brannoc' }).click()
  await expect(dialog).toHaveCount(0)
  expect(await hero()).not.toBe(before)
  await expect(page.locator('article.day')).toContainText('Brannoc')
  await expect(page.locator('body')).not.toContainText('Agathe Rook’s story ends here')
})

for (const theme of ['light', 'dark'] as const) {
  test(`the hero confirm fits a 390px phone (${theme})`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 780 })
    await page.emulateMedia({ colorScheme: theme })
    await openDesk(page)
    await page.getByRole('button', { name: 'New campaign' }).click()
    await page.getByRole('button', { name: /^The Lamp at Brightwatch/ }).click()
    const begin = page.getByRole('button', { name: 'Begin', exact: true })
    const choose = page.getByRole('button', { name: /^Choose / }).first()
    await (await begin.isVisible() ? begin : choose).click()
    const confirm = page.getByRole('button', { name: /^Yes, play as / })
    await expect(confirm).toBeFocused()
    const back = page.getByRole('button', { name: 'Go back' })
    await page.screenshot({ path: process.env.E2E_SHOTS ? `${process.env.E2E_SHOTS}/confirm-${theme}.png` : info.outputPath(`confirm-${theme}.png`) })

    const vw = 390
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    for (const b of [confirm, back]) {
      await expect(b).toBeInViewport({ ratio: 1 })
      const box = (await b.boundingBox())!
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(vw)
    }
    const modal = (await page.getByRole('dialog', { name: /^Play as / }).boundingBox())!
    expect(modal.x).toBeGreaterThanOrEqual(0)
    expect(modal.x + modal.width).toBeLessThanOrEqual(vw)
  })
}
