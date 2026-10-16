# Publication starts with a summary and earns inline findings

**Status:** Superseded by ADR 0059.

The shadow gate is per repository. Passing it does not publish anything by itself. The owner may then move that repository from shadow to the summary stage, which writes one check and one walkthrough and no inline finding. Inline findings require a separate owner approval to enter the severe stage. That stage publishes affirmed critical and high findings only.

The standard stage becomes available after 20 runs on that repository have completed severe-stage publication with no duplicate publication. The owner turns it on. It adds affirmed medium inline findings for the precise profile. Low findings stay in the walkthrough when the profile is thorough. Suggestions are stored and are not published in any of these stages. Merge gating is not part of the first publication release.

If the pull request head has changed since the run, publication writes nothing and the run is stale.

## Considered Options

- Publish inline findings as soon as the shadow gate passes.
- Advance from severe to standard without the owner turning it on.
- Let findings fail the check in the first publication release.

## Consequences

- A duplicate publication is a second walkthrough comment, a second check for the same head, or a second inline comment for the same fingerprint and head. The incident count is per repository and resets the eligibility for the standard stage.
- The check's only requested action opens the dashboard. It does not dispatch a review.
- A grouped review is submitted only in the severe and standard stages, and only when it contains at least one inline finding.
- That grouped review uses the COMMENT action. It never approves the pull request and never requests changes.
