import { expect, openDesk, startCampaign, test } from './fixtures'

test.describe('landing without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('renders its content, metadata and a call to action that leads to play/', async ({ page, baseURL }) => {
    await page.goto('')
    await expect(page).toHaveTitle(/^GerdQuest Calendar/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('One page of adventure, every day')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /one page per real day/)
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /GerdQuest Calendar/)
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/)
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\.png$/)
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image')
    const cta = page.locator('#cta')
    await expect(cta).toHaveText('Start playing')
    expect(new URL((await cta.getAttribute('href'))!, page.url()).href).toBe(`${baseURL}play/`)
  })
})

test.describe('landing with JavaScript', () => {
  test('a returning player with saves goes to play/, and ?stay keeps the landing page', async ({ page }) => {
    await openDesk(page)
    await startCampaign(page, 'The Lamp at Brightwatch')
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('questender.slots')!).length)).toBe(1)

    await page.goto('')
    await expect(page).toHaveURL(/\/gerdquest-calendar\/play\/$/)
    await expect(page.getByRole('tab', { name: /Brightwatch/ })).toBeVisible()

    await page.goto('?stay')
    await expect(page).toHaveURL(/\/gerdquest-calendar\/\?stay$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('One page of adventure, every day')
  })

  test('a first-time visitor stays on the landing page and the CTA opens the desk', async ({ page }) => {
    await page.goto('')
    await page.locator('#cta').click()
    await expect(page).toHaveURL(/\/gerdquest-calendar\/play\/$/)
    await expect(page.getByRole('button', { name: 'Start your first campaign' })).toBeVisible()
  })
})

test('a bogus path gets the 404 page with status 404', async ({ page }) => {
  const response = await page.goto('definitely-not-a-page')
  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle(/Page not found/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("This page isn't on the calendar")
  await expect(page.getByRole('link', { name: 'Open your desk' })).toHaveAttribute('href', '/gerdquest-calendar/play/')
  await expect(page.locator('link[rel="stylesheet"][href$="site.css"]')).toHaveAttribute('href', '/gerdquest-calendar/site.css')
})

test('privacy and terms pages load', async ({ page }) => {
  await page.goto('privacy.html')
  await expect(page).toHaveTitle(/Privacy/)
  await page.goto('terms.html')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use')
})

test('the game title in the desk links back to the start page', async ({ page }) => {
  await page.goto('play/')
  await page.getByRole('link', { name: 'GerdQuest Calendar' }).first().click()
  await expect(page).toHaveURL(/\/gerdquest-calendar\/\?stay$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
