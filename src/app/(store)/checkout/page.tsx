import { randomUUID } from "node:crypto";

import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AddressForm } from "@/components/store/address-form";
import { CheckoutForm } from "@/components/store/checkout-form";
import { LoginPrompt } from "@/components/store/login-prompt";
import { formatPaise } from "@/lib/format";
import { getCustomerSession } from "@/server/auth/customer-session";
import { db, withDbRetry } from "@/server/db";
import { addresses } from "@/server/db/schema";
import { getCart } from "@/server/services/cart";
import { razorpayEnabled } from "@/server/services/razorpay";
import { getStoreSettings } from "@/server/services/settings";

export const metadata: Metadata = {
  title: "Checkout | Ganga Handmade Export",
  robots: { index: false, follow: false },
};

async function Checkout() {
  const session = await getCustomerSession();
  if (!session?.user?.id) return <LoginPrompt message="Log in to check out." href="/checkout" />;
  const userId = session.user.id;

  const [cart, { codEnabled, shippingPaise }, saved] = await Promise.all([
    getCart(userId),
    getStoreSettings(),
    withDbRetry(async () =>
      db
        .select()
        .from(addresses)
        .where(eq(addresses.userId, userId))
        .orderBy(desc(addresses.isDefault), desc(addresses.createdAt)),
    ),
  ]);

  if (!cart.canCheckout) {
    return (
      <div className="rounded-3xl bg-muted p-10 text-center">
        <p className="font-heading text-2xl font-semibold tracking-tight">Your cart has nothing to check out.</p>
        <Link href="/cart" className="mt-2 inline-block text-lg underline underline-offset-4">
          Back to cart
        </Link>
      </div>
    );
  }

  const options = saved.map(({ id, fullName, phone, house, locality, city, state, pincode, type, isDefault }) => ({
    id,
    isDefault,
    label: `${fullName} (${type === "home" ? "Home" : "Work"})\n${house}, ${locality}\n${city}, ${state} ${pincode}\n${phone}`,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
      <div className="space-y-6">
        <CheckoutForm
          addresses={options}
          idempotencyKey={randomUUID()}
          codAvailable={codEnabled}
          onlineAvailable={razorpayEnabled()}
        />
        <details className="rounded-3xl bg-muted p-5" open={options.length === 0}>
          <summary className="cursor-pointer font-heading text-xl font-semibold tracking-tight">
            Add a new address
          </summary>
          <div className="mt-4">
            <AddressForm />
          </div>
        </details>
      </div>

      <aside className="space-y-3 rounded-3xl bg-muted p-6 lg:sticky lg:top-28 lg:self-start">
        <h2 className="text-2xl font-semibold tracking-tight">Order summary</h2>
        <ul className="space-y-2 text-base">
          {cart.lines
            .filter(({ billableQuantity }) => billableQuantity > 0)
            .map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <span>
                  {line.title}, {line.size} × {line.billableQuantity}
                </span>
                <span>{formatPaise(line.unitPricePaise * line.billableQuantity)}</span>
              </li>
            ))}
        </ul>
        <dl className="space-y-2 border-t border-border pt-3 text-lg">
          {cart.totals.discountPaise > 0 && (
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd>-{formatPaise(cart.totals.discountPaise)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt>Shipping</dt>
            <dd>{shippingPaise === 0 ? "Free" : formatPaise(shippingPaise)}</dd>
          </div>
          <div className="flex justify-between font-semibold">
            <dt>Total</dt>
            <dd>{formatPaise(cart.totals.totalPaise + shippingPaise)}</dd>
          </div>
        </dl>
        <p className="text-base text-muted-foreground">Prices include taxes. We will share delivery details after you order.</p>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-6 lg:px-8 lg:pt-32">
      <h1 className="text-title font-semibold">Checkout.</h1>
      <div className="mt-8">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />}>
          <Checkout />
        </Suspense>
      </div>
    </main>
  );
}
