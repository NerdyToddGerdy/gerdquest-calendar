// February — Ice Under Tern. (Starts with the week of Mon Jan 30.)
import type { Day } from '../../../../engine/types'
import { act, chk, chk3, cr, dmg, dogfight, fight, give, haven, heal, malfunction, page, parts, repair, step, travel, virtue, week, bonus, boon } from '../lib'
import { DOCK_EARLY, SHOP_EARLY, STIMS } from '../shops'

const DC = 11

export const FEB: Day[] = [
  // ---------- Through the gate ----------
  ...week(1, 30, [
    page('hd-gate', 'Through the Gate', 'space', 'The jump-point folds the stars like wet paper. On the other side: a sky nobody on the Halcyon Debt has seen before, and a dead ice moon the core keeps pointing at.', [
      step(undefined, chk('Ride out the jump', 'wis', ['piloting'], ['The fold rattles every bolt aloft. Something in the drive starts to tick.', malfunction], ['A clean fold. The crew cheers like they invented it.', parts(1)], DC)),
    ]),
    page('hd-newsky', 'New Sky', 'bridge', 'The nav computer has no charts for this side of the gate. Juniper tapes a paper map to the console and starts drawing.', [
      step(undefined, chk('Chart the system', 'int', ['tech', 'lore'], 'Your chart is mostly question marks.', ['You find a safe lane to the ice moon and a buoy full of old salvage.', cr(3)], DC)),
    ]),
    page('hd-tollbuoy', 'The Toll Buoy', 'space', 'A Combine toll buoy floats in the lane, blinking politely. Even out here, someone wants paying.', [
      step(
        'Choose one',
        act('A) Pay the toll', 'You pay. The buoy thanks you for your business.', cr(-3), virtue(1)),
        chk('B) Slice the buoy', 'int', ['tech'], ['The buoy flags your hull number. Somewhere, a ledger updates.', cr(-1)], ['The buoy forgets you exist — and spits out its till.', cr(4), virtue(-1)], DC),
      ),
    ]),
    page('hd-tern', 'Tern Deep', 'depths', 'Survey Station Tern Deep sits half-buried in blue ice, its lights long dead. The core’s coordinates point straight down through it.', [
      step(undefined, chk3('Land on the ice shelf', 'dex', ['piloting'], ['The shelf cracks under the landing struts.', dmg(2)], 'A hard landing, but a landing.', ['You set down so gently the ice doesn’t notice.', boon], DC)),
    ]),
    fight('hd-crawlers', 'Things in the Cold', 'depths', 'The station’s maintenance crawlers are still running. Ten years without orders has made them strange — and territorial.', {
      enemies: ['hd_icecrawler', 'hd_icecrawler', 'hd_icecrawler'],
      rounds: 3,
      intro: 'Legs skitter on frozen metal.',
      winText: 'The last crawler folds up like a dead spider. Their power cells are worth something.',
      loseText: 'The crawlers retreat into the vents. You’ll hear them all week.',
      win: [cr(3)],
      lose: [dmg(1)],
    }),
    haven('hd-bunkhouse', 'The Bunkhouse', 'station', 'You get the station’s bunkhouse heaters running. Juniper finds a crate of survey-crew rations and a working coffee press, which is better than any treasure.', {
      shop: { items: STIMS },
      icons: [{ kind: 'loot', x: 76, y: 64 }],
    }),
  ]),

  // ---------- The vault ----------
  ...week(2, 6, [
    page('hd-thaw', 'Thawing the Vault', 'depths', 'Below the station, a sealed shaft drops into the ice. You rig the ship’s heat exchangers to melt a way in.', [
      step(undefined, chk('Haul cable through the cold', 'con', ['physical'], ['Frostbite nips your fingers.', dmg(1)], ['The shaft opens. Warm air breathes out of it — warm.', bonus('roll', 1)], DC)),
    ]),
    page('hd-surveylogs', 'The Survey Logs', 'station', 'The station’s last crew logged everything — right up to the day they stopped logging.', [
      step(undefined, chk3('Read the logs', 'int', ['lore', 'tech'], 'Corrupted. You get dates and fear, nothing else.', ['They found “a structure that hums” and argued about telling the Combine.', cr(2)], ['They hid a cache of survey pay before they left. You find it.', cr(6)], DC)),
    ]),
    page('hd-writ', 'A Repossession Writ', 'bridge', 'A message crackles in from orbit: “This is Auditor Brannoc Kessel of the Ledger Combine. The vessel Halcyon Debt is in arrears. Please prepare to surrender it.”', [
      step(
        'Choose one',
        chk('A) Argue the account', 'cha', ['social'], 'Kessel reads you clause nine. Then clause ten.', ['You quote the Shoal free-salvage act. Kessel goes quiet, then very polite, which is worse.', virtue(1)], DC),
        act('B) Cut the channel', 'You cut him off mid-sentence. Juniper whistles. “He’s going to hate that.”', virtue(-1), bonus('atk', 1)),
      ),
    ]),
    dogfight('hd-greyboats', 'Grey Boats', 'Two Combine pickets drop out of orbit, repossession beacons flashing. They’re here to tow the Halcyon Debt — with you in it.', {
      craft: ['hd_picket', 'hd_picket'],
      rounds: 3,
      intro: '“Power down your drive,” a bored voice says. You don’t.',
      winText: 'Both pickets limp away, beacons dark.',
      loseText: 'The pickets break off to report. Kessel will know everything.',
      win: [cr(5), parts(1)],
      lose: [dmg(1)],
    }),
    page('hd-firstnode', 'The First Node', 'depths', 'At the bottom of the shaft stands a spire of grey stone, veined with light. When you step close, it hums a single note.', [
      step(undefined, chk3('Study the node', 'wis', ['perception', 'lore'], 'The hum gives you a headache and nothing else.', ['The note matches a tone in the data core. They’re the same language.', give('hd_focusstim')], ['You hear it: not a note, a chord — and a direction.', boon, cr(3)], DC)),
    ]),
    haven('hd-ternhangar', 'Tern Hangar', 'station', 'The station’s hangar still has a working gantry. With a little cursing, it becomes a dock.', {
      dock: DOCK_EARLY,
      steps: [step(undefined, act('Patch the hull under the gantry', 'Sparks fly until dawn.', repair(2)))],
    }),
  ]),

  // ---------- Kessel closes in ----------
  ...week(2, 13, [
    page('hd-nodesong', 'The Node Sings', 'depths', 'The node hums louder every day, as if it knows someone is listening.', [
      step(
        'Choose one',
        chk('A) Listen to it', 'wis', ['lore'], 'You fall asleep against the stone and wake up cold.', ['You catch a phrase in the hum — a second location, deeper in the Shoal.', cr(3)], DC),
        chk('B) Record it', 'int', ['tech'], 'The recorder melts.', ['Clean recording. The core eats it hungrily.', parts(1)], DC),
      ),
    ]),
    page('hd-coldsleep', 'Cold Sleepers', 'depths', 'In a side chamber, three survey techs lie in failing cryo pods. One is still alive.', [
      step(undefined, chk3('Wake the survivor', 'int', ['medical'], 'The pod fails as you open it. You were too late.', ['She wakes, confused, and tells you the Combine paid her crew to forget what they found.', virtue(1)], ['She wakes and grips your arm. “They’re coming back for it. Don’t let them.”', virtue(2), heal(2)], DC)),
    ]),
    fight('hd-reposquad', 'The Repo Squad', 'station', 'Kessel’s guards come in through the hangar doors, stun-lances crackling, reading out your account number.', {
      enemies: ['hd_auditguard', 'hd_auditguard'],
      rounds: 3,
      intro: '“By order of the Ledger Combine—”',
      winText: 'The guards retreat to their shuttle. One drops a Combine datapad.',
      loseText: 'The guards tag your ship with a tracking seal before they withdraw.',
      win: [cr(4)],
      lose: [dmg(2)],
    }),
    page('hd-sabotage', 'Sabotage', 'station', 'Kessel’s shuttle sits on the ice with its grapple rig unattended.', [
      step(undefined, chk('Wreck the grapples', 'dex', ['stealth'], ['A guard spots you. You run, slipping on the ice.', dmg(1)], ['The grapples will never close again. Kessel can’t tow anything.', cr(2), bonus('roll', 1)], DC)),
    ]),
    page('hd-gambit', 'Juniper’s Gambit', 'bridge', 'Juniper spreads a map of the ice shelf across the table. “He wants the ship? Let’s give him something shaped like a ship.”', [
      step(undefined, act('Hear the plan', 'A decoy beacon, a fault line in the ice, and a lot of explosives. You love it.', give('hd_arcgrenade', 2))),
    ]),
    dogfight('hd-blockade', 'Running the Blockade', 'Kessel calls in more boats. To set the trap, you have to get past them and back — twice.', {
      craft: ['hd_picket', 'hd_picket', 'hd_skiff'],
      rounds: 3,
      intro: 'You go out low over the ice, hull scraping vapor.',
      winText: 'You weave through the pickets and plant the decoy.',
      loseText: 'You plant the decoy, but the pickets chew up the hull doing it.',
      win: [cr(4)],
      lose: [dmg(2)],
    }, [], { note: 'An action weekend: no Rest. Dogfight for up to 3 volleys.' }),
  ]),

  // ---------- Springing the trap ----------
  ...week(2, 20, [
    page('hd-icetrap', 'Setting the Trap', 'depths', 'Charges along the fault line, the decoy beacon pulsing. Now someone has to stand in the open and look like bait.', [
      step(undefined, chk('Haul the charges into place', 'str', ['physical'], ['A charge slips and nearly takes your foot.', dmg(1)], ['Every charge is set exactly right.', bonus('dmg', 1)], DC)),
    ]),
    page('hd-terms', 'Kessel’s Terms', 'bridge', 'Kessel lands in person, flanked by guards. “Surrender the core and the ship, and the Combine forgives the interest.”', [
      step(
        'Choose one',
        chk('A) Stall him', 'cha', ['social'], 'He sees through you and signals his guards.', ['You keep him talking until he’s standing on the fault line.', bonus('atk', 1)], DC),
        act('B) Offer a copy of the core', 'Kessel smiles. It’s a fake, of course — and he knows it. Still, he hesitates.', virtue(-1), cr(2)),
      ),
    ]),
    page('hd-icequake', 'Ice Quake', 'depths', 'Someone triggers the charges early. The shelf heaves, and the station tilts toward the abyss.', [
      step(undefined, chk3('Scramble for solid ice', 'dex', ['physical'], ['You go down hard with the ice.', dmg(3)], ['You make it, bruised.', dmg(1)], 'You vault from slab to slab like it was planned.', DC)),
    ]),
    fight('hd-reporaid', 'Ice and Iron', 'depths', 'In the chaos, Kessel’s guards and a pack of panicked crawlers come at you from both sides.', {
      enemies: ['hd_auditguard', 'hd_icecrawler', 'hd_icecrawler'],
      rounds: 3,
      intro: 'Blue ice, grey armor, red emergency lights.',
      winText: 'The guards flee for their shuttle. Kessel is alone.',
      loseText: 'You hold your ground, barely.',
      win: [cr(3)],
      lose: [dmg(2)],
    }),
    fight('hd-kesselfight', 'Auditor Brannoc Kessel', 'station', 'Kessel draws a gold-plated stun baton. “Fine,” he says. “We’ll do this the expensive way.”', {
      enemies: ['hd_kessel', 'hd_auditguard'],
      rounds: 4,
      intro: '“Arrears, penalties, interest, and fees,” Kessel recites as he swings.',
      winText: 'Kessel yields, nose bleeding. His writ goes into the core along with everything else.',
      loseText: 'Kessel retreats to orbit, swearing to file every penalty in the book.',
      win: [cr(10), give('hd_luckcoin')],
      lose: [cr(-3), dmg(1)],
    }),
    haven('hd-leavingtern', 'Leaving Tern', 'station', 'The station is quiet again. The node hums one long, satisfied note as you lift off, like it has been waiting for this.', {
      shop: { items: SHOP_EARLY },
      dock: DOCK_EARLY,
    }),
  ]),

  // ---------- Toward Glasshouse ----------
  ...week(2, 27, [
    page('hd-datapad', 'Kessel’s Datapad', 'bridge', 'Kessel’s datapad is full of accounts. One of them is yours — and it’s been bought and sold four times.', [
      step(undefined, chk3('Crack the datapad', 'int', ['tech'], 'Encrypted beyond your skill.', ['The original lien on the Halcyon Debt is kept at Glasshouse Station.', cr(2)], ['The lien, its vault number, and the name of the teller who guards it.', cr(2), boon], DC)),
    ]),
    page('hd-courseglass', 'Course for Glasshouse', 'space', 'Glasshouse Station is the Combine’s bank, built in a ring of mirrors around a white star. Four days’ burn.', [
      step(undefined, chk('Plot the long burn', 'wis', ['piloting'], ['A bad burn. You eat into the stores.', travel(2)], ['A tidy burn that saves fuel.', travel(1), cr(2)], DC)),
    ]),
    page('hd-stowaway', 'A Stowaway', 'cellar', 'Juniper drags a kid out of the cargo hold by the collar: a Tern Deep orphan who stowed away rather than freeze.', [
      step(
        'Choose one',
        act('A) Hand the kid to the next patrol', 'The patrol takes the kid and pays a finder’s fee. Nobody on the crew speaks to you for a day.', cr(3), virtue(-1)),
        act('B) Find the kid a bunk', 'The kid’s name is Pip-Sorrel. They fix the galley’s water recycler the first night.', virtue(1), parts(1)),
      ),
    ]),
    dogfight('hd-tollpickets', 'Toll Pickets', 'Combine pickets guard the approach to Glasshouse, checking every hull number against a list. Yours is on it.', {
      craft: ['hd_picket', 'hd_picket'],
      rounds: 3,
      intro: '“Halcyon Debt, you are flagged for collection.”',
      winText: 'The pickets scatter, and you slip into the station’s traffic.',
      loseText: 'You make it into traffic, trailing smoke.',
      win: [cr(4)],
      lose: [dmg(2)],
    }),
    page('hd-glasslights', 'Glasshouse Lights', 'station', 'From the docking ring, Glasshouse looks like a chandelier hung in space. Every window is a bank.', [
      step(undefined, chk('Talk your way into a berth', 'cha', ['social'], ['They charge you double for the berth.', cr(-3)], 'The berth clerk waves you through without looking up.', DC)),
    ]),
    haven('hd-undercity', 'The Undercity', 'inn', 'Under the mirrors, Glasshouse has a darker ring: bars, flophouses and people who move money the Combine doesn’t see. You take rooms above a noodle shop.', {
      shop: { items: [...SHOP_EARLY, { id: 'hd_charmstim', price: 3 }] },
      icons: [{ kind: 'pickpocket', x: 62, y: 70 }],
    }),
  ]),
]
