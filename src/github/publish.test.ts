import { expect, test } from "bun:test";
import { prepareSnapshot, type PublicationInput } from "../core/evidence";
import { preview, Publisher } from "./publish";

const BASE = "a".repeat(40);
const HEAD = "b".repeat(40);
const prepared = prepareSnapshot({
  repositoryId: 9, pullRequest: 7, baseSha: BASE, headSha: HEAD,
  files: [{ path: "src/auth.ts", patch: "@@ -2,0 +3,1 @@\n+changed\n" }],
}, { baseSha: BASE, headSha: HEAD });

function finding(fingerprint: string, severity: "critical" | "medium" = "medium") {
  return { fingerprint, path: "src/auth.ts", line: 3, severity, verdict: "affirm" as const, scenario: "The token is reused", context: "The changed line", consequence: "Account access", nextStep: "Compare the subject" };
}

function input(findings: PublicationInput["findings"], status: PublicationInput["run"]["status"] = "complete"): PublicationInput {
  return {
    snapshot: prepared,
    run: { status, headSha: HEAD, scannerHealth: { complete: status !== "failed" }, semanticCoverage: status === "failed" ? "skipped" : "full" },
    pullRequest: { state: "open", headSha: HEAD },
    approved: true, qualified: true, safeMode: false, findings,
  };
}

test("the first publish creates one walkthrough and one check", () => {
  const publisher = new Publisher(() => HEAD);
  publisher.publish(input([finding("f")]), "publish");
  expect(publisher.objects.filter((item) => item.kind === "walkthrough")).toHaveLength(1);
  expect(publisher.objects.filter((item) => item.kind === "check")).toHaveLength(1);
  expect(publisher.objects.filter((item) => item.kind === "inline").map((item) => item.id)).toEqual(["inline:f"]);
});

test("a second publish keeps the same comment id", () => {
  const publisher = new Publisher(() => HEAD);
  publisher.publish(input([finding("f")]), "publish");
  publisher.publish(input([finding("f")]), "publish");
  expect(publisher.objects.filter((item) => item.kind === "walkthrough").map((item) => item.id)).toEqual(["walkthrough:1"]);
});

test("a moved head writes nothing", () => {
  const publisher = new Publisher(() => "c".repeat(40));
  publisher.publish(input([finding("f")]), "publish");
  expect(publisher.writes).toBe(0);
});

test("two marker comments enter safe mode and stop", () => {
  const publisher = new Publisher(() => HEAD);
  publisher.objects.push({ id: "w1", kind: "walkthrough", headSha: HEAD, body: "<!-- codepoppy:walkthrough -->\none" });
  publisher.objects.push({ id: "w2", kind: "walkthrough", headSha: HEAD, body: "<!-- codepoppy:walkthrough -->\ntwo" });
  publisher.publish(input([]), "publish");
  expect(publisher.safeMode).toBe(true);
  expect(publisher.objects).toHaveLength(2);
});

test("a required-stage failure writes a failed check and no walkthrough", () => {
  const publisher = new Publisher(() => HEAD);
  publisher.publish(input([], "failed"), "publish");
  expect(publisher.objects.map((item) => item.kind)).toEqual(["check"]);
  expect(publisher.objects[0]?.body).toBe("failure: review did not finish");
});

test("a closed pull request writes nothing", () => {
  const publisher = new Publisher(() => HEAD);
  const closed = input([]);
  closed.pullRequest = { state: "closed", headSha: HEAD };
  publisher.publish(closed, "publish");
  expect(publisher.writes).toBe(0);
});

test("a clean review does not say the pull request is safe to merge", () => {
  const publisher = new Publisher(() => HEAD);
  publisher.publish(input([]), "publish");
  const body = publisher.objects.find((item) => item.kind === "walkthrough")?.body ?? "";
  expect(body).toContain("No actionable finding was found");
  expect(body).toContain("does not say the pull request is safe to merge");
  expect(publisher.objects.find((item) => item.kind === "check")?.body).toBe("success");
});

test("eleven critical findings publish ten inline comments and name the omitted fingerprint", () => {
  const publisher = new Publisher(() => HEAD);
  const findings = Array.from({ length: 11 }, (_, i) => finding(`c${String(i).padStart(2, "0")}`, "critical"));
  publisher.publish(input(findings), "publish");
  expect(publisher.objects.filter((item) => item.kind === "inline")).toHaveLength(10);
  expect(publisher.objects.find((item) => item.kind === "walkthrough")?.body).toContain("c10");
});

test("preview prints the marker and does not write", () => {
  const publisher = new Publisher(() => HEAD);
  const text = preview(input([finding("f")]));
  expect(text.startsWith("<!-- codepoppy:walkthrough -->")).toBe(true);
  expect(publisher.writes).toBe(0);
});
