import { asc } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBanner, deleteBanner, toggleBanner } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { banners } from "@/server/db/schema";

export const instant = false;

const fieldClass = "mt-1.5 h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs shadow-2xs focus:border-[#bef264]";

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

      <form action={createBanner} className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:grid-cols-2">
        <div className="sm:col-span-2 border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900">Add New Banner</h2>
        </div>
        <label className="block text-xs font-semibold text-slate-700">
          Title
          <Input name="title" required maxLength={80} placeholder="e.g. Festival Heritage Collection" className={fieldClass} />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Subtitle
          <Input name="subtitle" maxLength={160} placeholder="e.g. Up to 20% off authentic hand-knotted wool" className={fieldClass} />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Target Link (Site Path)
          <Input name="linkUrl" required placeholder="/products?category=hand-knotted" className={fieldClass} />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Display Position
          <Input name="position" type="number" min="0" defaultValue="0" className={fieldClass} />
        </label>
        <div className="sm:col-span-2 flex justify-end pt-2">
          <Button type="submit" className="h-9 rounded-full bg-[#bef264] px-6 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] cursor-pointer">
            Publish Banner
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Active Banners ({rows.length})</span>
          <span className="text-[10px] text-slate-400">Homepage Carousel</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <li className="p-8 text-center text-xs text-slate-500">
              No promotional banners configured yet.
            </li>
          ) : (
            rows.map((banner) => (
              <li key={banner.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs transition-colors hover:bg-slate-50/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{banner.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        banner.isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {banner.isActive ? "Live" : "Draft"}
                    </span>
                  </div>
                  {banner.subtitle && <p className="mt-0.5 text-slate-600 text-xs">{banner.subtitle}</p>}
                  <p className="mt-1 font-mono text-[11px] text-slate-400">Link: {banner.linkUrl}</p>
                </div>

                <div className="flex items-center gap-2">
                  <form action={toggleBanner.bind(null, banner.id)}>
                    <Button
                      type="submit"
                      variant="outline"
                      size="xs"
                      className="rounded-full border-slate-200 hover:bg-slate-100 text-xs px-3"
                    >
                      {banner.isActive ? "Hide" : "Show"}
                    </Button>
                  </form>
                  <form action={deleteBanner.bind(null, banner.id)}>
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
