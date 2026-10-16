import { expect, test } from "bun:test";
import rawAffirm from "./fixtures/affirm.json";
import { fit, reviewCandidate, type SavedCandidate } from "./routes";

const affirm = rawAffirm as SavedCandidate;

const base = {
  job: "review" as const,
  priced: true,
  retainsData: false,
  explicitWeakerRoute: false,
  kind: "automatic-incremental" as const,
  spentCents: 0,
  ceilingCents: 1000,
  callCents: 5,
  patches: { "src/auth.ts": "@@ -1 +4 @@\n+token" },
  tokenCeiling: 12000,
  saved: affirm,
  verifyMappedToSameModel: false,
  rejectedFingerprints: [] as string[],
  malformedRepairs: 0,
};

test("a saved affirm response keeps category and does not change severity", () => {
  const result = reviewCandidate(base);
  expect(result).toMatchObject({ kind: "candidate", candidate: { category: "security", severity: "critical" } });
});

test("a response that still contains a raw token is not stored", () => {
  const leaked = { ...affirm, claim: "token ghp_private123 leaked" };
  expect(reviewCandidate({ ...base, saved: leaked })).toEqual({ kind: "refused", reason: "privacy" });
});

test("an unknown category suppresses the candidate and does not fail the run", () => {
  const result = reviewCandidate({ ...base, saved: { ...affirm, category: "style" }, malformedRepairs: 1 });
  expect(result).toEqual({ kind: "suppressed", reason: "unknown category" });
});

test("the fast route returns no candidate", () => {
  expect(reviewCandidate({ ...base, job: "fast" })).toEqual({ kind: "none" });
});

test("context over the incremental ceiling drops the later file", () => {
  const large = "x".repeat(40000);
  const fitted = fit({ "src/auth.ts": "small", "src/other.ts": large }, 12000);
  expect(fitted.dropped).toEqual(["src/other.ts"]);
  expect(fitted.body).not.toContain(large);
});

test("a missing price consumes no saved response", () => {
  expect(reviewCandidate({ ...base, priced: false })).toEqual({ kind: "refused", reason: "unpriced" });
});

test("a retaining provider without an explicit choice is refused", () => {
  expect(reviewCandidate({ ...base, retainsData: true })).toEqual({ kind: "refused", reason: "privacy" });
});

test("same-model verification is recorded when the owner mapped both routes", () => {
  expect(reviewCandidate({ ...base, verifyMappedToSameModel: true })).toMatchObject({ sameModelVerification: true });
});

test("a rejected claim is not sent again for the same head", () => {
  expect(reviewCandidate({ ...base, rejectedFingerprints: [`${affirm.path}:${affirm.claim}`] })).toEqual({ kind: "refused", reason: "rejected-claim" });
});
