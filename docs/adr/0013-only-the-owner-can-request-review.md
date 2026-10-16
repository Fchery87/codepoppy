# Only the owner can request a review

A review command counts only when the commenting GitHub user is the owner. Write access is not enough, and a collaborator's comment is ignored. The owner can also request a review from the dashboard. Commands cannot override privacy, repository enablement, SHA pinning, or a hard budget ceiling.

## Considered Options

- Let anyone with write access to the target repository run a command.
- Let a fork author request a review of their own pull request.

## Consequences

- The app ignores its own comments and reviews, so publication cannot request another review.
- Explain and config commands create no findings and do not move the last reviewed head.
- A GitHub check action is not a review command. Requested actions open the dashboard. They do not dispatch a run, so a person who can see the check cannot start a review.
- The whole trimmed comment must be `review`, `review full`, `review explain`, or `review config`. It may end with `precise`, `balanced`, or `thorough`. A leading slash is accepted and is not required. Any other text, including the word inside a sentence, is ignored.
