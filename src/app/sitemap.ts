import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { siteUrl } from "@/lib/site";
import { getActiveProductSlugs } from "@/server/services/products";

import { policySlugs } from "./(store)/policies/content";
import { serviceSlugs } from "./(store)/services/content";

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
    { url: `${siteUrl}/about` },
    { url: `${siteUrl}/our-store` },
    { url: `${siteUrl}/contact` },
    { url: `${siteUrl}/track` },
    ...serviceSlugs.map((slug) => ({ url: `${siteUrl}/services/${slug}` })),
    ...policySlugs.map((slug) => ({ url: `${siteUrl}/policies/${slug}` })),
    ...products.map(({ slug }) => ({ url: `${siteUrl}/products/${slug}` })),
  ];
}
