import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { executeRunnerEvidence, makeSecretEvidence, prepareSnapshot, redactSecrets, type PullRequestSnapshot } from "../core/evidence";
import { assertNoConfigFlag, scanSnapshot } from "./gitleaks";

const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);
const token = "ghp_private123";

function snapshot(patch: string): PullRequestSnapshot {
  return { repositoryId: 9, pullRequest: 7, baseSha: BASE, headSha: HEAD, files: [{ path: "src/auth.ts", patch }] };
}

test("a known token becomes one hit and stays out of the serialized hits", async () => {
  const prepared = prepareSnapshot(snapshot(`@@ -1 +1 @@\n+token=${token}`), { baseSha: BASE, headSha: HEAD });
  const hits = await scanSnapshot(prepared, async () => [{ rule: "github-pat", path: "src/auth.ts", line: 1, value: token }]);
  expect(hits).toHaveLength(1);
  const printed = JSON.stringify(hits.map(({ rule, path, line }) => ({ rule, path, line })));
  expect(printed).not.toContain(token);
  expect(printed).toContain("github-pat");
});

test("a clean snapshot completes with no hits", async () => {
  const prepared = prepareSnapshot(snapshot("@@ -1 +1 @@\n+const ok = 1;"), { baseSha: BASE, headSha: HEAD });
  expect(await scanSnapshot(prepared, async () => [])).toEqual([]);
});

test("a missing scanner fails closed without the token", async () => {
  await expect(scanSnapshot(prepareSnapshot(snapshot(`@@ -1 +1 @@\n+${token}`), { baseSha: BASE, headSha: HEAD }), async () => {
    throw Error(`missing binary near ${token}`);
  })).rejects.toThrow("secret scan failed");
});

test("an empty secret value cannot be redacted", () => {
  expect(() => redactSecrets("text", [{ value: "", rule: "r", path: "a", line: 1 }])).toThrow("empty secret value");
});

test("the longer overlapping token is redacted once", () => {
  expect(redactSecrets("token=abcde", [
    { value: "abc", rule: "short", path: "a", line: 1 },
    { value: "abcde", rule: "long", path: "a", line: 1 },
  ])).toBe("token=[REDACTED SECRET]");
});

test("the runner command does not load a repository gitleaks config", () => {
  expect(() => assertNoConfigFlag(["gitleaks", "detect", "--no-banner"])).not.toThrow();
  expect(() => assertNoConfigFlag(["gitleaks", "detect", "--config", "snapshot/.gitleaks.toml"])).toThrow("repository gitleaks config is not loaded");
});

test("the reviewer sees the redacted patch and not the token", async () => {
  const result = await executeRunnerEvidence({
    recorded: { baseSha: BASE, headSha: HEAD },
    acquire: async () => snapshot(`@@ -1 +1 @@\n+token=${token}`),
    scanners: [{ name: "gitleaks", run: async () => [] }],
    detectSecrets: async () => [{ value: token, rule: "github-pat", path: "src/auth.ts", line: 1 }],
    fingerprintSecret: (hit) => makeSecretEvidence(hit, "control-plane-key"),
    review: async (patches) => {
      expect(patches["src/auth.ts"]).toContain("[REDACTED SECRET]");
      expect(patches["src/auth.ts"]).not.toContain(token);
      return [];
    },
  });
  expect(JSON.stringify(result)).not.toContain(token);
});

test("a failed scanner does not call review", async () => {
  let calls = 0;
  await expect(executeRunnerEvidence({
    recorded: { baseSha: BASE, headSha: HEAD },
    acquire: async () => snapshot("@@ -1 +1 @@\n+const ok = 1;"),
    scanners: [{ name: "gitleaks", run: async () => { throw Error("scanner down"); } }],
    detectSecrets: async () => [],
    fingerprintSecret: (hit) => makeSecretEvidence(hit, "key"),
    review: async () => { calls += 1; return []; },
  })).rejects.toThrow("scanner evidence incomplete");
  expect(calls).toBe(0);
});

test("the pin file names a version and a digest", () => {
  const pin = readFileSync(new URL("./pin.txt", import.meta.url), "utf8");
  expect(pin).toContain("gitleaks 8.24.3");
  expect(pin).toContain("rule-pack sha256:");
});
