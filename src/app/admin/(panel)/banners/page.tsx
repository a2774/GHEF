import { asc } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBanner, deleteBanner, toggleBanner } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { banners } from "@/server/db/schema";

const fieldClass = "mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base";

export default async function AdminBannersPage() {
  await requireAdmin("admin");
  const rows = await withDbRetry(async () =>
    db.select().from(banners).orderBy(asc(banners.position), asc(banners.id)),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Banners</h1>
      <form action={createBanner} className="grid gap-4 rounded-2xl bg-muted p-5 sm:grid-cols-2">
        <label className="block text-base font-medium">
          Title
          <Input name="title" required maxLength={80} className={fieldClass} />
        </label>
        <label className="block text-base font-medium">
          Subtitle
          <Input name="subtitle" maxLength={160} className={fieldClass} />
        </label>
        <label className="block text-base font-medium">
          Link (site path)
          <Input name="linkUrl" required placeholder="/products?category=jute" className={fieldClass} />
        </label>
        <label className="block text-base font-medium">
          Order
          <Input name="position" type="number" min="0" defaultValue="0" className={fieldClass} />
        </label>
        <Button type="submit" className="h-11 w-fit rounded-full px-8 text-base">
          Add banner
        </Button>
      </form>

      <ul className="rounded-2xl bg-card">
        {rows.length === 0 && <li className="p-6 text-lg text-muted-foreground">No banners yet.</li>}
        {rows.map((banner) => (
          <li key={banner.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-base first:border-t-0">
            <span>
              <strong>{banner.title}</strong>
              <span className="ml-2 text-muted-foreground">{banner.linkUrl}</span>
            </span>
            <span className="flex gap-2">
              <form action={toggleBanner.bind(null, banner.id)}>
                <Button type="submit" variant="outline" className="h-10 rounded-full px-4 text-base">
                  {banner.isActive ? "Hide" : "Show"}
                </Button>
              </form>
              <form action={deleteBanner.bind(null, banner.id)}>
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
