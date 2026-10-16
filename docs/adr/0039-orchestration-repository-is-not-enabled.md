# The runner repository is installed but not reviewed by default

The GitHub App is installed on the private orchestration repository so it can dispatch the review workflow. Review enablement there defaults to off. Dispatch does not require enablement. The owner may enable that repository explicitly, and then it follows every normal review rule, including shared qualification, a repository shadow check, and owner approval under ADR 0058.

## Considered Options

- Leave the app uninstalled on the runner repository and dispatch with a personal token.
- Enable review automatically because the app is installed.

## Consequences

- Actions write is used against that repository for dispatch only.
- A workflow change is not reviewed unless the owner turns review on.
