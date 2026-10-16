# The walkthrough is one issue comment, edited in place

The durable review summary is a single CodePoppy issue comment on the pull request. It is not written into the pull request body, because that body belongs to the author. The grouped review body stays short, and the check repeats only the conclusion and a link. In shadow the same content stays in the dashboard and nothing is created on GitHub.

## Considered Options

- Append the summary to the pull request body.
- Put the full summary in the check run text.
- Post a new comment on every head.

## Consequences

- The walkthrough is the app's comment whose body starts with `<!-- codepoppy:walkthrough -->`. Updating it edits that comment.
- If two comments start with that marker, that is a duplicate publication. The control plane enters safe mode and does not guess which comment to edit.
- A cross-file finding that cannot sit on the diff goes in the walkthrough, not in an inline comment.
