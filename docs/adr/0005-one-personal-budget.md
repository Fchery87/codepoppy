# One personal budget bounds every installation

CodePoppy is a personal product, so model spend and runner time each have one monthly ceiling shared across installations. A repository budget can only consume less of those ceilings. It cannot create a second pool. A model call or runner dispatch cannot start when its reserved upper bound exceeds the remaining relevant ceiling.

The control plane reserves the upper bound for a model call in the ledger before that call starts. The bound uses verified prices for every applicable charge, a safe upper bound on billed input tokens, and a set output-token limit. The context-planning token estimate is not a spending bound. A route without a verified price or safe token bound is ineligible for a paid call. The reservation belongs to the UTC month in which the call starts and is reconciled against reported usage when the call ends. Unused capacity returns to that month. A runner slot and its maximum billed minutes are reserved in the same Postgres transaction that marks a run ready for dispatch. Concurrent workers cannot pass a read-only budget or slot check and then both dispatch.

## Considered Options

- A separate hard budget on every repository.
- A soft warning with an automatic overrun allowance.

## Consequences

- The default model ceiling is $10 each UTC month. The runner ceiling is 1,500 GitHub Actions minutes.
- At 70 percent the system prefers incremental review and cheaper routes. At 95 percent only manual triggers run. At 100 percent paid model calls stop.
- Per-run ceilings remain $0.10 for automatic incremental, $0.40 for automatic full, and $1.00 for manual full.
- Runner minutes are the billed minutes GitHub reports for the orchestration workflow, not wall-clock time measured by CodePoppy.
- A model call counts against the UTC month in which the call starts, even when the response arrives in the next month.
- An unknown or unbounded price stops the paid call. The owner sees the pricing gap and missing semantic coverage. Raising the budget does not make an unpriced route eligible.
- At most three review workflows are active at once. A workflow is active from dispatch until it is complete, incomplete, failed, cancelled, or an expired dispatch. A request still waiting out its debounce does not take a slot.
- A terminal workflow releases its unused runner-minute reservation after the control plane records its billed minutes. If GitHub has not reported them yet, the reservation remains until reconciliation can account for them.
- A request that arrives while three are running stays queued until a slot is free or a newer head for that pull request supersedes it. It is not dropped.
- Exhausting the budget is a budget stop, not safe mode. A budget stop prevents new paid model calls and leaves dispatch of deterministic work and existing audit data alone.
