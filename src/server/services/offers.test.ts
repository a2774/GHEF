import assert from "node:assert/strict";
import { test } from "node:test";

import { type CouponRule, defaultOfferSettings, offerHeadlines, priceCart } from "./pricing";

const offers = defaultOfferSettings;
const rug = (rupees: number, quantity = 1) => ({ unitPricePaise: rupees * 100, quantity });
const coupon: CouponRule = {
  type: "percent",
  value: 5,
  minCartPaise: 0,
  maxUses: null,
  usedCount: 0,
  startsAt: null,
  endsAt: null,
  isActive: true,
};

test("no automatic offer below three items", () => {
  const result = priceCart({ lines: [rug(10_000, 2)], offers, prepaid: false });
  assert.equal(result.discountPaise, 0);
  assert.equal(result.totalPaise, 2_000_000);
  assert.equal(result.nextOffer, "Add 1 more item to get 10% off.");
  assert.equal(result.prepaidSavingPaise, 100_000);
});

test("three items get 10% and four get 15%", () => {
  assert.equal(priceCart({ lines: [rug(10_000, 3)], offers, prepaid: false }).discountPaise, 300_000);
  const four = priceCart({ lines: [rug(10_000, 2), rug(5_000, 2)], offers, prepaid: false });
  assert.equal(four.itemCount, 4);
  assert.equal(four.discountPaise, 450_000);
});

test("the bigger of quantity and cart value offer applies, not both", () => {
  const result = priceCart({ lines: [rug(40_000, 2)], offers, prepaid: false });
  assert.equal(result.discounts.length, 1);
  assert.equal(result.discounts[0].kind, "offer");
  assert.equal(result.discountPaise, 1_600_000);
});

test("coupon and prepaid apply on what is left after the offer", () => {
  const result = priceCart({ lines: [rug(10_000, 3)], offers, coupon, couponCode: "NEW5", prepaid: true });
  // 30,000 -> offer 3,000 -> 27,000 -> coupon 1,350 -> 25,650 -> prepaid 1,282.50 (floored)
  assert.deepEqual(
    result.discounts.map(({ kind, paise }) => [kind, paise]),
    [
      ["offer", 300_000],
      ["coupon", 135_000],
      ["prepaid", 128_250],
    ],
  );
  assert.equal(result.totalPaise, 3_000_000 - 563_250);
  assert.equal(result.prepaidSavingPaise, 0);
});

test("total discount never passes the cap", () => {
  const capped = { ...offers, maxDiscountPercent: 12 };
  const result = priceCart({ lines: [rug(10_000, 3)], offers: capped, coupon, prepaid: true });
  assert.equal(result.discountPaise, 360_000);
  assert.equal(result.discounts.at(-1)?.kind, "coupon");
});

test("an invalid coupon is reported without blocking offers", () => {
  const expired = { ...coupon, endsAt: new Date("2020-01-01") };
  const result = priceCart({ lines: [rug(10_000, 3)], offers, coupon: expired, prepaid: false });
  assert.equal(result.couponError, "This coupon has expired.");
  assert.equal(result.discountPaise, 300_000);
});

test("empty cart costs nothing", () => {
  const result = priceCart({ lines: [], offers, prepaid: true });
  assert.equal(result.totalPaise, 0);
  assert.equal(result.nextOffer, null);
});

test("headlines describe the active offers", () => {
  const titles = offerHeadlines(offers).map(({ title }) => title);
  assert.deepEqual(titles, [
    "Buy 3, get 10% off",
    "Buy 4, get 15% off",
    "Spend ₹70,000+, get 20% off",
    "Extra 5% off on prepaid",
  ]);
});
