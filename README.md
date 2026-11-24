# Questender

A browser solo RPG played one page per day. Each campaign is a year of short
encounters — choices, d20 checks, fights, shops and level-ups — that unlock on
real calendar dates. You can't peek ahead, but you can always catch up.

**Play:** https://nerdytoddgerdy.github.io/questender/

## Campaigns

- **The Lamp at Brightwatch** — six trial heroes, then a year-long hunt for the Sevenfold Peal.
- **The Ember Road** — relight the waystones of a frozen road (classic rules: point pools, followers).
- **The Halcyon Debt** — pay off a ship's debt across a frontier (ships, dogfights, a weekly lottery).
- **The Starwake** — sail for the shards of a fallen star before a corsair-prince cages it (classic rules; a full year of pages).

Several campaigns can run at once on the desk; each starts about a week before
today so you get a few warm-up pages. Progress is saved in your browser. Import, Export all, light/dark mode and
“What's new” are in the ⚙ Settings menu; each campaign tab can also export
just that campaign. Release history is in [CHANGELOG.md](CHANGELOG.md).

All story, heroes and art are original.

## Development

```sh
npm install
npm run dev        # local dev server
npx vitest run     # tests
npm run lint
npm run build      # static build in dist/
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/pages.yml`.
