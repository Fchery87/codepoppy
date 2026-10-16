import { createHash } from "node:crypto";
import type { Ledger } from "../ledger/store";

export type ClaimProof = { audience: string; repositoryId: number; event: string; workflowSha: string; runId: string; now: number };

export type ClaimResult = { kind: "claimed"; token: string; expiresAt: number } | { kind: "rejected"; reason: string } | { kind: "expired-dispatch" };

const TOKEN_MS = 60 * 60 * 1000;

export class Claims {
  private readonly tokens = new Map<string, { token: string; expiresAt: number; spent: boolean }>();
  safeMode = false;

  constructor(private readonly ledger: Ledger, private readonly pinnedSha: string, private readonly runnerRepositoryId: number, private readonly activeSlots: () => number) {}

  claim(proof: ClaimProof): ClaimResult {
    if (proof.audience !== "codepoppy") return { kind: "rejected", reason: "audience" };
    if (proof.repositoryId !== this.runnerRepositoryId) return { kind: "rejected", reason: "repository" };
    if (proof.event !== "workflow_dispatch") return { kind: "rejected", reason: "event" };
    if (proof.workflowSha !== this.pinnedSha) return { kind: "rejected", reason: "workflow sha" };
    const existing = this.tokens.get(proof.runId);
    if (existing) return { kind: "rejected", reason: "already claimed" };
    if (proof.now > TOKEN_MS && !this.ledger.readRun(proof.runId)) return { kind: "expired-dispatch" };
    if (this.activeSlots() >= 3) {
      this.ledger.setRunState(proof.runId, "queued");
      return { kind: "rejected", reason: "no slot" };
    }
    const token = createHash("sha256").update(`${proof.runId}:${proof.now}`).digest("hex");
    this.tokens.set(proof.runId, { token, expiresAt: proof.now + TOKEN_MS, spent: false });
    this.ledger.setRunState(proof.runId, "claimed");
    return { kind: "claimed", token, expiresAt: proof.now + TOKEN_MS };
  }

  submit(token: string, now: number): { kind: "accepted" } | { kind: "rejected"; reason: string } {
    const row = [...this.tokens.values()].find((item) => item.token === token);
    if (!row || row.spent || now > row.expiresAt) return { kind: "rejected", reason: "callback spent" };
    row.spent = true;
    return { kind: "accepted" };
  }

  publish(token: string): { kind: "rejected"; reason: "callback cannot publish" } {
    void token;
    return { kind: "rejected", reason: "callback cannot publish" };
  }

  expireUnclaimed(runId: string): ClaimResult {
    if (this.tokens.has(runId)) return { kind: "rejected", reason: "already claimed" };
    this.safeMode = false;
    this.ledger.setRunState(runId, "failed");
    return { kind: "expired-dispatch" };
  }
}
