"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { auth } from "@/server/auth/customer";
import { db, withDbRetry } from "@/server/db";
import { addresses, orders, payments } from "@/server/db/schema";
import {
  cancelOrderById,
  isServiceablePincode,
  markPaymentFailed,
  markPaymentPaid,
  OrderError,
  type PaymentMethod,
  placeOrder,
  recordPayment,
  requestReturn,
} from "@/server/services/orders";
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  razorpayEnabled,
  signatureMatches,
} from "@/server/services/razorpay";
import { markAdminDataChanged } from "@/server/services/admin-cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the full name.").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(\+91[ -]?)?[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN code."),
  state: z.string().trim().min(2, "Enter the state.").max(80),
  city: z.string().trim().min(2, "Enter the city.").max(80),
  locality: z.string().trim().min(2, "Enter the locality.").max(160),
  house: z.string().trim().min(1, "Enter the house or building number.").max(160),
  landmark: z.string().trim().max(160).optional(),
  type: z.enum(["home", "work"]),
});

async function requireUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

const loginRequired = { ok: false, error: "Log in to continue." } as const;

function refreshAddressPages() {
  revalidatePath("/checkout");
  revalidatePath("/account/addresses");
}

export async function saveAddress(_previous: ActionResult | null, form: FormData): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return loginRequired;

  const parsed = addressSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!isServiceablePincode(parsed.data.pincode)) {
    return { ok: false, error: "We cannot deliver to this PIN code." };
  }

  await withDbRetry(async () => {
    const [existing] = await db
      .select({ id: addresses.id })
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .limit(1);
    await db.insert(addresses).values({
      ...parsed.data,
      phone: parsed.data.phone.replace(/\D/g, "").slice(-10),
      userId,
      isDefault: !existing,
    });
  });

  refreshAddressPages();
  return { ok: true };
}

export async function setDefaultAddress(addressId: number) {
  const userId = await requireUserId();
  if (!userId) return;

  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [owned] = await tx
        .select({ id: addresses.id })
        .from(addresses)
        .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)));
      if (!owned) return;
      await tx.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, userId));
      await tx.update(addresses).set({ isDefault: true }).where(eq(addresses.id, addressId));
    }),
  );
  refreshAddressPages();
}

export async function deleteAddress(addressId: number) {
  const userId = await requireUserId();
  if (!userId) return;

  await withDbRetry(async () =>
    db.transaction(async (tx) => {
      const [removed] = await tx
        .delete(addresses)
        .where(and(eq(addresses.id, addressId), eq(addresses.userId, userId)))
        .returning({ isDefault: addresses.isDefault });
      if (!removed?.isDefault) return;

      const [next] = await tx
        .select({ id: addresses.id })
        .from(addresses)
        .where(eq(addresses.userId, userId))
        .orderBy(desc(addresses.createdAt))
        .limit(1);
      if (next) await tx.update(addresses).set({ isDefault: true }).where(eq(addresses.id, next.id));
    }),
  );
  refreshAddressPages();
}

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; razorpay?: { orderId: string; amountPaise: number } }
  | { ok: false; error: string };

export async function placeOrderAction(input: {
  addressId: number;
  method: PaymentMethod;
  idempotencyKey: string;
}): Promise<PlaceOrderResult> {
  const userId = await requireUserId();
  if (!userId) return loginRequired;

  const key = z.uuid().safeParse(input.idempotencyKey);
  if (!key.success) return { ok: false, error: "Refresh the page and try again." };
  if (input.method === "razorpay" && !razorpayEnabled()) {
    return { ok: false, error: "Online payment is not set up yet." };
  }

  try {
    const order = await placeOrder(userId, input);
    markAdminDataChanged();
    updateTag("products");
    revalidatePath("/cart");
    revalidatePath("/account/orders");
    if (input.method === "cod") return { ok: true, orderNumber: order.orderNumber };

    const [existing] = await withDbRetry(async () =>
      db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1),
    );
    const providerOrderId =
      existing?.providerOrderId ?? (await createRazorpayOrder(order.totalPaise, order.orderNumber)).id;
    await recordPayment(order.id, providerOrderId, order.totalPaise);
    return {
      ok: true,
      orderNumber: order.orderNumber,
      razorpay: { orderId: providerOrderId, amountPaise: order.totalPaise },
    };
  } catch (error) {
    if (error instanceof OrderError) return { ok: false, error: error.message };
    console.error("Order failed:", error);
    return { ok: false, error: "We could not place your order. Your cart is safe, try again." };
  }
}

export async function confirmRazorpayPayment(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return loginRequired;

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return { ok: false, error: "Online payment is not set up yet." };
  if (!signatureMatches(`${input.orderId}|${input.paymentId}`, input.signature, secret)) {
    return { ok: false, error: "We could not verify this payment." };
  }

  const [record] = await withDbRetry(async () =>
    db
      .select({ amountPaise: payments.amountPaise })
      .from(payments)
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .where(and(eq(payments.providerOrderId, input.orderId), eq(orders.userId, userId))),
  );
  if (!record) return { ok: false, error: "We could not verify this payment." };

  const payment = await fetchRazorpayPayment(input.paymentId);
  const settled = payment.status === "captured" || payment.status === "authorized";
  if (!settled || payment.order_id !== input.orderId || payment.amount !== record.amountPaise) {
    return { ok: false, error: "This payment is not complete yet." };
  }

  await markPaymentPaid(input.orderId, input.paymentId);
  markAdminDataChanged();
  revalidatePath("/account/orders");
  revalidatePath("/cart");
  return { ok: true };
}

export async function reportPaymentDismissed(providerOrderId: string) {
  const userId = await requireUserId();
  if (!userId) return;

  const [owned] = await withDbRetry(async () =>
    db
      .select({ id: payments.id })
      .from(payments)
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .where(and(eq(payments.providerOrderId, providerOrderId), eq(orders.userId, userId))),
  );
  if (owned) {
    await markPaymentFailed(providerOrderId);
    markAdminDataChanged();
  }
}

export async function cancelMyOrder(orderId: number, orderNumber: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return loginRequired;

  try {
    await cancelOrderById(orderId, userId);
  } catch (error) {
    if (error instanceof OrderError) return { ok: false, error: error.message };
    throw error;
  }
  markAdminDataChanged();
  updateTag("products");
  revalidatePath(`/account/orders/${orderNumber}`);
  revalidatePath("/account/orders");
  return { ok: true };
}

const returnSchema = z.string().trim().min(5, "Tell us why you want to return it.").max(1000);

export async function requestOrderReturn(orderId: number, orderNumber: string, reason: string): Promise<ActionResult> {
  const userId = await requireUserId();
  if (!userId) return loginRequired;

  const parsed = returnSchema.safeParse(reason);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  try {
    await requestReturn(orderId, userId, parsed.data);
  } catch (error) {
    if (error instanceof OrderError) return { ok: false, error: error.message };
    throw error;
  }
  markAdminDataChanged();
  revalidatePath(`/account/orders/${orderNumber}`);
  return { ok: true };
}
