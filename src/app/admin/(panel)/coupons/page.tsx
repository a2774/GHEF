import { desc } from "drizzle-orm";

import { CouponManager } from "@/components/admin/coupon-manager";
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
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Discount Coupons & Offers
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Create promotional voucher codes, percentage discounts, minimum cart rules, and manage live activation.
        </p>
      </div>

      <CouponManager initialCoupons={rows} />
    </div>
  );
}
