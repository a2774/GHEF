import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { formatDate } from "@/components/admin/order-table";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orders, returnRequests } from "@/server/db/schema";
import { orderStatusLabel } from "@/server/services/order-rules";

export default async function AdminReturnsPage() {
  await requireAdmin();
  const rows = await withDbRetry(async () =>
    db
      .select({
        id: returnRequests.id,
        orderId: orders.id,
        orderNumber: orders.orderNumber,
        customer: orders.customerName,
        reason: returnRequests.reason,
        status: returnRequests.status,
        createdAt: returnRequests.createdAt,
      })
      .from(returnRequests)
      .innerJoin(orders, eq(returnRequests.orderId, orders.id))
      .orderBy(desc(returnRequests.createdAt))
      .limit(100),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Returns</h1>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-card p-6 text-lg text-muted-foreground">No return requests.</p>
      ) : (
        <ul className="rounded-2xl bg-card">
          {rows.map((row) => (
            <li key={row.id} className="border-t border-border p-4 text-base first:border-t-0">
              <div className="flex flex-wrap justify-between gap-3">
                <Link href={`/admin/orders/${row.orderId}`} className="font-medium underline-offset-4 hover:underline">
                  {row.orderNumber}
                </Link>
                <span>{orderStatusLabel(row.status)}</span>
                <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>
              </div>
              <p className="mt-1 text-muted-foreground">
                {row.customer}: {row.reason}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
