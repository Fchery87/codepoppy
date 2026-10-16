# First publication includes verified medium inline findings

After the shared quality gate, a repository shadow check, and owner approval, the first usable release publishes one walkthrough and verified medium, high, and critical findings on changed lines. It does not require a summary-only stage or 20 severe-stage publications before medium findings appear. The ordinary inline cap is five, with the existing severe exception and absolute cap of ten.

The current-head walkthrough and check are written even when no actionable finding remains. They report coverage and say that no actionable finding was found. They do not assert that the pull request is safe to merge.

If a pull request changes files in both qualified and unqualified language families, CodePoppy may publish verified findings for qualified files. The walkthrough names each omitted file and the reason. The check is neutral for partial coverage. The walkthrough does not claim that the whole pull request has no actionable findings.

If a required review stage fails, CodePoppy writes a failed check with a sanitized incomplete-review reason and an owner-only diagnostics link. It publishes no finding or clean walkthrough for that head. The failed check does not claim that the code is defective.

The check is success only when semantic review covered every eligible file and no inline finding remains. It is neutral when an inline finding remains or semantic coverage is partial, including an unqualified language. It is skipped when policy or the absence of eligible files prevented semantic review. It is failure when a required stage fails while the pull request still exists. A closed, merged, or deleted pull request cancels publication and gets no new check. An optional-stage failure affects the conclusion only when it reduces promised coverage.

## Considered Options

- Publish a summary first and add inline findings in later stages.
- Publish only high and critical findings at first.
- Publish low findings inline.
- Remain silent on a reviewed pull request when no actionable finding remains.
- Keep every mixed-language pull request in shadow until all its languages qualify.

## Consequences

- Publication still requires a complete run for the current head and idempotent writes.
- The finding contract follows ADR 0061. Participant responses and owner labels follow ADR 0060.
- Low and informational findings remain outside inline comments.
