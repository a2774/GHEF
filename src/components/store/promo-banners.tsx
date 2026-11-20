import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { describeDbError } from "@/lib/db-error";
import { sectionTop } from "@/lib/section-spacing";
import { getActiveBanners } from "@/server/services/settings";

// Throws on failure so a database error is never cached as "no banners".
async function loadBanners() {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");
  return getActiveBanners();
}

export async function PromoBanners() {
  // If the database is slow or down, the banners are left out instead of breaking the whole page.
  let banners: Awaited<ReturnType<typeof loadBanners>> = [];
  try {
    banners = await loadBanners();
  } catch (error) {
    console.error(`Could not load the banners: ${describeDbError(error)}`);
    return null;
  }
  if (banners.length === 0) return null;

  return (
    <section aria-label="Offers">
      <div className={`mx-auto grid max-w-7xl gap-4 px-4 ${sectionTop} sm:px-6 md:grid-cols-2 lg:px-8`}>
        {banners.map((banner) => (
          <Link key={banner.id} href={banner.linkUrl} className="rounded-3xl bg-ink p-8 text-primary-foreground transition-opacity hover:opacity-90">
            <h2 className="text-3xl font-semibold tracking-tight">{banner.title}</h2>
            {banner.subtitle && <p className="mt-2 text-lg text-white/75">{banner.subtitle}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
