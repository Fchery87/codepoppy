# An incomplete run is visible and cannot anchor the next review

A complete run finished every required stage that applied and stored its coverage. An incomplete run stored results and then stopped early: the callback expired, or the runner refused a model call because the remaining time or money could not pay for it. Incomplete is not the last reviewed head. Its findings stay visible to the owner and cannot be published. Reconciliation does not resume it. If no complete head exists, the next automatic request reviews the whole pull request.

The product time budget is 15 minutes for an automatic run and 30 minutes for a manual full run. The workflow job is allowed 20 and 40 minutes so the runner stops before GitHub kills it. The runner does not start a model call that would exceed the remaining time or dollar budget. If required semantic stages have not finished, the run is incomplete. If they have finished, the run is complete and coverage names the omitted work.

## Considered Options

- Treat any run with stored findings as the last reviewed head.
- Resume an incomplete run when the callback is minted again.

## Consequences

- A later complete run replaces the incomplete one as the baseline. The incomplete findings remain historical.
- Expired dispatch, with no stored result, stays a required-stage failure rather than an incomplete run.
