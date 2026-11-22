import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { describeDbError } from "@/lib/db-error";
import { sectionTop } from "@/lib/section-spacing";
import { type CatalogFilters, emptyFilters, listCatalogProducts } from "@/server/services/catalog";

import { ProductCard } from "./product-card";
import { SectionHeading } from "./section-heading";

export function ProductRailSkeleton() {
  return (
    <div className={`mx-auto max-w-7xl px-4 ${sectionTop} sm:px-6 lg:px-8`}>
      <div className="mx-auto h-10 w-64 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="aspect-[3/4] animate-pulse bg-muted motion-reduce:animate-none" />
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
      <div className={`mx-auto max-w-7xl px-4 ${sectionTop} sm:px-6 lg:px-8`}>
        <SectionHeading>{title}</SectionHeading>
        {subtitle && <p className="mx-auto mt-3 max-w-xl text-center text-lg text-muted-foreground">{subtitle}</p>}
      </div>
      <ul className="no-scrollbar mx-auto mt-6 flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:px-8">
        {products.map((product) => (
          <li key={product.id} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-auto">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
      <div className="mt-5 text-center">
        {/* The padding makes the tap area 44px high; the negative margin keeps the layout as it was. */}
        <Link href={href} prefetch className="-my-2 inline-block px-3 py-2 text-lg underline underline-offset-4 hover:opacity-70">
          View all
        </Link>
      </div>
    </section>
  );
}
