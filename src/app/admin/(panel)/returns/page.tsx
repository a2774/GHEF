import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { formatDate } from "@/components/admin/order-table";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orders, returnRequests } from "@/server/db/schema";
import { orderStatusLabel } from "@/server/services/order-rules";

export const instant = false;

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
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Returns & Exchanges
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review customer return requests, inspection decisions, and refund actions.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>All Return Claims ({rows.length})</span>
          <span className="text-[10px] text-slate-400">Latest Claims First</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <li className="p-8 text-center text-xs text-slate-500">
              No return requests recorded.
            </li>
          ) : (
            rows.map((row) => (
              <li key={row.id} className="p-4 text-xs transition-colors hover:bg-slate-50/60">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/orders/${row.orderId}`}
                      className="font-mono font-bold text-slate-950 hover:underline"
                    >
                      {row.orderNumber}
                    </Link>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 capitalize">
                      {orderStatusLabel(row.status)}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {formatDate(row.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">{row.customer}:</strong> {row.reason}
                </p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
