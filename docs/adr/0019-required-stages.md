# A review cannot publish findings when a required stage did not finish

Intake, acquisition of the recorded head, evaluation of trusted configuration, evaluation of privacy policy, and redaction are always required. Context planning, candidate generation, verification, and storing the result are required when semantic review was supposed to run. GitHub publication is required only in the publish posture. Classification, tree-sitter, and the change summary are optional.

Being unable to evaluate privacy policy is a required failure. A policy that is evaluated and then skips semantic review is a completed deterministic review, not a failure. If classification fails, the affected files are excluded from the model rather than sent unclassified. If tree-sitter fails, semantic review may continue and fingerprints use the file path. A critical or high candidate that cannot be verified is suppressed, not published.

A required-stage failure may write only the sanitized failed check described in ADR 0059 while the pull request still exists. It cannot publish a walkthrough or findings for that head.

## Considered Options

- Fail the whole run whenever any optional analyzer fails.
- Publish a critical candidate when the verifier is unavailable.

## Consequences

- Optional-stage loss is disclosed in coverage and does not by itself make the check fail.
- Deterministic-only completion is an honest result when privacy or budget prevents semantic review.
