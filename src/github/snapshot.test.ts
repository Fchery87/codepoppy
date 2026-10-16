import { readFileSync } from "node:fs";
import { expect, test } from "bun:test";
import { loadSnapshot } from "./snapshot";

const recorded = { baseSha: "a".repeat(40), headSha: "b".repeat(40) };
const fixture = JSON.parse(readFileSync(new URL("./fixture-pr.json", import.meta.url), "utf8"));

test("the fixture changed lines match the added rows", () => {
  const prepared = loadSnapshot(fixture, recorded);
  expect(prepared.changedLines["src/auth.ts"]).toEqual([4]);
  expect(prepared.headSha).toBe(recorded.headSha);
  expect(prepared.baseSha).toBe(recorded.baseSha);
});

test("a swapped head is a head mismatch", () => {
  expect(() => loadSnapshot({ ...fixture, headSha: "c".repeat(40) }, recorded)).toThrow("head mismatch");
});

test("a null patch has no changed lines and other files still parse", () => {
  const files = [{ filename: "src/blob.bin", patch: null }, ...fixture.files];
  const prepared = loadSnapshot({ ...fixture, files }, recorded);
  expect(prepared.changedLines["src/blob.bin"]).toEqual([]);
  expect(prepared.changedLines["src/auth.ts"]).toEqual([4]);
});

test("a patch without a hunk header names the patch error", () => {
  expect(() => loadSnapshot({ ...fixture, files: [{ filename: "src/bad.ts", patch: "+no hunk" }] }, recorded)).toThrow("PR patch lacks hunk header");
});

test("a duplicate path is refused", () => {
  expect(() => loadSnapshot({ ...fixture, files: [fixture.files[0], fixture.files[0]] }, recorded)).toThrow("duplicate or empty file path");
});

test("a deletion-only hunk has no added lines", () => {
  const prepared = loadSnapshot(fixture, recorded);
  expect(prepared.changedLines["src/old.ts"]).toEqual([]);
});

test("a rename keeps changed lines on the new path only", () => {
  const prepared = loadSnapshot({
    ...fixture,
    files: [{ filename: "src/new-auth.ts", previous_filename: "src/auth.ts", patch: "@@ -1 +1 @@\n-old\n+new\n" }],
  }, recorded);
  expect(prepared.changedLines["src/new-auth.ts"]).toEqual([1]);
  expect(prepared.changedLines["src/auth.ts"]).toBeUndefined();
});
