import { expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { acceptCompletion } from "../core/evidence";
import { Ledger, openMemory } from "./store";

const HEAD = "b".repeat(40);

function seeded(): Ledger {
  const ledger = openMemory();
  ledger.insertRequest({ id: "req-1", installationId: 1, repositoryId: 9, pullRequest: 3, headSha: HEAD, reviewKind: "incremental", trigger: "automatic" });
  return ledger;
}

test("a new run reads back as requested", () => {
  const ledger = seeded();
  ledger.insertRun({ id: "run-1", requestId: "req-1", state: "requested", headSha: HEAD });
  expect(ledger.readRun("run-1")).toEqual({ id: "run-1", state: "requested" });
});

test("an identical completion stores one receipt", async () => {
  const ledger = seeded();
  ledger.insertRun({ id: "run-1", requestId: "req-1", state: "claimed", headSha: HEAD });
  const incoming = { runId: "run-1", attemptId: "try-1", headSha: HEAD, evidence: { findings: 1 } };
  const first = await ledger.acceptStoredCompletion(incoming);
  const second = await ledger.acceptStoredCompletion(incoming);
  expect(second).toEqual(first);
  expect(ledger.readReceipt("run-1")?.evidenceDigest).toBe(first.evidenceDigest);
});

test("conflicting completion evidence keeps the first digest", async () => {
  const ledger = seeded();
  ledger.insertRun({ id: "run-1", requestId: "req-1", state: "claimed", headSha: HEAD });
  const first = await ledger.acceptStoredCompletion({ runId: "run-1", attemptId: "try-1", headSha: HEAD, evidence: { findings: 1 } });
  await expect(ledger.acceptStoredCompletion({ runId: "run-1", attemptId: "try-1", headSha: HEAD, evidence: { findings: 2 } })).rejects.toThrow("conflicting completion evidence");
  expect(ledger.readReceipt("run-1")?.evidenceDigest).toBe(first.evidenceDigest);
});

test("a prompt column is ciphertext, not the prompt text", () => {
  const ledger = seeded();
  ledger.insertRun({ id: "run-1", requestId: "req-1", state: "claimed", headSha: HEAD });
  const prompt = "review this private diff";
  ledger.insertPrompt("run-1", prompt);
  const column = Buffer.from(ledger.readPromptColumn("run-1") ?? new Uint8Array());
  expect(column.toString("utf8")).not.toContain(prompt);
  expect(column.byteLength).toBeGreaterThan(prompt.length);
});

test("deleting a run removes the body and leaves time, actor, and scope", () => {
  const ledger = seeded();
  ledger.insertRun({ id: "run-1", requestId: "req-1", state: "complete", headSha: HEAD });
  ledger.insertPrompt("run-1", "secret body");
  ledger.deleteRun("run-1", "owner-7", "2026-10-15T00:00:00.000Z");
  expect(ledger.readPromptColumn("run-1")).toBeUndefined();
  expect(ledger.readRun("run-1")).toBeUndefined();
  expect(ledger.readAudit()).toEqual([{ at: "2026-10-15T00:00:00.000Z", actor: "owner-7", scope: "run" }]);
});

test("opening a database without migrate creates no application table", () => {
  const bare = Ledger.open(new Database(":memory:"));
  expect(bare.tableNames()).toEqual([]);
});

test("migrate is a no-op the second time", () => {
  const db = new Database(":memory:");
  const ledger = Ledger.open(db);
  ledger.migrate();
  const before = ledger.tableNames().sort();
  ledger.migrate();
  expect(ledger.tableNames().sort()).toEqual(before);
  expect(before).toContain("completion_receipt");
});

test("secret metadata stores rule, path, line, and fingerprint only", () => {
  const db = new Database(":memory:");
  const ledger = Ledger.open(db);
  ledger.migrate();
  const columns = db.query("PRAGMA table_info(secret_metadata)").all() as { name: string }[];
  expect(columns.map((column) => column.name)).toEqual(["run_id", "rule", "path", "line", "fingerprint"]);
});

test("the pure completion rule still rejects a second digest before the ledger writes", async () => {
  const incoming = { runId: "run-1", attemptId: "try-1", headSha: HEAD, evidence: { ok: true } };
  const receipt = await acceptCompletion(undefined, incoming);
  await expect(acceptCompletion(receipt, { ...incoming, evidence: { ok: false } })).rejects.toThrow("conflicting completion evidence");
});
