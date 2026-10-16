import { reserve, type ReviewKind } from "../core/budget";
import { CATEGORIES, type FindingCategory } from "../core/findings";

export type RouteJob = "fast" | "review" | "verify" | "repair";

export type SavedCandidate = {
  category: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  verdict?: "affirm" | "reject" | "unresolved";
  claim: string;
  path: string;
  line: number;
  scenario?: string;
  context?: string;
  consequence?: string;
  nextStep?: string;
};

export type RouteResult =
  | { kind: "candidate"; candidate: SavedCandidate; sameModelVerification: boolean }
  | { kind: "suppressed"; reason: string }
  | { kind: "none" }
  | { kind: "refused"; reason: "unpriced" | "privacy" | "ceiling" | "rejected-claim" };

const ESTIMATE_PER_CHAR = 1 / 3;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length * ESTIMATE_PER_CHAR);
}

export function reviewCandidate(input: {
  job: RouteJob;
  priced: boolean;
  retainsData: boolean;
  explicitWeakerRoute: boolean;
  kind: ReviewKind;
  spentCents: number;
  ceilingCents: number;
  callCents: number;
  patches: Record<string, string>;
  tokenCeiling: number;
  saved: SavedCandidate | undefined;
  verifyMappedToSameModel: boolean;
  rejectedFingerprints: string[];
  malformedRepairs: number;
}): RouteResult {
  if (!input.priced) return { kind: "refused", reason: "unpriced" };
  if (input.retainsData && !input.explicitWeakerRoute) return { kind: "refused", reason: "privacy" };
  const decision = reserve({ kind: input.kind, priced: true, callCents: input.callCents, spentCents: input.spentCents, ceilingCents: input.ceilingCents });
  if (decision.kind === "refused") return { kind: "refused", reason: decision.reason === "unpriced" ? "unpriced" : "ceiling" };
  if (input.job === "fast") return { kind: "none" };
  const body = fit(input.patches, input.tokenCeiling);
  if (body.dropped.length > 0 && input.saved === undefined) return { kind: "none" };
  const saved = input.saved;
  if (!saved) return { kind: "none" };
  if (input.rejectedFingerprints.includes(`${saved.path}:${saved.claim}`)) return { kind: "refused", reason: "rejected-claim" };
  if (/ghp_[A-Za-z0-9]+/.test(JSON.stringify(saved))) return { kind: "refused", reason: "privacy" };
  if (!CATEGORIES.includes(saved.category as FindingCategory)) {
    if (input.malformedRepairs >= 1) return { kind: "suppressed", reason: "unknown category" };
    return { kind: "suppressed", reason: "unknown category" };
  }
  return { kind: "candidate", candidate: saved, sameModelVerification: input.verifyMappedToSameModel };
}

export function fit(patches: Record<string, string>, ceiling: number): { body: string; dropped: string[] } {
  const dropped: string[] = [];
  const kept: string[] = [];
  let used = 0;
  for (const [path, patch] of Object.entries(patches)) {
    const tokens = estimateTokens(patch);
    if (used + tokens > ceiling) dropped.push(path);
    else {
      used += tokens;
      kept.push(patch);
    }
  }
  return { body: kept.join("\n"), dropped };
}
