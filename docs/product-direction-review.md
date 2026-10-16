# CodePoppy product direction review

**Status:** Historical assessment. Its recommendations were resolved in PRD 3.0 and ADRs 0057–0063; statements about the then-current PRD and open decisions below describe the earlier baseline.
**Date:** October 14, 2026

## Judgment

The documents describe a careful private evaluation system for one self-hosting owner. They do not yet describe a usable alternative to CodeRabbit or Greptile. The first release ends before a developer receives a pull request review in GitHub. A later release adds a summary, then severe inline findings, then medium inline findings.

This sequence protects developers from untested comments. It also delays the moment when the product solves its stated problem. The product needs an explicit first user-facing milestone and a shorter path from evaluation to that milestone.

The current personal, self-hosted audience is a coherent niche. It is a different setup experience from a managed review service. Confirm that audience before changing the single-owner architecture.

## Keep these decisions

- Review a recorded GitHub three-dot diff and report files that were skipped or summarized.
- Treat repository content as untrusted, redact secrets before model calls, and never execute fork code.
- Keep repository policy on the base branch so a pull request cannot weaken its own review.
- Verify actionable claims and show uncertainty rather than publishing unsupported findings.
- Bind publication to the reviewed head and make retries idempotent.
- Let the owner label false positives and missed defects during shadow evaluation.

These decisions support a reviewer that developers can trust. They do not require three model providers, four languages, two framework packs, a local CLI, and a full dashboard in the same first milestone.

## Correct the product sequence

| Milestone | Developer outcome | Scope |
|---|---|---|
| Evaluation slice | The owner can inspect real PR reviews privately and label each proposed finding. | One GitHub repository, one language family, one model route, diff mapping, redaction, evidence-bearing findings, and a small feedback view. |
| First usable release | Developers receive a timely summary and a small number of actionable inline findings on the PR. | Publish only after an evaluation bar. Keep exact-head checks, duplicate prevention, and an owner kill switch. |
| Expansion | More repositories and codebases get the same quality. | Add languages, framework context, providers, CLI, and deeper customization when evidence shows which adds value. |

The first usable release should be the product milestone used to compare CodePoppy with other PR reviewers. Shadow evaluation remains a prerequisite, not the destination. [CodeRabbit documents suggestions in PR review comments](https://docs.coderabbit.ai/changelog/committable-suggestions), and [Greptile describes automatic PR comments with codebase context](https://www.greptile.com/docs/introduction). CodePoppy does not need feature parity, but it does need to deliver review in the pull request.

## Define the review contract

Each actionable finding shown to a developer should state the failure scenario, cite the changed code and any relevant repository context, describe the consequence, and offer a bounded next step. A finding should distinguish observed evidence from an inference. A reviewer should be able to dismiss or dispute it without leaving the pull request. The owner should see the resulting labels in evaluation reports.

Measure the review at the PR level as well as the finding level. Record time from the last eligible push to visible output, the share of eligible PRs reviewed, the share with incomplete coverage, actionable precision by severity, confirmed misses on a labeled sample, and duplicate or stale GitHub writes. An analyzer exit needs a quality bar of its own. Successful pipeline completion alone does not show that the reviewer catches defects.

The current recall denominator is owner-labeled findings plus owner-recorded misses. That can work for a deliberately inspected sample, but an unlabeled clean PR cannot prove that the reviewer missed nothing. Record how the sample was inspected and separate known misses from PRs that were never checked for misses. A parse error is analysis uncertainty, not evidence that the code is wrong.

## Replace the publication gate before implementation

The current gate requires 50 rows and 15 actionable findings from real shadow PRs per repository. Quiet repositories may never produce 15 defects, so they may never receive inline review. The 50 rows may include fixtures, so reports must distinguish fixture rows from live PRs.

Use one shared qualification corpus to judge the analyzer, with seeded defects, clean changes, and reviewed real PRs. Use a smaller per-repository shadow period to confirm configuration, privacy, diff placement, and publication safety. Require owner approval before publication. Set numerical thresholds from the labeled corpus and report sample sizes with each rate. A zero-incident requirement is suitable for stale or duplicate GitHub writes. It is not a substitute for a quality sample.

## Decisions still needed

1. Confirm whether launch serves one self-hosting owner or teams using managed setup. The current PRD assumes one owner who supplies every infrastructure account.
2. Choose the first language family and model route from the owner's real repositories. This determines the smallest credible evaluation slice.
3. Decide whether a summary alone counts as the first usable review. I recommend that it does not. The first usable release should include a few high-confidence inline findings, because finding defects is the core promise.

Once these decisions are settled, update the PRD and ADRs together. In particular, replace ADR 0007, ADR 0032, and ADR 0036 with one consistent qualification and rollout policy. Remove exact numerical limits that have no evaluation evidence yet, or label them as provisional targets.
