export type QualificationRecord = { language: string; modelId: string; provider: string; promptVersion: string; pipelineVersion: string };

export type ShadowFinding = { fingerprint: string; labeled: boolean; labelSource: "owner" | "participant" };

export type ShadowReview = { headSha: string; findings: ShadowFinding[]; complete: boolean; previewHeadSha?: string; githubWrites: number };

export function qualifyRoute(record: QualificationRecord | undefined, candidate: QualificationRecord): boolean {
  if (!record) return false;
  return record.language === candidate.language && record.modelId === candidate.modelId && record.provider === candidate.provider
    && record.promptVersion === candidate.promptVersion && record.pipelineVersion === candidate.pipelineVersion;
}

export function shadowCheck(review: ShadowReview): { pass: boolean; unlabeled: string[] } {
  if (!review.complete || review.githubWrites !== 0) return { pass: false, unlabeled: review.findings.filter((item) => !item.labeled).map((item) => item.fingerprint) };
  const unlabeled = review.findings.filter((item) => item.labelSource === "owner" && !item.labeled).map((item) => item.fingerprint);
  return { pass: unlabeled.length === 0, unlabeled };
}

export function approvePublication(input: { qualified: boolean; shadowPass: boolean; previewHeadSha: string; currentHeadSha: string }): boolean {
  return input.qualified && input.shadowPass && input.previewHeadSha === input.currentHeadSha;
}

export function countOwnerLabels(findings: ShadowFinding[]): number {
  return findings.filter((item) => item.labelSource === "owner" && item.labeled).length;
}

export function savedReplayReservation(live: boolean, priced: boolean): "none" | "reserved" | "refused" {
  if (!live) return "none";
  return priced ? "reserved" : "refused";
}

export function omittedUnqualified(files: { path: string; qualified: boolean }[]): string[] {
  return files.filter((file) => !file.qualified).map((file) => file.path);
}
