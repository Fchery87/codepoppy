import { expect, test } from "bun:test";
import { approvePublication, countOwnerLabels, omittedUnqualified, qualifyRoute, savedReplayReservation, shadowCheck, type QualificationRecord, type ShadowReview } from "./qualify";

const record: QualificationRecord = { language: "typescript", modelId: "fixture-model", provider: "openrouter", promptVersion: "p1", pipelineVersion: "v1" };

const review: ShadowReview = {
  headSha: "b".repeat(40),
  complete: true,
  githubWrites: 0,
  findings: [{ fingerprint: "f1", labeled: true, labelSource: "owner" }],
};

test("a missing corpus record stays unqualified", () => {
  expect(qualifyRoute(undefined, record)).toBe(false);
  expect(approvePublication({ qualified: false, shadowPass: true, previewHeadSha: review.headSha, currentHeadSha: review.headSha })).toBe(false);
});

test("labels on every finding and a zero-write preview can approve", () => {
  expect(shadowCheck(review)).toEqual({ pass: true, unlabeled: [] });
  expect(approvePublication({ qualified: true, shadowPass: true, previewHeadSha: review.headSha, currentHeadSha: review.headSha })).toBe(true);
  expect(review.githubWrites).toBe(0);
});

test("one unlabeled finding blocks approval", () => {
  const pending = { ...review, findings: [{ fingerprint: "f1", labeled: false, labelSource: "owner" as const }] };
  expect(shadowCheck(pending).pass).toBe(false);
  expect(approvePublication({ qualified: true, shadowPass: false, previewHeadSha: review.headSha, currentHeadSha: review.headSha })).toBe(false);
});

test("a changed prompt version requires qualification again", () => {
  expect(qualifyRoute(record, { ...record, promptVersion: "p2" })).toBe(false);
});

test("a participant reply does not increase the owner label count", () => {
  const findings = [{ fingerprint: "f1", labeled: true, labelSource: "participant" as const }];
  expect(countOwnerLabels(findings)).toBe(0);
});

test("a saved replay does not record a reservation", () => {
  expect(savedReplayReservation(false, true)).toBe("none");
});

test("a live fixture flag reserves and an unpriced route still refuses", async () => {
  const { reserve } = await import("../core/budget");
  expect(reserve({ kind: "manual-full", priced: true, callCents: 10, spentCents: 0, ceilingCents: 1000 })).toMatchObject({ kind: "reserved" });
  expect(reserve({ kind: "manual-full", priced: false, callCents: 10, spentCents: 0, ceilingCents: 1000 })).toEqual({ kind: "refused", reason: "unpriced" });
});

test("an unqualified file in a mixed review is named", () => {
  expect(omittedUnqualified([{ path: "src/auth.ts", qualified: true }, { path: "src/app.py", qualified: false }])).toEqual(["src/app.py"]);
});

test("approval does not move to a new head", () => {
  expect(approvePublication({ qualified: true, shadowPass: true, previewHeadSha: review.headSha, currentHeadSha: "c".repeat(40) })).toBe(false);
});
