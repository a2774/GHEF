import { Brush, Ruler, Truck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { RugIllustration, type RugPalette } from "@/components/store/rug-illustration";
import { siteName } from "@/lib/site";
import { getStoreSettings } from "@/server/services/settings";

// Same clean geometric face as the reference About page.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: `Our Store | ${siteName}`,
  description:
    "48+ years of handmade carpets from Bhadohi, India's carpet capital. Designed in-house, woven by skilled artisans and finished with care for pile height and material quality.",
  alternates: { canonical: "/our-store" },
};

const steps = [
  {
    title: "Design",
    image: "/images/our-store/design.jpg",
    alt: "An artisan drawing a carpet design on graph paper",
    text: "Every carpet starts as a drawing. The design is mapped on graph paper, square by square, so each knot has its place and colour.",
  },
  {
    title: "Dyeing",
    image: "/images/our-store/dyeing.jpg",
    alt: "Wool being dyed in large vats",
    text: "Graded wool is dyed in batches, matched to the shade card and dried in the sun, so the colour stays even across the carpet.",
  },
  {
    title: "Knotting & Tufting",
    image: "/images/our-store/weaving.jpg",
    alt: "Weavers tying knots on an upright loom",
    text: "Artisans weave knot by knot on upright looms, or tuft yarn through a cotton base by hand. A single carpet can take weeks or months.",
  },
  {
    title: "Finishing",
    image: "/images/our-store/finishing.jpg",
    alt: "Craftsmen washing and clipping a finished carpet",
    text: "The carpet is washed, sun-dried, clipped to an even pile height and checked edge to edge before it leaves our workshop.",
  },
];

const crafts: { name: string; slug: string; palette: RugPalette; medallion: boolean }[] = [
  { name: "Hand Knotted", slug: "hand-knotted", palette: "Ivory", medallion: true },
  { name: "Hand Tufted", slug: "hand-tufted", palette: "Sand", medallion: false },
  { name: "Jute", slug: "jute", palette: "Beige", medallion: false },
  { name: "Shaggy", slug: "shaggy", palette: "Charcoal", medallion: true },
];

async function loadShipping() {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");
  try {
    return (await getStoreSettings()).shippingPaise;
  } catch {
    return null;
  }
}

async function WhyUs() {
  const shippingPaise = await loadShipping();
  const reasons = [
    {
      icon: Brush,
      title: "Direct from Bhadohi",
      text: "We have made carpets in Bhadohi for 48+ years. You buy from the makers, with no middlemen in between.",
    },
    {
      icon: Ruler,
      title: "Customized Carpets",
      text: "Any size, any colour, any design. Tell us about your room and we weave it to fit.",
    },
    shippingPaise === 0
      ? { icon: Truck, title: "Free Shipping in India", text: "Every order is delivered free, packed with care, to your door." }
      : { icon: Truck, title: "Delivery Across India", text: "Carefully packed and delivered to your door, with tracking." },
    {
      icon: Wrench,
      title: "Care for Life",
      text: "Cleaning and repair for your carpet, so it keeps its colour and pile for years.",
    },
  ];

  return (
    <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {reasons.map(({ icon: Icon, title, text }) => (
        <div key={title} className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f3ede3]">
            <Icon className="size-6 text-[#1f1c19]" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <h3 className="mt-5 text-lg font-medium text-[#1f1c19]">{title}</h3>
          <p className="mt-2 text-[0.95rem] leading-relaxed font-light text-[#5c544c]">{text}</p>
        </div>
      ))}
    </div>
  );
}

export default function OurStorePage() {
  return (
    <main
      className={`${poppins.variable} bg-white font-[family-name:var(--font-poppins)] text-[#1f1c19] [&_:is(h1,h2,h3)]:font-[family-name:var(--font-poppins)]`}
    >
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-32 sm:px-6 lg:px-8 lg:pt-40">
        <nav aria-label="Breadcrumb" className="text-center text-sm font-light text-[#6b625a]">
          <Link href="/" className="hover:text-[#1f1c19]">
            Home
          </Link>
          <span aria-hidden="true"> / </span>
          <span className="text-[#1f1c19]">Our Store</span>
        </nav>
        <h1 className="mt-4 text-center text-4xl font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Woven in Bhadohi
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg font-light text-[#5c544c]">
          48+ years of handmade carpets, rooted in India&apos;s carpet capital.
        </p>
        <div className="relative mt-10 aspect-[16/7] overflow-hidden rounded-2xl bg-[#f3ede3]">
          <Image
            src="/images/lifestyle-living-room.jpg"
            alt="A handmade carpet in a bright living room"
            fill
            priority
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Our story */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Our Story</h2>
            <div className="mt-6 space-y-5 text-[1.05rem] leading-relaxed font-light text-[#5c544c]">
              <p>
                {siteName} began in Bhadohi, the town known across the world as the carpet city of India.
                For more than 48 years we have been designing and manufacturing handmade carpets here.
              </p>
              <p>
                Our carpets are made by skilled artisans from the weaving families of the Bhadohi and
                Mirzapur belt, who learned the craft at home and still tie every knot by hand. We look after
                every step ourselves, from the first drawing to the final wash.
              </p>
              <p>
                We care most about two things you can feel: the quality of the material and the height and
                evenness of the pile. Today we bring that work straight from our looms to homes across India.
              </p>
            </div>
            <Link
              href="/products"
              className="mt-8 inline-flex h-12 items-center rounded-md bg-[#1f1c19] px-7 text-sm font-medium tracking-wide text-white uppercase transition-opacity hover:opacity-85"
            >
              Shop the collection
            </Link>
          </div>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-2xl bg-[#f3ede3]">
            <Image
              src="/images/our-store/weaving.jpg"
              alt="Artisans weaving a carpet by hand on a loom"
              fill
              sizes="(min-width: 1024px) 28rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* From loom to living room */}
      <section className="bg-[#faf7f2]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">From Loom to Living Room</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg font-light text-[#5c544c]">
            Four steps, all done by hand, in our workshop in Bhadohi.
          </p>
          <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ title, image, alt, text }, index) => (
              <li key={title}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#f3ede3]">
                  <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" className="object-cover" />
                </div>
                <p className="mt-5 text-sm font-medium tracking-[0.2em] text-[#8a7f74] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-1 text-xl font-medium">{title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed font-light text-[#5c544c]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Heritage */}
      <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <p className="text-sm font-medium tracking-[0.2em] text-[#8a7f74] uppercase">The carpet city of India</p>
        <h2 className="mt-3 text-3xl font-medium tracking-tight text-balance sm:text-4xl">
          Four centuries of weaving in Bhadohi
        </h2>
        <div className="mt-6 space-y-5 text-[1.05rem] leading-relaxed font-light text-[#5c544c]">
          <p>
            Hand-knotting came to this stretch of the Ganga plain in the Mughal era, more than four hundred
            years ago, carried by weavers along the Grand Trunk Road. Families here took up the craft and passed
            it down, mixing Persian patterns with Indian flowers, vines and gardens.
          </p>
          <p>
            In 2010 the &ldquo;Hand Made Carpet of Bhadohi&rdquo; received a Geographical Indication (GI) tag,
            which recognises the craft as belonging to this place and its people.
          </p>
        </div>
      </section>

      {/* What we make */}
      <section className="border-t border-[#ece6dc]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">What We Make</h2>
          <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {crafts.map(({ name, slug, palette, medallion }) => (
              <Link key={slug} href={`/products?category=${slug}`} className="group block">
                <div className="aspect-square overflow-hidden rounded-2xl bg-[#f3ede3]">
                  <RugIllustration
                    palette={palette}
                    medallion={medallion}
                    viewBox="110 230 380 380"
                    className="size-full transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>
                <p className="mt-3 text-center text-base font-medium group-hover:underline">{name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-[#faf7f2]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <h2 className="text-center text-3xl font-medium tracking-tight sm:text-4xl">Why {siteName}</h2>
          <Suspense fallback={<div className="mt-12 h-48" />}>
            <WhyUs />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
