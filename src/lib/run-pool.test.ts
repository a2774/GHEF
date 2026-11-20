import assert from "node:assert/strict";
import { test } from "node:test";

import { runWithLimit } from "./run-pool";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("handles every item once and passes its position", async () => {
  const seen: [string, number][] = [];
  await runWithLimit(["a", "b", "c", "d", "e"], 2, async (item, index) => {
    await wait(1);
    seen.push([item, index]);
  });
  assert.deepEqual(seen.sort(), [
    ["a", 0],
    ["b", 1],
    ["c", 2],
    ["d", 3],
    ["e", 4],
  ]);
});

test("never runs more than the limit at the same time, and does use all lanes", async () => {
  let running = 0;
  let peak = 0;
  await runWithLimit(Array.from({ length: 10 }, (_, i) => i), 3, async () => {
    running += 1;
    peak = Math.max(peak, running);
    await wait(5);
    running -= 1;
  });
  assert.equal(peak, 3);
});

test("works with fewer items than lanes and with no items", async () => {
  let calls = 0;
  await runWithLimit(["only"], 4, async () => {
    calls += 1;
  });
  await runWithLimit([], 4, async () => {
    calls += 1;
  });
  assert.equal(calls, 1);
});

test("a limit below one still runs the items, one by one", async () => {
  const order: number[] = [];
  await runWithLimit([1, 2, 3], 0, async (item) => {
    await wait(1);
    order.push(item);
  });
  assert.deepEqual(order, [1, 2, 3]);
});
