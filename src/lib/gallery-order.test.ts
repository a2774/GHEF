import assert from "node:assert/strict";
import { test } from "node:test";

import { moveItem, withPrimaryFirst } from "./gallery-order";

test("moves a photo to the left and to the right", () => {
  assert.deepEqual(moveItem(["a", "b", "c", "d"], 2, 0), ["c", "a", "b", "d"]);
  assert.deepEqual(moveItem(["a", "b", "c", "d"], 0, 3), ["b", "c", "d", "a"]);
  assert.deepEqual(moveItem(["a", "b", "c", "d"], 1, 2), ["a", "c", "b", "d"]);
});

test("leaves the list alone for a move that does nothing or is out of range", () => {
  assert.deepEqual(moveItem(["a", "b"], 1, 1), ["a", "b"]);
  assert.deepEqual(moveItem(["a", "b"], -1, 0), ["a", "b"]);
  assert.deepEqual(moveItem(["a", "b"], 0, 5), ["a", "b"]);
});

test("does not change the list it was given", () => {
  const original = ["a", "b", "c"];
  moveItem(original, 0, 2);
  assert.deepEqual(original, ["a", "b", "c"]);
});

test("only the first photo is the primary one", () => {
  const list = [
    { publicId: "a", isPrimary: false },
    { publicId: "b", isPrimary: true },
    { publicId: "c" },
  ];
  assert.deepEqual(
    withPrimaryFirst(list).map(({ publicId, isPrimary }) => [publicId, isPrimary]),
    [
      ["a", true],
      ["b", false],
      ["c", false],
    ],
  );
  assert.deepEqual(withPrimaryFirst([]), []);
});
