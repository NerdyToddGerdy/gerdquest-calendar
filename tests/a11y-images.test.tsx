// Image accessibility: every <img> has alt text, every <svg> is either hidden
// from assistive tech or has an accessible name, and icon buttons are named.
import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { listCampaigns } from '@questender/engine/campaign'
import { Portrait } from '../src/ui/Portrait'
import { PORTRAITS } from '../src/ui/portraits/specs'
import { Scene } from '../src/ui/Scene'

/** Problems found in a chunk of markup (empty when it is fine). */
function imageProblems(html: string): string[] {
  const out: string[] = []
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt=/.test(m[0])) out.push(`img without alt: ${m[0]}`)
  for (const m of html.matchAll(/<svg\b[^>]*>/g)) {
    const tag = m[0]
    const hidden = /aria-hidden="true"/.test(tag)
    const named = /role="img"/.test(tag) && /aria-label="[^"]+"|aria-labelledby=/.test(tag)
    if (!hidden && !named) out.push(`svg without a name or aria-hidden: ${tag.slice(0, 80)}`)
  }
  return out
}

const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')

describe('image accessibility', () => {
  it('static pages: img has alt, svg is hidden or named', () => {
    for (const f of ['index.html', 'play/index.html', 'privacy.html', 'terms.html', '404.html']) {
      expect(imageProblems(read(f)), f).toEqual([])
    }
  })

  it('every scene kind used by a campaign renders hidden art and named, focusable finds', () => {
    const scenes = new Set<string>()
    for (const c of listCampaigns()) for (const p of c.pages) scenes.add(p.scene)
    expect(scenes.size).toBeGreaterThan(10)
    for (const scene of scenes) {
      const html = renderToStaticMarkup(
        <Scene scene={scene as never} icons={[{ x: 10, y: 20, kind: 'pickpocket' }, { x: 50, y: 60, kind: 'cache' }] as never} found={[false, false]} disabled={false} onFind={() => {}} />,
      )
      expect(imageProblems(html), scene).toEqual([])
      const buttons = [...html.matchAll(/<button\b[^>]*>/g)].map((m) => m[0])
      expect(buttons).toHaveLength(2)
      for (const b of buttons) expect(b, scene).toMatch(/aria-label="[^"]+"/)
    }
  })

  it('every portrait is named', () => {
    for (const id of Object.keys(PORTRAITS)) {
      const html = renderToStaticMarkup(<Portrait id={id} name={`Name of ${id}`} />)
      expect(imageProblems(html), id).toEqual([])
      expect(html, id).toContain(`Name of ${id}`)
    }
  })
})
