import Image from "next/image";
import Link from "next/link";

import { cormorant } from "@/lib/fonts/cormorant";
import { sectionTop } from "@/lib/section-spacing";

import { ProductPhoto } from "./product-photo";
import { SectionHeading } from "./section-heading";

// The card names are set in this serif. The section heading has its own style (SectionHeading).
const collectionFontClass = `${cormorant.variable} font-[family-name:var(--font-cormorant)]`;

export type CollectionCard = {
  name: string;
  href: string;
  /** Cloudinary id of a real product photo. */
  coverId?: string;
  /** A photo stored in this project's public folder, used instead of a product photo. */
  photo?: string;
  /** A small label on the card, such as "Coming soon". */
  badge?: string;
};

export function CollectionSkeleton() {
  return (
    <div className={`mx-auto max-w-7xl px-4 ${sectionTop} sm:px-6 lg:px-8`} aria-hidden="true">
      <div className="mx-auto h-10 w-72 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="aspect-[3/4] animate-pulse bg-muted motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}

/**
 * A centred serif heading above a row of photo cards: a real photo, with the name in white at
 * the bottom. Scrolls sideways on phones, four across on desktop. Used by "Explore the
 * collections" and "Shop by room".
 */
export function CollectionCards({ id, title, cards }: { id: string; title: string; cards: CollectionCard[] }) {
  return (
    <section id={id} className={`scroll-mt-32 ${collectionFontClass}`}>
      <div className={`mx-auto max-w-7xl px-4 ${sectionTop} sm:px-6 lg:px-8`}>
        <SectionHeading>{title}</SectionHeading>
      </div>
      {/* Auto margins on the first and last card centre a short row without cutting off a long one. */}
      <ul className="no-scrollbar mx-auto mt-6 flex max-w-7xl snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 sm:scroll-px-6 sm:px-6 lg:px-8 [&>li:first-child]:ml-auto [&>li:last-child]:mr-auto">
        {cards.map(({ name, href, coverId, photo, badge }) => (
          <li key={href} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[calc((100%-2.25rem)/4)]">
            <Link href={href} className="group relative block aspect-[3/4] overflow-hidden bg-muted">
              {photo ? (
                <Image
                  src={photo}
                  alt={`${name} carpets`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 72vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              ) : coverId ? (
                <ProductPhoto
                  publicId={coverId}
                  alt={`${name} carpets`}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 72vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              ) : null}
              {badge && (
                <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 font-sans text-xs font-medium tracking-wide text-[#1f1a17]">
                  {badge}
                </span>
              )}
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent"
              />
              <span className="absolute inset-x-3 bottom-3 text-center text-2xl leading-tight font-semibold text-white sm:text-[1.7rem]">
                {name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
