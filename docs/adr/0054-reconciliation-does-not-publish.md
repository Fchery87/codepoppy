# Reconciliation repairs dispatch state and never publishes

Reconciliation may re-enqueue a request that was accepted and never dispatched, mark an expired dispatch, and mark a stale publication attempt. It must not start another run for a head that already has a complete run, and it must not publish. The owner retries publication from the dashboard.

The control plane commits the accepted request and its dispatch intent in one Postgres transaction. Queue messages carry only the review run ID, and the consumer checks ledger state before dispatch. A duplicate queue delivery cannot create a second review run. If a GitHub dispatch may have succeeded but its response was not recorded, reconciliation does not dispatch it again until it can establish that no workflow run exists. A duplicate workflow that does start cannot claim the same review run after the first claim.

## Considered Options

- Let reconciliation submit a missed GitHub review automatically.
- Start a fresh run whenever a workflow is missing.

## Consequences

- A duplicate workflow retry cannot create a second complete review for the same automatic request.
- Publication remains an owner-visible action with its own idempotency check.
- A dashboard publication retry writes only when the run is complete, the recorded head is still the pull request head, and the relevant configuration and repository are approved for publication. Otherwise the run is marked stale and nothing is written. A sanitized required-stage failure check follows ADR 0059.
