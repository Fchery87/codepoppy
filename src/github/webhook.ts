import { createHmac, timingSafeEqual } from "node:crypto";
import type { Ledger, RunState } from "../ledger/store";

export type DeliveryDecision =
  | { kind: "rejected"; reason: string }
  | { kind: "duplicate" }
  | { kind: "ignored"; reason: string }
  | { kind: "request"; requestId: string; runState: RunState };

type StoredDelivery = { id: string; reason: string | null; bodyStored: boolean };

export class Inbox {
  private readonly deliveries = new Map<string, StoredDelivery>();
  private readonly active = new Map<string, string>();

  constructor(private readonly ledger: Ledger, private readonly secret: string, private readonly ownerId: number, private readonly appLogin: string) {}

  receive(input: { id: string; signature: string | undefined; raw: string }): DeliveryDecision {
    if (!this.signatureMatches(input.raw, input.signature)) {
      this.deliveries.set(input.id, { id: input.id, reason: "bad signature", bodyStored: false });
      return { kind: "rejected", reason: "bad signature" };
    }
    if (this.deliveries.has(input.id)) return { kind: "duplicate" };
    this.deliveries.set(input.id, { id: input.id, reason: null, bodyStored: true });
    const event = JSON.parse(input.raw) as GitHubEvent;
    return this.apply(event);
  }

  storedDelivery(id: string): StoredDelivery | undefined {
    return this.deliveries.get(id);
  }

  requestCount(): number {
    return this.active.size;
  }

  private apply(event: GitHubEvent): DeliveryDecision {
    if (event.action === "synchronize" && event.pull_request?.draft) return { kind: "ignored", reason: "draft" };
    if (event.comment) return this.command(event);
    if (!event.pull_request) return { kind: "ignored", reason: "unsupported event" };
    if (event.action !== "opened" && event.action !== "reopened" && event.action !== "ready_for_review" && event.action !== "synchronize") {
      return { kind: "ignored", reason: "unsupported action" };
    }
    if (event.pull_request.draft && event.action !== "ready_for_review") return { kind: "ignored", reason: "draft" };
    return this.openRequest(event.pull_request, "incremental", "automatic");
  }

  private command(event: GitHubEvent): DeliveryDecision {
    const comment = event.comment;
    if (!comment) return { kind: "ignored", reason: "unsupported event" };
    if (comment.user.login === this.appLogin) return { kind: "ignored", reason: "self" };
    if (comment.user.id !== this.ownerId) return { kind: "ignored", reason: "not owner" };
    const match = comment.body.trim().match(/^\/?(review|review full|review explain|review config)(?: (precise|balanced|thorough))?$/);
    if (!match || !event.pull_request) return { kind: "ignored", reason: "not a command" };
    const kind = match[1] === "review" ? "incremental" : match[1].replace("review ", "");
    return this.openRequest(event.pull_request, kind, "manual");
  }

  private openRequest(pullRequest: NonNullable<GitHubEvent["pull_request"]>, reviewKind: string, trigger: "automatic" | "manual"): DeliveryDecision {
    const key = `${pullRequest.base.repo.id}:${pullRequest.number}`;
    const previous = this.active.get(key);
    if (previous) this.ledger.setRunState(previous, "cancelled");
    const requestId = `${key}:${pullRequest.head.sha}:${reviewKind}:${trigger}`;
    this.ledger.insertRequest({
      id: requestId, installationId: 1, repositoryId: pullRequest.base.repo.id, pullRequest: pullRequest.number,
      headSha: pullRequest.head.sha, reviewKind, trigger,
    });
    const runId = `run:${requestId}`;
    this.ledger.insertRun({ id: runId, requestId, state: "requested", headSha: pullRequest.head.sha });
    this.active.set(key, runId);
    return { kind: "request", requestId, runState: "requested" };
  }

  private signatureMatches(raw: string, signature: string | undefined): boolean {
    if (!signature?.startsWith("sha256=")) return false;
    const expected = createHmac("sha256", this.secret).update(raw).digest("hex");
    const given = signature.slice("sha256=".length);
    const left = Buffer.from(expected);
    const right = Buffer.from(given);
    return left.byteLength === right.byteLength && timingSafeEqual(left, right);
  }
}

type GitHubEvent = {
  action?: string;
  comment?: { body: string; user: { id: number; login: string } };
  pull_request?: { number: number; draft: boolean; head: { sha: string }; base: { repo: { id: number } } };
};
