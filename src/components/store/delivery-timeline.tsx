"use client";

import { CalendarDays, Clock3, House, Truck } from "lucide-react";
import { Fragment, useSyncExternalStore } from "react";

import { addWorkingDays, deliveryEstimate } from "@/lib/delivery";

const noSubscription = () => () => {};

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

// Couriers rarely hit an exact day, so dispatch and delivery show a short window.
const windowDays = 2;

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
  const range = (date?: Date) =>
    date ? `${show(date)} – ${show(addWorkingDays(date, windowDays))}` : "…";

  const steps = [
    { icon: CalendarDays, label: "Order on", value: now ? show(now) : "…" },
    { icon: Truck, label: "Shipped by", value: range(estimate?.dispatch) },
    { icon: House, label: "Delivered by", value: range(estimate?.delivery) },
  ];
  const stages = [readyToShip ? "Packing" : "Crafting", "In-transit"];

  return (
    <section
      aria-labelledby="delivery-heading"
      className="rounded-xl border border-[#7a1f2b] bg-white px-4 pt-3 pb-3.5"
    >
      <h2
        id="delivery-heading"
        className="flex items-center gap-1.5 border-b border-[#e6dcdc] pb-2.5 text-[0.65rem] font-medium tracking-[0.14em] text-[#7a1f2b] uppercase"
      >
        <Clock3 className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
        Estimated delivery timeline
      </h2>

      <ol className="mt-3.5 flex items-start">
        {steps.map(({ icon: Icon, label, value }, index) => (
          <Fragment key={label}>
            {index > 0 && (
              <li aria-hidden="true" className="relative mt-[1.05rem] min-w-6 flex-1 px-1.5">
                <span className="block border-t-2 border-dashed border-[#7a1f2b]" />
                <span className="absolute inset-x-0 top-2 text-center text-[0.55rem] tracking-[0.12em] text-[#8a7f7f] uppercase">
                  {stages[index - 1]}
                </span>
              </li>
            )}
            <li
              className={`flex shrink-0 flex-col ${
                index === 0 ? "items-start" : index === steps.length - 1 ? "items-end" : "items-center"
              }`}
            >
              <span className="flex size-9 items-center justify-center rounded-full border border-[#7a1f2b] bg-white text-[#7a1f2b]">
                <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span className="mt-1.5 text-[0.6rem] tracking-[0.1em] text-[#7a1f2b] uppercase">{label}</span>
              <span className="font-[family-name:var(--font-logo)] text-[0.8rem] leading-tight font-bold whitespace-nowrap text-[#2b2622]">
                {value}
              </span>
            </li>
          </Fragment>
        ))}
      </ol>
    </section>
  );
}
