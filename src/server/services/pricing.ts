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

export function evaluateCoupon(coupon: CouponRule, subtotalPaise: number, now = new Date()): CouponResult {
  if (!coupon.isActive) return { ok: false, error: "This coupon is not active." };
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, error: "This coupon has not started yet." };
  if (coupon.endsAt && coupon.endsAt < now) return { ok: false, error: "This coupon has expired." };
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: "This coupon has reached its limit." };
  }
  if (subtotalPaise < coupon.minCartPaise) {
    return { ok: false, error: "Your cart is below the minimum for this coupon." };
  }

  const discount =
    coupon.type === "percent" ? Math.floor((subtotalPaise * coupon.value) / 100) : coupon.value;
  return { ok: true, discountPaise: Math.min(discount, subtotalPaise) };
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
