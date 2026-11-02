import { desc } from "drizzle-orm";

import { CouponForm } from "@/components/admin/coupon-form";
import { Button } from "@/components/ui/button";
import { formatPaise } from "@/lib/format";
import { deleteCoupon, toggleCoupon } from "@/server/actions/admin-coupons";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { coupons } from "@/server/db/schema";

export const instant = false;

export default async function AdminCouponsPage() {
  await requireAdmin("admin");
  const rows = await withDbRetry(async () =>
    db.select().from(coupons).orderBy(desc(coupons.createdAt)),
  );

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Discount Coupons & Offers
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create promotional voucher codes, percentage discounts, and redemption caps.
        </p>
      </div>

      <CouponForm />

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Active & Inactive Coupons ({rows.length})</span>
          <span className="text-[10px] text-slate-400">Promotions</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <li className="p-8 text-center text-xs text-slate-500">
              No promotional coupons created yet.
            </li>
          ) : (
            rows.map((coupon) => (
              <li
                key={coupon.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs transition-colors hover:bg-slate-50/60"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono font-bold text-slate-950 border border-slate-200 text-xs">
                      {coupon.code}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[#bef264] px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow-2xs">
                      {coupon.type === "percent" ? `${coupon.value}% off` : `${formatPaise(coupon.value)} off`}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        coupon.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-slate-400">
                    Used {coupon.usedCount} times
                    {coupon.maxUses ? ` • Max limit: ${coupon.maxUses}` : " • Unlimited usage"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <form action={toggleCoupon.bind(null, coupon.id)}>
                    <Button
                      type="submit"
                      variant="outline"
                      size="xs"
                      className="rounded-full border-slate-200 hover:bg-slate-100 text-xs px-3"
                    >
                      {coupon.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </form>
                  <form action={deleteCoupon.bind(null, coupon.id)}>
                    <Button
                      type="submit"
                      variant="destructive"
                      size="xs"
                      className="rounded-full text-xs px-3"
                    >
                      Delete
                    </Button>
                  </form>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
