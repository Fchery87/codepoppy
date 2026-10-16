# Repository content cannot instruct the review

Source, pull request text, review comments, and configuration prose are untrusted data. They cannot change system policy, select a tool, reveal a credential, or override a route. A candidate whose claim is an instruction to ignore those rules is suppressed. The model has no tool that can run a repository command, write to GitHub, or read a secret.

## Considered Options

- Give the review model a shell so it can run the repository's tests.
- Treat text in `.github/ai-review.yml` as trusted prompt instructions with the same authority as system policy.

## Consequences

- The configuration file may set declared policy fields. Its free-text prose, if any is ever added, is data for the model, not authority.
- Publication and credential use stay in deterministic code.
