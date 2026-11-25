# ADR 0004: Backend platform (APIs, database, auth, cloud)

- Status: Proposed
- Covers: #25 (APIs and backend), #26 (database and storage), #27 (auth and permissions), #29 (cloud and compute), with input from #31 (security / RLS)
- Drives: #2 (accounts + cloud saves), #3 (purchasable campaigns), #1 (Discord bot)

## Context

Questender is a static Vite + React SPA. There is no backend. Saves are a JSON `GameState` in localStorage (`src/save.ts`), calendar notes live in `src/calendarNotes.ts`, and the engine (`src/engine/`) is pure TypeScript.

What the backend has to do:

1. Cloud saves (#2): Google sign-in now, Discord account linking later, per-user isolation, offline-first client with sync.
2. Paid campaigns (#3): entitlements written only by the server (Stripe webhook), and **server-side page release by date**. Players must never receive a future page. The server must run the same date logic as the client (`campaign.ts`, `desk.ts`).
3. Discord bot (#1): reads and writes the same saves, authenticated by Discord user ID, with a 3 s interaction deadline.
4. A solo developer maintains it. "Maybe with AWS" is a preference, not a requirement.

## Measured data: how big is a save?

`spikes/save-size.test.ts` plays every page of each campaign with the real reducer (`reduce`, always picking option 0, auto-confirming rolls, resting, then `NEXT_DAY`) until `finished`, then serializes the state. Run: `npx vitest run spikes/save-size.test.ts --reporter=verbose`.

| Campaign | Pages | Raw JSON | gzip | Journal share | Log (capped at 300) |
|---|---|---|---|---|---|
| brightwatch | 314 | 89.5 KB | 20.1 KB | 69.0 KB | 17.2 KB |
| emberroad | 313 | 95.6 KB | 19.6 KB | 72.9 KB | 19.7 KB |
| halcyon | 313 | 128.6 KB | 21.0 KB | 103.7 KB | 21.5 KB |
| starwake | 234 | 75.8 KB | 16.7 KB | 51.8 KB | 20.7 KB |

Findings:

- A fully played year is **76-129 KB raw, 17-21 KB gzipped**. That is 19-32 % of DynamoDB's 400 KB item limit, so ~3x headroom for the core state. The journal is 70-80 % of it (one entry per page); the log is capped at 300 entries.
- **The unbounded field is player notes** (`GameState.notes`, saved with the slot, no length cap in `Desk.tsx`). The spike's upper bound is 2 KB of notes on every page: 540-750 KB raw (20-26 KB gzipped because the text repeats). So a very diligent note-taker can break a 400 KB item, while a normal player cannot.
- Calendar entries are separate (`questender.calendar`, text capped at 500 chars per entry) and are not part of the slot.
- A player can hold several slots (one per campaign and start date), but each is its own item.

Conclusion: **400 KB is not a risk for the engine state but is a risk for notes.** Mitigations, cheap to do now:

1. Cap `notes` (e.g. 64 KB) in the UI and reject larger values server-side (#31 asks for server-side size validation anyway).
2. Store the save body gzipped as a DynamoDB binary attribute (about 20 KB), which also cuts write cost ~5x. (A Postgres `jsonb` column is compressed by TOAST automatically.)
3. Keep the body in a separate item from the slot metadata (see key design), so listing slots never reads bodies.
4. If notes ever need to be huge, move them to their own item (`NOTES#<slotId>`) or S3. Not needed yet.

## Options

- **A. AWS Amplify Gen 2**: Cognito + AppSync (GraphQL) + DynamoDB + Lambda, defined in TypeScript.
- **B. AWS hand-rolled**: Cognito + API Gateway HTTP API + Lambda + DynamoDB, with infrastructure in CDK (SST is an acceptable alternative).
- **C. Supabase**: Postgres + RLS + Supabase Auth (Google, Discord) + Edge Functions (Deno).
- **D. Firebase**: Auth + Firestore + Cloud Functions.

## Comparison

| Criterion | A. Amplify Gen 2 | B. AWS hand-rolled (CDK) | C. Supabase | D. Firebase |
|---|---|---|---|---|
| Google sign-in, Discord linking later | Cognito federation. Google built in; Discord is not a native Cognito provider, so it needs a custom OIDC/Lambda bridge. Linking two providers to one user needs `AdminLinkProviderForUser` in a pre-signup trigger. | Same Cognito story and same Discord workaround, but the trigger is plain Lambda code you own. | Google and Discord are both built-in providers. Manual identity linking is supported. Easiest of the four. | Google built in. Discord needs a custom token minted by a function. Linking is supported. |
| Per-user isolation | AppSync `allow.owner()` rules, generated for you. Convenient, but the rules live in schema and are easy to get wrong for non-GraphQL paths (bot, Lambdas). | Clients never touch DynamoDB. Every handler derives the key from the JWT `sub` (`USER#<sub>`). Enforced in one place and testable with plain unit tests. IAM `dynamodb:LeadingKeys` only matters if clients get direct credentials (we avoid that), so use it just as defense in depth. | Real Postgres RLS (`auth.uid() = user_id`). The strongest and most auditable model. | Firestore security rules. Good, but a separate rule language to test. |
| Server-only entitlement writes | Authorization on the `Entitlement` model: owner `read`, no client `create`/`update`. Writes via Lambda with IAM. Workable. | Trivial: no client route writes `ENTITLEMENT#`. Only the Stripe-webhook Lambda role has `PutItem` on it. | RLS: `select` policy for owner, no `insert/update` policy for `authenticated`. The webhook uses the service role in an edge function. | Rules deny client writes. Admin SDK in a function writes. |
| Server-side page release reusing the engine | Lambda via `defineFunction`, bundled with esbuild. Engine imports fine. | Same, with the least ceremony: a Node 22 Lambda bundles `packages/engine` directly. | Edge Functions are Deno. The engine is pure TS so it can be imported, but the bundling and import-map setup is a second toolchain, and the bot would still need Node. | Cloud Functions (Node). Works. |
| Discord bot access | Interactions endpoint as a Lambda function URL. The bot has to bypass AppSync (IAM) or call GraphQL with a service identity. Awkward. | Interactions endpoint is just another route/Lambda. Reuses the same repository module as the web API. Discord's 3 s deadline fits Node Lambda cold starts (~0.3-0.8 s) plus deferred responses. | Edge Function or any Node host using the service role. Works. | Cloud Function. Works. |
| Item/row size vs measured save | DynamoDB 400 KB. Fine at 76-129 KB, tight only with unbounded notes. AppSync also caps a response at 1 MB. | Same 400 KB. Fine with the mitigations above (gzip body, cap notes). | `jsonb` up to 1 GB, effectively no constraint. | Firestore 1 MiB per document. A bit more room than DynamoDB. |
| Cost at 100 / 1k / 10k MAU (approx., check current pricing) | ~$1 / $10 / $100. AppSync at ~$4 per million operations plus DynamoDB. Cognito is free under 10k MAU on current tiers. | ~$0-1 / $3-10 / $30-60. HTTP API $1/M requests, Lambda and DynamoDB on-demand, Cognito free under 10k MAU. Autosave debounced to page boundaries. | Free tier works but pauses inactive projects. Realistically Pro at $25/mo flat for 100 and 1k, ~$25-75 at 10k. | Spark has no functions. Blaze pay-as-you-go: ~$0-1 / $5-15 / $40-100. Firestore reads/writes dominate. |
| Lock-in | Medium-high: AppSync/GraphQL and Amplify conventions. It is CDK underneath, so you can eject. | Medium: DynamoDB and Cognito are sticky, but the API is plain REST, so the client never sees the vendor. | Low-medium: it is Postgres and the auth is OSS. Self-hostable. | High: Firestore and its rules. |
| Local dev | Cloud sandbox per developer (`ampx sandbox`) needs real AWS resources. No true offline emulator. | DynamoDB Local plus handlers as plain functions, tested with vitest. `cdk synth` needs no account. Fully offline loop. | `supabase start` runs everything in Docker locally. Excellent. | Emulator suite. Good. |
| Solo-dev effort | Lowest for pure CRUD, highest for the custom parts (Stripe, release, Discord), where you leave the abstraction. | Moderate: more up-front wiring (authorizer, routes, IAM) but all of it is ordinary, debuggable code. | Low for auth and data. Moderate for the engine in Deno. | Low for data, moderate for functions. |

### Notes on the hard requirements

- **#3 is mostly custom compute.** Checkout session creation, Stripe webhook, the date-checked page endpoint, and the Discord interactions endpoint are all Lambda-shaped code. Amplify's main benefit (generated CRUD over GraphQL) only covers slots, notes and settings, which are the simplest part. That weakens A.
- **Server is the clock authority.** The client's `today` comes from the player's device clock. For page release and for saves that claim progress, the server must compute "today" from the stored IANA timezone in `SETTINGS`, and reject a saved `dayIndex`/journal that is ahead of `isPageUnlocked(...)`. This also makes the bot safe (#1: "timezone per user").
- **Date release only protects paid packs.** The four bundled campaigns ship inside the JS bundle, so their future pages are already readable by anyone who opens devtools. Real enforcement applies to packs delivered from private S3 through the release endpoint (#3).
- **Discord linking on Cognito** is the weakest point of the AWS options. Plan for a small custom flow: the Discord OAuth callback Lambda verifies the code, then writes `DISCORD#<discordId>` to the signed-in user's `sub`. This is link-only (never a separate login) at first, which avoids duplicate accounts. It does not need Discord as a Cognito IdP.
- **Cognito vs others.** Cognito is the cheapest and keeps everything in one cloud. Its hosted UI is plain. Supabase Auth is nicer but only wins if we pick C.

## Decision

**Recommend B: Cognito + API Gateway HTTP API + Lambda + DynamoDB, defined in AWS CDK (TypeScript), in a separate `dev` and `prod` AWS account.**

Why, in order of weight:

1. The work that matters (entitlements via Stripe, date-release reusing the engine, Discord interactions) is Lambda code regardless of option. B makes that the main path instead of an escape hatch, and a plain REST API keeps the client free of any vendor SDK beyond Cognito sign-in.
2. Isolation is enforced in one small repository module keyed by JWT `sub`, with server-only entitlement writes by construction, and tested offline with DynamoDB Local. No client ever holds AWS credentials, so we don't need to design `LeadingKeys` conditions per session.
3. It honors the AWS preference, is the cheapest at every MAU level, and its cold-start profile fits Discord's 3 s deadline.
4. Amplify Gen 2 is CDK underneath, so choosing B does not close off adopting Amplify constructs later.

Runner-up and when it would win: **C (Supabase)** if solo-dev time matters more than staying on AWS, or if admin/royalty reporting (#26) needs relational queries soon. It has real RLS, built-in Discord login, and the best local dev. Its costs are an always-paid $25/mo plan and a Deno edge-function toolchain next to the Node engine. **The `SaveStore` seam (`src/saveStore.ts`) keeps this decision reversible**: the client only depends on the interface, so swapping the cloud implementation is a contained change. Rejected: D (Firebase) for the highest lock-in and no Discord support; A for the reasons in the notes above; container/Fargate (#25) for always-on cost with no benefit at this scale.

Other decisions folded in:

- **Compute (#29):** Lambda (Node 22, esbuild bundles) for API, Stripe webhook and Discord interactions (HTTP API route or function URL). EventBridge Scheduler + Lambda for daily reminders. No always-on Discord gateway process: slash commands and buttons all arrive as interactions. Region: one US region (`us-east-1` or `us-east-2`) unless the player base says otherwise; revisit for residency. AWS Budgets alerts at $10/$25/$50, root MFA, separate dev and prod accounts.
- **IaC (#25):** CDK. SST v3 is a reasonable alternative (nicer `sst dev`), but it adds a Pulumi/Terraform layer and a smaller maintenance base.
- **Types end to end (#25):** shared TypeScript request/response types (zod schemas) in `packages/api-types`, imported by both the client and the Lambdas. REST with a `/v1` prefix. Responses carry the save schema version so older cached clients can be refused or migrated.
- **Server migrations (#26):** the server stores `schema` on each slot and runs the same `normalizeState` (moved to the shared package) on read.
- **Packs (#26):** private S3 bucket (`packs/<campaignId>/<version>/`, versioning on); no public access; pages only through the release endpoint.
- **Backups (#26):** DynamoDB PITR on, S3 versioning on. Account deletion: delete `USER#<sub>` partition, keep entitlement records in a purchases ledger as required for tax.
- **Client storage:** localStorage stays the offline cache for slots; move released-page cache to IndexedDB in #3.

## DynamoDB design (single table `questender`)

Key: `pk` (S), `sk` (S). On-demand billing, PITR on, TTL attribute `ttl`.

| Entity | pk | sk | Attributes |
|---|---|---|---|
| Slot metadata | `USER#<sub>` | `SLOT#<slotId>` | `campaignId, startDate, heroName, updated, rev, schema, bodyBytes` |
| Slot body | `USER#<sub>` | `SAVE#<slotId>` | `body` (B, gzipped GameState JSON), `rev` |
| Calendar notes | `USER#<sub>` | `CALENDAR` | `entries` (list), `updated` |
| Settings | `USER#<sub>` | `SETTINGS` | `timezone` (IANA), prefs |
| Entitlement | `USER#<sub>` | `ENTITLEMENT#<campaignId>` | `source` (stripe/gift/promo/free), `price, currency, purchasedAt, stripeSessionId` |
| Linked identity | `USER#<sub>` | `LINK#discord` | `discordId, linkedAt` |
| Discord reverse lookup | `DISCORD#<discordId>` | `LINK` | `sub` |
| Catalog | `CATALOG` | `CAMPAIGN#<campaignId>` | `title, price, currency, version, rulesetId, minEngine, active` |
| Stripe idempotency | `STRIPE#<eventId>` | `EVENT` | `processedAt, ttl` |

Access patterns:

- List slots: `Query pk=USER#<sub>, sk begins_with SLOT#` (metadata only, bodies are under `SAVE#`, so a list never reads them).
- Load slot: `GetItem` on `SLOT#<id>` and `SAVE#<id>` (BatchGet).
- Save slot: `TransactWriteItems` of both items with condition `rev = :expected` (optimistic concurrency, so last-write-wins is explicit and the bot and web can't silently overwrite each other). Server checks: body size, schema, and page unlocked for the player's timezone.
- Library: `Query pk=USER#<sub>, sk begins_with ENTITLEMENT#` plus `Query pk=CATALOG`.
- Webhook: conditional `PutItem` on `STRIPE#<eventId>` (`attribute_not_exists(pk)`) then the entitlement put, in one transaction, for idempotency.
- Bot: `GetItem DISCORD#<id>` to resolve `sub`, then the same slot access.
- Admin and royalty reports are not in the main table's access patterns. Add a DynamoDB Streams to S3/Athena export when needed. This is the one place Postgres is nicer.

**Isolation tests (#31):** a handler test suite runs with DynamoDB Local; for each route, call as user A with user B's slot id and assert 404/403. A static check also greps handlers for any key built from a request parameter rather than the JWT `sub`.

## Equivalent Postgres schema (if C is chosen)

```sql
create table slots (
  user_id     uuid not null references auth.users on delete cascade,
  slot_id     text not null,
  campaign_id text not null,
  start_date  date not null,
  hero_name   text not null,
  schema_ver  int  not null default 1,
  rev         int  not null default 1,
  body        jsonb not null check (octet_length(body::text) <= 262144),
  updated_at  timestamptz not null default now(),
  primary key (user_id, slot_id)
);
create table calendar (user_id uuid primary key references auth.users on delete cascade,
                       entries jsonb not null default '[]', updated_at timestamptz not null default now());
create table settings (user_id uuid primary key references auth.users on delete cascade,
                       timezone text not null default 'UTC', prefs jsonb not null default '{}');
create table catalog (campaign_id text primary key, title text not null, price_cents int not null,
                      currency text not null, version int not null, ruleset_id text not null,
                      min_engine text not null, active boolean not null default true);
create table entitlements (
  user_id uuid not null references auth.users on delete cascade,
  campaign_id text not null references catalog,
  source text not null, price_cents int, currency text,
  stripe_session_id text unique, purchased_at timestamptz not null default now(),
  primary key (user_id, campaign_id));
create table discord_links (discord_id text primary key,
                            user_id uuid not null unique references auth.users on delete cascade);
create table stripe_events (event_id text primary key, processed_at timestamptz not null default now());

alter table slots, calendar, settings, entitlements, discord_links, catalog, stripe_events
  enable row level security;

-- owner-only data
create policy slots_owner    on slots    for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy calendar_owner on calendar for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy settings_owner on settings for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- read-only to the owner; writes only via the service role (Stripe webhook)
create policy entitlements_read on entitlements for select to authenticated
  using (user_id = auth.uid());
create policy discord_links_read on discord_links for select to authenticated
  using (user_id = auth.uid());

-- catalog is public read; writes only by service role / an admin claim
create policy catalog_read  on catalog for select to anon, authenticated using (active);
create policy catalog_admin on catalog for all to authenticated
  using ((auth.jwt() ->> 'role_app') = 'admin') with check ((auth.jwt() ->> 'role_app') = 'admin');
-- stripe_events: no policies = no client access at all
```

Page release in this world is an edge function that checks `entitlements`, reads `start_date` and `settings.timezone`, and returns only pages with `pageDate() <= today`. The Discord bot uses the service role and `discord_links`.

## Cloud save shape (decision for #2)

Save format v2 (0.12.0, `engine/saveFormat.ts`) already stores the journal, 70-80% of a save, as references into the campaign pack instead of copied sentences (a full year is about 35-45 KB raw instead of 90-125 KB; save codes about 7k characters instead of 28k). Cloud storage should build on it rather than re-uploading the whole year on every page:

- **Small snapshot item.** `SLOT#<slotId>` holds the current hero, party, progress, `rev`, the pack version stamp and the journal templates/names tables (all small and bounded). No journal pages in it.
- **One append-only record per finished page.** `PAGE#<slotId>#<pageIndex>` holds that page's journal references and the choices made (a few hundred bytes). Finishing a page is one transaction: put the `PAGE#` item (condition `attribute_not_exists`) and update the snapshot with `rev = :expected`. Past pages are never rewritten, so write volume per day is constant instead of growing across the year, and a conflict can only be on the snapshot.
- **Served against versioned campaign packs (#3).** Packs are immutable and addressed by version (`CATALOG` already has `version`); a slot pins the pack version it started on (the v2 `jrnl.v` stamp), so references always resolve. Editing a campaign publishes a new version for new runs and never changes pinned ones. This replaces the local best-effort drift handling (neutral "(entry from an earlier version)" line) with a guarantee.
- **Full log stored separately.** The 300-entry Chronicle lives in its own item (`LOG#<slotId>`), written with the snapshot but excluded from slot listings and from codes (codes already carry only the newest 50).
- **Codes become short references.** Once saves exist in the cloud, a share/transfer code can be a short pointer (slot id plus a one-time token) instead of the whole payload; the offline GQC2 code stays as the no-account backup.
- **Deterministic replay** (seed plus the player's choices reproduces the state) becomes viable only with pinned pack versions, since any content or engine-rule edit changes the outcome. Not planned for #2; the `PAGE#` records keep the choices so it stays possible.

Rejected: a per-reference text fingerprint in v2 saves. It would detect edited content without a pack stamp, but costs roughly a fifth of the size saving, and pinned versions make it unnecessary in the cloud.

## Consequences

- We commit to AWS (Cognito, DynamoDB, Lambda) and to owning ~6 small Lambdas and a CDK app. Those are the first things to exist outside `src/`.
- The engine (and `normalizeState`, `sanitizeEntries`) must be importable from Node. That lines up with the planned `packages/engine` move; the Lambdas depend on it.
- Notes need a size cap before cloud sync ships.
- Discord login (as opposed to linking) is deferred. A custom OIDC bridge is the work if we want it.
- Decisions to revisit if usage proves different: reporting needs (Postgres), notes size (separate item), regional residency.

## Next steps (these become the #2 work)

1. **Adopt the seam in the client (no behavior change).** Use `SaveStore` (`src/saveStore.ts`, already added with a localStorage implementation and tests) from `App.tsx`: async load on startup with a brief loading state, async saves. Add a 64 KB cap on `notes`. Engine logic stays synchronous.
2. **Infra skeleton in CDK (`infra/`).** `dev` AWS account only: Cognito user pool with Google as IdP (Discord is link-only, later), single DynamoDB table with the key design above, PITR on, HTTP API with a JWT authorizer, AWS Budgets alarms. Verify with `cdk synth`; deploy only after review.
3. **Slots/calendar/settings Lambdas plus shared types.** Repository module keyed by JWT `sub`, zod schemas in `packages/api-types`, gzip body, `rev` optimistic concurrency, server validation (size, schema, page-unlocked check by stored timezone). Tests against DynamoDB Local, including cross-user access attempts.
4. **`CloudSaveStore` and sync layer.** localStorage stays the offline cache. Push on page advance and on a debounce, pull on load, last-write-wins by `SlotMeta.updated` with the server `rev` as the arbiter, first-sign-in merge (upload local-only, download cloud-only, `mergeEntries` for calendar), and a synced/offline/syncing indicator plus sign-in/out UI.
5. **Then #3 on the same table.** Catalog and entitlements items, Stripe checkout and webhook Lambdas (signature check, idempotency item), the date-release endpoint reusing the engine, and the private S3 pack bucket. The Discord interactions Lambda (#1) follows once `DISCORD#` links exist.
