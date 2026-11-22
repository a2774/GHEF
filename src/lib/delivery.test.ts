import assert from "node:assert/strict";
import { test } from "node:test";

import { addWorkingDays, deliveryEstimate } from "./delivery";

test("skips Sundays", () => {
  // Saturday 7 Nov 2026 + 1 working day is Monday 9 Nov.
  const result = addWorkingDays(new Date(2026, 10, 7), 1);
  assert.equal(result.getDate(), 9);
});

test("dispatch then transit", () => {
  const { dispatch, delivery } = deliveryEstimate(new Date(2026, 10, 2), 1, 5);
  assert.equal(dispatch.getDate(), 3);
  assert.equal(delivery.getDate(), 9);
});
