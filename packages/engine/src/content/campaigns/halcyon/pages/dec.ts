// December — Final Notice. The Choir’s heart, the Final Notice, and Maren Thale.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk3, cr, cured, dmg, dogfight, fight, give, haven, heal, levelUp, page, parts, repair, step, travel, virtue, week } from '../lib'
import { DOCK_LATE, SHOP_LATE } from '../shops'

const DC = 15

export const DEC: Day[] = [
  // ---------- The long lane ----------
  ...week(12, 4, [
    page('hd-longlane', 'The Long Lane', 'space', 'The lane to Halcyon Point is the longest you’ve ever flown. Days blur together.', [
      step(undefined, chk3('Keep the fleet together', 'wis', ['piloting'], ['Ships straggle. You have to go back for them.', travel(2)], ['The fleet stays together.', travel(1)], ['The fleet flies like one ship.', travel(1), boon], DC)),
    ]),
    page('hd-pointapproach', 'Approaching the Point', 'space', 'Halcyon Point is a blue star wrapped in rings of song-stone. Hanging beside it is the Choir’s heart: a crystal the size of a moon.', [
      step(undefined, chk3('Scan the heart', 'int', ['tech', 'lore'], 'Your sensors can’t make sense of it.', ['The Combine fleet has surrounded it.', bonus('roll', 1)], ['The Combine fleet surrounds it, and the Final Notice is mining its edge.', bonus('roll', 1), boon], DC)),
    ]),
    dogfight('hd-pointpickets', 'The Outer Ring', 'Two cutters and a lancer guard the outer ring of the Combine’s cordon.', {
      craft: ['hd_cutter', 'hd_cutter', 'hd_lancer'],
      rounds: 3,
      intro: 'The fleet pushes in behind you.',
      winText: 'The outer ring breaks.',
      loseText: 'You push through the ring, hurting.',
      win: [cr(9)],
      lose: [dmg(3)],
    }),
    page('hd-heartsong', 'The Heart’s Song', 'depths', 'You land on the heart’s surface. It sings so loudly the ground shakes.', [
      step(undefined, chk3('Listen to the heart', 'wis', ['lore'], 'It’s too loud to understand.', ['It is in pain. The Combine’s mining is hurting it.', virtue(1)], ['In pain, and calling to the core.', virtue(1), boon], DC)),
    ]),
    fight('hd-honorguard', 'The Honor Guard', 'depths', 'Thale’s honor guard has dug in around the mining site.', {
      enemies: ['hd_honorguard', 'hd_honorguard'],
      rounds: 3,
      intro: 'Gold-trimmed armor flashes in the starlight.',
      winText: 'The honor guard falls. The mining stops, for now.',
      loseText: 'You fall back to your ship.',
      win: [cr(9)],
      lose: [dmg(3)],
    }),
    haven('hd-pointcamp', 'Camp on the Heart', 'depths', 'The fleet makes camp on the heart’s surface, in its shadow. The song is gentler here.', {
      shop: { items: SHOP_LATE },
    }),
  ]),

  // ---------- Juniper’s parcel ----------
  ...week(12, 11, [
    page('hd-parley', 'Parley', 'bridge', 'Thale asks to meet in person, on neutral ground: a bare rock between the two fleets.', [
      step(undefined, chk3('Meet Thale', 'cha', ['social'], 'Thale doesn’t move an inch.', ['Thale admits she’s afraid: of free lanes, of a Shoal she can’t count.', bonus('roll', 1)], ['Thale admits she’s afraid — and some of her captains hear her say it.', bonus('roll', 1), virtue(1), cr(5)], DC)),
    ]),
    page('hd-juniperparcel', 'Juniper’s Parcel', 'cellar', 'Juniper comes to you with a sealed parcel. “The one I never opened. From my very first run. The address was Halcyon Point.” Inside: a key of song-stone, matching the core.', [
      step(undefined, act('Open it together', 'The key hums in your hand. Juniper is crying and laughing at once.', virtue(1), boon)),
    ]),
    fight('hd-guards2', 'The Mining Camp', 'depths', 'The Combine restarts the mining under heavy guard.', {
      enemies: ['hd_honorguard', 'hd_siegetrooper', 'hd_elite'],
      rounds: 3,
      intro: 'Drills scream into the heart.',
      winText: 'The drills fall silent again.',
      loseText: 'You damage the drills before falling back.',
      win: [cr(9)],
      lose: [dmg(3)],
    }),
    page('hd-heartkey', 'The Heart’s Key', 'depths', 'The key and the core together could wake the heart. But you need to reach its center.', [
      step(undefined, chk3('Map the way to the center', 'int', ['tech'], 'The heart’s insides keep shifting.', ['A path to the center, guarded by the Final Notice.', bonus('roll', 1)], ['A path, and a blind spot in the Final Notice’s guns.', bonus('roll', 1), boon], DC)),
    ]),
    page('hd-eveofbattle', 'Eve of Battle', 'inn', 'The night before the battle, the whole fleet gathers in the heart’s shadow. Juniper hands out the last of the good coffee.', [
      step(undefined, act('Drink with the fleet', 'Toasts, songs and promises.', heal(4), virtue(1), cured)),
    ]),
    dogfight('hd-screen', 'The Screen', 'Two lancers and a cutter screen the Final Notice. To reach it, you have to get through them.', {
      craft: ['hd_lancer', 'hd_lancer', 'hd_cutter'],
      rounds: 3,
      intro: 'The battle for Halcyon Point begins.',
      winText: 'The screen breaks.',
      loseText: 'You punch through the screen, badly hurt.',
      win: [cr(10), parts(2)],
      lose: [dmg(3)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- Final Notice ----------
  ...week(12, 18, [
    page('hd-finalplan', 'The Final Plan', 'bridge', 'The plan is simple: the fleet holds the Combine, Rhee draws the Final Notice’s fire, and the Halcyon Debt flies to the heart.', [
      step(undefined, chk3('Check every detail', 'wis', ['perception'], 'Something will go wrong. It always does.', ['Every ship knows its job.', bonus('roll', 1)], ['Every ship knows its job — and a backup job.', bonus('roll', 1), boon], DC)),
    ]),
    dogfight('hd-fleetbattle', 'The Fleet Engages', 'The two fleets collide around the heart. Everywhere you look, ships are fighting.', {
      craft: ['hd_lancer', 'hd_cutter', 'hd_cutter'],
      rounds: 3,
      intro: 'Free ships and Combine ships, in a storm of fire.',
      winText: 'Your corner of the battle is won.',
      loseText: 'You fight your way clear.',
      win: [cr(10)],
      lose: [dmg(3)],
    }),
    page('hd-underguns', 'Under the Guns', 'space', 'The Final Notice looms ahead, its hull engraved with every debt it has collected.', [
      step(undefined, chk3('Fly under its guns', 'dex', ['piloting'], ['Its guns rake the hull.', dmg(3)], ['You get in close.', bonus('roll', 1)], ['You get in close, into the blind spot.', bonus('roll', 1), boon], DC)),
    ]),
    dogfight('hd-finalnotice', 'The Final Notice', 'The Final Notice turns its full broadside on the Halcyon Debt, a lancer at its side.', {
      craft: ['hd_finalnotice', 'hd_lancer'],
      rounds: 5,
      intro: '“Halcyon Debt,” says Thale. “Your account is closed.”',
      winText: 'The Final Notice’s guns fall silent. You dock with its bridge.',
      loseText: 'The Final Notice is crippled, and so are you. You dock with its bridge anyway.',
      win: [cr(12)],
      lose: [dmg(4)],
    }),
    fight('hd-thalefight', 'Auditor-General Maren Thale', 'bridge', 'Thale stands on her bridge, with her last honor guard. “Every debt must be paid,” she says. “Even this one.”', {
      enemies: ['hd_thale', 'hd_honorguard'],
      rounds: 5,
      intro: 'She draws a blade engraved with ledger lines.',
      winText: 'Thale yields. Around the heart, the Combine fleet stands down. In her cabin you find a pair of captain’s bars, never worn.',
      loseText: 'Thale escapes in a lifeboat. Without her, the Combine fleet surrenders anyway.',
      win: [cr(20), give('hd_captainsbars')],
      lose: [cr(8), dmg(3)],
    }),
    haven('hd-heartwakes', 'The Heart Wakes', 'depths', 'With the key and the core together, the Choir’s heart wakes. It sings to you, and asks a question: who should these lanes belong to?', {
      note: 'Choose what the Choir becomes. Then rest, and try the weekly lottery.',
      steps: [
        step(
          'Choose one',
          act('A) Open every lane to everyone', 'The heart sings, and across the Shoal a thousand new lanes open, free for anyone to fly.', virtue(3), heal(5)),
          act('B) Give the heart to Rhee’s Navy to guard', 'Rhee accepts the heart’s keeping. The lanes open slowly, carefully, under Navy watch.', virtue(1), cr(15)),
          act('C) Give the free fleet the key', 'The free fleet will decide which lanes to open. Fenn bangs his wrench on the table.', virtue(2), cr(8)),
        ),
      ],
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
    }),
  ]),

  // ---------- The year’s end ----------
  ...week(12, 25, [
    page('hd-newlanes', 'New Lanes', 'space', 'The first new lanes shimmer across the sky. Ships are already flying them — ships that couldn’t pay a toll in their lives.', [
      step(undefined, act('Watch them go', 'Juniper names every ship as it passes.', heal(3), virtue(1))),
    ]),
    page('hd-debtsettled', 'The Debt', 'bridge', 'Thale’s ledgers are open. The Halcyon Debt’s account is there, with forty years of interest.', [
      step(undefined, chk3('Settle the account', 'cha', ['social'], 'It takes a lot of paperwork.', ['The account is closed — paid in full.', cr(5)], ['Closed, and every debt in the Free Port with it.', cr(5), virtue(2)], DC)),
    ]),
    page('hd-farewells', 'Farewells', 'station', 'Rhee heads home to face a court-martial she’ll probably win. Fenn heads back to his yard. Nadia and Tobiah want to fly the new lanes.', [
      step(undefined, act('Say goodbye', 'Everyone promises to visit. Most of them mean it.', virtue(1), heal(2))),
    ]),
    dogfight('hd-lastrun', 'One Last Run', 'A pair of Combine cutters didn’t get the news. They try to grab a freighter flying a new lane.', {
      craft: ['hd_cutter', 'hd_cutter'],
      rounds: 3,
      intro: 'Old habits die hard.',
      winText: 'The cutters surrender. Their crews ask to join the free fleet.',
      loseText: 'The cutters flee. The freighter is safe.',
      win: [cr(10), parts(2)],
      lose: [dmg(2)],
    }),
    page('hd-yearsend', 'The Year’s End', 'bridge', 'You take the Halcyon Debt out alone, just to fly. The stars are the same, but everything else has changed.', [
      step(undefined, act('Fly', 'The ship hums under your hands — it sounds like the Choir.', heal(5), repair(3))),
    ]),
    haven('hd-epilogue', 'Paid in Full', 'inn', 'The whole crew squeezes into the galley. Juniper raises a mug. “To the Halcyon Debt,” she says. “Which is now just the Halcyon.” Everyone laughs, and someone fixes the nameplate.', {
      note: 'Rest, level up, and try the weekly lottery. This is the end of the year.',
      steps: [step('Level up', act('Raise a mug', 'A year of debts, all of them paid. You’re ready for whatever comes next.', levelUp))],
      shop: { items: SHOP_LATE },
    }),
  ]),
]
