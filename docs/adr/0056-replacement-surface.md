# The MVP is replaced by rebuilding it, not by loading plugins

A self-hoster may replace the model provider, the artifact store, or the queue by changing the deployment build. Language analyzers, framework packs, and verifiers are compiled into that build. They are not a plugin API. The target repository cannot select or install code. A plugin loader is later work.

## Considered Options

- Load analyzers from the repository being reviewed.
- Publish a stable plugin API before the shadow gate exists.

## Consequences

- Adding a language means a new CodePoppy release.
- The repository file can choose approved route aliases and declared policy. It cannot choose code.
