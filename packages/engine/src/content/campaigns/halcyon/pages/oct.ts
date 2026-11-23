// October — The Mole. Someone is feeding the Combine your course: Harbormaster Quell.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk, chk3, cr, dmg, dogfight, fight, give, haven, heal, page, parts, repair, step, travel, virtue, week } from '../lib'
import { DOCK_LATE, SHOP_LATE, STIMS } from '../shops'

const DC = 14

export const OCT: Day[] = [
  // ---------- Coming home ----------
  ...week(10, 2, [
    page('hd-homeward', 'Homeward Lane', 'space', 'The free fleet flies home through the deep lane, ship after ship.', [
      step(undefined, chk('Lead the convoy', 'wis', ['piloting'], ['Two ships get lost and have to be fetched.', travel(2)], ['Every ship makes it through on your course.', travel(1), virtue(1)], DC)),
    ]),
    dogfight('hd-exitambush', 'Waiting at the Exit', 'A Combine lancer and two pickets are waiting at the lane’s exit — right where you would come out.', {
      craft: ['hd_lancer', 'hd_picket', 'hd_picket'],
      rounds: 3,
      intro: 'They knew exactly where to wait.',
      winText: 'You break the ambush. But how did they know?',
      loseText: 'You fight through. The fleet is shaken.',
      win: [cr(7)],
      lose: [dmg(3)],
    }),
    page('hd-leak', 'A Leak', 'bridge', 'Bix checks the ship’s logs. Someone has been sending your course to a Combine relay, every week, since January.', [
      step(undefined, chk3('Trace the leak', 'int', ['tech'], 'The transmissions are well hidden.', ['They come from Fenn’s Shipyard itself.', bonus('int', 1)], ['From Fenn’s — on the harbor channel.', bonus('int', 1), boon], DC)),
    ]),
    fight('hd-yardraid', 'Raid on the Yard', 'station', 'While the fleet was away, Combine elites raided Fenn’s. Two are still here, looting the records office.', {
      enemies: ['hd_elite', 'hd_elite'],
      rounds: 3,
      intro: 'Mirrored visors turn toward you.',
      winText: 'The elites go down. They were after the free fleet’s ship registry.',
      loseText: 'They escape with half the registry.',
      win: [cr(7)],
      lose: [dmg(3)],
    }),
    page('hd-suspects', 'Suspects', 'station', 'Fenn, Bix, Juniper, Nadia, Tobiah — everyone had access to the harbor channel. Nobody looks at anyone else.', [
      step(undefined, chk3('Think it through', 'wis', ['perception'], 'Everyone looks guilty.', ['It isn’t your crew. The leak uses an old harbormaster code.', virtue(1)], ['An old harbormaster code — Tollgate Ring’s.', virtue(1), boon], DC)),
    ]),
    haven('hd-fennoct', 'Fenn’s, Shaken', 'station', 'The yard is quieter than before. People keep their voices down, and lock their doors.', {
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
    }),
  ]),

  // ---------- Bait ----------
  ...week(10, 9, [
    page('hd-juniperdoubt', 'Juniper’s Doubt', 'inn', 'Juniper corners you in the galley. “Someone in the yard thinks it’s me. Because I’m from Tollgate.”', [
      step(undefined, chk('Reassure Juniper', 'cha', ['social'], 'She doesn’t believe you believe her.', ['“I know it isn’t you,” you say. She cries, then laughs, then makes tea.', virtue(1), heal(2)], DC)),
    ]),
    page('hd-falseorders', 'False Orders', 'bridge', 'If someone is listening on the harbor channel, maybe they’ll listen to a lie.', [
      step(undefined, chk3('Plant a false course', 'int', ['tech'], 'The lie is too obvious.', ['You plant a false course to an empty system.', bonus('roll', 1)], ['A false course, and a hidden camera on the harbor relay.', bonus('roll', 1), boon], DC)),
    ]),
    dogfight('hd-bait', 'The Bait', 'You fly the false course. A lancer and a cutter are waiting there. The leak is real — and it’s on the harbor channel.', {
      craft: ['hd_lancer', 'hd_cutter'],
      rounds: 3,
      intro: 'Exactly where you said you’d be.',
      winText: 'You beat the trap and take their logs.',
      loseText: 'You escape the trap.',
      win: [cr(7), parts(1)],
      lose: [dmg(3)],
    }),
    page('hd-quellseen', 'The Harbormaster', 'station', 'The hidden camera on the harbor relay catches a face: Quell, the Tollgate harbormaster who “resigned” in January.', [
      step(undefined, chk('Find Quell in the yard', 'wis', ['perception'], 'He’s gone before you get there.', ['You spot him boarding a courier ship under a false name.', bonus('atk', 1)], DC)),
    ]),
    fight('hd-quellguards', 'Quell’s Guards', 'station', 'Quell’s bodyguards hold the courier’s airlock while he gets away.', {
      enemies: ['hd_elite', 'hd_trooper'],
      rounds: 3,
      intro: 'They fight like professionals, because they are.',
      winText: 'You break through, too late. Quell’s ship is gone.',
      loseText: 'The guards hold you off.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    haven('hd-quellgone', 'Picking Up the Pieces', 'station', 'The yard apologizes to Juniper, one person at a time.', {
      shop: { items: STIMS },
      steps: [step(undefined, act('Watch the apologies', 'Juniper accepts every single one, with tea.', virtue(1), heal(2)))],
    }),
  ]),

  // ---------- Boarders ----------
  ...week(10, 16, [
    page('hd-trialtrust', 'A Trial of Trust', 'station', 'The free council meets. Some captains say the Halcyon Debt draws too much trouble.', [
      step(undefined, chk3('Defend your crew', 'cha', ['social'], 'The council is split.', ['The council votes to keep you.', virtue(1)], ['The council votes to make you their admiral. You decline. They do it anyway.', virtue(2), boon], DC)),
    ]),
    page('hd-evidence', 'Evidence', 'bridge', 'Quell’s courier left a trail of Combine payments. Follow the money, and you find the man.', [
      step(undefined, chk3('Follow the money', 'int', ['lore'], 'Shell company after shell company.', ['Quell banks at a private Combine vault on a rogue asteroid.', cr(2)], ['The vault, its access codes and its guard roster.', cr(2), boon], DC)),
    ]),
    fight('hd-boarders', 'Boarders!', 'wreck', 'In the middle of the night, a Combine boarding pod punches through the hull. Two elites come through the breach.', {
      enemies: ['hd_elite', 'hd_elite'],
      rounds: 3,
      intro: 'Alarms. Smoke. Mirrored visors.',
      winText: 'The boarders are thrown back into their pod.',
      loseText: 'The boarders flee, but they’ve wrecked the hold.',
      win: [cr(7)],
      lose: [dmg(3)],
    }),
    page('hd-damagectl', 'Damage Control', 'cellar', 'The breach is venting air. Someone has to seal it.', [
      step(undefined, chk('Seal the breach', 'con', ['physical'], ['You seal it, but the cold bites deep.', dmg(2), repair(1)], ['You seal it fast and clean.', repair(2)], DC)),
    ]),
    page('hd-quellruns', 'Quell Runs', 'space', 'Quell’s courier is spotted making for his rogue asteroid.', [
      step(undefined, chk3('Give chase', 'dex', ['piloting'], ['You lose him in the debris.', travel(1)], ['You stay on his tail.', travel(1)], ['You get ahead of him.', travel(1), boon], DC)),
    ]),
    dogfight('hd-quellchase', 'The Lancers', 'Quell calls for help. Two lancers answer.', {
      craft: ['hd_lancer', 'hd_lancer'],
      rounds: 3,
      intro: 'Two huge guns swing your way.',
      winText: 'The lancers break, and Quell is alone.',
      loseText: 'The lancers pull back to guard Quell’s asteroid.',
      win: [cr(8), parts(2)],
      lose: [dmg(3)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- The Mole ----------
  ...week(10, 23, [
    page('hd-quellhideaway', 'Quell’s Hideaway', 'station', 'Quell’s asteroid is a fortress of a bank: a single vault door, two meters thick.', [
      step(undefined, chk3('Scout the fortress', 'wis', ['perception'], 'No way in except the front door.', ['A service hatch on the dark side.', bonus('roll', 1)], ['A service hatch, and the guard change schedule.', bonus('roll', 1), boon], DC)),
    ]),
    page('hd-quellbank', 'The Private Bank', 'cellar', 'Inside is a private Combine bank: deposits from every corrupt harbormaster in the Shoal.', [
      step(undefined, chk3('Hack the vault systems', 'int', ['tech'], 'The vault locks down.', ['You open the inner doors.', cr(4)], ['You open the inner doors and transfer the deposits to the free fleet’s account.', cr(10), virtue(1)], DC)),
    ]),
    fight('hd-quellvault', 'Vault Defenders', 'cellar', 'The vault’s defenses wake: an elite guard, a trooper and an old vault warden unit.', {
      enemies: ['hd_elite', 'hd_trooper', 'hd_vaultbot'],
      rounds: 3,
      intro: '“Unauthorized withdrawal detected.”',
      winText: 'The defenders fall. Quell is cornered.',
      loseText: 'You fight through to Quell’s office.',
      win: [cr(7)],
      lose: [dmg(3)],
    }),
    page('hd-quellconfront', 'Confrontation', 'cellar', 'Quell waits in his office, a pistol on the desk. “I sold your course every week,” he says. “Thale pays better than anyone.”', [
      step(undefined, chk3('Make him talk', 'cha', ['social'], 'He sneers and picks up the pistol.', ['He admits Thale is bringing the whole Combine fleet to Fenn’s.', bonus('atk', 1)], ['The whole fleet, when, and how many ships.', bonus('atk', 1), boon], DC)),
    ]),
    fight('hd-quellfight', 'Harbormaster Quell', 'cellar', 'Quell stands, with his last elite guard. “Nothing personal,” he says. “Strictly business.”', {
      enemies: ['hd_quell', 'hd_elite'],
      rounds: 4,
      intro: 'The pistol comes up.',
      winText: 'Quell surrenders. The free council will deal with him.',
      loseText: 'Quell escapes in his courier — straight into Rhee’s arms.',
      win: [cr(15), give('hd_aegispatch', 2)],
      lose: [cr(5), dmg(3)],
    }),
    haven('hd-moleout', 'The Mole, Caught', 'station', 'Fenn’s celebrates. Juniper gets a standing ovation.', {
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
    }),
  ]),

  // ---------- Thale moves ----------
  ...week(10, 30, [
    page('hd-thalemoves', 'Thale Moves', 'bridge', 'Long-range sensors light up: the Combine fleet is assembling at Glasshouse. Hundreds of ships. And at their center, the Final Notice.', [
      step(undefined, chk3('Count the fleet', 'int', ['tech'], 'Too many to count.', ['About three hundred ships.', bonus('roll', 1)], ['Three hundred ships, and their supply lines.', bonus('roll', 1), boon], DC)),
    ]),
    page('hd-calltoarms', 'Call to Arms', 'station', 'You stand in the yard’s biggest hangar and ask every free captain in the Shoal to fight.', [
      step(undefined, chk3('Call them to arms', 'cha', ['social'], 'Some captains leave quietly.', ['Most captains stay.', virtue(1)], ['Every captain stays. The cheer shakes the hangar.', virtue(2), boon], DC)),
    ]),
    page('hd-fortify', 'Fortify the Yard', 'station', 'The yard becomes a fortress. Everyone hauls plating, guns and sandbags.', [
      step(undefined, chk('Fortify', 'str', ['physical'], ['Back-breaking work.', dmg(2)], ['The yard’s defenses rise, and Bix pays you in spare parts.', parts(2)], DC)),
    ]),
    dogfight('hd-vanguard', 'The Vanguard', 'The Combine’s vanguard arrives early: a lancer and two cutters, testing the yard’s defenses.', {
      craft: ['hd_lancer', 'hd_cutter', 'hd_cutter'],
      rounds: 3,
      intro: 'The first shots of the siege.',
      winText: 'The vanguard is driven off. First blood to the free fleet.',
      loseText: 'The vanguard withdraws after damaging the yard’s gate.',
      win: [cr(8)],
      lose: [dmg(3)],
    }),
    page('hd-rheechoice', 'Rhee’s Choice', 'bridge', 'Rhee calls. “The Navy has ordered me to stay out of it. I have a choice to make.”', [
      step(undefined, chk('Ask her to stand with you', 'cha', ['social'], 'Rhee hangs up without answering.', ['Rhee is quiet for a long time. Then: “See you at the yard, Captain.”', virtue(1), boon], DC)),
    ]),
    haven('hd-siegeeve', 'The Night Before', 'inn', 'Nobody sleeps. Juniper cooks for everyone. Someone plays music, badly, all night.', {
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
      steps: [step(undefined, act('Spend the night with the crew', 'Stories, songs and the last of the good coffee.', heal(3), virtue(1)))],
    }),
  ]),
]
