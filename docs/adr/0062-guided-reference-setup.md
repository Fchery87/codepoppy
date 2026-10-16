# Guided setup follows one reference path and validates alternatives

The self-host setup guides the owner through the documented Cloudflare, Postgres, GitHub Actions, and model-provider path. It shows and requires confirmation before each external write. A doctor report verifies prerequisites, webhook delivery, runner claim, route eligibility, and one completed shadow review. Alternative Postgres and provider choices are validated, not provisioned by the guided path.

The owner selects an existing, semantic-review eligible test pull request in an enabled repository for the end-to-end doctor check. Doctor does not create a pull request or change product code merely to test setup.

## Considered Options

- Automate provisioning for every supported infrastructure combination.
- Provide manual documentation and a validation command only.

## Consequences

- The setup may automate a step only after its provider API and rollback behavior are verified. A manual step is documented when automation is unavailable.
- The CLI must be safe to resume after an interrupted setup and must not print credentials.
- Time to the first completed shadow review is measured on a fresh installation.
