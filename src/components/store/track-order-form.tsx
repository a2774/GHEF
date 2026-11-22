"use client";

import { Check } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type TrackedOrder, trackOrder } from "@/server/actions/track-order";

const journey = [
  { status: "confirmed", label: "Confirmed" },
  { status: "processing", label: "Being made" },
  { status: "packed", label: "Packed" },
  { status: "shipped", label: "Shipped" },
  { status: "delivered", label: "Delivered" },
] as const;

const order = ["pending", "confirmed", "processing", "packed", "shipped", "delivered"];

const fieldClass = "h-12 rounded-2xl bg-card px-4 text-base md:text-base";

function Journey({ status }: { status: TrackedOrder["status"] }) {
  const reached = order.indexOf(status === "return_requested" || status === "returned" ? "delivered" : status);
  return (
    <ol className="mt-6 space-y-0">
      {journey.map((step) => {
        const done = reached >= order.indexOf(step.status);
        return (
          <li key={step.status} className="flex items-center gap-4 border-t border-border py-3 first:border-t-0">
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-background ring-1 ring-border"}`}
            >
              {done && <Check className="size-4" aria-hidden="true" />}
            </span>
            <span className={done ? "text-lg" : "text-lg text-muted-foreground"}>
              {step.label}
              <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function TrackOrderForm() {
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          startTransition(async () => {
            const response = await trackOrder({
              orderNumber: String(form.get("orderNumber") ?? ""),
              phone: String(form.get("phone") ?? ""),
            });
            setResult(response.ok ? response.order : null);
            setError(response.ok ? null : response.error);
          });
        }}
        className="space-y-3 self-start rounded-3xl bg-muted p-5 sm:p-8"
      >
        <label className="block text-base font-medium">
          Order number
          <Input name="orderNumber" required placeholder="GHE-261102-123456" className={`mt-1.5 ${fieldClass} uppercase`} />
        </label>
        <label className="block text-base font-medium">
          Phone number used for the order
          <Input name="phone" type="tel" required autoComplete="tel" placeholder="98765 43210" className={`mt-1.5 ${fieldClass}`} />
        </label>
        <Button type="submit" disabled={pending} className="h-14 w-full rounded-full text-base">
          {pending ? "Looking it up..." : "Track order"}
        </Button>
        {error && (
          <p role="alert" className="text-base text-destructive">
            {error}
          </p>
        )}
        <p className="text-base text-muted-foreground">
          Your order number is in the confirmation email and in your account.
        </p>
      </form>

      {result && (
        <section aria-live="polite" className="rounded-3xl border border-border p-5 sm:p-8">
          <p className="text-base text-muted-foreground">Placed on {result.placedOn}</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">{result.orderNumber}</h2>
          <p className="mt-2 text-xl">{result.statusLabel}</p>
          {result.status === "cancelled" || result.status === "refunded" ? (
            <p className="mt-4 text-lg text-muted-foreground">This order is no longer active.</p>
          ) : (
            <Journey status={result.status} />
          )}
          {result.trackingNumber && (
            <p className="mt-4 rounded-2xl bg-muted p-4 text-lg">
              {result.courier ?? "Courier"}: <span className="font-medium">{result.trackingNumber}</span>
            </p>
          )}
          <ul className="mt-4 space-y-1 border-t border-border pt-4 text-base text-muted-foreground">
            {result.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
