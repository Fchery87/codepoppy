import { describe, expect, test } from "bun:test";
import {
  acceptCompletion,
  executeRunnerEvidence,
  makeSecretEvidence,
  planPublication,
  prepareSnapshot,
  reconcileOccurrences,
  redactSecrets,
  runScanners,
} from "./evidence";

const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);
const snapshot = {
  repositoryId: 42,
  pullRequest: 7,
  baseSha: BASE,
  headSha: HEAD,
  files: [{ path: "src/auth.ts", patch: "@@ -2,2 +2,3 @@\n old\n+const token = 'abc';\n-old\n+return token;" }],
};

describe("recorded PR snapshot", () => {
  test("uses GitHub's patch for changed lines and never derives a local diff", () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    expect(prepared.changedLines["src/auth.ts"]).toEqual([3, 4]);
  });

  test("rejects a snapshot from a different head", () => {
    expect(() => prepareSnapshot(snapshot, { baseSha: BASE, headSha: "c".repeat(40) })).toThrow("head mismatch");
  });

  test("accepts a GitHub patch with a final newline", () => {
    const withFinalNewline = { ...snapshot, files: [{ path: "src/auth.ts", patch: "@@ -1 +1 @@\n-old\n+new\n" }] };
    expect(prepareSnapshot(withFinalNewline, { baseSha: BASE, headSha: HEAD }).changedLines["src/auth.ts"]).toEqual([1]);
  });
});

describe("scanner orchestration", () => {
  test("records a failed scanner and cannot report complete coverage", async () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    const report = await runScanners(prepared, [
      { name: "secrets", run: async () => [{ fingerprint: "s1", path: "src/auth.ts", line: 3 }] },
      { name: "policy", run: async () => { throw Error("scanner crashed"); } },
    ]);
    expect(report.health).toEqual({ expected: ["secrets", "policy"], completed: ["secrets"], failed: ["policy"], complete: false });
    expect(report.findings).toHaveLength(1);
  });

  test("rejects duplicate scanner names", async () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    await expect(runScanners(prepared, [
      { name: "secrets", run: async () => [] },
      { name: "secrets", run: async () => [] },
    ])).rejects.toThrow("duplicate scanner");
  });

  test("does not call an empty scanner plan complete", async () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    await expect(runScanners(prepared, [])).rejects.toThrow("empty scanner plan");
  });

  test("drops unrecognized scanner fields before evidence leaves the runner", async () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    const report = await runScanners(prepared, [{ name: "secrets", run: async () => [
      { fingerprint: "f", path: "src/auth.ts", line: 3, value: "ghp_private123" },
    ] }]);
    expect(JSON.stringify(report)).not.toContain("ghp_private123");
  });
});

describe("secret boundary", () => {
  test("removes every detected value before model-facing text and keeps only keyed metadata", async () => {
    const hit = { value: "ghp_private123", rule: "github-pat", path: "src/auth.ts", line: 3 };
    expect(redactSecrets(`A ${hit.value} B ${hit.value}`, [hit])).toBe("A [REDACTED SECRET] B [REDACTED SECRET]");
    const evidence = await makeSecretEvidence(hit, "control-plane-only-salt");
    expect(evidence).toEqual({ rule: hit.rule, path: hit.path, line: 3, fingerprint: expect.any(String) });
    expect(JSON.stringify(evidence)).not.toContain(hit.value);
    expect((await makeSecretEvidence(hit, "another-salt")).fingerprint).not.toBe(evidence.fingerprint);
  });

  test("rejects an empty value that cannot be safely redacted", () => {
    expect(() => redactSecrets("source", [{ value: "", rule: "x", path: "a", line: 1 }])).toThrow("empty secret value");
  });

  test("redacts longer overlapping values first", () => {
    expect(redactSecrets("token=abcde", [
      { value: "abc", rule: "short", path: "a", line: 1 },
      { value: "abcde", rule: "long", path: "a", line: 1 },
    ])).toBe("token=[REDACTED SECRET]");
  });
});

describe("finding history", () => {
  test("does not close a claim when its file was not directly reviewed", () => {
    expect(reconcileOccurrences(
      [{ fingerprint: "f", path: "src/auth.ts", line: 3 }],
      [],
      { diffPaths: ["src/auth.ts"], reviewedPaths: [], reviewComplete: true },
    )).toEqual([{ fingerprint: "f", path: "src/auth.ts", line: 3, state: "uncertain" }]);
  });

  test("distinguishes moved, fixed, and obsolete from direct evidence", () => {
    const previous = [
      { fingerprint: "move", path: "src/auth.ts", line: 3 },
      { fingerprint: "fixed", path: "src/auth.ts", line: 4 },
      { fingerprint: "gone", path: "old.ts", line: 1 },
    ];
    expect(reconcileOccurrences(previous, [{ fingerprint: "move", path: "src/auth.ts", line: 8 }], {
      diffPaths: ["src/auth.ts"], reviewedPaths: ["src/auth.ts"], reviewComplete: true,
    }).map((item) => item.state)).toEqual(["moved", "fixed", "obsolete"]);
  });

  test("an incomplete review cannot mark an absent claim fixed", () => {
    expect(reconcileOccurrences(
      [{ fingerprint: "f", path: "src/auth.ts", line: 3 }], [],
      { diffPaths: ["src/auth.ts"], reviewedPaths: ["src/auth.ts"], reviewComplete: false },
    )[0].state).toBe("uncertain");
  });
});

describe("evidence and publication", () => {
  const completion = { runId: "run-1", attemptId: "attempt-1", headSha: HEAD, evidence: { scannerHealth: { complete: true }, coverage: ["src/auth.ts"] } };

  test("accepts identical retry but rejects conflicting completion evidence", async () => {
    const first = await acceptCompletion(undefined, completion);
    expect(await acceptCompletion(first, completion)).toEqual(first);
    await expect(acceptCompletion(first, { ...completion, evidence: { ...completion.evidence, coverage: [] } })).rejects.toThrow("conflicting completion");
    await expect(acceptCompletion(first, { ...completion, attemptId: "attempt-2" })).rejects.toThrow("superseded attempt");
  });

  test("completion digest ignores JSON key order but rejects non-JSON evidence", async () => {
    const first = await acceptCompletion(undefined, { ...completion, evidence: { a: 1, b: 2 } });
    expect(await acceptCompletion(first, { ...completion, evidence: { b: 2, a: 1 } })).toEqual(first);
    await expect(acceptCompletion(undefined, { ...completion, evidence: { a: undefined } })).rejects.toThrow("non-JSON evidence");
  });

  test("blocks stale, unapproved, partial, and unsupported output", () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    const finding = { fingerprint: "f", path: "src/auth.ts", line: 3, severity: "high" as const, verdict: "affirm" as const,
      scenario: "A reused token authenticates a stranger", context: "The changed line loads the token", consequence: "Account access", nextStep: "Rotate the token" };
    const input = { snapshot: prepared, run: { status: "complete" as const, headSha: HEAD, scannerHealth: { complete: true }, semanticCoverage: "full" as const },
      pullRequest: { state: "open" as const, headSha: HEAD }, approved: true, qualified: true, safeMode: false, findings: [finding] };
    expect(planPublication({ ...input, pullRequest: { state: "open", headSha: BASE } }).kind).toBe("none");
    expect(planPublication({ ...input, approved: false }).kind).toBe("none");
    expect(planPublication({ ...input, run: { ...input.run, scannerHealth: { complete: false } } }).kind).toBe("none");
    expect(planPublication({ ...input, findings: [{ ...finding, line: 99 }] })).toMatchObject({ kind: "publish", check: "neutral", inline: [] });
    expect(planPublication(input)).toMatchObject({ kind: "publish", check: "neutral", inline: [{ fingerprint: "f" }] });
  });

  test("publishes a qualified clean walkthrough only after a complete review", () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    expect(planPublication({ snapshot: prepared, run: { status: "complete", headSha: HEAD, scannerHealth: { complete: true }, semanticCoverage: "full" },
      pullRequest: { state: "open", headSha: HEAD }, approved: true, qualified: true, safeMode: false, findings: [] }))
      .toEqual({ kind: "publish", check: "success", inline: [], omitted: [], walkthrough: "No actionable findings in the reviewed changes." });
  });

  test("limits ordinary inline findings to five", () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    const findings = Array.from({ length: 7 }, (_, i) => ({ fingerprint: `f${i}`, path: "src/auth.ts", line: 3,
      severity: "medium" as const, verdict: "affirm" as const, scenario: "fails", context: "changed line",
      consequence: "impact", nextStep: "fix" }));
    expect(planPublication({ snapshot: prepared, run: { status: "complete", headSha: HEAD, scannerHealth: { complete: true }, semanticCoverage: "full" },
      pullRequest: { state: "open", headSha: HEAD }, approved: true, qualified: true, safeMode: false, findings }))
      .toMatchObject({ kind: "publish", inline: expect.any(Array), omitted: ["f5", "f6"] });
  });

  test("a suppressed low finding does not turn an otherwise clean check neutral", () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    const finding = { fingerprint: "low", path: "src/auth.ts", line: 3, severity: "low" as const, verdict: "affirm" as const,
      scenario: "small defect", context: "changed line", consequence: "minor impact", nextStep: "fix" };
    expect(planPublication({ snapshot: prepared, run: { status: "complete", headSha: HEAD, scannerHealth: { complete: true }, semanticCoverage: "full" },
      pullRequest: { state: "open", headSha: HEAD }, approved: true, qualified: true, safeMode: false, findings: [finding] }))
      .toEqual({ kind: "publish", check: "success", inline: [], omitted: [], walkthrough: "Reviewed " + HEAD + ". Inline findings: 0. Walkthrough findings: 1. Omitted findings: 0." });
  });

  test("writes a failure check before it consults approval", () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    expect(planPublication({ snapshot: prepared, run: { status: "failed", headSha: HEAD, scannerHealth: { complete: false }, semanticCoverage: "skipped" },
      pullRequest: { state: "open", headSha: HEAD }, approved: false, qualified: false, safeMode: false, findings: [] }))
      .toEqual({ kind: "failure-check", check: "failure" });
  });

  test("safe mode and a closed pull request publish nothing", () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    const base = { snapshot: prepared, run: { status: "complete" as const, headSha: HEAD, scannerHealth: { complete: true }, semanticCoverage: "full" as const },
      pullRequest: { state: "open" as const, headSha: HEAD }, approved: true, qualified: true, safeMode: false, findings: [] };
    expect(planPublication({ ...base, safeMode: true })).toEqual({ kind: "none", reason: "safe mode" });
    expect(planPublication({ ...base, pullRequest: { state: "closed", headSha: HEAD } })).toEqual({ kind: "none", reason: "pull request closed" });
  });

  test("keeps at most ten critical inline findings", () => {
    const prepared = prepareSnapshot(snapshot, { baseSha: BASE, headSha: HEAD });
    const findings = Array.from({ length: 11 }, (_, i) => ({ fingerprint: `c${String(i).padStart(2, "0")}`, path: "src/auth.ts", line: 3,
      severity: "critical" as const, verdict: "affirm" as const, scenario: "fails", context: "changed line", consequence: "impact", nextStep: "fix" }));
    const plan = planPublication({ snapshot: prepared, run: { status: "complete", headSha: HEAD, scannerHealth: { complete: true }, semanticCoverage: "full" },
      pullRequest: { state: "open", headSha: HEAD }, approved: true, qualified: true, safeMode: false, findings });
    expect(plan.kind).toBe("publish");
    if (plan.kind !== "publish") return;
    expect(plan.inline.map((item) => item.fingerprint)).toEqual(["c00", "c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09"]);
    expect(plan.omitted).toEqual(["c10"]);
    expect(plan.check).toBe("neutral");
  });

  test("rejects a snapshot whose recorded base does not match", () => {
    expect(() => prepareSnapshot(snapshot, { baseSha: "c".repeat(40), headSha: HEAD })).toThrow("base mismatch");
  });

  test("rejects an empty file path", () => {
    expect(() => prepareSnapshot({ ...snapshot, files: [{ path: "", patch: null }] }, { baseSha: BASE, headSha: HEAD })).toThrow("duplicate or empty file path");
  });
});

describe("runner evidence path", () => {
  test("redacts before review and returns no raw secret", async () => {
    const secret = "ghp_private123";
    const source = { ...snapshot, files: [{ path: "src/auth.ts", patch: `@@ -1 +1 @@\n-old\n+token=${secret}` }] };
    let modelInput = "";
    const result = await executeRunnerEvidence({
      recorded: { baseSha: BASE, headSha: HEAD },
      acquire: async () => source,
      scanners: [{ name: "gitleaks", run: async () => [] }],
      detectSecrets: async () => [{ value: secret, rule: "github-pat", path: "src/auth.ts", line: 1 }],
      fingerprintSecret: async (hit) => makeSecretEvidence(hit, "control-plane-only-salt"),
      review: async (patches) => { modelInput = patches["src/auth.ts"]; return []; },
    });
    expect(modelInput).toContain("[REDACTED SECRET]");
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(result.secretEvidence).toHaveLength(1);
  });

  test("does not call the reviewer after a failed scanner", async () => {
    let reviewed = false;
    await expect(executeRunnerEvidence({
      recorded: { baseSha: BASE, headSha: HEAD }, acquire: async () => snapshot,
      scanners: [{ name: "gitleaks", run: async () => { throw Error("raw secret in scanner error"); } }],
      detectSecrets: async () => [], fingerprintSecret: async (hit) => makeSecretEvidence(hit, "key"),
      review: async () => { reviewed = true; return []; },
    })).rejects.toThrow("scanner evidence incomplete");
    expect(reviewed).toBe(false);
  });

  test("rejects secret evidence whose fingerprint is not a digest", async () => {
    await expect(executeRunnerEvidence({
      recorded: { baseSha: BASE, headSha: HEAD }, acquire: async () => snapshot,
      scanners: [{ name: "gitleaks", run: async () => [] }],
      detectSecrets: async () => [{ value: "raw-secret", rule: "r", path: "src/auth.ts", line: 3 }],
      fingerprintSecret: async (hit) => ({ rule: hit.rule, path: hit.path, line: hit.line, fingerprint: hit.value }),
      review: async () => [],
    })).rejects.toThrow("secret evidence failed");
  });
});
