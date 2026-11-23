# ADR 0002: Hosting and deployment

- Status: Proposed
- Date: 2026-11-23
- Issue: #28. Related: #1 (Discord bot), #2 (accounts), #3 (paid campaigns), #4 (404), #9 (robots.txt), #10 (sitemap), #22 (contact address), #31 (security)
- Reconciled with ADR 0004: the backend is built with CDK (Cognito + API Gateway + Lambda + DynamoDB), not Amplify Gen 2. Amplify is used for **hosting only**. Read "Gen 2" backend references below as "the CDK backend from ADR 0004"; per-branch backends and `amplify_outputs.json` are replaced by CDK stacks per environment whose outputs (API URL, user pool ids) are passed to the build as `VITE_*` variables.

All prices below are approximate, in USD, deliberately conservative, and not looked up. Check current AWS/registrar pricing before committing.

## Context

Questender is a static Vite + React + TS app. Today it is a GitHub Pages project site (`nerdytoddgerdy.github.io/questender/`) deployed by `.github/workflows/pages.yml` (tests, build, deploy on push to `main`). `vite.config.ts` builds with `base: './'`.

Planned: an AWS backend (Cognito + DynamoDB + Lambda, likely Amplify Gen 2), Google sign-in, Stripe for paid campaigns, and later a Discord bot.

What Pages cannot do, and the roadmap needs:

- No custom response headers: no CSP, HSTS or `frame-ancestors` (#31).
- `robots.txt` and `sitemap.xml` only work at a domain root (#9, #10). A project site lives under `/questender/`, so they are ignored.
- No redirects or rewrites; only a root `404.html` (#4).
- No PR previews, no staging environment.
- A same-origin story for the backend needs a domain we control (cookies, CORS, Cognito domain, Stripe return URLs, support email on the same domain per #22).
- Sharing an origin with `nerdytoddgerdy.github.io` means sharing it with every other project site of that account: `localStorage` (where saves live today) is per-origin, so any other project site on that user domain could read the saves. A dedicated domain fixes this.

Existing observation: `index.html` references `/favicon.svg` (absolute), which already resolves to `github.io/favicon.svg`, not the project path. The favicon is broken on the current site. A root domain fixes it for free.

Current external requests (grep of `src/` and `index.html`): only Google Fonts (`fonts.googleapis.com` stylesheet, `fonts.gstatic.com` font files). No `fetch`, WebSocket, analytics or third-party scripts. React components use inline `style={...}` attributes.

## Options

Scored against the criteria. "OK" means acceptable with no extra work.

| Criterion | GitHub Pages | CloudFront + S3 (CDK) | Amplify Hosting | Cloudflare Pages |
|---|---|---|---|---|
| Custom domain, root robots/sitemap | Yes with a custom domain (needs a domain anyway) | Yes | Yes | Yes |
| Security headers (CSP, HSTS) | No | Yes (response headers policy) | Yes (`customHttp.yml` or console) | Yes (`_headers`) |
| Redirects / SPA fallback / 404 | 404.html only | Yes (CloudFront Function or error responses) | Yes (rewrite rules, console/API) | Yes (`_redirects`) |
| PR preview deploys | No | DIY (per-PR stacks or path prefixes; real effort) | Built in (web previews via the GitHub app) | Built in |
| Cost at hobby scale | Free | Approx. $0.50-2/mo plus domain | Approx. $0-3/mo plus domain | Free |
| Fit with an AWS backend | Poor (cross-origin, shared origin) | Best (same account, CDK stacks) | Native (same Amplify app and branch environments) | Good but a second vendor, IAM/secrets split across two clouds |
| CI deploy via GitHub OIDC | Built in | Yes, OIDC role to run `cdk deploy` and `s3 sync` | Not needed: Amplify's GitHub app builds on push. (Manual deploy via OIDC is possible but unusual.) | Wrangler plus an API token (no OIDC to Cloudflare) |
| Rollback | Re-run old workflow / revert | Redeploy old artifact, or versioned bucket | One click "redeploy" of any past build | One click per deployment |
| Operational burden | None | Highest (distribution, OAC, certs, functions, cache invalidation) | Low | Low |

Netlify and Vercel: equivalent to Cloudflare Pages for this app (headers, redirects, previews, generous free tiers) but add a third vendor with no benefit over it, and their commercial/bandwidth terms are less favourable for a project that may sell content. Rejected.

### Option A: stay on GitHub Pages

Zero cost and zero work, and it can take a custom domain (fixing robots/sitemap/origin). But it cannot send headers, so #31 (CSP, HSTS, `frame-ancestors`) is unachievable, and it offers no preview or staging. A Stripe and login app without CSP is a weak position. Acceptable only as the pre-launch status quo.

### Option B: CloudFront + S3 via CDK

Maximum control and the "purest" AWS fit. We would own the S3 bucket with Origin Access Control, a CloudFront distribution, an ACM certificate in `us-east-1`, a response-headers policy, a function for rewrites, a GitHub OIDC role, and cache invalidation. PR previews are the sore point: no off-the-shelf solution, so we would build one. For a solo hobby project this is a lot of undifferentiated infrastructure. It remains the right escape hatch if Amplify Hosting's limits ever bite (the header values port directly to a response-headers policy).

### Option C: Amplify Hosting (recommended)

Managed CloudFront + S3 behind a build pipeline. It provides custom domains with managed certificates, custom headers, rewrites, PR web previews, branch deployments (staging), one-click rollback, and it lives in the same Amplify app as the Gen 2 backend (#2), so each branch gets a matching backend environment and a generated `amplify_outputs.json`. Limits to keep in mind:

- It builds in its own pipeline rather than GitHub Actions, so the test gate moves into `amplify.yml` (`preBuild: npm test`). This also keeps the pipeline out of `pages.yml`.
- Preview URLs are `*.amplifyapp.com`. Cognito does not allow wildcard callback URLs, so sign-in cannot work on arbitrary PR previews. Previews are for UI review; auth is tested on the fixed staging domain.
- Less control over cache behaviour than raw CloudFront. Fine for a small static app.
- Pricing is per build minute, per GB served and stored (all small here); there is a free tier for the first year on new accounts.

### Option D: Cloudflare Pages

Best free tier and excellent previews and headers. Rejected as the primary host because it splits the stack: DNS, certificates and hosting on Cloudflare, auth, API and data on AWS, two sets of secrets and deploy credentials, and no GitHub OIDC to Cloudflare. If AWS were not already the backend this would win. (Cloudflare remains a fine choice purely as a registrar, see DNS.)

## Decision

**Move to a custom root domain on AWS Amplify Hosting, with Route 53 for DNS, and keep GitHub Pages only until cutover.** The backend is a separate CDK app (ADR 0004); Amplify Hosting only serves the frontend.

Reasons: it is the only option that gives headers, redirects, previews, staging branches and rollback with near-zero ops, while matching the stated AWS backend. The one significant trade-off (no wildcard Cognito previews) is shared by every option.

### DNS

Route 53 for the hosted zone (approx. $0.50/month per zone plus negligible query charges). Reasons: apex alias records work, Amplify and ACM can create validation records automatically, and Cognito's hosted-UI custom domain (`auth.<domain>`) and an `api.<domain>` for the backend sit in the same console. Cloudflare DNS also works (CNAME flattening, manual validation records), so it is a defensible alternative, but it gives up the automation. The registrar can be anyone; the registrar only needs its nameservers pointed at the Route 53 zone.

Domain layout:

- `<domain>`: production app (Amplify `main`)
- `staging.<domain>`: Amplify `staging` branch
- `auth.<domain>`: Cognito hosted UI (needs an ACM cert in `us-east-1` and a working parent record)
- `api.<domain>`: API Gateway / AppSync / Function URL custom domain
- `support@<domain>`: mail (#22), via a forwarding service or SES receiving, decided in #22

All app and API hosts share the registrable domain, so they are same-site: cookies set with `Domain=<domain>` work and CORS is a short allow-list. The first version should use bearer tokens from Cognito rather than cookies, which sidesteps CSRF concerns; revisit in #2/#31.

### Environments

| Env | Frontend | Backend | Notes |
|---|---|---|---|
| local | `vite dev` at `/` | Gen 2 per-developer sandbox (`npx ampx sandbox`) | No shared state, own Cognito pool and tables |
| staging | Amplify branch `staging`, `staging.<domain>` | Amplify branch backend (own Cognito pool, tables) | Stripe test mode, Google OAuth test client, Discord test app |
| prod | Amplify branch `main`, `<domain>` | Amplify branch backend | Stripe live, DynamoDB point-in-time recovery on |

Config and secrets: Vite `VITE_*` variables are public by design, so only non-secret values (API URLs, pool ids) go there; Gen 2 emits `amplify_outputs.json` per branch for these. Secrets (Stripe keys, Google client secret, Discord token and public key) live in Amplify Gen 2 secrets (SSM Parameter Store under the hood) or Secrets Manager (#31), never in the repo. Start with one AWS account and separate resources per branch; move prod to its own account (AWS Organizations) once real payments flow. Root account MFA from day one.

### Rollback

- Frontend: Amplify keeps each deployment; redeploy a previous build in the console (seconds), or `git revert` on `main`.
- Backend: Gen 2 is infrastructure as code, so rollback is `git revert` and redeploy. DynamoDB: enable PITR on prod; take an on-demand backup before any schema migration. Save-file JSON carries a version field so old clients and new data can coexist (also see #2).

### Discord bot hosting (#1)

- **Start with interactions-only (HTTP webhook) on Lambda.** Slash commands and button presses are delivered as signed HTTPS requests; verify the Ed25519 signature on every request (Discord probes this). Cost is approximately zero at hobby scale and it reuses the same DynamoDB, so the bot and web share saves (#2).
- Mind the **3-second deadline**: reply within 3s or the interaction fails. For anything slow (cold start plus DynamoDB plus engine), immediately respond with a deferred type (`DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE` or `DEFERRED_UPDATE_MESSAGE` for buttons), then finish via the interaction webhook (follow-up valid for 15 minutes). Combat rounds from the engine are cheap and will normally fit in the first response. Use a Function URL or API Gateway; keep the function small and consider provisioned concurrency only if cold starts become a problem.
- **Only if we need a gateway connection** (message content, presence, voice, member events, live status): an always-on process is required. Options by increasing effort: Fly.io or a small Lightsail instance (approx. $4-7/mo, simplest), App Runner (approx. $5-15/mo, handles deploys but charges for always-warm), ECS Fargate (approx. $9+/mo for the smallest task, most AWS-native, most setup). Prefer Lightsail or Fly.io first. None of the commands in #1 need the gateway.
- The issue proposes SQLite; that does not fit Lambda (no durable local disk). Use DynamoDB (#2). SQLite only makes sense on an always-on gateway host.
- Deploy via GitHub Actions with an OIDC role (no long-lived AWS keys) for the bot and its command registration, independent of the web app.

## Migration plan

Do these in order. Nothing breaks the live Pages site until step 7.

1. **Decide and buy the domain**, and create the AWS account with root MFA and a billing alarm (see "Decisions" below).
2. **Create a Route 53 hosted zone** and point the registrar's nameservers at it (if registered elsewhere). Wait for propagation.
3. **Create the Amplify app** connected to the GitHub repo via the Amplify GitHub app, for branches `main` and later `staging`. Add `amplify.yml` and `customHttp.yml` (drafts in `infra/amplify/`, copy to the repo root). Do this in a PR; Pages keeps deploying meanwhile. Gate the first deploy by manually building a branch in the Amplify console.
4. **Change `vite.config.ts` base** (see below) in the same PR so the Amplify build works at the domain root.
5. **Ship CSP as `Content-Security-Policy-Report-Only` first**, browse every screen (desk, calendar, combat, changelog), then enforce. Expect one violation class to check: inline `style=` attributes (covered by `style-src-attr 'unsafe-inline'`). If you want to drop that later, move inline styles into CSS classes.
6. **Attach the custom domain** in Amplify (apex and `www` redirect), wait for the managed certificate. Add `public/robots.txt` and the generated `sitemap.xml` (#9, #10), custom `404.html` (#4), and the contact address (#22). Enable the web previews feature for PRs.
7. **Cut over and retire Pages.** Replace the Pages deployment with a final tiny page (`<meta http-equiv="refresh">` plus link to the new domain) in a last `pages.yml` change, then disable the Pages workflow. Note: old `localStorage` saves live on `nerdytoddgerdy.github.io` and are NOT readable from the new origin. Before cutover, ship an export/import (or a one-time "copy my saves to the new address" link using a URL fragment/`postMessage` handshake) in the Pages version, and announce it. Do not skip this: it is the only user-visible breakage.
8. **Follow-ups:** staging branch and domain; Gen 2 backend (#2); HSTS `preload` only after weeks of stable HTTPS on all subdomains; tighten CSP as Cognito/Stripe arrive (see comments in `customHttp.yml`).

### `vite.config.ts` base

Today: `base: command === 'build' ? './' : '/'`, so assets are relative and the game works under `/questender/`.

At a root domain, set the base to `'/'` for builds:

```ts
export default defineConfig({
  base: '/',
  plugins: [react()],
})
```

Why: relative bases break on any nested URL (the 404 page, #4, and any future `/privacy` route fetch `./assets/...` relative to the wrong directory), and `index.html` already uses the absolute `/favicon.svg`. With `'/'` everything resolves from the root everywhere.

During the overlap (steps 3 to 7) Pages still needs a sub-path build. Either make it explicit and flip it in step 7, e.g. `base: process.env.VITE_BASE ?? '/'` with the Pages workflow setting `VITE_BASE=/questender/` (a small `pages.yml` change, left to whoever owns CI), or simply do the base change in the cutover PR and accept that Pages is frozen on its last good build. The second is simpler and is the plan, since Pages is retired anyway.

## Starter config

Drafts only, not read by anything until copied to the repo root:

- `infra/amplify/amplify.yml`: build spec (npm ci, tests, build, `dist`).
- `infra/amplify/customHttp.yml`: HSTS, nosniff, referrer policy, permissions policy, cache headers and a CSP.

The starter CSP, for the app as it exists today:

```
default-src 'self';
script-src 'self';
style-src 'self' https://fonts.googleapis.com;
style-src-attr 'unsafe-inline';
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
object-src 'none';
upgrade-insecure-requests
```

Later additions are listed as comments in `customHttp.yml` (Cognito and API origins in `connect-src`, Stripe in `script-src`, `frame-src`, `form-action`). Google sign-in through the Cognito hosted UI is a top-level redirect and needs no CSP entry. `frame-ancestors` is only effective as an HTTP header, which is the reason it cannot work on Pages.

SPA fallback: the app has no client-side routes today, so no rewrite rule is needed. If routes are added, add an Amplify rewrite of extension-less paths to `/index.html` with status 200 (console or API, not `customHttp.yml`), or prefer static pages per route (privacy, terms) with the 404 handled by `404.html`.

## Decisions and actions for the owner

1. **Domain name.** Pick one yourself; a short, original, memorable `.com` (or `.app`/`.game`). Placeholders only, not suggestions to buy: `questender.example`, `embertally.example`, `daybook-quest.example`. Check trademark and availability. Approx. $10-20/year for `.com`, $12-30 for newer TLDs; the renewal price is often higher than the first year.
2. **Registrar.** Route 53 registration is simplest (one bill, auto-linked zone), usually slightly pricier. Cloudflare Registrar sells at wholesale cost and is a good alternative; you then point nameservers at Route 53. Avoid registrars with high renewals or upsells. Turn on auto-renew, registrar lock and 2FA.
3. **AWS account.** Create it with a dedicated email, enable root MFA (hardware key or authenticator), create an admin IAM Identity Center user rather than daily root use, and set a budget alarm (e.g. $10/month). Pick a primary region (a US or EU region close to players; note ACM certs for CloudFront/Cognito custom domains must be in `us-east-1`). Cost estimate at hobby scale: Route 53 zone approx. $0.50/month; Amplify hosting approx. $0-3/month; later Cognito (free tier covers a large number of monthly users), DynamoDB on-demand and Lambda pennies; Stripe has no monthly fee but takes a per-transaction fee. Rough steady state: under $5/month plus the domain, rising with traffic.
4. **Support email (#22).** Which provider handles `support@<domain>` (forwarding vs a mailbox), and the postal address to publish.
5. **Save migration.** Approve the one-time export/import or "copy saves" step before Pages is retired (step 7).
6. **Discord path.** Confirm interactions-only is enough for v1 (recommended); only choose an always-on host if a gateway feature is needed.
7. **When to cut over.** Anytime after the domain exists; independent of the backend work, and best done before accounts (#2) so Cognito callback URLs are set once against the final domain.

## Follow-up issues to open

- Buy domain, set up Route 53 and Amplify app, cut over from Pages (steps 1-7).
- Export/import or save-copy before retiring Pages.
- Enforce CSP (report-only first), then HSTS preload review.
- `robots.txt`, `sitemap.xml`, `404.html` on the new domain (#9, #10, #4).
- Staging branch and domain; environment config and secrets layout.
- Discord interactions endpoint on Lambda spike (#1).
