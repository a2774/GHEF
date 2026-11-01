"use client";

import { Heart, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatPaise } from "@/lib/format";
import { removeFromWishlist } from "@/server/actions/cart";
import type { ProductDetail } from "@/server/services/products";

import { useAuth } from "./auth-provider";
import { ProductPhoto } from "./product-photo";
import { RugIllustration, rugPaletteFor, rugSwatch } from "./rug-illustration";

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

export function ProductExperience({ product }: { product: ProductDetail }) {
  const { requireLogin, wishlistIds, refreshCustomerState } = useAuth();
  const colors = [...new Set(product.variants.map(({ color }) => color))];
  const sizes = [...new Set(product.variants.map(({ size }) => size))];
  const medallion = product.category === "Hand Knotted";

  const [color, setColor] = useState(colors[0]);
  const [size, setSize] = useState(sizes[0]);
  const [view, setView] = useState<GalleryView>("Full carpet");
  const [photoId, setPhotoId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const wishlisted = wishlistIds.includes(product.id);

  const variant = product.variants.find(
    (candidate) => candidate.color === color && candidate.size === size,
  );
  const soldOut = !variant || variant.stock === 0;
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
          <>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-muted">
              <ProductPhoto
                publicId={(product.images.find(({ id }) => id === photoId) ?? product.images[0]).publicId}
                alt={product.title}
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={(photoId ?? product.images[0].id) === image.id}
                    onClick={() => setPhotoId(image.id)}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-muted outline-offset-2 transition-opacity hover:opacity-80 aria-pressed:outline-2 aria-pressed:outline-primary"
                  >
                    <ProductPhoto publicId={image.publicId} alt="" sizes="20vw" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </>
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

      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="text-lg text-muted-foreground">{product.category}</p>
        <h1 className="mt-1 text-title font-semibold">{product.title}</h1>
        <p className="mt-4 text-2xl">{variant ? formatPaise(variant.pricePaise) : "Unavailable"}</p>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{product.description}</p>

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

        <Accordion className="mt-8">
          <AccordionItem value="materials">
            <AccordionTrigger className="py-4 font-heading text-xl font-semibold">
              Materials
            </AccordionTrigger>
            <AccordionContent className="text-lg leading-relaxed text-muted-foreground">
              {product.material}, {product.category.toLowerCase()}.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="care">
            <AccordionTrigger className="py-4 font-heading text-xl font-semibold">
              Care
            </AccordionTrigger>
            <AccordionContent className="text-lg leading-relaxed text-muted-foreground">
              Vacuum gently, blot spills quickly, and rotate every few months for even wear.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
