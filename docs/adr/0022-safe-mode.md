# Safe mode stops dispatch until the owner rotates the exposed credential

The owner can enter safe mode from the dashboard. The control plane also enters it when a credential appears in a log, artifact, or model payload, or when a publication idempotency check fails. Safe mode stops dispatch and publication, revokes pending authorizations, and keeps sanitized audit evidence. Only the owner can leave it, and only after rotating the credential that was exposed.

A budget stop is not safe mode. It stops new paid model calls and does not revoke authorizations or require rotation.

## Considered Options

- Treat budget exhaustion as safe mode.
- Leave safe mode automatically after a timeout.

## Consequences

- Deterministic ledger reads remain available so the owner can inspect what happened.
- A failed idempotency check is treated as a possible duplicate publication, not as an ordinary retry.
