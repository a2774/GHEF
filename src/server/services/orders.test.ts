import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";

import { canConfirmOrder, canCustomerCancel, canTransition, customerStatusLabel, statusAfterTracking } from "./order-rules";
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

test("a confirmed order can go straight to shipped", () => {
  assert.equal(canTransition("confirmed", "shipped"), true);
});

test("saving a tracking number ships a confirmed, processing or packed order", () => {
  assert.equal(statusAfterTracking("confirmed", "confirmed", "DLV123"), "shipped");
  assert.equal(statusAfterTracking("processing", "processing", "DLV123"), "shipped");
  assert.equal(statusAfterTracking("packed", "packed", "DLV123"), "shipped");
});

test("a tracking number changes nothing else", () => {
  assert.equal(statusAfterTracking("confirmed", "confirmed", null), "confirmed");
  assert.equal(statusAfterTracking("pending", "pending", "DLV123"), "pending");
  assert.equal(statusAfterTracking("shipped", "shipped", "DLV123"), "shipped");
  assert.equal(statusAfterTracking("delivered", "delivered", "DLV123"), "delivered");
  assert.equal(statusAfterTracking("confirmed", "processing", "DLV123"), "processing");
});


test("only a pending cash on delivery or paid order can be confirmed by hand", () => {
  assert.equal(canConfirmOrder("pending", "Cash on delivery", "unpaid"), true);
  assert.equal(canConfirmOrder("pending", "Razorpay", "paid"), true);
  assert.equal(canConfirmOrder("pending", "Razorpay", "unpaid"), false);
  assert.equal(canConfirmOrder("confirmed", "Cash on delivery", "unpaid"), false);
  assert.equal(canConfirmOrder("cancelled", "Cash on delivery", "unpaid"), false);
});

test("a new order reads as received, not pending, to the customer", () => {
  assert.equal(customerStatusLabel("pending", "Cash on delivery"), "Order received");
  assert.equal(customerStatusLabel("pending", "Razorpay"), "Awaiting payment");
  assert.equal(customerStatusLabel("shipped", "Cash on delivery"), "Shipped");
});


test("a confirm pressed by mistake can be undone, but only from confirmed", () => {
  assert.equal(canTransition("confirmed", "pending"), true);
  assert.equal(canTransition("processing", "pending"), false);
  assert.equal(canTransition("shipped", "pending"), false);
});
