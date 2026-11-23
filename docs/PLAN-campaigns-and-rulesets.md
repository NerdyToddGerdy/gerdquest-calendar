# Plan: multiple campaigns, real-calendar play, and rule variants

> **Update (implemented):** campaigns no longer map onto Jan 1 of a play year.
> A new campaign is anchored to a `startDate` about a week back that falls on
> the same weekday as its first authored page. Every page shifts by the same
> number of days, so weekdays, Sat/Sun weekend pages (`span: 2`) and the
> Sunday lottery line up with the real calendar, and Feb 29 needs no special
> case. The warm-up pages before today double as a tutorial. The player
> chooses between the recommended start (4–10 days back) and the weeks around
> it. Sections below that mention "play year" or Feb 29 merging are superseded.


## Goals
1. **Play several campaigns side by side.** Each campaign has its own save. A home screen shows what's waiting today in every campaign.
2. **Play an older campaign in a newer calendar year.** A campaign written for one year can be played in any later year. Its pages land on the same month and day of the year you're playing in.
3. **Weekday rules follow the year you're playing in.** A rule like "lottery every Sunday" uses the real Sundays of that year, not the weekdays of the year the campaign was written for.
4. **No peeking ahead.** Pages unlock on their real date. If you've fallen behind you can play every unlocked page to catch up, and you can re-read finished pages. You can never see a future page, not even its title.
5. **Rule variants.** Each campaign runs on a ruleset modeled on one year's rules: 2022, 2023 or 2024.

The campaigns are original Questender stories. Each one uses one year's *rules*. None of them copies a calendar's story, heroes, items or art.

---

## Rule differences found (rules pages of each year's PDFs)

| Area | 2022 rules | 2023 rules | 2024 rules (what the engine does now) |
|---|---|---|---|
| Currency | gold | credits | amber (we call it glint) |
| Components | 7 dice | 7 dice + pencil | 7 dice + playing cards |
| Opening | Short prologue with 1 fixed hero, then pick from 6 | Prologue with 1 fixed hero, then pick from 6 | Play each of the 6 heroes for a week, then pick one |
| Defense | Fixed number: "how difficult it is to be hit" | Fixed number | **Rolled** each round: d20 + Defense |
| Groups of enemies | **1 round per monster** | Set number of rounds | Set number of rounds |
| Single enemy over several rounds | Can only be killed in the **final round**. A hit with enough damage in an earlier round **Stuns** it (you take no damage that round) | — | — |
| Natural 1 / natural 20 | Not in the rules | Not in the rules | Natural 1 always fails; natural 20 gives a Boon (+d4 later, hold 1) |
| Death roll | **d6** (you're healed to half first): 1 lose **all** gold · 2 Physical Injury d6 (Str/Dex/Con) · 3 Mental Trauma d6 (Int/Wis/Cha) · 4 Grievous Wound d8 (Max HP −2 / Armor −1 / Atk −1 / Damage −1) · 5 lose a **magical** item · 6 per-Rest abilities marked used. Optional hard mode: on a 6, switch to a new hero at the same level with no gear | **d4**: 1 lose half credits · 2 injury d10 · 3 lose an item · 4 per-Rest abilities marked used | Same d4 table as 2023 |
| Conditions | Poisoned, Cursed | **Infected, Malfunction** | Poisoned, Cursed |
| Point pools refilled on Rest | Spell, Chi | Charges, Spell, Chi, Surge | Spell |
| Companions | **Followers**: hiring fee, plus **upkeep paid at every Rest** or they leave. They give you abilities | **Crew** assigned to ship compartments | **Party**: 10 slots (5 critters, 5 bugs), activated by drawing cards, have HP |
| Rest extras | Pay follower upkeep | — | Party heals; you can swap members |
| When gear can be swapped | **Only on a Rest** | On a Rest, or the day you get new gear | On a Rest, or the day you get new gear |
| Selling to shops | **Full** price. Once you leave a shop you **can't go back** | **Full** price | **Half** price |
| Pickpocket | Only heroes **with the Pickpocket ability** | Anyone who finds the hidden icon; can decline | Same as 2023 |
| Hidden loot icons (backpack, d10 table) | No | No | Yes |
| Sunday lottery (d6) | No | Yes, after the prologue ends | Yes |
| Rations | Used while traveling | −1 HP for each missing ration | Same as 2023 |
| Virtue | Can affect abilities or bonuses | Only goes up or down | Gives bonuses or penalties on rolls |
| Item quirks | **Stacking upgrades** (weapon +1 Damage or +1 Attack, up to 3 each). **Situational bonuses** (mounts: +Wis while traveling; tools: +2 on lock picking). **Per-page buffs that roll a die** (+d6 Cha for the page) | Items that remove a Wound | Items that remove a Wound |
| Vehicles | — | **Ship dogfights**: d100 + Aim (one hit takes out an enemy, no Damage roll); d100 + Evasion against the enemy's Aim (miss means maximum damage); Shield subtracts from damage; 6 compartments with Integrity 3, a d6 picks which one each point of damage hits, damage to a compartment at 0 goes to the hero instead; Ship Parts repair outside combat; crew die when their compartment hits 0; one upgrade per compartment, resold at full price | — |

**Guesses we have to make.** The PDFs refer to fuller rules on the publisher's website, so the following are our own interpretations:
- **Fixed Defense:** if your Defense is at least the enemy's attack value, you take half damage.
- **"Combat Difficulty":** this is a per-fight setting that 2023 and 2024 mention but never explain. We'll implement it as a per-fight adjustment set in the content.
- **2022 rations:** −1 HP for each missing ration, as in later years.

---

## Phase 1: Calendar layer, multiple campaigns, date locking
This phase covers what you asked for directly. It doesn't depend on the ruleset work.

**Data model**
```ts
interface Campaign {
  id: string; title: string; rulesetId: RulesetId
  authoredYear: number                  // the year the pages were written for
  opening: { kind: 'prologue'; heroId: string } | { kind: 'heroTrial'; weeks: number } | { kind: 'pick' }
  pages: Day[]                          // each Day gets `month` and `day` (replaces list position)
}
interface SaveSlot {                    // one per campaign being played
  slotId: string; campaignId: string; playYear: number
  state: GameState                      // the current state, plus `pageIndex`
}
```

**Date mapping** (`engine/calendar.ts`, pure functions; "now" is passed in so tests can control it):
- `pageDate(page, playYear)` returns a real date: same month and day, in the play year.
- **Leap days.**
  - A Feb 29 page played in a non-leap year unlocks on Feb 28, together with the Feb 28 page.
  - A campaign with no Feb 29 page, played in a leap year: Feb 29 is a free day with nothing to play.
- `weekday(date)` drives every weekday rule (lottery). The in-world date label is shown next to the real date.
- `unlockedThrough(slot, now)` is the last page whose date is on or before today in the player's local time zone.

**Locking and catching up**
- The page you're on is playable only if it's unlocked. "Turn the page" stops at today. The next page shows only a countdown ("Unlocks Tue, Mar 4").
- If you're behind, a "Catching up: 5 pages behind" banner appears, and you play the missed pages in order. Each page's weekday rules use that page's own date. For example, a Sunday page you're catching up on Wednesday still offers its lottery.
- Finished pages go into a **Journal**: read-only text, your choices and the results.
- Future pages are never rendered. Their titles and notes aren't even put in the page.
- **Keeping future content off the device** (optional, phase 1b): split content into one file per month that's only downloaded once that month unlocks. True secrecy would need a server that hands out pages by date; that's out of scope for now.
- Dev builds get a "pretend today is…" date override for testing. Production builds leave it out.

**Several campaigns**
- Switch from one save to one save per campaign: a slot index plus one stored save per slot (`questender.slots`, `questender.slot.<id>`). Existing v1 saves migrate into a slot for the Brightwatch campaign.
- **Today** home screen: one card per active campaign. Each card shows that day's page, its status (*Ready*, *Done*, *N behind*) and a "Continue" button. A "New campaign" button picks a campaign and a play year (defaults to this year). You can't start the same campaign twice in the same year.
- Export and import work on one slot at a time.

**Content changes**
- Replace `dayLabel`'s made-up weekday names with the real play-year weekday and date. Keep an optional in-world date line.
- Content-writing rule: **page text never mentions a weekday.** Weekday-specific events (lottery) come from rules, not from page text.

**Files:** new `engine/calendar.ts` and `engine/campaign.ts`, new `src/content/campaigns/<id>/`. Brightwatch moves into `campaigns/brightwatch/`. Also new `ui/Home.tsx` and `ui/Journal.tsx`, and a rewrite of `save.ts` for multiple slots. Small changes to `state.ts`: `pageIndex`, NEXT_DAY checks the lock, the lottery checks the weekday.

---

## Phase 2: Ruleset config (nothing changes for the current game)
Add `engine/ruleset.ts` with a `Ruleset` object. Every place in the engine that currently hard-codes a 2024 rule reads from it instead:
```ts
interface Ruleset {
  id: 'classic' | 'frontier' | 'modern'      // modeled on 2022 / 2023 / 2024
  currencyName: string
  conditions: { a: ConditionDef; b: ConditionDef }   // Poisoned/Cursed or Infected/Malfunction
  pools: PoolId[]                            // point pools refilled on Rest
  boons: boolean                             // natural 1 always fails + natural 20 gives a Boon
  combat: { defense: 'roll' | 'static'; groups: 'fixedRounds' | 'roundPerMonster'; soloStun: boolean }
  death: DeathTable                          // table data, see phase 3
  gearSwap: 'restOnly' | 'restOrAcquire'
  shop: { sellRate: 1 | 0.5; noReturn: boolean }
  pickpocket: 'anyone' | 'abilityOnly'
  lootIcons: boolean
  lottery: { weekday: 0; afterPrologue: boolean } | null
  companions: 'party' | 'followers' | 'crew'
  rationPenalty: number
}
```
- Write the **modern** preset to match today's behavior exactly. All 25 existing tests should pass without changes. That proves the refactor broke nothing.
- Look up `rules(state)` once per action and pass it into `combat`, `death`, `rest`, `economy` and `party`.

## Phase 3: Classic preset (2022-style rules)
- **Death tables as data:** `{ die, healFirst, entries: [{ kind: 'loseCurrency', fraction }, { kind: 'wound', group, die, table }, { kind: 'loseGear', filter: 'any' | 'magical' }, { kind: 'drain' }] }`. Wounds get a group (physical / mental / grievous) so a Rest removes one of them, following the same rule as before. Add the optional hard mode.
- **Combat:**
  - Fixed Defense (no Defense roll).
  - Groups get 1 round per monster.
  - A single enemy can only be killed in the final round; earlier hits with enough damage Stun it.
- **Followers:** hiring fee plus upkeep. The Rest step charges upkeep, and any follower you can't afford leaves. A follower adds its abilities to the hero while it stays.
- **Shops:** sell back at full price. With `noReturn`, a shop closes for good once you finish that page's shop or move to the next page.
- **Other:**
  - Gear can only be swapped on a Rest.
  - Pickpocketing requires the ability.
  - **Stacking upgrades:** items get `stackMax` (e.g. weapon +1 Damage, up to 3).
  - **Situational bonuses:** item bonuses tagged with a situation, e.g. `{ wis: 2, when: 'travel' }` or `{ check: 2, tags: ['lockpick'] }`.
  - **Per-page die buffs** (+d6 to a trait for the page).
  - Spell/Chi pools.

## Phase 4: Frontier preset (2023-style rules)
- Credits; Infected and Malfunction conditions; an item that removes a Wound; Charges/Spell/Chi/Surge pools.
- **Prologue opening:** a fixed hero for the first pages, then you pick a hero. The lottery starts after the prologue.
- No Boons, no hidden loot icons. Defense isn't rolled.

## Phase 5: Vehicles (2023-style dogfights)
- `engine/vehicle.ts`:
  - Ship stats: Aim, Evasion, Shield.
  - 6 compartments, each with Integrity (base 3), plus crew and upgrade slots.
- **Dogfight round:**
  - Roll d100 + Aim against each enemy. A hit takes it out.
  - Then roll d100 + Evasion against the enemy's Aim. Win and the damage is reduced; lose and you take maximum damage.
  - Subtract Shield.
  - Each remaining point of damage rolls a d6 to pick a compartment and costs it 1 Integrity.
  - When a compartment reaches 0, its crew and upgrades are destroyed, and further damage there goes to the hero.
- **Ship Parts:** repairs, only outside combat.
- **Crew:** hired, then locked to a compartment.
- **Upgrades:** one per compartment, resold at full price.
- **Display:** the d100 is shown as two d10s, using the existing `rollD100`.
- **UI:** a ship sheet beside the hero sheet, and a `DogfightView` that reuses the slot and `RollPanel` pattern.
- **Content:** a Day can have `dogfight: { enemies, rounds }` alongside `combat`.

## Content
- Brightwatch stays a **modern**-rules campaign.
- Write one original starter campaign (at least 2 weeks) for each of the **classic** and **frontier** presets, so every rule variant can be played. Frontier is the right home for the ship content in phase 5.

---

## Tests and checks
- **Calendar** (fixed "now"):
  - Page mapping in leap and non-leap play years, including the Feb 29 merge.
  - Lock boundaries at local midnight.
  - The lottery is offered on Sunday pages and not on others; with `afterPrologue`, only once the prologue ends.
  - The catch-up count.
  - NEXT_DAY is refused past today.
  - The future page's title never shows up in rendered output.
- **Rulesets:**
  - Each death-table entry, including rerolls and the "magical items only" filter.
  - Stun versus kill in single-enemy fights.
  - 1 round per monster.
  - Upkeep charged and followers leaving when unpaid.
  - Full and half sell prices; shops closing for good with `noReturn`.
  - Rest-only gear swapping.
  - Stacking caps; situational bonuses applying only in their situation.
- **Vehicles:** damage spread over compartments, overflow to the hero, crew loss, Shield subtraction, d100 edge cases (00 + 0 = 100).
- **Seeded playthroughs:** one automated run per preset, the same way the current full-week test works.
- **Browser:** a headless run of two campaigns side by side with the date override set, covering catch-up, the lock wall, a Sunday lottery, and reloading to check the saves.

## Build order
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5, with each phase's content written as that phase finishes. Phases 1 and 2 don't depend on each other and can be done in either order. Phase 1 comes first because it's what you asked for.
