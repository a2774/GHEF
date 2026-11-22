import { Gem, ShieldCheck, Star, Truck } from "lucide-react";

export function TrustBadges({ freeShipping }: { freeShipping: boolean }) {
  const badges = [
    { icon: Gem, title: "Premium quality", note: "Crafted to last" },
    freeShipping
      ? { icon: Truck, title: "Fast & free shipping", note: "On all orders" }
      : { icon: Truck, title: "Fast shipping", note: "Across India" },
    { icon: ShieldCheck, title: "Secure checkout", note: "Safe & trusted" },
    { icon: Star, title: "Customer satisfaction", note: "Our top priority" },
  ];

  return (
    <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4">
      {badges.map(({ icon: Icon, title, note }) => (
        <li key={title} className="flex flex-col items-center text-center">
          <span className="flex size-[4.5rem] items-center justify-center rounded-full border-2 border-[#3a3633] bg-[#d6b892]">
            <span className="flex size-12 items-center justify-center rounded-full border-2 border-[#3a3633] bg-white">
              <Icon className="size-6 text-[#3a3633]" strokeWidth={1.75} aria-hidden="true" />
            </span>
          </span>
          <span className="mt-3 text-[0.95rem] leading-tight font-bold tracking-wide text-[#3a3633] uppercase text-balance">
            {title}
          </span>
          <span className="mt-1 text-sm text-[#4a4541]">{note}</span>
        </li>
      ))}
    </ul>
  );
}
