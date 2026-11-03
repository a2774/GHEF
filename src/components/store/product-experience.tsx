"use client";

import { Heart, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { formatPaise, formatRupeeAmount } from "@/lib/format";
import { removeFromWishlist } from "@/server/actions/cart";
import type { ProductDetail } from "@/server/services/products";
import type { ProductTabsText } from "@/server/services/settings";

import { useAuth } from "./auth-provider";
import { AvailableOffers, type OfferCard } from "./available-offers";
import { DeliveryTimeline } from "./delivery-timeline";
import { ProductGallery } from "./product-gallery";
import { RugIllustration, rugPaletteFor, rugSwatch } from "./rug-illustration";
import { StockAlertForm } from "./stock-alert-form";
import { TrustBadges } from "./trust-badges";

export type PurchaseInfo = {
  /** Coupons first, then the automatic offers. */
  offers: OfferCard[];
  /** Extra discount for paying online; 0 hides the line under the cart button. */
  prepaidPercent: number;
  readyDispatchDays: number;
  madeToOrderDays: number;
  transitDays: number;
  codEnabled: boolean;
  shippingPaise: number;
  /** Admin text for the Shipping, Return Policies and care sections. */
  tabs: ProductTabsText;
  /** Admin brand name, or the site name when blank. */
  brandName: string;
};

const galleryViews = ["Full carpet", "Close up", "In a room"] as const;
type GalleryView = (typeof galleryViews)[number];

function GalleryImage({
  view,
  color,
  medallion,
  sizes,
}: {
  view: GalleryView;
  color: string;
  medallion: boolean;
  sizes: string;
}) {
  if (view === "In a room") {
    return (
      <Image
        src="/images/hero-living-room.jpg"
        alt="Carpet styled in a living room"
        fill
        sizes={sizes}
        className="object-cover"
      />
    );
  }
  return (
    <div className="flex size-full items-center justify-center">
      <RugIllustration
        palette={rugPaletteFor(color)}
        medallion={medallion}
        viewBox={view === "Close up" ? "110 230 380 380" : undefined}
        className={view === "Close up" ? "size-full" : "h-5/6 drop-shadow-xl"}
      />
    </div>
  );
}

export function ProductExperience({ product, purchase }: { product: ProductDetail; purchase: PurchaseInfo }) {
  const { requireLogin, wishlistIds, refreshCustomerState } = useAuth();
  const colors = [...new Set(product.variants.map(({ color }) => color))];
  const sizes = [...new Set(product.variants.map(({ size }) => size))];
  const medallion = product.category === "Hand Knotted";

  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(sizes[0]);
  const [view, setView] = useState<GalleryView>("Full carpet");
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const wishlisted = wishlistIds.includes(product.id);

  const variant = product.variants.find(
    (candidate) => candidate.color === color && candidate.size === size,
  );
  const soldOut = !variant || variant.stock === 0;
  const discount =
    variant && variant.mrpPaise > variant.pricePaise
      ? Math.round(((variant.mrpPaise - variant.pricePaise) / variant.mrpPaise) * 100)
      : 0;
  const sizesForColor = new Set(
    product.variants.filter((candidate) => candidate.color === color).map(({ size }) => size),
  );

  function selectColor(option: string) {
    const available = product.variants.filter((candidate) => candidate.color === option);
    setColor(option);
    if (!available.some((candidate) => candidate.size === size)) setSize(available[0].size);
    setQuantity(1);
  }

  function handleBuy(then?: string) {
    if (!variant) return;
    startTransition(() =>
      requireLogin({ type: "add-to-cart", variantId: variant.id, quantity, then }),
    );
  }

  function handleWishlist() {
    startTransition(async () => {
      if (!wishlisted) {
        await requireLogin({ type: "add-to-wishlist", productId: product.id });
        return;
      }
      await removeFromWishlist(product.id);
      await refreshCustomerState();
    });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:pb-16">
      {/* Photos stay in view while the details column scrolls, so no empty space shows under them. */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        {product.images.length > 0 ? (
          <ProductGallery images={product.images} title={product.title} />
        ) : (
          <>
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <GalleryImage view={view} color={color} medallion={medallion} sizes="(min-width: 1024px) 60vw, 100vw" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {galleryViews.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Show ${option.toLowerCase()}`}
                  aria-pressed={view === option}
                  onClick={() => setView(option)}
                  className="relative aspect-[4/5] overflow-hidden bg-muted outline-offset-0 transition-opacity hover:opacity-80 aria-pressed:outline-1 aria-pressed:outline-[#111]"
                >
                  <GalleryImage view={option} color={color} medallion={medallion} sizes="20vw" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="min-w-0">
        {(product.isReadyToDispatch || product.isBestseller) && (
          <p className="mb-2 flex flex-wrap items-center gap-2 text-lg text-muted-foreground">
            {product.isReadyToDispatch && (
              <span className="rounded-full bg-muted px-3 py-0.5 text-sm text-foreground">Ready to ship</span>
            )}
            {product.isBestseller && (
              <span className="rounded-full bg-muted px-3 py-0.5 text-sm text-foreground">Bestseller</span>
            )}
          </p>
        )}
        <h1 className="text-[1.6rem] leading-snug font-semibold tracking-normal text-balance text-[#111] sm:text-3xl">
          {product.title}
        </h1>
        <p className="mt-1.5 text-sm">
          <Link href="/our-store" className="text-[#007185] hover:text-[#c7511f] hover:underline">
            Brand: {purchase.brandName}
          </Link>
        </p>
        {variant ? (
          <div className="mt-5">
            <p className="flex items-start gap-2 leading-none">
              {discount > 0 && (
                <span className="mt-1 text-2xl font-light text-[#cc0c39]">-{discount}%</span>
              )}
              <span className="flex items-start text-[#0f1111]">
                <span className="mt-1 text-base">₹</span>
                <span className="text-[2rem] font-normal tabular-nums">{formatRupeeAmount(variant.pricePaise)}</span>
              </span>
            </p>
            {discount > 0 && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                M.R.P.: <s>{formatPaise(variant.mrpPaise)}</s>
              </p>
            )}
          </div>
        ) : (
          <p className="mt-4 text-2xl">Unavailable</p>
        )}
        <p className="mt-1.5 text-sm text-[#555]">
          Inclusive of all taxes.{" "}
          {purchase.shippingPaise === 0
            ? "Free delivery in India."
            : `Delivery ${formatPaise(purchase.shippingPaise)} per order.`}
        </p>

        <fieldset className="mt-6">
          <legend className="text-[0.95rem] font-semibold text-[#111]">
            Colour: <span className="font-normal text-[#555] capitalize">{color}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={color === option}
                onClick={() => selectColor(option)}
                className="flex h-9 items-center gap-2 rounded-[3px] border border-[#ddd] bg-white px-3 text-[0.95rem] text-[#555] capitalize transition-colors hover:border-[#111] aria-pressed:border-[#111] aria-pressed:bg-[#f5f5f5] aria-pressed:text-[#111]"
              >
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: rugSwatch(option) }}
                  className="size-4 rounded-full border border-[#ddd]"
                />
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-[0.95rem] font-semibold text-[#111]">
            Size: <span className="font-normal text-[#555]">{size}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={size === option}
                disabled={!sizesForColor.has(option)}
                onClick={() => {
                  setSize(option);
                  setQuantity(1);
                }}
                className="h-9 min-w-14 rounded-[3px] border border-[#ddd] bg-white px-4 text-[0.95rem] text-[#555] transition-colors hover:border-[#111] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#ddd] aria-pressed:border-[#111] aria-pressed:bg-[#f5f5f5] aria-pressed:text-[#111]"
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <AvailableOffers offers={purchase.offers} />

        <div className="mt-4 flex gap-3">
          <div className="flex h-12 shrink-0 items-center rounded-[6px] border border-[#ddd] bg-white">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={soldOut || quantity <= 1}
              onClick={() => setQuantity(quantity - 1)}
              className="flex h-full w-10 items-center justify-center rounded-l-[6px] transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Minus className="size-4" />
            </button>
            <span aria-live="polite" aria-label={`Quantity ${quantity}`} className="w-8 text-center text-lg tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={soldOut || quantity >= Math.min(variant?.stock ?? 1, 50)}
              onClick={() => setQuantity(quantity + 1)}
              className="flex h-full w-10 items-center justify-center rounded-r-[6px] transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Plus className="size-4" />
            </button>
          </div>
          {soldOut ? (
            <p
              role="status"
              className="flex h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[6px] bg-[#444] text-sm font-medium tracking-wide text-white uppercase"
            >
              Sold out
              {purchase.prepaidPercent > 0 && (
                <span className="text-[0.7rem] font-medium tracking-wide opacity-90">
                  Extra {purchase.prepaidPercent}% discount on prepaid
                </span>
              )}
            </p>
          ) : (
            <Button
              type="button"
              disabled={pending}
              onClick={() => handleBuy()}
              className="h-12 min-w-0 flex-1 flex-col gap-0.5 rounded-[6px] bg-[#111] text-sm font-medium tracking-wide text-white uppercase hover:bg-[#333]"
            >
              Add to cart
              {purchase.prepaidPercent > 0 && (
                <span className="text-[0.7rem] font-medium tracking-wide opacity-90">
                  Extra {purchase.prepaidPercent}% discount on prepaid
                </span>
              )}
            </Button>
          )}
        </div>
        {!soldOut && variant.stock <= 3 && (
          <p className="mt-2 text-base text-muted-foreground">Only {variant.stock} left</p>
        )}

        <div className="mt-3 flex gap-3">
          {!soldOut && (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleBuy("/cart")}
              className="h-12 min-w-0 flex-1 rounded-[6px] border-[#111] text-[0.8rem] font-semibold tracking-wide text-[#111] uppercase"
            >
              Buy now
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            disabled={pending}
            onClick={handleWishlist}
            className={soldOut ? "h-12 flex-1 rounded-[6px] border-[#ddd] bg-white text-sm text-[#111]" : "size-12 rounded-[6px] border-[#ddd] bg-white"}
          >
            <Heart className={wishlisted ? "fill-current" : undefined} />
            {soldOut && (wishlisted ? "Saved to wishlist" : "Add to wishlist")}
          </Button>
        </div>

        {soldOut && variant && (
          <div className="mt-4">
            <StockAlertForm key={variant.id} variantId={variant.id} label={`${color}, ${size}`} />
          </div>
        )}

        <div className="mt-4">
          <DeliveryTimeline
            readyToShip={product.isReadyToDispatch && !soldOut}
            dispatchDays={product.isReadyToDispatch && !soldOut ? purchase.readyDispatchDays : purchase.madeToOrderDays}
            transitDays={purchase.transitDays}
          />
        </div>

        <TrustBadges freeShipping={purchase.shippingPaise === 0} />
      </div>

      {!soldOut && variant && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base text-muted-foreground">{size}</p>
              <p className="text-lg font-semibold">{formatPaise(variant.pricePaise * quantity)}</p>
            </div>
            <Button
              type="button"
              disabled={pending}
              onClick={() => handleBuy()}
              className="h-12 rounded-full px-8 text-base"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
