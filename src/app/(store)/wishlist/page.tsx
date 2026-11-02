import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { LoginPrompt } from "@/components/store/login-prompt";
import { ProductCard } from "@/components/store/product-card";
import { WishlistActions } from "@/components/store/wishlist-actions";
import { getCustomerSession } from "@/server/auth/customer-session";
import { getWishlist } from "@/server/services/cart";

export const metadata: Metadata = {
  title: "Your wishlist | Ganga Handmade Export",
  robots: { index: false, follow: false },
};

async function Wishlist() {
  const session = await getCustomerSession();
  if (!session?.user?.id) return <LoginPrompt message="Log in to see your wishlist." href="/wishlist" />;

  const items = await getWishlist(session.user.id);
  if (items.length === 0) {
    return (
      <div className="rounded-3xl bg-muted p-10 text-center">
        <p className="font-heading text-2xl font-semibold tracking-tight">Your wishlist is empty.</p>
        <Link href="/products" className="mt-2 inline-block text-lg underline underline-offset-4">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-6">
      {items.map((item) => (
        <div key={item.productId}>
          <ProductCard product={item} />
          <WishlistActions productId={item.productId} variantId={item.cheapestVariantId} />
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-36 pb-20 sm:px-6 lg:px-8 lg:pt-40">
      <h1 className="text-title font-semibold">Your wishlist.</h1>
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />}>
          <Wishlist />
        </Suspense>
      </div>
    </main>
  );
}
