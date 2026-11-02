import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { type PurchaseInfo, ProductExperience } from "@/components/store/product-experience";
import { ProductRail } from "@/components/store/product-rail";
import { ProductReviews } from "@/components/store/product-reviews";
import { describeDbError } from "@/lib/db-error";
import { siteName, siteUrl } from "@/lib/site";
import { offerHeadlines } from "@/server/services/pricing";
import { getActiveProductSlugs, getProductBySlug } from "@/server/services/products";
import { getStoreSettings } from "@/server/services/settings";

type ProductPageProps = { params: Promise<{ slug: string }> };

async function loadCachedProduct(slug: string) {
  "use cache";
  cacheTag("products");
  cacheLife("hours");
  return getProductBySlug(slug);
}

// Errors are caught outside the cache, so a database hiccup is not
// remembered as "product not found" for the next hour.
async function loadProduct(slug: string) {
  try {
    return await loadCachedProduct(slug);
  } catch (error) {
    console.error(`Could not load product "${slug}": ${describeDbError(error)}`);
    return null;
  }
}

async function loadPurchaseInfo(): Promise<PurchaseInfo> {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");

  const settings = await getStoreSettings();
  return {
    offers: offerHeadlines(settings.offers),
    readyDispatchDays: settings.readyDispatchDays,
    madeToOrderDays: settings.madeToOrderDays,
    transitDays: settings.transitDays,
    codEnabled: settings.codEnabled,
    shippingPaise: settings.shippingPaise,
  };
}

export async function generateStaticParams() {
  try {
    const slugs = await getActiveProductSlugs();
    if (slugs.length > 0) return slugs;
  } catch {
    // Fallback when database is unreachable during CI / static analysis
  }
  // Next.js 16 Cache Components requires at least one param for build-time validation
  return [{ slug: "varuna" }];
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: siteName };

  const title = `${product.title} | ${siteName}`;
  return {
    title,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description: product.description, url: `/products/${product.slug}`, type: "website" },
  };
}

async function Product({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, purchase] = await Promise.all([loadProduct(slug), loadPurchaseInfo()]);
  if (!product) notFound();

  const prices = product.variants.map(({ pricePaise }) => pricePaise / 100);
  const inStock = product.variants.some(({ stock }) => stock > 0);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    material: product.material,
    category: product.category,
    brand: { "@type": "Brand", name: siteName },
    url: `${siteUrl}/products/${product.slug}`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: product.variants.length,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-32 text-base text-muted-foreground sm:px-6 lg:px-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        {" / "}
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {" / "}
        <Link href={`/products?category=${product.categorySlug}`} className="hover:text-foreground">
          {product.category}
        </Link>
        {" / "}
        <span className="text-foreground">{product.title}</span>
      </nav>
      <ProductExperience product={product} purchase={purchase} />
      <ProductReviews productId={product.id} />
      <ProductRail
        title="You may also like."
        href={`/products?category=${product.categorySlug}`}
        filters={{ category: product.categorySlug, sort: "bestselling" }}
        limit={4}
        excludeSlug={product.slug}
      />
      <div className="h-20 lg:h-32" />
    </>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <main>
      <Suspense fallback={<div className="min-h-svh" />}>
        <Product params={params} />
      </Suspense>
    </main>
  );
}
