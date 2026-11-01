import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";

import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    sort: sort in catalogSorts ? (sort as CatalogSort) : "newest",
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
    <label className="block text-base font-medium">
      {label}
      <select name={name} defaultValue={value} className={`mt-1.5 ${selectClass}`}>
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

async function Catalog({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const [{ products, total }, options] = await Promise.all([
    listCatalogProducts(filters),
    getCatalogOptions(),
  ]);

  const parents = options.categories.filter(({ parentId }) => parentId === null);
  const categoryOptions = parents.flatMap((parent) => [
    { value: parent.slug, label: parent.name },
    ...options.categories
      .filter(({ parentId }) => parentId === parent.id)
      .map(({ slug, name }) => ({ value: slug, label: `- ${name}` })),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / catalogPageSize));

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
      <details className="rounded-2xl bg-muted p-4 lg:self-start" open>
        <summary className="cursor-pointer font-heading text-xl font-semibold tracking-tight lg:hidden">
          Filters
        </summary>
        <Form action="/products" className="mt-4 space-y-4 lg:mt-0">
          <input type="hidden" name="q" value={filters.q} />
          <OptionSelect name="category" label="Category" value={filters.category} options={categoryOptions} />
          <OptionSelect
            name="material"
            label="Material"
            value={filters.material}
            options={options.materials.map((value) => ({ value, label: value }))}
          />
          <OptionSelect
            name="color"
            label="Colour"
            value={filters.color}
            options={options.colors.map((value) => ({ value, label: value }))}
          />
          <OptionSelect
            name="size"
            label="Size"
            value={filters.size}
            options={options.sizes.map((value) => ({ value, label: value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-base font-medium">
              Min ₹
              <Input name="min" type="number" min="0" defaultValue={text(params, "min")} className="mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base" />
            </label>
            <label className="block text-base font-medium">
              Max ₹
              <Input name="max" type="number" min="0" defaultValue={text(params, "max")} className="mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base" />
            </label>
          </div>
          <label className="flex items-center gap-2 text-base">
            <input type="checkbox" name="inStock" defaultChecked={filters.inStock} className="size-5" />
            In stock only
          </label>
          <label className="block text-base font-medium">
            Sort by
            <select name="sort" defaultValue={filters.sort} className={`mt-1.5 ${selectClass}`}>
              {Object.entries(catalogSorts).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" className="h-12 w-full rounded-full text-base">
            Apply
          </Button>
          <Link href="/products" className="block text-center text-base underline-offset-4 hover:underline">
            Clear all
          </Link>
        </Form>
      </details>

      <div>
        <p className="text-lg text-muted-foreground">
          {total} {total === 1 ? "product" : "products"}
          {filters.q && ` for "${filters.q}"`}
        </p>
        {products.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-muted p-10 text-center">
            <p className="font-heading text-2xl font-semibold tracking-tight">No products match.</p>
            <Link href="/products" className="mt-2 inline-block text-lg underline underline-offset-4">
              View all products
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
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
  );
}

export default function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32">
      <h1 className="text-title font-semibold">All products.</h1>
      <div className="mt-8">
        <Suspense
          fallback={
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Loading products">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />
              ))}
            </div>
          }
        >
          <Catalog searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
