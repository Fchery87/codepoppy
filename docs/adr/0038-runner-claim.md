# The runner claims a run with GitHub OIDC

The runner proves a claim with the GitHub OIDC token for that workflow job. The control plane verifies the token and checks its audience, immutable orchestration repository ID, `workflow_dispatch` event, pinned `workflow_sha`, and `run_id` against the workflow run ID recorded for that dispatch. It then claims the review run once. The review run ID is a workflow input because it is not a secret. No credential is a workflow input.

The claim response returns an installation token for the target repository only, and a callback token that can request budget reservations and append results for that run only. The claim itself expires 60 minutes after dispatch or when it is used, whichever comes first. If the runner has not claimed by then, the run fails as expired dispatch. That is not safe mode.

The installation token is GitHub's one-hour token and is not refreshed. The runner does not receive a token for the orchestration repository. A same-repository checkout uses the target token. A fork head is read through the pull request API with that same token.

The callback token lives 60 minutes from the claim. It cannot read another run, publish to GitHub, or refresh itself. A reservation request fails if the run is cancelled, its head is stale, its privacy policy forbids the route, or its remaining budget cannot cover the bounded call. If the token expires after results have been stored, the run is incomplete and its stored coverage remains. If it expires before any result is stored, the run is a required-stage failure.

## Considered Options

- Send a one-time secret in `workflow_dispatch` inputs.
- Give the runner the database URL and skip the claim.
- Refresh the installation token until the review finishes.

## Consequences

- The GitHub App private key stays on the control plane.
- A reused OIDC token cannot claim a second run.
- Stage callbacks without a live callback token are rejected.
- A review that needs more than one hour of GitHub access fails closed instead of minting a second token.
