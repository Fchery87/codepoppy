# Context is ranked, budgeted, and never cut mid-file

Context is added in this order: the hunk being reviewed, the enclosing symbol, the direct imports that symbol uses, tests that name that symbol, and a failing deterministic result on that file. Any other context item needs a recorded reason and a token estimate. An automatic incremental review sends at most 12,000 estimated input tokens of context. A full review sends at most 40,000. A manual full review uses the same 40,000 ceiling. Its higher dollar ceiling does not buy a larger prompt.

The estimate uses the selected model's token counter when the adapter has one. Otherwise it uses one token per three characters, rounded up. The ceiling is applied before the call. Lower-priority items are dropped until the prompt fits. A hunk that does not fit is summarized or excluded. It is never split mid-file. Coverage names every file that was summarized or excluded.

## Considered Options

- Send the whole changed file and truncate at the provider's limit.
- Let a manual review spend its dollar ceiling on unlimited context.

## Consequences

- Dropped context is visible in the context manifest.
- Real usage above the estimate still counts against the personal budget. It does not expand the next prompt.
