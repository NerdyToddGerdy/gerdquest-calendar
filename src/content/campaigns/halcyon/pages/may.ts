// May — The Choir Wakes. The Navy arrives, and the Lacuna node wakes up.
import type { Day } from '../../../../engine/types'
import { act, bonus, boon, chk, chk3, cr, dmg, dogfight, fight, give, haven, heal, infected, levelUp, page, parts, step, travel, virtue, week } from '../lib'
import { DOCK_MID, SHOP_MID, STIMS } from '../shops'

const DC = 13

export const MAY: Day[] = [
  // ---------- The Navy ----------
  ...week(5, 1, [
    page('hd-secondlayer', 'The Second Layer', 'bridge', 'With the Tern node’s song fed into it, the data core opens a second layer: a map of relay nodes scattered across the Shoal, and one name glowing brightest — Lacuna.', [
      step(undefined, chk3('Decode the map', 'int', ['tech', 'lore'], 'You get Lacuna’s location and a headache.', ['Lacuna, and a route that avoids Combine space.', cr(2)], ['Lacuna, a safe route, and a power reading off the charts.', boon, cr(2)], DC)),
    ]),
    page('hd-rhee', 'Commodore Rhee', 'bridge', 'A Navy frigate drops out of the dark beside you. “Halcyon Debt, this is Commodore Ansel Rhee. I believe you have something the Navy would like to discuss.”', [
      step(undefined, chk('Talk to the Commodore', 'cha', ['social'], 'Rhee is polite, unreadable, and not leaving.', ['Rhee admits the Navy fears the Combine more than it fears you.', virtue(1), bonus('cha', 1)], DC)),
    ]),
    page('hd-navyinspect', 'Navy Inspection', 'cellar', 'Rhee sends marines to “inspect your cargo.” The data core is in the hold.', [
      step(
        'Choose one',
        act('A) Let them look', 'You show them everything. The marines whistle at the core, and Rhee looks thoughtful.', virtue(1), cr(-2)),
        chk('B) Hide the core', 'dex', ['stealth'], ['A marine finds it in the ration crates. Awkward.', virtue(-1)], ['The core stays hidden in a hollowed-out ration crate.', bonus('roll', 1)], DC),
      ),
    ]),
    fight('hd-marines', 'Overzealous Marines', 'cellar', 'Two marines decide the inspection should include your crew’s pockets. Juniper disagrees, loudly. Fists fly.', {
      enemies: ['hd_marine', 'hd_marine'],
      rounds: 3,
      intro: '“Stand down, spacer!”',
      winText: 'Rhee calls her marines off, almost apologetic. “Discipline issues,” she says.',
      loseText: 'Rhee calls the marines off. Your jaw hurts.',
      win: [cr(4)],
      lose: [dmg(2)],
    }),
    page('hd-lacunacourse', 'Course for Lacuna', 'space', 'Rhee lets you go, with a Navy tracker quietly attached to your hull. Lacuna is a week away.', [
      step(undefined, chk('Plot the course (and find the tracker)', 'wis', ['piloting', 'perception'], ['Long burn. Hungry crew.', travel(2)], ['You find the tracker and stick it to a passing comet.', travel(1), cr(2)], DC)),
    ]),
    haven('hd-waystation', 'Waystation Mercy', 'inn', 'A cantina built into an old fuel tank, halfway to nowhere. The coffee is terrible and the company is worse, which makes it perfect.', {
      shop: { items: SHOP_MID },
      icons: [{ kind: 'pickpocket', x: 40, y: 72 }],
    }),
  ]),

  // ---------- Lacuna ----------
  ...week(5, 8, [
    page('hd-lacuna', 'Lacuna', 'depths', 'Lacuna is a moon of black glass, with a spire of song-stone rising from a crater. The air hums before you even land.', [
      step(undefined, chk3('Survey the crater', 'wis', ['perception'], ['A glass shard slices your suit.', dmg(1)], 'You find a safe way down.', ['You find a safe way down, and a cave of loose song-stone.', give('hd_witstim')], DC)),
    ]),
    fight('hd-relicguards', 'Relic Guardians', 'depths', 'The stones at the crater’s edge stand up. They are tall, faceless, and humming.', {
      enemies: ['hd_relicguard', 'hd_relicguard'],
      rounds: 3,
      intro: 'The hum rises to a chord.',
      winText: 'The guardians crumble back into stones. The hum quiets, almost approving.',
      loseText: 'The guardians step back to their posts, as if you passed some test.',
      win: [cr(5)],
      lose: [dmg(2)],
    }),
    page('hd-songhall', 'The Song Hall', 'depths', 'Inside the spire, a hall of pillars hums like an organ. Each pillar is a note; together they’re a map.', [
      step(undefined, chk3('Read the song', 'int', ['lore'], 'The song is beautiful and meaningless.', ['The pillars point to a heart chamber deeper down.', cr(2)], ['The pillars show the whole relay network, lit like a nervous system.', boon, cr(3)], DC)),
    ]),
    dogfight('hd-frigate', 'The Navy Frigate', 'Rhee’s frigate drops into orbit over Lacuna — and so do two Combine pickets. Everyone wants the node, and you’re in the way.', {
      craft: ['hd_frigate', 'hd_picket'],
      rounds: 4,
      intro: 'Rhee’s voice: “Nothing personal, captain. Orders.”',
      winText: 'You drive off the picket and leave the frigate limping. Rhee calls for a parley.',
      loseText: 'The frigate pins you to the moon. Rhee calls for a parley anyway.',
      win: [cr(6), parts(1)],
      lose: [dmg(3)],
    }),
    page('hd-rheeoffer', 'Rhee’s Offer', 'bridge', 'Rhee meets you on Lacuna’s glass in person, helmet off. “The Combine wants this buried. I want it studied. Help me, and the Navy forgets your debts.”', [
      step(
        'Choose one',
        act('A) Accept a partnership', 'Rhee shakes your hand. Her grip is strong and her eyes are tired.', virtue(1), cr(5)),
        chk('B) Keep the Navy at arm’s length', 'cha', ['social'], 'Rhee isn’t happy, but she lets it go — for now.', ['Rhee laughs. “Free spacers. Fine. But call me when the Combine comes.”', bonus('roll', 1), virtue(1)], DC),
      ),
    ]),
    haven('hd-levelfour', 'Camp on the Glass', 'depths', 'You camp on Lacuna’s black glass under a sky full of strange stars. The node hums a lullaby. Everyone wakes up sharper than they went to sleep.', {
      note: 'Rest, level up, and try the weekly lottery.',
      steps: [step('Level up', act('Sleep under the song', 'You dream in chords, and wake up knowing things you didn’t learn.', levelUp))],
      shop: { items: STIMS },
      dock: DOCK_MID,
    }),
  ]),

  // ---------- Crossfire ----------
  ...week(5, 15, [
    page('hd-resonance', 'Resonance', 'depths', 'The node is waking faster now. The whole moon shudders with each new note.', [
      step(undefined, chk('Brace the camp against the tremors', 'con', ['physical'], ['A tremor throws you into a glass ridge.', dmg(2)], 'The camp holds.', DC)),
    ]),
    page('hd-combinespy', 'A Combine Spy', 'station', 'One of Rhee’s junior officers keeps sending tight-beam messages to a Combine relay.', [
      step(undefined, chk3('Catch the spy', 'wis', ['perception'], 'He spots you watching and deletes everything.', ['You catch him, and Rhee takes over, grim-faced.', virtue(1)], ['You catch him, and turn his channel into a pipe full of lies for the Combine.', virtue(1), boon], DC)),
    ]),
    fight('hd-crossfire', 'Crossfire', 'depths', 'Combine agents land on Lacuna to seize the node. Navy marines and a guardian all wade in at once, and somehow everyone is shooting at you.', {
      enemies: ['hd_combineagent', 'hd_marine', 'hd_relicguard'],
      rounds: 3,
      intro: 'Three sides, one crater.',
      winText: 'The Combine team retreats to orbit. Rhee nods at you across the crater.',
      loseText: 'The Combine team retreats, but you’re hurting.',
      win: [cr(6)],
      lose: [dmg(3)],
    }),
    page('hd-mapping', 'Mapping the Lanes', 'bridge', 'The node’s song lines up with the Shoal’s star charts. Where the song is loudest, new jump lanes could open.', [
      step(undefined, chk3('Map the potential lanes', 'int', ['tech'], 'The math defeats you.', ['You map three potential lanes.', cr(3)], ['You map seven potential lanes, and one runs straight past the Combine’s home station.', cr(4), boon], DC)),
    ]),
    page('hd-quietwatch', 'A Quiet Watch', 'bridge', 'You take the night watch with Juniper. She tells you about her first courier run, and the parcel she still doesn’t know the contents of.', [
      step(undefined, act('Listen', 'The stars wheel overhead. You both fall asleep at the console.', heal(3), virtue(1))),
    ]),
    dogfight('hd-pursuit', 'Pursuit', 'The Combine team that fled Lacuna circles back with friends, trying to catch you away from Rhee’s frigate.', {
      craft: ['hd_picket', 'hd_picket', 'hd_picket'],
      rounds: 3,
      intro: 'Three grey boats in a tight wedge.',
      winText: 'You break the wedge and send them home.',
      loseText: 'They pull off when Rhee’s frigate comes over the horizon.',
      win: [cr(6), parts(1)],
      lose: [dmg(2)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- The Sentinel ----------
  ...week(5, 22, [
    page('hd-sentinelstirs', 'The Sentinel Stirs', 'depths', 'Deep under the spire, something huge shifts in its sleep. The tunnels groan.', [
      step(undefined, chk3('Climb down to the heart', 'dex', ['physical'], ['A tunnel collapses behind you.', dmg(2)], 'You make it down, dusty.', ['You make it down and find a side passage to the heart.', bonus('roll', 1)], DC)),
    ]),
    page('hd-tuning', 'Tuning the Core', 'cellar', 'If the core can sing the right chord, maybe the Sentinel will let you pass. Maybe.', [
      step(undefined, chk('Tune the core', 'int', ['tech'], 'The core screeches. Far below, something answers, angrily.', ['The core hums a clean chord. The tunnels go still.', bonus('def', 1)], DC)),
    ]),
    fight('hd-shards', 'Living Shards', 'depths', 'Song-stone shards peel off the tunnel walls and come at you like a flock of knives.', {
      enemies: ['hd_relicguard', 'hd_relicguard', 'hd_marine'],
      rounds: 3,
      intro: 'A Navy marine fights at your side — then gets turned around by the noise and swings at you.',
      winText: 'The shards fall silent. The marine apologizes, badly.',
      loseText: 'You push through, cut in a dozen places.',
      win: [cr(5)],
      lose: [dmg(3)],
    }),
    page('hd-heartchamber', 'The Heart Chamber', 'depths', 'The heart chamber is a sphere of song-stone a hundred meters wide. In its center stands the Sentinel, unfolding.', [
      step(undefined, chk3('Find its weak point', 'wis', ['perception', 'lore'], 'It doesn’t seem to have one.', ['A cracked seam on its left side.', bonus('atk', 1)], ['A cracked seam, and a rhythm to its movements.', bonus('atk', 1), bonus('dmg', 1)], DC)),
    ]),
    fight('hd-sentinelfight', 'The Choir Sentinel', 'depths', 'The Sentinel rises, ten thousand years of guardianship humming in every limb.', {
      enemies: ['hd_sentinel'],
      rounds: 5,
      intro: 'The chord it sings could crack a moon.',
      winText: 'The Sentinel kneels, and goes quiet. The heart chamber opens a path. In the dust lies a pendant of song-stone, warm to the touch.',
      loseText: 'The Sentinel stops, as if it has learned enough about you. It lets you pass.',
      win: [cr(12), give('hd_songstone')],
      lose: [cr(4), dmg(2)],
    }),
    haven('hd-lacunalight', 'Lacuna Lights Up', 'depths', 'The node blazes with light, and for one breathtaking hour a new jump lane shimmers in the sky above Lacuna. Then it fades.', {
      shop: { items: SHOP_MID },
      dock: DOCK_MID,
    }),
  ]),

  // ---------- A new lane ----------
  ...week(5, 29, [
    page('hd-newlane', 'A New Lane', 'space', 'The lane flickers open again at dawn. You have a few minutes to fly it.', [
      step(undefined, chk3('Fly the new lane', 'wis', ['piloting'], ['The lane collapses halfway. You drop out hard.', dmg(2), travel(1)], ['You make it — six days of travel in an hour.', travel(1)], ['You make it, and the lane leaves a recording of itself in the core.', travel(1), boon], DC)),
    ]),
    page('hd-rheewarns', 'Rhee’s Warning', 'bridge', 'Rhee’s voice on the comm is tight. “Saltlight Station has gone dark. Spores from somewhere — people falling sick. The Navy’s quarantining it. You’ve got a medic. They need help.”', [
      step(undefined, act('Set course for Saltlight', 'Nobody argues.', virtue(1))),
    ]),
    page('hd-saltlightcall', 'Saltlight Calls', 'space', 'Saltlight Station is a salt-mining hub — fifteen thousand people, all coughing.', [
      step(undefined, chk('Push the drive hard', 'con', ['physical'], ['The long burn wears everyone down.', travel(2), dmg(1)], ['You get there fast.', travel(1)], DC)),
    ]),
    dogfight('hd-quarantineline', 'The Quarantine Line', 'Navy cordon boats aren’t letting anyone near Saltlight, and the Combine has sent its own to “protect its investments.” A frigate swings into your path.', {
      craft: ['hd_frigate'],
      rounds: 3,
      intro: '“Turn back, Halcyon Debt.” It isn’t Rhee.',
      winText: 'You slip past the frigate and dive for Saltlight’s docks.',
      loseText: 'You reach the docks with your shields buckled.',
      win: [cr(4)],
      lose: [dmg(2)],
    }),
    page('hd-saltdock', 'Docking at Saltlight', 'station', 'The docking ring is full of people in masks, and the air tastes of salt and something sweet and rotten.', [
      step(undefined, chk('Filter the airlock', 'int', ['medical', 'tech'], ['The spores get in. You’re coughing within the hour.', infected], ['Clean filters. Your crew stays healthy — for now.', bonus('con', 1)], DC)),
    ]),
    haven('hd-saltarrival', 'The Infirmary Ring', 'station', 'Saltlight’s infirmary ring is overflowing. You set up a field clinic in a cargo bay and sleep in shifts.', {
      shop: { items: STIMS },
      icons: [{ kind: 'loot', x: 18, y: 58 }],
    }),
  ]),
]
