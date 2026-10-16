# No model route may silently weaken privacy

The default privacy policy is that a provider neither retains review content nor trains on it. OpenRouter meets that through zero data retention and denied data collection. A native provider is eligible only when its recorded privacy attributes meet the same bar. Skipping semantic review is preferable to sending repository content somewhere the policy does not allow.

## Considered Options

- Treat native OpenAI and Anthropic as trusted exceptions.
- Fall back to the cheapest available endpoint and disclose the downgrade after the call.

## Consequences

- A repository may name a weaker provider explicitly. Nothing else may select one.
- Sensitive repositories retain no prompt or response body. Hashes, usage, and stage outcomes remain.
