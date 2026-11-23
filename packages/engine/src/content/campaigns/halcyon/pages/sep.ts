// September — Deep Lanes. The Hollow Choir, its makers, and its Warden.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk, chk3, cr, dmg, dogfight, fight, give, haven, heal, levelUp, page, parts, repair, step, virtue, week } from '../lib'
import { DOCK_LATE, SHOP_LATE, SHOP_MID } from '../shops'

const DC = 14

export const SEP: Day[] = [
  // ---------- The Hollow ----------
  ...week(9, 4, [
    page('hd-darkplanets', 'The Dark Planets', 'space', 'Seven dark worlds circle a dim red sun, each one ringed with song-stone. One rings louder than the rest: a hollow world the core calls Hollow.', [
      step(undefined, chk3('Survey the system', 'wis', ['perception'], 'The rings scramble your sensors.', ['Hollow has an entrance: a crater the size of a city.', bonus('roll', 1)], ['The crater, and a safe descent path.', bonus('roll', 1), boon], DC)),
    ]),
    page('hd-ringsofsong', 'Rings of Song', 'space', 'Flying through the rings is like flying through a choir. The hull hums along.', [
      step(undefined, chk('Thread the rings', 'int', ['lore', 'piloting'], ['A ring shard dents the hull.', dmg(2)], ['You find the harmonic path. The rings part for you.', cr(3)], DC)),
    ]),
    fight('hd-shades', 'Shades', 'depths', 'In the crater’s mouth, flickering shapes block the way: echoes of guardians, half there and half not.', {
      enemies: ['hd_shade', 'hd_shade'],
      rounds: 3,
      intro: 'They sing a warning.',
      winText: 'The shades fade into the song.',
      loseText: 'The shades let you pass, as if you were never a threat.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    page('hd-landhollow', 'Landing on Hollow', 'depths', 'The crater drops down into the planet’s hollow heart. There is light down there — and air.', [
      step(undefined, chk3('Fly down into the hollow', 'dex', ['piloting'], ['A hard landing on song-stone.', dmg(2)], 'You land in a meadow of crystal grass.', ['A perfect landing beside a hall of pillars.', bonus('roll', 1)], DC)),
    ]),
    page('hd-hollowhalls', 'The Hollow Halls', 'depths', 'The halls are huge, and built for beings much taller than humans. Everything hums.', [
      step(undefined, chk3('Explore the halls', 'wis', ['perception', 'lore'], 'You get lost for hours.', ['You find the makers’ living quarters, long abandoned.', cr(3)], ['You find their living quarters — and a cache of song-stone ornaments.', cr(6)], DC)),
    ]),
    haven('hd-hollowcamp', 'Camp in the Hollow', 'depths', 'The free fleet camps in the hollow meadow. Kids from Coppice and Saltlight run through the crystal grass, laughing.', {
      shop: { items: SHOP_MID },
      icons: [{ kind: 'loot', x: 48, y: 76 }],
    }),
  ]),

  // ---------- The makers ----------
  ...week(9, 11, [
    page('hd-echoes', 'Echoes', 'depths', 'The song gets into your head. Some of the crew start humming it in their sleep.', [
      step(undefined, chk('Keep your head clear', 'con', ['physical'], ['Headaches, nosebleeds and strange dreams.', dmg(2)], 'You hum along, and it feels like company.', DC)),
    ]),
    dogfight('hd-dronewing', 'Drone Wing', 'The Choir’s drones come up from the hollow in a wing of three, circling the fleet’s camp.', {
      craft: ['hd_choirdrone', 'hd_choirdrone', 'hd_choirdrone'],
      rounds: 3,
      intro: 'They sing as they fly.',
      winText: 'The drones settle back into the rings. A test, passed.',
      loseText: 'The drones withdraw. The ship rings like a struck bell.',
      win: [cr(7), parts(1)],
      lose: [dmg(3)],
    }),
    page('hd-murals', 'The Murals', 'depths', 'One hall is covered with murals. They show tall beings building the Choir — and then leaving, through a lane, into the dark.', [
      step(undefined, chk3('Read the murals', 'int', ['lore'], 'They’re beautiful. You can’t read them.', ['The makers built the Choir so any traveler could go anywhere, freely.', virtue(1)], ['Free travel for everyone — and a final mural: the Choir’s heart, at a place the core calls Halcyon Point.', virtue(1), boon], DC)),
    ]),
    fight('hd-shadeswarm', 'Shade Swarm', 'depths', 'Shades and a guardian come for you in the hall of murals.', {
      enemies: ['hd_shade', 'hd_shade', 'hd_relicguard'],
      rounds: 3,
      intro: 'The song turns sharp.',
      winText: 'The shades fade, and the guardian kneels.',
      loseText: 'You fall back to the meadow.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    page('hd-rheefollows', 'Rhee Follows', 'bridge', 'Rhee’s frigate comes through the lane after you, alone. “The Navy doesn’t know I’m here,” she says. “Show me.”', [
      step(undefined, chk('Show Rhee the murals', 'cha', ['social'], 'Rhee looks, and says nothing.', ['Rhee stands in the hall for an hour. “Free travel for everyone,” she says. “The Combine would hate that.” She smiles.', virtue(1), give('hd_aegispatch', 2)], DC)),
    ]),
    haven('hd-levelsix', 'The Makers’ Hall', 'depths', 'You spend the weekend in the makers’ hall, learning their song. Everyone leaves it different — better.', {
      note: 'Rest, level up, and try the weekly lottery.',
      steps: [step('Level up', act('Learn the song', 'The chord settles into your bones.', levelUp))],
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
    }),
  ]),

  // ---------- Followed ----------
  ...week(9, 18, [
    page('hd-hymn', 'The Hymn', 'depths', 'The core can sing the Choir’s hymn now. The whole hollow world answers.', [
      step(undefined, chk3('Sing the hymn', 'wis', ['lore'], 'You lose the key halfway.', ['The hollow answers with light.', heal(3)], ['The hollow answers, and the rings above it brighten for a moment.', heal(3), boon], DC)),
    ]),
    page('hd-combinescouts', 'Combine Scouts', 'space', 'Someone else followed you through the lane: grey Combine scouts are mapping the system.', [
      step(undefined, chk('Spot the scouts', 'wis', ['perception'], ['They see you first and run.', dmg(1)], ['You spot them, and they never see you.', bonus('atk', 1), cr(2)], DC)),
    ]),
    fight('hd-combinelanding', 'Combine Landing', 'depths', 'A Combine landing party touches down in the meadow, guns raised, while a shade drifts out to see what the noise is.', {
      enemies: ['hd_trooper', 'hd_trooper', 'hd_shade'],
      rounds: 3,
      intro: '“By order of the Ledger Combine, this world is—”',
      winText: 'The landing party flees. The shade stays, watching you.',
      loseText: 'The landing party withdraws to their ship.',
      win: [cr(7)],
      lose: [dmg(3)],
    }),
    page('hd-choirwill', 'What the Choir Wants', 'depths', 'The core translates a new phrase from the song: an invitation, and a warning. The heart must be woken by someone who means to share it.', [
      step(undefined, chk3('Understand the invitation', 'int', ['lore'], 'The meaning slips away.', ['The heart is at Halcyon Point. The Warden guards the way.', cr(2)], ['Halcyon Point — the same name as your ship. Juniper goes pale.', boon, cr(2)], DC)),
    ]),
    page('hd-songforthedead', 'A Song for the Dead', 'depths', 'The fleet holds a memorial for everyone lost this year — Saltlight, Coppice, Tern Deep. The hollow sings with them.', [
      step(undefined, act('Sing', 'Nobody has dry eyes.', heal(3), virtue(1))),
    ]),
    dogfight('hd-lanepickets', 'Lane Pickets', 'The Combine scouts come back with a cutter, trying to cut off the lane home.', {
      craft: ['hd_cutter', 'hd_picket', 'hd_picket'],
      rounds: 3,
      intro: 'Grey hulls in a tight wedge.',
      winText: 'The wedge breaks. The lane home stays open.',
      loseText: 'They pull back, but the ship is hurting.',
      win: [cr(7), parts(1)],
      lose: [dmg(3)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- The Warden ----------
  ...week(9, 25, [
    page('hd-cathedral', 'The Cathedral', 'depths', 'At the bottom of the hollow stands a cathedral of song-stone, a kilometer tall. Something inside it is waking.', [
      step(undefined, chk3('Climb to the doors', 'dex', ['physical'], ['A step crumbles under you.', dmg(2)], 'You reach the doors.', ['You reach the doors and find a side entrance.', bonus('roll', 1)], DC)),
    ]),
    page('hd-songlock', 'The Song Lock', 'depths', 'The doors are sealed with a lock made of sound.', [
      step(undefined, chk3('Sing the lock open', 'int', ['tech', 'lore'], ['The lock screams. You’re thrown back.', dmg(2)], 'The doors open, grinding.', ['The doors swing open silently, and the Warden inside doesn’t notice.', bonus('atk', 1)], DC)),
    ]),
    fight('hd-wardenshades', 'The Warden’s Court', 'depths', 'The Warden’s court rises to stop you: shades and an old guardian.', {
      enemies: ['hd_shade', 'hd_shade', 'hd_relicguard'],
      rounds: 3,
      intro: 'The cathedral fills with song.',
      winText: 'The court falls quiet.',
      loseText: 'You push past them.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    page('hd-findnote', 'Finding the Note', 'depths', 'The Warden is a walking cathedral, ten stories tall. Every step is a chord. Somewhere in the chord is a wrong note.', [
      step(undefined, chk3('Listen for the wrong note', 'wis', ['perception', 'lore'], 'All you hear is noise.', ['A cracked bell in its chest.', bonus('atk', 1)], ['The cracked bell — and the beat when it rings.', bonus('atk', 1), bonus('dmg', 1)], DC)),
    ]),
    fight('hd-wardenfight', 'The Choir Warden', 'depths', 'The Warden turns its huge, eyeless face toward you, and sings.', {
      enemies: ['hd_choirwarden'],
      rounds: 5,
      intro: 'The cathedral walks.',
      winText: 'The Warden stops, and kneels, and opens its chest. Inside, a helm of song-stone waits — a gift for a worthy traveler.',
      loseText: 'The Warden stops, and steps aside. It has decided you are worth letting through.',
      win: [cr(15), give('hd_helm2')],
      lose: [cr(5), dmg(3)],
    }),
    haven('hd-choiropen', 'The Way Is Open', 'depths', 'The Warden sits in silence at the cathedral door. Beyond it, a lane opens, aimed straight at Halcyon Point. First, though, you have to go home.', {
      shop: { items: SHOP_LATE },
      dock: DOCK_LATE,
      steps: [step(undefined, act('Rest in the Warden’s shadow', 'The fleet repairs, refits and resupplies.', repair(2), heal(2)))],
    }),
  ]),
]
