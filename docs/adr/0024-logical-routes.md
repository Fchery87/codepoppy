# Each logical route has one job and one fallback

`fast` produces the change summary and cannot produce a candidate. `review` produces candidates. `verify` produces an affirm, reject, or unresolved verdict and cannot change category or severity. `repair` rewrites one malformed structured output once. A second malformed output suppresses that candidate and does not fail the run. `fallback` is the single alternate for a failed route. It must already meet the repository privacy policy and, for publication, qualify separately for the language under ADR 0058. There is no second alternate.

The owner defines approved route aliases at installation level. A repository may select one of those aliases. It cannot name an endpoint, a credential, or a model the owner has not approved. An unknown alias is not silently replaced.

An OpenRouter alias pins one model and a permitted provider. The adapter sends `zdr: true`, `data_collection: "deny"`, a one-provider allowlist, and `allow_fallbacks: false` under the default privacy policy. It sends no OpenRouter model-fallback list. If that provider is unavailable, CodePoppy uses only its separately approved `fallback` route. The runner records the actual provider returned by OpenRouter; an unexpected provider cannot qualify or publish findings.

A timeout, connection reset, overload response, or retryable rate limit is retried with bounded backoff while the stage's time and money remain. Authentication failure, a privacy refusal, and a response that is still malformed after one repair are not retried. The eligible fallback is then tried once, with the same transient-retry rule and no further fallback. If candidate generation or verification was required and no eligible route completes it, the run is incomplete when it has stored results and failed when it has none. Its deterministic result and missing coverage remain visible to the owner. A failed call produces no finding.

## Considered Options

- Let the repository file name any provider model.
- Walk an open-ended chain of cheaper providers after a failure.
- Retry malformed output until the budget is gone.

## Consequences

- `fast` failure does not fail the run, because the change summary is optional.
- One approved model is enough. Same-model verification stays recorded as such.
- Fallback cannot weaken privacy.
