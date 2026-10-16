# Check conclusions do not mix findings with optional-stage failure

**Status:** Superseded by ADR 0059.

Success means the promised review finished and no inline finding remains. Neutral means it finished and at least one inline finding remains. Skipped means policy chose not to review. Failure means a required stage failed or the head could not be validated. A failed optional stage discloses partial coverage in the walkthrough and does not change success into neutral.

## Considered Options

- Use neutral for both findings and partial optional coverage.
- Fail the check whenever any verified finding exists.

## Consequences

- Findings do not fail the check unless a later, explicit gating decision says so.
- Drafts, disabled repositories, and policy-excluded changes are skipped, not successful reviews.
