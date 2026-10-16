# Build the self-hosted reviewer

**Date:** 2026-10-15

## Problem

CodePoppy has a product contract and a tested domain core. It has no deployed reviewer.

The owner cannot sign in, enable a repository, or see a shadow review. A pull request receives no walkthrough, check, or inline finding. `src/core/evidence.ts` validates a recorded snapshot, runs injected scanners, redacts secrets, reconciles occurrences, accepts one completion, and plans publication. It does not call GitHub, Postgres, a model, or Gitleaks. `README.md` states that gap.

## Goal

A single owner can install the documented stack, complete one shadow review of an eligible TypeScript or JavaScript pull request, qualify that route, approve publication, and then receive one current-head walkthrough, one check, and eligible inline findings on later pull requests.

## Non-goals

This build does not add languages beyond TypeScript, JavaScript, Python, and Go. It does not add framework packs beyond SvelteKit and TanStack Start. It does not publish suggestions, generate learnings, gate merges, ingest CI, or run repository tests and linters. It does not add a plugin API, a public HTTP API, multi-user administration, GitLab, Bitbucket, or a hosted control plane. It does not let the reviewed repository load code.

The first internal checkpoint proves TypeScript and JavaScript through one OpenRouter alias. The evaluation release still covers the four languages and three provider families named in the PRD. Those extra languages and providers are later PRs in this program, not a later product.

Numerical quality thresholds stay unset until the owner calibrates them on the labeled corpus. This spec does not invent those numbers.

## Approach

The data shape is a review run owned by the control plane. Every later service reads or writes that shape. No service invents a second copy of a decision the domain core already makes.

A review request is unique on installation, repository, pull request, head, and review kind. A manual rerun is a different request. One run is active for a repository and pull request.

A run is one of these states.

- `requested`. Intake accepted it and it is not yet dispatched.
- `debouncing`. An automatic trigger is waiting two minutes for a newer event.
- `queued`. It has a reservation and no free runner slot, or it is waiting behind an active run that a newer head has not yet cancelled.
- `dispatched`. The control plane sent `workflow_dispatch` and the claim has not arrived.
- `claimed`. The runner or the local CLI holds the one-time callback token.
- `complete`. Every required stage that applied finished and coverage is stored.
- `incomplete`. Some results were stored, then callback time, money, or a required route ran out.
- `failed`. A required stage failed and no review results were stored.
- `cancelled`. A newer request, a close, a draft conversion, a disablement, or a disappeared pull request stopped it.

Only `complete` sets the last reviewed head. `incomplete`, `cancelled`, `failed`, explain, and config do not. A complete deterministic review, including a documentation-only pull request, does set it.

A finding is a candidate, then a verified finding, or a suppression with a reason. A verified finding on one head is an occurrence. An occurrence is `persisting`, `moved`, `fixed`, `obsolete`, or `uncertain`. The fingerprint is a hash of the immutable repository ID, the closed category, the symbol or file path, and the normalized failure claim. The domain core does not derive that hash today. The findings PR adds the pure function and the existing evidence module calls it.

Publication is a plan, then a recorded GitHub write. The plan stays the pure function in `src/core/evidence.ts`. The publisher rechecks the current head and writes only what that function returns. One walkthrough comment, one check per head, and one inline comment per fingerprint and head are the identities. A retry updates the existing object.

The boundary rule is unchanged. The control plane is the only ledger writer. The runner and the CLI submit stage results. Repository content, including configuration prose, is data. Policy fields in `.github/ai-review.yml` on the base branch are the only repository policy.

Three rulings come from the current contract and from a throwaway probe of `planPublication` on 2026-10-15. The probe script is `/tmp/codepoppy-prototypes/publication-contract.mjs`. The repository is not a git checkout, so there is no branch SHA.

1. The installation default profile is `precise`. ADR 0015 says balanced is the default. ADR 0027, the PRD configuration section, and the glossary's implementation contract say precise. The precise sentence wins because it is the sentence the configuration pull request actually writes. ADR 0015 needs a status note during the docs PR. Do not change the inline rule. Both profiles use the same one.
2. A required-stage failure writes a sanitized failed check in the publish posture while the pull request still exists. It does not write a walkthrough or a finding. The evaluation release stays in shadow and writes no check. The PRD evaluation sentence and the publication sentence therefore apply to different postures. `planPublication` already returns `failure-check` before it tests approval. That order matches ADR 0019 and stays.
3. An affirmed low or informational finding in the walkthrough does not turn a fully covered success check into neutral. ADR 0059 says success when every eligible file was covered and no inline finding remains. The current probe confirms the code does this. The PR that edits `planPublication` must keep that behavior and assert the walkthrough text, which the current test does not.

Classification failure excludes the affected files from the model. It does not by itself fail the run. The PRD line that says an invalid config file fails "before classification" means the model never sees files, not that classification is skipped as a stage. The invalid-config failure is a required-stage failure. The files are classified only when the run continues.

## Alternatives considered

One process that calls GitHub, the model, and Postgres lost. ADR 0003 already splits the control plane from the runner so the runner never holds the database URL and the control plane never holds the provider key.

A per-repository defect quota lost. ADR 0058 superseded ADR 0007 and ADR 0032. ADR 0043 is already marked superseded. The spec does not reopen that bar.

A summary-only first publication lost. ADR 0059 superseded ADR 0036. The first usable release publishes medium, high, and critical findings together.

Shipping the domain core's publication strings as the GitHub comment lost. The probe shows those strings are counts, not the developer-facing contract in ADR 0061. The publisher renders the contract. The plan stays a decision.

## Deletion inventory

Nothing in `src/` is deleted. The module grows callers.

`docs/plans/2026-10-15-evidence-foundation.md` becomes historical once this spec is the implementation contract. Keep the file. Change its status line so it no longer reads as the next plan. That edit is in the docs PR.

ADR 0007, ADR 0010, ADR 0032, ADR 0036, ADR 0043, and ADR 0046 stay on disk and are already marked superseded. They are the decision history. They are not implementation sources. The living unlabeled-candidate rule is ADR 0058. A participant response is not an owner label, per ADR 0060. ADR 0015's "Balanced is the default" sentence is corrected by a status note, not by deleting the ADR.

The throwaway probe under `/tmp/codepoppy-prototypes/` is not part of the product. Delete it when the publication PR has replaced the missing assertions.

## Verification

The domain tests are `bun test` and `bun run typecheck` from the repository root. Those commands are necessary and not sufficient for a PR that adds a service.

A PR that adds GitHub, Postgres, or a model call is verified only when three checks exist. The unit check runs the domain or service against a fixture with no network. The live check drives the owner CLI or the local HTTP routes and records the GitHub or dashboard result. The perf check records time from dispatch to the owner-visible result, or a domain-only budget when the PR has no owner-visible wait. The plan names the number that fails for each PR.

The program is done when a fresh installation, following the README, completes one shadow review of an owner-selected eligible pull request, and a later approved publication writes one walkthrough, one check, and no duplicate GitHub object on retry.

## Risks

The GitHub App, Cloudflare account, Postgres, runner repository, and provider keys are the owner's. The program cannot prove live webhook delivery until the owner supplies them. The live lanes for those PRs use recorded fixtures and a local stub until that happens, and Appendix C of the plan says so.

A model route with unknown prices must refuse the call. If a test uses a live route, it spends the personal budget. The qualification PR uses saved responses unless the owner explicitly runs a live fixture.

`planPublication` currently omits findings it cannot place and does not carry profile. A later edit can silently change check conclusions. The publication PR adds assertions for the strings and the low-finding case before any publisher is written.
