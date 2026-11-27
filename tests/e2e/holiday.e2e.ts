import { expect, openDesk, test } from './fixtures'

// Saving Santa, the December advent campaign: offered only in December, in a
// highlight at the top of New campaign, with a festive New campaign button
// until this year's run is on the desk.

test('outside December there is no event and no festive button', async ({ page }) => {
  await openDesk(page, '2026-11-30')
  const btn = page.getByRole('button', { name: 'New campaign' })
  await expect(btn).not.toHaveClass(/festive/)
  await btn.click()
  await expect(page.locator('.event-highlight')).toHaveCount(0)
  await expect(page.getByText('Saving Santa')).toHaveCount(0)
})

test('on December 1 the event is highlighted, starts on the 1st, and the button calms down once started', async ({ page }) => {
  await openDesk(page, '2026-12-01')
  const btn = page.getByRole('button', { name: /^New campaign/ })
  await expect(btn).toHaveClass(/festive/)
  await expect(btn).toHaveAccessibleName('New campaign (Saving Santa is here)')

  await btn.click()
  const event = page.getByRole('region', { name: 'Holiday event: Saving Santa' })
  await expect(event).toBeVisible()
  await expect(event).toContainText('this month only')
  await expect(event).toContainText('31 days left to start')
  // The event sits above the year-round campaigns.
  const eventBox = (await event.boundingBox())!
  const firstCard = (await page.locator('.campaign-pick').first().boundingBox())!
  expect(eventBox.y).toBeLessThan(firstCard.y)

  await event.getByRole('button', { name: 'Play this event' }).click()
  await expect(event.getByRole('button', { name: 'Selected' })).toBeVisible()
  await expect(page.getByText('always on the 1st')).toBeVisible()
  await expect(page.getByText('Tuesday, Dec 1, 2026')).toBeVisible()

  await page.getByRole('button', { name: 'Choose Juniper' }).click()
  await page.getByRole('button', { name: /^Yes, play as / }).click()
  await expect(page.getByRole('tab', { name: /Saving Santa/ })).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('article.day h2').first()).toHaveText('The First Door')

  await expect(page.getByRole('button', { name: 'New campaign', exact: true })).not.toHaveClass(/festive/)
})

test('starting late in December opens the doors already passed', async ({ page }) => {
  await openDesk(page, '2026-12-10')
  await page.getByRole('button', { name: /^New campaign/ }).click()
  await page.getByRole('button', { name: 'Play this event' }).click()
  await expect(page.getByText('9 days ago')).toBeVisible()
  await expect(page.getByText('10 pages open already')).toBeVisible()
})
