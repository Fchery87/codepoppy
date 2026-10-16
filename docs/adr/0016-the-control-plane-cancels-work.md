# The control plane cancels obsolete work

The control plane marks an older run cancelled before it dispatches a newer request for the same pull request. The runner stops at the next stage boundary and discards unpublished model output. A paid call already in flight may finish, its cost counts, and its findings are not stored. GitHub Actions concurrency is only a backstop.

Automatic triggers wait two minutes from the latest event for that pull request, then dispatch the newest head. A manual trigger does not wait. Closing the pull request, converting it to a draft, or disabling the repository cancels a pending wait. It does not flush a review.

## Considered Options

- Let the Actions concurrency group be the only cancellation signal.
- Flush the debounce queue when a pull request is closed, so the last head is still reviewed.

## Consequences

- At most one run is active for a repository and pull request.
- A cancelled run does not become the last reviewed head.
- A manual request cancels a pending automatic wait for that pull request. The automatic request is not dispatched after the manual one.
- A push to a draft does not create a request. A draft becomes eligible when it is marked ready, or when the owner requests it while it is still a draft.
