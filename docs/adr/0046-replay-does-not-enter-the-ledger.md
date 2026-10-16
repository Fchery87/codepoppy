# A fixture replay writes a report, not a review

**Status:** Superseded by ADR 0063.

Replaying a fixture writes a local report. It does not create a review request, a finding, a publication, or a ledger row, and it does not spend the personal budget. A shadow review of a real pull request does create a request and does spend the budget. The shadow gate reads owner labels on real shadow reviews. It does not read fixture reports as if they were those reviews.

## Considered Options

- Store fixture results in the ledger so the dashboard can compare them.
- Charge fixture runs against the monthly model budget.

## Consequences

- Fixture output cannot be published by a retry or a reconciliation job.
- A historical personal pull request used as a fixture follows this rule. The same pull request reviewed live does not.
