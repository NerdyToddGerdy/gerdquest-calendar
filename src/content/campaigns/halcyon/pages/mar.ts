// March — The Glasshouse Ledger. A bank heist, a lien, and a Combine secret.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk, chk3, cr, dmg, dogfight, fight, give, haven, heal, levelUp, page, parts, repair, step, travel, virtue, week } from '../lib'
import { DOCK_MID, SHOP_EARLY, SHOP_MID, STIMS } from '../shops'

const DC = 12

export const MAR: Day[] = [
  // ---------- Casing the bank ----------
  ...week(3, 6, [
    page('hd-casing', 'Casing the Vault', 'station', 'You spend the day riding Glasshouse’s glass elevators, counting guards and cameras. The lien vault is on the forty-first ring.', [
      step(undefined, chk3('Watch the guard rotations', 'wis', ['perception'], 'Too many patterns. You lose count.', ['Shift change at the third bell. That’s your window.', bonus('roll', 1)], ['Shift change, a blind camera, and a lazy guard who sleeps on duty.', boon], DC)),
    ]),
    page('hd-fixer', 'The Fixer', 'inn', 'In the Undercity, a fixer named Lark sells anything — passcodes, schedules, forged uniforms — for a price.', [
      step(
        'Choose one',
        act('A) Pay Lark’s price', 'Lark counts every coin twice, then hands over a stack of passcodes.', cr(-4), bonus('int', 2)),
        chk('B) Charm a discount', 'cha', ['social'], ['Lark laughs and doubles the price. You walk away with nothing.', cr(-1)], ['Lark likes you. Passcodes, half price.', cr(-2), bonus('int', 2)], DC),
      ),
    ]),
    page('hd-uniforms', 'Borrowed Uniforms', 'station', 'Combine tellers wear silver jackets. You need four. The laundry ring is lightly guarded.', [
      step(undefined, chk('Lift the uniforms', 'dex', ['stealth'], ['A laundry bot chases you through three corridors.', dmg(1)], ['Four silver jackets, pressed and folded.', virtue(-1), bonus('cha', 1)], DC)),
    ]),
    fight('hd-toughs', 'Undercity Toughs', 'inn', 'Someone told someone that a crew with a price on their ship is asking about the vault. Three thugs come to collect.', {
      enemies: ['hd_scrapper', 'hd_scrapper', 'hd_combineagent'],
      rounds: 3,
      intro: 'A bottle breaks. That’s the signal.',
      winText: 'The thugs scatter. One drops a Combine payment chit — they were hired.',
      loseText: 'You escape through the noodle shop’s kitchen.',
      win: [cr(4)],
      lose: [dmg(2)],
    }),
    page('hd-blueprints', 'The Blueprints', 'bridge', 'Lark’s passcodes open the station’s maintenance archive. Somewhere in here are the vault ring’s blueprints.', [
      step(undefined, chk3('Search the archive', 'int', ['tech'], 'Firewall. You back out before it traces you.', ['Vault ring blueprints, three years out of date.', cr(1)], ['Current blueprints, with a maintenance duct right into the vault.', boon, cr(2)], DC)),
    ]),
    haven('hd-noodleshop', 'Above the Noodle Shop', 'inn', 'The crew crowds around the blueprints with bowls of noodles. Juniper raises her chopsticks. “To the worst idea we’ve ever had.” Everyone feels sharper for the month behind them.', {
      note: 'Rest, level up, and try the weekly lottery.',
      steps: [step('Level up', act('Toast the plan', 'Clinking bowls, terrible jokes, and the feeling you might actually pull this off.', levelUp))],
      shop: { items: STIMS },
    }),
  ]),

  // ---------- The heist ----------
  ...week(3, 13, [
    page('hd-insideman', 'The Inside Man', 'station', 'A junior teller named Corvin Pell hates his job, his boss and the Combine. He might help — if you make it worth his while.', [
      step(undefined, chk('Recruit Corvin', 'cha', ['social'], ['Corvin panics and almost calls security. You talk him down, barely.', dmg(1)], ['Corvin will leave a service door unlocked at the third bell.', virtue(1), bonus('roll', 1)], DC)),
    ]),
    page('hd-mirrors', 'Hall of Mirrors', 'station', 'The vault ring is lined with mirrors, and every mirror is a camera.', [
      step(undefined, chk3('Cross the hall unseen', 'dex', ['stealth'], ['An alarm chirps. You hide in a mirror alcove until it stops — bruised from the scramble.', dmg(2)], 'You make it across, sweating.', ['You cross like a ghost and loop the cameras behind you.', bonus('roll', 1)], DC)),
    ]),
    fight('hd-vaultbots', 'Vault Wardens', 'station', 'Two glass-armored security frames unfold from the walls, chiming in polite alarm.', {
      enemies: ['hd_vaultbot', 'hd_vaultbot'],
      rounds: 3,
      intro: '“Unauthorized withdrawal detected.”',
      winText: 'The wardens shatter like dropped chandeliers.',
      loseText: 'You slip past while the wardens recalibrate.',
      win: [cr(4)],
      lose: [dmg(2)],
    }),
    page('hd-ledgerroom', 'The Ledger Room', 'cellar', 'Rows of physical ledgers, chained and sealed: every debt the Combine owns, written by hand.', [
      step(undefined, chk3('Find your page', 'int', ['tech', 'lore'], 'The index is a maze. You find the lien, but the alarm finds you.', ['You find the lien on the Halcyon Debt.', cr(2)], ['The lien — and a sealed ledger stamped “V. — release funds”.', cr(8)], DC)),
    ]),
    page('hd-lien', 'The Lien', 'cellar', 'The original lien on the Halcyon Debt: forty years of payments, penalties and fees, signed in fading ink.', [
      step(
        'Choose one',
        act('A) Burn it', 'You light it with the vault’s own emergency flare. Juniper cries a little, and pretends it’s the smoke.', virtue(1), heal(2)),
        act('B) Keep it as leverage', 'You fold it into your jacket. Paper is power, out here.', cr(3)),
      ),
    ]),
    dogfight('hd-glassescape', 'Out Through the Mirrors', 'Alarms ring through every mirror on the station. You blow the berth clamps and run, with Combine pickets lighting up behind you.', {
      craft: ['hd_picket', 'hd_picket', 'hd_interceptor'],
      rounds: 3,
      intro: 'Glasshouse’s mirror arrays swing to track you.',
      winText: 'You punch out of the mirror ring and into the dark.',
      loseText: 'You escape, but the hull will need work.',
      win: [cr(6), parts(1)],
      lose: [dmg(2)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- What the ledger says ----------
  ...week(3, 20, [
    page('hd-whatledger', 'What the Ledger Says', 'bridge', 'The second ledger — the one stamped “V.” — is a list of payments from the Combine to a Navy prison warden.', [
      step(undefined, chk('Follow the money', 'int', ['lore'], 'Too many shell accounts. It goes nowhere.', ['The Combine is paying to break Oriel Vell out of Navy custody.', bonus('wis', 1), cr(2)], DC)),
    ]),
    page('hd-tobiah', 'A Gunner Walks Out', 'station', 'At a refuel stop, a Combine gunner in uniform marches up to your ship. “Saw what you did at Glasshouse. I quit. Got room?”', [
      step(undefined, chk('Hear Tobiah out', 'cha', ['social'], 'Tobiah’s story has holes. You tell him to find you at Fenn’s if he’s serious.', ['Tobiah Marsh is serious. He’ll sign on at the next dock.', virtue(1), give('hd_targetspike')], DC)),
    ]),
    page('hd-followed', 'Being Followed', 'space', 'A ship has been sitting off your stern for six hours, matching every course change.', [
      step(undefined, chk3('Shake the tail', 'dex', ['piloting'], ['You can’t lose it. It peels off on its own, which is worse.', dmg(1)], 'You lose it in an asteroid cluster.', ['You lose it, double back, and get a clean scan: Combine registry.', boon], DC)),
    ]),
    fight('hd-agents', 'Combine Agents', 'station', 'At a fuel depot, two smiling bankers in grey suits ask to “discuss your account.” They have very unbanklike pistols.', {
      enemies: ['hd_combineagent', 'hd_combineagent'],
      rounds: 3,
      intro: '“Nothing personal. Strictly accounts receivable.”',
      winText: 'The agents go down. Their orders name you, and Glasshouse’s Warden-Teller.',
      loseText: 'The agents retreat, promising “a final notice.”',
      win: [cr(5)],
      lose: [dmg(2)],
    }),
    page('hd-fennsignal', 'A Signal From Fenn’s', 'bridge', 'A tight-beam message from Fenn’s Shipyard: “Heard you robbed a bank. Come in for repairs — and bring stories.”', [
      step(undefined, act('Set course for Fenn’s', 'Two days’ burn through quiet space.', travel(1), repair(1))),
    ]),
    haven('hd-fennsmarch', 'Fenn’s Shipyard', 'station', 'The hollowed asteroid is busier than in January. Free spacers come here to refit, trade and complain about the Combine.', {
      shop: { items: SHOP_EARLY },
      dock: DOCK_MID,
    }),
  ]),

  // ---------- The Warden-Teller ----------
  ...week(3, 27, [
    page('hd-strandmsg', 'The Warden-Teller', 'bridge', 'A gold-edged invitation arrives: Warden-Teller Imogen Strand of Glasshouse “requests the pleasure of settling your account in person.”', [
      step(
        'Choose one',
        chk('A) Accept, with conditions', 'cha', ['social'], 'Strand agrees to nothing. She’ll be ready.', ['Strand agrees to meet in the vault ring — alone, she claims.', bonus('roll', 1)], DC),
        act('B) Refuse and go in anyway', 'If she wants a meeting, she can have one on your terms.', virtue(-1), bonus('atk', 1)),
      ),
    ]),
    page('hd-returnglass', 'Back to Glasshouse', 'space', 'The mirror ring glitters ahead. This time, they know you’re coming.', [
      step(undefined, chk('Approach under a false transponder', 'int', ['tech'], ['The forgery fails. Traffic control knows exactly who you are.', travel(1)], ['Traffic control waves through “the ore barge Patience.”', travel(1), cr(2)], DC)),
    ]),
    dogfight('hd-mirrorguns', 'The Mirror Guns', 'Glasshouse’s defense pickets close in, and its great mirrors focus starlight into beams that cut through space.', {
      craft: ['hd_picket', 'hd_picket', 'hd_picket'],
      rounds: 4,
      intro: 'The mirror arrays begin to turn.',
      winText: 'You fly straight down the station’s spine to the vault ring.',
      loseText: 'You make it to the vault ring with a scorched hull.',
      win: [cr(6)],
      lose: [dmg(2)],
    }),
    page('hd-vaultheart', 'The Vault’s Heart', 'cellar', 'Behind the ledgers is a second vault: Strand’s private one. Its door is a single slab of glass.', [
      step(undefined, chk3('Get through the glass door', 'dex', ['stealth', 'tech'], ['The door alarms. Strand knows you’re here.', dmg(1)], 'The door slides open with a sigh.', ['The door opens, and you jam its alarm for good measure.', bonus('roll', 1)], DC)),
    ]),
    fight('hd-strandfight', 'Warden-Teller Imogen Strand', 'station', 'Strand waits in the vault with a warden unit at her side. “Every debt is paid, eventually,” she says. “Today, you pay.”', {
      enemies: ['hd_strand', 'hd_vaultbot'],
      rounds: 4,
      intro: 'Strand draws a slim glass blade.',
      winText: 'Strand yields. Her private vault holds Combine orders sealed by the Auditor-General herself: “Find the Choir. Bury it.”',
      loseText: 'Strand escapes through a hidden lift. You take what you can carry from her vault.',
      win: [cr(12), give('hd_traumakit')],
      lose: [cr(4), dmg(2)],
    }),
    haven('hd-glassfalls', 'The Glass Ring Falls Quiet', 'inn', 'The Undercity throws you a party it can’t afford. Everyone wants to buy a drink for the crew that robbed Glasshouse twice.', {
      shop: { items: SHOP_MID },
      icons: [{ kind: 'loot', x: 30, y: 40 }],
    }),
  ]),
]
