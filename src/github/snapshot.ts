import { prepareSnapshot, type PreparedSnapshot, type PullRequestSnapshot } from "../core/evidence";

export function loadSnapshot(payload: unknown, recorded: { baseSha: string; headSha: string }): PreparedSnapshot {
  const body = payload as { repositoryId?: unknown; pullRequest?: unknown; baseSha?: unknown; headSha?: unknown; files?: unknown };
  if (typeof body.baseSha !== "string" || typeof body.headSha !== "string" || !Array.isArray(body.files)) throw Error("invalid PR payload");
  const snapshot: PullRequestSnapshot = {
    repositoryId: Number(body.repositoryId),
    pullRequest: Number(body.pullRequest),
    baseSha: body.baseSha,
    headSha: body.headSha,
    files: body.files.map((file) => {
      const row = file as { filename?: unknown; patch?: unknown };
      return { path: String(row.filename ?? ""), patch: typeof row.patch === "string" ? row.patch : null };
    }),
  };
  return prepareSnapshot(snapshot, recorded);
}
