/** Shared domain rules. This module performs no repository command, ledger write, or GitHub write. */
export type PullRequestSnapshot = {
  repositoryId: number;
  pullRequest: number;
  baseSha: string;
  headSha: string;
  files: { path: string; patch: string | null }[];
};
export type PreparedSnapshot = PullRequestSnapshot & { changedLines: Record<string, number[]> };
const SHA = /^[a-f0-9]{40}$/i;

export function prepareSnapshot(snapshot: PullRequestSnapshot, recorded: { baseSha: string; headSha: string }): PreparedSnapshot {
  if (![snapshot.baseSha, snapshot.headSha, recorded.baseSha, recorded.headSha].every((sha) => SHA.test(sha))) {
    throw Error("invalid recorded SHA");
  }
  if (snapshot.baseSha !== recorded.baseSha) throw Error("base mismatch");
  if (snapshot.headSha !== recorded.headSha) throw Error("head mismatch");
  if (!Number.isSafeInteger(snapshot.repositoryId) || !Number.isSafeInteger(snapshot.pullRequest)) throw Error("invalid PR identity");
  const changedLines: Record<string, number[]> = Object.create(null);
  for (const file of snapshot.files) {
    if (!file.path || Object.hasOwn(changedLines, file.path)) throw Error("duplicate or empty file path");
    changedLines[file.path] = file.patch === null ? [] : parseAddedLines(file.patch);
  }
  return { ...snapshot, changedLines };
}

function parseAddedLines(patch: string): number[] {
  const added: number[] = [];
  let next: number | undefined;
  for (const row of patch.replace(/\n$/, "").split("\n")) {
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(row);
    if (hunk) next = Number(hunk[1]);
    else if (row.startsWith("\\ No newline")) continue;
    else if (next === undefined) throw Error("PR patch lacks hunk header");
    else if (row.startsWith("+")) added.push(next++);
    else if (row.startsWith(" ")) next++;
    else if (!row.startsWith("-")) throw Error("invalid PR patch line");
  }
  return added;
}

export type Occurrence = { fingerprint: string; path: string; line: number };
export type Scanner = { name: string; run: (snapshot: PreparedSnapshot) => Promise<Occurrence[]> };
export type ScannerReport = {
  health: { expected: string[]; completed: string[]; failed: string[]; complete: boolean };
  findings: Occurrence[];
};

export async function runScanners(snapshot: PreparedSnapshot, scanners: Scanner[]): Promise<ScannerReport> {
  const expected = scanners.map((scanner) => scanner.name);
  if (expected.length === 0) throw Error("empty scanner plan");
  if (expected.some((name) => !name.trim()) || new Set(expected).size !== expected.length) throw Error("duplicate scanner or empty name");
  const completed: string[] = [];
  const failed: string[] = [];
  const findings: Occurrence[] = [];
  for (const scanner of scanners) {
    try {
      const output = await scanner.run(snapshot);
      if (!Array.isArray(output) || output.some((item) => !item.fingerprint || !item.path || !Number.isInteger(item.line))) {
        throw Error("invalid scanner output");
      }
      findings.push(...output.map(({ fingerprint, path, line }) => ({ fingerprint, path, line })));
      completed.push(scanner.name);
    } catch {
      // Error messages may contain source or credentials. Only the scanner name leaves this boundary.
      failed.push(scanner.name);
    }
  }
  return { health: { expected, completed, failed, complete: failed.length === 0 }, findings };
}

export type SecretHit = { value: string; rule: string; path: string; line: number };
export type SecretEvidence = Omit<SecretHit, "value"> & { fingerprint: string };

export function redactSecrets(text: string, hits: SecretHit[]): string {
  let redacted = text;
  for (const hit of [...hits].sort((a, b) => b.value.length - a.value.length)) {
    if (!hit.value) throw Error("empty secret value");
    redacted = redacted.replaceAll(hit.value, "[REDACTED SECRET]");
  }
  return redacted;
}

/** Call at the control-plane boundary. The key and raw value must never enter the ledger. */
export async function makeSecretEvidence(hit: SecretHit, controlPlaneKey: string): Promise<SecretEvidence> {
  if (!hit.value || !controlPlaneKey) throw Error("secret value and key required");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(controlPlaneKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(hit.value));
  return { rule: hit.rule, path: hit.path, line: hit.line, fingerprint: hex(signature) };
}

export type ReconciledOccurrence = Occurrence & { state: "persisting" | "moved" | "fixed" | "obsolete" | "uncertain" };
export function reconcileOccurrences(
  previous: Occurrence[], current: Occurrence[], scope: { diffPaths: string[]; reviewedPaths: string[]; reviewComplete: boolean },
): ReconciledOccurrence[] {
  const diff = new Set(scope.diffPaths);
  const reviewed = new Set(scope.reviewedPaths);
  const currentById = new Map(current.map((item) => [item.fingerprint, item]));
  return previous.map((item) => {
    const now = currentById.get(item.fingerprint);
    if (now) return { ...now, state: now.path === item.path && now.line === item.line ? "persisting" : "moved" };
    if (!diff.has(item.path)) return { ...item, state: "obsolete" };
    return { ...item, state: scope.reviewComplete && reviewed.has(item.path) ? "fixed" : "uncertain" };
  });
}

export type Completion = { runId: string; attemptId: string; headSha: string; evidence: unknown };
export type CompletionReceipt = { runId: string; attemptId: string; headSha: string; evidenceDigest: string };

/** Pure acceptance rule. Its caller must persist the receipt and evidence atomically. */
export async function acceptCompletion(existing: CompletionReceipt | undefined, incoming: Completion): Promise<CompletionReceipt> {
  if (!incoming.runId || !incoming.attemptId || !SHA.test(incoming.headSha)) throw Error("invalid completion identity");
  const digest = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical(incoming.evidence))));
  if (existing) {
    if (existing.runId !== incoming.runId || existing.attemptId !== incoming.attemptId || existing.headSha !== incoming.headSha) {
      throw Error("superseded attempt");
    }
    if (existing.evidenceDigest !== digest) throw Error("conflicting completion evidence");
    return existing;
  }
  return { runId: incoming.runId, attemptId: incoming.attemptId, headSha: incoming.headSha, evidenceDigest: digest };
}

function canonical(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number" && Number.isFinite(value)) return JSON.stringify(value);
  if (typeof value !== "object") throw Error("non-JSON evidence");
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (Object.getPrototypeOf(value) !== Object.prototype) throw Error("non-JSON evidence");
  return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`).join(",")}}`;
}
function hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (value) => value.toString(16).padStart(2, "0")).join("");
}

export type PublicationFinding = Occurrence & {
  severity: "critical" | "high" | "medium" | "low" | "informational";
  verdict: "affirm" | "reject" | "unresolved";
  scenario: string;
  context: string;
  consequence: string;
  nextStep: string;
};
export type PublicationInput = {
  snapshot: PreparedSnapshot;
  run: {
    status: "complete" | "failed" | "incomplete";
    headSha: string;
    scannerHealth: { complete: boolean };
    semanticCoverage: "full" | "partial" | "skipped";
  };
  pullRequest: { state: "open" | "closed" | "merged"; headSha: string };
  approved: boolean;
  qualified: boolean;
  safeMode: boolean;
  alreadyPublished?: boolean;
  findings: PublicationFinding[];
};
export type PublicationPlan =
  | { kind: "none"; reason: string }
  | { kind: "failure-check"; check: "failure" }
  | { kind: "publish"; check: "success" | "neutral" | "skipped"; inline: PublicationFinding[]; omitted: string[]; walkthrough: string };

/** A decision, never a GitHub write. The publisher must recheck the head and write idempotently. */
export function planPublication(input: PublicationInput): PublicationPlan {
  if (input.safeMode) return { kind: "none", reason: "safe mode" };
  if (input.pullRequest.state !== "open") return { kind: "none", reason: "pull request closed" };
  if (input.snapshot.headSha !== input.run.headSha || input.run.headSha !== input.pullRequest.headSha) {
    return { kind: "none", reason: "stale head" };
  }
  if (input.alreadyPublished) return { kind: "none", reason: "already published" };
  if (input.run.status === "failed") return { kind: "failure-check", check: "failure" };
  if (input.run.status !== "complete" || !input.run.scannerHealth.complete) {
    return { kind: "none", reason: "incomplete evidence" };
  }
  if (!input.approved || !input.qualified) return { kind: "none", reason: "publication not approved or qualified" };

  const rank = { critical: 0, high: 1, medium: 2, low: 3, informational: 4 };
  const omitted: string[] = [];
  const walkthroughOnly: string[] = [];
  const eligible = input.findings.filter((finding) => {
    if (finding.severity === "low" || finding.severity === "informational") {
      if (finding.verdict === "affirm") walkthroughOnly.push(finding.fingerprint);
      return false;
    }
    const supported = finding.verdict === "affirm" && ["critical", "high", "medium"].includes(finding.severity) &&
      Boolean(finding.scenario && finding.context && finding.consequence && finding.nextStep) &&
      input.snapshot.changedLines[finding.path]?.includes(finding.line);
    if (!supported) omitted.push(finding.fingerprint);
    return supported;
  }).sort((a, b) => rank[a.severity] - rank[b.severity] || a.path.localeCompare(b.path) || a.line - b.line || a.fingerprint.localeCompare(b.fingerprint));
  const inline: PublicationFinding[] = [];
  for (const finding of eligible) {
    const severe = finding.severity === "critical" || finding.severity === "high";
    if (inline.length < 5 || (severe && inline.length < 10)) inline.push(finding);
    else omitted.push(finding.fingerprint);
  }
  const check = input.run.semanticCoverage === "skipped" ? "skipped" :
    input.run.semanticCoverage === "partial" || inline.length > 0 || omitted.length > 0 ? "neutral" : "success";
  const walkthrough = inline.length === 0 && omitted.length === 0 && walkthroughOnly.length === 0 && check === "success"
    ? "No actionable findings in the reviewed changes."
    : `Reviewed ${input.snapshot.headSha}. Inline findings: ${inline.length}. Walkthrough findings: ${walkthroughOnly.length}. Omitted findings: ${omitted.length}.`;
  return { kind: "publish", check, inline, omitted, walkthrough };
}

export type RunnerEvidenceAdapters = {
  recorded: { baseSha: string; headSha: string };
  acquire: () => Promise<PullRequestSnapshot>;
  scanners: Scanner[];
  detectSecrets: (snapshot: PreparedSnapshot) => Promise<SecretHit[]>;
  fingerprintSecret: (hit: SecretHit) => Promise<SecretEvidence>;
  review: (redactedPatches: Record<string, string>) => Promise<PublicationFinding[]>;
};
export type RunnerEvidence = {
  headSha: string;
  changedLines: Record<string, number[]>;
  scannerHealth: ScannerReport["health"];
  scannerFindings: Occurrence[];
  secretEvidence: SecretEvidence[];
  findings: PublicationFinding[];
};

/** The runner's required deterministic boundary before any model-facing review. */
export async function executeRunnerEvidence(adapters: RunnerEvidenceAdapters): Promise<RunnerEvidence> {
  let snapshot: PreparedSnapshot;
  try {
    snapshot = prepareSnapshot(await adapters.acquire(), adapters.recorded);
  } catch {
    throw Error("recorded PR acquisition failed");
  }
  const scannerReport = await runScanners(snapshot, adapters.scanners);
  if (!scannerReport.health.complete) throw Error("scanner evidence incomplete");

  let hits: SecretHit[];
  let secretEvidence: SecretEvidence[];
  try {
    hits = await adapters.detectSecrets(snapshot);
    if (!Array.isArray(hits)) throw Error("invalid secret results");
    secretEvidence = await Promise.all(hits.map(async (hit) => {
      const evidence = await adapters.fingerprintSecret(hit);
      if (!/^[a-f0-9]{64}$/i.test(evidence.fingerprint) || evidence.rule !== hit.rule ||
          evidence.path !== hit.path || evidence.line !== hit.line || !Number.isInteger(evidence.line)) {
        throw Error("invalid secret evidence");
      }
      return { rule: evidence.rule, path: evidence.path, line: evidence.line, fingerprint: evidence.fingerprint };
    }));
  } catch {
    throw Error("secret evidence failed");
  }

  const redactedPatches: Record<string, string> = Object.create(null);
  try {
    for (const file of snapshot.files) {
      redactedPatches[file.path] = redactSecrets(file.patch ?? "", hits);
    }
  } catch {
    throw Error("secret redaction failed");
  }
  let findings: PublicationFinding[];
  try {
    const proposed = await adapters.review(redactedPatches);
    if (!Array.isArray(proposed)) throw Error("invalid review result");
    findings = proposed.map((finding) => ({
      fingerprint: finding.fingerprint,
      path: finding.path,
      line: finding.line,
      severity: finding.severity,
      verdict: finding.verdict,
      scenario: redactSecrets(finding.scenario, hits),
      context: redactSecrets(finding.context, hits),
      consequence: redactSecrets(finding.consequence, hits),
      nextStep: redactSecrets(finding.nextStep, hits),
    }));
  } catch {
    throw Error("review evidence failed");
  }
  return {
    headSha: snapshot.headSha,
    changedLines: snapshot.changedLines,
    scannerHealth: scannerReport.health,
    scannerFindings: scannerReport.findings,
    secretEvidence,
    findings,
  };
}
