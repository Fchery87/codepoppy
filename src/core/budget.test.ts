import { expect, test } from "bun:test";
import { reserve } from "./budget";

test("a route with no price is refused before a call", () => {
  expect(reserve({ kind: "automatic-incremental", priced: false, callCents: 1, spentCents: 0, ceilingCents: 1000 })).toEqual({
    kind: "refused", reason: "unpriced",
  });
});

test("an automatic incremental call above ten cents is refused", () => {
  expect(reserve({ kind: "automatic-incremental", priced: true, callCents: 11, spentCents: 0, ceilingCents: 1000 })).toEqual({
    kind: "refused", reason: "run-ceiling",
  });
});

test("spend at seventy percent still reserves and prefers a cheaper route", () => {
  expect(reserve({ kind: "automatic-incremental", priced: true, callCents: 10, spentCents: 700, ceilingCents: 1000 })).toEqual({
    kind: "reserved", cents: 10, preferCheaper: true,
  });
});

test("spend at ninety-five percent allows only a manual full review", () => {
  expect(reserve({ kind: "automatic-full", priced: true, callCents: 10, spentCents: 950, ceilingCents: 1000 })).toEqual({
    kind: "refused", reason: "manual-only",
  });
  expect(reserve({ kind: "manual-full", priced: true, callCents: 10, spentCents: 950, ceilingCents: 1000 })).toEqual({
    kind: "reserved", cents: 10, preferCheaper: true,
  });
});
