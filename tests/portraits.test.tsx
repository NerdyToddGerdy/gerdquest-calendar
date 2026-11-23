// Character portraits: every hero and boss has one, and they render in cards,
// sheets and scenes.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { listCampaigns } from '../src/engine/campaign'
import { campaignHeroes, enemy, heroDef } from '../src/engine/content'
import { hasPortrait } from '../src/ui/portraits/art'
import { PORTRAITS } from '../src/ui/portraits/specs'
import { Portrait } from '../src/ui/Portrait'
import { Scene } from '../src/ui/Scene'

const heroIds = new Set<string>()
const bossIds = new Set<string>()
for (const c of listCampaigns()) {
  for (const h of campaignHeroes(c)) heroIds.add(h.id)
  if (c.startHero) heroIds.add(c.startHero)
  for (const p of c.pages) {
    for (const st of p.steps) for (const o of st.options) for (const e of [...(o.effects ?? []), ...(o.bands ?? []).flatMap((b) => b.effects ?? [])]) if (e.type === 'setHero') heroIds.add(e.heroId)
    if (p.note?.startsWith('A single foe')) bossIds.add(p.combat!.enemies[0])
  }
}

// Brightwatch and Halcyon bosses aren't marked with the Stun-rule note; list them.
for (const id of [
  'bw-paleHerald', 'bw-bellWarden', 'bw-ropeGnawer', 'bw-sedgeMother', 'bw-tarnSerpent', 'bw-hushknight', 'bw-abyssalShepherd', 'bw-abbessVane',
  'bw-fogwyrm', 'bw-bellBreaker', 'bw-drownedHost', 'bw-heirGuard', 'bw-vaneUnbound', 'bw-paleHeir', 'bw-paleTide',
  'hd_kessel', 'hd_strand', 'hd_sela', 'hd_sentinel', 'hd_bloom', 'hd_vell', 'hd_fane', 'hd_choirwarden', 'hd_quell', 'hd_executor', 'hd_thale',
])
  bossIds.add(id)

describe('portraits', () => {
  it('every playable hero has one', () => {
    expect([...heroIds].filter((id) => !hasPortrait(id))).toEqual([])
  })

  it('every boss has one', () => {
    expect(bossIds.size).toBeGreaterThan(40)
    expect([...bossIds].filter((id) => !hasPortrait(id))).toEqual([])
  })

  it('every portrait belongs to a real hero or enemy', () => {
    for (const id of Object.keys(PORTRAITS)) {
      const known = (() => {
        try {
          heroDef(id)
          return true
        } catch {
          try {
            enemy(id)
            return true
          } catch {
            return false
          }
        }
      })()
      expect(known, id).toBe(true)
    }
  })

  it('renders as a labelled drawing, and nothing for unknown ids', () => {
    expect(renderToStaticMarkup(<Portrait id="sw_bram" name="Bram Hollis" />)).toMatch(/<svg[^>]*aria-label="Bram Hollis"/)
    expect(renderToStaticMarkup(<Portrait id="nobody" name="Nobody" />)).toBe('')
  })

  it('a scene can hold the hero and a boss facing them', () => {
    const html = renderToStaticMarkup(<Scene scene="sw_deck" icons={[]} found={[]} disabled onFind={() => {}} actors={{ hero: 'sw_reyna', foe: 'sw_teague' }} />)
    expect(html.match(/class="scene-actor"/g)).toHaveLength(2)
    expect(html).toContain('scale(-1 1)')
  })
})
