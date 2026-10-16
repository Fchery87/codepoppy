export const CATEGORIES = [
  "correctness",
  "security",
  "data-loss",
  "authorization",
  "concurrency",
  "compatibility",
  "error-handling",
  "performance",
  "maintainability",
] as const;

export type FindingCategory = (typeof CATEGORIES)[number];

export type FingerprintInput = {
  repositoryId: number;
  category: string;
  symbol?: string;
  claim: string;
  path: string;
};

/** Identity is the claim, not the line. SHA, path, and line noise in the claim do not create a new finding. */
export async function fingerprint(input: FingerprintInput): Promise<string> {
  if (!Number.isSafeInteger(input.repositoryId)) throw Error("invalid repository id");
  if (!CATEGORIES.includes(input.category as FindingCategory)) throw Error("unknown category");
  if (!input.path) throw Error("fingerprint path required");
  const claim = normalizeClaim(input.claim);
  if (!claim) throw Error("empty failure claim");
  const symbol = input.symbol?.trim() ? input.symbol.trim() : input.path;
  const body = `${input.repositoryId}\n${input.category}\n${symbol}\n${claim}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(body));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

function normalizeClaim(claim: string): string {
  return claim
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\b[a-f0-9]{40}\b/gi, " ")
    .replace(/\bline\s+\d+\b/g, " ")
    .replace(/\b\d+:\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
