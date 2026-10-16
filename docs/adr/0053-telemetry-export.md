# Exported telemetry is counts and durations, and export is off

The dashboard reads the ledger. It does not need an external telemetry vendor. Export is off unless the owner configures a destination. What may leave is counts, durations, statuses, and route names. Source, diffs, prompts, responses, secrets, and credentials never leave.

## Considered Options

- Send traces to a vendor by default.
- Keep prompts in traces so failures can be debugged remotely.

## Consequences

- A self-hoster can run with no telemetry account.
- Turning export on does not change what the ledger is allowed to store.
