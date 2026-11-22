import { Suspense } from "react";

import { CategoryRails } from "@/components/store/category-rails";
import { Certifications } from "@/components/store/certifications";
import { CollectionSkeleton } from "@/components/store/collection-cards";
import { CraftGrid } from "@/components/store/craft-grid";
import { Deferred } from "@/components/store/deferred";
import { FounderStory } from "@/components/store/founder-story";
import { Hero } from "@/components/store/hero";
import { Lifestyle } from "@/components/store/lifestyle";
import { ProductRail, ProductRailSkeleton } from "@/components/store/product-rail";
import { PromoBanners } from "@/components/store/promo-banners";
import { QuestionsSection } from "@/components/store/questions-section";
import { ShopByRoom } from "@/components/store/shop-by-room";
import { VisitUs } from "@/components/store/visit-us";

// Everything after the hero and the promo banners is below the first screen, so each part is
// wrapped in <Deferred>: the browser skips its layout and painting until it is scrolled near.
export default function HomePage() {
  return (
    <main>
      <Hero />
      <PromoBanners />
      <Deferred height={620}>
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
      </Deferred>
      <Deferred height={760}>
        <Suspense fallback={<CollectionSkeleton />}>
          <CraftGrid />
        </Suspense>
      </Deferred>
      <Deferred height={900}>
        <Suspense fallback={<CollectionSkeleton />}>
          <ShopByRoom />
        </Suspense>
      </Deferred>
      <Deferred height={620}>
        <Suspense fallback={<ProductRailSkeleton />}>
          <ProductRail
            id="collection"
            title="Bestsellers."
            href="/products?sort=bestselling"
            filters={{ sort: "bestselling" }}
          />
        </Suspense>
      </Deferred>
      <Deferred height={620}>
        <Suspense fallback={<ProductRailSkeleton />}>
          <ProductRail title="New arrivals." href="/products?sort=newest" filters={{ sort: "newest" }} />
        </Suspense>
      </Deferred>
      <Deferred height={1200}>
        <Suspense fallback={<ProductRailSkeleton />}>
          <CategoryRails />
        </Suspense>
      </Deferred>
      <Deferred height={700}>
        <Lifestyle />
      </Deferred>
      <Deferred height={640}>
        <Suspense>
          <VisitUs />
        </Suspense>
      </Deferred>
      <Deferred height={760}>
        <QuestionsSection />
      </Deferred>
      <Deferred height={260}>
        <Certifications />
      </Deferred>
      <Deferred height={760}>
        <FounderStory />
      </Deferred>
    </main>
  );
}
