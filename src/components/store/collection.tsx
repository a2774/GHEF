import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { getFeaturedProducts } from "@/server/services/products";

import { ProductCard } from "./product-card";

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
