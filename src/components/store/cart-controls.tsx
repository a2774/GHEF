"use client";

import { Minus, Plus, X } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  applyCoupon,
  type CartResult,
  removeCartItem,
  removeCoupon,
  updateCartQuantity,
} from "@/server/actions/cart";

import { useAuth } from "./auth-provider";

export function CartLineControls({
  itemId,
  title,
  quantity,
  stock,
}: {
  itemId: number;
  title: string;
  quantity: number;
  stock: number;
}) {
  const { refreshCustomerState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<CartResult>) {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (!result.ok) setError(result.error);
      await refreshCustomerState();
    });
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          aria-label={`Decrease quantity of ${title}`}
          disabled={pending || quantity <= 1}
          onClick={() => run(() => updateCartQuantity(itemId, quantity - 1))}
          className="size-11 rounded-full"
        >
          <Minus />
        </Button>
        <span aria-live="polite" className="w-9 text-center text-lg">
          {quantity}
        </span>
        <Button
          type="button"
          variant="outline"
          aria-label={`Increase quantity of ${title}`}
          disabled={pending || quantity >= Math.min(stock, 50)}
          onClick={() => run(() => updateCartQuantity(itemId, quantity + 1))}
          className="size-11 rounded-full"
        >
          <Plus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Remove ${title}`}
          disabled={pending}
          onClick={() => run(() => removeCartItem(itemId))}
          className="ml-2 size-11 rounded-full"
        >
          <X />
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-base text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function CouponForm({ appliedCode }: { appliedCode: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    setError(null);
    startTransition(async () => {
      const result = await applyCoupon(code);
      if (!result.ok) setError(result.error ?? "That coupon code is not valid.");
    });
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-3 text-base">
        <span>
          Coupon <strong>{appliedCode}</strong>
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => removeCoupon())}
          className="underline underline-offset-4"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <Input
          name="code"
          required
          aria-label="Coupon code"
          placeholder="Coupon code"
          className="h-11 rounded-full bg-card px-4 text-base uppercase md:text-base"
        />
        <Button type="submit" variant="outline" disabled={pending} className="h-11 rounded-full px-5 text-base">
          Apply
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-base text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
