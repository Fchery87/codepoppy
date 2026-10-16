# Enabling a repository does not review its open pull requests

When a repository is enabled, its open pull requests are imported: their number, head, and draft state are recorded, and no review request is created. A later qualifying event creates the first request. A draft is ignored until it is marked ready. A new push to a draft does not create a request. The owner may request a review of a draft explicitly. Reopening a closed pull request creates a new automatic request for its current head.

## Considered Options

- Review every open pull request immediately on enablement.
- Treat a draft push as a normal synchronize event.

## Consequences

- Importing records metadata only. It does not spend the model budget.
- A pull request that was already open and non-draft is reviewed when its next qualifying event arrives, not merely because it existed at enablement.
- The qualifying pull-request actions are opened, reopened, ready for review, and synchronize. Edited, labeled, assigned, and review-requested actions do not create a request. A comment on an issue that is not a pull request does not create a request.
