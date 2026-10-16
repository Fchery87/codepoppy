# Schema changes run as a migration job, never at startup

The database changes only through a generated SQL migration run by a dedicated job. Application startup must not migrate. The migration is applied to an isolated database copy before production. Neon branching is allowed for that copy and is not required. Any Postgres that can run the schema is acceptable.

## Considered Options

- Let Drizzle push the schema when the app boots.
- Require Neon branching for every deployment.

## Consequences

- A failed migration does not leave the running app altering tables on the next request.
- The ledger schema remains ordinary Postgres.
