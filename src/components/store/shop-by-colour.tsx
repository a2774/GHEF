import Link from "next/link";

import { SHOP_COLOURS } from "@/lib/catalog-taxonomy";

export function ShopByColour() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-32">
        <h2 className="text-title font-semibold">Shop by colour.</h2>
        <ul className="mt-12 grid grid-cols-4 gap-x-4 gap-y-8 sm:grid-cols-8">
          {SHOP_COLOURS.map(({ name, swatch }) => (
            <li key={name}>
              <Link href={`/products?color=${encodeURIComponent(name)}`} className="group block text-center">
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: swatch }}
                  className="mx-auto block aspect-square w-full max-w-28 rounded-full ring-1 ring-border transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                />
                <span className="mt-3 block text-base">{name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
