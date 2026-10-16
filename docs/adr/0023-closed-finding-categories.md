# Finding categories are a closed list

A finding's category is one of `correctness`, `security`, `data-loss`, `authorization`, `concurrency`, `compatibility`, `error-handling`, `performance`, or `maintainability`. The model cannot invent another. Style is not a category and is suppressed before a finding exists. Severity is a separate judgment about the same claim. The category list is part of finding identity, so adding or renaming one is a migration, not a prompt tweak.

## Considered Options

- Let the model invent a category and normalize it later.
- Treat the category name as the severity.

## Consequences

- A response with an unknown category is malformed. Repair may rewrite it once. If it is still unknown, that candidate is suppressed.
- Two claims with different categories are different findings even when their text matches.
