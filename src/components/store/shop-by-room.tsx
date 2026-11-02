import Link from "next/link";

import { ROOMS } from "@/lib/catalog-taxonomy";

import { RugIllustration, type RugPalette } from "./rug-illustration";

const palettes: RugPalette[] = ["Ivory", "Sand", "Beige", "Charcoal", "Sand", "Beige"];

export function ShopByRoom() {
  return (
    <section id="rooms" className="scroll-mt-32">
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-32">
        <h2 className="text-title font-semibold">Shop by room.</h2>
        <ul className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {ROOMS.map((room, index) => (
            <li key={room.slug}>
              <Link
                href={`/products?room=${room.slug}`}
                className="group flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-muted p-5 sm:p-7"
              >
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{room.name}</h3>
                  <p className="mt-2 text-base text-muted-foreground sm:text-lg">{room.blurb}</p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-base underline-offset-4 group-hover:underline">Shop now</span>
                  <RugIllustration
                    palette={palettes[index % palettes.length]}
                    medallion={index % 2 === 0}
                    className="w-1/2 max-w-40 -rotate-6 drop-shadow-lg transition-transform duration-500 group-hover:rotate-0 motion-reduce:transition-none"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
