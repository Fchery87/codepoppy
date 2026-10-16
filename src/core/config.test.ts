import { expect, test } from "bun:test";
import { installationDefaults, parseTrustedConfig } from "./config";

const bounds = { personalCeilingCents: 1000, approvedAliases: ["review-openrouter"] };

test("installation defaults are precise and shadow", () => {
  expect(installationDefaults()).toEqual({ version: 1, profile: "precise", posture: "shadow", excludes: [] });
});

test("an unknown field fails and names the field", () => {
  expect(() => parseTrustedConfig({ version: 1, profile: "precise", posture: "shadow", endpoint: "https://example.test" }, bounds))
    .toThrow("invalid configuration: endpoint");
});

test("a repository budget above the personal ceiling fails", () => {
  expect(() => parseTrustedConfig({ version: 1, profile: "precise", posture: "shadow", repositoryBudgetCents: 1001 }, bounds))
    .toThrow("invalid configuration: repositoryBudgetCents");
});

test("an approved alias and a lower repository budget parse", () => {
  expect(parseTrustedConfig({
    version: 1, profile: "thorough", posture: "publish", routeAlias: "review-openrouter", repositoryBudgetCents: 400, excludes: ["docs/**"],
  }, bounds)).toEqual({
    version: 1, profile: "thorough", posture: "publish", routeAlias: "review-openrouter", repositoryBudgetCents: 400, excludes: ["docs/**"],
  });
});
