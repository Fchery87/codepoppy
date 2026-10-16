# A fork is reviewed without checking out the fork

A fork pull request is untrusted data. The runner does not clone the fork, check out fork-controlled code, run a fork workflow, or execute a fork command. It checks out the base repository at the recorded base SHA and reads the head through the base repository's pull request ref or the pull request API. The three-dot diff remains the diff source of truth.

A fork author cannot issue a review command. Only the owner can. Publication is attempted only when the head still belongs to that pull request. If it does not, the run is stale and nothing is written.

## Considered Options

- Clone the fork head so the runner can see the whole file tree.
- Refuse every fork pull request.

## Consequences

- Secret detection and classification still apply to the diff.
- Same-repository pull requests may be checked out at the recorded head because that repository is the installation target, not a fork.
