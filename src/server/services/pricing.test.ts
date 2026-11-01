import assert from "node:assert/strict";
import { test } from "node:test";

import { calculateTotals, type CouponRule, evaluateCoupon } from "./pricing";

const now = new Date("2026-11-01T00:00:00Z");
const coupon: CouponRule = {
  type: "percent",
  value: 10,
  minCartPaise: 0,
  maxUses: null,
  usedCount: 0,
  startsAt: null,
  endsAt: null,
  isActive: true,
};

test("adds line totals and subtracts the discount", () => {
  const totals = calculateTotals(
    [
      { unitPricePaise: 149_900, quantity: 2 },
      { unitPricePaise: 50_000, quantity: 1 },
    ],
    10_000,
  );
  assert.deepEqual(totals, { subtotalPaise: 349_800, discountPaise: 10_000, totalPaise: 339_800 });
});

test("never lets a discount push the total below zero", () => {
  const totals = calculateTotals([{ unitPricePaise: 100, quantity: 1 }], 500);
  assert.equal(totals.totalPaise, 0);
});

test("calculates percent coupons in whole paise", () => {
  assert.deepEqual(evaluateCoupon({ ...coupon, value: 15 }, 999, now), {
    ok: true,
    discountPaise: 149,
  });
});

test("caps fixed coupons at the subtotal", () => {
  assert.deepEqual(evaluateCoupon({ ...coupon, type: "fixed", value: 5_000 }, 1_000, now), {
    ok: true,
    discountPaise: 1_000,
  });
});

test("rejects inactive, early, expired, used up and below-minimum coupons", () => {
  const rejected: Partial<CouponRule>[] = [
    { isActive: false },
    { startsAt: new Date("2026-11-02T00:00:00Z") },
    { endsAt: new Date("2026-10-31T00:00:00Z") },
    { maxUses: 5, usedCount: 5 },
    { minCartPaise: 2_000 },
  ];
  for (const rule of rejected) {
    assert.equal(evaluateCoupon({ ...coupon, ...rule }, 1_000, now).ok, false);
  }
});
