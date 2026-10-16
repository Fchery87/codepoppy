import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { openMemory } from "../ledger/store";
import { Claims } from "./claim";

const PIN = "abc123";
const HEAD = "b".repeat(40);

function harness(slots = () => 0) {
  const ledger = openMemory();
  ledger.insertRequest({ id: "req-1", installationId: 1, repositoryId: 9, pullRequest: 7, headSha: HEAD, reviewKind: "incremental", trigger: "automatic" });
  ledger.insertRun({ id: "run-1", requestId: "req-1", state: "dispatched", headSha: HEAD });
  return { ledger, claims: new Claims(ledger, PIN, 55, slots) };
}

const proof = { audience: "codepoppy", repositoryId: 55, event: "workflow_dispatch", workflowSha: PIN, runId: "run-1", now: 1_000 };

test("one claim marks the run claimed", () => {
  const { ledger, claims } = harness();
  expect(claims.claim(proof).kind).toBe("claimed");
  expect(ledger.readRun("run-1")?.state).toBe("claimed");
});

test("a second claim is rejected and the first token expires on use", () => {
  const { claims } = harness();
  const first = claims.claim(proof);
  expect(claims.claim(proof)).toEqual({ kind: "rejected", reason: "already claimed" });
  if (first.kind !== "claimed") throw new Error("expected claim");
  expect(claims.submit(first.token, first.expiresAt + 1)).toEqual({ kind: "rejected", reason: "callback spent" });
});

test("a workflow sha other than the pin is rejected", () => {
  const { claims } = harness();
  expect(claims.claim({ ...proof, workflowSha: "other" })).toEqual({ kind: "rejected", reason: "workflow sha" });
});

test("a different repository is rejected", () => {
  const { claims } = harness();
  expect(claims.claim({ ...proof, repositoryId: 9 })).toEqual({ kind: "rejected", reason: "repository" });
});

test("the callback token cannot publish", () => {
  const { claims } = harness();
  const first = claims.claim(proof);
  if (first.kind !== "claimed") throw new Error("expected claim");
  expect(claims.publish(first.token)).toEqual({ kind: "rejected", reason: "callback cannot publish" });
});

test("an unclaimed expiry is an expired dispatch and safe mode stays off", () => {
  const { ledger, claims } = harness();
  expect(claims.expireUnclaimed("run-1")).toEqual({ kind: "expired-dispatch" });
  expect(claims.safeMode).toBe(false);
  expect(ledger.readRun("run-1")?.state).toBe("failed");
});

test("a spent callback cannot submit twice", () => {
  const { claims } = harness();
  const first = claims.claim(proof);
  if (first.kind !== "claimed") throw new Error("expected claim");
  expect(claims.submit(first.token, proof.now).kind).toBe("accepted");
  expect(claims.submit(first.token, proof.now)).toEqual({ kind: "rejected", reason: "callback spent" });
});

test("the workflow file contains no secret assignment", () => {
  const file = readFileSync(new URL("../../runner/workflow.yml", import.meta.url), "utf8");
  expect(file).not.toMatch(/(SECRET|TOKEN|PASSWORD|API_KEY)\s*[:=]/);
});

test("a fourth run stays queued while three are active", () => {
  const { ledger, claims } = harness(() => 3);
  expect(claims.claim(proof)).toEqual({ kind: "rejected", reason: "no slot" });
  expect(ledger.readRun("run-1")?.state).toBe("queued");
});
