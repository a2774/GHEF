import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductExperience } from "@/components/store/product-experience";
import { ProductReviews } from "@/components/store/product-reviews";
import { siteName, siteUrl } from "@/lib/site";
import { getActiveProductSlugs, getProductBySlug } from "@/server/services/products";

type ProductPageProps = { params: Promise<{ slug: string }> };

async function loadProduct(slug: string) {
  "use cache";
  cacheTag("products");
  cacheLife("hours");

  return getProductBySlug(slug);
}

export async function generateStaticParams() {
  return getActiveProductSlugs();
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
  const product = await loadProduct(slug);
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
      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-24 text-base text-muted-foreground sm:px-6 lg:px-8">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        {" / "}
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {" / "}
        <span className="text-foreground">{product.title}</span>
      </nav>
      <ProductExperience product={product} />
      <ProductReviews productId={product.id} />
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
