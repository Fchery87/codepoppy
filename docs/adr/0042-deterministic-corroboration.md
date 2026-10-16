# Only a secret hit can corroborate a medium finding

In the MVP, a secret hit corroborates a security candidate on the same file whose claim is credential exposure. Nothing else counts. A tree-sitter parse error describes a limit of analysis, not proof of a code defect. Tree-sitter structure, file classification, and size class are not corroboration.

A medium candidate without corroboration needs a verifier affirmation. A critical or high candidate always needs affirmation, even when a secret hit agrees.

## Considered Options

- Treat any deterministic warning on the same file as corroboration.
- Run the repository's compiler and treat its errors as corroboration in the MVP.

## Consequences

- The MVP does not need a language compiler to verify a medium finding.
- A parse error cannot corroborate a finding, whether inside or outside its range.
