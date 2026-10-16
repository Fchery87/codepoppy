# The shadow gate counts real labeled defects, not only seeded fixtures

**Status:** Superseded by ADR 0058.

A replay fixture has a recorded three-dot diff, expected findings, prohibited false positives, and an owner label. Historical personal pull requests are eligible only when their code may be retained. Public repository code is not replayed through a provider that retains data.

The 50 rows may mix fixtures and real shadow pull requests. The 15 true positives required by the shadow gate must be owner-labeled defects from real shadow pull requests. Seeded fixtures may add coverage and may count toward the 50. They do not satisfy the 15. At least 10 of the 50 must be clean pull requests. If a large or oversized pull request was shadow-reviewed, at least one such row is included. If none was observed, the gate does not wait for one.

## Considered Options

- Let a fully synthetic corpus pass the shadow gate.
- Require every row to be a real pull request before any fixture is useful.

## Consequences

- A live shadow review of a public repository still follows the repository privacy policy. Replay does not get a weaker route.
- Representative means the rows record language, size class, and whether the change is documentation, configuration, or dependency. It does not mean a hand-picked set of easy defects.
