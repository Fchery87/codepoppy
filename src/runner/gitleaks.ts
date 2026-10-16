import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { PreparedSnapshot } from "../core/evidence";
import type { SecretHit } from "../core/evidence";

export type GitleaksRun = (directory: string) => Promise<{ rule: string; path: string; line: number; value: string }[]>;

export async function scanSnapshot(snapshot: PreparedSnapshot, run: GitleaksRun): Promise<SecretHit[]> {
  const directory = mkdtempSync(join(tmpdir(), "codepoppy-scan-"));
  try {
    for (const file of snapshot.files) {
      writeFileSync(join(directory, file.path.replaceAll("/", "__")), file.patch ?? "");
    }
    const hits = await run(directory);
    return hits.map((hit) => ({ rule: hit.rule, path: hit.path, line: hit.line, value: hit.value }));
  } catch {
    throw Error("secret scan failed");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

export function assertNoConfigFlag(argv: string[]): void {
  if (argv.includes("--config")) throw Error("repository gitleaks config is not loaded");
}
