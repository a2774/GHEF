import Link from "next/link";

import { RugIllustration, type RugPalette } from "./rug-illustration";

const crafts: { name: string; palette: RugPalette; medallion: boolean }[] = [
  { name: "Hand Knotted", palette: "Ivory", medallion: true },
  { name: "Hand Tufted", palette: "Sand", medallion: false },
  { name: "Jute", palette: "Beige", medallion: false },
  { name: "Shaggy", palette: "Charcoal", medallion: true },
];

export function CraftGrid() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8 lg:pt-32">
        <h2 className="text-title font-semibold">Shop by craft.</h2>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {crafts.map(({ name, palette, medallion }) => (
            <Link
              key={name}
              href="#collection"
              className="group relative block aspect-square overflow-hidden rounded-3xl bg-muted"
            >
              <RugIllustration
                palette={palette}
                medallion={medallion}
                viewBox="110 230 380 380"
                className="size-full transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
              />
              <span className="liquid-glass absolute bottom-3 left-3 rounded-full px-4 py-2 text-base text-primary-foreground">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
