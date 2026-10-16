# GitHub App permissions are the minimum that can publish and dispatch

The app asks only for the repository permissions its journeys use. Contents write opens the configuration pull request. Pull requests write reads the three-dot diff, reads review commands, and later writes the grouped review and walkthrough. Checks write is held for publication. Actions write dispatches the private orchestration workflow. Metadata is mandatory.

## Considered Options

- Contents read and Actions read, which cannot open the configuration pull request or dispatch a workflow.
- Issues write in addition to pull requests write.
- Workflows write so the app can commit workflow files.

## Consequences

- Creating and editing an issue comment requires pull requests write. Issues read does not grant it. The app does not request Issues write.
- Dispatch is Actions write. The separate Workflows permission is not requested, so the app cannot modify files under `.github/workflows`.
- Commit statuses are not requested. Actions read, for CI ingestion, is not requested in the MVP.
- The runner's installation token is limited to the target repository. The control plane dispatches the private orchestration workflow.
