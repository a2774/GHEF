import { and, desc, eq, gt, isNull, lt, lte, or, sql } from "drizzle-orm";

import { formatPaise } from "@/lib/format";
import { db, withDbRetry } from "@/server/db";
import { coupons } from "@/server/db/schema";

export type CouponOffer = {
  title: string;
  detail: string;
  badge: string;
  code: string;
};

/** Coupons a shopper can use right now: switched on, started, not expired and not used up. */
export async function getLiveCoupons(limit = 10) {
  return withDbRetry(async () =>
    db
      .select()
      .from(coupons)
      .where(
        and(
          eq(coupons.isActive, true),
          or(isNull(coupons.startsAt), lte(coupons.startsAt, sql`now()`)),
          or(isNull(coupons.endsAt), gt(coupons.endsAt, sql`now()`)),
          or(isNull(coupons.maxUses), lt(coupons.usedCount, coupons.maxUses)),
        ),
      )
      .orderBy(desc(coupons.createdAt))
      .limit(limit),
  );
}

export function couponOffers(rows: Awaited<ReturnType<typeof getLiveCoupons>>): CouponOffer[] {
  return rows.map((coupon) => {
    const amount = coupon.type === "percent" ? `${coupon.value}% off` : `${formatPaise(coupon.value)} off`;
    const where = coupon.minCartPaise > 0 ? `on orders above ${formatPaise(coupon.minCartPaise)}` : "on your order";
    return {
      title: `Get ${amount} ${where}`,
      detail: `Use code ${coupon.code}`,
      badge: amount.toUpperCase(),
      code: coupon.code,
    };
  });
}
