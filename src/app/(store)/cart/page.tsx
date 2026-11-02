import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { CartLineControls, CouponForm } from "@/components/store/cart-controls";
import { LoginPrompt } from "@/components/store/login-prompt";
import { ProductPhoto } from "@/components/store/product-photo";
import { RugIllustration, rugPaletteFor } from "@/components/store/rug-illustration";
import { buttonVariants } from "@/components/ui/button";
import { formatPaise } from "@/lib/format";
import { getCustomerSession } from "@/server/auth/customer-session";
import { getCart } from "@/server/services/cart";

export const metadata: Metadata = {
  title: "Your cart | Ganga Handmade Export",
  robots: { index: false, follow: false },
};

async function Cart() {
  const session = await getCustomerSession();
  if (!session?.user?.id) return <LoginPrompt message="Log in to see your cart." href="/cart" />;

  const { lines, pricing, coupon, canCheckout } = await getCart(session.user.id);

  if (lines.length === 0) {
    return (
      <div className="rounded-3xl bg-muted p-10 text-center">
        <p className="font-heading text-2xl font-semibold tracking-tight">Your cart is empty.</p>
        <Link href="/products" className="mt-2 inline-block text-lg underline underline-offset-4">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
      <ul>
        {lines.map((line) => (
          <li key={line.id} className="flex gap-4 border-t border-border py-5 first:border-t-0 first:pt-0">
            <Link
              href={`/products/${line.slug}`}
              className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted sm:size-32"
            >
              {line.imageId ? (
                <ProductPhoto publicId={line.imageId} alt={line.title} sizes="128px" className="object-cover" />
              ) : (
                <RugIllustration palette={rugPaletteFor(line.color)} className="h-5/6" />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/products/${line.slug}`} className="font-heading text-xl font-semibold tracking-tight">
                {line.title}
              </Link>
              <p className="text-base text-muted-foreground">
                {line.color}, {line.size}
              </p>
              <p className="mt-1 text-lg">{formatPaise(line.unitPricePaise * line.billableQuantity)}</p>
              {!line.available && (
                <p className="mt-1 text-base text-destructive">Unavailable. Remove it to continue.</p>
              )}
              {line.available && line.quantity > line.stock && (
                <p className="mt-1 text-base text-destructive">Only {line.stock} available.</p>
              )}
              <CartLineControls
                itemId={line.id}
                title={line.title}
                quantity={line.quantity}
                stock={line.stock}
              />
            </div>
          </li>
        ))}
      </ul>

      <aside className="space-y-4 rounded-3xl bg-muted p-6 lg:sticky lg:top-36 lg:self-start">
        <h2 className="text-2xl font-semibold tracking-tight">Summary</h2>
        <CouponForm appliedCode={coupon?.code ?? null} />
        {coupon?.error && (
          <p role="alert" className="text-base text-destructive">
            {coupon.error}
          </p>
        )}
        {pricing.nextOffer && (
          <p className="rounded-2xl bg-card px-4 py-3 text-base">
            <span className="font-medium">Save more:</span> {pricing.nextOffer}
          </p>
        )}
        <dl className="space-y-2 border-t border-border pt-4 text-lg">
          <div className="flex justify-between">
            <dt>Subtotal ({pricing.itemCount} {pricing.itemCount === 1 ? "item" : "items"})</dt>
            <dd>{formatPaise(pricing.subtotalPaise)}</dd>
          </div>
          {pricing.discounts.map((discount) => (
            <div key={discount.kind} className="flex justify-between gap-4">
              <dt>{discount.label}</dt>
              <dd className="whitespace-nowrap">-{formatPaise(discount.paise)}</dd>
            </div>
          ))}
          <div className="flex justify-between text-base text-muted-foreground">
            <dt>Shipping</dt>
            <dd>Calculated at checkout</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 font-semibold">
            <dt>Total</dt>
            <dd>{formatPaise(pricing.totalPaise)}</dd>
          </div>
        </dl>
        {pricing.prepaidSavingPaise > 0 && (
          <p className="text-base">
            Pay online at checkout and save another {formatPaise(pricing.prepaidSavingPaise)}.
          </p>
        )}
        <p className="text-base text-muted-foreground">Prices include taxes.</p>
        {canCheckout ? (
          <Link
            href="/checkout"
            className={buttonVariants({ className: "h-14 w-full rounded-full text-base" })}
          >
            Proceed to checkout
          </Link>
        ) : (
          <p className="text-base text-muted-foreground">Remove unavailable items to continue.</p>
        )}
        <Link href="/products" className="block text-center text-base underline underline-offset-4">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}

export default function CartPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-36 pb-20 sm:px-6 lg:px-8 lg:pt-40">
      <h1 className="text-title font-semibold">Your cart.</h1>
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />}>
          <Cart />
        </Suspense>
      </div>
    </main>
  );
}
