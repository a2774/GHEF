import Link from "next/link";

import { formatPaise } from "@/lib/format";

import { ProductPhoto } from "./product-photo";
import { RugIllustration, rugPaletteFor } from "./rug-illustration";

type ProductCardData = {
  title: string;
  slug: string;
  color: string;
  category: string;
  priceFromPaise: number | null;
  mrpFromPaise?: number | null;
  stock?: number;
  isBestseller?: boolean;
  isReadyToDispatch?: boolean;
  primaryImageId: string | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { priceFromPaise: price, mrpFromPaise: mrp } = product;
  const discount = price !== null && mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    // prefetch: the product page is cached, so loading it before the click is cheap and makes it open instantly.
    <Link href={`/products/${product.slug}`} prefetch className="group">
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
        {discount > 0 && (
          <span className="liquid-glass absolute top-3 left-3 rounded-full px-3 py-1 text-sm text-primary-foreground">
            {discount}% off
          </span>
        )}
        {(product.isReadyToDispatch || product.isBestseller) && (
          <span className="absolute top-3 right-3 rounded-full bg-background/90 px-3 py-1 text-sm text-foreground">
            {product.isReadyToDispatch ? "Ready to ship" : "Bestseller"}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{product.title}</h3>
      <p className="mt-1 text-lg text-muted-foreground">
        {price !== null && `From ${formatPaise(price)}`}
        {discount > 0 && mrp && <s className="ml-2 text-base">{formatPaise(mrp)}</s>}
      </p>
      {product.stock === 0 && <p className="mt-1 text-base text-destructive">Out of stock</p>}
    </Link>
  );
}
