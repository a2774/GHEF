import { asc } from "drizzle-orm";

import { BannerManager } from "@/components/admin/banner-manager";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { banners } from "@/server/db/schema";

export const instant = false;

export default async function AdminBannersPage() {
  await requireAdmin("admin");
  const rows = await withDbRetry(async () =>
    db.select().from(banners).orderBy(asc(banners.position), asc(banners.id)),
  );

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Storefront Promotional Banners
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Control homepage hero banners, promotional notices, and landing page campaign highlights.
        </p>
      </div>

      <BannerManager initialBanners={rows} />
    </div>
  );
}
