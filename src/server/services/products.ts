import { and, asc, desc, eq, min } from "drizzle-orm";

import { db, withDbRetry } from "@/server/db";
import { categories, productImages, products, productVariants } from "@/server/db/schema";

export type ProductSummary = Awaited<ReturnType<typeof getFeaturedProducts>>[number];

export async function getFeaturedProducts(limit = 4) {
  return withDbRetry(async () =>
    db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        color: products.color,
        material: products.material,
        category: categories.name,
        priceFromPaise: min(productVariants.pricePaise),
        primaryImageId: productImages.publicId,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(
        productImages,
        and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)),
      )
      .where(and(eq(products.status, "active"), eq(products.isFeatured, true)))
      .groupBy(
        products.id,
        products.title,
        products.slug,
        products.color,
        products.material,
        categories.name,
        productImages.publicId,
      )
      .orderBy(asc(products.title))
      .limit(limit),
  );
}

export async function getActiveProductSlugs() {
  return withDbRetry(async () =>
    db.select({ slug: products.slug }).from(products).where(eq(products.status, "active")),
  );
}

export async function getProductBySlug(slug: string) {
  return withDbRetry(async () => {
    const [product] = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        description: products.description,
        material: products.material,
        category: categories.name,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.slug, slug), eq(products.status, "active")));
    if (!product) return null;

    const [variants, images] = await Promise.all([
      db
        .select({
          id: productVariants.id,
          size: productVariants.size,
          color: productVariants.color,
          pricePaise: productVariants.pricePaise,
          stock: productVariants.stock,
        })
        .from(productVariants)
        .where(eq(productVariants.productId, product.id))
        .orderBy(asc(productVariants.pricePaise)),
      db
        .select({ id: productImages.id, publicId: productImages.publicId, alt: productImages.alt })
        .from(productImages)
        .where(eq(productImages.productId, product.id))
        .orderBy(desc(productImages.isPrimary), asc(productImages.id)),
    ]);

    return { ...product, variants, images };
  });
}

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
