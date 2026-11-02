import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { getFeaturedProducts } from "@/server/services/products";

import { ProductCard } from "./product-card";

export function CollectionSkeleton() {
  return (
    <section id="collection" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <h2 className="text-title font-semibold">The collection.</h2>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-[4/5] rounded-3xl bg-muted" />
              <div className="mt-4 h-6 w-3/4 rounded-md bg-muted" />
              <div className="mt-2 h-5 w-1/3 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function Collection() {
  "use cache";
  cacheTag("products");
  cacheLife("hours");

  const products = await getFeaturedProducts();

  return (
    <section id="collection" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-title font-semibold">The collection.</h2>
          <Link href="/products" className="pb-2 text-lg whitespace-nowrap underline-offset-4 hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
