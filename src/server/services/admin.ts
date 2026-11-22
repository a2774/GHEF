import { and, asc, count, desc, eq, gte, ilike, inArray, lte, notInArray, or, sql, sum } from "drizzle-orm";

import { cacheLife, cacheTag } from "next/cache";

import { db, withDbRetry } from "@/server/db";
import {
  adminUsers,
  auditLogs,
  banners,
  categories,
  coupons,
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
import { getStoreSettings } from "./settings";

export const lowStockThreshold = 3;

export type OrderStatus = (typeof orderStatus.enumValues)[number];

/** The date buttons on the Orders page. "custom" uses the from and to dates. */
export type OrderRange = "all" | "24h" | "7d" | "30d" | "90d" | "365d" | "custom";
export const orderRanges: readonly OrderRange[] = ["all", "24h", "7d", "30d", "90d", "365d", "custom"];
const rangeHours = { "24h": 24, "7d": 168, "30d": 720, "90d": 2160, "365d": 8760 } as const;

/** The statuses of an order that has not been shipped yet: it still needs the owner. */
export const ordersToProcessStatuses = ["pending", "confirmed", "processing", "packed"] as const;

/** How many orders are not shipped yet (the number on "Orders" in the sidebar). Read fresh from the database. */
export async function countOrdersToProcess(): Promise<number> {
  const [row] = await withDbRetry(async () =>
    db.select({ total: count() }).from(orders).where(inArray(orders.status, [...ordersToProcessStatuses])),
  );
  return row?.total ?? 0;
}

/** The same number for the page load: cached, and cleared by every new order and every change in the panel. */
export async function getOrdersToProcessCount(): Promise<number> {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  return countOrdersToProcess();
}

/** An order with the pieces it contains, so the list can show what was bought without opening it. */
export type OrderRow = typeof orders.$inferSelect & {
  items: { title: string; size: string; color: string; quantity: number }[];
};

async function withOrderItems(rows: (typeof orders.$inferSelect)[]): Promise<OrderRow[]> {
  if (rows.length === 0) return [];
  const items = await db
    .select({
      orderId: orderItems.orderId,
      title: orderItems.title,
      size: orderItems.size,
      color: orderItems.color,
      quantity: orderItems.quantity,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((row) => row.id)))
    .orderBy(asc(orderItems.id));

  const byOrder = new Map<number, OrderRow["items"]>();
  for (const { orderId, ...item } of items) {
    byOrder.set(orderId, [...(byOrder.get(orderId) ?? []), item]);
  }
  return rows.map((row) => ({ ...row, items: byOrder.get(row.id) ?? [] }));
}

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
      recentOrders: await withOrderItems(recentOrders),
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
        slug: products.slug,
        status: products.status,
        isFeatured: products.isFeatured,
        isBestseller: products.isBestseller,
        category: categories.name,
        // The cover photo, as a subquery so a product with several images never repeats a row.
        primaryImageId: sql<string | null>`(select ${productImages.publicId} from ${productImages}
          where ${productImages.productId} = ${products.id}
          order by ${productImages.isPrimary} desc, ${productImages.id} limit 1)`,
        stock: sql<number>`coalesce(sum(${productVariants.stock}), 0)::int`,
        variantCount: count(productVariants.id),
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .groupBy(
        products.id,
        products.title,
        products.slug,
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

export async function listOrders(
  search: string,
  status: OrderStatus | undefined,
  range: OrderRange = "all",
  from = "",
  to = "",
) {
  "use cache";
  cacheTag(adminDataTag);
  // Cleared by every new order and every change in the panel. The browser keeps the page for only
  // 30 seconds (the shortest allowed), so a new order shows when the owner next opens the page,
  // not 5 minutes later.
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
  const term = `%${search.trim()}%`;

  // "24h", "7d" ... count back from now in the database; "custom" uses whole days in Indian time.
  const recent = range !== "all" && range !== "custom" ? rangeHours[range] : null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
  const since = range === "custom" && dateOnly.test(from) ? new Date(`${from}T00:00:00+05:30`) : null;
  const until = range === "custom" && dateOnly.test(to) ? new Date(`${to}T23:59:59.999+05:30`) : null;

  const rows = await withDbRetry(async () =>
    db
      .select()
      .from(orders)
      .where(
        and(
          status ? eq(orders.status, status) : undefined,
          recent ? gte(orders.createdAt, sql`now() - make_interval(hours => ${recent})`) : undefined,
          since ? gte(orders.createdAt, since) : undefined,
          until ? lte(orders.createdAt, until) : undefined,
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
  return withDbRetry(async () => withOrderItems(rows));
}

export async function getAdminOrder(id: number) {
  "use cache";
  cacheTag(adminDataTag);
  // Like the orders list: cleared by every change, and kept in the browser for 30 seconds only.
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 });
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

// ---------------------------------------------------------------------------
// The lists on the other admin pages. Like the ones above they come from the cache, so a page opens
// at once and can be loaded before the click. The cache is cleared (tag "admin") by every save in
// the panel and by every customer action that changes what these pages show.
// ---------------------------------------------------------------------------

export async function listCustomers(search: string) {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  const term = `%${search.trim().replace(/[\%_]/g, "\$&")}%`;
  return withDbRetry(async () =>
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt,
        orderCount: count(orders.id),
      })
      .from(users)
      .leftJoin(orders, eq(orders.userId, users.id))
      .where(
        search.trim() ? or(ilike(users.name, term), ilike(users.email, term), ilike(users.phone, term)) : undefined,
      )
      .groupBy(users.id, users.name, users.email, users.phone, users.createdAt)
      .orderBy(desc(users.createdAt))
      .limit(100),
  );
}

export async function listInventory() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () =>
    db
      .select({
        id: productVariants.id,
        title: products.title,
        size: productVariants.size,
        color: productVariants.color,
        sku: productVariants.sku,
        stock: productVariants.stock,
      })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .orderBy(asc(productVariants.stock), asc(products.title)),
  );
}

export async function listPayments() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () =>
    db
      .select({
        id: payments.id,
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        status: payments.status,
        amountPaise: payments.amountPaise,
        providerPaymentId: payments.providerPaymentId,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .orderBy(desc(payments.createdAt))
      .limit(100),
  );
}

export async function listReturns() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () =>
    db
      .select({
        id: returnRequests.id,
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        customer: orders.customerName,
        reason: returnRequests.reason,
        status: returnRequests.status,
        createdAt: returnRequests.createdAt,
      })
      .from(returnRequests)
      .innerJoin(orders, eq(returnRequests.orderId, orders.id))
      .orderBy(desc(returnRequests.createdAt))
      .limit(100),
  );
}

export async function listAdminBanners() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () => db.select().from(banners).orderBy(asc(banners.position), asc(banners.id)));
}

export async function listAdminCoupons() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () => db.select().from(coupons).orderBy(desc(coupons.createdAt)));
}

export async function listTeam() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () =>
    db
      .select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
      })
      .from(adminUsers)
      .orderBy(asc(adminUsers.createdAt)),
  );
}

/** The store settings as the admin settings page shows them. */
export async function getAdminSettings() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return getStoreSettings();
}

/** The latest entries of the audit trail. Every entry is written by logAdminAction, which also clears this cache. */
export async function listAuditLogs() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () => db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200));
}
