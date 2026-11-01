"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/server/auth/customer";
import { db, withDbRetry } from "@/server/db";
import {
  cartItems,
  carts,
  coupons,
  products,
  productVariants,
  wishlistItems,
} from "@/server/db/schema";
import { getCart, getCartCount, getWishlistProductIds } from "@/server/services/cart";
import { evaluateCoupon } from "@/server/services/pricing";

export type CartResult = { ok: true; count: number } | { ok: false; error: string };

const quantitySchema = z.number().int().min(1).max(50);

const loginError = { ok: false, error: "Log in to continue." } as const;

async function currentUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

function refreshCartPages() {
  revalidatePath("/cart");
  revalidatePath("/wishlist");
}

export async function getCustomerState() {
  const userId = await currentUserId();
  if (!userId) return { cartCount: 0, wishlistIds: [] as number[] };
  const [cartCount, wishlistIds] = await Promise.all([
    getCartCount(userId),
    getWishlistProductIds(userId),
  ]);
  return { cartCount, wishlistIds };
}

export async function addToCart(variantId: number, quantity: number): Promise<CartResult> {
  const userId = await currentUserId();
  if (!userId) return loginError;
  if (!quantitySchema.safeParse(quantity).success) return { ok: false, error: "Choose a valid quantity." };

  const [variant] = await withDbRetry(async () =>
    db
      .select({ stock: productVariants.stock, status: products.status })
      .from(productVariants)
      .innerJoin(products, eq(productVariants.productId, products.id))
      .where(eq(productVariants.id, variantId)),
  );
  if (!variant || variant.status !== "active") return { ok: false, error: "This item is not available." };
  if (variant.stock === 0) return { ok: false, error: "This item is out of stock." };

  await withDbRetry(async () =>
    db
      .insert(cartItems)
      .values({ userId, variantId, quantity: Math.min(quantity, variant.stock) })
      .onConflictDoUpdate({
        target: [cartItems.userId, cartItems.variantId],
        set: { quantity: sql`least(${cartItems.quantity} + ${quantity}, ${variant.stock})` },
      }),
  );

  refreshCartPages();
  return { ok: true, count: await getCartCount(userId) };
}

export async function updateCartQuantity(itemId: number, quantity: number): Promise<CartResult> {
  const userId = await currentUserId();
  if (!userId) return loginError;
  if (!quantitySchema.safeParse(quantity).success) return { ok: false, error: "Choose a valid quantity." };

  const [item] = await withDbRetry(async () =>
    db
      .select({ stock: productVariants.stock })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId))),
  );
  if (!item) return { ok: false, error: "This item is no longer in your cart." };
  if (quantity > item.stock) return { ok: false, error: `Only ${item.stock} available.` };

  await withDbRetry(async () =>
    db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId))),
  );

  refreshCartPages();
  return { ok: true, count: await getCartCount(userId) };
}

export async function removeCartItem(itemId: number): Promise<CartResult> {
  const userId = await currentUserId();
  if (!userId) return loginError;

  await withDbRetry(async () =>
    db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId))),
  );

  refreshCartPages();
  return { ok: true, count: await getCartCount(userId) };
}

export async function applyCoupon(code: string): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return loginError;

  const normalized = code.trim().toUpperCase().slice(0, 40);
  const [coupon] = await withDbRetry(async () =>
    db.select().from(coupons).where(eq(coupons.code, normalized)),
  );
  if (!coupon) return { ok: false, error: "That coupon code is not valid." };

  const { totals } = await getCart(userId);
  const result = evaluateCoupon(coupon, totals.subtotalPaise);
  if (!result.ok) return result;

  await withDbRetry(async () =>
    db
      .insert(carts)
      .values({ userId, couponId: coupon.id })
      .onConflictDoUpdate({
        target: carts.userId,
        set: { couponId: coupon.id, updatedAt: new Date() },
      }),
  );
  revalidatePath("/cart");
  return { ok: true };
}

export async function removeCoupon() {
  const userId = await currentUserId();
  if (!userId) return;

  await withDbRetry(async () =>
    db.update(carts).set({ couponId: null }).where(eq(carts.userId, userId)),
  );
  revalidatePath("/cart");
}

export async function addToWishlist(productId: number): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return loginError;

  const [product] = await withDbRetry(async () =>
    db.select({ id: products.id }).from(products).where(eq(products.id, productId)),
  );
  if (!product) return { ok: false, error: "This item is not available." };

  await withDbRetry(async () =>
    db.insert(wishlistItems).values({ userId, productId }).onConflictDoNothing(),
  );
  refreshCartPages();
  return { ok: true };
}

export async function removeFromWishlist(productId: number): Promise<{ ok: boolean; error?: string }> {
  const userId = await currentUserId();
  if (!userId) return loginError;

  await withDbRetry(async () =>
    db
      .delete(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId))),
  );
  refreshCartPages();
  return { ok: true };
}
