// Rule presets. Each campaign runs on one ruleset; the engine reads every
// variable rule from here instead of hard-coding it.
import type { ConditionDef, DeathTable, PoolId, RulesetId, WoundKind } from './types'

export interface Ruleset {
  id: RulesetId
  name: string
  /** Calendar year whose rules this preset is modeled on. */
  basedOn: number
  currencyName: string
  /** `a` is stored in hero.poisoned, `b` in hero.cursed. */
  conditions: { a: ConditionDef; b: ConditionDef }
  /** Point pools a Rest refills (see engine/pools.ts). */
  pools: PoolId[]
  /** Natural 1 always fails and natural 20 grants a Boon. */
  boons: boolean
  combat: {
    /**
     * 'static' (2022): no Defense roll; 10 + Defense is compared to the enemy's
     * `hits` value and halves damage when it's equal or higher.
     */
    defense: 'roll' | 'static'
    /** 'roundPerMonster': a group fight lasts one round per enemy. */
    groups: 'fixedRounds' | 'roundPerMonster'
    /** Single-enemy fights: only the final round can kill; earlier kills Stun instead. */
    soloStun: boolean
  }
  death: DeathTable
  gearSwap: 'restOnly' | 'restOrAcquire'
  /**
   * noReturn: you can't come back to a shop once you leave it. Shops are
   * page-scoped, so this already holds for every ruleset.
   */
  shop: { sellRate: number; noReturn: boolean }
  /** 'abilityOnly': only heroes with the `pickpocket` ability can use pickpocket icons. */
  pickpocket: 'anyone' | 'abilityOnly'
  lootIcons: boolean
  /** Weekly lottery. weekday: 0 = Sunday. Wired by the calendar layer. */
  lottery: { weekday: number; afterPrologue: boolean } | null
  /**
   * 'followers' (2022): companions with a `follower` spec — fee, upkeep at each
   * Rest, lent abilities (engine/followers.ts). TODO 'crew' falls back to the party.
   */
  companions: 'party' | 'followers' | 'crew'
  /** Health lost per missing ration while traveling. */
  rationPenalty: number
}

const D10_WOUNDS: WoundKind[] = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'maxHp', 'def', 'atk', 'dmg']

/** The d4 table used by the 2023 and 2024 rules. */
function d4Death(currency: string): DeathTable {
  return {
    die: 4,
    healFirst: false,
    entries: [
      { kind: 'loseCurrency', fraction: 0.5, text: `the spirits demand payment. You lose half your ${currency}.` },
      { kind: 'wound', group: 'Wound', die: 10, table: D10_WOUNDS, text: 'you suffer a lingering Wound.' },
      { kind: 'loseGear', filter: 'any', text: 'scavengers picked your body clean.' },
      { kind: 'drain', text: 'the spirits are kind, but death takes its toll. All per-Rest abilities are spent.' },
    ],
  }
}

export const MODERN: Ruleset = {
  id: 'modern',
  name: 'Modern',
  basedOn: 2024,
  currencyName: 'glint',
  conditions: {
    a: { label: 'Poisoned', text: 'lose 1 health at the start of each day until you Rest' },
    b: { label: 'Cursed', text: '−1 to every d20 roll until you Rest' },
  },
  pools: ['spell'],
  boons: true,
  combat: { defense: 'roll', groups: 'fixedRounds', soloStun: false },
  death: d4Death('glint'),
  gearSwap: 'restOrAcquire',
  shop: { sellRate: 0.5, noReturn: false },
  pickpocket: 'anyone',
  lootIcons: true,
  lottery: { weekday: 0, afterPrologue: false },
  companions: 'party',
  rationPenalty: 1,
}

export const FRONTIER: Ruleset = {
  id: 'frontier',
  name: 'Frontier',
  basedOn: 2023,
  currencyName: 'credits',
  conditions: {
    a: { label: 'Infected', text: 'lose 1 health at the start of each day until you Rest' },
    b: { label: 'Malfunction', text: '−1 to every d20 roll until you Rest' },
  },
  pools: ['charges', 'spell', 'chi', 'surge'],
  boons: false,
  combat: { defense: 'static', groups: 'fixedRounds', soloStun: false },
  death: d4Death('credits'),
  gearSwap: 'restOrAcquire',
  shop: { sellRate: 1, noReturn: false },
  pickpocket: 'anyone',
  lootIcons: false,
  lottery: { weekday: 0, afterPrologue: true },
  companions: 'crew',
  rationPenalty: 1,
}

export const CLASSIC: Ruleset = {
  id: 'classic',
  name: 'Classic',
  basedOn: 2022,
  currencyName: 'gold',
  conditions: {
    a: { label: 'Poisoned', text: 'lose 1 health at the start of each day until you Rest' },
    b: { label: 'Cursed', text: '−1 to every d20 roll until you Rest' },
  },
  pools: ['spell', 'chi'],
  boons: false,
  combat: { defense: 'static', groups: 'roundPerMonster', soloStun: true },
  death: {
    die: 6,
    healFirst: true,
    entries: [
      { kind: 'loseCurrency', fraction: 1, text: 'you pay gold for your life. You lose all your gold.' },
      { kind: 'wound', group: 'Physical Injury', die: 6, table: ['str', 'str', 'dex', 'dex', 'con', 'con'], text: 'you suffer a Physical Injury.' },
      { kind: 'wound', group: 'Mental Trauma', die: 6, table: ['int', 'int', 'wis', 'wis', 'cha', 'cha'], text: 'you suffer Mental Trauma.' },
      { kind: 'wound', group: 'Grievous Wound', die: 8, table: ['maxHp', 'maxHp', 'def', 'def', 'atk', 'atk', 'dmg', 'dmg'], text: 'you suffer a Grievous Wound.' },
      { kind: 'loseGear', filter: 'magical', text: 'you must sacrifice a magical item.' },
      { kind: 'drain', text: 'the gods smile on you, but death has left you drained. All per-Rest abilities are spent.' },
    ],
  },
  gearSwap: 'restOnly',
  shop: { sellRate: 1, noReturn: true },
  pickpocket: 'abilityOnly',
  lootIcons: false,
  lottery: null,
  companions: 'followers',
  rationPenalty: 1,
}

export const RULESETS: Record<RulesetId, Ruleset> = { classic: CLASSIC, frontier: FRONTIER, modern: MODERN }

export function rulesFor(id: RulesetId | undefined): Ruleset {
  return RULESETS[id ?? 'modern'] ?? MODERN
}

/** The ruleset a game state is using (defaults to modern for older saves). */
export function rules(s: { rulesetId?: RulesetId }): Ruleset {
  return rulesFor(s.rulesetId)
}
