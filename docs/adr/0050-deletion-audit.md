# Deletion leaves time, actor, and scope

Deleting a run, repository, or installation leaves one audit event. It records the time, the owner ID, and the scope. It does not record source, finding text, repository name, pull request number, or a content hash. Owner deletion removes source-bearing data immediately. The scheduled cleanup remains the backstop for data that ages out.

## Considered Options

- Keep repository names in the audit so the owner can see what was deleted.
- Keep no audit event at all.

## Consequences

- The audit cannot be used to reconstruct a deleted review.
- Safe-mode and budget events are separate records and are not deletion audits.
