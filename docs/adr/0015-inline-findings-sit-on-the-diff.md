# An inline finding must sit on the current diff

**Status:** The installation default profile is precise, per ADR 0027 and the product contract. The sentence below that says balanced is the default is historical. Balanced keeps the same inline rule as precise.

An inline finding is placed only on lines that exist in the current three-dot diff. A defect whose evidence is outside that diff is a walkthrough finding. A walkthrough finding does not consume an inline slot. The MVP does not publish a multi-line comment that starts outside the hunk.

## Considered Options

- Allow inline comments on unchanged context lines around a hunk.
- Publish every verified finding inline, including cross-file evidence.

## Consequences

- Precise publishes verified medium, high, and critical inline findings, never style. The ordinary cap is five inline findings. Critical and high may pass that cap, and no run publishes more than ten.
- Balanced is the default and uses that same inline rule. It does not put low findings in the walkthrough.
- Thorough may put verified low findings in the walkthrough, not in additional inline comments.
- Informational observations stay in the walkthrough in every profile.
