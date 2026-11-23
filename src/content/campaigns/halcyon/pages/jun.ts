// June — Quarantine. Spores from the vaults, an outbreak on Saltlight, and the Bloom.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk, chk3, cr, cured, dmg, dogfight, fight, give, haven, heal, infected, page, parts, repair, step, travel, virtue, week } from '../lib'
import { DOCK_MID, SHOP_MID } from '../shops'

const DC = 13

export const JUN: Day[] = [
  // ---------- The outbreak ----------
  ...week(6, 5, [
    page('hd-outbreak', 'Outbreak', 'station', 'The sick have a pale bloom of spores under their skin. Saltlight’s doctors are exhausted, and some of them are sick too.', [
      step(undefined, chk3('Examine the patients', 'int', ['medical'], ['You learn nothing — except how it feels to catch it.', infected], 'The spores spread through touch and air vents.', ['The spores match the dust from Lacuna’s caves. Someone carried them here.', boon, cr(2)], DC)),
    ]),
    page('hd-triageline', 'The Triage Line', 'station', 'Hundreds of people queue in the corridors. You have to decide, quickly, who needs help first.', [
      step(undefined, chk('Run the triage line', 'wis', ['medical', 'perception'], ['A long, terrible day. You make mistakes, and they weigh on you.', virtue(-1), dmg(1)], ['You keep the line moving. Nobody dies in the corridor today.', virtue(2)], DC)),
    ]),
    fight('hd-bloomed', 'The Bloomed', 'cellar', 'In the lower salt-works, spore-sick dockhands wander, confused and violent. You need to get past them to reach the air plant.', {
      enemies: ['hd_bloomed', 'hd_bloomed'],
      rounds: 3,
      intro: 'They don’t recognize you. They don’t recognize anything.',
      winText: 'You get the dockhands into restraints and into the clinic.',
      loseText: 'You fall back. One of them scratched you.',
      win: [cr(3), virtue(1)],
      lose: [dmg(2), infected],
    }),
    page('hd-sporesource', 'Source of the Spores', 'cellar', 'The spore counts are highest around a single cargo berth — where a freighter docked three weeks ago and then left in a hurry.', [
      step(undefined, chk3('Trace the freighter', 'int', ['lore', 'tech'], 'The berth records were wiped.', ['The freighter was the Merrow, carrying “mineral samples” for the Combine.', cr(2)], ['The Merrow, Combine samples from Lacuna — and its last known drift position.', cr(3), boon], DC)),
    ]),
    page('hd-medrun', 'The Med Run', 'station', 'The station’s pharmacy is on the far side of a spore-choked ring. Someone has to run it.', [
      step(undefined, chk('Run the ring', 'dex', ['physical'], ['You make it, but you breathe too much of the air.', infected, give('hd_medgel')], ['You make it, mask sealed, arms full of medicine.', give('hd_traumakit'), give('hd_medgel')], DC)),
    ]),
    haven('hd-saltrest', 'Shift Change', 'station', 'Rhee sends Navy medics to relieve your crew for the weekend. You sleep twelve hours straight.', {
      shop: { items: SHOP_MID },
    }),
  ]),

  // ---------- The cure ----------
  ...week(6, 12, [
    page('hd-quarorder', 'The Quarantine Order', 'bridge', 'The Navy orders all ships to stay docked. But the antiviral ingredients are on a moon two hours away.', [
      step(
        'Choose one',
        act('A) Obey the order', 'You wait. Rhee sends the ingredients on a Navy shuttle — slowly.', virtue(1), heal(2)),
        chk('B) Talk your way out', 'cha', ['social'], ['The harbor guard refuses. You sneak out anyway and get fined.', cr(-4)], ['The harbor guard looks away. “Two hours,” she says.', cr(2)], DC),
      ),
    ]),
    dogfight('hd-blockaderun', 'Running the Quarantine', 'Combine boats are enforcing the quarantine their own way: by shooting at anything that moves.', {
      craft: ['hd_picket', 'hd_picket', 'hd_raider'],
      rounds: 3,
      intro: 'A Breaker raider has joined them — mercenaries for hire.',
      winText: 'You punch through and bring back the ingredients.',
      loseText: 'You make it through, hull scorched.',
      win: [cr(5)],
      lose: [dmg(2)],
    }),
    page('hd-antiviral', 'The Antiviral', 'station', 'With the ingredients aboard, it’s time to brew the antiviral.', [
      step(undefined, chk3('Brew the antiviral', 'int', ['medical'], 'The first batch fails.', ['A working batch — enough for the worst cases.', virtue(1), cured], ['Enough antiviral for the whole station, and some left for your crew.', virtue(2), cured, heal(3)], DC)),
    ]),
    fight('hd-swarm', 'Spore Swarm', 'cellar', 'A cloud of spores drifts out of the vents, thick as smoke and biting. Bloomed dockhands shamble behind it.', {
      enemies: ['hd_sporeswarm', 'hd_sporeswarm', 'hd_bloomed'],
      rounds: 3,
      intro: 'The cloud coalesces around you.',
      winText: 'You burn the cloud out of the vents.',
      loseText: 'You seal the vents with the cloud still behind them.',
      win: [cr(4)],
      lose: [dmg(2), infected],
    }),
    page('hd-volunteers', 'Volunteers', 'station', 'Word spreads that the Halcyon Debt is fighting the outbreak. Miners, dockhands and kids show up, asking how to help.', [
      step(undefined, chk('Organize the volunteers', 'cha', ['social'], 'Chaos. Well-meaning chaos.', ['By evening, three hundred people are running supplies, scrubbing vents and cooking.', virtue(2), cr(3)], DC)),
    ]),
    haven('hd-saltdock2', 'Saltlight Docks', 'station', 'Saltlight’s shipwrights refit the Halcyon Debt for free. “Least we can do.”', {
      dock: DOCK_MID,
      shop: { items: SHOP_MID },
      steps: [step(undefined, act('Accept their help', 'Fresh plating and a new filter system.', repair(2), parts(1)))],
    }),
  ]),

  // ---------- The Merrow ----------
  ...week(6, 19, [
    page('hd-hulk', 'The Drifting Hulk', 'space', 'At the Merrow’s last position, you find something that used to be a freighter. Now it’s a slowly turning mass of pale growth, kilometers long.', [
      step(undefined, chk3('Scan the hulk', 'wis', ['perception'], 'The scanners show nothing but static and growth.', ['A way in: an airlock still clear of growth.', bonus('roll', 1)], ['A way in, and the life-sign reading of something huge at its heart.', boon], DC)),
    ]),
    page('hd-sample', 'Taking a Sample', 'wreck', 'You need a sample of the growth itself to perfect the cure.', [
      step(undefined, chk('Cut a sample', 'con', ['medical', 'physical'], ['The growth bursts. Spores everywhere.', infected, dmg(1)], ['A clean sample, sealed in a canister.', cr(2), bonus('int', 1)], DC)),
    ]),
    fight('hd-hulkcrew', 'The Merrow’s Crew', 'wreck', 'The Merrow’s crew is still aboard — what’s left of them.', {
      enemies: ['hd_bloomed', 'hd_bloomed', 'hd_bloomed'],
      rounds: 3,
      intro: 'They move like sleepwalkers.',
      winText: 'You put them to rest. The captain’s log is still on her belt.',
      loseText: 'You retreat to the airlock, coughing.',
      win: [cr(4)],
      lose: [dmg(2), infected],
    }),
    page('hd-cureformula', 'The Cure Formula', 'bridge', 'The Merrow’s log names the Combine lab that ordered the Lacuna samples — and shows they knew about the spores.', [
      step(undefined, chk3('Study the log', 'int', ['lore', 'medical'], 'Most of it is spore-damaged.', ['Enough to finish the cure.', cured], ['The cure, and proof the Combine knew. Rhee will want this.', cured, boon, virtue(1)], DC)),
    ]),
    page('hd-brewcure', 'Brewing the Cure', 'station', 'Back at Saltlight, the full cure goes into production. People line up in the corridors, smiling for the first time in weeks.', [
      step(undefined, act('Hand out the cure', 'Every dose is a thank-you. Your crew is cured too.', cured, heal(4), virtue(1))),
    ]),
    dogfight('hd-sporecraft', 'Spore-Choked Craft', 'The Bloom has spread to two scavenger ships that came to strip the Merrow. Now they move like the dockhands did — and they’re coming toward Saltlight.', {
      craft: ['hd_raider', 'hd_raider'],
      rounds: 3,
      intro: 'Their hulls are furred white with growth.',
      winText: 'Both ships go dark. Saltlight is safe from them, at least.',
      loseText: 'You turn them, but the ship is hurt.',
      win: [cr(5), parts(1)],
      lose: [dmg(2)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- The Bloom ----------
  ...week(6, 26, [
    page('hd-bloomapproach', 'Approaching the Bloom', 'space', 'The Merrow is moving. The thing at its heart has started steering it — toward Saltlight.', [
      step(undefined, chk3('Match the hulk’s course', 'dex', ['piloting'], ['You scrape the growth, and spores coat the hull.', dmg(1), travel(1)], ['You dock with the hulk.', travel(1)], ['You dock right at the heart’s airlock.', travel(1), bonus('roll', 1)], DC)),
    ]),
    page('hd-bloomentry', 'Inside the Bloom', 'wreck', 'Inside, the corridors are soft and breathing. The walls pulse when you touch them.', [
      step(undefined, chk('Push through the growth', 'con', ['physical'], ['You breathe it in.', infected], 'Mask tight, you push through.', DC)),
    ]),
    fight('hd-bloomguards', 'The Bloom’s Guard', 'wreck', 'The Bloom defends its heart with everything it has grown.', {
      enemies: ['hd_sporeswarm', 'hd_sporeswarm', 'hd_bloomed'],
      rounds: 3,
      intro: 'The walls exhale.',
      winText: 'The guards wither. The heart is ahead.',
      loseText: 'You push past them, coughing.',
      win: [cr(4)],
      lose: [dmg(2), infected],
    }),
    page('hd-bloomheart', 'The Heart of the Bloom', 'wreck', 'The Merrow’s cargo bay has become a cathedral of pale flowers around a pulsing core.', [
      step(undefined, chk3('Find where to strike', 'wis', ['perception', 'medical'], 'It all looks equally alive.', ['The core feeds through three thick roots.', bonus('atk', 1)], ['The roots, and the moment it inhales.', bonus('atk', 1), bonus('dmg', 1)], DC)),
    ]),
    fight('hd-bloomfight', 'The Bloom', 'wreck', 'The Bloom wakes. The whole bay flexes toward you.', {
      enemies: ['hd_bloom', 'hd_sporeswarm'],
      rounds: 4,
      intro: 'Petals open like mouths.',
      winText: 'The Bloom shudders and dies. The Merrow goes still, and the spore counts on Saltlight begin to fall.',
      loseText: 'You plant charges and run. The Merrow burns behind you, and the Bloom with it.',
      win: [cr(12), give('hd_traumakit', 2)],
      lose: [cr(4), dmg(3)],
    }),
    haven('hd-saltclear', 'All Clear', 'station', 'Saltlight declares the outbreak over. The station throws a party in the salt caverns, and the whole station sings.', {
      shop: { items: SHOP_MID },
      dock: DOCK_MID,
      steps: [step(undefined, act('Join the party', 'Your crew is cured, rested, and very, very full.', cured, heal(3), virtue(1)))],
    }),
  ]),
]
