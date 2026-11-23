import { enemy } from './content'
import { isNat1, isNat20, makeSlot, slotTotal } from './dice'
import { stat } from './hero'
import type { Rng } from './rng'
import { TRAIT_NAMES } from './types'
import type { CombatState, Hero, Mod, RollSlot, Trait } from './types'

/** Rounds a fight lasts: 'roundPerMonster' gives group fights one round per enemy. */
export function combatRounds(rounds: number, enemyCount: number, groups: 'fixedRounds' | 'roundPerMonster'): number {
  return groups === 'roundPerMonster' && enemyCount > 1 ? enemyCount : rounds
}

/** Modifiers that apply to every d20 roll: the base stat, page-wide bonuses, curses. */
export function d20Mods(hero: Hero, key: Trait | 'atk' | 'def'): Mod[] {
  const label = key === 'atk' ? 'Attack' : key === 'def' ? 'Defense' : TRAIT_NAMES[key]
  const mods: Mod[] = [{ label, value: stat(hero, key) }]
  const all = stat(hero, 'roll')
  if (all) mods.push({ label: 'Page bonus', value: all })
  if (hero.cursed) mods.push({ label: 'Cursed', value: -1 })
  return mods
}

export function startCombat(enemies: string[]): CombatState {
  return { enemies: enemies.map((defId) => ({ defId, defeated: false })), round: 1, done: false, won: false }
}

/** Roll attack, damage and defense against every enemy still standing. */
export function rollRound(hero: Hero, combat: CombatState, rng: Rng, opts: { staticDefense?: boolean } = {}): RollSlot[] {
  const slots: RollSlot[] = []
  combat.enemies.forEach((e, i) => {
    if (e.defeated) return
    const name = enemy(e.defId).name
    slots.push(makeSlot(rng, `${i}:atk`, `${name} · Attack`, 'attack', 20, d20Mods(hero, 'atk')))
    slots.push(
      makeSlot(rng, `${i}:dmg`, `${name} · Damage`, 'damage', hero.dmgDie, [
        { label: 'Damage mod', value: stat(hero, 'dmg') },
      ]),
    )
    // With static Defense (2022 rules) there is no Defense roll.
    if (!opts.staticDefense) slots.push(makeSlot(rng, `${i}:def`, `${name} · Defense`, 'defense', 20, d20Mods(hero, 'def')))
  })
  return slots
}

export interface RoundResult {
  combat: CombatState
  damageTaken: number
  boon: boolean
  lines: string[]
}

export interface RoundOptions {
  /** Natural 1 auto-miss/fail and natural 20 Boons (default true). */
  boons?: boolean
  /** Single-enemy fights: only the final round can kill; earlier kills Stun (default false). */
  soloStun?: boolean
  /**
   * Static Defense (2022 rules): no Defense roll. Instead the hero's passive
   * Defense score (10 + Defense) is compared to the enemy's `hits` value:
   * equal or higher halves the damage, like a successful Defense roll.
   */
  staticDefense?: number
}

export function resolveRound(
  combat: CombatState,
  slots: RollSlot[],
  maxRounds: number,
  opts: RoundOptions = {},
): RoundResult {
  const boons = opts.boons ?? true
  const finalRound = combat.round >= maxRounds
  const stunOnly = !!opts.soloStun && combat.enemies.length === 1 && !finalRound
  const get = (id: string) => slots.find((s) => s.id === id)!
  const enemies = combat.enemies.map((e) => ({ ...e }))
  let damageTaken = 0
  let boon = false
  const lines: string[] = [`Round ${combat.round}:`]
  enemies.forEach((e, i) => {
    if (e.defeated) return
    const def = enemy(e.defId)
    const atk = get(`${i}:atk`)
    const dmg = get(`${i}:dmg`)
    const dfn = slots.find((s) => s.id === `${i}:def`)
    if (boons && (isNat20(atk) || (dfn && isNat20(dfn)))) boon = true
    const hit = !(boons && isNat1(atk)) && slotTotal(atk) >= def.ac
    const dmgTotal = Math.max(0, slotTotal(dmg))
    if (hit && dmgTotal >= def.toughness && stunOnly) {
      lines.push(`  ${def.name}: hit for ${dmgTotal} — Stunned! It can't hurt you this round.`)
      return
    }
    if (hit && dmgTotal >= def.toughness) {
      e.defeated = true
      lines.push(`  ${def.name}: hit for ${dmgTotal} — defeated!`)
      return
    }
    const blocked =
      opts.staticDefense !== undefined || !dfn ? (opts.staticDefense ?? 0) >= def.hits : !(boons && isNat1(dfn)) && slotTotal(dfn) >= def.hits
    const taken = blocked ? Math.floor(def.dmg / 2) : def.dmg
    damageTaken += taken
    const why = hit ? `hit for ${dmgTotal}, not enough` : 'missed'
    lines.push(`  ${def.name}: ${why}; ${blocked ? 'you block, taking' : 'you take'} ${taken} damage.`)
  })
  const allDown = enemies.every((e) => e.defeated)
  const done = allDown || finalRound
  return {
    combat: { enemies, round: combat.round + 1, done, won: allDown },
    damageTaken,
    boon,
    lines,
  }
}
