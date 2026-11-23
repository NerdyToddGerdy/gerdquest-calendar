// August — Free Port. The free spacers unite, the Needle Run, and Iolo Fane.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk, chk3, cr, dmg, dogfight, fight, give, haven, heal, page, parts, repair, step, travel, virtue, week } from '../lib'
import { DOCK_LATE, SHOP_LATE, SHOP_MID } from '../shops'

const DC = 14

export const AUG: Day[] = [
  // ---------- The Free Council ----------
  ...week(8, 7, [
    page('hd-council', 'The Free Council', 'station', 'Fenn calls a council of free captains in the yard’s biggest hangar. Two hundred captains, two hundred opinions.', [
      step(undefined, chk3('Address the council', 'cha', ['social'], 'They talk over you.', ['Some captains listen.', virtue(1)], ['The hangar goes quiet when you tell them about the Choir. Then it erupts.', virtue(2), boon], DC)),
    ]),
    page('hd-needleannounce', 'The Needle Run', 'space', 'Fenn wants to pick the fleet’s lead pilots the old way: a race through the Needle, a canyon of tumbling rock.', [
      step(undefined, chk('Practice in the canyon', 'wis', ['piloting'], ['You clip a rock in practice.', dmg(1)], ['You learn the Needle’s rhythm.', bonus('dex', 1)], DC)),
    ]),
    fight('hd-hounds', 'Hounds in the Yard', 'station', 'Combine troopers and a bounty hound slip into the yard posing as dockhands. They’re after you.', {
      enemies: ['hd_trooper', 'hd_hunter'],
      rounds: 3,
      intro: 'A dockhand drops his wrench and draws a pistol.',
      winText: 'They go down. The hound has a little book of names, with yours on top.',
      loseText: 'They escape into the crowd.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    page('hd-fanebook', 'Fane’s Little Book', 'bridge', 'The hound carried a page from a famous book: the hit list of Iolo Fane, the Shoal’s best bounty hunter. Every name on it was crossed out — except yours.', [
      step(undefined, chk3('Study Fane’s methods', 'int', ['lore'], 'Fane is a ghost.', ['Fane always strikes at a crowd’s busiest moment.', bonus('wis', 1)], ['Fane always strikes at the busiest moment — the Needle Run.', bonus('wis', 1), boon], DC)),
    ]),
    page('hd-yardwork', 'Yard Work', 'station', 'Every ship in the yard needs work before whatever is coming. You pitch in.', [
      step(undefined, chk('Haul plating', 'str', ['physical'], ['A plate slips and crushes your fingers.', dmg(2)], ['Fenn’s crew pays you in parts.', parts(2)], DC)),
    ]),
    haven('hd-freeportwk1', 'Fenn’s Hangar', 'station', 'Fenn himself — huge, bald and grinning — shows you the yard’s best stock.', {
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
    }),
  ]),

  // ---------- The race ----------
  ...week(8, 14, [
    page('hd-needleq', 'Needle Run Qualifiers', 'space', 'Thirty ships enter the qualifiers. Ten will race.', [
      step(undefined, chk3('Fly the qualifier', 'dex', ['piloting'], ['You crash out on the second turn.', dmg(2)], 'You qualify, ninth.', ['You qualify first. The crowd on the comm goes wild.', boon, cr(3)], DC)),
    ]),
    page('hd-sabotagerace', 'Sabotage!', 'cellar', 'The night before the race, Bix finds a cut fuel line in the drive room.', [
      step(undefined, chk3('Find the saboteur', 'wis', ['perception'], 'Whoever it was, they’re long gone.', ['A Combine thermal tag on the cut. Fane’s people.', virtue(1)], ['Fane’s people — and the bomb they planted on the race buoy.', virtue(1), boon], DC)),
    ]),
    dogfight('hd-needlerun', 'The Needle Run', 'The race is on. Two rival racers — hired by Fane — try to wreck you in the canyon.', {
      craft: ['hd_raider', 'hd_raider'],
      rounds: 3,
      intro: 'The canyon walls rush past.',
      winText: 'You finish first. The free fleet chooses you as one of its lead pilots.',
      loseText: 'You finish, battered, in the middle of the pack.',
      win: [cr(8)],
      lose: [dmg(2)],
    }),
    page('hd-trophy', 'The Trophy', 'station', 'The Needle Run trophy is a rock from the canyon, cut and polished. Fenn presents it, and the whole yard cheers.', [
      step(undefined, act('Accept the trophy', 'You hold it over your head. Juniper takes a hundred pictures.', cr(4), virtue(1), heal(2))),
    ]),
    fight('hd-troopers', 'Troopers at the Party', 'inn', 'The victory party is crashed by Combine troopers.', {
      enemies: ['hd_trooper', 'hd_trooper'],
      rounds: 3,
      intro: 'A table flips.',
      winText: 'The troopers are thrown out of the party — literally, through an airlock (onto a waiting ship).',
      loseText: 'The troopers flee when the whole party gangs up on them.',
      win: [cr(5)],
      lose: [dmg(3)],
    }),
    haven('hd-freeportwk2', 'Hangover', 'inn', 'The day after the party, nobody gets up before noon.', {
      shop: { items: SHOP_MID },
      steps: [step(undefined, act('Sleep it off', 'Juniper brings coffee and judgement.', heal(2)))],
    }),
  ]),

  // ---------- Iolo Fane ----------
  ...week(8, 21, [
    page('hd-fanecall', 'Fane Calls', 'bridge', 'A voice on the comm, soft and pleasant: “Captain. This is Iolo Fane. I’ve never missed a mark. I don’t intend to start.”', [
      step(undefined, chk('Talk to Fane', 'cha', ['social'], 'Fane hangs up. You don’t sleep well.', ['Fane lets slip that Thale is paying triple for you, alive.', bonus('roll', 1), cr(1)], DC)),
    ]),
    page('hd-trapfane', 'Laying a Trap', 'station', 'If Fane wants you, he can come to you — somewhere you choose.', [
      step(undefined, chk3('Rig the old ore dock', 'int', ['tech'], 'Your traps are crude.', ['The dock is wired for alarms.', bonus('def', 1)], ['Alarms, sealed doors and a little surprise in the crane.', bonus('def', 1), bonus('atk', 1)], DC)),
    ]),
    fight('hd-pack', 'Fane’s Pack', 'wreck', 'Fane sends his pack first, to wear you down.', {
      enemies: ['hd_hunter', 'hd_hunter', 'hd_trooper'],
      rounds: 3,
      intro: 'They come through the walls.',
      winText: 'The pack breaks.',
      loseText: 'The pack pulls back. They hurt you.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    page('hd-chasefane', 'The Chase', 'station', 'Fane appears on a catwalk above you, tips his hat, and runs.', [
      step(undefined, chk3('Chase him', 'dex', ['physical'], ['You lose him and fall off a catwalk.', dmg(2)], 'You corner him in the old ore hall.', ['You corner him where your traps are.', bonus('dmg', 1)], DC)),
    ]),
    fight('hd-fanefight', 'Iolo Fane, Bounty Hunter', 'wreck', 'Fane turns, smiling, his last hound at his side. “Professional courtesy,” he says, and draws.', {
      enemies: ['hd_fane', 'hd_hunter'],
      rounds: 4,
      intro: 'Two pistols, one flash.',
      winText: 'Fane falls, and his little book goes into the yard’s furnace.',
      loseText: 'Fane escapes, limping. For the first time, he has missed a mark.',
      win: [cr(14), give('hd_jetboots')],
      lose: [cr(5), dmg(3)],
    }),
    dogfight('hd-cutterhunt', 'The Cutter Hunt', 'Combine cutters prowl the edges of the free port, picking off ships one by one. You lead a hunting party.', {
      craft: ['hd_cutter', 'hd_cutter'],
      rounds: 3,
      intro: 'Two cutters, running dark.',
      winText: 'The cutters are driven off.',
      loseText: 'The cutters retreat, but the ship is battered.',
      win: [cr(6), parts(2)],
      lose: [dmg(3)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- The Deep Lane ----------
  ...week(8, 28, [
    page('hd-lanekey', 'The Lane Key', 'bridge', 'The data core has been quiet since Lacuna. Now it wakes, and shows a lane that could open from Fenn’s — straight into the Choir’s deep network.', [
      step(undefined, chk3('Study the key', 'int', ['lore', 'tech'], 'The math is beyond you.', ['The core can open the lane, once.', cr(2)], ['Once, and only with the free fleet’s ships singing together.', boon, cr(2)], DC)),
    ]),
    page('hd-councilvote', 'The Council Votes', 'station', 'The free council must decide: open the lane, or hide.', [
      step(undefined, chk('Make the case', 'cha', ['social'], 'The vote is close. It passes anyway.', ['The vote is unanimous. Fenn bangs his wrench on the table.', virtue(2)], DC)),
    ]),
    page('hd-provision', 'Provisioning', 'station', 'Nobody knows how long the trip through the lane will be. You pack for a long one.', [
      step(undefined, act('Stock the hold', 'Rations, water, medgel and spare parts — as much as the Halcyon Debt can carry.', give('ration', 3), give('hd_medgel'), parts(1))),
    ]),
    dogfight('hd-lanegate', 'Opening the Lane', 'As the free fleet sings the core’s chord, the lane opens — and Choir drones pour out of it, testing the newcomers.', {
      craft: ['hd_choirdrone', 'hd_choirdrone'],
      rounds: 3,
      intro: 'Song-stone shards, flying like thoughts.',
      winText: 'The drones withdraw, as if satisfied.',
      loseText: 'The drones withdraw. The ship rings like a bell.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    page('hd-throughlane', 'Through the Deep Lane', 'space', 'The Halcyon Debt leads the way into the lane. Outside, colors you don’t have names for.', [
      step(undefined, chk3('Fly the lane', 'wis', ['piloting'], ['The lane twists. Everyone throws up.', dmg(1), travel(1)], ['You come out the other side.', travel(1)], ['You come out the other side right on target.', travel(1), boon], DC)),
    ]),
    haven('hd-beyondlane', 'Beyond the Lane', 'depths', 'On the far side, a system of dark planets ringed with song-stone. The free fleet makes camp on a quiet moon.', {
      shop: { items: SHOP_MID },
      steps: [step(undefined, act('Make camp', 'You sleep under a sky that sings.', heal(3), repair(1)))],
    }),
  ]),
]
