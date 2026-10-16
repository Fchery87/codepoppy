# Secret detection uses CodePoppy's pinned rules and stores no values

Secret detection uses the gitleaks default rule pack pinned in CodePoppy. The target repository cannot add, remove, or replace patterns, and the model cannot add them. A hit stores the rule type, the file and line, and a salted one-way fingerprint of the value. The value is redacted before any model call, log, artifact, or ledger body.

## Considered Options

- Let `.github/ai-review.yml` add repository-specific regular expressions.
- Ask the review model to look for secrets.

## Consequences

- Updating the rule pack is a CodePoppy change, replayed before it ships.
- The fingerprint salt stays with the control plane and is not written to the ledger.
