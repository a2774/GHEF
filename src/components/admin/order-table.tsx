import Link from "next/link";

import { formatPaise } from "@/lib/format";
import type { orders } from "@/server/db/schema";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

export function formatDate(date: Date | string | number) {
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? "-" : dateFormat.format(d);
}

export function OrderTable({ rows }: { rows: (typeof orders.$inferSelect)[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500 shadow-2xs">
        No orders found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
      <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
        <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-3.5">Order</th>
            <th className="px-5 py-3.5">Customer</th>
            <th className="px-5 py-3.5">Date</th>
            <th className="px-5 py-3.5">Fulfillment</th>
            <th className="px-5 py-3.5">Payment</th>
            <th className="px-5 py-3.5 text-right">Total</th>
            <th className="px-5 py-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((order) => {
            const isPaid = order.paymentStatus === "paid";
            const isDelivered = order.status === "delivered";
            return (
              <tr key={order.id} className="transition-colors hover:bg-slate-50/60">
                <td className="px-5 py-3.5 font-mono font-medium text-slate-900">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="hover:text-slate-950 hover:underline flex items-center gap-1.5"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <div className="font-medium text-slate-900">{order.customerName}</div>
                  <div className="text-xs text-slate-400 font-mono">{order.customerEmail}</div>
                </td>
                <td className="px-5 py-3.5 text-slate-500">{formatDate(order.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                      isDelivered
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {isPaid ? (
                    <span className="inline-flex items-center rounded-full bg-[#bef264] px-2.5 py-0.5 text-xs font-bold text-slate-950 shadow-2xs">
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-200 capitalize">
                      {order.paymentStatus}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                  {formatPaise(order.totalPaise)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-[#0B0F19] hover:text-white hover:border-[#0B0F19] transition-all"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
