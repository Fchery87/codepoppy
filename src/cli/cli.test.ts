import { expect, test } from "bun:test";
import { doctor } from "./doctor";
import { runSetup, usage } from "./setup";
import { readFileSync } from "node:fs";

const healthy = { webhookDelivered: true, pinnedSha: "abc", routePriced: true, shadowComplete: true, selectedPr: 7, enabled: true, namedPr: 7 };

test("doctor reports a completed shadow review and zero writes", () => {
  expect(doctor(healthy)).toMatchObject({ shadowComplete: true, githubWrites: 0 });
});

test("a declined confirmation does not attempt the following write", () => {
  const result = runSetup({ "github-app": false });
  expect(result.events[0]).toEqual({ step: "github-app", confirmed: false, attempted: false });
  expect(result.events.some((event) => event.step === "cloudflare")).toBe(false);
});

test("setup resumes after the database step without reprinting a secret", () => {
  const result = runSetup({ runner: true, provider: true }, ["github-app", "cloudflare", "postgres"]);
  expect(result.events.find((event) => event.step === "postgres")).toEqual({ step: "postgres", confirmed: true, attempted: false });
  expect(result.completed).toContain("runner");
  expect(JSON.stringify(result)).not.toMatch(/postgres:\/\//);
});

test("a missing webhook fails and names delivery", () => {
  expect(doctor({ ...healthy, webhookDelivered: false }).webhook).toBe(false);
});

test("an unpinned workflow fails the runner check", () => {
  expect(doctor({ ...healthy, pinnedSha: undefined }).runnerPinned).toBe(false);
});

test("a pull request the owner did not name is refused", () => {
  expect(doctor({ ...healthy, selectedPr: 8 }).selectedPr).toBeUndefined();
});

test("a disabled repository does not start a review", () => {
  expect(doctor({ ...healthy, enabled: false })).toMatchObject({ shadowComplete: false, githubWrites: 0 });
});

test("the README commands match the usage text", () => {
  const readme = readFileSync(new URL("../../README.md", import.meta.url), "utf8");
  for (const line of usage().split("\n")) expect(readme).toContain(line);
});
