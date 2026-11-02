import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { siteUrl } from "@/lib/site";
import { getActiveProductSlugs } from "@/server/services/products";

import { policySlugs } from "./(store)/policies/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheTag("products");
  cacheLife("hours");

  let products: { slug: string }[] = [];
  try {
    products = await getActiveProductSlugs();
  } catch {
    products = [];
  }

  return [
    { url: siteUrl },
    { url: `${siteUrl}/products` },
    ...policySlugs.map((slug) => ({ url: `${siteUrl}/policies/${slug}` })),
    ...products.map(({ slug }) => ({ url: `${siteUrl}/products/${slug}` })),
  ];
}
