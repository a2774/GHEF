import assert from "node:assert/strict";
import { test } from "node:test";

import { mergeStockChanges } from "./stock-changes";

test("keeps changes to different variants as they are, in order", () => {
  assert.deepEqual(
    mergeStockChanges([
      { variantId: 7, change: -2 },
      { variantId: 3, change: -1 },
    ]),
    [
      { variantId: 7, change: -2 },
      { variantId: 3, change: -1 },
    ],
  );
});

test("adds up several changes to the same variant", () => {
  assert.deepEqual(
    mergeStockChanges([
      { variantId: 5, change: 2 },
      { variantId: 9, change: 1 },
      { variantId: 5, change: 3 },
    ]),
    [
      { variantId: 5, change: 5 },
      { variantId: 9, change: 1 },
    ],
  );
});

test("drops a variant whose changes cancel out, and handles an empty list", () => {
  assert.deepEqual(
    mergeStockChanges([
      { variantId: 1, change: -4 },
      { variantId: 1, change: 4 },
    ]),
    [],
  );
  assert.deepEqual(mergeStockChanges([]), []);
});
