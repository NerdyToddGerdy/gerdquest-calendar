import { ability, item } from './content'
import type { AbilityDef, Hero, HeroDef, LevelSpec, StatKey, WoundKind } from './types'
import { upgradeBonus } from './upgrades'

export function createHero(def: HeroDef): Hero {
  return {
    defId: def.id,
    name: def.name,
    title: def.title,
    weapon: def.weapon,
    level: 1,
    traits: { ...def.traits },
    atk: def.atk,
    def: def.def,
    dmgDie: def.dmgDie,
    baseMaxHp: def.maxHp,
    hp: def.maxHp,
    virtue: 0,
    glint: def.glint,
    boon: false,
    abilities: [...def.abilities],
    usedRest: {},
    usedPage: {},
    inventory: {},
    gear: {},
    wounds: [],
    poisoned: false,
    cursed: false,
    pageBonus: {},
    ...(def.pools ? { poolMax: { ...def.pools }, pools: { ...def.pools } } : {}),
  }
}

export function gearBonus(hero: Hero, key: StatKey): number {
  let sum = 0
  for (const id of Object.values(hero.gear)) {
    if (!id) continue
    const it = item(id)
    if (it.kind === 'gear') sum += it.bonus[key] ?? 0
  }
  return sum
}

export function woundCount(hero: Hero, kind: WoundKind): number {
  return hero.wounds.filter((w) => w === kind).length
}

/** Effective value of a stat including gear, page bonuses and wounds. */
export function stat(hero: Hero, key: Exclude<StatKey, 'maxHp'>): number {
  let base = 0
  if (key === 'atk') base = hero.atk
  else if (key === 'def') base = hero.def
  else if (key === 'dmg' || key === 'roll') base = 0
  else base = hero.traits[key]
  const wounds = key === 'roll' ? 0 : woundCount(hero, key)
  return base + gearBonus(hero, key) + upgradeBonus(hero, key) + (hero.pageBonus[key] ?? 0) - wounds
}

export function maxHp(hero: Hero): number {
  return Math.max(1, hero.baseMaxHp + gearBonus(hero, 'maxHp') - 2 * woundCount(hero, 'maxHp'))
}

export function heal(hero: Hero, amount: number): Hero {
  return { ...hero, hp: Math.min(maxHp(hero), hero.hp + amount) }
}

export function damage(hero: Hero, amount: number): Hero {
  return { ...hero, hp: Math.max(0, hero.hp - amount) }
}

export function clampVirtue(v: number): number {
  return Math.max(-10, Math.min(10, v))
}

/** Extra +1s lent by followers who duplicate a skill the hero already has. */
export function abilityBoost(hero: Hero, id: string): number {
  return hero.abilityBoost?.[id] ?? 0
}

/** Passive bonus including follower boosts. */
export function passiveBonus(hero: Hero, def: AbilityDef): number {
  return def.kind === 'passive' ? def.bonus + abilityBoost(hero, def.id) : 0
}

/** Uses per page/rest including follower boosts. */
export function maxUses(hero: Hero, def: AbilityDef): number {
  if (def.kind === 'passive') return Infinity
  return def.uses + abilityBoost(hero, def.id)
}

export function usesLeft(hero: Hero, def: AbilityDef): number {
  if (def.kind === 'passive') return Infinity
  const used = (def.per === 'rest' ? hero.usedRest : hero.usedPage)[def.id] ?? 0
  return Math.max(0, maxUses(hero, def) - used)
}

export function markUsed(hero: Hero, def: AbilityDef): Hero {
  if (def.kind === 'passive') return hero
  const key = def.per === 'rest' ? 'usedRest' : 'usedPage'
  return { ...hero, [key]: { ...hero[key], [def.id]: (hero[key][def.id] ?? 0) + 1 } }
}

export function heroAbilities(hero: Hero): AbilityDef[] {
  return hero.abilities.map(ability)
}

export function addItem(hero: Hero, id: string, qty = 1): Hero {
  const n = (hero.inventory[id] ?? 0) + qty
  const inventory = { ...hero.inventory }
  if (n <= 0) delete inventory[id]
  else inventory[id] = n
  return { ...hero, inventory }
}

export function itemCount(hero: Hero, id: string): number {
  return hero.inventory[id] ?? 0
}

/** Level up: raise max HP and current HP by the same amount. No refresh of abilities. */
export function levelUp(hero: Hero, spec: LevelSpec): Hero {
  const traits = { ...hero.traits }
  for (const [k, v] of Object.entries(spec.traits ?? {})) traits[k as keyof typeof traits] += v
  return {
    ...hero,
    level: hero.level + 1,
    traits,
    baseMaxHp: hero.baseMaxHp + spec.maxHp,
    hp: hero.hp + spec.maxHp,
    atk: hero.atk + (spec.atk ?? 0),
    def: hero.def + (spec.def ?? 0),
    dmgDie: spec.dmgDie ?? hero.dmgDie,
    abilities: spec.ability ? [...hero.abilities, spec.ability] : hero.abilities,
  }
}

const WOUND_NAMES: Record<WoundKind, string> = {
  str: 'Strength −1',
  dex: 'Dexterity −1',
  con: 'Constitution −1',
  int: 'Intellect −1',
  wis: 'Wisdom −1',
  cha: 'Charisma −1',
  maxHp: 'Max Health −2',
  def: 'Defense −1',
  atk: 'Attack −1',
  dmg: 'Damage rolls −1',
}
export function woundName(w: WoundKind) {
  return WOUND_NAMES[w]
}
