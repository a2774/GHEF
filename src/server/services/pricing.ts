export type CouponRule = {
  type: "percent" | "fixed";
  value: number;
  minCartPaise: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  isActive: boolean;
};

export type CouponResult = { ok: true; discountPaise: number } | { ok: false; error: string };

/**
 * Checks a coupon against the cart subtotal. The discount is worked out on
 * `discountBasePaise` (the amount left after automatic offers), which defaults
 * to the subtotal.
 */
export function evaluateCoupon(
  coupon: CouponRule,
  subtotalPaise: number,
  now = new Date(),
  discountBasePaise = subtotalPaise,
): CouponResult {
  if (!coupon.isActive) return { ok: false, error: "This coupon is not active." };
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, error: "This coupon has not started yet." };
  if (coupon.endsAt && coupon.endsAt < now) return { ok: false, error: "This coupon has expired." };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: "This coupon has reached its limit." };
  }
  if (subtotalPaise < coupon.minCartPaise) {
    return { ok: false, error: "Your cart is below the minimum for this coupon." };
  }

  const base = Math.max(0, discountBasePaise);
  const discount = coupon.type === "percent" ? Math.floor((base * coupon.value) / 100) : coupon.value;
  return { ok: true, discountPaise: Math.min(discount, base) };
}

export function calculateTotals(
  lines: { unitPricePaise: number; quantity: number }[],
  discountPaise = 0,
) {
  const subtotalPaise = lines.reduce(
    (total, { unitPricePaise, quantity }) => total + unitPricePaise * quantity,
    0,
  );
  const appliedDiscount = Math.min(discountPaise, subtotalPaise);
  return {
    subtotalPaise,
    discountPaise: appliedDiscount,
    totalPaise: subtotalPaise - appliedDiscount,
  };
}

// ---------------------------------------------------------------------------
// Automatic offers: buy-more tiers, cart-value tiers and the prepaid discount.
// ---------------------------------------------------------------------------

export type OfferSettings = {
  /** e.g. buy 3 items, get 10% off. */
  bundleTiers: { minItems: number; percent: number }[];
  /** e.g. cart of ₹70,000 or more, get 20% off. */
  valueTiers: { minPaise: number; percent: number }[];
  /** Extra discount for paying online. 0 turns it off. */
  prepaidPercent: number;
  /** Ceiling on all discounts together, as a percent of the subtotal. */
  maxDiscountPercent: number;
};

export const defaultOfferSettings: OfferSettings = {
  bundleTiers: [
    { minItems: 3, percent: 10 },
    { minItems: 4, percent: 15 },
  ],
  valueTiers: [{ minPaise: 7_000_000, percent: 20 }],
  prepaidPercent: 5,
  maxDiscountPercent: 30,
};

export type DiscountLine = { kind: "offer" | "coupon" | "prepaid"; label: string; paise: number };

export type CartPricing = {
  itemCount: number;
  subtotalPaise: number;
  discounts: DiscountLine[];
  discountPaise: number;
  totalPaise: number;
  couponError: string | null;
  /** What paying online would save on top, shown before the customer picks a method. */
  prepaidSavingPaise: number;
  /** A nudge such as "Add 1 more item to get 10% off." */
  nextOffer: string | null;
};

const rupeeFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const rupees = (paise: number) => rupeeFormat.format(paise / 100);

function bestBundle(offers: OfferSettings, itemCount: number) {
  return offers.bundleTiers
    .filter(({ minItems, percent }) => percent > 0 && itemCount >= minItems)
    .sort((a, b) => b.percent - a.percent)[0];
}

function bestValueTier(offers: OfferSettings, subtotalPaise: number) {
  return offers.valueTiers
    .filter(({ minPaise, percent }) => percent > 0 && subtotalPaise >= minPaise)
    .sort((a, b) => b.percent - a.percent)[0];
}

function nextOfferHint(offers: OfferSettings, itemCount: number, subtotalPaise: number, currentPercent: number) {
  const bundle = offers.bundleTiers
    .filter(({ minItems, percent }) => itemCount < minItems && percent > currentPercent)
    .sort((a, b) => a.minItems - b.minItems)[0];
  if (bundle) {
    const more = bundle.minItems - itemCount;
    return `Add ${more} more ${more === 1 ? "item" : "items"} to get ${bundle.percent}% off.`;
  }
  const value = offers.valueTiers
    .filter(({ minPaise, percent }) => subtotalPaise < minPaise && percent > currentPercent)
    .sort((a, b) => a.minPaise - b.minPaise)[0];
  if (value) return `Add ${rupees(value.minPaise - subtotalPaise)} more to get ${value.percent}% off.`;
  return null;
}

/**
 * The single source of truth for what a cart costs. Runs on the server for the
 * cart page, checkout and order placement, so all three always agree.
 *
 * Order of discounts: best automatic offer (quantity or cart value, whichever is
 * bigger), then the coupon on what is left, then the prepaid discount on what is
 * left. The total is capped at `maxDiscountPercent` of the subtotal.
 */
export function priceCart({
  lines,
  offers,
  coupon,
  couponCode,
  prepaid,
  now = new Date(),
}: {
  lines: { unitPricePaise: number; quantity: number }[];
  offers: OfferSettings;
  coupon?: CouponRule | null;
  couponCode?: string;
  prepaid: boolean;
  now?: Date;
}): CartPricing {
  const billable = lines.filter(({ quantity }) => quantity > 0);
  const itemCount = billable.reduce((total, { quantity }) => total + quantity, 0);
  const { subtotalPaise } = calculateTotals(billable);
  const cap = Math.floor((subtotalPaise * Math.max(0, Math.min(100, offers.maxDiscountPercent))) / 100);

  const discounts: DiscountLine[] = [];
  let remaining = subtotalPaise;
  let given = 0;
  const add = (line: DiscountLine) => {
    const paise = Math.max(0, Math.min(line.paise, remaining, cap - given));
    if (paise <= 0) return;
    discounts.push({ ...line, paise });
    remaining -= paise;
    given += paise;
  };

  const bundle = bestBundle(offers, itemCount);
  const value = bestValueTier(offers, subtotalPaise);
  const autoPercent = Math.max(bundle?.percent ?? 0, value?.percent ?? 0);
  if (autoPercent > 0) {
    const label =
      bundle && bundle.percent >= (value?.percent ?? 0)
        ? `Buy ${bundle.minItems}+ offer (${bundle.percent}%)`
        : `Cart over ${rupees(value!.minPaise)} (${value!.percent}%)`;
    add({ kind: "offer", label, paise: Math.floor((subtotalPaise * autoPercent) / 100) });
  }

  let couponError: string | null = null;
  if (coupon) {
    const result = evaluateCoupon(coupon, subtotalPaise, now, remaining);
    if (result.ok) add({ kind: "coupon", label: `Coupon ${couponCode ?? ""}`.trim(), paise: result.discountPaise });
    else couponError = result.error;
  }

  const prepaidPercent = Math.max(0, offers.prepaidPercent);
  const prepaidRaw = Math.floor((remaining * prepaidPercent) / 100);
  const prepaidSavingPaise = Math.max(0, Math.min(prepaidRaw, cap - given));
  if (prepaid && prepaidPercent > 0) {
    add({ kind: "prepaid", label: `Prepaid (${prepaidPercent}%)`, paise: prepaidRaw });
  }

  return {
    itemCount,
    subtotalPaise,
    discounts,
    discountPaise: given,
    totalPaise: subtotalPaise - given,
    couponError,
    prepaidSavingPaise: prepaid ? 0 : prepaidSavingPaise,
    nextOffer: itemCount > 0 ? nextOfferHint(offers, itemCount, subtotalPaise, autoPercent) : null,
  };
}

export function describeDiscounts(discounts: DiscountLine[]) {
  return discounts.map(({ label, paise }) => `${label}: -${rupees(paise)}`).join(" · ");
}

/** Short lines for the ticker and the product page offers box. */
export function offerHeadlines(offers: OfferSettings) {
  const lines: { title: string; detail: string }[] = [];
  for (const tier of [...offers.bundleTiers].sort((a, b) => a.minItems - b.minItems)) {
    if (tier.percent > 0) {
      lines.push({ title: `Buy ${tier.minItems}, get ${tier.percent}% off`, detail: `Add any ${tier.minItems} items to your cart` });
    }
  }
  for (const tier of offers.valueTiers) {
    if (tier.percent > 0) {
      lines.push({ title: `Spend ${rupees(tier.minPaise)}+, get ${tier.percent}% off`, detail: `On a cart value of ${rupees(tier.minPaise)} or more` });
    }
  }
  if (offers.prepaidPercent > 0) {
    lines.push({ title: `Extra ${offers.prepaidPercent}% off on prepaid`, detail: "Pay online with UPI, card or net banking" });
  }
  return lines;
}
