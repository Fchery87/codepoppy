# An automatic request is unique per head; a manual rerun is a new request

GitHub delivers webhooks at least once, so an automatic request is unique on installation, repository, pull request, head, and review kind. A repeated delivery of the same event is not a second request. A manual rerun is a different intent, so it is a new request linked to the earlier one. Reopening a closed pull request is also a new automatic request, even when the head was reviewed before the pull request closed.

Publication identity is separate from run identity. Otherwise a rerun on an unchanged head would comment twice.

## Considered Options

- One request forever per head, with rerun or reopen as another attempt of that request.
- Include the run ID in the publication key.

## Consequences

- Concurrency is one active run per repository and pull request. A newer request cancels the older run.
- Closing, converting to draft, or disabling the repository also cancels it.
- One pull request has one walkthrough comment, edited in place. One head has one check, updated in place. One fingerprint on one head has one inline comment. A retry updates the existing object.
