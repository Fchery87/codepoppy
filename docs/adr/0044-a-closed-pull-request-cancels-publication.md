# A pull request that disappears is not a failed review

If the pull request is closed, merged, deleted, or inaccessible before publication, the run is cancelled. Nothing is written to GitHub. This is not a required-stage failure and does not fail the check. A permission failure while the pull request still exists is a required-stage failure.

## Considered Options

- Publish the walkthrough after merge so the result is visible.
- Treat a merge during the run as a system failure.

## Consequences

- A cancelled run does not become the last reviewed head.
- Reopening the pull request creates a new request. It does not resume the cancelled run.
