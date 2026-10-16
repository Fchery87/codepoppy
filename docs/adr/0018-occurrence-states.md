# Only a direct re-review can retire a finding

After a later head, a prior occurrence is fixed when its file was re-reviewed and the claim is gone, persisting when the claim remains at the same location, or moved when the same claim sits elsewhere. It is obsolete when the file leaves the pull request diff. It is uncertain when the file changed but was not re-reviewed, including when the budget stopped the review.

Uncertain never resolves a GitHub thread. Only fixed or obsolete may resolve one, and only from that direct evidence. The MVP stores these states. Resolving a thread matters once publication exists.

## Considered Options

- Treat every finding on a changed file that was not re-reviewed as fixed.
- Resolve a thread whenever the line number no longer matches.

## Consequences

- A budget cutoff cannot silently clear a finding.
- Files that leave the diff become obsolete without another model call.
