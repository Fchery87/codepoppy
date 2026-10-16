# CodePoppy Product Requirements

**Status:** Accepted
**Version:** 3.0
**Date:** October 14, 2026
**License:** Apache-2.0
**Project name:** CodePoppy

Terms live in `GLOSSARY.md`. Decisions live in `docs/adr/`. This document is the product contract. It does not repeat rejected alternatives.

## Product

CodePoppy is a personal, model-agnostic reviewer for GitHub pull requests. It reviews the exact three-dot diff, shows what it reviewed and what it skipped, and keeps findings that it can support. An evaluation release runs in shadow. The first usable release can publish a walkthrough and verified inline findings after qualification and owner approval.

The owner supplies a GitHub App, a Cloudflare Workers deployment, a Postgres database, a private runner repository, and model-provider keys. CodePoppy does not host those accounts. The reference database is Neon. Any Postgres that can run the schema is acceptable. There is one owner, identified by an immutable GitHub user ID configured in the deployment. A renamed login still matches. There is no second owner, no sign-up, and no transfer flow.

Package, domain, organization, and trademark clearance happen before the first public release, not before private use.

## Evaluation release

- A GitHub App, owner login, and explicit repository enablement.
- A configuration pull request, guided setup, the CLI, deletion, and safe mode.
- Shadow review of TypeScript, JavaScript, Python, and Go.
- SvelteKit and TanStack Start awareness.
- Secret redaction, file classification, and three-dot diff mapping before any model call. Tree-sitter is attempted before semantic review; a parse failure is recorded in coverage.
- OpenRouter, native OpenAI, and native Anthropic through logical routes.
- A dashboard of coverage, findings, latency, and cost.
- A consented, labeled quality corpus and local evaluation reports used to qualify the reviewer.

The evaluation release writes no GitHub checks, walkthrough comments, or inline findings. Its purpose is to make the end-to-end review path and quality measurements observable to the owner.

The first internal checkpoint proves one complete shadow-review path for TypeScript and JavaScript through OpenRouter, using one approved route alias on an eligible pull request. The route must satisfy the default privacy policy. This checkpoint does not change the evaluation release requirements above. The owner selects the test repository and pull request before the checkpoint runs.

## First usable release

After shared qualification, a repository shadow check, and owner approval, the first usable release adds current-head GitHub output: one coverage walkthrough and check, plus verified medium, high, and critical inline findings when present. It can publish qualified portions of a mixed-language pull request with explicit omissions and a neutral check. A completed review with no actionable findings still gets a walkthrough and check.

The first usable release does not include:

- Languages beyond the four above, or framework packs beyond the two above.
- Repository lint, repository tests, CI ingestion, and CODEOWNERS.
- A special review policy for dependency bots.
- Published suggestions, approved learnings, merge gating, and Docker.
- A public plugin API, a public HTTP API, or multi-user administration.

Suggestion and learning rules below define future boundaries. They are not acceptance criteria for the first usable release.

## Acceptance

The evaluation release is complete when all of the following are true:

- The owner can sign in, enable a repository, and open its configuration pull request.
- An eligible event creates one automatic review request for the newest head.
- The runner reviews the recorded base and head, and the control plane is the only ledger writer.
- An absent configuration file uses installation defaults. An invalid file fails the run before a model call.
- Shadow runs produce verified findings, suppression reasons, coverage, and cost.
- The owner can label publication candidates and record confirmed missed defects on inspected changes.
- Invalid webhook signatures are rejected before the body is parsed or stored.
- Secrets are redacted before any model call. Fork code is never executed.
- Privacy cannot be weakened silently. Safe mode stops dispatch and publication.
- Deleting a run, repository, or installation removes source-bearing data.
- Duplicate delivery and workflow retry do not create a second automatic request.
- A newer request cancels the older run. A required-stage failure prevents findings and a clean walkthrough.
- The personal infrastructure target is $0–$5 per month before model calls.
- Model calls stop at the personal budget. A paid route with unknown pricing cannot start a call.
- Guided setup and doctor verify an owner-selected eligible test pull request through a completed shadow review. A self-hoster can reproduce the deployment from the documentation.

The first usable release is complete when the shared quality gate qualifies each published language family and model route, the repository passes its live shadow check, and the owner can approve publication after previewing the exact current-head output. Completed reviews publish the walkthrough, check, and eligible inline findings as specified below. Mixed-language omissions, zero-finding reviews, required-stage failures, stale heads, and retries must produce the specified GitHub output without duplicate writes.

## Owner and access

GitHub is the only identity provider. Only the configured owner can sign in. A dashboard session proves the owner and cannot call GitHub or a model by itself. Shadow findings, retained prompts, and cost are visible only in that session.

A review command counts only when the commenting user is that owner. The whole trimmed comment is one of:

- `review`
- `review full`
- `review explain`
- `review config`

It may end with `precise`, `balanced`, or `thorough`. A leading slash is accepted and is not required. Other text does not create a review request. The owner can also request a review from the dashboard. A command cannot override privacy, enablement, SHA pinning, or a hard budget ceiling. Explain and config create no findings and do not move the last reviewed head. A check button opens the dashboard and never dispatches a review. A participant's explicit clarification request in a published finding's thread is handled under Publication and is not a review command.

## GitHub App

Repository permissions:

| Permission | Access | Why |
|---|---|---|
| Contents | write | Open the configuration pull request |
| Pull requests | write | Read the diff and commands; write the review and walkthrough after qualification |
| Checks | write | Write the check after qualification |
| Actions | write | Dispatch the private runner workflow |
| Metadata | read | Required by GitHub |

Issues write, Workflows, and commit statuses are not requested. Actions read is not requested, because the first usable release does not ingest CI. The app cannot modify `.github/workflows`.

Subscribed events are installation, installation repositories, pull request, issue comment, pull request review comment, and pull request review thread. The last two record participant feedback and handle explicit clarification requests after publication; they never create a review request. Check runs, check suites, and workflow runs are not subscribed.

An installation token is limited to the repository that needs it. Dispatch uses Actions write on the private runner repository. Review of that repository is off unless the owner enables it.

## Events

An automatic request is created only for `opened`, `reopened`, `ready_for_review`, and `synchronize` on an enabled, non-draft pull request. Edited, labeled, assigned, and review-requested actions do not create a request. A comment on an issue that is not a pull request does not create a request. Review comment and review thread events do not create a review request. The app ignores its own comments.

Enabling a repository imports open pull requests and reviews none of them. A draft is ignored until it becomes ready, unless the owner requests it. A push to a draft creates nothing. Reopening creates a new automatic request even when the head was reviewed before.

An automatic trigger whose pull request has no semantic-review eligible file, including a documentation-only pull request, still runs classification and secret detection. It stores a complete deterministic run with no semantic review and moves the last reviewed head. An owner request follows the same rule.

Automatic triggers wait two minutes from the latest event for that pull request, then dispatch the newest head. A manual trigger does not wait, and it cancels a pending automatic wait. Closing, converting to draft, or disabling the repository cancels the wait. It does not flush a review.

An automatic request is unique on installation, repository, pull request, head, and review kind. A manual rerun is a new request linked to the earlier one. One run is active for a repository and pull request. A newer request cancels the older one before dispatch.

## Diff and acquisition

The diff is GitHub's three-dot pull request diff. Checkout reads file contents at the recorded SHAs. A local two-dot diff is not the review diff.

A same-repository head may be checked out. A fork is not cloned and its commands are not run. The runner checks out the base repository at the recorded base SHA and reads the fork head through the pull request API. A review is true for its recorded base and head. CodePoppy does not poll for a base-branch move.

If the pull request is closed, merged, deleted, or inaccessible before publication, the run is cancelled and nothing is written. That is not a required-stage failure. A permission failure while the pull request still exists is a required-stage failure.

## Configuration

Trusted configuration is `.github/ai-review.yml` at the tip of the pull request's base branch, read through the GitHub API. The head cannot govern its own review. Branch protection is not required. The dashboard warns when the base branch is unprotected.

When a repository is enabled, CodePoppy opens one pull request onto the default branch from `codepoppy/config`. The file is version 1 and records the detected languages, the precise profile, the shadow posture, the default privacy policy, and the path excludes the owner accepted. An existing CodePoppy pull request is updated. The owner merges it. CodePoppy never merges it and never force-pushes.

The config branch is updated only when the open pull request is the one CodePoppy opened and the branch tip is a commit CodePoppy created. Any other existing branch is a collision. The dashboard shows it and nothing is pushed.

Until the file is on the base branch, installation defaults apply: precise profile, shadow posture, no provider retention, and no extra path excludes. An absent file is not a failure. A present file is invalid when it has an unknown field, lacks `version: 1`, names an unapproved route alias, sets a repository budget above the personal ceiling, or uses a posture other than shadow or publish. An invalid file fails the run before classification and before a model call. The dashboard shows the line and field.

The file may set profile, excludes, privacy, approved route aliases, and the requested publication posture. It cannot set the personal budget, name an endpoint, or select code. A request to publish takes effect only when the relevant language families and concrete model routes qualify, the repository shadow check passes, and the owner approves the exact output preview. A learning changes behavior only after it is merged into this file. The first usable release does not generate learnings.

## Files and size

A relevant file is readable text that is not binary, generated, vendored, minified, or a lockfile. Excluded files still get classification and secret detection.

| Class | Rule | Semantic review |
|---|---|---|
| Small | At most 10 relevant files, 500 lines, and 100 KB | Full eligible coverage |
| Medium | At most 30 files, 1,500 lines, and 500 KB | Full eligible coverage inside the ceilings |
| Large | At most 75 files, 5,000 lines, and 2 MB | Deep review in risk rank until the context ceiling; summarize the rest |
| Oversized | Above any large limit | Deterministic checks, a change summary, and named omissions |

Bytes or estimated tokens can move a pull request up a class. Nothing moves it down. Oversized pull requests get semantic review only when the owner requests a full review.

A file is binary when its first 8 KB contains a NUL byte or its extension is `png`, `jpg`, `jpeg`, `gif`, `webp`, `ico`, `icns`, `pdf`, `zip`, `gz`, `tgz`, `bz2`, `7z`, `rar`, `jar`, `wasm`, `class`, `exe`, `dll`, `so`, `dylib`, `bin`, `woff`, `woff2`, `ttf`, `otf`, `eot`, `mp3`, `mp4`, `mov`, `avi`, `webm`, `sqlite`, or `db`. A file is minified when its name contains `.min.` or any line exceeds 1,000 characters. A file is vendored when a path segment is `vendor`, `third_party`, or `node_modules`. A file is generated when one of its first 40 lines contains `@generated`, `Code generated`, or `DO NOT EDIT`, case-insensitively, or when trusted configuration lists its path. Configuration may include a path a path rule excluded. It cannot include a binary file.

Documentation is Markdown, reStructuredText, AsciiDoc, files under a docs directory, and license and changelog files. Configuration is not documentation. A pull request that mixes documentation with another relevant file is not documentation-only.

Risk rank is: a secret hit; then a filename or path segment containing `auth`, `session`, `login`, `payment`, `billing`, `migration`, or `migrate`, or anything under `.github/workflows`; then SvelteKit files named `hooks.server.*`, `+page.server.*`, or `+server.*`, and TanStack Start files under `src/server` or `app/server`; then the largest files.

A test file has a path segment of `test`, `tests`, or `__tests__`, or a filename containing `.test.` or `.spec.`. It may be included as context only when its text also contains the symbol being reviewed.

Secret detection uses the gitleaks default rule pack pinned by CodePoppy. The repository cannot change the patterns. A hit stores the rule type, file, line, and a salted one-way fingerprint. The value is redacted before any model call, log, artifact, or ledger body. The salt stays on the control plane.

## Pipeline

The pipeline is a fixed sequence. The model has no tool that can run a repository command, write GitHub, or read a secret. Source, pull request text, comments, and configuration prose are untrusted data.

Required always: intake, acquisition of the recorded head, evaluation of trusted configuration, evaluation of privacy, and redaction. Required when semantic review was supposed to run: context planning, candidate generation, verification, and storing the result. Optional: classification, tree-sitter, and the change summary.

If classification fails, the affected files are excluded from the model. If tree-sitter fails, semantic review may continue and fingerprints use the file path. A privacy policy that evaluates and then skips the model is a complete deterministic review, not a failure. Being unable to evaluate privacy is a failure.

Context is added in this order: the hunk, the enclosing symbol, the direct imports that symbol uses, tests that name that symbol, and a failing deterministic result on that file. Anything else needs a recorded reason and a token estimate. An automatic incremental review sends at most 12,000 estimated input tokens. Every full review sends at most 40,000. The estimate uses the model's tokenizer when the adapter has one. Otherwise it uses one token per three characters, rounded up. A file that does not fit is summarized or excluded, never split.

## Findings

Categories are closed: `correctness`, `security`, `data-loss`, `authorization`, `concurrency`, `compatibility`, `error-handling`, `performance`, and `maintainability`. Style is suppressed before a finding exists. An unknown category gets one repair. If it is still unknown, that candidate is suppressed.

Severity is separate from category:

| Severity | Meaning |
|---|---|
| Critical | Credential exposure, an exploitable security defect, unrecoverable data loss, or a broad production outage |
| High | A probable correctness, authorization, concurrency, compatibility, or destructive-data defect |
| Medium | A concrete failure with bounded impact |
| Low | A small actionable defect with limited impact |
| Informational | An observation that does not require a change |

The fingerprint is a hash of the immutable repository ID, category, symbol, and normalized failure claim. Normalization is NFKC, lowercase, and collapsed whitespace, with line numbers, SHAs, and paths removed. It does not paraphrase. No symbol means the file path stands in.

The verifier sees the candidate, the diff, and the evidence, not the generator's reasoning. It returns affirm, reject, or unresolved, and cannot change category or severity. Critical and high require affirm. Medium requires affirm or corroboration. Reject and unresolved suppress. A rejected claim is not regenerated on an unchanged head, including a manual rerun.

Only a secret hit can corroborate a candidate. It corroborates a security candidate on the same file whose claim is credential exposure. A tree-sitter parse error describes a limit of analysis and cannot prove a code defect.

An inline finding sits on lines in the current three-dot diff. Every published inline finding states a reproducible failure scenario, cites the changed line and relevant supporting context, explains the consequence, and gives a concrete next step. A candidate missing any of this evidence cannot be published. An applicable patch is optional. Anything else is a walkthrough finding and does not use an inline slot. Precise is the default and publishes verified medium and above, never style. Balanced uses that same inline rule and does not put low findings in the walkthrough. Thorough may put verified low findings in the walkthrough. Informational stays in the walkthrough in every profile.

The ordinary inline cap is five. Affirmed critical and high may pass it. Ten is absolute. Order is severity, then corroborated or affirmed, then file path, starting line, and fingerprint. Overflow is named in the walkthrough.

A suggestion replaces at most 20 lines in one file, only on the current diff, and must apply and parse. It cannot change dependencies, migrations, authentication, or workflow files. The evaluation release stores suggestions; the first usable release does not publish them.

After a later head, an occurrence is fixed, persisting, moved, obsolete, or uncertain. Uncertain means the file changed and was not re-reviewed. Only fixed or obsolete may resolve a GitHub thread, and only from that direct evidence. Uncertain never does.

## Routes and privacy

`fast` writes the change summary and cannot write a candidate. `review` writes candidates. `verify` writes a verdict. `repair` rewrites one malformed output once. `fallback` is the single alternate and must already meet privacy; for publication, it must also qualify for the language being reviewed. There is no second fallback. The owner defines approved aliases. A repository may select one and cannot name a model, endpoint, or credential. An alias binds a concrete model to permitted provider routing. Qualification records the model ID, provider routing, and prompt, context planner, candidate generator, and verifier versions; a material change to any of these makes the affected language and route unqualified until re-evaluated.

A timeout, connection reset, overload response, or retryable rate limit retries with bounded backoff while time and money remain. Authentication failure, a privacy refusal, and a second malformed output do not retry. A failed call produces no finding. One eligible model is enough. Same-model verification is recorded as such.

The default privacy policy is no provider retention and no training. OpenRouter uses `zdr: true` and `data_collection: "deny"`. A native route is eligible only when its recorded privacy attributes meet that bar. A repository may name a weaker provider explicitly. Nothing else may select one.

## Runner and ledger

The control plane verifies the webhook, owns the ledger, and dispatches work. A workflow input contains the run ID and no credential. The runner proves the claim with that job's GitHub OIDC token. The control plane checks the audience, immutable private repository ID, `workflow_dispatch` event, pinned workflow commit SHA, and recorded workflow run ID, then claims the review run once.

The claim returns an installation token for the target repository only, and a callback token that can request budget reservations and append results for that run only. It cannot publish to GitHub. The claim expires 60 minutes after dispatch or when used. The installation token is GitHub's one-hour token and is not refreshed. The callback token lives 60 minutes from the claim and cannot refresh itself. If it expires after results exist, the run is incomplete. If it expires before any result, the run is a required-stage failure. An unclaimed dispatch is an expired dispatch, not safe mode.

Provider keys stay on the runner. The GitHub App private key stays on the control plane. The runner does not hold the database URL. Callback routes are internal and are not a product API.

The private repository pins a released CodePoppy commit. It does not run the public default branch. A workflow edited on another SHA cannot claim runs until that SHA is configured.

A complete run finished every required stage that applied and stored its coverage. An incomplete run is visible to the owner, cannot publish findings or a clean walkthrough, and is not the last reviewed head. If the pull request still exists, a required-stage failure may write only a sanitized failed check with an owner-only diagnostics link. If no complete head exists, the next automatic request reviews the whole pull request.

The product time budget is 15 minutes for an automatic run and 30 minutes for a manual full run. The workflow job is allowed 20 and 40 minutes. The runner does not start a model call that would exceed the remaining time or money.

The control plane marks the old run cancelled before dispatching a newer one. The runner stops at the next stage boundary and discards unpublished output. A paid call already in flight may finish, its cost counts, and its findings are not stored. Actions concurrency is only a backstop.

At most three review workflows are active, counting from dispatch until a terminal state. A request waiting out its debounce does not take a slot. A request that arrives while three are active waits. It is not dropped.

## Ledger, retention, and deletion

The ledger stores identities, states, hashes, usage, coverage, and encrypted source-bearing bodies when retention allows. It does not store provider keys, the app private key, installation tokens, webhook secrets, or secret values. Queue messages carry a run ID only. Source-bearing bodies are encrypted before they reach the database. Destroying the wrapped data key makes retained ciphertext unrecoverable.

| Data | Lifetime |
|---|---|
| Signature-valid webhook body | Until the delivery is normalized, or 24 hours |
| Rejected signature | Delivery ID, time, and reason; no body |
| Runner artifacts | 3 days |
| Failed-run diagnostics | 7 days |
| Prompt and response bodies | 7 days; none for a sensitive repository |
| Structured findings and feedback | 90 days |
| Usage and coverage metadata | 180 days |
| Checkout | Until the workflow ends |
| One-time authorization | Until claimed, or 60 minutes after dispatch |

The owner marks a sensitive repository in the dashboard. The repository file cannot turn body retention back on. Deletion of a run, repository, or installation removes source-bearing data immediately and leaves one audit event: time, owner ID, and scope. No source, finding text, repository name, or pull request number survives in that event.

The shared quality corpus contains licensed or owner-created fixtures and real pull requests the owner explicitly opts in. Private source enters a reusable corpus only with separate owner consent and when the repository's privacy and retention policy permits it. Otherwise evaluation keeps only labels and aggregate metrics without reusable source. Deletion and retention rules apply to corpus material as well as ordinary review data.

Schema changes run as a generated SQL migration in a dedicated job. Startup does not migrate. The migration is applied to an isolated copy first. Neon branching is allowed and not required.

## Budget

One personal budget bounds every installation. The default model ceiling is $10 per UTC month; the owner may explicitly raise it. The runner ceiling is 1,500 billed Actions minutes. Every live provider call, including a qualification call, counts in the month it starts. A repository budget can only be lower.

Per-run ceilings are $0.10 for automatic incremental, $0.40 for automatic full, and $1.00 for manual full. Below 70 percent, reviews are normal. From 70 to 95 percent, the system prefers incremental review and cheaper routes. From 95 to 100 percent, only manual triggers run. At 100 percent, paid model calls stop. That is a budget stop, not safe mode.

A paid route is ineligible while its price is unknown or lacks a verified bound for any charge it may incur. The dashboard and evaluation report name the pricing gap. CodePoppy makes no paid call on that route. The local CLI spends the model budget for live calls and does not spend Actions minutes. Replaying recorded provider responses makes no paid call.

## Dashboard, CLI, and observability

The dashboard shows runs, coverage, findings, suppression, model calls, cost, queue health, and safe-mode state. It reads the ledger. Telemetry export is off unless the owner configures a destination. Export may carry counts, durations, statuses, and route names. It carries no source, diff, prompt, response, secret, or credential.

The CLI guides setup for the documented Cloudflare, Postgres, GitHub Actions, and model-provider path. It shows and requires confirmation before each external write, resumes safely after interruption, and never prints credentials. It validates alternative Postgres and provider choices without provisioning them. It can also run a review, drain queued runs, evaluate fixtures, validate configuration, and print a doctor report. Doctor verifies prerequisites, webhook delivery, runner claim, route eligibility, and a completed shadow review of an owner-selected existing pull request with semantic-review eligible files in an enabled repository. Doctor creates no test pull request and changes no product code. Time to the first completed shadow review is measured on a fresh installation. The CLI reports results to the control plane and does not write the ledger. Local provider keys stay in the environment or the OS keychain.

A fixture evaluation writes a local report and creates no review request, finding, publication, or ledger row. Replaying recorded provider responses costs nothing; an evaluation calling a live provider reserves and reports spend against the personal monthly ceiling before every call. If the remaining ceiling is insufficient, the owner must explicitly raise it before continuing. Reconciliation may re-enqueue a request that was never dispatched, mark an expired dispatch, and mark a stale publication attempt. It does not publish and does not start a second run for a complete head.

## Safe mode

The owner can enter safe mode from the dashboard. The control plane also enters it when a credential appears in a log, artifact, or model payload, or when a publication idempotency check fails, including two walkthrough markers on one pull request. Safe mode stops dispatch and publication, revokes pending authorizations, and keeps sanitized audit evidence. Only the owner can leave it, and only after rotating the exposed credential. Ledger reads remain available.

## Quality gate and repository shadow check

Before a repository can publish output for a file, a shared labeled corpus qualifies that file's language family and concrete model route. The qualification record includes model IDs, permitted provider routing, prompt versions, context planner, candidate generator, verifier, and pipeline versions. A new or materially changed route stays in shadow until its own results pass; a fallback qualifies separately. Aggregate scores cannot conceal a weak language or route. Files without a qualified configuration are omitted and named in a partial-coverage walkthrough.

The corpus contains clean changes, licensed or owner-created fixtures, and real pull requests the owner explicitly opts in under the privacy and retention rules above. Reports distinguish fixture and real sources and give sample sizes. They report actionable precision by severity, confirmed misses on inspected changes, valid changed-line placement, coverage, and time to a visible review. Uninspected changes do not count as evidence of no misses. Stale and duplicate GitHub writes are reported separately and are publication failures.

Numerical thresholds and the held-out sample are calibrated from the corpus and fixed before a candidate configuration is judged. The owner may revise them for a later qualification run, but cannot retroactively turn a failure into a pass. Until thresholds are declared and met, that configuration stays in shadow. The former per-repository 50-row and 15-real-defect thresholds do not apply.

Each repository also requires one completed live shadow review of an eligible pull request, owner labels for every proposed inline finding, and an owner preview of the exact current-head GitHub output. The preview writes nothing. Unlabeled publication candidates from real shadow pull requests block approval; the owner records confirmed misses on inspected changes. The repository has no fixed minimum number of observed defects or days in shadow. Passing shared qualification and this check publishes nothing until the owner approves.

## Publication

After qualification, the repository shadow check, and owner approval, a complete current-head review writes one walkthrough and one check. Verified medium, high, and critical findings may publish inline on changed lines under the five ordinary and ten absolute caps. Low and informational findings stay outside inline comments. Suggestions and merge gating are not part of the first usable release.

The walkthrough is the app's issue comment whose body starts with `<!-- codepoppy:walkthrough -->`. It is edited in place and is not written into the pull request body. It reports the reviewed head, coverage, named omissions and reasons, eligible findings, and any overflow. A completed fully covered review with no actionable findings says "no actionable findings" without claiming the pull request is safe to merge. If one or more language families are unqualified, qualified files may still yield verified findings; the walkthrough names every omitted file and never makes a whole-pull-request clean claim. The grouped review uses the COMMENT action, never approves or requests changes, and is submitted only when it contains an inline finding.

The check is success only when every semantic-review eligible file was covered and no inline finding remains. It is neutral when an inline finding remains or semantic coverage is partial, including an unqualified language. It is skipped when policy or the absence of eligible files prevented semantic review. A failed required stage on a pull request that still exists writes only a sanitized failed check saying the review is incomplete and linking to owner-only diagnostics. It writes no finding or clean walkthrough for that head and makes no claim about code quality. An optional-stage loss changes the conclusion when it reduces promised coverage. The check's only action opens the owner dashboard.

Pull request participants may reply to or dismiss a published finding. These actions do not set quality labels; only the owner may mark a finding actionable or false positive. A participant may explicitly request one clarification in that finding's thread. CodePoppy responds once there, using evidence from the reviewed head and creating no new finding. Routine replies and thread resolution do not trigger the bot. If the head changed, CodePoppy says the finding is stale and directs the owner to request a new review. The exact request text is set before implementation.

A publication retry writes only when the run is complete, the reviewed head still matches, and the output is approved for that configuration. A second walkthrough, second check for one head, or second inline comment for one fingerprint on one head is a duplicate publication failure. Closing, merging, deleting, or losing access to the pull request cancels publication without a new check. A required-stage failure on a pull request that still exists is the sole exception to the complete-run rule for writing a sanitized failure check.

## Self-hosting and versions

The public repository contains the application, schema, example runner workflow, and documentation. It contains no provider keys, no private replay corpus, and no production secrets.

Before 1.0, a breaking change to configuration fields, the ledger schema, or a provider adapter increments the minor version. A prompt change has its own version and is replayed before release. The runner pins the release commit.

A self-hoster may replace the model provider, artifact store, or queue by rebuilding the deployment. Analyzers, framework packs, and verifiers are compiled in. The target repository cannot load code.

## Later work

These are specified only at the boundary above. They do not enter the first usable release:

- Tier 2 languages and the remaining framework packs.
- Repository-controlled lint and tests, CI ingestion, and CODEOWNERS.
- A dependency-bot review policy.
- Approved learnings, published suggestions, and merge gating.
- Docker, additional providers, and a plugin loader.
- GitLab, Bitbucket, and a hosted multi-user control plane.
