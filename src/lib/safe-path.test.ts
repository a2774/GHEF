import assert from "node:assert/strict";
import { test } from "node:test";

import { isSafePath } from "./safe-path";

test("allows same-site paths", () => {
  assert.equal(isSafePath("/cart"), true);
  assert.equal(isSafePath("/products?category=jute"), true);
});

test("blocks open redirects", () => {
  assert.equal(isSafePath("https://evil.example"), false);
  assert.equal(isSafePath("//evil.example"), false);
  assert.equal(isSafePath("/\\evil.example"), false);
  assert.equal(isSafePath("cart"), false);
  assert.equal(isSafePath(""), false);
});
