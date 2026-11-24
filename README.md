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
npm run test:e2e   # end-to-end tests (Playwright, Chromium)
```

### End-to-end tests

`tests/e2e/` drives the production build in Chromium, served under `/questender/`
like GitHub Pages. `npm run test:e2e` builds into `dist-e2e/` (with
`VITE_E2E=1`, which turns on a `?today=YYYY-MM-DD` date pin that is compiled out
of the normal build), starts `tests/e2e/serve.mjs`, and runs the specs. Setup:

```sh
npx playwright install chromium          # once
npm run test:e2e                         # all specs
npx playwright test -c tests/e2e/playwright.config.ts --ui   # debug
E2E_SKIP_BUILD=1 npm run test:e2e        # reuse an existing dist-e2e/
E2E_CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run test:e2e   # local Chrome instead
```

Failed runs keep a trace (`npx playwright show-trace test-results/<test>/trace.zip`);
CI uploads `playwright-report/` and `test-results/` as an artifact. The `e2e` job
in `.github/workflows/ci.yml` runs on pull requests and before every Pages deploy.

Pushing to `main` deploys to GitHub Pages via `.github/workflows/pages.yml`.
