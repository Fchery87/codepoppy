# The inline cap counts findings, not walkthrough lines

The ordinary inline cap is five findings. Affirmed critical and high findings may pass it. Ten inline findings is absolute. Walkthrough findings and the walkthrough itself do not count. Overflow is listed in the walkthrough and is not given an inline comment.

The cap is applied after ordering verified findings by severity: critical, high, then medium. Low is never inline. Remaining ties use file path, then starting line, then fingerprint. The order is fixed so a retry selects the same findings.

## Considered Options

- Count walkthrough findings toward the five.
- Fill the five slots with medium findings before a sixth critical finding.

## Consequences

- The absolute cap can hide an eleventh critical finding from the inline review. Coverage says it overflowed.
- Suppressed candidates are not ranked and cannot fill a slot.
