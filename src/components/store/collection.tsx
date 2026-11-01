import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { formatPaise } from "@/lib/format";
import { getFeaturedProducts, type ProductSummary } from "@/server/services/products";

import { ProductPhoto } from "./product-photo";
import { RugIllustration, rugPaletteFor } from "./rug-illustration";

function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-3xl bg-muted">
        {product.primaryImageId ? (
          <ProductPhoto
            publicId={product.primaryImageId}
            alt={product.title}
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <RugIllustration
            palette={rugPaletteFor(product.color)}
            medallion={product.category === "Hand Knotted"}
            className="w-2/3 drop-shadow-lg transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        )}
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{product.title}</h3>
      <p className="mt-1 text-lg text-muted-foreground">
        {product.priceFromPaise !== null && `From ${formatPaise(product.priceFromPaise)}`}
      </p>
    </Link>
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
        <h2 className="text-title font-semibold">The collection.</h2>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
