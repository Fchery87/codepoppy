# The configuration pull request proposes policy and cannot publish by itself

When a repository is enabled, CodePoppy opens one pull request onto the repository's default branch from the branch `codepoppy/config`. The pull request adds version 1 of `.github/ai-review.yml`: the detected languages, the precise profile, the shadow posture, the default privacy policy, and the path excludes the owner accepted. If that pull request is already open, CodePoppy updates it instead of opening another. The owner merges it. CodePoppy never does.

Until that file is on the base branch, the repository uses its installation defaults and the dashboard says the file is absent. An absent file is not a failed review. Once the file is on the base branch, it is the repository policy for profile, excludes, privacy, route aliases, and requested publication posture. The personal budget stays an owner setting and is not in the file. A file that requests publish does not bypass shared qualification, the repository shadow check, or owner approval under ADR 0058.

## Considered Options

- Let the dashboard keep a second copy of policy after the file is merged.
- Have CodePoppy merge the configuration pull request when checks are green.
- Treat a request to publish in the file as permission to skip the shadow gate.

## Consequences

- Head changes to the file are shown and do not govern the review that proposes them.
- An absent file uses installation defaults. A file that is present but invalid fails the run. It is a required-stage failure, not a reason to fall back to defaults.
- The config branch is updated only when the open pull request is the one CodePoppy opened and the branch tip is a commit CodePoppy created. Any other existing `codepoppy/config` branch is a collision. CodePoppy does not push, and it never force-pushes.
- The app needs contents write to open this pull request and does not need workflows write, because the file is not a workflow.
- Before the file reaches the base branch, installation defaults are the precise profile, shadow posture, the default no-retention privacy policy, and no extra path excludes.
