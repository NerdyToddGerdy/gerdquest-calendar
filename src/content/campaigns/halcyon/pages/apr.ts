// April — Breakers. An ion storm, a besieged mining town, and Mother Sela Quin.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk, chk3, cr, cured, dmg, dogfight, fight, give, haven, heal, malfunction, page, parts, repair, step, travel, virtue, week } from '../lib'
import { DOCK_MID, SHOP_MID, STIMS } from '../shops'

const DC = 12

export const APR: Day[] = [
  // ---------- Coppice calls ----------
  ...week(4, 3, [
    page('hd-distress', 'Distress Call', 'bridge', 'A ragged signal from inside the Breaker Belt: “Coppice mining town. Raiders. Anyone.” Then static.', [
      step(undefined, chk('Clean up the signal', 'wis', ['perception', 'tech'], 'Only the word “raiders” survives the static.', ['Coordinates, a head count, and a name: Mother Sela Quin.', cr(1), bonus('wis', 1)], DC)),
    ]),
    page('hd-breakers', 'Into the Breakers', 'space', 'The Breaker Belt is a river of ionized dust. Lightning crawls over the hull, and every instrument lies.', [
      step(undefined, chk3('Fly the storm', 'dex', ['piloting'], ['Lightning arcs through the systems. Things start to glitch.', malfunction, dmg(1)], ['You get through with a few scorch marks.', travel(1)], ['You ride the ion currents like a surfer.', travel(1), boon], DC)),
    ]),
    page('hd-coppice', 'Coppice', 'station', 'Coppice is a mining town built into a hollow rock, its domes patched with ore-sheeting. The miners meet you with rifles.', [
      step(undefined, chk('Win the miners’ trust', 'cha', ['social'], 'They let you in, but they don’t lower the rifles.', ['The town elder shakes your hand. “Took you long enough.”', virtue(1), heal(2)], DC)),
    ]),
    fight('hd-dustrats', 'Dust Rats', 'cellar', 'Scavengers have slipped into the ore tunnels under the town, stripping cable and anything else that isn’t nailed down.', {
      enemies: ['hd_dustrat', 'hd_dustrat', 'hd_dustrat'],
      rounds: 3,
      intro: 'Magnetic hooks clank in the dark.',
      winText: 'The scavengers flee into the dust. The miners cheer.',
      loseText: 'The scavengers escape with a few cable spools.',
      win: [cr(4)],
      lose: [dmg(2)],
    }),
    page('hd-nadia', 'Nadia Kovač', 'space', 'Coppice’s best pilot challenges you to a race through the storm. “Win, and I’ll fly for you. Lose, and you buy the drinks.”', [
      step(undefined, chk3('Race the storm', 'dex', ['piloting'], ['You lose — and scrape the hull doing it.', dmg(1), cr(-2)], 'A dead heat. Nadia laughs and buys her own drinks.', ['You win by a hull length. Nadia will join your crew at the dock.', boon, virtue(1)], DC)),
    ]),
    haven('hd-copdock', 'Coppice Docks', 'station', 'The town’s single dock smells of ore dust and machine oil. The miners help patch the storm damage.', {
      shop: { items: STIMS },
      dock: DOCK_MID,
      steps: [step(undefined, act('Let the miners patch the ship', 'Storm burns sanded off, glitching circuits replaced.', repair(2), cured))],
    }),
  ]),

  // ---------- Holding the line ----------
  ...week(4, 10, [
    page('hd-orerun', 'The Ore Run', 'cellar', 'Coppice can’t buy food if it can’t sell ore. Someone has to haul the week’s load out to the dock while the raiders sleep.', [
      step(undefined, chk('Haul the ore carts', 'str', ['physical'], ['A cart tips over on your foot.', dmg(1)], ['The ore makes it out. The miners pay you in rations and credits.', cr(3), give('ration', 2)], DC)),
    ]),
    dogfight('hd-raiders', 'Storm Raiders', 'Two raider ships come howling out of the dust, aiming straight for the ore barge.', {
      craft: ['hd_raider', 'hd_raider'],
      rounds: 3,
      intro: 'Lightning paint, harpoon guns, bad attitude.',
      winText: 'The raiders tumble back into the storm. The ore barge is safe.',
      loseText: 'The raiders take a few crates and run.',
      win: [cr(5)],
      lose: [dmg(2), cr(-2)],
    }),
    page('hd-stormglass', 'Stormglass', 'station', 'The miners have a mineral called stormglass that soaks up lightning. With work, it could protect the ship.', [
      step(undefined, chk3('Rig the stormglass', 'int', ['tech'], 'It shatters when you test it.', ['A crude ion shield. It helps.', repair(1)], ['A proper storm shield. The ship hums with confidence.', repair(2), parts(1)], DC)),
    ]),
    page('hd-hostages', 'Hostages', 'station', 'Raiders took three miners from an outlying shaft. Sela wants ore for them.', [
      step(
        'Choose one',
        act('A) Pay the ransom', 'You pay in ore and credits. The miners come home shaken but whole.', cr(-5), virtue(1)),
        chk('B) Get them out', 'dex', ['stealth'], ['The rescue turns into a fistfight. Everyone gets out — bloody.', dmg(2)], ['You walk the hostages out under the raiders’ noses.', virtue(2), cr(2)], DC),
      ),
    ]),
    fight('hd-stormraiders', 'Raiders in the Domes', 'station', 'Sela answers your rescue with a raid. Two of her lightning-tattooed fighters burst into the hydroponics dome.', {
      enemies: ['hd_stormraider', 'hd_stormraider'],
      rounds: 3,
      intro: 'Arc-whips crackle among the bean vines.',
      winText: 'The raiders retreat. One leaves behind a storm-chart.',
      loseText: 'The raiders burn a dome and withdraw.',
      win: [cr(5)],
      lose: [dmg(2)],
    }),
    haven('hd-copfeast', 'The Ore Feast', 'inn', 'Coppice throws a feast out of almost nothing: fungus bread, ore-dust beer, and songs about the Breakers.', {
      shop: { items: SHOP_MID },
      icons: [{ kind: 'loot', x: 70, y: 48 }],
    }),
  ]),

  // ---------- Sela ----------
  ...week(4, 17, [
    page('hd-selacall', 'Mother Sela', 'bridge', 'Sela broadcasts across the Belt: “Coppice belongs to the storm. So does anyone who helps it.” She sounds amused.', [
      step(
        'Choose one',
        chk('A) Answer her', 'cha', ['social'], 'She laughs you off the channel.', ['You get under her skin. Raiders start arguing on open channels.', bonus('roll', 1)], DC),
        act('B) Trace her signal instead', 'Juniper triangulates the broadcast to the storm’s eye.', give('hd_chaff')),
      ),
    ]),
    page('hd-lightningrods', 'Lightning Rods', 'station', 'If Sela is coming, Coppice needs defenses. You help raise lightning rods over the domes.', [
      step(undefined, chk('Raise the rods', 'con', ['physical'], ['A stray bolt knocks you off a ladder.', dmg(2)], ['The rods are up. The domes will survive the next storm-strike.', virtue(1), heal(1)], DC)),
    ]),
    page('hd-scouteye', 'Scouting the Eye', 'space', 'You take the ship into the storm to find Sela’s base: a hollow comet at the eye.', [
      step(undefined, chk3('Map the eye', 'wis', ['piloting', 'perception'], ['The storm throws you back.', travel(1), dmg(1)], ['You chart the outer approach.', travel(1)], ['You chart the whole approach, and the Squall’s berth.', travel(1), boon], DC)),
    ]),
    fight('hd-skirmish', 'Skirmish at the Shaft', 'cellar', 'Raiders and dust rats ambush you at an outlying shaft.', {
      enemies: ['hd_stormraider', 'hd_dustrat', 'hd_dustrat'],
      rounds: 3,
      intro: 'Hooks, whips and shouting.',
      winText: 'The ambush breaks.',
      loseText: 'You fall back to the town.',
      win: [cr(4)],
      lose: [dmg(2)],
    }),
    page('hd-lull', 'The Lull', 'inn', 'For one evening, the storm goes quiet. The miners sing, and someone teaches your crew a card game with very confusing rules.', [
      step(undefined, act('Play cards with the miners', 'You lose spectacularly and laugh until it hurts.', heal(3), virtue(1))),
    ]),
    dogfight('hd-stormfront', 'The Stormfront', 'Sela sends three raiders to test Coppice’s new defenses — and yours.', {
      craft: ['hd_raider', 'hd_raider', 'hd_raider'],
      rounds: 3,
      intro: 'They come in with the lightning.',
      winText: 'The raiders break against the rods and your guns.',
      loseText: 'The raiders break off, but the ship took a beating.',
      win: [cr(6), parts(1)],
      lose: [dmg(2)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- The eye of the storm ----------
  ...week(4, 24, [
    page('hd-eye', 'The Eye of the Storm', 'space', 'You fly into the eye. Inside, the storm walls rise like cliffs of light.', [
      step(undefined, chk3('Hold the ship steady', 'dex', ['piloting'], ['Systems glitch as the storm wall brushes you.', malfunction], 'You thread the wall cleanly.', ['You come in out of the sun — so to speak.', bonus('roll', 1)], DC)),
    ]),
    dogfight('hd-squall', 'The Squall', 'Mother Sela’s flagship turns to meet you, lightning crawling along its hull, a raider on each wing.', {
      craft: ['hd_squall', 'hd_raider'],
      rounds: 4,
      intro: '“Welcome to my storm,” Sela purrs.',
      winText: 'The Squall’s drive flickers and dies. You match spin to board.',
      loseText: 'The Squall is battered but still flying. You board anyway.',
      win: [cr(6)],
      lose: [dmg(2)],
    }),
    page('hd-boardsquall', 'Boarding the Squall', 'wreck', 'The Squall’s airlock is welded shut. You’ll have to make a door.', [
      step(undefined, chk('Force the airlock', 'str', ['physical'], ['The airlock gives way all at once, and you go in tumbling.', dmg(2)], 'The airlock peels open.', DC)),
    ]),
    page('hd-seladeck', 'Sela’s Deck', 'wreck', 'The Squall’s corridors are hung with trophies: hull plates from every ship Sela ever took.', [
      step(undefined, chk3('Find Sela', 'wis', ['perception'], 'You wander the trophy halls until she finds you.', ['You find her bridge.', bonus('atk', 1)], ['You find her bridge, and the arc-cannon’s power coupling.', bonus('atk', 1), bonus('dmg', 1)], DC)),
    ]),
    fight('hd-selafight', 'Mother Sela Quin', 'bridge', 'Sela waits at the Squall’s helm, arc-whip coiled. “Coppice was mine,” she says. “Now you’re mine too.”', {
      enemies: ['hd_sela', 'hd_stormraider'],
      rounds: 4,
      intro: 'The whip cracks, and the bridge lights burst.',
      winText: 'Sela yields. The Breaker raiders scatter without her, and Coppice is free.',
      loseText: 'Sela escapes into the storm in a lifeboat. Her raiders lose heart and flee.',
      win: [cr(12), give('hd_plate')],
      lose: [cr(4), dmg(2)],
    }),
    haven('hd-copsaved', 'Coppice Saved', 'station', 'The miners carve your ship’s name into the town’s dome beam. Nadia packs her bags.', {
      shop: { items: SHOP_MID },
      dock: DOCK_MID,
      steps: [step(undefined, act('Let Coppice thank you', 'Fresh rations, a free refit, and a crate of stormglass.', give('ration', 2), repair(2), cured))],
    }),
  ]),
]
