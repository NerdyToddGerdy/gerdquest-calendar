// The Halcyon Debt — items, enemies, the ship, crew, upgrades and enemy craft.
import type { CraftDef, CrewDef, EnemyDef, ItemDef, ShipDef, ShipUpgradeDef } from '../../../engine/types'

export const ITEMS: ItemDef[] = [
  { id: 'hd_medgel', name: 'Medgel Ampoule', kind: 'heal', die: 6, bonus: 2, price: 5, text: 'Recover d6+2 health. Not usable during combat rounds.' },
  { id: 'hd_suture', name: 'Suture Foam', kind: 'cure', price: 12, text: 'Seals one lingering Wound.' },
  { id: 'hd_arcgrenade', name: 'Arc Grenade', kind: 'slotDie', die: 6, slots: ['damage'], price: 4, text: 'Add d6 to a Damage roll.' },
  { id: 'hd_targetspike', name: 'Targeting Spike', kind: 'slotDie', die: 10, slots: ['aim'], price: 5, text: 'Add d10 to a ship’s Aim roll.' },
  { id: 'hd_chaff', name: 'Chaff Pod', kind: 'slotDie', die: 10, slots: ['evasion'], price: 5, text: 'Add d10 to a ship’s Evasion roll.' },
  { id: 'hd_focusstim', name: 'Focus Stim', kind: 'pageBonus', stat: 'int', amount: 2, price: 3, text: '+2 Intellect for the rest of today.' },
  { id: 'hd_gripstim', name: 'Grip Stim', kind: 'pageBonus', stat: 'str', amount: 2, price: 3, text: '+2 Strength for the rest of today.' },
  { id: 'hd_reflexstim', name: 'Reflex Stim', kind: 'pageBonus', stat: 'dex', amount: 2, price: 3, text: '+2 Dexterity for the rest of today.' },
  { id: 'hd_visor', name: 'Ballistic Visor', kind: 'gear', slot: 'head', bonus: { def: 1 }, price: 10, text: '+1 Defense.' },
  { id: 'hd_vest', name: 'Padded Flight Vest', kind: 'gear', slot: 'body', bonus: { maxHp: 2 }, price: 12, text: '+2 max health.' },
  { id: 'hd_gloves', name: 'Grip Gloves', kind: 'gear', slot: 'hands', bonus: { atk: 1 }, price: 10, text: '+1 Attack.' },
  { id: 'hd_magboots', name: 'Mag Boots', kind: 'gear', slot: 'feet', bonus: { dex: 1 }, price: 8, text: '+1 Dexterity.' },
  { id: 'hd_comchip', name: 'Old Comm Chip', kind: 'gear', slot: 'trinket', bonus: { wis: 1, cha: 1 }, price: 14, text: '+1 Wisdom, +1 Charisma.' },
  // Later in the year
  { id: 'hd_traumakit', name: 'Trauma Kit', kind: 'heal', die: 10, bonus: 4, price: 9, text: 'Recover d10+4 health. Not usable during combat rounds.' },
  { id: 'hd_plasmacharge', name: 'Plasma Charge', kind: 'slotDie', die: 10, slots: ['damage'], price: 7, text: 'Add d10 to a Damage roll.' },
  { id: 'hd_aegispatch', name: 'Aegis Patch', kind: 'slotDie', die: 6, slots: ['defense'], price: 4, text: 'Add d6 to a Defense roll.' },
  { id: 'hd_witstim', name: 'Wit Stim', kind: 'pageBonus', stat: 'wis', amount: 2, price: 3, text: '+2 Wisdom for the rest of today.' },
  { id: 'hd_charmstim', name: 'Charm Stim', kind: 'pageBonus', stat: 'cha', amount: 2, price: 3, text: '+2 Charisma for the rest of today.' },
  { id: 'hd_luckcoin', name: 'Old Navy Challenge Coin', kind: 'boon', price: 8, text: 'Gain a Boon (if you don’t already hold one).' },
  { id: 'hd_helm2', name: 'Void-Rated Helm', kind: 'gear', slot: 'head', bonus: { def: 2 }, price: 22, text: '+2 Defense.' },
  { id: 'hd_plate', name: 'Ceramic Plate Rig', kind: 'gear', slot: 'body', bonus: { maxHp: 4 }, price: 20, text: '+4 max health.' },
  { id: 'hd_gauntlets', name: 'Servo Gauntlets', kind: 'gear', slot: 'hands', bonus: { atk: 2 }, price: 24, text: '+2 Attack.' },
  { id: 'hd_jetboots', name: 'Jet Boots', kind: 'gear', slot: 'feet', bonus: { dex: 2 }, price: 18, text: '+2 Dexterity.' },
  { id: 'hd_songstone', name: 'Songstone Pendant', kind: 'gear', slot: 'trinket', bonus: { wis: 2, int: 1 }, price: 26, text: 'A sliver of Choir stone that hums when danger is near. +2 Wisdom, +1 Intellect.' },
  { id: 'hd_captainsbars', name: 'Captain’s Bars', kind: 'gear', slot: 'trinket', bonus: { cha: 2, atk: 1 }, price: 26, text: 'Pinned on by the whole free fleet. +2 Charisma, +1 Attack.' },
]

export const ENEMIES: EnemyDef[] = [
  { id: 'hd_leech', name: 'Duct Leech', ac: 10, toughness: 3, hits: 11, dmg: 1, text: 'Pale, wet and hungry. Carries a nasty infection.' },
  { id: 'hd_scrapper', name: 'Scrapper', ac: 11, toughness: 4, hits: 12, dmg: 2, text: 'A ring scavenger with a cutting torch and no scruples.' },
  { id: 'hd_drone', name: 'Sentry Drone', ac: 12, toughness: 5, hits: 12, dmg: 2, text: 'A hovering turret that beeps politely before it shoots.' },
  { id: 'hd_enforcer', name: 'Vell Enforcer', ac: 13, toughness: 6, hits: 13, dmg: 3, text: 'Armored, disciplined, and paid in salvage rights.' },
  { id: 'hd_vell', name: 'Captain Oriel Vell', ac: 14, toughness: 8, hits: 14, dmg: 4, text: 'The Shoal’s most polite pirate. Wants the data core, and you, gone.' },
  // February: Tern Deep
  { id: 'hd_icecrawler', name: 'Ice Crawler', ac: 11, toughness: 4, hits: 12, dmg: 2, text: 'A many-legged maintenance bot gone feral in the cold.' },
  { id: 'hd_auditguard', name: 'Combine Repo Guard', ac: 12, toughness: 5, hits: 13, dmg: 3, text: 'Grey armor, a stun-lance, and a clipboard.' },
  { id: 'hd_kessel', name: 'Auditor Brannoc Kessel', ac: 14, toughness: 8, hits: 14, dmg: 4, text: 'Reads you your arrears while he swings.' },
  // March: Glasshouse
  { id: 'hd_vaultbot', name: 'Vault Warden Unit', ac: 13, toughness: 6, hits: 14, dmg: 3, text: 'A glass-armored security frame that counts in interest.' },
  { id: 'hd_combineagent', name: 'Combine Agent', ac: 13, toughness: 6, hits: 13, dmg: 3, text: 'A smiling banker with a very unbanklike pistol.' },
  { id: 'hd_strand', name: 'Warden-Teller Imogen Strand', ac: 15, toughness: 9, hits: 15, dmg: 4, text: 'Keeper of the Glasshouse vaults. Has never lost a deposit.' },
  // April: Breakers
  { id: 'hd_dustrat', name: 'Dust Rat', ac: 12, toughness: 5, hits: 13, dmg: 2, text: 'A storm-addled scavenger with a magnetic hook.' },
  { id: 'hd_stormraider', name: 'Storm Raider', ac: 14, toughness: 6, hits: 14, dmg: 3, text: 'One of Sela’s crew, lightning tattoos and all.' },
  { id: 'hd_sela', name: 'Mother Sela Quin', ac: 15, toughness: 9, hits: 15, dmg: 5, text: 'Queen of the Breaker Belt. Fights with an arc-whip and a grudge.' },
  // May: the Choir wakes
  { id: 'hd_marine', name: 'Navy Marine', ac: 14, toughness: 7, hits: 15, dmg: 3, text: 'Polite, precise, and under orders.' },
  { id: 'hd_relicguard', name: 'Relic Guardian', ac: 15, toughness: 7, hits: 15, dmg: 4, text: 'A tall shape of song-stone that moves when the Choir hums.' },
  { id: 'hd_sentinel', name: 'The Choir Sentinel', ac: 16, toughness: 10, hits: 15, dmg: 5, text: 'An ancient guardian waking for the first time in ten thousand years.' },
  // June: Quarantine
  { id: 'hd_bloomed', name: 'Bloomed Dockhand', ac: 13, toughness: 6, hits: 14, dmg: 3, text: 'Spore-sick and confused. Every scratch carries the infection.' },
  { id: 'hd_sporeswarm', name: 'Spore Swarm', ac: 14, toughness: 5, hits: 15, dmg: 3, text: 'A drifting cloud that bites.' },
  { id: 'hd_bloom', name: 'The Bloom', ac: 16, toughness: 10, hits: 16, dmg: 5, text: 'A whole freighter grown into one breathing, flowering thing.' },
  // July: Vell
  { id: 'hd_velllt', name: 'Vell Lieutenant', ac: 15, toughness: 7, hits: 15, dmg: 4, text: 'Fiercely loyal. Quotes Vell’s sayings mid-fight.' },
  { id: 'hd_vell2', name: 'Oriel Vell, Unbowed', ac: 17, toughness: 10, hits: 16, dmg: 5, text: 'Out of a cell and into a new coat. Still polite. Much angrier.' },
  // August: Free Port
  { id: 'hd_trooper', name: 'Combine Trooper', ac: 15, toughness: 7, hits: 16, dmg: 4, text: 'Hired muscle in company colors.' },
  { id: 'hd_hunter', name: 'Bounty Hound', ac: 16, toughness: 8, hits: 16, dmg: 4, text: 'One of Fane’s pack: tracker, cutthroat, collector.' },
  { id: 'hd_fane', name: 'Iolo Fane, Bounty Hunter', ac: 17, toughness: 10, hits: 16, dmg: 5, text: 'Never lost a mark. Has a little book with your name in it.' },
  // September: Deep Lanes
  { id: 'hd_shade', name: 'Choir Shade', ac: 16, toughness: 8, hits: 16, dmg: 4, text: 'An echo of a guardian, flickering between notes.' },
  { id: 'hd_choirwarden', name: 'The Choir Warden', ac: 18, toughness: 11, hits: 17, dmg: 6, text: 'The relay’s last defender: a cathedral that walks.' },
  // October: the mole
  { id: 'hd_elite', name: 'Combine Elite', ac: 16, toughness: 8, hits: 17, dmg: 5, text: 'The Combine’s best, in mirrored visors.' },
  { id: 'hd_quell', name: 'Harbormaster Quell', ac: 17, toughness: 10, hits: 17, dmg: 5, text: 'The man who “resigned” in January. Never really left the Combine.' },
  // November: siege
  { id: 'hd_siegetrooper', name: 'Siege Trooper', ac: 17, toughness: 8, hits: 17, dmg: 5, text: 'Boarding armor, a breaching shotgun, no patience.' },
  { id: 'hd_executor', name: 'Thale’s Executor', ac: 18, toughness: 11, hits: 17, dmg: 6, text: 'The Auditor-General’s enforcer. Wears a mask shaped like a seal of office.' },
  // December: Final Notice
  { id: 'hd_honorguard', name: 'Ledger Honor Guard', ac: 18, toughness: 9, hits: 17, dmg: 5, text: 'Gold-trimmed armor, paid for with a thousand repossessions.' },
  { id: 'hd_thale', name: 'Auditor-General Maren Thale', ac: 19, toughness: 12, hits: 17, dmg: 6, text: 'Head of the Ledger Combine. Believes every debt must be paid, in full.' },
]

export const SHIPS: ShipDef[] = [
  {
    id: 'hd_halcyon',
    name: 'Halcyon Debt',
    text: 'A dented long-hauler with a loud drive and a quiet hold. Paid off in installments; still owed on.',
    aim: 20,
    evasion: 15,
    shield: 1,
    integrity: 3,
  },
]

export const CREW: CrewDef[] = [
  { id: 'hd_rook', name: 'Rook Adeyemi', text: 'Engineer. Hums while welding. Adds +1 Integrity to their compartment.', fee: 8, bonus: { integrity: 1 } },
  { id: 'hd_petra', name: 'Petra Lind', text: 'Gun-hand. Swears at the targeting computer until it behaves. +10 Aim.', fee: 10, bonus: { aim: 10 } },
  { id: 'hd_oduya', name: 'Oduya Fenn', text: 'Navigator. Knows every shortcut through the Shoal, and which ones are traps. +10 Evasion.', fee: 10, bonus: { evasion: 10 } },
  { id: 'hd_tobiah', name: 'Tobiah Marsh', text: 'Ex-Combine gunner who walked out mid-shift. +15 Aim.', fee: 18, bonus: { aim: 15 } },
  { id: 'hd_nadia', name: 'Nadia Kovač', text: 'Storm pilot from Coppice. Flies the Breaker Belt for fun. +15 Evasion.', fee: 18, bonus: { evasion: 15 } },
  { id: 'hd_bix', name: 'Old Bix', text: 'Older than the ship and twice as patched. +2 Integrity to their compartment.', fee: 14, bonus: { integrity: 2 } },
  { id: 'hd_sable', name: 'Sable', text: 'A quiet field-tech who tunes shield emitters by ear. +1 Shield.', fee: 20, bonus: { shield: 1 } },
]

export const UPGRADES: ShipUpgradeDef[] = [
  { id: 'hd_up_capacitor', name: 'Capacitor Shield', compartment: 'drive', bonus: { shield: 1 }, price: 14, text: 'Drive Room: +1 Shield.' },
  { id: 'hd_up_tracking', name: 'Tracking Suite', compartment: 'guns', bonus: { aim: 10 }, price: 12, text: 'Gun Deck: +10 Aim.' },
  { id: 'hd_up_vanes', name: 'Thrust Vanes', compartment: 'helm', bonus: { evasion: 10 }, price: 12, text: 'Helm: +10 Evasion.' },
  { id: 'hd_up_plating', name: 'Hold Plating', compartment: 'hold', bonus: { integrity: 1 }, price: 8, text: 'Hold: +1 Integrity.' },
  { id: 'hd_up_autodoc', name: 'Autodoc Frame', compartment: 'sickbay', bonus: { integrity: 1 }, price: 8, text: 'Sickbay: +1 Integrity.' },
  { id: 'hd_up_bunks', name: 'Reinforced Bunks', compartment: 'bunks', bonus: { integrity: 1 }, price: 10, text: 'Crew Bunks: +1 Integrity.' },
  { id: 'hd_up_railbank', name: 'Rail Bank', compartment: 'guns', bonus: { aim: 20 }, price: 24, text: 'Gun Deck: +20 Aim.' },
  { id: 'hd_up_ghostdrive', name: 'Ghost Drive', compartment: 'helm', bonus: { evasion: 20 }, price: 24, text: 'Helm: +20 Evasion.' },
  { id: 'hd_up_aegis', name: 'Aegis Emitter', compartment: 'drive', bonus: { shield: 2 }, price: 28, text: 'Drive Room: +2 Shield.' },
  { id: 'hd_up_medbay', name: 'Full Medbay', compartment: 'sickbay', bonus: { integrity: 2 }, price: 18, text: 'Sickbay: +2 Integrity.' },
  { id: 'hd_up_armorhold', name: 'Armored Hold', compartment: 'hold', bonus: { integrity: 2 }, price: 18, text: 'Hold: +2 Integrity.' },
]

export const CRAFT: CraftDef[] = [
  { id: 'hd_skiff', name: 'Scav Skiff', evade: 55, aim: 50, dmg: 3, reduced: 1, text: 'A bolted-together cutter with a harpoon gun.' },
  { id: 'hd_interceptor', name: 'Vell Interceptor', evade: 65, aim: 60, dmg: 4, reduced: 2, text: 'Fast, narrow, and painted the color of old blood.' },
  { id: 'hd_gunship', name: 'The Undertow', evade: 75, aim: 70, dmg: 6, reduced: 3, text: 'Vell’s gunship. Slow to turn, terrible to face.' },
  { id: 'hd_picket', name: 'Combine Picket', evade: 68, aim: 62, dmg: 4, reduced: 2, text: 'A grey patrol boat with a repossession beacon.' },
  { id: 'hd_raider', name: 'Breaker Raider', evade: 72, aim: 66, dmg: 4, reduced: 2, text: 'Storm-scarred and fast, riding the ion winds.' },
  { id: 'hd_squall', name: 'The Squall', evade: 82, aim: 76, dmg: 6, reduced: 3, text: 'Mother Sela’s flagship. Lightning crawls along its hull.' },
  { id: 'hd_frigate', name: 'Navy Frigate', evade: 84, aim: 80, dmg: 6, reduced: 3, text: 'Clean lines, big guns, regulations painted on the hull.' },
  { id: 'hd_vellwing', name: 'Vell Wing Fighter', evade: 80, aim: 78, dmg: 5, reduced: 2, text: 'New paint, the same old blood-red.' },
  { id: 'hd_cutter', name: 'Combine Cutter', evade: 84, aim: 80, dmg: 5, reduced: 2, text: 'A sleek repossession hunter with grapple arms.' },
  { id: 'hd_choirdrone', name: 'Choir Drone', evade: 88, aim: 84, dmg: 5, reduced: 3, text: 'A shard of song-stone that flies like a thought.' },
  { id: 'hd_lancer', name: 'Combine Lancer', evade: 90, aim: 86, dmg: 6, reduced: 3, text: 'A heavy interceptor built around one enormous gun.' },
  { id: 'hd_finalnotice', name: 'The Final Notice', evade: 98, aim: 92, dmg: 8, reduced: 4, text: 'The Combine’s dreadnought. Its hull is engraved with every debt it has collected.' },
]
