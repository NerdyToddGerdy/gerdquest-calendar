# Changelog

All notable changes to Questender. Versions follow [Semantic Versioning](https://semver.org/);
the format follows [Keep a Changelog](https://keepachangelog.com/).

The player-facing version of this list is `src/changelog.ts`, shown under
Settings → What's new. Add every release to both, and bump `package.json`
(a test checks that it matches the newest entry in `src/changelog.ts`).

Versions before 0.5.0 were reconstructed after the fact from the code.

## [0.6.1] — 2026-11-23

### Changed
- Desk arrows skip dates that only continue a page every campaign is already on
  (`nextDeskDate`, `prevDeskDate`, `deskSpanEnd` in `src/engine/desk.ts`), so a weekend page
  is one stop. › turns pages for every date it passes (`turnThrough`) and stays disabled until
  a new page exists after the range. The datebar shows the range ("Sat, Jan 3 – Sun, Jan 4").

## [0.6.0] — 2026-11-23

### Added
- Character portraits (`src/ui/portraits/`): a parametric SVG figure (build, clothing, hair,
  headwear, held item) and creature shapes (beast, bird, serpent, crab, construct, ghost,
  machine, plant, ship, fog, host). Looks for every hero and boss live in `specs.ts`.
- `Portrait` and `SceneActor` (`src/ui/Portrait.tsx`), shown on hero cards, the hero preview,
  the hero sheet and in page scenes (hero left; a lone boss on the right, mirrored).
- Imported artwork: an image in `src/assets/portraits/` named after a character id overrides
  the drawing everywhere (`src/ui/portraits/art.ts`).
- `tests/portraits.test.tsx`: every hero and boss has a portrait.

## [0.5.0] — 2026-11-23

### Added
- Settings menu (`src/ui/Settings.tsx`), opened from ⚙ in the header: Appearance, Your data
  (Import, Export all) and What's new.
- Light theme: `data-theme` on `<html>` (`system` / `light` / `dark`), stored as
  `questender.theme`; light colors in `src/index.css`.
- In-app changelog (`src/changelog.ts`) with an unseen-release dot on the ⚙ button
  (`questender.seenVersion`).

### Changed
- The calendar layout switch (Month / Wall / Week / Year) moved from `CalendarView` into the
  header beside Day / Calendar. `CalendarView` accepts a controlled `view` / `onView`.
- Import and Export all moved from the header into Settings. Per-campaign Export stays on
  each campaign's tools row.

## [0.4.0] — 2026-11-23

### Added
- Campaign: The Starwake (`src/content/campaigns/starwake`), Months 1–9 (234 pages, Jan 1 –
  Sep 30 2022, classic rules) with six heroes, levels 2–6, six followers and 36 enemies.
- 15 Starwake scenes (`src/ui/scenes/starwake.tsx`).
- `tests/starwake.test.ts`: calendar shape, content integrity, scenes and a seeded playthrough
  per hero.

## [0.3.0] — 2026-11-23

### Added
- Calendar view (Month, Wall, Week, Year) with page statuses, player entries, holidays and moon
  phases (`src/engine/almanac.ts`, `src/calendarNotes.ts`).
- Per-campaign Notes, saved and exported with the run.
- Hero preview, item tooltips, dice sounds with a mute toggle.

## [0.2.0] — 2026-11-22

### Added
- The desk: several campaigns at once on a shared date, each anchored to a real start date
  about a week back, with future pages locked.
- Rulesets: modern, classic (pools, followers) and frontier (ships, crew, dogfights).
- Campaigns: The Ember Road (classic) and The Halcyon Debt (frontier).
- Export all / Import of every campaign in one file.

## [0.1.0] — 2026-11-22

### Added
- First playable version: The Lamp at Brightwatch, one page per day with choices, d20 checks,
  combat, shops, level-ups, and save/export/import.
