import { createHmac } from "node:crypto";
import { expect, test } from "bun:test";
import { Inbox } from "./webhook";
import { openMemory } from "../ledger/store";

const SECRET = "webhook-secret";
const HEAD = "b".repeat(40);
const NEXT = "c".repeat(40);

function pull(head: string, draft = false) {
  return { number: 7, draft, head: { sha: head }, base: { repo: { id: 9 } } };
}

function signed(raw: string): string {
  return `sha256=${createHmac("sha256", SECRET).update(raw).digest("hex")}`;
}

function inbox() {
  return new Inbox(openMemory(), SECRET, 100, "codepoppy[bot]");
}

test("an opened pull request creates one request", () => {
  const box = inbox();
  const raw = JSON.stringify({ action: "opened", pull_request: pull(HEAD) });
  expect(box.receive({ id: "d1", signature: signed(raw), raw }).kind).toBe("request");
  expect(box.requestCount()).toBe(1);
});

test("the same delivery does not create a second request", () => {
  const box = inbox();
  const raw = JSON.stringify({ action: "opened", pull_request: pull(HEAD) });
  box.receive({ id: "d1", signature: signed(raw), raw });
  expect(box.receive({ id: "d1", signature: signed(raw), raw })).toEqual({ kind: "duplicate" });
  expect(box.requestCount()).toBe(1);
});

test("a bad signature stores the reason and not the body", () => {
  const box = inbox();
  const raw = JSON.stringify({ action: "opened", pull_request: pull(HEAD), token: "ghp_should_not_store" });
  expect(box.receive({ id: "d1", signature: "sha256=00", raw })).toEqual({ kind: "rejected", reason: "bad signature" });
  expect(box.storedDelivery("d1")).toEqual({ id: "d1", reason: "bad signature", bodyStored: false });
  expect(JSON.stringify(box.storedDelivery("d1"))).not.toContain("ghp_should_not_store");
});

test("a comment from another user creates no request", () => {
  const box = inbox();
  const raw = JSON.stringify({ action: "created", pull_request: pull(HEAD), comment: { body: "review", user: { id: 5, login: "other" } } });
  expect(box.receive({ id: "d1", signature: signed(raw), raw })).toEqual({ kind: "ignored", reason: "not owner" });
  expect(box.requestCount()).toBe(0);
});

test("embedded text is not a command", () => {
  const box = inbox();
  const raw = JSON.stringify({ action: "created", pull_request: pull(HEAD), comment: { body: "please review", user: { id: 100, login: "owner" } } });
  expect(box.receive({ id: "d1", signature: signed(raw), raw })).toEqual({ kind: "ignored", reason: "not a command" });
});

test("a draft synchronize creates no request", () => {
  const box = inbox();
  const raw = JSON.stringify({ action: "synchronize", pull_request: pull(HEAD, true) });
  expect(box.receive({ id: "d1", signature: signed(raw), raw })).toEqual({ kind: "ignored", reason: "draft" });
});

test("ready for review creates one request", () => {
  const box = inbox();
  const raw = JSON.stringify({ action: "ready_for_review", pull_request: pull(HEAD, true) });
  expect(box.receive({ id: "d1", signature: signed(raw), raw }).kind).toBe("request");
});

test("a newer head cancels the active run", () => {
  const ledger = openMemory();
  const box = new Inbox(ledger, SECRET, 100, "codepoppy[bot]");
  const first = JSON.stringify({ action: "opened", pull_request: pull(HEAD) });
  box.receive({ id: "d1", signature: signed(first), raw: first });
  const second = JSON.stringify({ action: "synchronize", pull_request: pull(NEXT) });
  box.receive({ id: "d2", signature: signed(second), raw: second });
  expect(ledger.readRun(`run:9:7:${HEAD}:incremental:automatic`)?.state).toBe("cancelled");
  expect(ledger.readRun(`run:9:7:${NEXT}:incremental:automatic`)?.state).toBe("requested");
});

test("the app walkthrough comment creates no request", () => {
  const box = inbox();
  const raw = JSON.stringify({ action: "created", pull_request: pull(HEAD), comment: { body: "review", user: { id: 100, login: "codepoppy[bot]" } } });
  expect(box.receive({ id: "d1", signature: signed(raw), raw })).toEqual({ kind: "ignored", reason: "self" });
});
