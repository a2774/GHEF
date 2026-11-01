import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { getActiveBanners } from "@/server/services/settings";

export async function PromoBanners() {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");

  const banners = await getActiveBanners();
  if (banners.length === 0) return null;

  return (
    <section aria-label="Offers">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 pt-20 sm:px-6 md:grid-cols-2 lg:px-8 lg:pt-32">
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
