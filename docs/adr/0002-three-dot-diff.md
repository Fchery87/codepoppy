# The pull request diff is GitHub's three-dot diff

A review examines the three-dot diff GitHub associates with the pull request, not a local two-dot `git diff` between the base and head commits. Those differ whenever the base has moved, and a shallow checkout often cannot compute the merge base. Checkout exists to read file contents at the recorded SHAs.

## Considered Options

- Compute the merge base locally from a full clone.
- Treat the pulls compare API as a fallback only when checkout fails.

## Consequences

- Preflight and the runner both treat GitHub's pull request files as the diff source of truth.
- Coverage, line mapping, and publication placement are invalid if they do not match that diff.
- A review is true for its recorded base and head. CodePoppy does not poll for a base-branch move. The next pull-request event recomputes the diff.
