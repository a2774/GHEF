import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductExperience } from "@/components/store/product-experience";
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
  return {
    title: product ? `${product.title} | Ganga Handmade Export` : "Ganga Handmade Export",
    description: product?.description,
  };
}

async function Product({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  return <ProductExperience product={product} />;
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
