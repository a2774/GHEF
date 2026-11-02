import { Suspense } from "react";

import { BrandStory } from "@/components/store/brand-story";
import { Collection, CollectionSkeleton } from "@/components/store/collection";
import { CraftGrid } from "@/components/store/craft-grid";
import { CustomEnquiry } from "@/components/store/custom-enquiry";
import { FaqSection } from "@/components/store/faq-section";
import { Hero } from "@/components/store/hero";
import { Lifestyle } from "@/components/store/lifestyle";
import { ProcessSection } from "@/components/store/process-section";
import { PromoBanners } from "@/components/store/promo-banners";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PromoBanners />
      <CraftGrid />
      <Suspense fallback={<CollectionSkeleton />}>
        <Collection />
      </Suspense>
      <BrandStory />
      <ProcessSection />
      <Lifestyle />
      <CustomEnquiry />
      <FaqSection />
    </main>
  );
}
