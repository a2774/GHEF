import { Suspense } from "react";

import { BrandStory } from "@/components/store/brand-story";
import { CategoryRails } from "@/components/store/category-rails";
import { CraftGrid } from "@/components/store/craft-grid";
import { CustomEnquiry } from "@/components/store/custom-enquiry";
import { FaqSection } from "@/components/store/faq-section";
import { Hero } from "@/components/store/hero";
import { Lifestyle } from "@/components/store/lifestyle";
import { ProcessSection } from "@/components/store/process-section";
import { ProductRail, ProductRailSkeleton } from "@/components/store/product-rail";
import { PromoBanners } from "@/components/store/promo-banners";
import { ShopByColour } from "@/components/store/shop-by-colour";
import { ShopByRoom } from "@/components/store/shop-by-room";
import { VisitUs } from "@/components/store/visit-us";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PromoBanners />
      <Suspense fallback={<ProductRailSkeleton />}>
        <ProductRail
          id="ready"
          title="Ready to dispatch."
          subtitle="In stock at the workshop and on its way within a day or two."
          href="/products?ready=on"
          filters={{ readyToDispatch: true, inStock: true }}
          limit={4}
        />
      </Suspense>
      <CraftGrid />
      <ShopByRoom />
      <Suspense fallback={<ProductRailSkeleton />}>
        <ProductRail
          id="collection"
          title="Bestsellers."
          href="/products?sort=bestselling"
          filters={{ sort: "bestselling" }}
        />
      </Suspense>
      <ShopByColour />
      <Suspense fallback={<ProductRailSkeleton />}>
        <ProductRail title="New arrivals." href="/products?sort=newest" filters={{ sort: "newest" }} />
      </Suspense>
      <div className="h-20 lg:h-32" />
      <BrandStory />
      <Suspense fallback={<ProductRailSkeleton />}>
        <CategoryRails />
      </Suspense>
      <div className="h-20 lg:h-32" />
      <ProcessSection />
      <Lifestyle />
      <Suspense>
        <VisitUs />
      </Suspense>
      <CustomEnquiry />
      <FaqSection />
    </main>
  );
}
