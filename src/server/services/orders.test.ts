import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";

import { canCustomerCancel, canTransition } from "./order-rules";
import { signatureMatches } from "./razorpay";

test("allows the normal order lifecycle", () => {
  assert.equal(canTransition("pending", "confirmed"), true);
  assert.equal(canTransition("confirmed", "processing"), true);
  assert.equal(canTransition("processing", "shipped"), true);
  assert.equal(canTransition("shipped", "delivered"), true);
  assert.equal(canTransition("delivered", "return_requested"), true);
  assert.equal(canTransition("return_requested", "returned"), true);
  assert.equal(canTransition("returned", "refunded"), true);
});

test("blocks invalid order jumps", () => {
  assert.equal(canTransition("pending", "delivered"), false);
  assert.equal(canTransition("shipped", "cancelled"), false);
  assert.equal(canTransition("delivered", "pending"), false);
  assert.equal(canTransition("refunded", "confirmed"), false);
});

test("customers can cancel only before shipping", () => {
  assert.equal(canCustomerCancel("confirmed"), true);
  assert.equal(canCustomerCancel("shipped"), false);
  assert.equal(canCustomerCancel("delivered"), false);
});

test("accepts only a correct Razorpay signature", () => {
  const payload = "order_1|pay_1";
  const signature = createHmac("sha256", "secret").update(payload).digest("hex");
  assert.equal(signatureMatches(payload, signature, "secret"), true);
  assert.equal(signatureMatches(payload, signature, "wrong"), false);
  assert.equal(signatureMatches("order_2|pay_1", signature, "secret"), false);
  assert.equal(signatureMatches(payload, "short", "secret"), false);
});
