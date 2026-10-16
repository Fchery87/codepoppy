import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { Database } from "bun:sqlite";
import { acceptCompletion, type Completion, type CompletionReceipt } from "../core/evidence";

export type RunState = "requested" | "debouncing" | "queued" | "dispatched" | "claimed" | "complete" | "incomplete" | "failed" | "cancelled";

export type SecretMetadata = { rule: string; path: string; line: number; fingerprint: string };

type CipherRow = { evidenceDigest: string; evidenceCiphertext: Uint8Array };

export class Ledger {
  private constructor(private readonly db: Database) {}

  static open(db: Database): Ledger {
    return new Ledger(db);
  }

  /** Applies schema.sql. Application startup must not call this. */
  migrate(): void {
    this.db.exec(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
  }

  insertRequest(input: { id: string; installationId: number; repositoryId: number; pullRequest: number; headSha: string; reviewKind: string; trigger: "automatic" | "manual" }): void {
    this.db.run(
      "INSERT INTO review_request (id, installation_id, repository_id, pull_request, head_sha, review_kind, trigger) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [input.id, input.installationId, input.repositoryId, input.pullRequest, input.headSha, input.reviewKind, input.trigger],
    );
  }

  insertRun(input: { id: string; requestId: string; state: RunState; headSha: string }): { id: string; state: RunState } {
    this.db.run(
      "INSERT INTO review_run (id, request_id, state, head_sha, sets_last_reviewed_head) VALUES (?, ?, ?, ?, ?)",
      [input.id, input.requestId, input.state, input.headSha, input.state === "complete" ? 1 : 0],
    );
    return { id: input.id, state: input.state };
  }

  setRunState(id: string, state: RunState): void {
    this.db.run("UPDATE review_run SET state = ?, sets_last_reviewed_head = ? WHERE id = ?", [state, state === "complete" ? 1 : 0, id]);
  }

  readRun(id: string): { id: string; state: RunState } | undefined {
    const row = this.db.query("SELECT id, state FROM review_run WHERE id = ?").get(id) as { id: string; state: RunState } | null;
    return row ?? undefined;
  }

  /** Receipt and ciphertext commit in one transaction. A conflict keeps the first digest. */
  async acceptStoredCompletion(incoming: Completion): Promise<CompletionReceipt> {
    const current = this.db.query("SELECT attempt_id AS attemptId, head_sha AS headSha, evidence_digest AS evidenceDigest FROM completion_receipt WHERE run_id = ?")
      .get(incoming.runId) as { attemptId: string; headSha: string; evidenceDigest: string } | undefined;
    const existing = current && { runId: incoming.runId, ...current };
    const decision = await acceptCompletion(existing, incoming);
    if (existing) return decision;
    const dataKey = randomBytes(32);
    const wrappedKey = seal(dataKey.toString("hex"), masterKey(this.db));
    const ciphertext = seal(canonical(incoming.evidence), dataKey);
    this.db.exec("BEGIN");
    try {
      this.db.run(
        "INSERT INTO completion_receipt (run_id, attempt_id, head_sha, evidence_digest, evidence_ciphertext, wrapped_key) VALUES (?, ?, ?, ?, ?, ?)",
        [decision.runId, decision.attemptId, decision.headSha, decision.evidenceDigest, ciphertext, wrappedKey],
      );
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
    return decision;
  }

  readReceipt(runId: string): CipherRow | undefined {
    return this.db.query("SELECT evidence_digest AS evidenceDigest, evidence_ciphertext AS evidenceCiphertext FROM completion_receipt WHERE run_id = ?").get(runId) as CipherRow | null ?? undefined;
  }

  insertPrompt(runId: string, prompt: string): void {
    this.db.run("INSERT INTO source_body (id, run_id, kind, ciphertext) VALUES (?, ?, 'prompt', ?)", [
      `prompt:${runId}`, runId, seal(prompt, randomBytes(32)),
    ]);
  }

  readPromptColumn(runId: string): Uint8Array | undefined {
    const row = this.db.query("SELECT ciphertext FROM source_body WHERE id = ?").get(`prompt:${runId}`) as { ciphertext: Uint8Array } | null;
    return row?.ciphertext;
  }

  insertSecretMetadata(runId: string, metadata: SecretMetadata): void {
    this.db.run("INSERT INTO secret_metadata (run_id, rule, path, line, fingerprint) VALUES (?, ?, ?, ?, ?)", [
      runId, metadata.rule, metadata.path, metadata.line, metadata.fingerprint,
    ]);
  }

  deleteRun(runId: string, actor: string, at: string): void {
    this.db.exec("BEGIN");
    try {
      this.db.run("DELETE FROM source_body WHERE run_id = ?", [runId]);
      this.db.run("DELETE FROM completion_receipt WHERE run_id = ?", [runId]);
      this.db.run("DELETE FROM secret_metadata WHERE run_id = ?", [runId]);
      this.db.run("DELETE FROM review_run WHERE id = ?", [runId]);
      this.db.run("INSERT INTO deletion_audit (at, actor, scope) VALUES (?, ?, ?)", [at, actor, "run"]);
      this.db.exec("COMMIT");
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  readAudit(): { at: string; actor: string; scope: string }[] {
    return this.db.query("SELECT at, actor, scope FROM deletion_audit").all() as { at: string; actor: string; scope: string }[];
  }

  tableNames(): string[] {
    return (this.db.query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]).map((row) => row.name);
  }
}

export function openMemory(): Ledger {
  const db = new Database(":memory:");
  db.run("PRAGMA foreign_keys = ON");
  const ledger = Ledger.open(db);
  ledger.migrate();
  return ledger;
}

function masterKey(db: Database): Buffer {
  const tag = (db as Database & { filename?: string }).filename ?? ":memory:";
  return createHash("sha256").update(`codepoppy-test-key:${tag}`).digest();
}

function canonical(value: unknown): string {
  return JSON.stringify(value);
}

function seal(plain: string, key: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]);
}
