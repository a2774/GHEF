"use client";

import { PackageCheck, Scissors, ShoppingBag, Truck } from "lucide-react";
import { useSyncExternalStore } from "react";

import { deliveryEstimate } from "@/lib/delivery";

const noSubscription = () => () => {};

const dateFormat = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

export function DeliveryTimeline({
  readyToShip,
  dispatchDays,
  transitDays,
}: {
  readyToShip: boolean;
  dispatchDays: number;
  transitDays: number;
}) {
  // Dates depend on the visitor's clock, so the server renders placeholders and
  // the browser fills them in. The snapshot is the day, so it stays stable.
  const today = useSyncExternalStore(
    noSubscription,
    () => new Date().toDateString(),
    () => null,
  );
  const now = today ? new Date(today) : null;
  const estimate = now ? deliveryEstimate(now, dispatchDays, transitDays) : null;
  const show = (date?: Date) => (date ? dateFormat.format(date) : "…");

  const steps = [
    { icon: ShoppingBag, label: "Order", value: now ? "Today" : "…" },
    { icon: readyToShip ? PackageCheck : Scissors, label: readyToShip ? "Packed" : "Woven", value: `${dispatchDays} ${dispatchDays === 1 ? "day" : "days"}` },
    { icon: Truck, label: "Shipped by", value: show(estimate?.dispatch) },
    { icon: PackageCheck, label: "Delivered by", value: show(estimate?.delivery) },
  ];

  return (
    <div className="rounded-3xl bg-muted p-5">
      <p className="text-base font-medium">
        {readyToShip ? "Ready to dispatch from stock" : "Made to order for you"}
      </p>
      <ol className="mt-4 grid grid-cols-4 gap-2">
        {steps.map(({ icon: Icon, label, value }, index) => (
          <li key={label} className="relative text-center">
            {index > 0 && (
              <span aria-hidden="true" className="absolute top-5 right-1/2 h-px w-full -translate-y-1/2 bg-border" />
            )}
            <span className="relative mx-auto flex size-10 items-center justify-center rounded-full bg-background">
              <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="mt-2 block text-sm text-muted-foreground">{label}</span>
            <span className="block text-sm font-medium">{value}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted-foreground">
        An estimate in working days. Remote PIN codes and sale periods can take longer.
      </p>
    </div>
  );
}
