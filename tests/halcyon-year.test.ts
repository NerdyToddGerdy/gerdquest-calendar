import { describe, expect, it } from 'vitest'
import { daysBetween, weekday } from '@questender/engine/calendar'
import { authoredDate, campaign, pageEndDate, pageSpan } from '@questender/engine/campaign'
import { ability, enemy, heroDef, item } from '@questender/engine/content'
import { craftDef, crewDef, shipDef, upgradeDef } from '@questender/engine/vehicle'
import type { Effect } from '@questender/engine/types'

const hd = campaign('halcyon')
const WEEKDAYS = /\b(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)s?\b/

describe('halcyon: the whole year', () => {
  it('runs from Sun Jan 1 to Sun Dec 31, 2023 with no gaps', () => {
    expect(authoredDate(hd, 0)).toBe('2023-01-01')
    for (let i = 1; i < hd.pages.length; i++) {
      expect(daysBetween(authoredDate(hd, i - 1), authoredDate(hd, i))).toBe(pageSpan(hd, i - 1))
    }
    expect(pageEndDate(hd, hd.pages.length - 1, '2023-01-01')).toBe('2023-12-31')
    expect(hd.pages.length).toBe(313)
  })

  it('weekday pages are Mon–Fri; every weekend page starts on Saturday and spans two days', () => {
    for (let i = 1; i < hd.pages.length; i++) {
      const wd = weekday(authoredDate(hd, i))
      if (pageSpan(hd, i) === 2) expect(wd, hd.pages[i].id).toBe(6)
      else expect([1, 2, 3, 4, 5], hd.pages[i].id).toContain(wd)
    }
  })

  it('page ids are unique and no page names a weekday', () => {
    const ids = hd.pages.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const p of hd.pages) {
      const text = [p.title, p.text, p.note ?? '', ...p.steps.flatMap((s) => [s.title ?? '', ...s.options.flatMap((o) => [o.label, o.result ?? '', ...(o.bands ?? []).map((b) => b.text)])])]
      for (const t of text) expect(t, p.id).not.toMatch(WEEKDAYS)
    }
  })

  it('every referenced id exists (items, enemies, craft, crew, upgrades, heroes, abilities)', () => {
    const checkEffect = (e: Effect) => {
      if (e.type === 'item') item(e.id)
      if (e.type === 'setHero') heroDef(e.heroId)
      if (e.type === 'ship' && e.give) shipDef(e.give)
    }
    for (const p of hd.pages) {
      for (const s of p.steps) for (const o of s.options) {
        o.effects?.forEach(checkEffect)
        o.bands?.forEach((b) => b.effects?.forEach(checkEffect))
      }
      p.combat?.enemies.forEach((id) => enemy(id))
      p.combat?.win?.forEach(checkEffect)
      p.combat?.lose?.forEach(checkEffect)
      p.dogfight?.craft.forEach((id) => craftDef(id))
      p.dogfight?.win?.forEach(checkEffect)
      p.dogfight?.lose?.forEach(checkEffect)
      p.shop?.items.forEach((x) => item(x.id))
      p.dock?.crew?.forEach((id) => crewDef(id))
      p.dock?.upgrades?.forEach((u) => upgradeDef(u.id))
    }
    for (const id of hd.heroIds ?? []) {
      const h = heroDef(id)
      h.abilities.forEach((a) => ability(a))
      for (const l of Object.values(h.levels)) if (l.ability) ability(l.ability)
    }
  })

  it('every captain can reach level 8, and the year levels them up exactly seven times', () => {
    for (const id of hd.heroIds ?? []) {
      for (let l = 2; l <= 8; l++) expect(heroDef(id).levels[l], `${id} L${l}`).toBeDefined()
    }
    const ups = hd.pages.filter((p) => p.steps.some((s) => s.options.some((o) => o.effects?.some((e) => e.type === 'levelUp'))))
    expect(ups).toHaveLength(7)
  })

  it('a ground boss and a big dogfight every month after January', () => {
    for (let m = 2; m <= 12; m++) {
      const month = hd.pages.filter((p) => p.month === m)
      expect(month.some((p) => p.combat && p.combat.rounds >= 4), `boss in month ${m}`).toBe(true)
      expect(month.some((p) => p.dogfight), `dogfight in month ${m}`).toBe(true)
    }
  })
})
