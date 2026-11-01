"use client";

import { ShoppingBag, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { removeFromBag, useBag } from "@/lib/bag";
import { formatPaise } from "@/lib/format";

export function BagSheet() {
  const items = useBag();
  const count = items.reduce((total, { quantity }) => total + quantity, 0);
  const subtotal = items.reduce(
    (total, { pricePaise, quantity }) => total + pricePaise * quantity,
    0,
  );

  return (
    <Sheet>
      <SheetTrigger
        aria-label={`Open bag, ${count} ${count === 1 ? "item" : "items"}`}
        className="relative flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/15"
      >
        <ShoppingBag className="size-5" strokeWidth={1.5} />
        {count > 0 && (
          <span className="absolute top-1 right-0.5 flex size-5 items-center justify-center rounded-full bg-primary-foreground text-xs font-medium text-primary">
            {count}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="w-[90%] data-[side=right]:sm:max-w-md">
        <SheetHeader className="p-6">
          <SheetTitle className="text-2xl font-semibold tracking-tight">Your bag</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <p className="px-6 text-lg text-muted-foreground">Your bag is waiting for its first piece.</p>
        ) : (
          <ul className="flex-1 overflow-y-auto px-6">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-3 border-t border-border py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-lg font-semibold">{item.title}</p>
                  <p className="text-base text-muted-foreground">
                    {item.color}, {item.size}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </p>
                  <p className="mt-1 text-base">{formatPaise(item.pricePaise * item.quantity)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromBag(item.variantId)}
                  aria-label={`Remove ${item.title} from bag`}
                  className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <SheetFooter className="border-t border-border p-6">
            <p className="flex justify-between text-lg font-medium">
              <span>Subtotal</span>
              <span>{formatPaise(subtotal)}</span>
            </p>
            <p className="text-base text-muted-foreground">Online checkout is coming soon.</p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
