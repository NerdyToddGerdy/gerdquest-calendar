# GerdQuest backend infrastructure (AWS CDK)

The backend from ADR 0004, split into services per ADR 0005
(`docs/adr/0005-service-boundaries.md`). **Nothing here is deployed yet.** CI
only typechecks, tests and synthesizes it, with no AWS credentials.

This is its own npm package with its own lockfile, so installing the game
doesn't pull in `aws-cdk-lib`.

```sh
cd infra/cdk
npm ci
npm test            # guardrail, boundary and handler tests
npm run synth       # dev stage  → cdk.out/
npm run synth:prod  # prod stage
```

## Layout

```
bin/app.ts                  entry point (cdk.json runs it with tsx)
lib/app.ts                  builds every stack for one stage
lib/shared/                 the only code services share
  config.ts                 stage, origins, callback URLs, budget
  contracts.ts              SSM parameter names and event shapes between services
  service-function.ts       the one Lambda construct (arm64, Node 24, 7-day logs, no VPC)
  service-api.ts            the one HTTP API construct (JWT authorizer, CORS, throttle)
lib/platform/               budget alarm and event bus
lib/services/identity/      Cognito user pool, hosted sign-in, web client
lib/services/saves/         saves table, API and handler (stub: routes return 501)
test/                       guardrails, boundaries, per-service tests
```

To add a service, create `lib/services/<name>/` with a stack and handlers.
Build its Lambdas with `ServiceFunction` and its API with `ServiceApi`, give it
its own table, and publish anything others need through SSM (`contracts.ts`),
never through stack exports. Then add it in `lib/app.ts`. The boundary tests
fail if it imports another service.

## Stacks (per stage: `dev`, `prod`)

| Stack | Contains |
|---|---|
| `gerdquest-<stage>-platform` | Monthly cost budget alerting at $1, $5 and $10 (actual spend) to the contact address; EventBridge bus |
| `gerdquest-<stage>-identity` | Cognito user pool (Lite plan, email sign-in, length-only password policy, email-only recovery), hosted sign-in domain, public PKCE web client, Google when configured |
| `gerdquest-<stage>-saves` | `gerdquest-<stage>-saves` table (pk/sk, on-demand, ttl; PITR and deletion protection in prod), one Lambda, HTTP API with JWT-protected `/v1/…` routes and a public `/v1/health` |

Prod keeps tables and the user pool if a stack is deleted. Dev deletes them,
so tearing dev down returns it to $0.

## Context options

| Option | Default | Meaning |
|---|---|---|
| `stage` | `dev` | `dev` or `prod` |
| `authDomainPrefix` | `gerdquest-<stage>` | Cognito hosted-login prefix (must be unique in the region) |
| `budgetEmail` | the site's contact address | Who receives budget alerts |
| `googleClientId` | none | Turns on "Continue with Google" |

Example: `npx cdk synth -c stage=prod -c googleClientId=123.apps.googleusercontent.com`.

## When it's time to deploy (not yet)

Per ADR 0004 this happens in a separate dev account first, and only after review.

1. Create the dev account with root MFA, and a CLI profile for it.
2. `npx cdk bootstrap aws://<account>/<region>` once per account and region.
   Bootstrapping creates an S3 bucket and an ECR repository. Both are free
   while (nearly) empty.
3. `npx cdk deploy --all` deploys in order: platform, identity, then saves.
   Confirm the budget alert email subscription when it arrives.
4. Google sign-in (optional): create an OAuth client in Google Cloud. Store its
   secret once with
   `aws ssm put-parameter --name /gerdquest/dev/identity/google-client-secret --type String --value <secret>`,
   then deploy with `-c googleClientId=<id>`. The secret stays out of the
   template, but CloudFormation shows the resolved value to anyone in the
   account who can view the stack's parameters. That's acceptable for a
   one-person account; switch to Secrets Manager if others get access.
