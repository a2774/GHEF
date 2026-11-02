import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { BrandStory } from "@/components/store/brand-story";
import { ProcessSection } from "@/components/store/process-section";
import { VisitUs } from "@/components/store/visit-us";

export const metadata: Metadata = {
  title: "Our story | Ganga Handmade Export",
  description: "Handmade carpets from the weaving belt of Bhadohi and Mirzapur, made slowly and finished by hand.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pt-36 pb-16 sm:px-6 lg:px-8 lg:pt-44 lg:pb-24">
        <p className="text-lg text-muted-foreground">Our story</p>
        <h1 className="mt-2 max-w-4xl text-display font-semibold text-balance">
          From the looms of Bhadohi to your floor.
        </h1>
        <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <p className="text-xl leading-relaxed text-muted-foreground">
            Ganga Handmade Export works with weaving families across Bhadohi and Mirzapur, the heart of
            India&apos;s carpet belt. Every piece is drawn, dyed, woven and finished by hand.
          </p>
          <p className="text-xl leading-relaxed text-muted-foreground">
            We sell directly, so you deal with the people who make your carpet, can ask for any size or
            colour, and pay for craft rather than for middlemen.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-muted">
          <Image
            src="/images/lifestyle-living-room.jpg"
            alt="A handmade carpet in a bright living room"
            fill
            sizes="(min-width: 1280px) 1280px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
      <div className="h-20 lg:h-32" />
      <BrandStory />
      <ProcessSection />
      <Suspense>
        <VisitUs />
      </Suspense>
      <section className="bg-muted">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-20 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <h2 className="text-title font-semibold text-balance">Have something in mind?</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex h-14 items-center rounded-full bg-primary px-8 text-base text-primary-foreground hover:opacity-90">
              Shop the collection
            </Link>
            <Link href="/services/custom-carpets" className="inline-flex h-14 items-center rounded-full border border-primary px-8 text-base hover:bg-background">
              Ask for a custom carpet
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
