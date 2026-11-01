import { randomInt } from "node:crypto";

import { and, desc, eq, sql } from "drizzle-orm";

import { db, withDbRetry } from "@/server/db";
import {
  addresses,
  cartItems,
  carts,
  coupons,
  orderItems,
  orders,
  payments,
  products,
  productVariants,
  returnRequests,
  users,
} from "@/server/db/schema";

import { notifyOwner } from "./notifications";
import { canCustomerCancel, canTransition, type OrderStatus } from "./order-rules";
import { calculateTotals, evaluateCoupon } from "./pricing";
import { getStoreSettings } from "./settings";

export class OrderError extends Error {}

export type PaymentMethod = "cod" | "razorpay";

export function isServiceablePincode(pincode: string) {
  return /^[1-9]\d{5}$/.test(pincode);
}

function createOrderNumber() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `GHE-${date}-${randomInt(100_000, 999_999)}`;
}

function formatAddress(address: typeof addresses.$inferSelect) {
  return [
    address.house,
    address.locality,
    address.landmark,
    `${address.city}, ${address.state} ${address.pincode}`,
    `Phone: ${address.phone}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export async function placeOrder(
  userId: string,
  input: { addressId: number; method: PaymentMethod; idempotencyKey: string },
) {
  const { codEnabled, shippingPaise } = await getStoreSettings();
  if (input.method === "cod" && !codEnabled) {
    throw new OrderError("Cash on delivery is not available.");
  }

  const result = await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(orders)
        .where(and(eq(orders.idempotencyKey, input.idempotencyKey), eq(orders.userId, userId)));
      if (existing) return { order: existing, created: false };

      const [address] = await tx
        .select()
        .from(addresses)
        .where(and(eq(addresses.id, input.addressId), eq(addresses.userId, userId)));
      if (!address) throw new OrderError("Choose a delivery address.");
      if (!isServiceablePincode(address.pincode)) {
        throw new OrderError("We cannot deliver to this PIN code.");
      }

      const [user] = await tx.select({ email: users.email }).from(users).where(eq(users.id, userId));
      if (!user) throw new OrderError("Log in to continue.");

      const lines = await tx
        .select({
          variantId: productVariants.id,
          quantity: cartItems.quantity,
          stock: productVariants.stock,
          unitPricePaise: productVariants.pricePaise,
          size: productVariants.size,
          color: productVariants.color,
          sku: productVariants.sku,
          title: products.title,
          status: products.status,
        })
        .from(cartItems)
        .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
        .innerJoin(products, eq(productVariants.productId, products.id))
        .where(eq(cartItems.userId, userId))
        .for("update", { of: productVariants });

      if (lines.length === 0) throw new OrderError("Your cart is empty.");
      for (const line of lines) {
        if (line.status !== "active" || line.stock < line.quantity) {
          throw new OrderError(`${line.title} is no longer available in that quantity. Update your cart.`);
        }
      }

      const { subtotalPaise } = calculateTotals(lines);
      const [saved] = await tx
        .select({ coupon: coupons })
        .from(carts)
        .innerJoin(coupons, eq(carts.couponId, coupons.id))
        .where(eq(carts.userId, userId))
        .for("update", { of: coupons });

      let discountPaise = 0;
      if (saved) {
        const evaluation = evaluateCoupon(saved.coupon, subtotalPaise);
        if (!evaluation.ok) throw new OrderError(evaluation.error);
        discountPaise = evaluation.discountPaise;
      }

      const totals = calculateTotals(lines, discountPaise);
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: createOrderNumber(),
          userId,
          idempotencyKey: input.idempotencyKey,
          customerName: address.fullName,
          customerEmail: user.email,
          customerPhone: address.phone,
          shippingAddress: formatAddress(address),
          status: input.method === "cod" ? "confirmed" : "pending",
          paymentMethod: input.method === "cod" ? "Cash on delivery" : "Razorpay",
          subtotalPaise: totals.subtotalPaise,
          discountPaise: totals.discountPaise,
          shippingPaise,
          totalPaise: totals.totalPaise + shippingPaise,
        })
        .returning();

      await tx.insert(orderItems).values(
        lines.map((line) => ({
          orderId: order.id,
          variantId: line.variantId,
          title: line.title,
          size: line.size,
          color: line.color,
          sku: line.sku,
          unitPricePaise: line.unitPricePaise,
          quantity: line.quantity,
        })),
      );

      for (const line of lines) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${line.quantity}` })
          .where(eq(productVariants.id, line.variantId));
      }

      if (saved) {
        await tx
          .update(coupons)
          .set({ usedCount: sql`${coupons.usedCount} + 1` })
          .where(eq(coupons.id, saved.coupon.id));
      }

      if (input.method === "cod") await clearCart(tx, userId);
      return { order, created: true };
    }),
  );

  if (result.created && input.method === "cod") await announceOrder(result.order);
  return result.order;
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function clearCart(tx: Transaction, userId: string) {
  await tx.delete(cartItems).where(eq(cartItems.userId, userId));
  await tx.update(carts).set({ couponId: null }).where(eq(carts.userId, userId));
}

async function announceOrder(order: typeof orders.$inferSelect) {
  await notifyOwner({
    subject: `New order ${order.orderNumber}`,
    text: `${order.customerName} placed order ${order.orderNumber} by ${order.paymentMethod}.`,
    replyTo: order.customerEmail,
  });
}

async function restock(tx: Transaction, orderId: number) {
  const items = await tx
    .select({ variantId: orderItems.variantId, quantity: orderItems.quantity })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
  for (const { variantId, quantity } of items) {
    if (!variantId) continue;
    await tx
      .update(productVariants)
      .set({ stock: sql`${productVariants.stock} + ${quantity}` })
      .where(eq(productVariants.id, variantId));
  }
}

export async function cancelOrderById(orderId: number, userId?: string) {
  return withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), userId ? eq(orders.userId, userId) : undefined))
        .for("update");
      if (!order) throw new OrderError("Order not found.");

      const allowed = userId ? canCustomerCancel(order.status) : canTransition(order.status, "cancelled");
      if (!allowed) throw new OrderError("This order can no longer be cancelled.");

      await tx
        .update(orders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
      await restock(tx, orderId);
    }),
  );
}

export async function recordPayment(orderId: number, providerOrderId: string, amountPaise: number) {
  await withDbRetry(async () =>
    db
      .insert(payments)
      .values({ orderId, provider: "razorpay", providerOrderId, amountPaise })
      .onConflictDoNothing(),
  );
}

// Safe to call twice: the browser callback and the webhook can both report one payment.
export async function markPaymentPaid(providerOrderId: string, providerPaymentId: string) {
  const order = await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [payment] = await tx
        .select()
        .from(payments)
        .where(eq(payments.providerOrderId, providerOrderId))
        .for("update");
      if (!payment) throw new OrderError("Payment not found.");
      if (payment.status === "paid") return null;

      await tx
        .update(payments)
        .set({ status: "paid", providerPaymentId, updatedAt: new Date() })
        .where(eq(payments.id, payment.id));
      const [updated] = await tx
        .update(orders)
        .set({ paymentStatus: "paid", status: "confirmed", updatedAt: new Date() })
        .where(and(eq(orders.id, payment.orderId), eq(orders.status, "pending")))
        .returning();
      if (updated?.userId) await clearCart(tx, updated.userId);
      return updated ?? null;
    }),
  );
  if (order) await announceOrder(order);
}

// Safe to call twice: stock is returned only on the first failure.
export async function markPaymentFailed(providerOrderId: string) {
  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [payment] = await tx
        .select()
        .from(payments)
        .where(eq(payments.providerOrderId, providerOrderId))
        .for("update");
      if (!payment || payment.status !== "created") return;

      await tx
        .update(payments)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(payments.id, payment.id));
      const cancelled = await tx
        .update(orders)
        .set({ status: "cancelled", paymentStatus: "failed", updatedAt: new Date() })
        .where(and(eq(orders.id, payment.orderId), eq(orders.status, "pending")))
        .returning({ id: orders.id });
      if (cancelled.length > 0) await restock(tx, payment.orderId);
    }),
  );
}

export async function requestReturn(orderId: number, userId: string, reason: string) {
  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [order] = await tx
        .select({ status: orders.status })
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .for("update");
      if (!order || !canTransition(order.status, "return_requested")) {
        throw new OrderError("This order cannot be returned.");
      }
      await tx.insert(returnRequests).values({ orderId, reason });
      await tx
        .update(orders)
        .set({ status: "return_requested", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }),
  );
}

export async function listCustomerOrders(userId: string) {
  return withDbRetry(async () =>
    db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)),
  );
}

export async function getCustomerOrder(userId: string, orderNumber: string) {
  return withDbRetry(async () => {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, userId)));
    if (!order) return null;

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const [returnRequest] = await db
      .select()
      .from(returnRequests)
      .where(eq(returnRequests.orderId, order.id));
    return { order, items, returnRequest: returnRequest ?? null };
  });
}

export type { OrderStatus };
