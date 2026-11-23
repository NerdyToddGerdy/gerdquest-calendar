import { describe, expect, it } from 'vitest'
import { weekday } from '../src/engine/calendar'
import { authoredDate, campaign, isLotteryPage, pageDate, pageSpan } from '../src/engine/campaign'
import { heroDef, item } from '../src/engine/content'
import { scriptedRng } from '../src/engine/rng'
import { canAdvance, initialState, reduce, type Action } from '../src/engine/state'
import type { GameState, RollSlot, Ship } from '../src/engine/types'
import {
  assignCrew,
  createShip,
  d100Parts,
  fitUpgrade,
  maxIntegrity,
  removeUpgrade,
  repair,
  resolveVolley,
  rollVolley,
  shipDef,
  shipStat,
  startDogfight,
} from '../src/engine/vehicle'

const hd = campaign('halcyon')
const FAR_FUTURE = '2099-12-31'

const newShip = (): Ship => createShip(shipDef('hd_halcyon')) // Aim 20, Evasion 15, Shield 1, Integrity 3

/** Two volley slots for craft 0 with exact totals (naturals chosen so total = value). */
const volley = (aim: number, eva: number, ship = newShip()): RollSlot[] => [
  { id: '0:aim', label: 'aim', kind: 'aim', die: 100, natural: aim - shipStat(ship, 'aim'), mods: [{ label: 'Aim', value: shipStat(ship, 'aim') }] },
  { id: '0:eva', label: 'eva', kind: 'evasion', die: 100, natural: eva - shipStat(ship, 'evasion'), mods: [{ label: 'Evasion', value: shipStat(ship, 'evasion') }] },
]

function newGame(): GameState {
  return reduce(initialState(), { type: 'NEW_GAME', seed: 9, campaignId: 'halcyon', startDate: authoredDate(hd, 0) })
}

describe('halcyon campaign shape', () => {
  it('opens on a Sunday prologue page; weekend pages start on Saturdays and cover two days', () => {
    expect(weekday(authoredDate(hd, 0))).toBe(0) // Jan 1, 2023 was a Sunday
    for (let i = 0; i < hd.pages.length; i++) {
      const wd = weekday(authoredDate(hd, i))
      if (pageSpan(hd, i) === 2) expect(wd).toBe(6)
      else if (i > 0) expect([1, 2, 3, 4, 5]).toContain(wd)
    }
    expect(hd.pages.length).toBeGreaterThanOrEqual(24)
  })

  it('pages are contiguous: each page starts the day after the previous one ends', () => {
    for (let i = 1; i < hd.pages.length; i++) {
      const prevEnd = pageDate(hd, i - 1, '2023-01-01')
      const gap = (Date.parse(pageDate(hd, i, '2023-01-01')) - Date.parse(prevEnd)) / 86400000
      expect(gap).toBe(pageSpan(hd, i - 1))
    }
  })

  it('has at least one dogfight, a boss fight and a hero choice of six', () => {
    expect(hd.pages.some((p) => p.dogfight)).toBe(true)
    expect(hd.pages.some((p) => p.combat?.enemies.includes('hd_vell'))).toBe(true)
    const choice = hd.pages.find((p) => p.steps.some((s) => s.options.some((o) => o.effects?.some((e) => e.type === 'setHero'))))!
    expect(choice.steps[0].options).toHaveLength(6)
  })
})

describe('prologue', () => {
  it('starts with the fixed prologue hero whatever hero id is passed', () => {
    const s = reduce(initialState(), { type: 'NEW_GAME', heroId: 'wren', seed: 1, campaignId: 'halcyon' })
    expect(s.hero!.defId).toBe('hd_juniper')
    expect(s.rulesetId).toBe('frontier')
    expect(s.hero!.inventory).toEqual({ ration: 2, hd_medgel: 1 })
  })

  it('no lottery during the prologue, even on its Sunday; it starts after', () => {
    expect(isLotteryPage(hd, 0, '2023-01-01')).toBe(false) // Sunday Jan 1, prologue
    expect(isLotteryPage(hd, 6, '2023-01-01')).toBe(true) // Sat 7 / Sun 8, first post-prologue weekend
    expect(isLotteryPage(hd, 7, '2023-01-01')).toBe(false)
  })

  it('choosing a captain hands play to that hero, carrying credits, pack and gear; the ship stays', () => {
    let s = { ...newGame(), dayIndex: 6 }
    s = { ...s, ship: newShip(), hero: { ...s.hero!, glint: 17, inventory: { ration: 3 } } }
    s = { ...s, progress: { ...s.progress, steps: [null], results: [null] } }
    s = reduce(s, { type: 'CHOOSE', step: 0, option: 1 }) // Brask
    expect(s.hero!.defId).toBe('hd_brask')
    expect(s.hero!.glint).toBe(17)
    expect(s.hero!.inventory).toEqual({ ration: 3 })
    expect(s.ship?.name).toBe('Halcyon Debt')
  })
})

describe('frontier conditions and items', () => {
  it('Infected drains 1 health per day, logged with its frontier name', () => {
    let s = { ...newGame(), hero: { ...newGame().hero!, poisoned: true } }
    s = { ...s, progress: { ...s.progress, steps: [0], results: ['x'] } }
    const hp = s.hero!.hp
    s = reduce(s, { type: 'NEXT_DAY', today: FAR_FUTURE })
    expect(s.hero!.hp).toBe(hp - 1)
    expect(s.log[0].text).toMatch(/^Infected/)
  })

  it('Malfunction costs −10 on every Aim and Evasion roll', () => {
    const ship = newShip()
    const slots = rollVolley(ship, startDogfight(['hd_skiff']), scriptedRng([5, 1, 5, 1]), [{ label: 'Malfunction', value: -10 }])
    expect(slots[0].mods).toEqual([{ label: 'Aim', value: 20 }, { label: 'Malfunction', value: -10 }])
    expect(slots[1].mods.at(-1)).toEqual({ label: 'Malfunction', value: -10 })
  })

  it('Suture Foam seals a Wound', () => {
    expect(item('hd_suture').kind).toBe('cure')
    let s = newGame()
    s = { ...s, hero: { ...s.hero!, wounds: ['str'], inventory: { hd_suture: 1 } } }
    s = reduce(s, { type: 'USE_ITEM', item: 'hd_suture' })
    expect(s.hero!.wounds).toEqual([])
  })
})

describe('d100', () => {
  it('rolls as two d10s: 00 + 0 is 100, and is shown as tens + ones', () => {
    const [aim] = rollVolley(newShip(), startDogfight(['hd_skiff']), scriptedRng([10, 10, 7, 3]))
    expect(aim.natural).toBe(100)
    expect(d100Parts(73)).toEqual([70, 3])
    expect(d100Parts(5)).toEqual([0, 5])
  })
})

describe('dogfight volleys', () => {
  it('reaching a craft’s evade with Aim takes it out with no damage', () => {
    const r = resolveVolley(newShip(), startDogfight(['hd_skiff']), volley(55, 0), 3, scriptedRng([]))
    expect(r.fight.craft[0].downed).toBe(true)
    expect(r.fight.won).toBe(true)
    expect(r.ship.compartments.every((c) => c.integrity === 3)).toBe(true)
  })

  it('winning Evasion takes reduced damage; Shield subtracts; each point hits a d6 compartment', () => {
    // Skiff: dmg 3, reduced 1, Aim 50. Shield 1.
    const evaded = resolveVolley(newShip(), startDogfight(['hd_skiff']), volley(40, 51), 3, scriptedRng([]))
    expect(evaded.ship.compartments.every((c) => c.integrity === 3)).toBe(true) // 1 − 1 shield = 0
    const hit = resolveVolley(newShip(), startDogfight(['hd_skiff']), volley(40, 50), 3, scriptedRng([2, 2]))
    // 3 − 1 = 2 points, both on compartment 2 (Helm)
    expect(hit.ship.compartments.find((c) => c.id === 'helm')!.integrity).toBe(1)
    expect(hit.fight.done).toBe(false)
  })

  it('a wrecked compartment loses its crew and upgrade; further hits there reach the hero', () => {
    let ship = assignCrew(newShip(), 'hd_petra', 'guns')!
    ship = fitUpgrade(ship, 'hd_up_tracking')!.ship
    expect(shipStat(ship, 'aim')).toBe(40)
    ship = { ...ship, compartments: ship.compartments.map((c) => (c.id === 'guns' ? { ...c, integrity: 1 } : c)) }
    // Gunship: dmg 6 − shield 1 = 5 points: guns, guns (→ hero), guns (→ hero), drive, drive
    const r = resolveVolley(ship, startDogfight(['hd_gunship']), volley(10, 10, ship), 4, scriptedRng([4, 4, 4, 1, 1]))
    const guns = r.ship.compartments.find((c) => c.id === 'guns')!
    expect(guns.integrity).toBe(0)
    expect(guns.crew).toBeUndefined()
    expect(guns.upgrade).toBeUndefined()
    expect(r.heroDamage).toBe(2)
    expect(shipStat(r.ship, 'aim')).toBe(20)
  })

  it('the fight ends after the last volley', () => {
    const f = { ...startDogfight(['hd_skiff']), round: 3 }
    const r = resolveVolley(newShip(), f, volley(10, 99), 3, scriptedRng([]))
    expect(r.fight.done).toBe(true)
    expect(r.fight.won).toBe(false)
  })
})

describe('ship upkeep', () => {
  it('Ship Parts restore 1 Integrity, never above max', () => {
    let ship = { ...newShip(), parts: 2 }
    expect(repair(ship, 'helm')).toBeNull() // already full
    ship = { ...ship, compartments: ship.compartments.map((c) => (c.id === 'helm' ? { ...c, integrity: 1 } : c)) }
    ship = repair(ship, 'helm')!
    expect(ship.compartments.find((c) => c.id === 'helm')!.integrity).toBe(2)
    expect(ship.parts).toBe(1)
  })

  it('crew are fixed to one empty, intact compartment; Integrity bonuses raise current Integrity too', () => {
    const ship = assignCrew(newShip(), 'hd_rook', 'hold')!
    expect(maxIntegrity(ship, 'hold')).toBe(4)
    expect(ship.compartments.find((c) => c.id === 'hold')!.integrity).toBe(4)
    expect(assignCrew(ship, 'hd_petra', 'hold')).toBeNull() // occupied
    expect(assignCrew(ship, 'hd_rook', 'helm')).toBeNull() // already aboard
  })

  it('upgrades: one per compartment; removing clamps Integrity', () => {
    let ship = fitUpgrade(newShip(), 'hd_up_plating')!.ship
    expect(maxIntegrity(ship, 'hold')).toBe(4)
    const out = removeUpgrade(ship, 'hold')!
    expect(out.removed).toBe('hd_up_plating')
    ship = out.ship
    expect(ship.compartments.find((c) => c.id === 'hold')!.integrity).toBe(3)
  })

  it('reducer: dock hiring, buying, full-price resale, parts; no repairs mid-dogfight', () => {
    let s = { ...newGame(), dayIndex: 8, ship: newShip() } // Graveside Drift dock
    s = { ...s, hero: { ...s.hero!, glint: 40 }, progress: { ...s.progress, steps: [null], results: [null] } }
    s = reduce(s, { type: 'HIRE_CREW', crew: 'hd_petra', compartment: 'guns' })
    expect(s.hero!.glint).toBe(30)
    s = reduce(s, { type: 'BUY_UPGRADE', upgrade: 'hd_up_plating' })
    expect(s.hero!.glint).toBe(22)
    s = reduce(s, { type: 'SELL_UPGRADE', compartment: 'hold' })
    expect(s.hero!.glint).toBe(30) // full price back
    s = reduce(s, { type: 'BUY_PARTS' })
    expect(s.ship!.parts).toBe(1)
    expect(s.hero!.glint).toBe(27)
    // A crew member not offered at this dock can't be hired.
    expect(reduce(s, { type: 'HIRE_CREW', crew: 'hd_oduya', compartment: 'helm' })).toBe(s)

    let f = { ...newGame(), dayIndex: 5, ship: { ...newShip(), parts: 3 } } // escape page: dogfight
    f = { ...f, progress: { ...f.progress, steps: [0], results: ['x'] } }
    f = { ...f, ship: { ...f.ship!, compartments: f.ship!.compartments.map((c) => (c.id === 'helm' ? { ...c, integrity: 1 } : c)) } }
    f = reduce(f, { type: 'ROLL_VOLLEY' })
    expect(f.pending?.type).toBe('dogfight')
    expect(reduce(f, { type: 'REPAIR', compartment: 'helm' })).toBe(f)
    expect(canAdvance(f)).toBe(false)
  })
})

describe('full playthrough', () => {
  it('a seeded run of the whole campaign reaches the end, levels up at every level-up page, and keeps a ship', () => {
    let s = newGame()
    for (let guard = 0; guard < 40000 && !s.finished; guard++) {
      if (s.pending) {
        s = s.pending.type === 'pickpocket' ? reduce(s, { type: 'PICKPOCKET', take: true }) : reduce(s, { type: 'CONFIRM' })
        continue
      }
      const next = s.progress.steps.findIndex((x) => x === null)
      if (next >= 0) {
        // Pick the gunner on the captain page to exercise a non-default hero.
        const options = s.progress.steps.length === 1 && hdPage(s).steps[0].options.length === 6 ? 4 : 0
        s = reduce(s, { type: 'CHOOSE', step: next, option: options })
        continue
      }
      const tries: Action[] = [{ type: 'ROLL_VOLLEY' }, { type: 'ROLL_ROUND' }, { type: 'NEXT_DAY', today: FAR_FUTURE }]
      for (const a of tries) {
        const after = reduce(s, a)
        if (after !== s) {
          s = after
          break
        }
      }
    }
    expect(s.finished).toBe(true)
    expect(s.hero!.defId).toBe('hd_ash')
    const ups = hd.pages.filter((p) => p.steps.some((st) => st.options.some((o) => o.effects?.some((e) => e.type === 'levelUp')))).length
    expect(s.hero!.level).toBe(1 + ups)
    expect(heroDef(s.hero!.defId).levels[2].ability).toBe('hd_suppress')
    expect(s.ship?.name).toBe('Halcyon Debt')
    expect(s.journal.length).toBe(hd.pages.length)
    expect(JSON.parse(JSON.stringify(s))).toEqual(s)
  }, 30_000) // a whole year of pages; can be slow under load
})

function hdPage(s: GameState) {
  return hd.pages[s.dayIndex]
}
