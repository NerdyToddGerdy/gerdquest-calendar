# ADR 0005: Service boundaries for the backend

- Status: Proposed
- Date: 2026-11-27
- Refines: ADR 0004 (backend platform). Covers parts of #25 (APIs), #26 (storage), #29 (compute), #32 (rate limiting)
- Code: `infra/cdk/` (synth only; nothing is deployed yet)

## Context

ADR 0004 picked Cognito + API Gateway HTTP API + Lambda + DynamoDB in CDK, with one DynamoDB table for everything. The backend will grow in clearly separate directions: cloud saves (#2), purchases and date-released packs (#3), the Discord bot (#1), and later reminders. We want to keep the option of treating each as a **microservice**: owned, deployed, scaled and replaced on its own, without paying for that option up front.

On this stack the usual cost of microservices mostly disappears. An idle HTTP API, Lambda, DynamoDB on-demand table or EventBridge bus costs $0, so one per service adds no fixed cost. What remains is design discipline, which is cheap to keep from day one and expensive to retrofit.

## Decision

**One stack per service, each owning its API, functions and data. Services talk only through contracts: the player's JWT, SSM parameters and events.**

### Rules

1. **A service is a folder and a stack.** `infra/cdk/lib/services/<name>/` holds its stack and its handlers. It may import `lib/shared/` (constructs and contracts) and nothing from another service. A test enforces this (`test/boundaries.test.ts`).
2. **Each service owns its data.** Its own DynamoDB table(s) and S3 bucket(s), granted only to its own functions. No service reads another service's table. This **replaces ADR 0004's single `questender` table** with one table per service. The key design inside each table is unchanged.
3. **Each service owns its API.** One HTTP API per service, with routes under `/v1/`, its own throttle, and a JWT authorizer that trusts the identity service. Once there is a domain, one custom domain maps `api.<domain>/<service>/` to each API, so the client sees one host.
4. **No CloudFormation exports.** Public values (issuer, client id, API URLs, bus name) go into SSM parameters under `/gerdquest/<stage>/<owner>/…` and are resolved at deploy time. Any stack can be redeployed, renamed or replaced without the "export in use" lock. Tested: no template contains `Fn::ImportValue`.
5. **Synchronous calls come from the client, not from services.** The browser calls each service directly with the same Cognito token. Services don't call each other over HTTP on the request path, so one slow or broken service can't take another down.
6. **Asynchronous facts go on the shared EventBridge bus.** The event names and shapes live in `lib/shared/contracts.ts`. A publisher never knows its consumers. Example: identity publishes `UserDeleted`, and saves, commerce and Discord each delete their own data for that `sub`.
7. **Code shared across services is a package, not a service.** The engine (`packages/engine`) and request/response schemas (`packages/api-types`, planned) are libraries every service bundles. That's fine because they are pure and versioned with the repo.
8. **Start with one Lambda per service.** It routes internally by `routeKey`. Split a route into its own function only when it needs different memory, timeout or permissions (e.g. the Stripe webhook).

### Service map

| Service | Status | Owns | API | Publishes | Consumes |
|---|---|---|---|---|---|
| **platform** | built | budget alarm ($1/$5/$10), event bus | none | none | none |
| **identity** | built (pool, client, hosted sign-in) | Cognito user pool, web client | later: `/v1/account` (delete, link Google) | `UserDeleted` | none |
| **saves** (#2) | built as a stub (routes return 501) | `saves` table: slots, page records, log, calendar, settings, progress | `/v1/slots…`, `/v1/calendar`, `/v1/settings`, `/v1/progress` | later: none needed | `UserDeleted` |
| **commerce** (#3) | planned | `commerce` table: catalog, entitlements, Stripe idempotency; private pack bucket | `/v1/catalog`, `/v1/library`, `/v1/checkout`, `/v1/packs/{id}/pages` (date release), webhook | `EntitlementGranted` | `UserDeleted` (move purchases to the ledger) |
| **discord** (#1) | planned | `discord` table: links (`DISCORD#<id>` → `sub`) | interactions endpoint, OAuth link callback | `DiscordLinked` | `UserDeleted` |
| **reminders** | planned | EventBridge Scheduler schedules | none | none | settings changes, if ever needed |

### Where we deliberately don't split

- **Date release stays inside commerce.** Releasing a page needs the entitlement check and the pack in the same request, and must never be stale. Splitting them would mean either a synchronous call between services (breaks rule 5) or an eventually-consistent copy of entitlements, where a player could pay and briefly see nothing. Split later only if pack delivery needs its own scaling (it won't at this size).
- **Page-unlock checks in saves use the engine package, not a service.** It's pure date logic, so it's a library call.

### The Discord bot and saves

The bot has no player JWT, so it can't use the client path. When #1 starts, saves adds a small set of **IAM-authorized** routes (`/internal/v1/…`, SigV4) that take a `sub`. Only the Discord function's role may call them. Those routes are the one sanctioned service-to-service call, and they live behind the saves API, so saves still owns its data. The alternative, letting the bot read the saves table, is rejected (it breaks rule 2).

## Consequences

- No transactions across services. None are needed: every transaction in ADR 0004's design (slot + page record, Stripe event + entitlement) stays inside one service's table.
- More stacks to deploy in order the first time (platform → identity → others). After that, each deploys on its own. `cdk deploy --all` handles the order.
- Account deletion is eventually consistent across services (seconds). The deletion request returns as soon as Cognito is done, and each service cleans up from the event. That's acceptable, but it must be covered in the privacy page ("deleted within minutes").
- Reports across services (royalties, #26) need an export from each table (Streams → S3) rather than one query. ADR 0004 already planned that.
- Cost guardrails are enforced as tests on the synthesized templates (`infra/cdk/test/guardrails.test.ts`): no VPC/NAT/RDS/containers/Secrets Manager/KMS keys/REST APIs, Lambdas on arm64 with 7-day logs, on-demand tables, throttled stages, Lite Cognito with no SMS, and the $1/$5/$10 budget.

## Deviations from ADR 0004 in the skeleton

- **One table per service**, not one shared table (rule 2).
- **Node 24** Lambdas instead of Node 22. Node 22 reaches end of life in April 2027, around when the backend would ship.
- **Classic hosted UI** for sign-in. Cognito's newer managed login needs the Essentials plan. Switch both together only if Essentials stays inside the free MAU allowance.
- **Google's client secret** comes from an SSM parameter resolved at deploy (free), not Secrets Manager ($0.40/month per secret). The value never appears in the template.
