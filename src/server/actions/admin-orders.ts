"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";

import { getAdmin, logAdminAction, requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orders, orderStatus, paymentStatus, returnRequests } from "@/server/db/schema";
import { countOrdersToProcess } from "@/server/services/admin";
import { canConfirmOrder, canTransition, statusAfterTracking } from "@/server/services/order-rules";
import { cancelOrderById, OrderError } from "@/server/services/orders";

/** What the buttons in the orders list get back, so they can show a message. */
export type OrderActionResult = { ok: true } | { ok: false; error: string };

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
  // The sidebar (in the layout) shows the number of orders to ship, so it is refreshed too.
  revalidatePath("/admin", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updateOrder(id: number, form: FormData) {
  const admin = await requireAdmin();

  const status = oneOf<OrderStatusValue>(form.get("status"), orderStatus.enumValues);
  const payment = oneOf<PaymentStatusValue>(form.get("paymentStatus"), paymentStatus.enumValues);
  if (!status || !payment) return;

  const trackingNumber = optionalText(form.get("trackingNumber"));
  const savedStatus = await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [order] = await tx
        .select({ status: orders.status, paymentMethod: orders.paymentMethod })
        .from(orders)
        .where(eq(orders.id, id))
        .for("update");
      if (!order) return null;
      if (order.status !== status) {
        // Cancelling goes through cancelOrder so that stock is returned.
        if (status === "cancelled" || !canTransition(order.status, status)) return null;
        // An online order cannot be confirmed before its payment (the payment status in the form counts).
        if (status === "confirmed" && !canConfirmOrder(order.status, order.paymentMethod, payment)) return null;
      }

      // Saving a tracking number means the parcel has gone out, so the order becomes Shipped.
      const nextStatus = statusAfterTracking(order.status, status, trackingNumber);
      await tx
        .update(orders)
        .set({
          status: nextStatus,
          paymentStatus: payment,
          courier: optionalText(form.get("courier")),
          trackingNumber,
          notes: optionalText(form.get("notes")),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id));
      return nextStatus;
    }),
  );
  if (savedStatus) await logAdminAction(admin, "update", "order", id, `${savedStatus}, ${payment}`);
  refreshOrder(id);
}

// The buttons in the Orders list. Unlike the form above they report back, so a message can be shown.
async function moveOrder(id: number, to: "confirmed" | "delivered"): Promise<OrderActionResult> {
  const admin = await requireAdmin();
  const result = await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [order] = await tx
        .select({ status: orders.status, paymentMethod: orders.paymentMethod, paymentStatus: orders.paymentStatus })
        .from(orders)
        .where(eq(orders.id, id))
        .for("update");
      if (!order) return "missing" as const;
      if (!canTransition(order.status, to)) return "blocked" as const;
      if (to === "confirmed" && !canConfirmOrder(order.status, order.paymentMethod, order.paymentStatus)) {
        return "unpaid" as const;
      }
      await tx.update(orders).set({ status: to, updatedAt: new Date() }).where(eq(orders.id, id));
      return "done" as const;
    }),
  );
  if (result === "missing") return { ok: false, error: "Order not found." };
  if (result === "unpaid") {
    return { ok: false, error: "This online order is still waiting for its payment, so it cannot be confirmed yet." };
  }
  if (result === "blocked") {
    return { ok: false, error: `This order cannot be marked ${to} from its current status. Refresh the list.` };
  }
  await logAdminAction(admin, to === "confirmed" ? "confirm" : "deliver", "order", id);
  refreshOrder(id);
  return { ok: true };
}

export async function confirmOrder(id: number): Promise<OrderActionResult> {
  return moveOrder(id, "confirmed");
}

export async function markOrderDelivered(id: number): Promise<OrderActionResult> {
  return moveOrder(id, "delivered");
}

export async function cancelOrderFromList(id: number): Promise<OrderActionResult> {
  const admin = await requireAdmin();
  try {
    await cancelOrderById(id);
  } catch (error) {
    if (error instanceof OrderError) return { ok: false, error: error.message };
    throw error;
  }
  await logAdminAction(admin, "cancel", "order", id);
  updateTag("products");
  refreshOrder(id);
  return { ok: true };
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

/**
 * The number of orders not shipped yet, asked again by the sidebar every minute. It returns null (and
 * does not redirect) when the session has ended, so the sidebar just keeps the last number.
 */
export async function fetchOrdersToProcess(): Promise<number | null> {
  if (!(await getAdmin())) return null;
  return countOrdersToProcess();
}
