# The base-branch file is the only repository policy

Trusted configuration is `.github/ai-review.yml` at the tip of the pull request's base branch, read through the GitHub API. The pull request head cannot govern its own review. An approved learning is a proposal until that file contains it on the base branch. Branch protection is not what makes the file trusted. The dashboard warns when the base branch is unprotected.

## Considered Options

- Apply approved learnings immediately from the ledger.
- Trust the file only when the base branch has protection rules, and otherwise refuse review.
- Let the head's proposed config govern the review that introduces it.

## Consequences

- A proposed config change is shown to the owner and takes effect only after it is merged.
- Provenance stays on the learning proposal. The file remains the policy.
