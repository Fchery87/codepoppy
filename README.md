# CodePoppy

CodePoppy is specified in [CodePoppy-PRD.md](CodePoppy-PRD.md). The current code is a tested domain foundation, not a deployed GitHub App.

`src/core/evidence.ts` validates a recorded GitHub PR snapshot, tracks scanner status, redacts detected secrets before the review callback, reconciles finding occurrences, checks completion retries, and plans eligible publication. It has no GitHub writer or database access. The private runner can use `executeRunnerEvidence` with adapters for PR acquisition, pinned scanners, secret fingerprinting through the control plane, and semantic review.

Run `bun install`, `bun test`, and `bun run typecheck`.

The build target is [the self-hosted reviewer spec](docs/specs/2026-10-15-self-hosted-reviewer.md). The implementation units are in [the self-hosted reviewer plan](docs/plans/2026-10-15-self-hosted-reviewer.md). The evidence foundation plan is historical. A production review still requires the GitHub App, private Actions runner and OIDC claim, pinned Gitleaks integration, Postgres ledger and migrations, model routes, qualification, and an idempotent GitHub publisher.

Local commands are `codepoppy setup` and `codepoppy doctor --pr <number>`. Both require confirmation before an external write.
