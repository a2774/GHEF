import { and, desc, eq, sql } from "drizzle-orm";

import { db, withDbRetry } from "@/server/db";
import {
  cartItems,
  carts,
  coupons,
  productImages,
  products,
  productVariants,
  wishlistItems,
} from "@/server/db/schema";

import { calculateTotals, evaluateCoupon } from "./pricing";

export async function getCartCount(userId: string) {
  const [row] = await withDbRetry(async () =>
    db
      .select({ total: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int` })
      .from(cartItems)
      .where(eq(cartItems.userId, userId)),
  );
  return row.total;
}

export async function getCart(userId: string) {
  return withDbRetry(async () => {
    const rows = await db
      .select({
        id: cartItems.id,
        variantId: productVariants.id,
        quantity: cartItems.quantity,
        title: products.title,
        slug: products.slug,
        status: products.status,
        size: productVariants.size,
        color: productVariants.color,
        unitPricePaise: productVariants.pricePaise,
        stock: productVariants.stock,
        imageId: productImages.publicId,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(
        productImages,
        and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)),
      )
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.createdAt));

    const lines = rows.map((row) => ({
      ...row,
      available: row.status === "active" && row.stock > 0,
      billableQuantity: row.status === "active" ? Math.min(row.quantity, row.stock) : 0,
    }));
    const billable = lines.map(({ unitPricePaise, billableQuantity }) => ({
      unitPricePaise,
      quantity: billableQuantity,
    }));
    const { subtotalPaise } = calculateTotals(billable);

    const [saved] = await db
      .select({ coupon: coupons })
      .from(carts)
      .innerJoin(coupons, eq(carts.couponId, coupons.id))
      .where(eq(carts.userId, userId));

    const evaluation = saved ? evaluateCoupon(saved.coupon, subtotalPaise) : null;
    const totals = calculateTotals(billable, evaluation?.ok ? evaluation.discountPaise : 0);

    return {
      lines,
      totals,
      coupon: saved
        ? {
            code: saved.coupon.code,
            error: evaluation && !evaluation.ok ? evaluation.error : null,
          }
        : null,
      canCheckout: lines.some(({ billableQuantity }) => billableQuantity > 0),
    };
  });
}

export async function getWishlistProductIds(userId: string) {
  const rows = await withDbRetry(async () =>
    db
      .select({ productId: wishlistItems.productId })
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId)),
  );
  return rows.map(({ productId }) => productId);
}

export async function getWishlist(userId: string) {
  return withDbRetry(async () =>
    db
      .select({
        productId: products.id,
        title: products.title,
        slug: products.slug,
        status: products.status,
        color: products.color,
        category: sql<string>`''`,
        priceFromPaise: sql<number>`(select min(v.price_paise) from product_variants v where v.product_id = ${products.id})`.mapWith(Number),
        cheapestVariantId: sql<number>`(select v.id from product_variants v where v.product_id = ${products.id} and v.stock > 0 order by v.price_paise limit 1)`,
        stock: sql<number>`(select coalesce(sum(v.stock), 0) from product_variants v where v.product_id = ${products.id})`.mapWith(Number),
        primaryImageId: productImages.publicId,
      })
      .from(wishlistItems)
      .innerJoin(products, eq(wishlistItems.productId, products.id))
      .leftJoin(
        productImages,
        and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true)),
      )
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.createdAt)),
  );
}
