# The control plane is the only ledger writer

The runner is trusted compute, but it does not hold the database connection. A workflow receives only a run ID. It proves a one-time authorization with the workflow's GitHub OIDC token, then requests budget reservations and sends stage results to the control plane. The control plane checks the run, the head, privacy, and budget before granting a reservation or accepting results. This keeps the ledger authoritative when a workflow is retried, cancelled, or compromised, and keeps repository source off the database credentials.

## Considered Options

- Give the runner the database URL and let it append directly.
- Put the GitHub App private key only on the runner and let the runner mint every installation token.

## Consequences

- Provider credentials stay with the runner because model calls happen there.
- The GitHub App private key stays with the control plane. The runner receives a short-lived installation token for the repositories that one run needs.
- The callback routes are internal. They are not a public product API.
