# Only the owner can see a review

GitHub is the only dashboard identity provider, and the only GitHub user who can sign in is the owner. A collaborator has no dashboard access. A dashboard session proves the owner. It cannot call GitHub or a model provider by itself. Shadow findings, retained prompts, and cost are visible only inside that session.

## Considered Options

- Let anyone with write access to an enabled repository view its shadow findings.
- Let the dashboard session mint installation tokens in the browser.

## Consequences

- Local CLI output can return to the owner on the same machine. It is not another dashboard audience.
- Deletion and safe-mode controls exist only in the owner's session.
