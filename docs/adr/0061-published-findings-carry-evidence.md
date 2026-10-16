# Published findings explain the failure and the evidence

Every published inline finding states a reproducible failure scenario, points to the changed line and relevant supporting context, describes the consequence, and gives a concrete next step. An applicable patch is optional. This lets a developer judge the claim without treating model confidence as proof.

## Considered Options

- Require an applicable patch with every finding.
- Publish a short issue statement without supporting evidence.

## Consequences

- A candidate that lacks the required evidence cannot be published as an inline finding.
- Suggestions remain a separate, bounded artifact and may be added after finding quality is proven.
