"use server";

import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orderItems, orders, orderStatus, paymentStatus, productVariants } from "@/server/db/schema";

type OrderStatusValue = (typeof orderStatus.enumValues)[number];
type PaymentStatusValue = (typeof paymentStatus.enumValues)[number];

function oneOf<T extends string>(value: FormDataEntryValue | null, allowed: readonly T[]) {
  return allowed.find((option) => option === value);
}

function optionalText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim() || null;
}

function refreshOrder(id: number) {
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updateOrder(id: number, form: FormData) {
  await requireAdmin();

  const status = oneOf<OrderStatusValue>(form.get("status"), orderStatus.enumValues);
  const payment = oneOf<PaymentStatusValue>(form.get("paymentStatus"), paymentStatus.enumValues);
  // Cancelling goes through cancelOrder so that stock is returned.
  if (!status || !payment || status === "cancelled") return;

  await withDbRetry(async () =>
    db
      .update(orders)
      .set({
        status,
        paymentStatus: payment,
        courier: optionalText(form.get("courier")),
        trackingNumber: optionalText(form.get("trackingNumber")),
        notes: optionalText(form.get("notes")),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id)),
  );
  refreshOrder(id);
}

export async function cancelOrder(id: number) {
  await requireAdmin();

  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const cancelled = await tx
        .update(orders)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(orders.id, id), inArray(orders.status, ["pending", "confirmed", "packed"])))
        .returning({ id: orders.id });
      if (cancelled.length === 0) return;

      const items = await tx
        .select({ variantId: orderItems.variantId, quantity: orderItems.quantity })
        .from(orderItems)
        .where(and(eq(orderItems.orderId, id), isNotNull(orderItems.variantId)));
      for (const { variantId, quantity } of items) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} + ${quantity}` })
          .where(eq(productVariants.id, variantId as number));
      }
    }),
  );
  updateTag("products");
  refreshOrder(id);
}
