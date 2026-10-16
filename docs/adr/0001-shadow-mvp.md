# Evaluation release is the shadow vertical slice

The evaluation release delivers shadow reviews and the evidence needed to evaluate them. The shared quality gate and repository shadow check control publication under ADR 0058; they are not exit criteria for the evaluation release. Public GitHub output, languages beyond TypeScript, JavaScript, Python, and Go, framework packs beyond SvelteKit and TanStack Start, repository-controlled command execution, learnings, and Docker stay out of that release. Publishing comments before qualification would make untested findings public.

## Considered Options

- Ship GitHub publication in the same release as the pipeline.
- Stop at a library with no dashboard, deletion, or safe mode.

## Consequences

- Acceptance stops at shadow. The configuration pull request, CLI, deletion, and safe mode remain in scope.
- Before any model call, the MVP runs secret redaction, file classification, and three-dot diff mapping. It attempts tree-sitter before semantic review for TypeScript, JavaScript, Python, and Go. A parse failure is recorded in coverage and does not corroborate a finding. It does not run repository lint, repository tests, CI ingestion, or CODEOWNERS.
- Dependency-bot pull requests follow the same review rules as any other pull request. A special dependency policy is later work.
- A consented labeled corpus exists before the Tier 1 analyzers are judged. Shared qualification controls later publication under ADR 0058, not the analyzer exit.
- Publication, suggestion, and learning rules remain product decisions so later work does not reopen them.
