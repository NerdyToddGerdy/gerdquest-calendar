// Core type definitions for the Questender rules engine.

export type Trait = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'
export const TRAITS: Trait[] = ['str', 'dex', 'con', 'int', 'wis', 'cha']
export const TRAIT_NAMES: Record<Trait, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intellect',
  wis: 'Wisdom',
  cha: 'Charisma',
}

/** Anything that can receive a numeric modifier. `roll` = every d20 roll. */
export type StatKey = Trait | 'atk' | 'def' | 'dmg' | 'maxHp' | 'roll'

export type GearSlot = 'head' | 'body' | 'hands' | 'feet' | 'trinket'

/** The kind of roll a slot represents. */
export type SlotKind = 'check' | 'attack' | 'damage' | 'defense' | 'aim' | 'evasion'
export const D20_KINDS: SlotKind[] = ['check', 'attack', 'defense']

// ---------- Abilities ----------

interface AbilityBase {
  id: string
  name: string
  text: string
}
export type AbilityDef = AbilityBase &
  (
    | { kind: 'passive'; bonus: number; tags: string[] }
    | { kind: 'reroll'; per: 'page' | 'rest'; uses: number }
    | { kind: 'addDie'; per: 'page' | 'rest'; uses: number; die: number; slots: SlotKind[] }
    | { kind: 'heal'; per: 'page' | 'rest'; uses: number; die: number; bonus: number }
  )

// ---------- Items ----------

interface ItemBase {
  id: string
  name: string
  text: string
  price: number
}
export type ItemDef = ItemBase &
  (
    | { kind: 'heal'; die: number; bonus: number }
    | { kind: 'slotDie'; die: number; slots: SlotKind[] }
    | { kind: 'pageBonus'; stat: StatKey; amount: number; die?: number }
    | { kind: 'boon' }
    | { kind: 'ration' }
    | { kind: 'cure' }
    | { kind: 'gear'; slot: GearSlot; bonus: Partial<Record<StatKey, number>>; magical?: boolean }
    | { kind: 'upgrade'; bonus: Partial<Record<StatKey, number>>; stackMax: number; tags?: string[] }
  )

// ---------- Heroes ----------

export interface LevelSpec {
  maxHp: number
  atk?: number
  def?: number
  dmgDie?: number
  traits?: Partial<Record<Trait, number>>
  ability?: string
}

export interface HeroDef {
  id: string
  name: string
  title: string
  blurb: string
  color: string
  traits: Record<Trait, number>
  maxHp: number
  atk: number
  def: number
  dmgDie: number
  weapon: string
  glint: number
  abilities: string[]
  levels: Record<number, LevelSpec>
}

export type WoundKind = Trait | 'maxHp' | 'def' | 'atk' | 'dmg'

export interface Hero {
  defId: string
  name: string
  title: string
  weapon: string
  level: number
  traits: Record<Trait, number>
  atk: number
  def: number
  dmgDie: number
  baseMaxHp: number
  hp: number
  virtue: number
  glint: number
  boon: boolean
  abilities: string[]
  usedRest: Record<string, number>
  usedPage: Record<string, number>
  inventory: Record<string, number>
  gear: Partial<Record<GearSlot, string>>
  wounds: WoundKind[]
  poisoned: boolean
  cursed: boolean
  pageBonus: Partial<Record<StatKey, number>>
}

// ---------- Party ----------

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export interface Card {
  suit: Suit | 'joker'
  /** 1 (ace) – 13 (king); jokers use 0. */
  rank: number
  color: 'red' | 'black'
}

export type MemberEffect =
  | { type: 'slotBonus'; slots: SlotKind[]; amount: number }
  | { type: 'heal'; amount: number }

export interface MemberAbility {
  name: string
  suits: Suit[]
  target: number
  effect: MemberEffect
}

export interface MemberDef {
  id: string
  name: string
  kind: 'critter' | 'bug'
  maxHp: number
  fee: number
  text: string
  abilities: MemberAbility[]
}

export interface PartyMember {
  defId: string
  hp: number
  usedPage: boolean
}

// ---------- Content: days, enemies ----------

export interface EnemyDef {
  id: string
  name: string
  text: string
  /** Attack total needed to hit it. */
  ac: number
  /** Damage needed (in one round) to defeat it once hit. */
  toughness: number
  /** Defense total needed to halve its damage. */
  hits: number
  dmg: number
}

export type Effect =
  | { type: 'damage'; amount: number }
  | { type: 'heal'; amount: number }
  | { type: 'glint'; amount: number }
  | { type: 'virtue'; amount: number }
  | { type: 'item'; id: string; qty?: number }
  | { type: 'condition'; poisoned?: boolean; cursed?: boolean }
  | { type: 'pageBonus'; stat: StatKey; amount: number }
  | { type: 'travel'; rations: number }
  | { type: 'levelUp' }
  | { type: 'boon' }
  /**
   * Hand play to another hero (prologues, hero-trial weeks, the final pick).
   * `carry` keeps those parts of the current hero; everything else starts fresh.
   */
  | { type: 'setHero'; heroId: string; carry?: ('glint' | 'inventory' | 'gear')[] }
  /** Vehicles: `give` a ship, add Ship Parts, or repair every compartment by `repair`. */
  | { type: 'ship'; give?: string; parts?: number; repair?: number }

export interface Check {
  trait: Trait
  /** Passive abilities with a matching tag apply automatically. */
  tags?: string[]
}

export interface Band {
  min?: number
  max?: number
  text: string
  effects?: Effect[]
}

export interface Option {
  label: string
  check?: Check
  bands?: Band[]
  /** For options without a check. */
  result?: string
  effects?: Effect[]
}

export interface Step {
  title?: string
  /** One option = do it. Several = pick one. */
  options: Option[]
}

export type Scene = 'harbor' | 'tower' | 'cellar' | 'depths' | 'seacave' | 'inn' | 'station' | 'bridge' | 'space' | 'wreck'

export interface HiddenIcon {
  kind: 'pickpocket' | 'loot'
  /** Percent position within the scene art. */
  x: number
  y: number
}

export interface Day {
  id: string
  title: string
  scene: Scene
  text: string
  note?: string
  steps: Step[]
  /** Steps may be done in any order (exploration days). */
  anyOrder?: boolean
  combat?: {
    enemies: string[]
    rounds: number
    intro: string
    winText: string
    loseText: string
    win?: Effect[]
    lose?: Effect[]
  }
  icons?: HiddenIcon[]
  shop?: { items: { id: string; price: number }[]; hires?: string[] }
  rest?: boolean
}

// ---------- Runtime state ----------

export interface Mod {
  label: string
  value: number
}

export interface RollSlot {
  id: string
  label: string
  kind: SlotKind
  die: number
  natural: number
  mods: Mod[]
}

export type Pending =
  | { type: 'check'; step: number; option: number; slot: RollSlot }
  | { type: 'combat'; slots: RollSlot[] }
  | { type: 'pickpocket'; icon: number; amount: number }
  | { type: 'dogfight'; slots: RollSlot[] }

export interface CombatState {
  enemies: { defId: string; defeated: boolean }[]
  round: number
  done: boolean
  won: boolean
}

export interface DayProgress {
  /** Index of the option chosen for each step, or null if not done. */
  steps: (number | null)[]
  results: (string | null)[]
  combat: CombatState | null
  icons: boolean[]
  rested: boolean
  lottery: boolean
  canChangeGear: boolean
}

export interface LogEntry {
  day: number
  text: string
}

export interface GameState {
  version: 1
  rng: number
  hero: Hero | null
  party: PartyMember[]
  deck: Card[]
  partyDice: boolean
  dayIndex: number
  progress: DayProgress
  pending: Pending | null
  log: LogEntry[]
  finished: boolean
  /** Which rule preset this game uses. Absent = 'modern'. */
  rulesetId?: RulesetId
}

// ---------- Rulesets (see engine/ruleset.ts) ----------

/** Rule presets modeled on the 2022 (classic), 2023 (frontier) and 2024 (modern) rules. */
export type RulesetId = 'classic' | 'frontier' | 'modern'

/** Point pools a Rest refills (hero.pools; see engine/pools.ts). */
export type PoolId = 'spell' | 'chi' | 'charges' | 'surge'

export interface ConditionDef {
  label: string
  text: string
}

/** One result on the death table. `table` maps each die face (index = roll − 1) to a wound. */
export type DeathEntry =
  | { kind: 'loseCurrency'; fraction: number; text: string }
  | { kind: 'wound'; group: string; die: number; table: WoundKind[]; text: string }
  | { kind: 'loseGear'; filter: 'any' | 'magical'; text: string }
  | { kind: 'drain'; text: string }

export interface DeathTable {
  die: number
  /** entries[i] is the result for a roll of i + 1. */
  entries: DeathEntry[]
  /** Set health to half max before rolling (2022). Otherwise after (2023/2024). */
  healFirst: boolean
}

// ---------- Campaigns & calendar (phase 1) ----------
// Appended via interface merging so existing declarations stay untouched.

export interface Day {
  /** Calendar month (1–12) this page belongs to. Defaults to sequential from Jan 1. */
  month?: number
  /** Day of the month (1–31). */
  day?: number
  /** Calendar days this page covers; weekend pages (Saturday + Sunday) use 2. */
  span?: number
}

export interface Campaign {
  id: string
  title: string
  blurb: string
  /** The year the pages were written for; page weekdays come from this year. */
  authoredYear: number
  /** Ruleset preset this campaign runs on (see phase 2). */
  rulesetId: RulesetId
  pages: Day[]
}

export interface JournalEntry {
  page: number
  /** Real ISO date the page unlocked on. */
  date: string
  lines: string[]
}

export interface GameState {
  campaignId: string
  /**
   * Real date the campaign's first page falls on. Always the same weekday as
   * the authored first page, so weekdays and weekend pages line up.
   */
  startDate: string
  /** Completed pages, oldest first. */
  journal: JournalEntry[]
}

// ---------- Per-campaign content packs ----------

/** Definitions a campaign brings with it; merged into the global registry. */
export interface ContentPack {
  heroes?: HeroDef[]
  abilities?: AbilityDef[]
  items?: ItemDef[]
  enemies?: EnemyDef[]
  members?: MemberDef[]
}

export interface Campaign {
  /** The campaign's own heroes, items, enemies… (ids must be unique across all campaigns). */
  content?: ContentPack
  /** Heroes offered when starting (default: the base heroes). */
  heroIds?: string[]
  /** A fixed opening hero (e.g. a prologue character); skips the hero pick. */
  startHero?: string
  /** Items given to a new hero (default: 2 rations + 1 Mendwater Vial). */
  startItems?: Record<string, number>
  /** d10 table for hidden loot icons (default: the base table). */
  lootTable?: string[]
  /** In-world date label for page N (default: "Firstfrost N+1"). */
  inWorldDate?: (pageIndex: number) => string
}

// ---------- Prologue & vehicles (frontier rules) ----------

export interface Campaign {
  /**
   * Pages 0 … prologuePages−1 are the prologue. Rulesets whose lottery is
   * `afterPrologue` don't offer it on those pages.
   */
  prologuePages?: number
}

/** The six ship compartments; a d6 picks which one a point of damage hits. */
export type CompartmentId = 'drive' | 'helm' | 'sickbay' | 'guns' | 'bunks' | 'hold'

export interface ShipStats {
  aim?: number
  evasion?: number
  shield?: number
  /** Extra Integrity for the compartment it's attached to. */
  integrity?: number
}

export interface ShipDef {
  id: string
  name: string
  text: string
  aim: number
  evasion: number
  shield: number
  /** Starting Integrity of every compartment. */
  integrity: number
}

/** A crew member, hired into one compartment for good. */
export interface CrewDef {
  id: string
  name: string
  text: string
  fee: number
  bonus: ShipStats
}

/** One upgrade per compartment; the upgrade dictates which compartment. */
export interface ShipUpgradeDef {
  id: string
  name: string
  text: string
  price: number
  compartment: CompartmentId
  bonus: ShipStats
}

/** An enemy craft in a dogfight. */
export interface CraftDef {
  id: string
  name: string
  text: string
  /** Your d100 + Aim must reach this to take it out. */
  evade: number
  /** Its Aim: beat it with d100 + Evasion to take reduced damage. */
  aim: number
  /** Damage when your Evasion loses. */
  dmg: number
  /** Damage when your Evasion wins. */
  reduced: number
}

export interface Compartment {
  id: CompartmentId
  integrity: number
  crew?: string
  upgrade?: string
}

export interface Ship {
  defId: string
  name: string
  compartments: Compartment[]
  /** Ship Parts on hand (each restores 1 Integrity, outside combat). */
  parts: number
}

export interface DogfightState {
  craft: { defId: string; downed: boolean }[]
  round: number
  done: boolean
  won: boolean
}

export interface ContentPack {
  ships?: ShipDef[]
  crew?: CrewDef[]
  upgrades?: ShipUpgradeDef[]
  craft?: CraftDef[]
}

export interface Day {
  /** A ship-to-ship fight, fought after the page's steps (and before any ground combat). */
  dogfight?: {
    craft: string[]
    rounds: number
    intro: string
    winText: string
    loseText: string
    win?: Effect[]
    lose?: Effect[]
  }
  /** A shipyard: hire crew, buy/sell upgrades, buy Ship Parts. */
  dock?: { crew?: string[]; upgrades?: { id: string; price: number }[]; partsPrice?: number }
}

export interface GameState {
  ship?: Ship
}

export interface DayProgress {
  dogfight?: DogfightState | null
}

// ---------- Classic rules (phase 3): pools, followers, upgrades ----------

/** Abilities may cost points from a hero's pool (Spell, Chi, …). */
interface AbilityBase {
  cost?: { pool: PoolId; amount: number }
}

export interface HeroDef {
  /** Starting (and maximum) points in each pool. */
  pools?: Partial<Record<PoolId, number>>
}

export interface LevelSpec {
  /** Pool maximums gained at this level (current points rise by the same amount). */
  pools?: Partial<Record<PoolId, number>>
}

export interface Hero {
  /** Maximum points per pool (absent on heroes without pools). */
  poolMax?: Partial<Record<PoolId, number>>
  /** Current points per pool. */
  pools?: Partial<Record<PoolId, number>>
}

/** A follower: hired for a fee, paid upkeep at every Rest, lends abilities while present. */
export interface FollowerSpec {
  upkeep: number
  /** Ability ids the hero gains while this follower stays. */
  grants: string[]
}

export interface MemberDef {
  follower?: FollowerSpec
}

export interface PartyMember {
  /** Ability ids this follower actually added to the hero (removed when they leave). */
  granted?: string[]
}
