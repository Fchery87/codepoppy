# The shadow gate waits until every publication candidate is labeled

**Status:** Superseded by ADR 0058.

During shadow, the owner marks each publication candidate as actionable or a false positive, and may record a missed defect the review did not produce. The gate cannot pass while a publication candidate from a real shadow pull request is unlabeled. Precision's denominator is labeled publication candidates. Recall's denominator is actionable labels plus missed defects. A fixture's seeded label does not count toward the 15 real true positives.

## Considered Options

- Treat an unlabeled candidate as a false positive so the gate can finish.
- Let the model label its own candidates.

## Consequences

- Suppressed candidates are not publication candidates and do not block the gate.
- A missed defect counts against recall even though it was never a candidate.
