# Size class limits semantic review before the model is called

A relevant file is readable text that is not binary, generated, vendored, minified, or a lockfile. Excluded files still receive classification and secret detection. They never receive line-by-line semantic review. A documentation-only pull request has no relevant file outside documentation and receives a deterministic review.

Small means at most 10 relevant files, 500 changed lines, and 100 KB of relevant text. Medium means at most 30 files, 1,500 lines, and 500 KB. Large means at most 75 files, 5,000 lines, and 2 MB. Oversized is anything above a large limit. Changed bytes or an estimated token count can move a pull request up one or more classes. Nothing moves it down.

Small and medium pull requests get full eligible semantic coverage inside the context and money ceilings. Large pull requests deep-review relevant files in risk rank until the context ceiling and summarize the rest. Oversized pull requests get deterministic checks, a change summary, and named omissions. They get semantic review only when the owner requests a full review.

Risk rank is deterministic. First come files with a secret-detection hit. Then paths whose filename or path segment contains `auth`, `session`, `login`, `payment`, `billing`, `migration`, or `migrate`, and anything under `.github/workflows`. Then SvelteKit files named `hooks.server.*`, `+page.server.*`, or `+server.*`, and TanStack Start files under `src/server` or `app/server`. Then the largest changed files. Coverage names every summarized or omitted file.

A test file has a path segment of `test`, `tests`, or `__tests__`, or a filename containing `.test.` or `.spec.`. Context may include that test only when its text also contains the symbol name being reviewed.

An automatic trigger whose pull request has no semantic-review eligible file, including a documentation-only pull request, creates a review request. The deterministic stages run, including secret detection on excluded readable text. A complete run with no semantic review becomes the last reviewed head. An owner request follows the same rule.

## Considered Options

- Send every changed file and stop when the provider truncates the prompt.
- Let a model decide which files are worth reading.

## Consequences

- Generated, vendored, minified, binary, and lockfile paths do not inflate the relevant-file count.
- Documentation is Markdown, reStructuredText, AsciiDoc, and files under a docs directory, plus license and changelog files. Configuration is not documentation.
- A pull request that mixes documentation with another relevant file is not documentation-only.
