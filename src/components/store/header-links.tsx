"use client";

import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { useAuth } from "./auth-provider";

const linkClass =
  "relative flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/15";

export function HeaderLinks() {
  const { cartCount, requireLogin } = useAuth();

  return (
    <>
      <button
        type="button"
        aria-label="Wishlist"
        onClick={() => void requireLogin({ type: "navigate", href: "/wishlist" })}
        className={`${linkClass} max-sm:hidden`}
      >
        <Heart className="size-5" strokeWidth={1.5} />
      </button>
      <Link href="/cart" aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`} className={linkClass}>
        <ShoppingBag className="size-5" strokeWidth={1.5} />
        {cartCount > 0 && (
          <span className="absolute top-1 right-0.5 flex size-5 items-center justify-center rounded-full bg-primary-foreground text-xs font-medium text-primary">
            {cartCount}
          </span>
        )}
      </Link>
    </>
  );
}
