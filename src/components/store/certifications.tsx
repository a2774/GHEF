import Image from "next/image";

import { sectionTop } from "@/lib/section-spacing";

import { SectionHeading } from "./section-heading";

// The certificates the business holds. To add one, drop its picture in public/images/certificates
// and add a line here.
const certificates = [
  { name: "Responsible Wool Standard (RWS) certified", src: "/images/certificates/rws.webp" },
  { name: "Global Organic Textile Standard (GOTS) certified", src: "/images/certificates/gots.webp" },
  { name: "ISO 14001:2015 certified company", src: "/images/certificates/iso-14001.webp" },
  { name: "Hand Made Carpet of Bhadohi", src: "/images/certificates/bhadohi.webp" },
  { name: "ISO 9001:2015 certified company", src: "/images/certificates/iso-9001.webp" },
];

// How many times the row is repeated in each half of the track. With only a few logos, the row has
// to be wider than the widest screen, or an empty gap would show when the slide starts over.
const repeats = 4;

// The slide lives here, next to the markup it moves, so it never depends on the global stylesheet.
// It never pauses, not even under the pointer. People who turned animations off in their system
// get one still, centred row instead.
const slide = `
@keyframes logo-slide {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.logo-track {
  animation: logo-slide 30s linear infinite;
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .logo-track {
    animation: none;
    width: auto;
    flex-wrap: wrap;
    justify-content: center;
    row-gap: 1rem;
  }
  .logo-track > [aria-hidden="true"] {
    display: none;
  }
}
`;

/**
 * "Certified for quality & trust": the certificate logos slide sideways without stopping. The
 * track holds the row twice and moves by half its width, so the restart cannot be seen. Only the
 * first copy is read out by screen readers.
 */
export function Certifications() {
  const copies = Array.from({ length: repeats * 2 }, (_, copy) => copy);

  return (
    <section aria-label="Certifications" className={`overflow-hidden ${sectionTop}`}>
      <style>{slide}</style>
      <SectionHeading>Certified for quality &amp; trust.</SectionHeading>

      <div className="mt-8 [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
        <ul className="logo-track flex w-max">
          {copies.flatMap((copy) =>
            certificates.map(({ name, src }) => (
              <li key={`${copy}-${src}`} aria-hidden={copy > 0 ? true : undefined} className="mr-4 shrink-0">
                <div className="grid size-24 place-items-center rounded-2xl bg-white p-2 shadow-[0_1px_8px_rgb(0_0_0/0.07)] sm:size-28">
                  <Image
                    src={src}
                    alt={copy === 0 ? name : ""}
                    width={112}
                    height={112}
                    sizes="112px"
                    className="size-full object-contain"
                  />
                </div>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
