import { and, count, desc, eq, ilike, lte, or, sql, sum } from "drizzle-orm";

import { db, withDbRetry } from "@/server/db";
import {
  categories,
  orderItems,
  orders,
  orderStatus,
  productImages,
  products,
  productVariants,
} from "@/server/db/schema";

export const lowStockThreshold = 3;

export type OrderStatus = (typeof orderStatus.enumValues)[number];

export async function getDashboardData() {
  return withDbRetry(async () => {
    const [orderTotals] = await db.select({ total: count() }).from(orders);
    const [revenue] = await db
      .select({ total: sum(orders.totalPaise) })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));
    const [productTotals] = await db.select({ total: count() }).from(products);
    const lowStock = await db
      .select({
        id: productVariants.id,
        productId: products.id,
        title: products.title,
        size: productVariants.size,
        color: productVariants.color,
        stock: productVariants.stock,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(lte(productVariants.stock, lowStockThreshold))
      .orderBy(productVariants.stock)
      .limit(8);
    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
    const statusCounts = await db
      .select({ status: orders.status, total: count() })
      .from(orders)
      .groupBy(orders.status);

    return {
      orderCount: orderTotals.total,
      revenuePaise: Number(revenue.total ?? 0),
      productCount: productTotals.total,
      lowStock,
      recentOrders,
      statusCounts,
    };
  });
}

export async function listAdminProducts() {
  return withDbRetry(async () =>
    db
      .select({
        id: products.id,
        title: products.title,
        status: products.status,
        isFeatured: products.isFeatured,
        isBestseller: products.isBestseller,
        category: categories.name,
        stock: sql<number>`coalesce(sum(${productVariants.stock}), 0)::int`,
        variantCount: count(productVariants.id),
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .groupBy(products.id, categories.name)
      .orderBy(desc(products.createdAt)),
  );
}

export async function listCategories() {
  return withDbRetry(async () =>
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(categories.name),
  );
}

export async function getAdminProduct(id: number) {
  return withDbRetry(async () => {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return null;
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id))
      .orderBy(productVariants.id);
    const images = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(desc(productImages.isPrimary), productImages.id);
    return { product, variants, images };
  });
}

export async function listOrders(search: string, status: OrderStatus | undefined) {
  const term = `%${search.trim()}%`;
  return withDbRetry(async () =>
    db
      .select()
      .from(orders)
      .where(
        and(
          status ? eq(orders.status, status) : undefined,
          search.trim()
            ? or(
                ilike(orders.orderNumber, term),
                ilike(orders.customerName, term),
                ilike(orders.customerEmail, term),
                ilike(orders.customerPhone, term),
              )
            : undefined,
        ),
      )
      .orderBy(desc(orders.createdAt))
      .limit(100),
  );
}

export async function getAdminOrder(id: number) {
  return withDbRetry(async () => {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return null;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
    return { order, items };
  });
}
