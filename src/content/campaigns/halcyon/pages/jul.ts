// July — Vell Unbound. Vell escapes with Combine money and takes Juniper.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk, chk3, cr, dmg, dogfight, fight, give, haven, heal, levelUp, page, parts, repair, step, travel, virtue, week } from '../lib'
import { DOCK_LATE, SHOP_MID, STIMS } from '../shops'

const DC = 13

export const JUL: Day[] = [
  // ---------- Breakout ----------
  ...week(7, 3, [
    page('hd-breakout', 'Breakout', 'bridge', 'The news hits every channel at once: Oriel Vell has walked out of the Navy prison hulk Constance. Three guards are “on extended leave.” Nobody says the word bribe.', [
      step(undefined, chk3('Dig into the breakout', 'int', ['lore', 'tech'], 'Just the official story.', ['The guards were paid from a Glasshouse account.', cr(2)], ['Glasshouse money — and Vell’s first stop: a fuel depot in the Reach.', boon, cr(2)], DC)),
    ]),
    page('hd-rheefury', 'Rhee’s Fury', 'bridge', 'Rhee’s face on the comm is very still. “He was my prisoner. Help me get him back.”', [
      step(undefined, chk('Talk strategy with Rhee', 'cha', ['social'], 'Rhee is too angry to plan. She’ll send what she can.', ['Rhee shares Navy intelligence on the Reach, and a stack of supply chits.', cr(4), virtue(1)], DC)),
    ]),
    page('hd-trail', 'The Trail', 'station', 'At the fuel depot, the clerk remembers a polite man with a pearl-handled pistol and a very large tip.', [
      step(undefined, chk3('Find where Vell went', 'wis', ['perception'], 'The trail goes cold.', ['He bought fuel for a long run into the Reach.', bonus('roll', 1)], ['The Reach, and the name of his new ship: the Courtesy.', bonus('roll', 1), cr(2)], DC)),
    ]),
    fight('hd-loyalists', 'Vell’s Loyalists', 'station', 'Vell left a few friends behind to slow down anyone following.', {
      enemies: ['hd_velllt', 'hd_combineagent'],
      rounds: 3,
      intro: '“The Captain sends his regards.”',
      winText: 'The loyalists go down. One has a Reach star-chart.',
      loseText: 'They escape, but you got a good look at their ship.',
      win: [cr(5)],
      lose: [dmg(3)],
    }),
    page('hd-reach', 'Into the Reach', 'space', 'The Reach is the empty edge of the Shoal, where stars are far apart and help is farther.', [
      step(undefined, chk('Plot the long jumps', 'dex', ['piloting'], ['A misjump costs you days.', travel(2)], ['Clean jumps.', travel(1), cr(1)], DC)),
    ]),
    haven('hd-reachpost', 'Last Light Outpost', 'inn', 'The last lit station before the Reach goes dark: a bar, a fuel pump and a sign that reads “Last Chance For Anything.”', {
      shop: { items: SHOP_MID },
      icons: [{ kind: 'pickpocket', x: 55, y: 66 }],
    }),
  ]),

  // ---------- Juniper ----------
  ...week(7, 10, [
    page('hd-politemsg', 'A Polite Message', 'bridge', 'A message from Vell, warm as tea: “I owe you a debt, Captain. I always pay my debts. Expect my visit.”', [
      step(undefined, chk('Reply', 'cha', ['social'], 'He doesn’t answer.', ['He answers, and lets slip that he’s working for someone. He doesn’t like them.', bonus('wis', 1), cr(1)], DC)),
    ]),
    dogfight('hd-redwings', 'Red Wings', 'Two new fighters, painted the color of old blood, drop out of the dark.', {
      craft: ['hd_vellwing', 'hd_vellwing'],
      rounds: 3,
      intro: 'They don’t say a word.',
      winText: 'The fighters break off — too easily.',
      loseText: 'They break off with the ship smoking.',
      win: [cr(5)],
      lose: [dmg(2)],
    }),
    page('hd-junipertaken', 'Juniper Taken', 'cellar', 'The fighters were a distraction. While you were fighting, a boarding pod hit the hold. Juniper is gone.', [
      step(undefined, chk3('Search the hold', 'dex', ['stealth', 'perception'], ['You find the pod’s cutting tools — and burn yourself on them.', dmg(1)], 'You find a tracking chip Juniper hid under the pod’s seat.', ['The tracking chip, and a message scratched into the deck: “COURTESY. DEEP DOCK.”', boon], DC)),
    ]),
    page('hd-ransom', 'Vell’s Ransom', 'bridge', 'Vell’s price for Juniper: the data core.', [
      step(
        'Choose one',
        act('A) Send a fake core and a down payment', 'Vell accepts the credits and doesn’t believe the core for a second.', cr(-6), virtue(1)),
        chk('B) Bluff', 'cha', ['social'], 'Vell laughs and cuts the channel.', ['Vell agrees to “keep her comfortable” while he thinks.', bonus('roll', 1)], DC),
      ),
    ]),
    fight('hd-vellambush', 'Ambush in the Dark', 'wreck', 'Following the tracking chip, you board a dead relay station. Two of Vell’s lieutenants are waiting.', {
      enemies: ['hd_velllt', 'hd_velllt'],
      rounds: 3,
      intro: '“The Captain said you’d come.”',
      winText: 'They yield, and admit Vell has a hidden dock deeper in the Reach.',
      loseText: 'They retreat, laughing.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    haven('hd-levelfive', 'Regroup', 'station', 'You regroup at a Navy listening post. The crew is quiet without Juniper’s jokes, but everyone works harder, and it shows.', {
      note: 'Rest, level up, and try the weekly lottery.',
      steps: [step('Level up', act('Train for the rescue', 'Drills until midnight, every night.', levelUp))],
      shop: { items: STIMS },
      dock: DOCK_LATE,
    }),
  ]),

  // ---------- Old Bix ----------
  ...week(7, 17, [
    page('hd-tracking', 'Tracking the Courtesy', 'bridge', 'Juniper’s chip pings once an hour. Each ping gets a little closer to somewhere.', [
      step(undefined, chk3('Triangulate the chip', 'int', ['tech'], 'The pings are too faint.', ['A region of the Reach called the Teeth.', travel(1)], ['The Teeth, and a dock hidden inside a burnt-out star.', travel(1), boon], DC)),
    ]),
    page('hd-oldbix', 'Old Bix', 'station', 'At a scrap station in the Teeth, an old engineer called Bix knows every hidden dock in the Reach. Bix wants to see the Halcyon Debt first.', [
      step(undefined, chk('Show Bix the ship', 'cha', ['social'], 'Bix tuts at the welding and says nothing useful.', ['Bix pats the hull lovingly. “I helped build her. I’ll help you keep her.” Bix will sign on at the dock.', virtue(1), repair(1)], DC)),
    ]),
    fight('hd-vellyard', 'The Scrapyard Fight', 'wreck', 'Vell’s crew finds you in the scrapyard.', {
      enemies: ['hd_velllt', 'hd_combineagent', 'hd_scrapper'],
      rounds: 3,
      intro: 'Sparks fly from the crane overhead.',
      winText: 'You win, and Bix whoops from the crane.',
      loseText: 'You escape into the scrap maze.',
      win: [cr(5)],
      lose: [dmg(3)],
    }),
    page('hd-hideout', 'Vell’s Hideout', 'space', 'The burnt-out star is a cinder the size of a moon. Inside its crust: Vell’s deep dock, and the Courtesy.', [
      step(undefined, chk3('Scout the dock', 'wis', ['perception'], 'Too many guards to count.', ['Guard rotations and the brig level.', bonus('roll', 1)], ['Rotations, the brig, and a fuel line you can cut.', bonus('roll', 1), boon], DC)),
    ]),
    page('hd-planb', 'Plan B', 'bridge', 'Bix has a crate of “insurance” — plasma charges from his mining days.', [
      step(undefined, act('Take the insurance', 'Bix hands them over with a wink.', give('hd_plasmacharge', 2))),
    ]),
    dogfight('hd-redwing', 'The Red Wing', 'Vell knows you’ve found the hideout. His wing comes out to meet you.', {
      craft: ['hd_vellwing', 'hd_vellwing', 'hd_interceptor'],
      rounds: 3,
      intro: 'Red fighters spill out of the cinder.',
      winText: 'The wing scatters. The dock is open.',
      loseText: 'The wing pulls back to guard the dock. You’ll go in anyway.',
      win: [cr(6), parts(1)],
      lose: [dmg(3)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- The Courtesy ----------
  ...week(7, 24, [
    page('hd-infiltrate', 'Infiltration', 'wreck', 'You go into the deep dock through a ventilation shaft that hasn’t been cleaned since the star burned out.', [
      step(undefined, chk3('Crawl through the vents', 'dex', ['stealth'], ['You fall through a vent grate into a guard room.', dmg(2)], 'You make it to the brig level.', ['You make it to the brig and loop the cameras.', bonus('roll', 1)], DC)),
    ]),
    page('hd-freejuniper', 'Free Juniper', 'cellar', 'Juniper is in the brig, bored and furious. “Took you long enough.”', [
      step(undefined, chk3('Break the cell door', 'str', ['physical'], ['The door holds. You get it with tools, slowly, while the alarms start.', dmg(1)], 'The door gives. Juniper hugs you, then punches your arm.', ['The door flies off its hinges. Juniper whistles.', heal(2), boon], DC)),
    ]),
    dogfight('hd-courtesy', 'The Courtesy', 'Vell’s new flagship — the old Undertow, rebuilt and renamed — powers up in the dock, a fighter on its wing.', {
      craft: ['hd_gunship', 'hd_vellwing'],
      rounds: 4,
      intro: '“Captain,” Vell says warmly. “Shall we settle up?”',
      winText: 'The Courtesy’s engines die, and you board it.',
      loseText: 'The Courtesy is crippled, but so are you. You board anyway.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    page('hd-vellbridge', 'The Bridge Again', 'bridge', 'Vell waits on his new bridge, exactly as he did in January. He even has the same pistol.', [
      step(undefined, chk3('Read the room', 'wis', ['perception'], 'He’s ready for you.', ['He’s hurt, and hiding it.', bonus('atk', 1)], ['He’s hurt, and his lieutenant doesn’t want to fight.', bonus('atk', 1), bonus('dmg', 1)], DC)),
    ]),
    fight('hd-vell2fight', 'Oriel Vell, Unbowed', 'bridge', 'Vell draws. “No hard feelings, Captain. It’s just business. Someone else’s business, unfortunately.”', {
      enemies: ['hd_vell2', 'hd_velllt'],
      rounds: 4,
      intro: 'The pearl-handled pistol rises.',
      winText: 'Vell yields, finally. “The Combine owns my debt,” he says quietly. “Like they own yours.”',
      loseText: 'Vell escapes in a lifeboat — but leaves his Combine contract behind.',
      win: [cr(14), give('hd_gauntlets')],
      lose: [cr(5), dmg(3)],
    }),
    haven('hd-vellcaught', 'Home Again', 'inn', 'Juniper takes over the galley and cooks every meal she missed. The crew eats until they can’t move.', {
      shop: { items: SHOP_MID },
      dock: DOCK_LATE,
      steps: [step(undefined, act('Welcome Juniper home', 'She’s already reorganized the hold.', heal(3), virtue(1)))],
    }),
  ]),

  // ---------- What Vell knows ----------
  ...week(7, 31, [
    page('hd-velltalks', 'Vell Talks', 'cellar', 'Vell, in your brig, is surprisingly chatty. “Auditor-General Maren Thale,” he says. “She buys debts. Ships, stations, people. She bought mine. She wants the Choir buried so nobody can ever fly free of her.”', [
      step(undefined, chk3('Question Vell', 'cha', ['social'], 'He tells you nothing you can check.', ['He names Thale’s flagship: the Final Notice.', cr(2)], ['The Final Notice, and Thale’s plan to seize Fenn’s Shipyard.', boon, cr(2)], DC)),
    ]),
    page('hd-handover', 'Handing Vell Over', 'bridge', 'Rhee wants Vell back. The free spacers at Fenn’s want him tried by them.', [
      step(
        'Choose one',
        act('A) Give him to Rhee', 'Rhee takes him with a nod. “I owe you one, Captain.”', virtue(1), give('hd_luckcoin')),
        act('B) Give him to Fenn’s', 'The free yard pays a bounty, and Vell bows to his new jailers.', cr(8)),
      ),
    ]),
    page('hd-fenncall', 'A Call From Fenn’s', 'bridge', 'Fenn’s Shipyard sends out an open call: every free ship in the Shoal, meet at the yard. Something’s coming.', [
      step(undefined, act('Answer the call', 'You plot a course for Fenn’s.', travel(1))),
    ]),
    dogfight('hd-cutters', 'Combine Cutters', 'On the way to Fenn’s, two Combine repossession cutters try to grapple you.', {
      craft: ['hd_cutter', 'hd_cutter'],
      rounds: 3,
      intro: 'Grapple arms unfold.',
      winText: 'The cutters break off, arms mangled.',
      loseText: 'You tear free of the grapples, leaving plating behind.',
      win: [cr(6), parts(1)],
      lose: [dmg(3)],
    }),
    page('hd-freeportarrive', 'Free Port', 'station', 'Fenn’s Shipyard has become a city. Hundreds of free ships crowd around the asteroid, and the docks are full of noise.', [
      step(undefined, chk('Find a berth', 'cha', ['social'], ['Every berth is taken. You pay a premium.', cr(-3)], 'A berth opens up for the crew who robbed Glasshouse.', DC)),
    ]),
    haven('hd-freeportrest', 'The Yard at Night', 'station', 'The free port glows like a festival. Somebody has strung lights between ships.', {
      shop: { items: SHOP_MID },
      dock: DOCK_LATE,
      icons: [{ kind: 'loot', x: 84, y: 30 }],
    }),
  ]),
]
