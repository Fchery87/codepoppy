# Pull request participants may respond, but only the owner labels quality

Pull request participants may reply to or dismiss a published finding in GitHub. Their response is review feedback, not an authoritative quality label. Only the self-hosting owner labels a finding actionable or false positive for evaluation, so a thread action cannot silently change the measured quality of the reviewer.

A participant may explicitly request one clarification in the finding's thread. CodePoppy replies there once for that finding. Routine replies and thread resolution do not trigger it. Further discussion stays between people unless the owner starts a new review request.

Clarification explains the evidence from the finding's reviewed head and creates no new finding. If the pull request head changed, CodePoppy says the finding is stale and directs the owner to request a new review.

## Considered Options

- Restrict all responses to the owner.
- Treat a participant reaction or resolved thread as a quality label.

## Consequences

- CodePoppy must preserve participant responses and owner labels as separate concepts.
- The exact text that requests clarification remains to be defined before implementation.
