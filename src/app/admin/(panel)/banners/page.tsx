import { BannerManager } from "@/components/admin/banner-manager";
import { requireAdmin } from "@/server/auth/admin-session";
import { listAdminBanners } from "@/server/services/admin";

export const instant = false;

export default async function AdminBannersPage() {
  await requireAdmin("admin");
  const rows = await listAdminBanners();

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
