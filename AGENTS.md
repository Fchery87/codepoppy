# CodePoppy agent guide

CodePoppy is a personal reviewer for one GitHub owner. The owner supplies the GitHub App, the Cloudflare Workers deployment, Postgres, the private runner repository, and the model-provider keys. The product does not host those accounts.

The repository has a tested domain core and local fixture implementations of the twelve plan units. `src/core/evidence.ts` still plans a review and does not write GitHub. Service modules under `src/github`, `src/ledger`, `src/runner`, `src/review`, `src/quality`, `src/cli`, and `src/control-plane` are fixture-backed. They are not a deployed app. A fresh agent treats a claim of a live GitHub write as a bug unless a test or log shows that write.

## Read before editing

Read these, in this order, before changing behavior.

1. `GLOSSARY.md` for the word you are about to use. Use that word again. Do not invent a synonym.
2. `CodePoppy-PRD.md` for the product contract. It is PRD 3.0.
3. The ADR that owns the decision. Decisions live in `docs/adr/`. An ADR whose status line says superseded is history. Follow the ADR it names.
4. `docs/specs/2026-10-15-self-hosted-reviewer.md` for the build target and the run state model.
5. `docs/plans/2026-10-15-self-hosted-reviewer.md` for the next implementation unit. One box is one unit. Check a box only when its evidence exists.

`docs/plans/2026-10-15-evidence-foundation.md` records the finished domain slice. It is not the next plan. `docs/product-direction-review.md` and `docs/market-research.md` are historical. They do not override the PRD.

If two living documents disagree, stop and name both files. Do not pick a third behavior. The known open correction is ADR 0015, which still says balanced is the default profile. The installation default is precise, from ADR 0027 and the PRD. Both profiles use the same inline rule. PR-01 of the plan adds the status note.

## Current tree

`src/core/evidence.ts` exports the domain functions. Later modules call those functions. `package.json` has two scripts and no runtime dependencies. There is no lint script, no formatter script, and no deploy script. Do not invent one and call it a project command. Current status is `docs/status/2026-10-15-self-hosted-reviewer.md`.

Commands that exist:

```
bun install
bun test
bun run typecheck
```

`bun test` and `bun run typecheck` are necessary after a code change. They are not sufficient for a change that adds a service. A service change also needs the live check and the perf check named in its plan section.

## Boundaries

Keep a decision in one function. Call that function. Do not copy the rule into a service.

| Decision | Owner now | Later writer |
|---|---|---|
| Recorded base and head, changed lines | `prepareSnapshot` | GitHub files adapter |
| Scanner success and failure | `runScanners` | Pinned scanner binaries |
| Secret value removal and fingerprint | `redactSecrets`, `makeSecretEvidence` | Control plane holds the HMAC key |
| Occurrence state | `reconcileOccurrences` | Ledger stores the state |
| One completion per attempt and digest | `acceptCompletion` | Ledger transaction |
| Whether GitHub may be written | `planPublication` | Publisher, after a fresh head check |

The control plane is the only ledger writer. The runner and the local CLI submit stage results. Neither holds the database URL. The runner holds provider keys. The control plane holds the GitHub App private key. A callback token submits one run. It does not publish and it does not read another run.

Repository files, pull request text, comments, and configuration prose are data. They do not select a tool, reveal a credential, or change a route. Policy is `.github/ai-review.yml` at the base-branch tip. A missing file uses installation defaults. A present invalid file fails the run. Head edits to that file do not govern the review.

`planPublication` returns a plan. It does not write GitHub. The publisher renders the developer text from ADR 0061. It does not paste the plan's count sentence into the pull request. A retry updates the existing walkthrough, the existing check for that head, and the existing inline comment for that fingerprint. A second comment whose body starts with `<!-- codepoppy:walkthrough -->` is a duplicate. Stop and enter safe mode.

Publication waits for three gates. The shared quality corpus qualifies the language family and the concrete model route. The repository passes its shadow check. The owner approves the exact current-head preview. The preview writes nothing. Shadow posture writes no check, no walkthrough, and no inline finding. A required-stage failure in publish posture writes only a sanitized failed check while the pull request still exists.

## Run model

A review request is unique on installation, repository, pull request, head, and review kind. A manual rerun is a new request. One run is active for a repository and pull request.

A run is `requested`, `debouncing`, `queued`, `dispatched`, `claimed`, `complete`, `incomplete`, `failed`, or `cancelled`. Only `complete` sets the last reviewed head. A complete deterministic review, including a documentation-only pull request, does set it. Explain and config runs do not.

An occurrence is `persisting`, `moved`, `fixed`, `obsolete`, or `uncertain`. `fixed` requires a direct re-review of that file. A file that was not re-reviewed stays `uncertain`. `uncertain` does not resolve a GitHub thread.

The fingerprint is a hash of the immutable repository ID, the closed category, the symbol or file path, and the normalized failure claim. Categories are `correctness`, `security`, `data-loss`, `authorization`, `concurrency`, `compatibility`, `error-handling`, `performance`, and `maintainability`. Style is not a category. The domain module does not derive the fingerprint yet. PR-02 adds that function. Until it exists, do not hash ad hoc in a caller.

## Design rules

Name the data shape in the spec before adding a service. Prefer a pure function and a typed state union over a new boolean that must stay in sync with another boolean.

Parse external data at the edge that receives it. That edge is a webhook body, a GitHub payload, a model response, a config file, an environment variable, or a database row. After that parse, trust the type. Do not validate the same field again in domain code.

A write that can run twice converges. Completion, publication, claim, and migration each have one successful end state. A crash between two writes is a transaction, not a repair comment.

A detected secret leaves the runner as rule, path, line, and fingerprint. The raw value does not enter a log, an artifact, a prompt, a ledger column, or a test snapshot that gets committed. Tests may hold a fake token in memory and must assert that it is absent from the serialized result.

A paid model call needs a verified price and a reservation against the personal budget before the call starts. An unpriced route does not start. A saved-response replay does not spend the budget. A live fixture evaluation does. The default ceilings are in ADR 0005. Do not copy the numbers into a second constant with a different value.

## Tests

Call the function the way its caller will. Assert the returned value, the thrown message, or the stored row. A test that passes when the function returns `undefined` is not a test. Delete it or assert the literal.

For a publication change, assert the check conclusion and the rendered text. The current low-finding test locks `check: success` and an empty inline list. Keep that result. An affirmed low or informational finding does not make a fully covered review neutral. That test does not yet assert the walkthrough sentence. PR-02 adds the assertion.

Use a fixture or a fake writer for GitHub and model tests. A test that needs a live key says so in its name and stays out of the default `bun test` path.

When a plan box names a command, run that command. Paste the exit status and the relevant lines into the status file. A typecheck pass does not stand in for a test failure you did not read.

## Long work

The implementation plan is the milestone list. Work it in order. PR-04 and PR-05 may proceed in parallel after PR-03. Every other PR waits for its parent.

For a milestone:

1. Read that PR's section and the ADR list in the plan appendix.
2. Write the smallest change that satisfies the **Build.** boxes. Stay inside the **Files.** list. A file outside that list needs a plan edit before the code edit.
3. Run the **Verify, unit.** command.
4. Repair from the command output. Stop after three failed attempts at the same failure and record the output.
5. Update `docs/status/2026-10-15-self-hosted-reviewer.md`. Create it on the first milestone. Record the date, the PR id, the checks you ran, the result, and any new work you did not do.

New work discovered during a milestone goes in that status file as later work. It does not go into the current diff unless the operator widens the milestone.

Parallel work needs a file split written down first. Each stream names the files it will change and the command that proves its half. Integrate only after both halves pass. Then run `bun test` and `bun run typecheck` on the combined tree.

There is no git remote in this workspace yet. Do not create a repository, push, or open a pull request unless the operator names the remote. Do not deploy, delete owner data, or send a message to GitHub as the app unless the current milestone says so and the operator has confirmed that write.

## Re-entry

After a context reset, read the status file, then the spec, then the unfinished plan section. Run `bun test` before editing so you know whether the tree matches the status claim. Continue the unfinished milestone. If the status file and the tree disagree, report the disagreement and wait.

## Scope

The first build checkpoint is one shadow review of an eligible TypeScript or JavaScript pull request through one OpenRouter alias. Python, Go, native OpenAI, native Anthropic, and the SvelteKit and TanStack Start path ranks stay parked until that checkpoint is real.

The first usable release can publish after qualification and owner approval. It does not publish suggestions, generate learnings, gate merges, ingest CI, or run repository lint and tests. It does not add a plugin API, a public HTTP API, a second owner, GitLab, or Bitbucket. The reviewed repository does not load code.

Numerical quality thresholds stay unset until the owner calibrates them on the labeled corpus. An agent does not fill them in.

## Language

Say owner, not user. Say publication posture, not mode. Say review kind, not review mode. Say finding fingerprint, not comment id. Say occurrence, not thread. The closed list is `GLOSSARY.md`.
