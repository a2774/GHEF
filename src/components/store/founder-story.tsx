import { Phone } from "lucide-react";
import Image from "next/image";

import { cormorant } from "@/lib/fonts/cormorant";
import { sectionY } from "@/lib/section-spacing";

import { SectionHeading } from "./section-heading";

// Everything this section says is in this one object, so the facts are easy to change.
const maker = {
  name: "Anil Kumar Vind",
  role: "Manufacturer, Ganga Handmade Export",
  photo: "/images/anil-kumar-vind.jpg",
  // Shown on the photo. The link dials the number when it is tapped on a phone.
  phone: { display: "+91 63882 87704", href: "tel:+916388287704" },
  quote:
    "My family has been making carpets for 35 years, and more than 3 lakh customers have been served at our store. Now I have brought it online, to bring the same carpets to your home.",
  about:
    "I am Anil Kumar Vind. My family has been manufacturing carpets for 35 years, and in that time we have served more than 3 lakh customers from our offline store. Now I have brought our work online, so you can see our carpets, choose your size and order from home, with the same care.",
  stats: [
    { value: "35+", label: "Years of family manufacturing" },
    { value: "3 Lac+", label: "Customers served in store" },
    { value: "Now", label: "Selling online" },
  ],
};

// Headings get a font from the global styles, so the serif is set on each element itself.
const serif = "font-[family-name:var(--font-cormorant)]";

/**
 * "Meet the maker": the owner's photo on the left, and on the right his name, a quote, a short
 * introduction and three numbers. On a phone the photo comes first, then the text.
 */
export function FounderStory() {
  return (
    <section id="maker" className={`scroll-mt-24 ${cormorant.variable}`}>
      <div className={`mx-auto max-w-6xl px-4 ${sectionY} sm:px-6 lg:px-8`}>
        <SectionHeading>Meet the maker.</SectionHeading>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-16">
          <figure className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl bg-muted lg:max-w-none">
            <Image
              src={maker.photo}
              alt={`${maker.name}, carpet manufacturer`}
              fill
              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 24rem, 90vw"
              className="object-cover object-[50%_18%]"
            />
            <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 to-transparent" />
            <figcaption className={`absolute inset-x-5 bottom-5 text-white ${serif}`}>
              <span className="block text-2xl font-semibold tracking-[0.12em] uppercase">{maker.name}</span>
              <span className="mt-1 block text-sm tracking-[0.1em] uppercase opacity-90">{maker.role}</span>
              <a
                href={maker.phone.href}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 font-sans text-base tracking-wide text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                <Phone aria-hidden="true" className="size-4" />
                <span>{maker.phone.display}</span>
              </a>
            </figcaption>
          </figure>

          <div>
            <h2 className={`text-5xl leading-tight font-medium text-[#111] lg:text-6xl ${serif}`}>{maker.name}</h2>
            <svg viewBox="0 0 500 12" aria-hidden="true" className="mt-4 h-3 w-full max-w-md text-[#c9a96a]">
              <path
                d="M2 8 C 60 2, 120 11, 180 6 S 300 4, 360 7 S 460 9, 498 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>

            <blockquote className={`mt-8 border-l-2 border-[#c9a96a] pl-6 text-2xl leading-snug text-[#444] italic sm:text-[1.7rem] ${serif}`}>
              &ldquo;{maker.quote}&rdquo;
            </blockquote>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#555]">{maker.about}</p>

            <dl className="mt-8 grid grid-cols-3 gap-x-5 border-t border-border pt-6">
              {maker.stats.map(({ value, label }) => (
                // The label comes first in the markup, but the number is shown above it.
                <div key={label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">{label}</dt>
                  <dd className={`text-3xl text-[#111] sm:text-4xl ${serif}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
