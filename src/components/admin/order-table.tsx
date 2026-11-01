import Link from "next/link";

import { formatPaise } from "@/lib/format";
import type { orders } from "@/server/db/schema";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

export function formatDate(date: Date) {
  return dateFormat.format(date);
}

export function OrderTable({ rows }: { rows: (typeof orders.$inferSelect)[] }) {
  if (rows.length === 0) {
    return <p className="rounded-2xl bg-card p-6 text-lg text-muted-foreground">No orders found.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-card">
      <table className="w-full min-w-[640px] text-left text-base">
        <thead className="text-muted-foreground">
          <tr>
            <th className="p-4 font-medium">Order</th>
            <th className="p-4 font-medium">Customer</th>
            <th className="p-4 font-medium">Date</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Payment</th>
            <th className="p-4 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((order) => (
            <tr key={order.id} className="border-t border-border">
              <td className="p-4">
                <Link href={`/admin/orders/${order.id}`} className="font-medium underline-offset-4 hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="p-4">{order.customerName}</td>
              <td className="p-4">{formatDate(order.createdAt)}</td>
              <td className="p-4 capitalize">{order.status}</td>
              <td className="p-4 capitalize">{order.paymentStatus}</td>
              <td className="p-4">{formatPaise(order.totalPaise)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
