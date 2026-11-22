import { and, avg, count, desc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db, withDbRetry } from "@/server/db";
import { orderItems, orders, products, productVariants, reviews, users } from "@/server/db/schema";

import { adminDataTag } from "./admin-cache";

export async function getProductReviews(productId: number) {
  return withDbRetry(async () => {
    // The list and the average do not depend on each other, so they run together.
    const [rows, [summary]] = await Promise.all([
      db
        .select({
          id: reviews.id,
          rating: reviews.rating,
          body: reviews.body,
          name: users.name,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .innerJoin(users, eq(reviews.userId, users.id))
        .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
        .orderBy(desc(reviews.createdAt))
        .limit(20),
      db
        .select({ average: avg(reviews.rating), total: count() })
        .from(reviews)
        .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved"))),
    ]);
    return { rows, average: Number(summary.average ?? 0), total: summary.total };
  });
}

export async function hasPurchasedProduct(userId: string, productId: number) {
  const [row] = await withDbRetry(async () =>
    db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
      .where(
        and(
          eq(orders.userId, userId),
          eq(productVariants.productId, productId),
          inArray(orders.status, ["delivered", "return_requested", "returned", "refunded"]),
        ),
      )
      .limit(1),
  );
  return Boolean(row);
}

export async function listPendingReviews() {
  "use cache";
  cacheTag(adminDataTag);
  cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
  return withDbRetry(async () =>
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        body: reviews.body,
        product: products.title,
        customer: users.email,
      })
      .from(reviews)
      .innerJoin(products, eq(reviews.productId, products.id))
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.status, "pending"))
      .orderBy(desc(reviews.createdAt)),
  );
}
