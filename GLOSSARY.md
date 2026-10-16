# CodePoppy

The language of a personal, evidence-based pull-request review. Implementation does not belong here. The product contract is `CodePoppy-PRD.md`.

## Language

**Owner**:
The single GitHub user CodePoppy exists for.
_Avoid_: user, admin, account

**Installation**:
One GitHub App installation whose repositories CodePoppy may be allowed to review.
_Avoid_: org, account

**Repository enablement**:
The owner's explicit decision that one repository in an installation is eligible for review.
_Avoid_: install, subscription

**Publication posture**:
Whether a repository's review output stays with the owner or is written to GitHub. Either shadow or publish.
_Avoid_: mode, advisory phase, publish mode

**Shadow**:
The publication posture in which review output is visible only to the owner.
_Avoid_: dry run, private mode

**Publish**:
The publication posture in which eligible review output is written to the pull request.
_Avoid_: live mode, public mode

**First usable release**:
The first CodePoppy release that can publish a walkthrough and verified inline findings after shadow qualification.
_Avoid_: shadow release, evaluation release

**Review kind**:
What a review request asks for: incremental, full, explain, or config.
_Avoid_: review mode

**Incremental review**:
The review kind whose model scope is the part of the three-dot diff that changed since the last reviewed head.
_Avoid_: delta, partial review

**Full review**:
The review kind whose model scope is the whole three-dot diff.
_Avoid_: deep review

**Last reviewed head**:
The head of the latest complete run on a pull request. Incomplete, cancelled, failed, explain, and config runs do not set it.
_Avoid_: last commit, last seen SHA

**Complete run**:
A run that finished every required stage that applied to it and stored its coverage.
_Avoid_: successful comment, green check

**Publication candidate**:
A verified finding the active profile would place inline.
_Avoid_: comment, suppressed candidate

**Explain request**:
The review kind that reports an existing review and creates no findings.
_Avoid_: chat

**Config request**:
The review kind that reports effective configuration and creates no findings.
_Avoid_: settings dump

**Trigger**:
How a review request was created: automatic or manual.
_Avoid_: source, invocation

**Automatic trigger**:
A review request created by an eligible pull-request event.
_Avoid_: webhook review

**Manual trigger**:
A review request created by the owner, from a review command or the dashboard.
_Avoid_: slash command

**Manual rerun**:
A new manual review request for a head that already has a review request.
_Avoid_: retry

**Review command**:
A pull-request comment by the owner whose whole text is a review request.
_Avoid_: slash command, collaborator command

**Ineligible delivery**:
A signature-valid webhook that was recorded and did not create a review request.
_Avoid_: failed webhook, ignored event

**Walkthrough marker**:
The fixed marker that identifies the one walkthrough comment.
_Avoid_: comment ID guessed from author

**Profile**:
How selective a review is: precise, balanced, or thorough.
_Avoid_: strict, assertive, advisory

**Precise**:
The most selective profile. Style is out of scope.
_Avoid_: strict

**Balanced**:
The profile that uses the same inline threshold as precise but omits low findings from the walkthrough.
_Avoid_: normal, standard

**Thorough**:
The profile that keeps lower-severity findings the others set aside.
_Avoid_: assertive

**Head**:
The exact commit of the pull request that a review examines.
_Avoid_: tip, branch

**Base**:
The exact commit the pull request targets.
_Avoid_: target branch, main

**Three-dot diff**:
GitHub's pull request diff, from the merge base of base and head through head. This is the diff a review examines.
_Avoid_: two-dot diff, git diff

**Candidate**:
A possible finding that has not passed verification.
_Avoid_: comment, alert, issue

**Verified finding**:
A candidate that passed verification and may be shown to the owner.
_Avoid_: comment, inline comment

**Finding occurrence**:
A verified finding placed on one head, including its location and lifecycle state there.
_Avoid_: thread

**Actionable**:
A finding the owner would change code or tests to address. Style, duplicates, and echoes of existing CI are not actionable.
_Avoid_: true positive, signal, useful comment

**Suppression**:
The decision that a candidate is not a verified finding, together with the reason.
_Avoid_: filter, hide

**Failure claim**:
The concrete way a finding says the code fails, independent of where it sits.
_Avoid_: comment text, message

**Finding fingerprint**:
The stable identity of a failure claim across heads.
_Avoid_: comment ID, line hash

**Finding category**:
The closed classification of a failure claim. It is not a severity.
_Avoid_: tag, label, style

**Severity**:
How serious a finding's failure is: critical, high, medium, low, or informational.
_Avoid_: priority, confidence

**Critical**:
Credential exposure, an exploitable security defect, unrecoverable data loss, or a broad production outage.
_Avoid_: blocker, P0

**High**:
A probable correctness, authorization, concurrency, compatibility, or destructive-data defect.
_Avoid_: major

**Medium**:
A concrete failure with bounded impact.
_Avoid_: minor

**Low**:
A small actionable defect with limited impact.
_Avoid_: nit, style

**Informational**:
An observation that does not require a change.
_Avoid_: note, comment

**Logical route**:
The role a model fills in a review: fast, review, verify, repair, or fallback.
_Avoid_: model name, provider

**Approved route alias**:
An owner-defined name for one model and its permitted provider path that a repository is allowed to select.
_Avoid_: endpoint, custom model

**Context item**:
One piece of repository content chosen for a model call, with its reason and token estimate.
_Avoid_: prompt, RAG chunk

**Fixed**:
An occurrence whose file was re-reviewed and whose failure claim is gone.
_Avoid_: resolved

**Persisting**:
An occurrence whose failure claim remains at the same location.
_Avoid_: open, duplicate

**Moved**:
An occurrence whose same failure claim now sits at a different location.
_Avoid_: outdated

**Obsolete**:
An occurrence whose file is no longer in the pull request diff.
_Avoid_: stale, expired

**Uncertain**:
An occurrence whose file changed but was not re-reviewed.
_Avoid_: unknown, flaky

**Verifier verdict**:
The verifier's decision on a candidate: affirm, reject, or unresolved.
_Avoid_: score, confidence

**Sensitive repository**:
A repository the owner has marked so that no prompt or response body is retained.
_Avoid_: private repository

**Safe mode**:
The owner's halt on dispatch and publication after a suspected compromise.
_Avoid_: maintenance mode, pause

**Budget stop**:
The halt on new paid model calls when the personal budget is exhausted.
_Avoid_: safe mode, outage

**Semantic review**:
The model-backed portion of a review.
_Avoid_: AI review, deep review

**Deterministic check**:
A review result produced without a model.
_Avoid_: lint, tool

**Privacy policy**:
A repository's rule for whether a model provider may retain or train on review content.
_Avoid_: ZDR

**Personal budget**:
The owner's single monthly ceiling for model spend and runner time, shared by every installation.
_Avoid_: plan, repo budget

**Repository budget**:
An optional per-repository ceiling that can only narrow the personal budget.
_Avoid_: cap

**Shadow gate**:
The shared measured quality bar a language family and model route must pass before a repository may publish findings from it.
_Avoid_: launch checklist, eval

**Qualified review configuration**:
A language family, concrete model route, and review pipeline version whose results passed the shared quality gate.
_Avoid_: qualified repository, approved model

**Repository shadow check**:
A private check with a completed live semantic review, owner labels for its proposed inline findings, and an exact preview of the current-head PR output before the owner approves publication.
_Avoid_: repository quality gate, 50-PR gate

**Review request**:
The intent to review one pull request head for one review kind.
_Avoid_: job, webhook

**Review run**:
One execution of a review request.
_Avoid_: workflow, build

**Control plane**:
The part of CodePoppy that authenticates events, owns the ledger, and dispatches work.
_Avoid_: web app, worker

**Runner**:
The trusted compute that executes one review and cannot write the ledger.
_Avoid_: worker, action

**Ledger**:
The authoritative record of requests, runs, findings, and publications.
_Avoid_: database

**One-time authorization**:
The ledger's record that one pending run may be claimed by the runner.
_Avoid_: API key, personal access token

**Runner claim**:
The act of the runner proving, once, that this workflow job may take a pending run.
_Avoid_: login, shared secret

**Generated file**:
A file marked as machine-produced by its own header or by trusted configuration.
_Avoid_: build output, compiled file

**Vendored file**:
A file under a third-party source path.
_Avoid_: dependency, lockfile

**Minified file**:
A file collapsed for delivery rather than for reading.
_Avoid_: bundle

**Secret fingerprint**:
The one-way identity of a detected secret value. The value itself is not stored.
_Avoid_: secret hash shown to the model

**Owner label**:
The owner's judgment of a publication candidate or published finding as actionable or a false positive.
_Avoid_: reaction, thumb

**Participant response**:
A pull request participant's reply or dismissal of a published finding. It does not set the owner label.
_Avoid_: owner label, ground truth

**Clarification request**:
An explicit request by a pull request participant for one explanation of a published finding in its thread.
_Avoid_: open-ended chat, owner label

**Missed defect**:
An owner-recorded defect that the review did not produce.
_Avoid_: false negative, escape

**Config collision**:
An existing `codepoppy/config` branch CodePoppy must not overwrite.
_Avoid_: merge conflict

**Callback token**:
The credential a claimed run uses to request its own budget reservations and append its own results. It cannot act on another run or publish to GitHub.
_Avoid_: session, API key

**Expired dispatch**:
A run the runner did not claim within 60 minutes of dispatch.
_Avoid_: timeout, lost job

**Incomplete run**:
A run that stored partial coverage and stopped before required work finished because its callback expired or its remaining time or money could not pay for a required model call.
_Avoid_: failed run, cancelled run

**Invalid configuration**:
A trusted configuration file that exists but cannot be applied.
_Avoid_: missing config, warning

**Deletion audit**:
The non-content record that a deletion happened, who requested it, and which scope it had.
_Avoid_: tombstone, receipt

**Normalized delivery**:
A signature-valid webhook the ledger has reduced to an event, its target, and either a review request or an ineligibility reason.
_Avoid_: parsed JSON, payload

**Coverage**:
What a run reviewed deeply, summarized, or excluded, and why.
_Avoid_: truncation

**Relevant file**:
A readable text file in the pull request diff that is eligible for semantic review.
_Avoid_: changed file, source file

**Excluded file**:
A binary, generated, vendored, minified, or lockfile path. It is classified and scanned for secrets, and it is not reviewed semantically.
_Avoid_: ignored file

**Documentation-only pull request**:
A pull request whose only relevant files are documentation.
_Avoid_: docs PR, trivial PR

**Size class**:
The pull request's small, medium, large, or oversized classification. It decides how much semantic review is attempted.
_Avoid_: diff size, big PR

**Risk rank**:
The deterministic order in which a large pull request's relevant files are given model context.
_Avoid_: priority score, AI ranking

**Replay fixture**:
A recorded pull request with a known diff and owner-labeled expected findings, used to test the review without live GitHub activity.
_Avoid_: sample, benchmark

**Recorded-response replay**:
An evaluation of a replay fixture using saved provider responses and no live model call.
_Avoid_: free live evaluation

**Live fixture evaluation**:
An evaluation of a replay fixture that calls a model provider and spends the personal model budget.
_Avoid_: budget-free replay

**Clean pull request**:
A pull request inspected for actionable defects by the owner, with none found.
_Avoid_: good PR, passing PR

**Walkthrough**:
The persistent issue comment that summarizes the latest current-head review, its coverage, and its actionable findings.
_Avoid_: PR summary, description edit

**Inline finding**:
A verified finding whose location is on lines in the current three-dot diff.
_Avoid_: review comment

**Walkthrough finding**:
A verified finding that is shown only in the walkthrough because it does not sit on the current diff.
_Avoid_: summary finding

**Debounce**:
The waiting period that collapses automatic triggers for one pull request into the newest head.
_Avoid_: delay, cooldown

**Fork pull request**:
A pull request whose head is in a different repository from the one it targets.
_Avoid_: external PR, untrusted PR

**Imported pull request**:
An open pull request recorded when its repository is enabled, with no review request.
_Avoid_: backfill, historical review

**Stale run**:
A finished run whose head is no longer the pull request head at publication time.
_Avoid_: outdated run, race

**Duplicate publication**:
A second GitHub object for a walkthrough, a head's check, or a fingerprint on a head.
_Avoid_: retry, duplicate comment

**Check conclusion**:
The GitHub check result of a published review: success, neutral, skipped, or failure.
_Avoid_: status, verdict

**Suggestion**:
A proposed single-file replacement attached to a verified finding.
_Avoid_: fix, autofix, commit

**Learning proposal**:
An owner-visible suggestion to change repository policy. It is not policy.
_Avoid_: memory, learned rule, preference

**Trusted configuration**:
The repository policy read from the tip of the pull request's base branch.
_Avoid_: head config, protected-branch config

**Installation default**:
The policy used for an enabled repository that has no trusted configuration file.
_Avoid_: fallback config, system default
