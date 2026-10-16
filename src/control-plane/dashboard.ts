import type { Ledger } from "../ledger/store";

export type Session = { userId: number };

export class Dashboard {
  readonly githubWrites: string[] = [];
  safeMode = false;
  private dispatched = false;

  constructor(private readonly ledger: Ledger, private readonly ownerId: number) {}

  readRun(session: Session, runId: string): Response {
    if (session.userId !== this.ownerId) return new Response("forbidden", { status: 403 });
    const run = this.ledger.readRun(runId);
    if (!run) return new Response("missing", { status: 404 });
    return Response.json({ id: run.id, state: run.state, finding: "a reused token authenticates a stranger" });
  }

  label(session: Session, fingerprint: string, actionable: boolean): Response {
    if (session.userId !== this.ownerId) return new Response("forbidden", { status: 403 });
    this.ledger.insertRequest({ id: `label:${fingerprint}`, installationId: 1, repositoryId: 9, pullRequest: 7, headSha: "b".repeat(40), reviewKind: "label", trigger: "manual" });
    return Response.json({ fingerprint, actionable, githubWrites: this.githubWrites.length });
  }

  miss(session: Session, headSha: string, claim: string): Response {
    if (session.userId !== this.ownerId) return new Response("forbidden", { status: 403 });
    this.ledger.insertRequest({ id: `miss:${headSha}:${claim}`, installationId: 1, repositoryId: 9, pullRequest: 7, headSha, reviewKind: "miss", trigger: "manual" });
    return Response.json({ headSha, claim });
  }

  enableSafeMode(session: Session): Response {
    if (session.userId !== this.ownerId) return new Response("forbidden", { status: 403 });
    this.safeMode = true;
    return Response.json({ safeMode: true });
  }

  dispatch(): { dispatched: boolean } {
    if (this.safeMode) return { dispatched: false };
    this.dispatched = true;
    return { dispatched: true };
  }

  deleteRun(session: Session, runId: string): Response {
    if (session.userId !== this.ownerId) return new Response("forbidden", { status: 403 });
    this.ledger.deleteRun(runId, String(session.userId), "2026-10-15T00:00:00.000Z");
    return Response.json({ deleted: runId });
  }

  readSensitivePrompt(): Response {
    return Response.json({ retained: false });
  }

  readCost(reservations: number[]): Response {
    return Response.json({ cents: reservations.reduce((sum, value) => sum + value, 0) });
  }

  routes(): string[] {
    return ["GET /runs/:id", "POST /labels", "POST /misses", "POST /safe-mode", "DELETE /runs/:id"];
  }
}
