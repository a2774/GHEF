"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

import { logAdminAction, requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orders, orderStatus, paymentStatus, returnRequests } from "@/server/db/schema";
import { canTransition } from "@/server/services/order-rules";
import { cancelOrderById } from "@/server/services/orders";

type OrderStatusValue = (typeof orderStatus.enumValues)[number];
type PaymentStatusValue = (typeof paymentStatus.enumValues)[number];

function oneOf<T extends string>(value: FormDataEntryValue | null, allowed: readonly T[]) {
  return allowed.find((option) => option === value);
}

function optionalText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim() || null;
}

function refreshOrder(id: number) {
  updateTag("admin");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updateOrder(id: number, form: FormData) {
  const admin = await requireAdmin();

  const status = oneOf<OrderStatusValue>(form.get("status"), orderStatus.enumValues);
  const payment = oneOf<PaymentStatusValue>(form.get("paymentStatus"), paymentStatus.enumValues);
  if (!status || !payment) return;

  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [order] = await tx.select({ status: orders.status }).from(orders).where(eq(orders.id, id)).for("update");
      if (!order) return;
      if (order.status !== status) {
        // Cancelling goes through cancelOrder so that stock is returned.
        if (status === "cancelled" || !canTransition(order.status, status)) return;
      }

      await tx
        .update(orders)
        .set({
          status,
          paymentStatus: payment,
          courier: optionalText(form.get("courier")),
          trackingNumber: optionalText(form.get("trackingNumber")),
          notes: optionalText(form.get("notes")),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id));
    }),
  );
  await logAdminAction(admin, "update", "order", id, `${status}, ${payment}`);
  refreshOrder(id);
}

export async function cancelOrder(id: number) {
  const admin = await requireAdmin();
  await cancelOrderById(id);
  await logAdminAction(admin, "cancel", "order", id);
  updateTag("products");
  refreshOrder(id);
}

export async function decideReturn(orderId: number, decision: "approved" | "rejected") {
  const admin = await requireAdmin();

  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [order] = await tx.select({ status: orders.status }).from(orders).where(eq(orders.id, orderId)).for("update");
      if (order?.status !== "return_requested") return;

      await tx.update(returnRequests).set({ status: decision }).where(eq(returnRequests.orderId, orderId));
      await tx
        .update(orders)
        .set({ status: decision === "approved" ? "returned" : "delivered", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }),
  );
  await logAdminAction(admin, decision, "return", orderId);
  refreshOrder(orderId);
}
