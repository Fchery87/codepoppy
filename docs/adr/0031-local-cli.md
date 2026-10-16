# The local CLI is another runner, not another ledger

The CLI guides reference setup, runs reviews, drains queued runs, evaluates fixtures, validates configuration, and prints a doctor report. It uses the owner's GitHub authentication and provider keys on that machine. Those keys stay in the environment or the operating-system keychain and are never written to the ledger. A local run reports to the control plane. It does not write the ledger itself. Guided setup and the end-to-end doctor check are defined in ADR 0062.

A local run obeys the repository privacy policy and the personal model budget. It does not consume Actions minutes. It does consume the model budget when it calls a provider.

The CLI proves the owner's GitHub identity to the control plane before claiming an accepted review run. The control plane checks the immutable owner ID, repository enablement, run state, privacy policy, and remaining budget, then grants a one-time, run-scoped callback token. This is a separate claim path from GitHub Actions OIDC. The CLI does not use a dashboard session as a provider or GitHub credential, and a local run cannot claim a run already claimed by a workflow.

## Considered Options

- Let the CLI write Neon directly with a local database URL.
- Let a local run ignore the monthly budget because its keys are the owner's.

## Consequences

- Drain executes runs the control plane has already accepted. It cannot invent a run for a repository that is not enabled.
- Doctor reports local authentication, provider reachability, privacy eligibility, webhook delivery, runner claim, route eligibility, and one completed shadow review on an owner-selected eligible pull request. It does not print secrets.
