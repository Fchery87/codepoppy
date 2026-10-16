import { expect, test } from "bun:test";
import { fingerprint } from "./findings";

test("two claims that differ only by SHA and line share one fingerprint", async () => {
  const first = await fingerprint({
    repositoryId: 42,
    category: "security",
    symbol: "login",
    path: "src/auth.ts",
    claim: "token reuse at line 18 on aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  });
  const second = await fingerprint({
    repositoryId: 42,
    category: "security",
    symbol: "login",
    path: "src/auth.ts",
    claim: "token reuse at line 40 on bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  });
  expect(first).toBe(second);
  expect(first).toHaveLength(64);
});

test("a different category is a different finding", async () => {
  const security = await fingerprint({ repositoryId: 42, category: "security", path: "src/auth.ts", claim: "token reuse" });
  const correctness = await fingerprint({ repositoryId: 42, category: "correctness", path: "src/auth.ts", claim: "token reuse" });
  expect(security).not.toBe(correctness);
});

test("an unknown category has no fingerprint", async () => {
  await expect(fingerprint({ repositoryId: 42, category: "style", path: "src/auth.ts", claim: "rename this" })).rejects.toThrow("unknown category");
});
