import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { describeDbError } from "@/lib/db-error";
import { type CatalogFilters, emptyFilters, listCatalogProducts } from "@/server/services/catalog";

import { ProductCard } from "./product-card";

export function ProductRailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-32">
      <div className="h-12 w-64 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}

// Throws on failure so a database error is never cached as an empty rail.
async function loadRail(filters: Partial<CatalogFilters>, limit: number, excludeSlug?: string) {
  "use cache";
  cacheTag("products");
  cacheLife("hours");

  const { products } = await listCatalogProducts(
    emptyFilters({ ...filters, limit: limit + (excludeSlug ? 1 : 0) }),
  );
  return products.filter(({ slug }) => slug !== excludeSlug).slice(0, limit);
}

/**
 * A titled row of products. Scrolls sideways on phones, four across on desktop.
 * Renders nothing when no product matches, so empty collections stay hidden.
 */
export async function ProductRail({
  id,
  title,
  subtitle,
  href,
  filters,
  limit = 8,
  excludeSlug,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  href: string;
  filters: Partial<CatalogFilters>;
  limit?: number;
  excludeSlug?: string;
}) {
  let products: Awaited<ReturnType<typeof loadRail>> = [];
  try {
    products = await loadRail(filters, limit, excludeSlug);
  } catch (error) {
    console.error(`Could not load the "${title}" rail: ${describeDbError(error)}`);
  }
  if (products.length === 0) return null;

  return (
    <section id={id} className="scroll-mt-32">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-32">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-title font-semibold">{title}</h2>
            {subtitle && <p className="mt-3 max-w-xl text-lg text-muted-foreground">{subtitle}</p>}
          </div>
          <Link href={href} className="pb-2 text-lg whitespace-nowrap underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
      </div>
      <ul className="no-scrollbar mx-auto mt-12 flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-8">
        {products.map((product) => (
          <li key={product.id} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-auto">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
