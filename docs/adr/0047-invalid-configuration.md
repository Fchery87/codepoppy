# Invalid trusted configuration fails before a model call

Trusted configuration is invalid when it has an unknown field, lacks `version: 1`, names a route alias the owner has not approved, sets a repository budget above the personal ceiling, or sets a publication posture other than shadow or publish. The run fails before classification and before any model call. The dashboard shows the line and the field.

The file validated is the base-branch file. A changed copy on the head does not govern, and does not fail, the review that proposes it. An absent file is not invalid. It uses installation defaults.

## Considered Options

- Ignore unknown fields so older runners keep working.
- Fall back to installation defaults when the file is invalid.

## Consequences

- A repository budget may be lower than the personal ceiling, never higher.
- Publish in the file still does not bypass shared qualification, the repository shadow check, or owner approval under ADR 0058. The value is legal configuration, not permission to publish.
