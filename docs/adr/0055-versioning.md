# Breaking product contracts bump the minor version before 1.0

Public releases use semantic versioning. Before 1.0, a breaking change to trusted-configuration fields, the ledger schema, or a provider adapter increments the minor version. A prompt change does not. Prompts have their own version, and a prompt change is replayed before it is released. The private runner pins the release commit SHA. It does not follow a branch.

## Considered Options

- Bump the major version for every pre-1.0 break.
- Let the runner track the default branch so prompt fixes ship themselves.

## Consequences

- A configuration file with `version: 1` keeps its meaning until a migration exists.
- The owner can see which prompt version produced a finding.
