# The ledger stores review state, not credentials

The ledger stores identities, states, hashes, usage, coverage, and, when retention allows, encrypted source-bearing bodies. It does not store provider keys, the GitHub App private key, installation tokens, webhook secrets, or detected secret values. A detected secret is stored as its type, location, and a one-way fingerprint. Queue messages carry a run ID and nothing else.

Source-bearing bodies are encrypted before they reach the database. The data key is wrapped, and destroying the wrapped key makes retained ciphertext unrecoverable. Searchable metadata stays outside that ciphertext.

Each retained source body has a deletion scope, including its run, repository, installation, or consented corpus copy. Wrapped data keys are scoped at least as narrowly as the data that an owner may delete independently. Deletion removes the scoped bodies and destroys their wrapped keys across the ledger and artifact stores; a shared owner-wide key cannot stand in for run deletion.

## Considered Options

- Keep the runner's database credential and write the ledger from the workflow.
- Store raw webhook bodies and detected secrets until their retention expires.

## Consequences

- Logs, artifacts, telemetry, and prompts follow the same prohibition on credentials and secret values.
- A one-time authorization is a record that a run may be claimed. It is not a credential stored for reuse.
