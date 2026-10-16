# A shared quality gate qualifies the reviewer before a repository publishes

A labeled corpus measures review quality across supported repositories. Qualification applies to each language family and model route used for published files. Files without a qualified configuration are omitted from publication and named in a partial-coverage walkthrough under ADR 0059. Each repository then completes a shadow check for its own configuration, privacy, diff placement, and publication safety. The owner approves publication. Quiet repositories do not need to produce a fixed number of real defects or wait a fixed number of days to leave shadow.

## Considered Options

- Require a full quality sample, including a fixed number of real defects, in every repository.
- Let the owner publish without measured quality evidence.

## Consequences

- The shared corpus includes licensed or owner-created fixtures, clean changes, and real pull requests the owner explicitly opts in. Private source is reusable only when the repository's privacy and retention policy allows it and the owner separately consents. Otherwise the corpus keeps labels and aggregate metrics without reusable source. Reports distinguish these sources and show sample sizes.
- Qualification reports actionable precision by severity, confirmed misses on inspected changes, valid diff placement, coverage, and time to a visible review. It reports sample sizes and inspection status. An uninspected pull request is not counted as proof that the reviewer missed nothing.
- Live publication monitoring reports stale or duplicate writes separately from finding quality. Neither may be hidden by an aggregate accuracy score.
- Qualification records the concrete model IDs, permitted provider routing, prompt versions, context planner, candidate generator, and verifier versions behind a logical route. A change to any of these requires requalification for that language and route. A fallback must qualify separately. An aggregate score cannot hide a weak configuration.
- The repository shadow check requires one completed live semantic review of an eligible pull request, owner labels for every proposed inline finding, and an owner preview of the exact current-head PR output. The preview writes nothing to GitHub.
- Unlabeled publication candidates from real shadow pull requests block that repository's approval. The owner records confirmed misses on inspected pull requests.
- Numerical quality thresholds require calibration against the corpus before the PRD adopts them.
- Qualification thresholds and the held-out evaluation sample are fixed before a candidate configuration is judged. The owner may revise them for a later qualification run, but not to turn a failed run into a pass.
- Live model calls used for qualification spend the personal model budget under ADR 0063.
- Stale or duplicate GitHub writes remain release-blocking publication failures.
