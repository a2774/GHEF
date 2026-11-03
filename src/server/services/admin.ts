import { and, count, desc, eq, ilike, lte, notInArray, or, sql, sum } from "drizzle-orm";

import { cacheLife, cacheTag } from "next/cache";

import { db, withDbRetry } from "@/server/db";
import {
  categories,
  enquiries,
  newsletterSubscribers,
  orderItems,
  orders,
  orderStatus,
  payments,
  productImages,
  products,
  productVariants,
  returnRequests,
  users,
} from "@/server/db/schema";

import { adminDataTag } from "./admin-cache";

export const lowStockThreshold = 3;

export type OrderStatus = (typeof orderStatus.enumValues)[number];

export async function getDashboardData() {
  "use cache";
  cacheTag(adminDataTag);
  // Admin pages render from this cache, so links can prefetch them. Any change clears it.
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () => {
    // The queries below are independent, so they run together instead of one after another.
    const orderTotalsQuery = db.select({ total: count() }).from(orders);
    const revenueQuery = db
      .select({ total: sum(orders.totalPaise) })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));
    const productTotalsQuery = db.select({ total: count() }).from(products);
    const categoryTotalsQuery = db.select({ total: count() }).from(categories);
    const customerTotalsQuery = db.select({ total: count() }).from(users);
    const enquiryTotalsQuery = db.select({ total: count() }).from(enquiries);
    const newEnquiryTotalsQuery = db
      .select({ total: count() })
      .from(enquiries)
      .where(eq(enquiries.status, "new"));
    const subscriberTotalsQuery = db
      .select({ total: count() })
      .from(newsletterSubscribers);

    const lowStockQuery = db
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

    const recentOrdersQuery = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);

    const recentEnquiriesQuery = db
      .select()
      .from(enquiries)
      .orderBy(desc(enquiries.createdAt))
      .limit(4);

    const statusCountsQuery = db
      .select({ status: orders.status, total: count() })
      .from(orders)
      .groupBy(orders.status);

    const bestSellersQuery = db
      .select({
        title: orderItems.title,
        units: sql<number>`sum(${orderItems.quantity})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(notInArray(orders.status, ["cancelled", "refunded"]))
      .groupBy(orderItems.title)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5);

    const revenueByDayQuery = db
      .select({
        day: sql<string>`to_char(${orders.createdAt} at time zone 'Asia/Kolkata', 'YYYY-MM-DD')`,
        totalPaise: sql<number>`sum(${orders.totalPaise})::bigint`.mapWith(Number),
      })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "paid"),
          sql`${orders.createdAt} >= now() - interval '14 days'`,
        ),
      )
      .groupBy(sql`to_char(${orders.createdAt} at time zone 'Asia/Kolkata', 'YYYY-MM-DD')`)
      .orderBy(desc(sql`to_char(${orders.createdAt} at time zone 'Asia/Kolkata', 'YYYY-MM-DD')`));

    const [
      [orderTotals],
      [revenue],
      [productTotals],
      [categoryTotals],
      [customerTotals],
      [enquiryTotals],
      [newEnquiryTotals],
      [subscriberTotals],
      lowStock,
      recentOrders,
      recentEnquiries,
      statusCounts,
      bestSellers,
      revenueByDay,
    ] = await Promise.all([
      orderTotalsQuery,
      revenueQuery,
      productTotalsQuery,
      categoryTotalsQuery,
      customerTotalsQuery,
      enquiryTotalsQuery,
      newEnquiryTotalsQuery,
      subscriberTotalsQuery,
      lowStockQuery,
      recentOrdersQuery,
      recentEnquiriesQuery,
      statusCountsQuery,
      bestSellersQuery,
      revenueByDayQuery,
    ]);

    const countFor = (statuses: string[]) =>
      statusCounts
        .filter(({ status }) => statuses.includes(status))
        .reduce((total, row) => total + row.total, 0);

    return {
      orderCount: orderTotals.total,
      revenuePaise: Number(revenue.total ?? 0),
      productCount: productTotals.total,
      categoryCount: categoryTotals.total,
      customerCount: customerTotals.total,
      enquiryCount: enquiryTotals.total,
      newEnquiryCount: newEnquiryTotals.total,
      subscriberCount: subscriberTotals.total,
      pendingCount: countFor(["pending", "confirmed", "processing", "packed"]),
      completedCount: countFor(["delivered"]),
      lowStock,
      recentOrders,
      recentEnquiries,
      statusCounts,
      bestSellers,
      revenueByDay,
    };
  });
}

export async function listAdminProducts() {
  "use cache";
  cacheTag(adminDataTag);
  // Admin pages render from this cache, so links can prefetch them. Any change clears it.
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
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
      .groupBy(
        products.id,
        products.title,
        products.status,
        products.isFeatured,
        products.isBestseller,
        categories.name,
      )
      .orderBy(desc(products.createdAt)),
  );
}

export async function listCategories() {
  "use cache";
  cacheTag(adminDataTag);
  // Admin pages render from this cache, so links can prefetch them. Any change clears it.
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () =>
    db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        parentId: categories.parentId,
        productCount: count(products.id),
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .groupBy(categories.id, categories.name, categories.slug, categories.parentId)
      .orderBy(categories.name),
  );
}

export async function getAdminProduct(id: number) {
  "use cache";
  cacheTag(adminDataTag);
  // Admin pages render from this cache, so links can prefetch them. Any change clears it.
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () => {
    const [[product], variants, images] = await Promise.all([
      db.select().from(products).where(eq(products.id, id)),
      db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(productVariants.id),
      db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, id))
        .orderBy(desc(productImages.isPrimary), productImages.id),
    ]);
    if (!product) return null;
    return { product, variants, images };
  });
}

export async function listOrders(search: string, status: OrderStatus | undefined) {
  "use cache";
  cacheTag(adminDataTag);
  // Admin pages render from this cache, so links can prefetch them. Any change clears it.
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
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
  "use cache";
  cacheTag(adminDataTag);
  // Admin pages render from this cache, so links can prefetch them. Any change clears it.
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () => {
    const [[order], items, [returnRequest], paymentRows] = await Promise.all([
      db.select().from(orders).where(eq(orders.id, id)),
      db.select().from(orderItems).where(eq(orderItems.orderId, id)),
      db.select().from(returnRequests).where(eq(returnRequests.orderId, id)),
      db.select().from(payments).where(eq(payments.orderId, id)),
    ]);
    if (!order) return null;
    return { order, items, returnRequest: returnRequest ?? null, payments: paymentRows };
  });
}
