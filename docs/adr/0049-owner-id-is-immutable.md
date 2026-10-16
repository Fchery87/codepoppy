# The owner is a configured GitHub user ID

The deployment configures one immutable GitHub user ID. A renamed login still matches. There is no second owner and no transfer flow. Changing the configured ID is a new deployment configuration, not a dashboard action.

## Considered Options

- Match the owner by the current GitHub login.
- Allow the owner to add another dashboard user from the dashboard.

## Consequences

- Review commands match that same user ID.
- A login rename does not lock the owner out and does not let a new holder of the old login in.
