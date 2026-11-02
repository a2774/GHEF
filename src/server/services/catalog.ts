import { and, asc, count, desc, eq, exists, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";

import { compareSizes } from "@/lib/catalog-taxonomy";
import { db, withDbRetry } from "@/server/db";
import { categories, orderItems, productImages, products, productVariants } from "@/server/db/schema";

export const catalogPageSize = 24;

export const catalogSorts = {
  featured: "Featured",
  bestselling: "Best selling",
  newest: "Newest",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
  discount: "Biggest discount",
} as const;

export type CatalogSort = keyof typeof catalogSorts;

export type CatalogFilters = {
  q: string;
  category: string;
  material: string;
  color: string;
  size: string;
  minPaise?: number;
  maxPaise?: number;
  inStock: boolean;
  /** Room slug from ROOMS, e.g. "living-room". */
  room?: string;
  readyToDispatch?: boolean;
  onSale?: boolean;
  bestsellersOnly?: boolean;
  sort: CatalogSort;
  page: number;
  limit?: number;
};

export function emptyFilters(overrides: Partial<CatalogFilters> = {}): CatalogFilters {
  return { q: "", category: "", material: "", color: "", size: "", inStock: false, sort: "featured", page: 1, ...overrides };
}

function likeTerm(value: string) {
  return `%${value.replace(/[\\%_]/g, "\\$&")}%`;
}

async function categoryIdsFor(slug: string) {
  const [category] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug));
  if (!category) return [];

  const children = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.parentId, category.id));
  return [category.id, ...children.map(({ id }) => id)];
}

export async function listCatalogProducts(filters: CatalogFilters) {
  return withDbRetry(async () => {
    const variantFilters = and(
      filters.color ? eq(productVariants.color, filters.color) : undefined,
      filters.size ? eq(productVariants.size, filters.size) : undefined,
    );
    const priced = db
      .select({
        productId: productVariants.productId,
        pricePaise: sql<number>`min(${productVariants.pricePaise})`.mapWith(Number).as("price_paise"),
        mrpPaise: sql<number>`min(${productVariants.mrpPaise})`.mapWith(Number).as("mrp_paise"),
        stock: sql<number>`sum(${productVariants.stock})`.mapWith(Number).as("total_stock"),
      })
      .from(productVariants)
      .where(variantFilters)
      .groupBy(productVariants.productId)
      .as("priced");

    const categoryIds = filters.category ? await categoryIdsFor(filters.category) : [];
    if (filters.category && categoryIds.length === 0) return { products: [], total: 0 };

    const term = likeTerm(filters.q);
    const where = and(
      eq(products.status, "active"),
      categoryIds.length > 0 ? inArray(products.categoryId, categoryIds) : undefined,
      filters.material ? eq(products.material, filters.material) : undefined,
      filters.q
        ? or(
            ilike(products.title, term),
            ilike(products.material, term),
            ilike(categories.name, term),
            exists(
              db
                .select({ id: productVariants.id })
                .from(productVariants)
                .where(
                  and(
                    eq(productVariants.productId, products.id),
                    or(
                      ilike(productVariants.sku, term),
                      ilike(productVariants.color, term),
                      ilike(productVariants.size, term),
                    ),
                  ),
                ),
            ),
          )
        : undefined,
      filters.minPaise !== undefined ? gte(priced.pricePaise, filters.minPaise) : undefined,
      filters.maxPaise !== undefined ? lte(priced.pricePaise, filters.maxPaise) : undefined,
      filters.inStock ? sql`${priced.stock} > 0` : undefined,
      filters.room ? sql`${filters.room} = any(${products.rooms})` : undefined,
      filters.readyToDispatch ? eq(products.isReadyToDispatch, true) : undefined,
      filters.bestsellersOnly ? eq(products.isBestseller, true) : undefined,
      filters.onSale ? sql`${priced.mrpPaise} > ${priced.pricePaise}` : undefined,
    );

    const sold = sql`(select coalesce(sum(${orderItems.quantity}), 0) from ${orderItems}
      inner join ${productVariants} sv on sv.id = ${orderItems.variantId}
      where sv.product_id = ${products.id})`;

    const orderBy = {
      featured: desc(sql`(${products.isFeatured}::int + ${products.isBestseller}::int)`),
      bestselling: desc(sql`(${sold}) + ${products.isBestseller}::int`),
      newest: desc(products.createdAt),
      price_asc: asc(priced.pricePaise),
      price_desc: desc(priced.pricePaise),
      discount: desc(sql`(${priced.mrpPaise} - ${priced.pricePaise})::float / nullif(${priced.mrpPaise}, 0)`),
    }[filters.sort];

    const rows = await db
      .select({
        id: products.id,
        title: products.title,
        slug: products.slug,
        color: products.color,
        category: categories.name,
        priceFromPaise: priced.pricePaise,
        mrpFromPaise: priced.mrpPaise,
        stock: priced.stock,
        isBestseller: products.isBestseller,
        isReadyToDispatch: products.isReadyToDispatch,
        primaryImageId: productImages.publicId,
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(priced, eq(priced.productId, products.id))
      .leftJoin(
        productImages,
        and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)),
      )
      .where(where)
      .orderBy(orderBy, desc(products.createdAt), asc(products.id))
      .limit(filters.limit ?? catalogPageSize)
      .offset((filters.page - 1) * (filters.limit ?? catalogPageSize));

    const [{ total }] = await db
      .select({ total: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(priced, eq(priced.productId, products.id))
      .where(where);

    return { products: rows, total };
  });
}

export async function getCatalogOptions() {
  return withDbRetry(async () => {
    const allCategories = await db
      .select({ id: categories.id, name: categories.name, slug: categories.slug, parentId: categories.parentId })
      .from(categories)
      .orderBy(asc(categories.name));
    const materials = await db
      .selectDistinct({ value: products.material })
      .from(products)
      .where(eq(products.status, "active"))
      .orderBy(asc(products.material));
    const variantOptions = await db
      .selectDistinct({ color: productVariants.color, size: productVariants.size })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(products.status, "active"));

    return {
      categories: allCategories,
      materials: materials.map(({ value }) => value),
      colors: [...new Set(variantOptions.map(({ color }) => color))].sort(),
      sizes: [...new Set(variantOptions.map(({ size }) => size))].sort(compareSizes),
    };
  });
}

/** Top level categories that have at least one live product, for menus. */
export async function listNavCategories() {
  return withDbRetry(async () =>
    db
      .selectDistinct({ name: categories.name, slug: categories.slug })
      .from(categories)
      .innerJoin(products, eq(products.categoryId, categories.id))
      .where(eq(products.status, "active"))
      .orderBy(asc(categories.name)),
  );
}

/** Categories with the most live products, for the homepage rails. */
export async function listTopCategories(limit: number) {
  return withDbRetry(async () =>
    db
      .select({ name: categories.name, slug: categories.slug, total: count(products.id) })
      .from(categories)
      .innerJoin(products, eq(products.categoryId, categories.id))
      .where(eq(products.status, "active"))
      .groupBy(categories.id, categories.name, categories.slug)
      .orderBy(desc(count(products.id)), asc(categories.name))
      .limit(limit),
  );
}
