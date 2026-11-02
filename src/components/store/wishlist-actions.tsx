"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { addToCart, removeFromWishlist } from "@/server/actions/cart";

import { useAuth } from "./auth-provider";

export function WishlistActions({
  productId,
  variantId,
}: {
  productId: number;
  variantId: number | null;
}) {
  const { refreshCustomerState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function moveToCart() {
    if (!variantId) return;
    setError(null);
    startTransition(async () => {
      const result = await addToCart(variantId, 1);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await removeFromWishlist(productId);
      await refreshCustomerState();
    });
  }

  function remove() {
    startTransition(async () => {
      await removeFromWishlist(productId);
      await refreshCustomerState();
    });
  }

  return (
    <div className="mt-3 space-y-2">
      {variantId && (
        <Button type="button" disabled={pending} onClick={moveToCart} className="h-11 w-full rounded-full text-base">
          Move to cart
        </Button>
      )}
      <Button type="button" variant="outline" disabled={pending} onClick={remove} className="h-11 w-full rounded-full text-base">
        Remove
      </Button>
      {error && (
        <p role="alert" className="text-base text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
