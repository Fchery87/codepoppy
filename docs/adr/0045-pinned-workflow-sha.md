# The runner workflow is pinned to a commit SHA

The control plane accepts an OIDC claim only for the configured full commit SHA of the workflow file in the private orchestration repository. A branch name or moving tag alone is not proof of that version. That repository pins a released CodePoppy version. It does not run the public repository's default branch.

GitHub dispatch takes a branch or tag ref, not a commit SHA. The control plane records the returned workflow run ID and checks the job's `workflow_sha` at claim time. If the dispatch ref moved to another commit, the claim fails closed. The workflow file must also exist on the orchestration repository's default branch for manual dispatch.

## Considered Options

- Track the private repository's default branch so updates deploy themselves.
- Pin a tag and move the tag when a release is cut.

## Consequences

- Changing the runner means changing the configured SHA on purpose.
- A workflow edited on a branch cannot claim runs until its SHA is configured.
