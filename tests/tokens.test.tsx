// Player tokens and borders: earned by play only, shown top right, chosen in a picker.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { addDays } from '@questender/engine/calendar'
import { BUNDLED_CATALOG } from '@questender/engine/content/bundled'
import { campaign, listCampaigns, pageDate } from '@questender/engine/campaign'
import { baseHeroIds } from '@questender/engine/content'
import { emptyProgress, mergeProgress, recordAchievements, sanitizeProgress, syncProgress } from '@questender/engine/progress'
import { applyEffects, initialState, reduce } from '@questender/engine/state'
import { makeRng } from '@questender/engine/rng'
import { COSMETICS, DEFAULT_AVATAR, DEFAULT_BORDER, TOKEN_REWARDS, emblemId, tokenUnlocksFor } from '@questender/engine/tokens'
import { REWARDS } from '@questender/engine/rewards'
import type { GameState } from '@questender/engine/types'
import { bundleSaves, parseProgress } from '../src/save'
import { PORTRAITS } from '../src/ui/portraits/specs'
import { Token, TokenPicker } from '../src/ui/Token'
import { tokenLabel } from '../src/ui/tokenNames'

const TODAY = '2026-03-18'

function game(campaignId = 'brightwatch', heroId = 'wren'): GameState {
  return reduce(initialState(), { type: 'NEW_GAME', heroId, seed: 3, campaignId, startDate: '2026-03-11' })
}
function withDays(s: GameState, n: number): GameState {
  const c = campaign(s.campaignId)
  const journal = Array.from({ length: n }, (_, i) => ({ page: Math.min(i, c.pages.length - 1), date: addDays(s.startDate, i), lines: [] }))
  return { ...s, journal, dayIndex: Math.min(n, c.pages.length - 1) }
}
const ids = (xs: { id: string }[]) => xs.map((x) => x.id)

describe('hero tokens', () => {
  it('are granted when a campaign starts with that hero', () => {
    const p = syncProgress(emptyProgress(), [game('brightwatch', 'wren')], TODAY)
    expect(ids(p.avatars)).toEqual(['wren'])
    const q = syncProgress(p, [game('brightwatch', 'wren'), game('emberroad')], TODAY) // Ember Road opens on its own prologue hero
    expect(ids(q.avatars).sort()).toEqual(['er_tamsin', 'wren'])
  })

  it('are granted when a hero is assigned mid-campaign (setHero), once', () => {
    const s = game('emberroad', 'er_tamsin')
    const draft = structuredClone(s)
    applyEffects(draft, [{ type: 'setHero', heroId: 'er_ysolde' }], makeRng(1))
    expect(draft.hero!.defId).toBe('er_ysolde')
    let p = syncProgress(emptyProgress(), [s], TODAY)
    p = syncProgress(p, [draft], TODAY)
    expect(ids(p.avatars).sort()).toEqual(['er_tamsin', 'er_ysolde'])
    expect(syncProgress(p, [draft], TODAY)).toBe(p)
  })

  it('every hero in every campaign has a token that renders', () => {
    const heroes = new Set<string>([...baseHeroIds()])
    for (const c of listCampaigns()) {
      c.heroIds?.forEach((h) => heroes.add(h))
      if (c.startHero) heroes.add(c.startHero)
      c.content?.heroes?.forEach((h) => heroes.add(h.id))
    }
    expect(heroes.size).toBeGreaterThanOrEqual(BUNDLED_CATALOG.length * 6)
    for (const id of heroes) {
      expect(PORTRAITS[id], `portrait spec for ${id}`).toBeDefined()
      const html = renderToStaticMarkup(<Token avatar={id} border={DEFAULT_BORDER} label={tokenLabel(id, DEFAULT_BORDER)} />)
      expect(html, id).toContain('<svg')
      expect(html, id).toContain('role="img"')
    }
  })
})

describe('milestone borders', () => {
  it('each campaign unlocks its own two borders and an emblem at its milestones', () => {
    for (const cid of Object.keys(REWARDS)) {
      const days = REWARDS[cid].keepsakes.map((k) => k.days)
      expect(tokenUnlocksFor(cid, days[0] - 1)).toEqual([])
      expect(tokenUnlocksFor(cid, days[0])).toEqual([`${cid}-border1`])
      expect(tokenUnlocksFor(cid, days[2])).toEqual([`${cid}-border1`, `${cid}-border2`])
      expect(tokenUnlocksFor(cid, days[4])).toEqual([`${cid}-border1`, `${cid}-border2`, emblemId(cid)])
    }
    expect(TOKEN_REWARDS).toHaveLength(18)
  })

  it('a run unlocks only its own campaign’s rims, recorded desk-wide', () => {
    const p = syncProgress(emptyProgress(), [withDays(game('brightwatch'), 7), withDays(game('halcyon', 'hd_juniper'), 6)], TODAY)
    expect(ids(p.borders)).toEqual(['brightwatch-border1'])
    const later = syncProgress(p, [withDays(game('brightwatch'), 100)], TODAY)
    expect(ids(later.borders)).toEqual(['brightwatch-border1', 'brightwatch-border2'])
    expect(later.avatars.some((a) => a.id === emblemId('brightwatch'))).toBe(false)
    const top = syncProgress(later, [withDays(game('brightwatch'), 365)], '2027-12-31')
    expect(ids(top.avatars)).toContain(emblemId('brightwatch'))
  })

  it('finishing any campaign earns the rare gilded border', () => {
    const p = recordAchievements(syncProgress(emptyProgress(), [game()], TODAY), ['completionist'], TODAY)
    expect(ids(syncProgress(p, [game()], TODAY).borders)).toContain('gilded')
  })

  it('earned borders stay on the record after the run is deleted', () => {
    const p = syncProgress(emptyProgress(), [withDays(game(), 7)], TODAY)
    expect(ids(syncProgress(p, [], TODAY).borders)).toEqual(['brightwatch-border1'])
  })
})

describe('registry', () => {
  it('has unique ids, hints that do not reveal story, and nothing for sale', () => {
    expect(new Set(COSMETICS.map((c) => c.id)).size).toBe(COSMETICS.length)
    for (const c of COSMETICS) {
      expect(JSON.stringify(c)).not.toMatch(/price|buy|premium|purchase|paid/i)
      expect(c.hint).not.toMatch(/·/)
    }
    expect(COSMETICS.map((c) => c.id)).toEqual(expect.arrayContaining([DEFAULT_AVATAR, DEFAULT_BORDER]))
  })
})

describe('token picker', () => {
  const html = (progress = emptyProgress()) => renderToStaticMarkup(<TokenPicker progress={progress} onChoose={() => {}} onClose={() => {}} />)

  it('lists earned tokens and borders by name, and locked ones as ??? with a hint', () => {
    const p = syncProgress(emptyProgress(), [withDays(game(), 7)], TODAY)
    const out = html(p)
    expect(out).toContain('role="dialog"')
    expect(out).toContain('Your token')
    expect(out).toContain('Plain rim')
    expect(out).toContain('Lamp-gold rim')
    expect(out).not.toContain('Sea-glass rim')
    expect(out).toContain('???')
    expect(out).toContain('Play 100 days in The Lamp at Brightwatch.')
    expect(out).toContain('Finish any campaign.')
    expect(out).toContain('Play as a hero to earn their token.')
  })

  it('the preview carries an accessible name with the border', () => {
    const out = html({ ...emptyProgress(), borders: [{ id: 'brightwatch-border1', date: TODAY }], token: { avatar: 'wren', border: 'brightwatch-border1' } })
    expect(out).toContain('Your token: ')
    expect(out).toContain('lamp-gold border')
  })
})

describe('token progress in export and import', () => {
  const local = { ...emptyProgress(), avatars: [{ id: 'wren', date: '2026-03-12' }], borders: [{ id: 'brightwatch-border1', date: '2026-03-18' }] }
  const incoming = {
    ...emptyProgress(),
    avatars: [{ id: 'wren', date: '2026-03-01' }, { id: 'er_tamsin', date: '2026-03-02' }],
    borders: [{ id: 'emberroad-border1', date: '2026-03-03' }],
    token: { avatar: 'er_tamsin', border: 'emberroad-border1' },
  }

  it('keeps the union of unlocks and the local choice (or the imported one when local is plain)', () => {
    const chosen = { ...local, token: { avatar: 'wren', border: 'brightwatch-border1' } }
    const m = mergeProgress(chosen, incoming)
    expect(m.avatars).toEqual([{ id: 'wren', date: '2026-03-01' }, { id: 'er_tamsin', date: '2026-03-02' }])
    expect(ids(m.borders).sort()).toEqual(['brightwatch-border1', 'emberroad-border1'])
    expect(m.token).toEqual({ avatar: 'wren', border: 'brightwatch-border1' })
    expect(mergeProgress(local, incoming).token).toEqual(incoming.token)
  })

  it('round-trips through an Export all bundle, ignoring bad token ids', () => {
    const p = { ...incoming }
    expect(parseProgress(JSON.stringify(bundleSaves([game()], TODAY, [], p)))).toEqual(p)
    expect(sanitizeProgress({ token: { avatar: 7, border: '' } }).token).toEqual({ avatar: DEFAULT_AVATAR, border: DEFAULT_BORDER })
    expect(pageDate(campaign('brightwatch'), 0, '2026-03-11')).toBe('2026-03-11')
  })
})
