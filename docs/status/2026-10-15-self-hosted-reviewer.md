# Self-hosted reviewer status

**Date:** 2026-10-15

## Done in this workspace

PR-01 through PR-12 have local unit implementations. `bun test` reports 128 pass, 0 fail, across 15 files. `bun run typecheck` exits 0. Measured by running both commands from the repository root after the last edit.

The suite uses fixtures. It does not call GitHub, Cloudflare, a model provider, or a running Postgres server. The ledger tests use Bun's in-memory SQLite.

## Not done

No git repository exists, so no commit and no pull request exists. The plan's ten cloud live lanes, screenshots, and videos were not run. A real webhook, a real GitHub comment, and a live model call still need the owner's credentials.

The gitleaks pin names version 8.24.3 and a placeholder rule-pack digest. The scanner tests use an injected runner. They do not execute the gitleaks binary.

`src/quality/corpus/typescript.json` is a manifest, not a labeled defect corpus. Quality thresholds remain unset.

Python, Go, native OpenAI, native Anthropic, and the SvelteKit and TanStack Start path ranks stay parked.

## Later work

Replace the placeholder gitleaks digest with the digest of the binary the owner pins. Point the ledger at Postgres when the owner supplies a database. The current store speaks SQLite so the transaction behavior can be tested without that database.
