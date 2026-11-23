# ADR 0003: Frontend structure for accounts, store and public pages

- Status: Accepted (engine extraction implemented; the rest are decisions for follow-up issues)
- Issue: #24 (Evaluate: Frontend). Related: #1 (Discord bot), #2 (accounts), #3 (store), #5 #6 #7 #8 #18 #19 (SEO, landing, legal)
- Date: 2026-11-23
- Note: ADR 0002 moves the site to a custom root domain. Until that cutover the `/questender/` sub-path rules below apply; afterwards `base` becomes `'/'` and `BASE_URL`-based paths keep working unchanged.

## Context

Questender is a Vite 8 + React 19 + TypeScript 7 single page with no router. State lives in `App.tsx` and `src/ui/*`. `src/engine/` is a pure game engine (no React, DOM or storage). The next phase adds public pages (landing, privacy, terms, 404, thank you), accounts, a store, a Discord bot and Lambdas that must run the same engine to release pages by real date (#3).

The app is deployed to GitHub Pages under a sub-path (`/questender/`), built with relative asset paths (`base: './'`).

## Decision

### (a) Public pages: Vite multi-page build for static pages, game stays a single-page React app

Options compared:

| Option | SEO / link previews | Cost | Verdict |
|---|---|---|---|
| Router SPA (React Router / TanStack Router) | Poor. Every route serves the same `index.html`, so titles, descriptions and OG tags (#5, #6) are set by JS that crawlers and link unfurlers (Discord, Slack) mostly do not run. Needs prerendering to fix. On GitHub Pages, deep links 404 unless we add a `404.html` hack. | Low to start, then a prerender plugin | Rejected |
| Vite multi-page build (`build.rollupOptions.input` with several `.html` files) | Good. Each page is real static HTML with its own `<title>`, description and OG tags in the file. Zero extra framework. Works on GitHub Pages and S3/CloudFront. | Very low. Same toolchain, same CSS tokens. | **Chosen** |
| Astro for marketing + React island for the game | Excellent, and nice content authoring (Markdown for legal pages). | A second framework, second build, shared design tokens across two systems, and island hydration for the game gains nothing. | Rejected for now; revisit if marketing grows beyond about 10 content pages or needs a blog |

Plan:

- `index.html` becomes the landing page (static HTML, CTA above the fold per #7, no JS needed to render it). The game moves to `play/index.html` (same React entry, `src/main.tsx`). Returning players with saves are redirected to `play/` by a few lines of inline JS on the landing page.
- `privacy.html`, `terms.html`, `404.html`, `thank-you.html` are static HTML sharing one small stylesheet. They do not load React.
- Pages that need runtime behaviour but are not the game (sign-in callback, store, account) are additional React entry points, not router routes. Inside the game there are still no URLs; tabs and views stay state-driven.
- Client-side routing is not needed. If the store later needs deep links (`/store/<campaignId>`), add a router inside that one entry only (TanStack Router or React Router), not app-wide.
- All asset paths remain relative or `import.meta.env.BASE_URL`-based so the `/questender/` sub-path keeps working.
- `<title>` and `<meta name="description">` for static pages live in their HTML files. In-game views set `<title>` via React 19 document metadata.

### (b) State management: plain React plus a thin async layer, adopt TanStack Query when the first server call lands

- The game state is a synchronous reducer over a pure engine (`reduce`, `initialState`). Keep it as is: `useReducer` + context where prop drilling hurts. Zustand and Redux add nothing here and would fight the reducer model.
- Server data (cloud saves #2, catalog and entitlements #3, released pages) is a different kind of state: cached, refetched, can fail, can be stale. Adopt **TanStack Query** (about 13 kB gzip) at the moment the first real API call is added, not before. Reasons: dedupe, retry, cache, offline-aware refetch, and mutations (purchase, save sync) with invalidation. Rejected: hand-rolled `useEffect` fetching (re-implements the above badly), SWR (fewer mutation tools), Zustand (not a server cache).
- Boundary rule: engine functions stay synchronous. Async code fetches data (packs, pages), puts it in a runtime registry, then calls the engine. The reducer never awaits. Saves remain the source of truth locally (`save.ts`); cloud sync reconciles on top of it.
- No query library is added in this change.

### (c) Monorepo: npm workspaces, `packages/engine` now, `apps/web` later

- **Tooling:** npm workspaces. Rejected pnpm/turbo/nx for now: two or three packages, one CI job, builds take under a second. Turbo's caching pays off with several slow builds; revisit when the bot and Lambdas have their own build and test pipelines. npm workspaces keep `npm ci` and the GitHub Pages workflow unchanged.
- **Package `@questender/engine`** (`packages/engine`): contains `src/engine/` (rules, calendar, desk, dice, rng, combat, state, campaign registry) **and** `src/content/` (the bundled free campaigns: Halcyon, Brightwatch, Ember Road, Starwake and shared hero/item/ability/enemy definitions). Content is in the same package because they are mutually dependent today: `engine/content.ts` and `engine/campaign.ts` import the campaign registry, and campaign files import calendar helpers and types from the engine. Splitting them into two packages would create a package-level cycle. Keeping the relative layout (`src/engine`, `src/content`) also meant zero edits inside the package.
- **Licensed or paid content must never be in this repo or this package.** Anything sold under #3 (and any licensed partner content) lives in a private store (S3 packs, or a separate private repo) and reaches the engine as JSON at runtime. This is what #3 already requires: `Campaign` becomes pure JSON and the campaign registry becomes a runtime registry. The follow-up that makes this possible is: replace the static `CAMPAIGNS` import in `engine/content.ts`, `engine/campaign.ts` and `engine/vehicle.ts` with `registerCampaign(pack)` / `registerContent(pack)`, with the bundled free campaigns registered from a separate entry (`@questender/engine/content/bundled`). After that, the engine core can be published or consumed without any content, and the bundled free campaigns can optionally move to `packages/content-free`. Until then the package contains only original, free, public-repo-safe content, and the only content in `packages/engine/src/content` is that.
- **Public surface:** subpath exports, not a barrel. `@questender/engine/<module>` maps to `src/engine/<module>.ts`; `@questender/engine/content` is the engine's id-lookup registry; `@questender/engine/content/campaigns` and `@questender/engine/content/<file>` map into `src/content/`. Consumers import TypeScript source directly (no build step for the package): Vite and vitest transpile it, and the bot and Lambdas can use `tsx`/esbuild. If a compiled artifact is needed (Lambda zip size), add a build then, not now.
- **Purity is enforced.** `tests/engine-purity.test.ts` fails if any file in the package imports React, the web app (`ui`, `sound`, `save`, `theme`, `App`), or touches `localStorage`/`document`/`window`. `npm run typecheck:engine` type-checks the package with `lib: ES2023` and no DOM lib, so DOM types cannot sneak in. `types: ["node"]` is used because `structuredClone` is a runtime global in Node and browsers but is not in the ES lib.
- **Web app stays at the repo root for now** (not moved to `apps/web`). Moving it would touch `index.html`, `public/`, `vite.config.ts`, the tsconfigs, `tests/` and `.github/workflows/pages.yml` (the `dist` path), and rewrite history-visible paths for every file in `src/`, all of which conflicts with in-flight work on CSS and CI. The extraction already delivers the value (bot and Lambdas can depend on the engine). Move to `apps/web` as its own mechanical commit when the Discord bot (`apps/bot`) lands, since a symmetrical `apps/*` layout only matters once there is more than one app.
- **Tests** remain in the root `tests/` for now (they mix engine and UI tests; vitest picks them up from the root, so CI is unchanged). Engine-only tests can move to `packages/engine/tests` later.
- Target layout:

```
packages/engine/     @questender/engine (rules + bundled free content, no DOM)
apps/web/            current Vite/React app (move later; at repo root today)
apps/bot/            Discord bot (#1)
services/            Lambdas for entitlements and page release (#3), importing @questender/engine
```

### (d) PWA / offline: yes, but later and narrowly

- Value is real for a daily game (open the desk on a train), and #3 already plans an IndexedDB page cache. Static game assets and already-released pages can be cached.
- Do it after the multi-page split and accounts: a service worker that precaches the shell, `play/` and the bundled campaigns, with a network-first strategy for API and landing pages. Use `vite-plugin-pwa` (Workbox) rather than a hand-written worker.
- Prerequisites are cheap and worth doing now: `site.webmanifest`, icons and `theme-color` (#8). A service worker is not added until the manifest and sub-path scope are verified, because a mis-scoped worker on `/questender/` is hard to remove.
- Cache rules: never cache or serve unreleased pages from the client (no future peeking); offline "today" must still come from the device clock plus the server-validated released set once accounts exist.
- Decision: manifest and icons now (#8), service worker as a separate issue after #2.

### (e) Accessibility and performance budgets

Measured with Lighthouse CI (mobile profile, throttled) against the built `dist`, run in a CI job after the build.

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Landing and static pages | >= 95 | 100 | >= 95 | 100 |
| Game (`play/`) | >= 85 | >= 95 | >= 95 | n/a |

Concrete budgets:

- Static pages: no JavaScript required to render; total transfer under 100 kB; LCP under 2.0 s; CLS under 0.05.
- Game: initial JS under 350 kB gzip (it is about 324 kB gzip as a single chunk today, over 1 MB raw). Split the campaign content into lazily loaded chunks per campaign (dynamic `import()`), which also fits #3's runtime registry. Target LCP under 2.5 s and INP under 200 ms on a mid-range phone.
- Fonts: self-host with `font-display: swap` instead of the Google Fonts CDN (privacy page #18 is simpler, and it removes a render-blocking third party).
- Accessibility: WCAG 2.2 AA. Visible focus, full keyboard operation of the desk and dice, 44 px touch targets, colour contrast checked in both themes, `prefers-reduced-motion` respected (page turn and dice animations), dice results and log announced via `aria-live`. Add `eslint-plugin-jsx-a11y` equivalent rules to oxlint (`jsx-a11y` plugin) and `vitest-axe` checks on key components.
- Budgets are enforced in CI as warnings first, then as failures once the landing page exists.

## Consequences

- Done in this change: `@questender/engine` workspace package, imports rewritten to `@questender/engine/...`, purity test, engine typecheck script. Behaviour, UI and CSS are untouched.
- The bot (#1) and Lambdas (#3) can depend on `@questender/engine` directly. Until the registry refactor lands, they get the bundled free campaigns with it and cannot load packs at runtime.
- GitHub Pages workflow: `npm ci`, `npx vitest run` and `npm run build` with `path: dist` all still work unchanged (verified locally). With the multi-page split, `dist` will contain several HTML files and still deploys as is.

## Follow-up issues

1. Runtime campaign/content registry (`registerCampaign`), split bundled content entry; prerequisite for #3 packs and for removing content from the engine core.
2. Landing page and static pages as Vite multi-page inputs; move the game to `play/` (#5, #6, #7, #18, #19, 404, thank you).
3. Favicon, manifest and theme-color (#8), then service worker via `vite-plugin-pwa`.
4. Self-host fonts; lazy-load campaign chunks.
5. Add TanStack Query with the first API call (#2 cloud saves).
6. Lighthouse CI and axe checks, warn-only first.
7. Move the web app to `apps/web` together with the bot scaffold (#1).
