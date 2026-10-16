# A finding's identity is its claim, not its location

A finding fingerprint is a hash of the immutable repository ID, the finding category, the affected symbol, and the normalized failure claim. Line numbers, head SHAs, and wording are not part of it. A claim that moves is the same finding. A claim whose meaning changes is a new finding.

Normalization is NFKC, lowercase, and collapsed whitespace, with line numbers, SHAs, and file paths removed from the claim text. It does not stem or paraphrase. When tree-sitter names a symbol, the symbol is that language, file path, and name. When it does not, the fingerprint uses the file path and the normalized claim. Style is suppressed before fingerprinting and has no finding identity.

## Considered Options

- Hash the comment text and line number.
- Use an embedding similarity threshold to decide that two claims match.

## Consequences

- Reconciliation can mark a finding moved without treating it as new.
- A reworded comment about the same failure does not create a second thread.
- Category is part of identity, so the category list must stay closed.
