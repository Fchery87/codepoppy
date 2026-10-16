# The verifier affirms, rejects, or leaves a candidate unresolved

The verifier sees the candidate, the diff, and the evidence. It does not see the generator's reasoning. Affirm is required before a critical or high finding can be published. Reject and unresolved both suppress it. A medium finding needs an affirmation or direct deterministic corroboration. A low finding is never inline.

The verifier cannot change the candidate's category or severity. A different-prompt verification is required. When the verify route names a different eligible model, that model is used. When the owner has mapped both routes to the same model, same-model verification is allowed and recorded. A rejected claim is not regenerated on a later head unless the code covered by that claim changes.

## Considered Options

- Average a numeric confidence score from the generator and verifier.
- Let the verifier downgrade a critical candidate to medium and publish it under the medium rule.
- Require a second provider even when the owner configured only one eligible model.

## Consequences

- One eligible model is enough to run semantic review.
- The dashboard shows whether verification used a different model.
- Rejection survives an unchanged head and a manual rerun of that same head.
