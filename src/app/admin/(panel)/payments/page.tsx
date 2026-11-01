import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { formatDate } from "@/components/admin/order-table";
import { formatPaise } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orders, payments } from "@/server/db/schema";
import { orderStatusLabel } from "@/server/services/order-rules";

export default async function AdminPaymentsPage() {
  await requireAdmin("admin");
  const rows = await withDbRetry(async () =>
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

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Payments</h1>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-lg text-muted-foreground">No online payments yet.</p>
      ) : (
        <ul className="rounded-2xl bg-card">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-wrap justify-between gap-3 border-t border-border p-4 text-base first:border-t-0">
              <Link href={`/admin/orders/${row.orderId}`} className="font-medium underline-offset-4 hover:underline">
                {row.orderNumber}
              </Link>
              <span>{orderStatusLabel(row.status)}</span>
              <span>{formatPaise(row.amountPaise)}</span>
              <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
