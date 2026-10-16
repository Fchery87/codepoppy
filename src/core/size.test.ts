import { expect, test } from "bun:test";
import { classifyFile, classifySize } from "./size";

test("seventy-six relevant files are oversized", () => {
  const files = Array.from({ length: 76 }, () => ({ semantic: true, changedLines: 1, bytes: 10 }));
  expect(classifySize(files)).toBe("oversized");
});

test("a NUL in the first 8 KB excludes the file from semantic review and keeps secret detection", () => {
  const bytes = new Uint8Array(16);
  bytes[3] = 0;
  expect(classifyFile({ path: "src/auth.ts", bytes })).toEqual({ semantic: false, secretDetection: true, reason: "binary" });
});

test("a readable source file stays eligible", () => {
  expect(classifyFile({ path: "src/auth.ts", bytes: new TextEncoder().encode("const token = 1;\n") })).toEqual({
    semantic: true, secretDetection: true, reason: "relevant",
  });
});
