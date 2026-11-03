"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

import { consumeAttempt } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orderItems, orders } from "@/server/db/schema";
import { type OrderStatus, orderStatusLabel } from "@/server/services/order-rules";

const schema = z.object({
  orderNumber: z.string().trim().toUpperCase().min(6).max(40),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, "").slice(-10))
    .pipe(z.string().length(10)),
});

export type TrackedOrder = {
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  placedOn: string;
  courier: string | null;
  trackingNumber: string | null;
  items: string[];
};

export type TrackResult = { ok: true; order: TrackedOrder } | { ok: false; error: string };

const notFound = { ok: false, error: "We could not find an order with those details." } as const;

export async function trackOrder(input: { orderNumber: string; phone: string }): Promise<TrackResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter your order number and the 10-digit phone number." };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (!(await consumeAttempt(`track:${ip}`, 15))) {
    return { ok: false, error: "Too many attempts. Try again in a few minutes." };
  }

  const [order] = await withDbRetry(async () =>
    db
      .select()
      .from(orders)
      .where(and(eq(orders.orderNumber, parsed.data.orderNumber), eq(orders.customerPhone, parsed.data.phone))),
  );
  if (!order) return notFound;

  const items = await withDbRetry(async () =>
    db
      .select({ title: orderItems.title, size: orderItems.size, quantity: orderItems.quantity })
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id)),
  );

  return {
    ok: true,
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: orderStatusLabel(order.status),
      placedOn: new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(order.createdAt),
      courier: order.courier,
      trackingNumber: order.trackingNumber,
      items: items.map(({ title, size, quantity }) => `${title}, ${size} × ${quantity}`),
    },
  };
}
