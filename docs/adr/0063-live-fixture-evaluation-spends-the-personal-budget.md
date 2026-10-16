# Live fixture evaluation spends the personal model budget

A replay fixture produces a local evaluation report, not a review request, finding, publication, or ledger row. Replaying saved provider responses makes no paid call. An evaluation that calls a live model provider counts every call against the same personal monthly model budget as a live pull request review. If qualification needs more than the remaining ceiling, the owner raises that ceiling explicitly before running it.

## Considered Options

- Give evaluation a separate budget that bypasses the personal ceiling.
- Treat every fixture replay as free even when it calls a paid provider.

## Consequences

- Fixture output cannot be published by retry or reconciliation.
- The CLI must reserve and report live evaluation spend before each call. It cannot silently exceed the personal ceiling.
- A live fixture evaluation refuses an unpriced paid route under ADR 0005. Replaying a saved response needs no price because it makes no provider call.
- Qualification may take more than one month at the default ceiling. The owner can choose a higher ceiling before starting a larger evaluation.
