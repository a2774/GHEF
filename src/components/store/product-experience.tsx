"use client";

import { Heart, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { roomName } from "@/lib/catalog-taxonomy";
import { formatPaise } from "@/lib/format";
import { removeFromWishlist } from "@/server/actions/cart";
import type { ProductDetail } from "@/server/services/products";

import { useAuth } from "./auth-provider";
import { DeliveryTimeline } from "./delivery-timeline";
import { ProductGallery } from "./product-gallery";
import { RugIllustration, rugPaletteFor, rugSwatch } from "./rug-illustration";
import { StockAlertForm } from "./stock-alert-form";

export type PurchaseInfo = {
  offers: { title: string; detail: string }[];
  readyDispatchDays: number;
  madeToOrderDays: number;
  transitDays: number;
  codEnabled: boolean;
  shippingPaise: number;
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
  const details = [
    { label: "Material", value: product.material },
    { label: "Construction", value: product.category },
    { label: "Pile height", value: product.pileHeight },
    { label: "Backing", value: product.backing },
    { label: "Best for", value: product.rooms.map(roomName).join(", ") },
    { label: "Made in", value: "India, by hand" },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));
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
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-5 pb-20 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:gap-16 lg:px-8 lg:pb-32">
      <div>
        {product.images.length > 0 ? (
          <ProductGallery images={product.images} title={product.title} />
        ) : (
          <>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
              <GalleryImage view={view} color={color} medallion={medallion} sizes="(min-width: 1024px) 60vw, 100vw" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
              {galleryViews.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={`Show ${option.toLowerCase()}`}
                  aria-pressed={view === option}
                  onClick={() => setView(option)}
                  className="relative aspect-square overflow-hidden rounded-2xl bg-muted outline-offset-2 transition-opacity hover:opacity-80 aria-pressed:outline-2 aria-pressed:outline-primary"
                >
                  <GalleryImage view={option} color={color} medallion={medallion} sizes="20vw" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="lg:sticky lg:top-36 lg:self-start">
        <p className="flex flex-wrap items-center gap-2 text-lg text-muted-foreground">
          {product.category}
          {product.isReadyToDispatch && (
            <span className="rounded-full bg-muted px-3 py-0.5 text-sm text-foreground">Ready to ship</span>
          )}
          {product.isBestseller && (
            <span className="rounded-full bg-muted px-3 py-0.5 text-sm text-foreground">Bestseller</span>
          )}
        </p>
        <h1 className="mt-1 text-title font-semibold">{product.title}</h1>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-2xl">{variant ? formatPaise(variant.pricePaise) : "Unavailable"}</p>
          {discount > 0 && variant && (
            <>
              <s className="text-lg text-muted-foreground">{formatPaise(variant.mrpPaise)}</s>
              <span className="rounded-full bg-primary px-3 py-0.5 text-sm text-primary-foreground">
                {discount}% off
              </span>
            </>
          )}
        </div>
        <p className="mt-1 text-base text-muted-foreground">
          Inclusive of all taxes.{" "}
          {purchase.shippingPaise === 0
            ? "Free delivery in India."
            : `Delivery ${formatPaise(purchase.shippingPaise)} per order.`}
        </p>

        <fieldset className="mt-8">
          <legend className="text-base font-medium">Colour: {color}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={color === option}
                onClick={() => selectColor(option)}
                className="flex h-12 items-center gap-2.5 rounded-full border border-border px-4 text-base capitalize transition-colors hover:border-primary aria-pressed:border-primary aria-pressed:bg-muted"
              >
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: rugSwatch(option) }}
                  className="size-5 rounded-full border border-border"
                />
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-7">
          <legend className="text-base font-medium">Size</legend>
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
                className="h-12 rounded-full border border-border px-5 text-base transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        {!soldOut && (
          <div className="mt-7">
            <p className="text-base font-medium">Quantity</p>
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
                className="size-12 rounded-full"
              >
                <Minus />
              </Button>
              <span aria-live="polite" className="w-10 text-center text-lg">
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                aria-label="Increase quantity"
                disabled={quantity >= Math.min(variant.stock, 50)}
                onClick={() => setQuantity(quantity + 1)}
                className="size-12 rounded-full"
              >
                <Plus />
              </Button>
              {variant.stock <= 3 && (
                <span className="ml-2 text-base text-muted-foreground">Only {variant.stock} left</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-[1fr_auto] gap-2">
          <Button
            type="button"
            disabled={soldOut || pending}
            onClick={() => handleBuy()}
            className="h-14 rounded-full text-base"
          >
            {soldOut ? "Sold out" : "Add to Cart"}
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            disabled={pending}
            onClick={handleWishlist}
            className="size-14 rounded-full"
          >
            <Heart className={wishlisted ? "fill-current" : undefined} />
          </Button>
          {!soldOut && (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleBuy("/cart")}
              className="col-span-2 h-14 rounded-full text-base"
            >
              Buy Now
            </Button>
          )}
        </div>

        {soldOut && variant && (
          <div className="mt-4">
            <StockAlertForm key={variant.id} variantId={variant.id} label={`${color}, ${size}`} />
          </div>
        )}

        {purchase.offers.length > 0 && (
          <section aria-labelledby="offers-heading" className="mt-8 rounded-3xl border border-border p-5">
            <h2 id="offers-heading" className="text-xl font-semibold tracking-tight">
              Available offers
            </h2>
            <ul className="mt-3 divide-y divide-border">
              {purchase.offers.map(({ title, detail }) => (
                <li key={title} className="py-3">
                  <p className="text-base font-medium">{title}</p>
                  <p className="text-base text-muted-foreground">{detail}</p>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground">Applied automatically in your cart.</p>
          </section>
        )}

        <div className="mt-4">
          <DeliveryTimeline
            readyToShip={product.isReadyToDispatch && !soldOut}
            dispatchDays={product.isReadyToDispatch && !soldOut ? purchase.readyDispatchDays : purchase.madeToOrderDays}
            transitDays={purchase.transitDays}
          />
        </div>

        <Accordion className="mt-8" defaultValue={["description"]}>
          <AccordionItem value="description">
            <AccordionTrigger className="py-4 font-heading text-xl font-semibold">
              Description
            </AccordionTrigger>
            <AccordionContent className="text-lg leading-relaxed whitespace-pre-line text-muted-foreground">
              {product.description}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="details">
            <AccordionTrigger className="py-4 font-heading text-xl font-semibold">
              Details
            </AccordionTrigger>
            <AccordionContent>
              <dl className="divide-y divide-border text-lg">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-6 py-2.5">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-base text-muted-foreground">
                Handmade pieces vary a little in shade and size. That is the mark of the hand, not a flaw.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger className="py-4 font-heading text-xl font-semibold">
              Care
            </AccordionTrigger>
            <AccordionContent className="text-lg leading-relaxed text-muted-foreground">
              Vacuum gently without the beater bar, blot spills quickly with a clean cloth and mild
              detergent, and rotate every few months for even wear. For deep stains, use a professional
              carpet cleaner.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger className="py-4 font-heading text-xl font-semibold">
              Shipping and payment
            </AccordionTrigger>
            <AccordionContent className="text-lg leading-relaxed text-muted-foreground">
              {purchase.shippingPaise === 0
                ? "Free delivery across India."
                : `Delivery across India for ${formatPaise(purchase.shippingPaise)} per order.`}{" "}
              Ready stock ships in about {purchase.readyDispatchDays}{" "}
              {purchase.readyDispatchDays === 1 ? "working day" : "working days"}; made-to-order pieces
              take around {purchase.madeToOrderDays} working days to weave. Tracking details reach you by
              email once it ships. Pay by UPI, card or net banking
              {purchase.codEnabled ? ", or cash on delivery." : "."}{" "}
              <Link href="/policies/shipping" className="underline underline-offset-4">
                Shipping policy
              </Link>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger className="py-4 font-heading text-xl font-semibold">
              Returns
            </AccordionTrigger>
            <AccordionContent className="text-lg leading-relaxed text-muted-foreground">
              Something not right? Request a return from your account after delivery and tell us why. We
              review every request.{" "}
              <Link href="/policies/returns" className="underline underline-offset-4">
                Returns policy
              </Link>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="custom">
            <AccordionTrigger className="py-4 font-heading text-xl font-semibold">
              Need another size or colour?
            </AccordionTrigger>
            <AccordionContent className="text-lg leading-relaxed text-muted-foreground">
              We weave to your measurements and palette.{" "}
              <Link href="/services/custom-carpets" className="underline underline-offset-4">
                Ask for a custom carpet
              </Link>
              .
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
