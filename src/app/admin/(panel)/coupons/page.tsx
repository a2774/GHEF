import { desc } from "drizzle-orm";

import { CouponForm } from "@/components/admin/coupon-form";
import { Button } from "@/components/ui/button";
import { formatPaise } from "@/lib/format";
import { deleteCoupon, toggleCoupon } from "@/server/actions/admin-coupons";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { coupons } from "@/server/db/schema";

export default async function AdminCouponsPage() {
  await requireAdmin("admin");
  const rows = await withDbRetry(async () =>
    db.select().from(coupons).orderBy(desc(coupons.createdAt)),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Coupons</h1>
      <CouponForm />

      <ul className="rounded-2xl bg-card">
        {rows.length === 0 && <li className="p-6 text-lg text-muted-foreground">No coupons yet.</li>}
        {rows.map((coupon) => (
          <li key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-base first:border-t-0">
            <span>
              <strong>{coupon.code}</strong>{" "}
              {coupon.type === "percent" ? `${coupon.value}% off` : `${formatPaise(coupon.value)} off`}
              <span className="ml-2 text-muted-foreground">
                Used {coupon.usedCount}
                {coupon.maxUses ? ` of ${coupon.maxUses}` : ""}
              </span>
            </span>
            <span className="flex gap-2">
              <form action={toggleCoupon.bind(null, coupon.id)}>
                <Button type="submit" variant="outline" className="h-10 rounded-full px-4 text-base">
                  {coupon.isActive ? "Deactivate" : "Activate"}
                </Button>
              </form>
              <form action={deleteCoupon.bind(null, coupon.id)}>
                <Button type="submit" variant="destructive" className="h-10 rounded-full px-4 text-base">
                  Delete
                </Button>
              </form>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
