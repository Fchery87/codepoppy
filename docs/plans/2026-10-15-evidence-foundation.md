# Evidence foundation implementation plan

**Status:** Historical. The domain slice this plan described is implemented. The implementation contract is `docs/specs/2026-10-15-self-hosted-reviewer.md`, and the next units are in `docs/plans/2026-10-15-self-hosted-reviewer.md`.

**Goal:** Carry scanner results, secret evidence, finding history, and review evidence through CodePoppy's recorded PR snapshot without making incomplete analysis look clean or allowing unqualified publication.

**Architecture:** The runner consumes a GitHub PR files snapshot tied to recorded base and head SHAs. Scanner adapters receive that snapshot as data and return structured results. The runner produces a sanitized completion envelope; the control plane owns durable writes and publication decisions. No scanner or model receives a GitHub writer or database credential.

**Tech stack:** TypeScript domain module and Bun tests, with no runtime dependencies. This matches the planned Cloudflare control plane and a JavaScript-capable private Actions runner while keeping the domain contract portable.

## ScanForge lessons and CodePoppy requirements

| Area | Useful ScanForge pattern | Failure case CodePoppy must reject |
| --- | --- | --- |
| Scanner orchestration | Named stages and per-scanner status | A queued row without a job, a scanner failure treated as a clean scan, or a branch-tip checkout substituted for the recorded PR head. |
| Finding history | Stable finding plus per-run occurrence | An absent claim marked fixed when its file was not reviewed, or a moved claim treated as a new issue. |
| Secret handling | Allowlisted metadata at durable boundaries | A detected value reaching a model, log, artifact, ledger body, or publication text. The HMAC key stays on the control plane. |
| Scan evidence | Expected/completed/failed scanner set and attempt identity | A retry with a different payload overwriting an accepted completion, or a partial scan erasing prior findings. |

## Scope of this slice

1. Define a SHA-pinned PR snapshot and changed-line parser from GitHub file patches. Require the recorded head before analysis.
2. Orchestrate independently named scanners over that snapshot, recording success, failure, and omissions. Never infer a clean review from failed scanners.
3. Redact detected secret values before model-facing text is created. Expose only rule, file, line, and a keyed fingerprint from a control-plane-only function.
4. Reconcile finding occurrences using direct file review evidence. Missing review yields `uncertain`, not `fixed`.
5. Accept completion once per attempt and evidence digest. Plan publication only for a complete, approved, qualified, current-head review with supported findings on changed lines.
6. Verify the success and failure paths with deterministic tests and an integrated fixture.

## Integration left for the service build

The production GitHub files API adapter, pinned Gitleaks executable and rule pack, runner OIDC claim, Postgres transactions and encrypted retention, provider calls, shared qualification store, and actual GitHub writes must be built and tested before this is a deployed reviewer. The core deliberately cannot publish by itself.

## Source decisions and failure cases

- ScanForge's `apps/worker/app/services/scan_orchestrator.py` stages clone, scan, normalization, and completion. Its `apps/worker/app/services/scan_pipeline/execution.py` derives changed files from a branch checkout. CodePoppy uses the GitHub PR files snapshot tied to recorded SHAs, per `docs/adr/0002-three-dot-diff.md`.
- ScanForge's `apps/api/app/services/findings.py` requires comparable healthy scans before absence changes a finding. CodePoppy applies the stricter direct-review rule in `docs/adr/0018-occurrence-states.md`: incomplete or unreviewed files stay uncertain.
- ScanForge's `apps/worker/app/security/secret_evidence.py` allowlists secret metadata. CodePoppy also requires a control-plane HMAC key and redaction before a model call, per `docs/adr/0041-shipped-secret-rules.md` and `docs/adr/0029-ledger-contents.md`.
- ScanForge's `apps/api/app/services/scan_completion.py` locks completion to an attempt and evidence digest. CodePoppy's pure completion rule rejects conflicting retries; its future Postgres service must enforce that rule inside a transaction, with the control plane as sole ledger writer per `docs/adr/0003-control-plane-owns-the-ledger.md`.
- `src/core/evidence.ts` contains the current domain core. `src/core/evidence.test.ts` covers stale heads, scanner failure, redaction, incomplete re-review, conflicting completion, and publication gates. Run `bun test` and `bun run typecheck`.
