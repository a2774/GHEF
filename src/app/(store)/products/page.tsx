import { ChevronDown, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";

import { CatalogSkeleton } from "@/components/store/catalog-skeleton";
import { ClearFiltersLink } from "@/components/store/clear-filters-link";
import { FilterFields, FilterForm } from "@/components/store/filter-form";
import { PriceRange } from "@/components/store/price-range";
import { ProductCard } from "@/components/store/product-card";
import { ProductListing } from "@/components/store/product-listing";
import { ReadMore } from "@/components/store/read-more";
import { ROOM_PAGES, ROOMS, type RoomSlug, roomSlugs } from "@/lib/catalog-taxonomy";
import { poppinsClass } from "@/lib/fonts/poppins";
import {
  catalogPageSize,
  type CatalogFilters,
  type CatalogSort,
  catalogSorts,
  getCatalogOptions,
  listCatalogProducts,
} from "@/server/services/catalog";

export const metadata: Metadata = {
  title: "All products | Ganga Handmade Export",
  description: "Browse handmade carpets, rugs, doormats and home decor.",
  alternates: { canonical: "/products" },
};

type SearchParams = Record<string, string | string[] | undefined>;

const selectClass = "h-11 w-full rounded-xl border border-input bg-card px-3 text-base";

function text(params: SearchParams, key: string) {
  const value = params[key];
  return typeof value === "string" ? value.trim().slice(0, 100) : "";
}

function rupeesToPaise(value: string) {
  const rupees = Number(value);
  return value && Number.isFinite(rupees) && rupees >= 0 ? Math.round(rupees * 100) : undefined;
}

function parseFilters(params: SearchParams): CatalogFilters {
  const sort = text(params, "sort");
  const page = Number.parseInt(text(params, "page"), 10);
  return {
    q: text(params, "q"),
    category: text(params, "category"),
    material: text(params, "material"),
    color: text(params, "color"),
    size: text(params, "size"),
    minPaise: rupeesToPaise(text(params, "min")),
    maxPaise: rupeesToPaise(text(params, "max")),
    inStock: text(params, "inStock") === "on",
    outOfStock: text(params, "outOfStock") === "on",
    room: roomSlugs.includes(text(params, "room")) ? text(params, "room") : "",
    readyToDispatch: text(params, "ready") === "on",
    onSale: text(params, "sale") === "on",
    bestsellersOnly: text(params, "bestseller") === "on",
    sort: sort in catalogSorts ? (sort as CatalogSort) : "featured",
    page: page > 0 ? page : 1,
  };
}

function pageHref(params: SearchParams, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && value && key !== "page") query.set(key, value);
  }
  query.set("page", String(page));
  return `/products?${query}`;
}

/** A filter group with a title and an arrow, which opens and closes without any script. */
function FilterSection({ title, open = false, children }: { title: string; open?: boolean; children: ReactNode }) {
  return (
    <details open={open} className="group border-b border-[#e3ddd2] py-5 first:pt-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-xl font-semibold text-[#111] [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown aria-hidden="true" className="size-5 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-4 space-y-3">{children}</div>
    </details>
  );
}

function CheckRow({ name, label, checked, count }: { name: string; label: string; checked: boolean; count?: number }) {
  return (
    <label className="relative flex cursor-pointer items-center justify-between gap-3 text-base text-[#333] after:absolute after:inset-x-0 after:-inset-y-2.5 after:content-['']">
      <span className="flex items-center gap-3">
        <input type="checkbox" name={name} defaultChecked={checked} className="size-5 accent-[#111]" />
        {label}
      </span>
      {count !== undefined && <span className="text-[#666]">({count})</span>}
    </label>
  );
}

function OptionSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select name={name} aria-label={label} defaultValue={value} className={selectClass}>
      <option value="">All</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

// Listings are the same for every shopper, so they are cached and refreshed when products change.
async function loadProducts(filters: CatalogFilters) {
  "use cache";
  cacheTag("products");
  cacheLife("minutes");
  return listCatalogProducts(filters);
}

async function loadOptions() {
  "use cache";
  cacheTag("products");
  cacheLife("hours");
  return getCatalogOptions();
}

async function Catalog({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [{ products, total, inStockCount, outOfStockCount }, options] = await Promise.all([
    loadProducts(filters),
    loadOptions(),
  ]);

  const parents = options.categories.filter(({ parentId }) => parentId === null);
  const categoryOptions = parents.flatMap((parent) => [
    { value: parent.slug, label: parent.name },
    ...options.categories
      .filter(({ parentId }) => parentId === parent.id)
      .map(({ slug, name }) => ({ value: slug, label: `- ${name}` })),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / catalogPageSize));
  // Opened from a room or collection card with nothing in it yet, rather than a search that found nothing.
  const onlyHas = (allowed: string) =>
    Object.entries(params).every(([key, value]) => key === allowed || key === "sort" || key === "page" || !value);
  const roomOnly = Boolean(filters.room) && onlyHas("room");
  const categoryOnly = Boolean(filters.category) && onlyHas("category");

  const categoryName = options.categories.find(({ slug }) => slug === filters.category)?.name;
  // A collection card can point at a category the shop does not have yet, such as "dari".
  const unknownCategory =
    filters.category && !categoryName
      ? filters.category.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
      : "";

  // A room opened from a "Shop by room" card gets its own title and description.
  const roomPage = filters.room ? ROOM_PAGES[filters.room as RoomSlug] : undefined;
  const title =
    roomPage?.title ||
    (categoryName && `${categoryName} carpets`) ||
    (unknownCategory && `${unknownCategory} carpets`) ||
    (filters.readyToDispatch && "Ready to dispatch") ||
    (filters.onSale && "On sale") ||
    (filters.bestsellersOnly && "Bestsellers") ||
    (filters.color && `${filters.color} carpets`) ||
    "All products";
  const intro =
    roomPage?.intro ||
    (filters.readyToDispatch ? "Pieces in stock at our workshop, packed and shipped within a working day or two." : "");

  // The top of the price slider, rounded up to a whole hundred rupees.
  const priceBound = Math.ceil(options.maxPricePaise / 10_000) * 100;
  const summary = `There ${total === 1 ? "is" : "are"} ${total} ${total === 1 ? "result" : "results"} in total${
    filters.q ? ` for "${filters.q}"` : ""
  }`;
  // The filter boxes start from the address once, so a new address needs fresh boxes.
  const fieldsKey = JSON.stringify(params);

  return (
    <>
      <h1 className="text-4xl leading-tight font-medium tracking-tight text-[#111] sm:text-5xl">{title}</h1>
      {intro && <ReadMore>{intro}</ReadMore>}
      <nav aria-label="Breadcrumb" className="mt-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-base text-[#333]">
          <li>
            <Link href="/" className="font-medium text-[#111] hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4 text-[#666]" />
          </li>
          <li aria-current="page" className="text-[#555]">
            {title}
          </li>
        </ol>
      </nav>

      <FilterForm>
        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
          <details className="lg:self-start" open>
            <summary className="cursor-pointer text-xl font-semibold tracking-tight lg:hidden">Filters</summary>
            <FilterFields key={fieldsKey}>
              <input type="hidden" name="q" value={filters.q} />
              <FilterSection title="Availability" open>
                <CheckRow name="inStock" label="In stock" checked={filters.inStock} count={inStockCount} />
                <CheckRow name="outOfStock" label="Out of stock" checked={Boolean(filters.outOfStock)} count={outOfStockCount} />
              </FilterSection>
              {priceBound > 0 && (
                <FilterSection title="Price" open>
                  <PriceRange
                    bound={priceBound}
                    min={filters.minPaise === undefined ? undefined : filters.minPaise / 100}
                    max={filters.maxPaise === undefined ? undefined : filters.maxPaise / 100}
                  />
                </FilterSection>
              )}
              <FilterSection title="Category" open={Boolean(filters.category)}>
                <OptionSelect name="category" label="Category" value={filters.category} options={categoryOptions} />
              </FilterSection>
              <FilterSection title="Room" open={Boolean(filters.room)}>
                <OptionSelect
                  name="room"
                  label="Room"
                  value={filters.room ?? ""}
                  options={ROOMS.map(({ slug, name }) => ({ value: slug, label: name }))}
                />
              </FilterSection>
              <FilterSection title="Material" open={Boolean(filters.material)}>
                <OptionSelect
                  name="material"
                  label="Material"
                  value={filters.material}
                  options={options.materials.map((value) => ({ value, label: value }))}
                />
              </FilterSection>
              <FilterSection title="Colour" open={Boolean(filters.color)}>
                <OptionSelect
                  name="color"
                  label="Colour"
                  value={filters.color}
                  options={options.colors.map((value) => ({ value, label: value }))}
                />
              </FilterSection>
              <FilterSection title="Size" open={Boolean(filters.size)}>
                <OptionSelect
                  name="size"
                  label="Size"
                  value={filters.size}
                  options={options.sizes.map((value) => ({ value, label: value }))}
                />
              </FilterSection>
              <FilterSection title="More" open={Boolean(filters.readyToDispatch || filters.onSale || filters.bestsellersOnly)}>
                <CheckRow name="ready" label="Ready to dispatch" checked={Boolean(filters.readyToDispatch)} />
                <CheckRow name="sale" label="On sale" checked={Boolean(filters.onSale)} />
                <CheckRow name="bestseller" label="Bestsellers" checked={Boolean(filters.bestsellersOnly)} />
              </FilterSection>
              {/* Filters apply by themselves; this keeps the Enter key working. */}
              <button type="submit" className="sr-only">
                Apply filters
              </button>
            </FilterFields>
            <div className="mt-5">
              <ClearFiltersLink />
            </div>
          </details>

          <div>
            <ProductListing
              summary={summary}
              sort={
                <FilterFields key={fieldsKey}>
                  <span className="relative inline-flex items-center">
                    <select
                      name="sort"
                      aria-label="Sort by"
                      defaultValue={filters.sort}
                      data-default="featured"
                      className="cursor-pointer appearance-none bg-transparent py-1 pr-6 font-medium text-[#111] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    >
                      {Object.entries(catalogSorts).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 size-4" />
                  </span>
                </FilterFields>
              }
              empty={
                products.length === 0 ? (
                  <div className="mt-6 rounded-3xl bg-muted p-10 text-center">
                    <p className="text-2xl font-semibold tracking-tight">
                      {roomOnly
                        ? "We are adding carpets for this room soon."
                        : categoryOnly
                          ? "We are adding carpets to this collection soon."
                          : "No products match."}
                    </p>
                    <Link href="/products" className="mt-2 inline-block text-lg underline underline-offset-4">
                      View all products
                    </Link>
                  </div>
                ) : undefined
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} headingAs="h2" />
              ))}
            </ProductListing>
            {pageCount > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-between text-lg">
                {filters.page > 1 ? <Link href={pageHref(params, filters.page - 1)}>Previous</Link> : <span />}
                <span className="text-muted-foreground">
                  Page {filters.page} of {pageCount}
                </span>
                {filters.page < pageCount ? <Link href={pageHref(params, filters.page + 1)}>Next</Link> : <span />}
              </nav>
            )}
          </div>
        </div>
      </FilterForm>
    </>
  );
}

export default function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <main className={`mx-auto w-full max-w-7xl px-4 pt-36 pb-20 sm:px-6 lg:px-8 lg:pt-40 ${poppinsClass}`}>
      <div>
        <Suspense fallback={<CatalogSkeleton />}>
          <Catalog searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
