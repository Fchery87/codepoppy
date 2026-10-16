# Retention is enforced by deletion, with a scheduled backstop

A signature-valid webhook body is stored encrypted and deleted when the delivery is normalized or after 24 hours, whichever comes first. A rejected signature stores the delivery ID, the time, and the reason, and stores no body. Runner artifacts live 3 days. Failed-run diagnostics live 7 days. Prompt and response bodies live 7 days. Structured findings and feedback live 90 days. Usage and coverage metadata live 180 days. The checkout dies with the workflow. A one-time authorization dies when it is claimed or 60 minutes after dispatch, whichever comes first.

The owner marks a sensitive repository in the dashboard. A sensitive repository retains no prompt or response body. Repository configuration cannot turn retention back on. Owner deletion of a run, repository, or installation removes source-bearing data immediately. The scheduled cleanup is the backstop for data that reaches its age.

## Considered Options

- Keep prompts until the owner deletes them.
- Let `.github/ai-review.yml` choose the retention period without a system ceiling.

## Consequences

- Hashes, usage, stage outcomes, and audit records follow their own ages. They are not source bodies.
- A minimal non-content audit event survives deletion and records only the time and scope.
