# Self-hosted reviewer plan

The owner gets one shadow review, then one approved current-head review on GitHub. The program keeps the control plane as the only ledger writer and does not publish before qualification and owner approval. The pull requests are PR-01 through PR-12, in that order, with PR-04 and PR-05 parallel after PR-03.

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `pstack/skills/poteto-mode/playbooks/autopilot-stack.md`. The operator lands the stack. Every PR stops at stack-ready. No owner merges.

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on the operator's explicit go.
- [ ] Read these from trunk at program start. Re-read them at every tick.
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/autopilot-stack.md`
  - [ ] `git show origin/main:pstack/skills/swarm/SKILL.md`
  - [ ] `git show origin/main:pstack/skills/control-cli/SKILL.md`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/references/bugbot-triage.md`
  - [ ] `git show origin/main:docs/specs/2026-10-15-self-hosted-reviewer.md`
  - [ ] `git show origin/main:CodePoppy-PRD.md`
- [ ] On the operator's go, arm the audit tick as `/loop 1h` with the tick prompt below. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from trunk. Audit the operation against it and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then post a short status message to the operator in chat only when the audit found a tracked change that no earlier status message reported, such as a PR opened, a code-ready head, a round launched or closed, a verdict, a merge, a stuck agent and the action taken, a blocker added or cleared, or a decision only the operator can make. Name every such change and nothing else. Do not repeat a table, the merged list, or an unchanged blocker. If the audit found none, end the turn with no reply text. Either way, log this tick's row in your decision trail. The row names the items reported, or none."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when the execution playbook stacks.
  - [ ] PR-01 is first and branches from `main`.
  - [ ] PR-02 after PR-01. PR-03 after PR-02.
  - [ ] PR-04 and PR-05 are independent of each other and both start after PR-03. Both branch from the PR-03 stack tip.
  - [ ] PR-06 after PR-04 and PR-05. PR-07 after PR-06. PR-08 after PR-07.
  - [ ] PR-09 after PR-08. PR-10 after PR-09. PR-11 after PR-10. PR-12 after PR-11.
- [ ] Hold the file boundaries. Each PR touches only the paths in its **Files.** block.
- [ ] Hold the review gate. PR-10, PR-11, and PR-12 change an interaction. They wait for the operator's review in chat with screenshots and a video before they are appended as ready for the operator to land.

### PR mechanics, for every PR

- [ ] Resolve the forge once. Default to `gh`. If `command -v origin` succeeds and Origin can resolve the repository, use `origin pr` for every PR operation. Record any fallback to `gh`. Never require `gt`. The repository is not a git checkout today. The first owner runs `git init` only if the operator's go says to, on a remote the operator names. Until then, open no pull request and record the missing remote in the decision trail.
- [ ] Open the PR ready, never draft, per **Opening a PR**. Use the run's built-in PR tool when it has one, else `origin pr create --status open --base <base-branch>` or `gh pr create --base <base-branch>` according to the resolved forge. A stack child targets its parent branch.
- [ ] Run `bun run typecheck` and `bun test` once before the PR-facing push. Push with hooks on.
- [ ] Run `/deslop` before each commit and `/no-comments` before review.
- [ ] Triage every Bugbot and security-reviewer comment per `pstack/skills/poteto-mode/references/bugbot-triage.md`.
- [ ] Rebase onto current trunk before the code-ready report and babysit. Keep that merge base in fix rounds. Rebase again only at merge prep, on a `git merge-tree` conflict with trunk, or on a CI failure that comes from a change on trunk.

### Verdict and merge, for every PR

- [ ] At the code-ready head SHA and at each later push that changes the patch, run the swarm per `pstack/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. Two or more audit lanes, each with its own focus, that read the diff and the receipts and distrust the PR body. The root audits the receipts in the stack-ready report before the verdict.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner, including a defect that a lane filed as a note. A new head gets a fresh swarm and a fresh verdict, except for results that stay valid under the patch-id rule in `playbooks/shipping.md`.
- [ ] No owner merges. A clean verdict appends the PR to the one linear base-branch stack. The operator lands the stack bottom-up. Apply the patch-id rule from `playbooks/shipping.md` when a rebase rewrites SHAs above a landed parent.

### Boot recipe, for every live lane

Each live lane runs on its own cloud VM at the PR head. Drive through `control-cli` from `cursor-team-kit`. There is no browser UI in PR-01 through PR-09. PR-10, PR-11, and PR-12 also drive the owner CLI through `control-cli`. A browser surface is a risk in Appendix C until a control-ui skill is present in the run.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] Run `bun install`. Start nothing that listens until the lane's scenario says so. For PR-10 and later, start the local control plane with the fixture environment the scenario names and wait until `GET /health` returns 200.
- [ ] Drive input through `control-cli` commands or `bun` test processes. Read-only diagnostics are the command stdout, the SQLite or Postgres fixture row named in the lane, and the saved screenshot of the terminal.
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## Record the contract corrections (PR-01)

**Depends on.** None.

**Files.**

- [ ] Edit `docs/adr/0015-inline-findings-sit-on-the-diff.md`.
- [ ] Edit `docs/plans/2026-10-15-evidence-foundation.md`.
- [ ] Edit `README.md`.
- [ ] Create nothing else. The spec file already exists.

**Build.**

- [ ] Add a status note to ADR 0015 that the installation default profile is precise, matching ADR 0027, and that balanced keeps the same inline rule.
- [ ] Change the evidence-foundation plan status to historical and point at `docs/specs/2026-10-15-self-hosted-reviewer.md`.
- [ ] Point the README next-work sentence at the spec and this plan.

**You see.**

- [ ] `README.md` names the spec path, and ADR 0015 no longer reads as if balanced were the installation default.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] No code behavior changes. Run `bun test` and confirm the existing count still passes.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. On trunk, `rg -n "Balanced is the default" docs/adr/0015-inline-findings-sit-on-the-diff.md` matches. On head, the same file contains the precise status note. Trunk lacks the note. Gate the note, not a product behavior. Save `adr-0015.png`. Pass when the screenshot shows the precise sentence and the old sentence is marked historical.
- [ ] Lane 2. Open the spec and confirm every heading from Problem through Risks is present. Save `spec-headings.png`. Pass when all eight headings are visible.
- [ ] Lane 3. Open the evidence plan and confirm the status says historical. Save `old-plan-status.png`. Pass when the status line names the spec path.
- [ ] Lane 4. Open the README and confirm it does not claim a deployed GitHub App. Save `readme.png`. Pass when the first paragraph still says the code is a domain foundation.
- [ ] Lane 5. Read ADR 0043 and confirm the status line names ADR 0058. Save `adr-0043.png`. Pass when the screenshot shows that superseded line. The unlabeled-candidate rule an implementer follows is ADR 0058.
- [ ] Lane 6. Search ADR 0007 and ADR 0032 for superseded status. Save `old-gate.png`. Pass when both name ADR 0058.
- [ ] Lane 7. Search ADR 0036 and ADR 0010 for superseded status. Save `old-publication.png`. Pass when both name ADR 0059.
- [ ] Lane 8. Confirm `src/core/evidence.ts` is unchanged from trunk by a diff limited to that path. Save `core-unchanged.png`. Pass when the diff is empty.
- [ ] Lane 9. Confirm `docs/specs/2026-10-15-self-hosted-reviewer.md` states the three rulings from the publication probe. Save `rulings.png`. Pass when failure-check order, precise default, and low-finding success are each one sentence.
- [ ] Lane 10. Run `bun test` in the lane VM and leave the summary on screen. Save `tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Wall time of `bun test` at trunk and at head. The diff adds no runtime work. The user-visible end state is the same passing summary.
- [ ] Probe. `time bun test`, interleaved, trunk first, then head, then trunk again.
- [ ] Baseline. Record the trunk seconds first.
- [ ] Rule. Fail if the head median is more than 2 seconds above the trunk median. There is no ratio against a different scenario.

**Review gate.** None. PR-01 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-01 to the base-branch stack and the operator lands it.

## Make the domain decisions total (PR-02)

**Depends on.** PR-01.

**Files.**

- [ ] Edit `src/core/evidence.ts`.
- [ ] Edit `src/core/evidence.test.ts`.
- [ ] Create `src/core/findings.ts`.
- [ ] Create `src/core/config.ts`.
- [ ] Create `src/core/size.ts`.
- [ ] Create `src/core/budget.ts`.
- [ ] Create the matching `*.test.ts` beside each new module.

**Build.**

- [ ] Add `fingerprint(input)` in `src/core/findings.ts`. The input is repository ID, category, optional symbol, and raw claim. Normalization is NFKC, lowercase, collapsed whitespace, with line numbers, SHAs, and paths removed from the claim.
- [ ] Add `parseTrustedConfig` in `src/core/config.ts`. Accept version 1, the three profiles, shadow or publish posture, and a repository budget that is not above the personal ceiling. Reject an unknown field.
- [ ] Add `classifySize` and `classifyFile` in `src/core/size.ts` using the PRD tables for small, medium, large, oversized, binary, minified, vendored, and generated.
- [ ] Add `reserve(call)` in `src/core/budget.ts`. Refuse a route with no price. Apply the $0.10, $0.40, and $1.00 per-run ceilings and the 70, 95, and 100 percent monthly stops as pure decisions.
- [ ] Extend `planPublication` so the walkthrough string for a fully covered empty inline set is stable, and add assertions for it. Do not change the failure-check order or the low-finding success result.

**You see.**

- [ ] A test named for an empty secret value, a bad SHA, a safe-mode plan, a closed pull request, an unapproved failure-check, and a critical cap of ten fails if that behavior regresses.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/core/evidence.test.ts` gains cases for the untested branches listed in the 2026-10-15 code comparison. `src/core/findings.test.ts`, `config.test.ts`, `size.test.ts`, and `budget.test.ts` gain one case per refusal named above. Run `bun test`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run the trunk `planPublication` fixture from `src/core/evidence.test.ts` and the head fixture. Trunk already returns success for one affirmed low finding. Gate that the head still does, and that the new walkthrough assertion passes. Save `low-success.png`. Pass when both processes print the success check.
- [ ] Lane 2. Run the fingerprint fixture on a claim that contains a SHA and a line number. Save `fingerprint.png`. Pass when two claims that differ only by SHA and line produce one digest.
- [ ] Lane 3. Run the invalid-config fixture with an unknown field. Save `config.png`. Pass when the thrown message names the field and no model function is imported by `src/core/config.ts`.
- [ ] Lane 4. Run the size fixture at 76 relevant files. Save `oversized.png`. Pass when the class is oversized.
- [ ] Lane 5. Run the binary fixture with a NUL in the first 8 KB. Save `binary.png`. Pass when the file is excluded from semantic review and still marked for secret detection.
- [ ] Lane 6. Run the budget fixture with a missing price. Save `unpriced.png`. Pass when `reserve` refuses before any call function runs.
- [ ] Lane 7. Run the failure-check fixture with `approved: false`. Save `failure-check.png`. Pass when the kind is `failure-check`.
- [ ] Lane 8. Run the safe-mode fixture. Save `safe-mode.png`. Pass when the plan kind is `none` and the reason is safe mode.
- [ ] Lane 9. Run the ten-cap fixture with 11 critical findings. Save `cap.png`. Pass when inline length is 10 and one fingerprint is omitted.
- [ ] Lane 10. Run `bun test` and leave the summary visible. Save `domain-tests.png`. Pass when the exit code is 0 and the new case names appear in the output.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Wall time of `bun test src/core` at trunk and head. Also time 1,000 calls of `fingerprint` and `classifySize` on a fixed 75-file fixture. Trunk has no `fingerprint`. The added work is those 1,000 calls. The user-visible end state is the test summary.
- [ ] Probe. Interleave `time bun test src/core` trunk, head, trunk. Then on head only, time the 1,000-call script.
- [ ] Baseline. Record the trunk `bun test src/core` seconds first.
- [ ] Rule. Fail if the head suite median is more than 3 seconds above the trunk median. Fail the added work if 1,000 combined calls take more than 1 second. Do not divide those numbers into a ratio.

**Review gate.** None. PR-02 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-02 to the stack and the operator lands it.

## Store the run ledger (PR-03)

**Depends on.** PR-02.

**Files.**

- [ ] Create `src/ledger/schema.sql`.
- [ ] Create `src/ledger/migrate.ts`.
- [ ] Create `src/ledger/store.ts`.
- [ ] Create `src/ledger/store.test.ts`.
- [ ] Create `migrations/` only if `migrate.ts` needs generated SQL checked in beside it.

**Build.**

- [ ] Encode the run state union from the spec as tables for installation, repository, request, run, occurrence, suppression, publication object, and deletion audit.
- [ ] `acceptStoredCompletion` writes the receipt and the evidence in one transaction and calls `acceptCompletion` for the decision.
- [ ] Encrypt source-bearing bodies with a wrapped key scoped to the run before insert. Store no secret value and no provider key column.
- [ ] Startup of `store.ts` refuses to run DDL. `migrate.ts` is the only migration entry.

**You see.**

- [ ] A second identical completion returns the first receipt. A conflicting evidence body throws and leaves the first row in place.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/ledger/store.test.ts` uses a temporary Postgres started by the test, or PGlite if the PR documents that choice in the test header. Run `bun test src/ledger`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no ledger. Record that. On head, insert one run and read it back. Save `ledger-read.png`. Pass when the printed state is `requested`.
- [ ] Lane 2. Crash the test process after the receipt insert statement and before the evidence insert, using the transaction harness. Save `crash.png`. Pass when the retry sees no receipt and inserts both rows.
- [ ] Lane 3. Send the same completion twice. Save `idempotent.png`. Pass when one receipt row exists.
- [ ] Lane 4. Send conflicting evidence for the same attempt. Save `conflict.png`. Pass when the error text is `conflicting completion evidence` and the old digest remains.
- [ ] Lane 5. Insert a prompt body and select the raw column. Save `ciphertext.png`. Pass when the raw column is not valid UTF-8 of the prompt.
- [ ] Lane 6. Delete the run and select source bodies and the audit row. Save `delete.png`. Pass when the body is gone and the audit row has time, actor, and scope only.
- [ ] Lane 7. Call the store entry that would boot the app and confirm it does not create a table. Save `no-boot-ddl.png`. Pass when a fresh database still has zero application tables.
- [ ] Lane 8. Run `migrate.ts` twice. Save `migrate-twice.png`. Pass when the second run changes nothing and exits 0.
- [ ] Lane 9. Attempt to insert a detected secret value through the public store function. Save `no-secret-column.png`. Pass when the function type has no value field and the insert fails closed.
- [ ] Lane 10. Run `bun test src/ledger` and leave the summary visible. Save `ledger-tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time to insert and read one completion transaction. Trunk has no ledger, so there is no trunk ratio. The added work is one transaction. The user-visible end state is the receipt print.
- [ ] Probe. On head, time 100 sequential completion inserts in one scratch database. Run the probe three times and take the median. Do not run it on trunk.
- [ ] Baseline. Record that trunk cannot produce this metric.
- [ ] Rule. Fail if the median of 100 transactions is above 2 seconds on the lane VM. Do not claim a speedup against trunk.

**Review gate.** None. PR-03 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-03 to the stack and the operator lands it.

## Accept GitHub deliveries (PR-04)

**Depends on.** PR-03.

**Files.**

- [ ] Create `src/github/webhook.ts`.
- [ ] Create `src/github/webhook.test.ts`.
- [ ] Create `src/github/identity.ts`.
- [ ] Edit `src/ledger/store.ts` only to add the delivery and request writes this PR needs.

**Build.**

- [ ] Verify the webhook signature before the body is parsed. Store a rejected delivery as id, time, and reason.
- [ ] Map installation, installation-repositories, pull request, and issue comment events into the request rules from ADR 0004, ADR 0013, and ADR 0035. Ignore review-comment and review-thread events for request creation.
- [ ] Accept an owner command only when the trimmed body is one of the four review commands, with an optional leading slash and an optional profile suffix.

**You see.**

- [ ] A second delivery of the same automatic head does not insert a second request. A non-owner comment inserts none.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/github/webhook.test.ts` covers a bad signature, a duplicate delivery, a fork author, the app's own comment, and `opened` plus `synchronize`. Run `bun test src/github`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no webhook handler. Record that. On head, post a fixture `opened` payload. Save `opened.png`. Pass when one request row exists for that head.
- [ ] Lane 2. Replay the same delivery id. Save `replay.png`. Pass when the request count stays 1.
- [ ] Lane 3. Post a bad signature. Save `bad-signature.png`. Pass when no body column is stored and the delivery row has a reason.
- [ ] Lane 4. Post `review full` from a user id that is not the owner. Save `not-owner.png`. Pass when no request is created.
- [ ] Lane 5. Post `please review` from the owner. Save `embedded.png`. Pass when no request is created.
- [ ] Lane 6. Post a draft `synchronize`. Save `draft.png`. Pass when no request is created.
- [ ] Lane 7. Post a ready-for-review event. Save `ready.png`. Pass when one request is created.
- [ ] Lane 8. Post a second head while the first run is active. Save `cancel.png`. Pass when the first run is `cancelled` and one new request exists.
- [ ] Lane 9. Post an issue comment that is the app's own walkthrough. Save `self.png`. Pass when no request is created.
- [ ] Lane 10. Run `bun test src/github` and leave the summary visible. Save `github-tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time to verify a signature and insert one request. Trunk cannot do this. The added work is one delivery. The user-visible end state is the request row.
- [ ] Probe. On head, time 100 fixture deliveries with unique ids. Three runs, median.
- [ ] Baseline. Record that trunk has no handler.
- [ ] Rule. Fail if the median of 100 deliveries is above 2 seconds. Do not claim a ratio against trunk.

**Review gate.** None. PR-04 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-04 to the stack and the operator lands it.

## Acquire the recorded diff (PR-05)

**Depends on.** PR-03.

**Files.**

- [ ] Create `src/github/snapshot.ts`.
- [ ] Create `src/github/snapshot.test.ts`.
- [ ] Create `src/github/fixture-pr.json` from a redacted three-dot files response. No live token in the fixture.

**Build.**

- [ ] `loadSnapshot` reads a GitHub pull request files payload, checks the recorded base and head, and calls `prepareSnapshot`. A fork payload is data. The function has no clone and no command execution.
- [ ] Map a null patch to no changed lines. Refuse a payload whose head is not the recorded head.

**You see.**

- [ ] The fixture's added line numbers match a hand-counted patch, and a swapped head throws `head mismatch`.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/github/snapshot.test.ts` loads `fixture-pr.json` and a mutated head. Run `bun test src/github/snapshot.test.ts`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no `loadSnapshot`. Record that. On head, print changed lines for `src/auth.ts` in the fixture. Save `lines.png`. Pass when the numbers match the fixture's added lines.
- [ ] Lane 2. Mutate the fixture head and rerun. Save `stale.png`. Pass when the error is `head mismatch`.
- [ ] Lane 3. Set one file patch to null. Save `binary-patch.png`. Pass when that path has an empty changed-line list and other files still parse.
- [ ] Lane 4. Remove the hunk header from one patch. Save `bad-patch.png`. Pass when the error names the patch.
- [ ] Lane 5. Duplicate a path in the payload. Save `dup-path.png`. Pass when the error names a duplicate path.
- [ ] Lane 6. Confirm the loader source does not import a git binary runner or `child_process`. Save `no-clone.png`. Pass when the search is empty.
- [ ] Lane 7. Parse a deletion-only hunk. Save `deletion.png`. Pass when changed lines are empty for that file.
- [ ] Lane 8. Parse a rename with a new path. Save `rename.png`. Pass when changed lines attach to the new path only.
- [ ] Lane 9. Compare the fixture SHA fields to the recorded pair the test supplies. Save `sha-pair.png`. Pass when both match before parse.
- [ ] Lane 10. Run the snapshot test file and leave the summary visible. Save `snapshot-tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time to parse the fixture 1,000 times. Trunk cannot parse it. The added work is the parse. The user-visible end state is the changed-line print.
- [ ] Probe. On head, time the 1,000-parse loop three times.
- [ ] Baseline. Record that trunk has no parser entry beyond `prepareSnapshot`, and time 1,000 direct `prepareSnapshot` calls on the same fixture as a reference number, not as a ratio.
- [ ] Rule. Fail if 1,000 `loadSnapshot` calls take more than 1 second. Do not report a speedup against `prepareSnapshot`.

**Review gate.** None. PR-05 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-05 to the stack and the operator lands it.

## Scan secrets on the snapshot (PR-06)

**Depends on.** PR-04 and PR-05.

**Files.**

- [ ] Create `src/runner/gitleaks.ts`.
- [ ] Create `src/runner/gitleaks.test.ts`.
- [ ] Create `src/runner/pin.txt` with the gitleaks version and rule-pack digest.
- [ ] Edit `src/core/evidence.ts` only if the scanner adapter type needs a field the tests cannot supply from outside.

**Build.**

- [ ] Run the pinned gitleaks binary against the snapshot files written to a temp directory. Convert hits to `SecretHit` values. Never put the matched value in a log line.
- [ ] Call `makeSecretEvidence` only through a control-plane callback the runner does not implement in this PR. The runner test uses a fake callback.

**You see.**

- [ ] A fixture containing a known gitleaks test token produces one hit, and the runner result JSON does not contain the token.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/runner/gitleaks.test.ts` uses the pinned binary when present and skips the live binary with an explicit message when it is absent. The skip still runs the JSON-shaping fixture. Run `bun test src/runner`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no gitleaks adapter. Record that. On head, run the fixture scanner. Save `hit.png`. Pass when one hit is printed and the token string is absent from stdout.
- [ ] Lane 2. Run on a clean fixture. Save `clean.png`. Pass when the hit list is empty and the scanner name is completed.
- [ ] Lane 3. Point the binary path at a missing file. Save `missing-bin.png`. Pass when the stage error is generic and the token is absent.
- [ ] Lane 4. Feed a hit whose value is empty. Save `empty-secret.png`. Pass when redaction throws `empty secret value` and review is not called.
- [ ] Lane 5. Overlap a short token and a longer token as the existing redaction test does, through the runner adapter. Save `overlap.png`. Pass when one redaction marker remains.
- [ ] Lane 6. Confirm the rule-pack digest in `pin.txt` matches the file the binary reports. Save `pin.png`. Pass when the two digests are equal or the lane records that the binary is not installed.
- [ ] Lane 7. Pass a repository rule file in the snapshot and confirm it is not loaded as gitleaks config. Save `no-repo-rules.png`. Pass when the command line has no `--config` pointing at the snapshot.
- [ ] Lane 8. Run `executeRunnerEvidence` with the gitleaks adapter and a fake reviewer. Save `order.png`. Pass when the reviewer input contains `[REDACTED SECRET]` and not the token.
- [ ] Lane 9. Fail the scanner and confirm the reviewer callback count is zero. Save `no-review.png`. Pass when the count is zero.
- [ ] Lane 10. Run `bun test src/runner` and leave the summary visible. Save `runner-tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time for one gitleaks run on the fixture snapshot. Trunk cannot run it. The added work is one scan. The user-visible end state is the hit list.
- [ ] Probe. On head, time 10 scans of the same fixture. Median of three sets.
- [ ] Baseline. Record that trunk has no scan.
- [ ] Rule. Fail if the median scan is above 5 seconds on the fixture. The fixture stays under 100 KB. Do not claim a ratio against trunk.

**Review gate.** None. PR-06 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-06 to the stack and the operator lands it.

## Call one model route (PR-07)

**Depends on.** PR-06.

**Files.**

- [ ] Create `src/review/routes.ts`.
- [ ] Create `src/review/prompt.ts`.
- [ ] Create `src/review/review.test.ts`.
- [ ] Create `src/review/fixtures/` with saved responses and no API key.

**Build.**

- [ ] `reviewCandidate` sends redacted patches to one approved alias. `fast` cannot emit a candidate. `verify` cannot change category or severity. `repair` runs once.
- [ ] Refuse the call when privacy attributes are weaker than the repository policy unless the repository explicitly selected that alias. Refuse an unpriced call through `reserve`.
- [ ] Parse model JSON at this boundary. A second malformed output suppresses that candidate and does not fail the run.

**You see.**

- [ ] A saved response with an unknown category becomes a suppression. A saved critical candidate with verdict `unresolved` is not publishable.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/review/review.test.ts` uses saved HTTP responses only. Run `bun test src/review`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no route caller. Record that. On head, replay the affirm fixture. Save `affirm.png`. Pass when the candidate category is `security` and severity is unchanged by verify.
- [ ] Lane 2. Replay a response that contains the raw token after redaction was required. Save `leak.png`. Pass when the caller refuses to store the candidate.
- [ ] Lane 3. Replay an unknown category twice. Save `repair.png`. Pass when the result is a suppression and the run status is not `failed`.
- [ ] Lane 4. Map `fast` and ask for a candidate. Save `fast.png`. Pass when the function returns no candidate.
- [ ] Lane 5. Send a context list over 12,000 estimated tokens for an incremental run. Save `ceiling.png`. Pass when the call body is under the ceiling and the dropped file is named.
- [ ] Lane 6. Use an alias whose price is missing. Save `no-price.png`. Pass when no HTTP fixture is consumed.
- [ ] Lane 7. Use a provider that retains data without an explicit repository choice. Save `privacy.png`. Pass when the call is refused.
- [ ] Lane 8. Verify with the same saved model id the owner mapped to both routes. Save `same-model.png`. Pass when the receipt records same-model verification.
- [ ] Lane 9. Reject a claim and rerun the same head. Save `no-regen.png`. Pass when the rejected fingerprint is not sent again.
- [ ] Lane 10. Run `bun test src/review` and leave the summary visible. Save `review-tests.png`. Pass when the exit code is 0 and no test name says it called the network.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time to plan context and parse one saved response. Trunk cannot do this. The added work is one saved-response review. The user-visible end state is the candidate print. A live model call is out of this budget.
- [ ] Probe. On head, time 100 saved-response reviews. Three runs, median.
- [ ] Baseline. Record that trunk has no reviewer.
- [ ] Rule. Fail if the median of 100 saved reviews is above 2 seconds. Do not include network time and do not claim a ratio against trunk.

**Review gate.** None. PR-07 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-07 to the stack and the operator lands it.

## Claim a run from the runner (PR-08)

**Depends on.** PR-07.

**Files.**

- [ ] Create `src/runner/claim.ts`.
- [ ] Create `src/runner/claim.test.ts`.
- [ ] Create `runner/workflow.yml` pinned by SHA in a config fixture, not by a floating branch.
- [ ] Edit `src/ledger/store.ts` only for the claim and callback token rows.

**Build.**

- [ ] `claimRun` checks audience, immutable runner repository id, `workflow_dispatch`, pinned `workflow_sha`, and a one-time run id. The token expires at 60 minutes or first completion callback.
- [ ] The callback can submit stage results and cannot publish or read another run.

**You see.**

- [ ] A second claim for the same run is rejected. An expired claim does not enter safe mode. It becomes an expired dispatch.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/runner/claim.test.ts` uses forged OIDC fixtures, not live GitHub. Run `bun test src/runner/claim.test.ts`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no claim. Record that. On head, claim a fixture run once. Save `claim.png`. Pass when the run state is `claimed`.
- [ ] Lane 2. Claim it again. Save `second-claim.png`. Pass when the second call is rejected and the first token still expires on use.
- [ ] Lane 3. Present a `workflow_sha` that is not the pinned SHA. Save `wrong-sha.png`. Pass when the claim is rejected.
- [ ] Lane 4. Present a different repository id. Save `wrong-repo.png`. Pass when the claim is rejected.
- [ ] Lane 5. Submit a completion and then call publish with the callback token. Save `no-publish.png`. Pass when publish is rejected.
- [ ] Lane 6. Wait past the fixture expiry without a claim. Save `expired.png`. Pass when the run is an expired dispatch and safe mode is still off.
- [ ] Lane 7. Submit stage results after the callback token is spent. Save `spent.png`. Pass when the second submit is rejected.
- [ ] Lane 8. Confirm the workflow file on the runner path does not contain a secret. Save `workflow.png`. Pass when a secret scan of that file is empty.
- [ ] Lane 9. Dispatch a fourth run while three are active. Save `slot.png`. Pass when the fourth stays `queued`.
- [ ] Lane 10. Run the claim tests and leave the summary visible. Save `claim-tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time to accept one OIDC fixture and write the claim. Trunk cannot do this. The added work is one claim. The user-visible end state is the claimed row.
- [ ] Probe. On head, time 100 claims of distinct fixture runs. Three runs, median.
- [ ] Baseline. Record that trunk has no claim path.
- [ ] Rule. Fail if the median of 100 claims is above 2 seconds. Do not claim a ratio against trunk.

**Review gate.** None. PR-08 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-08 to the stack and the operator lands it.

## Qualify before any publish flag (PR-09)

**Depends on.** PR-08.

**Files.**

- [ ] Create `src/quality/qualify.ts`.
- [ ] Create `src/quality/qualify.test.ts`.
- [ ] Create `src/quality/corpus/` with one TypeScript fixture, one clean change, and a manifest that stores no private source.

**Build.**

- [ ] `qualifyRoute` records model id, provider routing, prompt version, and pipeline version for one language family. A changed version returns not qualified.
- [ ] `shadowCheck` requires one complete live semantic review, a label for every proposed inline finding, and a preview object that is not a GitHub write.
- [ ] `approvePublication` stays false until both pass. Participant responses do not count as labels.

**You see.**

- [ ] A repository with one unlabeled finding cannot approve. A quiet repository with no defects can still approve after the shadow check.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/quality/qualify.test.ts` covers an unlabeled candidate, a missed defect on an inspected pull request, and a saved-response replay that does not spend budget. Run `bun test src/quality`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk treats `qualified` as a boolean argument. Record that. On head, a missing corpus record stays unqualified. Save `unqualified.png`. Pass when publication planning receives `qualified: false`.
- [ ] Lane 2. Label every finding on the fixture shadow review and approve. Save `approved.png`. Pass when the preview write count to GitHub is zero and approval becomes true.
- [ ] Lane 3. Leave one finding unlabeled. Save `unlabeled.png`. Pass when approval stays false.
- [ ] Lane 4. Change the prompt version. Save `requalify.png`. Pass when the route is unqualified again.
- [ ] Lane 5. Record a participant reply as if it were a label. Save `participant.png`. Pass when the label count does not increase.
- [ ] Lane 6. Replay a saved response and read the budget reservation table. Save `saved-replay.png`. Pass when no new reservation exists.
- [ ] Lane 7. Run a live-fixture flag in the test double that does reserve. Save `live-spend.png`. Pass when one reservation exists and an unpriced route still refuses.
- [ ] Lane 8. Omit an unqualified Python file from a mixed fixture. Save `mixed.png`. Pass when the plan check is neutral and the omitted path is listed.
- [ ] Lane 9. Preview the exact comment body and then change the head. Save `stale-preview.png`. Pass when approval does not apply to the new head.
- [ ] Lane 10. Run `bun test src/quality` and leave the summary visible. Save `quality-tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time to evaluate one saved corpus row. Trunk cannot do this. The added work is one row. The user-visible end state is the qualified flag.
- [ ] Probe. On head, time 100 evaluations of the same saved row. Three runs, median.
- [ ] Baseline. Record that trunk has no qualifier.
- [ ] Rule. Fail if the median of 100 evaluations is above 1 second. Do not claim a ratio against trunk.

**Review gate.** None. PR-09 is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-09 to the stack and the operator lands it.

## Publish one current-head review (PR-10)

**Depends on.** PR-09.

**Files.**

- [ ] Create `src/github/publish.ts`.
- [ ] Create `src/github/publish.test.ts`.
- [ ] Edit `src/core/evidence.ts` only to return data the publisher needs and to keep the decisions already asserted.
- [ ] Create `src/cli/preview.ts` so the owner can print the exact output locally.

**Build.**

- [ ] Render one issue comment that starts with `<!-- codepoppy:walkthrough -->` and update it in place. Render one check per head. Render at most the capped inline set, each with scenario, changed line, context, consequence, and next step.
- [ ] Before each write, reload the pull request head. If it moved, write nothing. A second write with the same fingerprint updates the comment. Two marker comments enter safe mode and write nothing further.
- [ ] The CLI preview uses the same renderer and performs no GitHub write.

**You see.**

- [ ] The owner CLI prints one walkthrough and one inline finding for the fixture, and a repeated publish does not create a second comment id.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/github/publish.test.ts` uses a fake GitHub writer that records comment ids. Run `bun test src/github/publish.test.ts`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk's `planPublication` returns a plan and writes nothing. Record that. On head, run the publisher against the fake GitHub and gate one walkthrough plus the inline finding. Save `first-write.png`. Pass when one comment id and one check id exist.
- [ ] Lane 2. Run publish again. Save `retry.png`. Pass when the comment id is unchanged.
- [ ] Lane 3. Change the fake pull request head before write. Save `stale-write.png`. Pass when the writer receives zero writes.
- [ ] Lane 4. Seed two marker comments. Save `duplicate-marker.png`. Pass when safe mode turns on and no third comment is created.
- [ ] Lane 5. Publish a required-stage failure. Save `failed-check.png`. Pass when the check conclusion is failure and no walkthrough body is created.
- [ ] Lane 6. Publish a closed pull request. Save `closed.png`. Pass when the writer receives zero writes.
- [ ] Lane 7. Publish a clean fully covered review. Save `clean.png`. Pass when the check is success and the body does not say the pull request is safe to merge.
- [ ] Lane 8. Publish 11 critical findings. Save `cap-write.png`. Pass when ten inline comments exist and the walkthrough names the omitted fingerprint.
- [ ] Lane 9. Run the CLI preview. Save `preview.png`. Pass when stdout contains the marker and the fake writer log stays empty.
- [ ] Lane 10. Run the publish tests and leave the summary visible. Save `publish-tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time from a complete fixture run to the fake writer's last comment. Trunk cannot write. The added work is one publish. The user-visible end state is the printed walkthrough.
- [ ] Probe. On head, time 30 publishes of the same already-complete fixture, interleaving a trunk `planPublication` call only as a sanity check that trunk still returns a plan. Do not treat the trunk call as the same metric.
- [ ] Baseline. Record the trunk `planPublication` time separately and record that trunk has no write metric.
- [ ] Rule. Fail if the head median publish is above 1 second on the fake writer. Do not claim a ratio against `planPublication`.

**Review gate.** The operator reviews before this PR is marked ready to land.

- [ ] Copy lane 1 and lane 9 screenshots into `docs/review-media/PR-10-review-write.png` and `docs/review-media/PR-10-review-preview.png`.
- [ ] Record a 30 to 60 second video of the CLI preview and the retry on a lane VM. Save it as `docs/review-media/PR-10-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at stack-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-10 to the stack and the operator lands it.

## Set up one reference install (PR-11)

**Depends on.** PR-10.

**Files.**

- [ ] Create `src/cli/setup.ts`.
- [ ] Create `src/cli/doctor.ts`.
- [ ] Create `src/cli/cli.test.ts`.
- [ ] Edit `README.md` so the reproduction steps match the commands this PR adds.
- [ ] Create `src/control-plane/worker.ts` with the health route and the webhook route only.

**Build.**

- [ ] `codepoppy setup` walks GitHub App, Cloudflare, Postgres, runner repository, and one provider key. It prints the action and waits for confirmation before any external write. It does not print credential values.
- [ ] `codepoppy doctor` checks webhook delivery, runner claim, route eligibility, and one completed shadow review of a pull request the owner names. It does not open a pull request.

**You see.**

- [ ] Doctor against the fixture stack prints a completed shadow review and a zero GitHub write count.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/cli/cli.test.ts` drives the CLI through its exported functions and a fixture prompt that answers yes. Run `bun test src/cli`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no `codepoppy doctor`. Record that. On head, run doctor against the fixture. Save `doctor.png`. Pass when the shadow review line says complete.
- [ ] Lane 2. Answer no to the first external write. Save `decline.png`. Pass when the following write is not attempted.
- [ ] Lane 3. Interrupt setup after the database step and run it again. Save `resume.png`. Pass when the completed step is skipped and the secret is not reprinted.
- [ ] Lane 4. Point doctor at a missing webhook delivery. Save `no-webhook.png`. Pass when the check fails and names delivery.
- [ ] Lane 5. Point doctor at an unpinned workflow SHA. Save `unpinned.png`. Pass when the runner check fails.
- [ ] Lane 6. Select a pull request the owner did not name. Save `wrong-pr.png`. Pass when doctor refuses it.
- [ ] Lane 7. Run doctor on a repository that is not enabled. Save `disabled.png`. Pass when no review is started.
- [ ] Lane 8. Confirm the README commands match `setup.ts` usage text. Save `readme-commands.png`. Pass when every command in the README exists in the usage text.
- [ ] Lane 9. Request `GET /health` from the local worker. Save `health.png`. Pass when the status is 200 and the body has no credential.
- [ ] Lane 10. Run `bun test src/cli` and leave the summary visible. Save `cli-tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time from `codepoppy doctor` start to the completed-shadow line on the fixture stack. Trunk cannot run doctor. The added work is one doctor run. The user-visible end state is that line.
- [ ] Probe. On head, time 10 doctor runs against the already loaded fixture. Three sets, median. Do not include a live provider call.
- [ ] Baseline. Record that trunk has no doctor.
- [ ] Rule. Fail if the median doctor run is above 5 seconds on the fixture. Do not claim a ratio against trunk.

**Review gate.** The operator reviews before this PR is marked ready to land.

- [ ] Copy lane 1 and lane 3 screenshots into `docs/review-media/PR-11-review-doctor.png` and `docs/review-media/PR-11-review-resume.png`.
- [ ] Record a 30 to 60 second video of setup declining a write and doctor passing on a lane VM. Save it as `docs/review-media/PR-11-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at stack-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-11 to the stack and the operator lands it.

## Show the owner the ledger (PR-12)

**Depends on.** PR-11.

**Files.**

- [ ] Create `src/control-plane/dashboard.ts`.
- [ ] Create `src/control-plane/dashboard.test.ts`.
- [ ] Edit `src/cli/doctor.ts` only to link the local dashboard URL it already prints.

**Build.**

- [ ] Serve runs, findings, labels, cost, and safe-mode state to a session that has proved the configured owner id. A collaborator session gets 403.
- [ ] Label and missed-defect actions write ledger rows. They do not write GitHub. Deletion removes source-bearing rows for the chosen scope.

**You see.**

- [ ] The owner session shows one shadow finding and can mark it actionable. A second browser session without the owner proof cannot read it.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `src/control-plane/dashboard.test.ts` covers owner allow, collaborator deny, label write, and deletion. Run `bun test src/control-plane`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.7-xhigh-fast` at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Trunk has no dashboard. Record that. On head, request the run route as the owner. Save `owner.png`. Pass when the finding text is in the body.
- [ ] Lane 2. Request the same route with another user id. Save `collaborator.png`. Pass when the status is 403 and the body has no finding text.
- [ ] Lane 3. Submit an actionable label. Save `label.png`. Pass when the ledger row exists and the GitHub writer log is empty.
- [ ] Lane 4. Record a missed defect. Save `miss.png`. Pass when the miss is stored against the inspected head only.
- [ ] Lane 5. Turn safe mode on from the owner route. Save `safe.png`. Pass when a subsequent dispatch fixture stays undispatched.
- [ ] Lane 6. Delete one run. Save `deleted-run.png`. Pass when the source body is gone and the audit row remains.
- [ ] Lane 7. Request a prompt body for a sensitive repository. Save `sensitive.png`. Pass when the response says the body is not retained.
- [ ] Lane 8. Load cost for the fixture month. Save `cost.png`. Pass when the figure matches the reservation sum and no provider key is present.
- [ ] Lane 9. Call a model route from the dashboard handler and confirm the handler has no such call. Save `no-model.png`. Pass when the route list contains no provider host.
- [ ] Lane 10. Run `bun test src/control-plane` and leave the summary visible. Save `dashboard-tests.png`. Pass when the exit code is 0.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time from the owner request to the finding text. Trunk cannot serve it. The added work is one page read. The user-visible end state is that text.
- [ ] Probe. On head, time 30 owner reads of the fixture run. Three sets, median.
- [ ] Baseline. Record that trunk has no page.
- [ ] Rule. Fail if the median read is above 500 milliseconds. Do not claim a ratio against trunk.

**Review gate.** The operator reviews before this PR is marked ready to land.

- [ ] Copy lane 1 and lane 2 screenshots into `docs/review-media/PR-12-review-owner.png` and `docs/review-media/PR-12-review-denied.png`.
- [ ] Record a 30 to 60 second video of the owner label action and the denied session on a lane VM. Save it as `docs/review-media/PR-12-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at stack-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends PR-12 to the stack and the operator lands it.

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the stack root, the stack tip, a one-line verdict for each PR, and anything parked. Python, Go, native OpenAI, native Anthropic, and SvelteKit and TanStack Start path ranking stay parked until the TypeScript and JavaScript route has a stack-ready shadow review. They are later PRs, not part of this stack.

## Appendix A. Prototype evidence

The publication probe is `/tmp/codepoppy-prototypes/publication-contract.mjs`. It imported `planPublication` and `prepareSnapshot` from `src/core/evidence.ts` and printed seven results on 2026-10-15. There is no git branch and no SHA because the worktree is not a repository. No screenshots were taken. The run was a terminal observation.

The affirmed low finding returned `check: success`, zero inline findings, and a walkthrough that counted one walkthrough finding. The empty review returned the sentence `No actionable findings in the reviewed changes.` A failed run with approval false returned `failure-check`. Partial coverage with no findings returned neutral. Skipped coverage returned skipped.

That probe decided the three rulings in the spec. It did not decide quality-threshold numbers. Those stay unproven until the owner calibrates a corpus. It did not decide a live GitHub write, because no GitHub token was used.

## Appendix B. Alternatives rejected

A single process that holds GitHub, the model, and Postgres lost. ADR 0003 already separates the keys, and one process would put the database URL on the runner.

Per-repository counts of 50 rows and 15 real defects lost. ADR 0058 superseded them. Requiring them would block a quiet repository.

Summary-only publication, then high and critical, then medium after 20 runs, lost. ADR 0059 publishes medium, high, and critical together after qualification.

Shipping the current `planPublication` walkthrough string as the GitHub comment lost. The probe showed a count sentence. ADR 0061 requires a failure scenario, the changed line, context, a consequence, and a next step. The publisher renders that text. The plan stays the decision.

Putting Python, Go, and the native providers in this stack lost. The PRD requires them for the evaluation release, and the first internal checkpoint is TypeScript and JavaScript through OpenRouter. The stack proves that checkpoint. The other languages are parked so this stack stays one linear review.

A browser dashboard before the CLI doctor lost. The owner can label a finding from a local HTTP route in PR-12. Setup and the first shadow proof stay on the CLI because that is the path ADR 0062 names, and the run has a CLI control skill rather than a proven browser one.

## Appendix C. Risks

PR-04 and PR-10 can be proven against a fake GitHub writer. They cannot prove a real webhook or a real comment until the operator supplies a GitHub App and a repository. The owner watches the first real delivery outside this plan and does not treat fixture lanes as that proof.

PR-06 depends on a pinned gitleaks binary. A lane without the binary must record the skip and still pass the JSON-shaping fixture. A missing pin digest fails the lane.

PR-07 must not call a live model in CI. A live qualification run spends the personal budget under ADR 0063. The owner watches any lane that wants a live key and supplies it explicitly.

PR-11 writes to the owner's Cloudflare, Postgres, and GitHub accounts only after confirmation. A lane uses fixtures. The operator runs the real setup. The plan does not store those credentials.

PR-12 has no `control-ui` skill wired in this workspace. The live lanes use HTTP responses and terminal screenshots. A visual browser pass is a follow-up if the operator wants pixel review. That gap does not block the ledger behavior.

The repository has no git remote. No PR can open until the operator names one. That is a stop, not a default the program guesses.

## Appendix D. Links and reading list

Read `CodePoppy-PRD.md`, `GLOSSARY.md`, and `docs/specs/2026-10-15-self-hosted-reviewer.md` before editing. Read the ADR that owns the PR. PR-02 reads ADR 0017, ADR 0023, ADR 0027, ADR 0028, ADR 0005, and ADR 0059. PR-03 reads ADR 0003, ADR 0021, ADR 0029, and ADR 0052. PR-04 reads ADR 0004, ADR 0013, ADR 0033, and ADR 0035. PR-05 reads ADR 0002 and ADR 0034. PR-06 reads ADR 0041. PR-07 reads ADR 0006, ADR 0020, ADR 0024, ADR 0025, and ADR 0026. PR-08 reads ADR 0038, ADR 0045, and ADR 0051. PR-09 reads ADR 0058, ADR 0060, and ADR 0063. PR-10 reads ADR 0009, ADR 0015, ADR 0048, ADR 0054, and ADR 0061. PR-11 reads ADR 0037 and ADR 0062. PR-12 reads ADR 0030 and ADR 0050.

PR-02, PR-07, and PR-10 get `pstack/skills/how/SKILL.md` before the edit and `pstack/skills/interrogate/SKILL.md` before the code-ready report. Those three change a decision the rest of the stack trusts.

The decision trail follows `pstack/skills/show-me-your-work/SKILL.md`. Each owner keeps `decisions.tsv` uncommitted and returns it with the stack-ready report.
