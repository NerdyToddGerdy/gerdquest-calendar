# Changelog

All notable changes to Questender. Versions follow [Semantic Versioning](https://semver.org/);
the format follows [Keep a Changelog](https://keepachangelog.com/).

The player-facing version of this list is `src/changelog.ts`, shown under
Settings → What's new. Add every release to both, and bump `package.json`
(a test checks that it matches the newest entry in `src/changelog.ts`).

Versions before 0.5.0 were reconstructed after the fact from the code.

## [0.10.0] — 2026-11-24

### Changed
- Renamed the game from Questender to **GerdQuest Calendar**: page titles, landing, legal pages,
  manifest (`short_name` GerdQuest), share image, README, export file names (`gerdquest-…json`).
- The repository is now `NerdyToddGerdy/gerdquest-calendar` and the site moved to
  `https://nerdytoddgerdy.github.io/gerdquest-calendar/` (`SITE_URL`/`SITE_BASE` defaults, e2e
  server path). Saves are unaffected: browser storage is per origin and the storage keys, bundle
  format and the internal `@questender/engine` package name are unchanged.

## [0.9.0] — 2026-11-24

### Added
- The Verdant Accord chapters 5–8 (May–Aug): Highmarrow Burns, The Saltward Passage, The Ashen
  Isle, The Kindling Height. 208 pages; chapters 7–8 decide their legacy by a choice step;
  catalog marks the campaign as partial (#57).
- Return rewards and achievements (#56): per-campaign days played (no streaks), themed keepsakes
  and looks (page edge, paper, dice) at milestones, "Well rested" return boon, a weekly chest,
  19 achievements on a new Shelf tab, toasts. Data-driven cosmetics registry.
- Avatar tokens (#56): hero portrait close-ups earned by playing a hero, themed borders from
  campaign milestones, picker next to Settings; stored in the device progress record and Export all.
- Playwright end-to-end suite and `e2e` CI job against the production build under `/questender/`;
  test-only `?today=` pin compiled out of the Pages build (#53).
- `docs/PRINCIPLES.md` and root `CLAUDE.md`: no microtransactions; campaigns are the only
  potential revenue (#55).

### Changed
- Accessibility: hidden finds labelled neutrally, dice faces announced, jsx-a11y lint rules,
  image/svg naming test (#52). Dependabot ignores @types/node majors.
- Verdant review fixes: legacy mark when a hero wins and falls in the same fight, neutral
  locked-option label, chapters 1 and 4 softened (#54).

### Fixed
- Pip's shared pickpocket ability moved to base content (Verdant crashed without Ember Road loaded).
- The desk no longer freezes when the viewed date is past a finished campaign's last page (#57).

## [0.8.0] — 2026-11-24

### Added
- The Verdant Accord (`campaigns/verdant`): chapters 1–4 of a 12-chapter legacy campaign, with
  legacy marks that later options can require (`meetsRequirement`) (#46).
- The Starwake runs a full year: October–December, finale, levels 7–8, 14 new enemies and bosses,
  followers Ismay Tolliver and Hallam Marrow (#49).
- Static landing page at the site root; the game moved to `play/` (Vite multi-page build per
  ADR 0003). Returning players with saves are redirected; `?stay` keeps the landing page.
  Custom `404.html`, per-page titles and descriptions, Open Graph/Twitter tags and `og.png`,
  generated `robots.txt` and `sitemap.xml` (`SITE_URL`/`SITE_BASE` for the custom domain),
  sticky mobile CTA (#47).
- `privacy.html` and `terms.html` (v1.0), linked from the landing page, 404 and Settings (#48).

### Changed
- Balance pass 2: weaker heroes strengthened (Pell, Ysolde, Marisol, Kit, Corin, Hask), late
  Brightwatch rewards trimmed and Oct–Dec upgrades added, stronger Ember Road and Brightwatch
  finales; simulator gains a per-hero table (#50).
- Web app manifest `start_url` is now `./play/` (#47).

## [0.7.0] — 2026-11-24

### Added
- Runtime campaign registry (`registerCampaign`, `registerCatalog`, `registerCampaignLoader`,
  `loadCampaign(s)`, `registerContent`) and lazily imported campaign packs: each campaign has a
  small catalog entry (`meta.ts`) and its pages/content load on demand via
  `@questender/engine/content/bundled`. Main JS 1,018 kB → 427 kB (#42, refs #3 #15).
- Web app manifest and icon set, `theme-color` and Apple web-app tags; no service worker yet
  per ADR 0003 (d) (#41, closes #8).
- Persistent storage request (`navigator.storage.persist()`), storage status in Settings, and a
  snoozable backup reminder on the desk (`src/backup.ts`, `src/deviceStorage.ts`) (#41).
- Balance simulator (`packages/engine/src/sim/`, `npm run sim`) and `docs/balance/REPORT.md` (#44).

### Changed
- › advances when the selected campaign is done with the viewed date; other campaigns may lag
  and show "N behind" (`canGoForward`, `pagesOwed` in `desk.ts`) (#40).
- Enemy numbers retuned across all four campaigns from simulator results (#44).
- Followers add +1 to a skill the hero already has instead of nothing (#43).
- Halcyon Surge and Charges are point pools; the death table's drain also empties pools (#43).
- Contrast fixes in the light theme (accent, muted, good) and for band labels (#43).

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
