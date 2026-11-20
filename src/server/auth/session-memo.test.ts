import assert from "node:assert/strict";
import { test } from "node:test";

import { createSessionMemo } from "./session-memo";

test("returns a remembered session until the time limit passes", () => {
  const memo = createSessionMemo<string>(60_000, 10);
  memo.set("a", "admin", 10_000_000, 1_000);

  assert.equal(memo.get("a", 1_000), "admin");
  assert.equal(memo.get("a", 60_999), "admin");
  assert.equal(memo.get("a", 61_000), undefined);
  assert.equal(memo.size, 0, "an expired entry is dropped");
});

test("never outlives the session it was read from", () => {
  const memo = createSessionMemo<string>(60_000, 10);
  memo.set("a", "admin", 5_000, 1_000);

  assert.equal(memo.get("a", 4_999), "admin");
  assert.equal(memo.get("a", 5_000), undefined);
});

test("forgets a session on delete, for example when the admin signs out", () => {
  const memo = createSessionMemo<string>(60_000, 10);
  memo.set("a", "admin", 10_000_000, 0);
  memo.delete("a");

  assert.equal(memo.get("a", 1), undefined);
});

test("unknown keys are not remembered", () => {
  const memo = createSessionMemo<string>(60_000, 10);
  assert.equal(memo.get("missing"), undefined);
});

test("drops the oldest entries when full", () => {
  const memo = createSessionMemo<number>(60_000, 2);
  memo.set("a", 1, 10_000_000, 0);
  memo.set("b", 2, 10_000_000, 0);
  memo.set("c", 3, 10_000_000, 0);

  assert.equal(memo.size, 2);
  assert.equal(memo.get("a", 1), undefined);
  assert.equal(memo.get("b", 1), 2);
  assert.equal(memo.get("c", 1), 3);
});

test("setting a key again refreshes its time and keeps it as the newest", () => {
  const memo = createSessionMemo<number>(60_000, 2);
  memo.set("a", 1, 10_000_000, 0);
  memo.set("b", 2, 10_000_000, 0);
  memo.set("a", 1, 10_000_000, 50_000);
  memo.set("c", 3, 10_000_000, 50_000);

  assert.equal(memo.get("b", 50_001), undefined, "b was the oldest, so it left");
  assert.equal(memo.get("a", 100_000), 1, "a was checked again at 50 s, so it lasts until 110 s");
});
