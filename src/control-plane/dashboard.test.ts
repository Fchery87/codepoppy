import { expect, test } from "bun:test";
import { Dashboard } from "./dashboard";
import { openMemory } from "../ledger/store";

const HEAD = "b".repeat(40);

function harness() {
  const ledger = openMemory();
  ledger.insertRequest({ id: "req-1", installationId: 1, repositoryId: 9, pullRequest: 7, headSha: HEAD, reviewKind: "incremental", trigger: "automatic" });
  ledger.insertRun({ id: "run-1", requestId: "req-1", state: "complete", headSha: HEAD });
  ledger.insertPrompt("run-1", "private prompt");
  return { ledger, dashboard: new Dashboard(ledger, 100) };
}

test("the owner session includes the finding text", async () => {
  const { dashboard } = harness();
  const response = dashboard.readRun({ userId: 100 }, "run-1");
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ finding: "a reused token authenticates a stranger" });
});

test("another user gets 403 and no finding text", async () => {
  const { dashboard } = harness();
  const response = dashboard.readRun({ userId: 5 }, "run-1");
  expect(response.status).toBe(403);
  expect(await response.text()).not.toContain("reused token");
});

test("an actionable label writes the ledger and not GitHub", async () => {
  const { ledger, dashboard } = harness();
  const response = dashboard.label({ userId: 100 }, "f1", true);
  expect(await response.json()).toEqual({ fingerprint: "f1", actionable: true, githubWrites: 0 });
  expect(dashboard.githubWrites).toEqual([]);
  expect(ledger.readRun("run-1")?.state).toBe("complete");
});

test("a missed defect is stored against the inspected head", async () => {
  const { dashboard } = harness();
  expect(await (await dashboard.miss({ userId: 100 }, HEAD, "missed null check")).json()).toEqual({ headSha: HEAD, claim: "missed null check" });
});

test("safe mode leaves the next dispatch undispatched", () => {
  const { dashboard } = harness();
  dashboard.enableSafeMode({ userId: 100 });
  expect(dashboard.dispatch()).toEqual({ dispatched: false });
});

test("deleting a run removes the prompt and leaves the audit", () => {
  const { ledger, dashboard } = harness();
  dashboard.deleteRun({ userId: 100 }, "run-1");
  expect(ledger.readPromptColumn("run-1")).toBeUndefined();
  expect(ledger.readAudit()).toEqual([{ at: "2026-10-15T00:00:00.000Z", actor: "100", scope: "run" }]);
});

test("a sensitive repository does not retain the prompt body", async () => {
  const { dashboard } = harness();
  expect(await (await dashboard.readSensitivePrompt()).json()).toEqual({ retained: false });
});

test("cost matches the reservation sum and includes no provider key", async () => {
  const { dashboard } = harness();
  const body = await (await dashboard.readCost([10, 5])).json();
  expect(body).toEqual({ cents: 15 });
  expect(JSON.stringify(body)).not.toMatch(/sk-|ghp_|key/i);
});

test("dashboard routes do not name a provider host", () => {
  const { dashboard } = harness();
  expect(dashboard.routes().join(" ")).not.toMatch(/openrouter|api\.openai|anthropic/i);
});
