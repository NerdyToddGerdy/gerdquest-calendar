import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const pub = (f: string) => new URL(`../public/${f}`, import.meta.url)
const manifest = JSON.parse(readFileSync(pub('site.webmanifest'), 'utf8')) as Record<string, unknown> & {
  icons: { src: string; sizes: string; type: string; purpose?: string }[]
}
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

describe('web app manifest', () => {
  it('has the required fields and stays relative so any sub-path works', () => {
    for (const k of ['name', 'short_name', 'start_url', 'scope', 'display', 'theme_color', 'background_color']) expect(manifest[k]).toBeTruthy()
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('./')
    expect(manifest.scope).toBe('./')
  })
  it('lists existing icons including 192, 512 and a maskable one', () => {
    for (const i of manifest.icons) expect(existsSync(pub(i.src))).toBe(true)
    const png = manifest.icons.filter((i) => i.type === 'image/png')
    expect(png.some((i) => i.sizes === '192x192')).toBe(true)
    expect(png.some((i) => i.sizes === '512x512' && i.purpose === 'any')).toBe(true)
    expect(png.some((i) => i.sizes === '512x512' && i.purpose === 'maskable')).toBe(true)
  })
  it('index.html links the manifest, apple icon and theme colours', () => {
    expect(html).toContain('rel="manifest" href="/site.webmanifest"')
    expect(existsSync(pub('apple-touch-icon.png'))).toBe(true)
    expect(html).toContain('href="/apple-touch-icon.png"')
    expect(html).toMatch(/theme-color[^>]*prefers-color-scheme: light/)
    expect(html).toMatch(/theme-color[^>]*prefers-color-scheme: dark/)
  })
})
