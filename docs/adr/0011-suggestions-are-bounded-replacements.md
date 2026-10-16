# A suggestion is one small single-file replacement

A suggestion replaces lines in one file, changes at most 20 lines, and touches only lines in the current three-dot diff. It must apply cleanly and parse. It cannot change dependencies, migrations, authentication, or workflow files. The MVP stores suggestions and does not publish them.

## Considered Options

- Allow multi-file remediation in the first publication release.
- Publish suggestion blocks as soon as findings are stored.

## Consequences

- Anything broader is a finding without a suggestion.
- Publication of suggestions is a later decision, after the shadow gate.
