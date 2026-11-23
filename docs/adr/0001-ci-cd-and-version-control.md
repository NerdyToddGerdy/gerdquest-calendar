# ADR 0001: CI/CD and version control

- Status: Proposed
- Issue: #30

## Context

Questender is a public repo with a single `main` branch and no branch
protection. One workflow deployed to GitHub Pages on every push to `main`.
Lint and type checking were not separate CI steps, and nothing ran on pull
requests. A backend (AWS) is likely later.

## Decisions

### 1. Branching: trunk-based

`main` is always deployable. Work happens on short-lived branches
(`feat/...`, `fix/...`, `ci/...`, ideally merged within a few days) and lands
through pull requests with squash merge. Rejected: long-lived `develop` or
release branches. A solo maintainer and a continuously deployed static site gain
nothing from them, and they add merge overhead.

### 2. CI on pull requests

`.github/workflows/ci.yml` runs four parallel jobs on every PR: `lint`
(oxlint), `typecheck` (`tsc -b`), `test` (`vitest run`) and `build`. The same
workflow is reused by `pages.yml` through `workflow_call`, so a push to `main`
runs the checks once and deploys only if they all pass. Dependabot
(`.github/dependabot.yml`) opens weekly, grouped minor/patch updates for npm and
GitHub Actions; the CI jobs gate them.

Not yet adopted: PR preview deploys (GitHub Pages cannot serve per-PR previews
without extra tooling; revisit when a backend exists) and CodeQL (enable
"default setup" in the repo security settings; no workflow file needed).

### 3. Branch ruleset for `main`

- Require changes through a pull request, with 0 required approvals (a solo
  maintainer can merge their own PRs).
- Require status checks `lint`, `typecheck`, `test` and `build`, with branches
  up to date before merging.
- Block force pushes and deletion.
- Require linear history (squash or rebase merges).
- No bypass actors, so the rules apply to the admin as well. If that proves
  too strict, add the repository admin role as a bypass actor with mode
  `pull_request`.

Apply with (needs an authenticated `gh` with admin rights; not yet run):

```sh
gh api -X POST repos/NerdyToddGerdy/questender/rulesets --input - <<'JSON'
{
  "name": "main protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "required_linear_history" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "lint" },
          { "context": "typecheck" },
          { "context": "test" },
          { "context": "build" }
        ]
      }
    }
  ]
}
JSON
```

The check names match the job `name:` values in `ci.yml`. The workflow must
have run at least once (the PR that introduces it) for the names to be
selectable in the UI; the API accepts them regardless.

### 4. Secret scanning

Enable secret scanning and push protection (free on public repos):

```sh
gh api -X PATCH repos/NerdyToddGerdy/questender --input - <<'JSON'
{ "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" } } }
JSON
```

Also enable Dependabot alerts and security updates.

### 5. Future AWS deploys: GitHub OIDC, no long-lived keys

When a backend exists, deploy jobs request a short-lived token instead of
storing AWS keys:

- Create an IAM OIDC identity provider for `token.actions.githubusercontent.com`.
- Create one IAM role per environment with a trust policy restricted by the
  `sub` claim, for example `repo:NerdyToddGerdy/questender:environment:prod`
  (and `:ref:refs/heads/main` for staging), and `aud` = `sts.amazonaws.com`.
- Jobs set `permissions: id-token: write` and use
  `aws-actions/configure-aws-credentials` with `role-to-assume`. Role ARNs live
  in environment variables, not secrets.
- Keep roles least-privilege (CDK bootstrap roles or a scoped deploy role).

### 6. Environments

Use GitHub Environments: `staging` (auto deploy from `main`) and `production`
(required reviewer, restricted to `main`, and a wait timer if desired).
`github-pages` remains the environment for the static site until it moves to
AWS. Pipeline shape: CI, then deploy staging, then manual approval, then deploy
production. Environment-scoped variables select the OIDC role.

### 7. Releases

Semantic versioning, tracked in `package.json` and `CHANGELOG.md` (already
present). Releasing: bump the version in a PR, merge, then tag `vX.Y.Z` on
`main` and publish a GitHub Release from the changelog entry. If the engine or
campaign packs are later split into packages, tag them independently
(`engine-vX.Y.Z`, `pack-<name>-vX.Y.Z`); defer that and any monorepo tooling
until a second deployable actually lives in this repo.

## Consequences

- Every change goes through a PR and four green checks; direct pushes to `main`
  stop. Hotfixes follow the same path, which is fast enough with parallel jobs.
- Each job runs `npm ci` separately (cached) for clear failure attribution, at
  the cost of a few extra runner-minutes, which are free for public repos.
- Pages deploys use the exact artifact built by the checked commit.

## Follow-ups

1. Apply the ruleset and secret scanning settings above.
2. Enable CodeQL default setup and consider `npm audit --omit=dev` as a
   scheduled job.
3. Add the AWS OIDC provider, roles and environments when the backend starts.
4. Add a release-tagging workflow if manual tagging becomes tedious.
