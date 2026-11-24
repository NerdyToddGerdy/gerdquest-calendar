# GerdQuest Calendar: notes for Claude

Read `docs/PRINCIPLES.md` before designing features. In particular:

- **No microtransactions.** Never add paid skins, cosmetics, currencies,
  boosts, loot boxes or pay-to-skip features. Cosmetics (dice, papers, edges,
  avatar tokens, borders, keepsakes) are earned only by playing.
- **The only possible future revenue is buying campaigns** (issue #3). A
  purchased campaign never sells cosmetics or advantages.
- All story, characters, art and names are original to GerdQuest Calendar; never
  reuse third-party content (use only the *structure* of reference material).

Workflow and architecture: `docs/adr/` (trunk-based PRs with CI, the engine
package, lazy campaign packs). Balance tooling: `docs/balance/REPORT.md`.
