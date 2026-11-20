import { Star } from "lucide-react";
import Link from "next/link";

import { poppinsClass } from "@/lib/fonts/poppins";
import { formatPriceTag } from "@/lib/format";

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
  primaryImageId: string | null;
  /** Average of the approved reviews, and how many there are. No reviews means no stars. */
  rating?: number | null;
  reviewCount?: number;
};

function StarRow({ className }: { className: string }) {
  return (
    <span className="flex w-max gap-0.5">
      {[0, 1, 2, 3, 4].map((item) => (
        <Star key={item} aria-hidden="true" className={`size-3.5 shrink-0 ${className}`} />
      ))}
    </span>
  );
}

/** Orange stars over grey ones, filled to the rating, so 4.5 shows four and a half. */
function Rating({ rating, count }: { rating: number; count: number }) {
  const filled = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span
      role="img"
      aria-label={`Rated ${rating.toFixed(1)} out of 5 from ${count} ${count === 1 ? "review" : "reviews"}`}
      className="relative mt-1.5 flex w-max"
    >
      <StarRow className="fill-[#d9d9d9] text-[#d9d9d9]" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${filled}%` }}>
        <StarRow className="fill-[#f5a623] text-[#f5a623]" />
      </span>
    </span>
  );
}

/**
 * `headingAs` is the level of the product name. On a row under a section heading it is the default
 * h3; on a page where the cards come straight after the page title (the products page) it is h2,
 * so the headings never skip a level.
 */
export function ProductCard({
  product,
  headingAs: Heading = "h3",
  priority = false,
}: {
  product: ProductCardData;
  headingAs?: "h2" | "h3";
  /** For the first cards of a page, which are on screen when it opens: their photo is not lazy-loaded. */
  priority?: boolean;
}) {
  const { priceFromPaise: price, mrpFromPaise: mrp, rating, reviewCount = 0 } = product;
  const discount = price !== null && mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    // prefetch: the product page is cached, so loading it before the click is cheap and makes it open instantly.
    <Link href={`/products/${product.slug}`} prefetch className={`group block ${poppinsClass}`}>
      <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-muted">
        {product.primaryImageId ? (
          <ProductPhoto
            publicId={product.primaryImageId}
            alt={product.title}
            sizes="(min-width: 1024px) 25vw, 50vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <RugIllustration
            palette={rugPaletteFor(product.color)}
            medallion={product.category === "Hand Knotted"}
            priority={priority}
            className="w-2/3 drop-shadow-lg transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
          />
        )}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 rounded-[3px] bg-[#333]/90 px-2 py-1 text-xs leading-none font-semibold text-white">
            -{discount}%
          </span>
        )}
      </div>
      <Heading className="mt-3 line-clamp-2 text-base leading-snug font-medium text-[#111]">{product.title}</Heading>
      {rating && reviewCount > 0 ? <Rating rating={rating} count={reviewCount} /> : null}
      {price !== null && (
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-base">
          <span className={`font-semibold ${discount > 0 ? "text-[#cc0c39]" : "text-[#111]"}`}>
            {formatPriceTag(price)}
          </span>
          {discount > 0 && mrp ? <s className="text-sm text-[#666]">{formatPriceTag(mrp)}</s> : null}
        </p>
      )}
      {product.stock === 0 && <p className="mt-1 text-sm text-destructive">Out of stock</p>}
    </Link>
  );
}
