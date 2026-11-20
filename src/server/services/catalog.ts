import { and, asc, count, desc, eq, exists, gte, ilike, inArray, lte, max, or, sql } from "drizzle-orm";

import { compareSizes, ROOMS } from "@/lib/catalog-taxonomy";
import { db, withDbRetry } from "@/server/db";
import { categories, orderItems, productImages, products, productVariants, reviews } from "@/server/db/schema";

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
  /** Only products with stock. With `outOfStock` also on, both are shown, as if neither was ticked. */
  inStock: boolean;
  /** Only products with no stock left. */
  outOfStock?: boolean;
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

// The category and its sub-categories in one round trip. Each trip to the database costs about
// 300 ms on a far-away host, so two queries here were slowing down every category page.
async function categoryIdsFor(slug: string) {
  const selected = db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug));
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(or(eq(categories.slug, slug), inArray(categories.parentId, selected)));
  return rows.map(({ id }) => id);
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
    if (filters.category && categoryIds.length === 0) {
      return { products: [], total: 0, inStockCount: 0, outOfStockCount: 0 };
    }

    const term = likeTerm(filters.q);
    // Everything except the stock choice, so the "In stock (n)" and "Out of stock (n)" counts
    // show what each choice would give on top of the other filters.
    const baseWhere = and(
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
      filters.room ? sql`${filters.room} = any(${products.rooms})` : undefined,
      filters.readyToDispatch ? eq(products.isReadyToDispatch, true) : undefined,
      filters.bestsellersOnly ? eq(products.isBestseller, true) : undefined,
      filters.onSale ? sql`${priced.mrpPaise} > ${priced.pricePaise}` : undefined,
    );
    const stockWhere =
      filters.inStock && !filters.outOfStock
        ? sql`${priced.stock} > 0`
        : filters.outOfStock && !filters.inStock
          ? sql`${priced.stock} = 0`
          : undefined;
    const where = and(baseWhere, stockWhere);

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

    const rowsQuery = db
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
        // Average of the approved reviews, for the stars on the card. Zero reviews means no stars.
        rating: sql<number>`(select coalesce(avg(r.rating), 0)::float from ${reviews} r
          where r.product_id = ${products.id} and r.status = 'approved')`.mapWith(Number),
        reviewCount: sql<number>`(select count(*)::int from ${reviews} r
          where r.product_id = ${products.id} and r.status = 'approved')`.mapWith(Number),
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

    const totalQuery = db
      .select({ total: count() })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(priced, eq(priced.productId, products.id))
      .where(where);

    const availabilityQuery = db
      .select({
        inStock: sql<number>`count(*) filter (where ${priced.stock} > 0)`.mapWith(Number),
        outOfStock: sql<number>`count(*) filter (where ${priced.stock} = 0)`.mapWith(Number),
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .innerJoin(priced, eq(priced.productId, products.id))
      .where(baseWhere);

    // The page of products, the total and the stock counts do not depend on each other.
    const [rows, [{ total }], [availability]] = await Promise.all([rowsQuery, totalQuery, availabilityQuery]);
    return {
      products: rows,
      total,
      inStockCount: availability?.inStock ?? 0,
      outOfStockCount: availability?.outOfStock ?? 0,
    };
  });
}

export async function getCatalogOptions() {
  return withDbRetry(async () => {
    const [allCategories, materials, variantOptions, [priceRange]] = await Promise.all([
      db
        .select({ id: categories.id, name: categories.name, slug: categories.slug, parentId: categories.parentId })
        .from(categories)
        .orderBy(asc(categories.name)),
      db
        .selectDistinct({ value: products.material })
        .from(products)
        .where(eq(products.status, "active"))
        .orderBy(asc(products.material)),
      db
        .selectDistinct({ color: productVariants.color, size: productVariants.size })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(eq(products.status, "active")),
      // The top of the price slider: the dearest size of any live product.
      db
        .select({ highest: max(productVariants.pricePaise) })
        .from(productVariants)
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(eq(products.status, "active")),
    ]);

    return {
      categories: allCategories,
      materials: materials.map(({ value }) => value),
      colors: [...new Set(variantOptions.map(({ color }) => color))].sort(),
      sizes: [...new Set(variantOptions.map(({ size }) => size))].sort(compareSizes),
      maxPricePaise: Number(priceRange?.highest ?? 0),
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

/**
 * Categories that have live products, each with the photo of one of its products, for the
 * homepage "Explore the collections" cards. A category with no product photo is left out, so
 * the cards never show a placeholder. Featured and newest products are picked first.
 */
export async function listCollectionCovers() {
  return withDbRetry(async () => {
    const rows = await db
      .select({
        name: categories.name,
        slug: categories.slug,
        total: count(products.id),
        coverId: sql<string | null>`(select pi.public_id from ${productImages} pi
          inner join ${products} cp on cp.id = pi.product_id
          where cp.category_id = ${categories.id} and cp.status = 'active'
          order by pi.is_primary desc, cp.is_featured desc, cp.created_at desc, pi.id
          limit 1)`,
      })
      .from(categories)
      .innerJoin(products, eq(products.categoryId, categories.id))
      .where(eq(products.status, "active"))
      .groupBy(categories.id, categories.name, categories.slug)
      .orderBy(desc(count(products.id)), asc(categories.name));

    return rows.flatMap(({ name, slug, total, coverId }) => (coverId ? [{ name, slug, total, coverId }] : []));
  });
}

/**
 * For the homepage "Shop by room" cards: every room (living room, bedroom and so on) that has a
 * live product tagged with it, each with a real photo of one of those products. The card uses it
 * when the room has no styled photo of its own (ROOM_PHOTOS). A room with no tagged product, or
 * none with a photo, is left out. Each room takes a photo no earlier room is using where it can:
 * first the cover photo of a product not yet shown, then any other photo, so the cards are not
 * all the same rug when the same products fit several rooms. One query serves every room.
 */
export async function listRoomCovers() {
  return withDbRetry(async () => {
    const rows = await db
      .select({ rooms: products.rooms, publicId: productImages.publicId, isPrimary: productImages.isPrimary })
      .from(products)
      .innerJoin(productImages, eq(productImages.productId, products.id))
      .where(eq(products.status, "active"))
      .orderBy(
        desc(products.isFeatured),
        desc(products.createdAt),
        asc(products.id),
        desc(productImages.isPrimary),
        asc(productImages.id),
      )
      .limit(400);

    const used = new Set<string>();
    return ROOMS.flatMap(({ slug, name }) => {
      const matches = rows.filter(({ rooms }) => rooms.includes(slug));
      if (matches.length === 0) return [];

      const pick =
        matches.find(({ isPrimary, publicId }) => isPrimary && !used.has(publicId)) ??
        matches.find(({ publicId }) => !used.has(publicId)) ??
        matches[0];
      used.add(pick.publicId);
      return [{ slug, name, coverId: pick.publicId }];
    });
  });
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
