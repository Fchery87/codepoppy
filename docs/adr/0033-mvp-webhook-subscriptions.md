# The MVP subscribes only to events it can act on

The GitHub App subscribes to installation, installation-repositories, pull request, and issue comment events in the evaluation release. The first usable release also subscribes to pull request review comment and pull request review thread events for participant responses and explicit clarification requests under ADR 0060. Those events never create review requests. It does not subscribe to check runs, check suites, or workflow runs, because it does not ingest CI and its own check activity must not create review work.

GitHub documents [pull request review comment and review thread webhooks](https://docs.github.com/en/webhooks/webhook-events-and-payloads) separately from issue comments.

## Considered Options

- Subscribe to every event the publication design might eventually use.
- Subscribe to workflow-run events so the MVP can mention CI failures.

## Consequences

- CI ingestion, when it exists, is a new subscription and a new permission. It is not implied by Actions write.
- Issue comment events are how the owner's review commands arrive. Comments by anyone else, including the app, do not create a request.
