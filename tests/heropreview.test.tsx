// @vitest-environment node
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { campaign } from '@questender/engine/campaign'
import { ability, campaignHeroes, heroDef } from '@questender/engine/content'
import { HeroPreview } from '../src/ui/HeroPreview'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

describe.each(['brightwatch', 'emberroad', 'halcyon'])('HeroPreview for %s', (id) => {
  it('shows stats, starting abilities and level-up abilities with full text', () => {
    const heroes = campaignHeroes(campaign(id))
    expect(heroes.length).toBeGreaterThan(0)
    for (const h of heroes) {
      const html = renderToStaticMarkup(<HeroPreview hero={h} />)
      expect(html).toContain(esc(h.name))
      expect(html).toContain(esc(h.blurb))
      expect(html).toContain(`HP ${h.maxHp}`)
      expect(html).toContain(`d${h.dmgDie}`)
      expect(html).toContain(esc(h.weapon))
      expect(html).toContain('Level progression')
      for (const aid of h.abilities) {
        expect(html).toContain(esc(ability(aid).name))
        expect(html).toContain(esc(ability(aid).text))
      }
      for (const [l, s] of Object.entries(h.levels)) {
        if (Number(l) >= 2 && Number(l) <= 8 && s.ability) expect(html).toContain(esc(ability(s.ability).text))
      }
    }
  })
})

describe('HeroPreview extras', () => {
  it('shows pools for pool heroes', () => {
    const h = campaignHeroes(campaign('emberroad')).find((x) => x.pools)
    expect(h).toBeTruthy()
    expect(renderToStaticMarkup(<HeroPreview hero={h!} />)).toContain('pool')
  })
  it('renders the start hero of each campaign', () => {
    for (const id of ['brightwatch', 'emberroad', 'halcyon']) {
      const h = heroDef(campaign(id).startHero!)
      expect(renderToStaticMarkup(<HeroPreview hero={h} />)).toContain(esc(h.title))
    }
  })
})
