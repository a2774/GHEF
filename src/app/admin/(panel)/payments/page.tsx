import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { formatDate } from "@/components/admin/order-table";
import { formatPaise } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orders, payments } from "@/server/db/schema";
import { orderStatusLabel } from "@/server/services/order-rules";

export const instant = false;

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
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Payment Transactions
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Gateway settlements, capture events, and transaction receipts.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Order Number</th>
              <th className="px-5 py-3.5">Transaction ID</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                  No online payment records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-mono font-medium text-slate-900">
                    <Link
                      href={`/admin/orders/${row.orderId}`}
                      className="hover:underline hover:text-slate-950"
                    >
                      {row.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                    {row.providerPaymentId || "Manual / Cash"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        row.status === "paid"
                          ? "bg-[#bef264] text-slate-950 shadow-2xs"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {orderStatusLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                    {formatPaise(row.amountPaise)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
