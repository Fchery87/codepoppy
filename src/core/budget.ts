export type ReviewKind = "automatic-incremental" | "automatic-full" | "manual-full";

export type Reservation =
  | { kind: "refused"; reason: "unpriced" | "budget-exhausted" | "manual-only" | "run-ceiling" }
  | { kind: "reserved"; cents: number; preferCheaper: boolean };

const RUN_CEILING_CENTS = { "automatic-incremental": 10, "automatic-full": 40, "manual-full": 100 } as const;

/** Pure spend decision. The caller persists the reservation before any provider call. */
export function reserve(input: {
  kind: ReviewKind;
  priced: boolean;
  callCents: number;
  spentCents: number;
  ceilingCents: number;
}): Reservation {
  if (!input.priced) return { kind: "refused", reason: "unpriced" };
  if (!Number.isSafeInteger(input.callCents) || input.callCents < 0) throw Error("invalid call price");
  const used = input.ceilingCents === 0 ? 1 : input.spentCents / input.ceilingCents;
  if (used >= 1) return { kind: "refused", reason: "budget-exhausted" };
  if (used >= 0.95 && input.kind !== "manual-full") return { kind: "refused", reason: "manual-only" };
  if (input.callCents > RUN_CEILING_CENTS[input.kind]) return { kind: "refused", reason: "run-ceiling" };
  if (input.spentCents + input.callCents > input.ceilingCents) return { kind: "refused", reason: "budget-exhausted" };
  return { kind: "reserved", cents: input.callCents, preferCheaper: used >= 0.7 };
}
