# Incremental review examines only the diff that changed

An incremental review sends the model the files whose hunks differ between the last reviewed head's three-dot diff and the new head's three-dot diff. Unchanged files are not sent again. Prior findings on changed files are reconciled. Prior findings on files that left the diff become obsolete. A full review always examines the whole three-dot diff.

The last reviewed head is the head of the latest complete run on that pull request. An incomplete, cancelled, failed, explain, or config run does not advance it. When no such head exists, an incremental request still has incremental kind, but its scope is the whole pull request.

## Considered Options

- Re-send the entire three-dot diff on every push.
- Treat the git range between the two heads as the scope, even when a base-branch move changes other hunks.

## Consequences

- A base-branch move that changes a hunk makes that file in scope, because the reviewed diff changed.
- Findings on unchanged files stay as they are and are not sent back to the model.
