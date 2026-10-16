# The shadow gate requires recall, not only silence

**Status:** Superseded by ADR 0058.

A reviewer that publishes nothing has perfect precision and a zero false-positive rate. The gate therefore requires labeled defects and a minimum recall before a repository can leave shadow. The owner labels candidates in the dashboard. Publication candidates are the precision denominator. Labeled defects are the recall denominator. A clean pull request is one with no labeled defect.

## Considered Options

- Gate only on precision and clean-pull-request false positives.
- Use an external benchmark instead of owner labels.

## Consequences

- The bar is 50 representative rows that may include fixtures and real shadow pull requests, 15 owner-labeled true positives from real shadow pull requests, 80 percent actionable precision, 50 percent recall, 90 percent valid placement, under 10 percent of clean pull requests with an incorrect inline candidate, and zero unlabeled GitHub writes.
- These numbers are the initial bar. Later evidence can replace them in a new decision. It cannot quietly waive them.
