import { CAMPAIGNS, expect, openDesk, startCampaign, test } from './fixtures'

test.describe('many campaign tabs', () => {
  for (const [name, size] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 390, height: 844 }]] as const) {
    test(`six campaigns stay reachable on ${name}`, async ({ page }) => {
      test.setTimeout(90_000)
      await page.setViewportSize(size)
      await openDesk(page)
      for (const c of CAMPAIGNS) await startCampaign(page, c.title)
      // A sixth run of the first campaign, on a different start date.
      await page.getByRole('button', { name: 'New campaign' }).click()
      await page.getByRole('button', { name: new RegExp(`^${CAMPAIGNS[0].title}`) }).click()
      await page.getByRole('radio').last().check()
      const begin = page.getByRole('button', { name: 'Begin', exact: true })
      const choose = page.getByRole('button', { name: /^Choose / }).first()
      await (await begin.isVisible() ? begin : choose).click()
      await page.getByRole('button', { name: /^Yes, play as / }).click()

      const tabs = page.locator('.tabs').getByRole('tab')
      await expect(tabs).toHaveCount(6)
      const strip = page.locator('.tabs')
      const fits = () => strip.evaluate((el) => ({ over: el.scrollWidth > el.clientWidth + 1, page: document.documentElement.scrollWidth > window.innerWidth }))

      expect((await fits()).page).toBe(false)
      // The selected tab is in view.
      await expect(tabs.and(page.locator('[aria-selected=true]'))).toBeInViewport({ ratio: 0.9 })

      if (name === 'desktop') {
        // Wide screens wrap instead of scrolling: every tab is visible at once.
        expect((await fits()).over).toBe(false)
        for (let i = 0; i < 6; i++) await expect(tabs.nth(i)).toBeInViewport({ ratio: 0.9 })
      } else {
        // Phones scroll sideways, with a visible cue and a way to scroll back.
        expect((await fits()).over).toBe(true)
        await tabs.first().click()
        await expect(page.getByRole('button', { name: 'Scroll tabs right' })).toBeVisible()
        await tabs.last().click()
        await expect(tabs.last()).toBeInViewport({ ratio: 0.9 })
        await expect(page.getByRole('button', { name: 'Scroll tabs left' })).toBeVisible()
        const before = await strip.evaluate((el) => el.scrollLeft)
        await page.getByRole('button', { name: 'Scroll tabs left' }).click()
        await expect.poll(() => strip.evaluate((el) => el.scrollLeft)).toBeLessThan(before)
        await tabs.first().focus()
        await page.keyboard.press('Enter')
        await expect(tabs.first()).toHaveAttribute('aria-selected', 'true')
        await expect(tabs.first()).toBeInViewport({ ratio: 0.9 })
      }
    })
  }
})
