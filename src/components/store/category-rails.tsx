import { cacheLife, cacheTag } from "next/cache";

import { describeDbError } from "@/lib/db-error";
import { listTopCategories } from "@/server/services/catalog";

import { ProductRail } from "./product-rail";

async function loadTopCategories(count: number) {
  "use cache";
  cacheTag("products");
  cacheLife("hours");
  return listTopCategories(count);
}

export async function CategoryRails({ count = 2 }: { count?: number }) {
  let top: Awaited<ReturnType<typeof listTopCategories>> = [];
  try {
    top = await loadTopCategories(count);
  } catch (error) {
    console.error(`Could not load category rails: ${describeDbError(error)}`);
  }

  return top.map(({ name, slug }) => (
    <ProductRail
      key={slug}
      title={`${name}.`}
      href={`/products?category=${slug}`}
      filters={{ category: slug, sort: "bestselling" }}
    />
  ));
}
