import Link from "next/link";

import { formatPaise } from "@/lib/format";
import type { OrderRow } from "@/server/services/admin";

import { OrderStatusBadge, PaymentMethodBadge, PaymentStatusBadge } from "./order-badges";
import { OrderRowActions } from "./order-row-actions";

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export function formatDate(date: Date | string | number) {
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? "-" : dateFormat.format(d);
}

/** Date and time in Indian time, for example "22 Nov 2026, 8:15 pm". */
export function formatDateTime(date: Date | string | number) {
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? "-" : dateTimeFormat.format(d);
}

/** "Siddikpur, Uttar Pradesh 221301": the line of the saved address that holds the PIN code. */
function placeOf(shippingAddress: string) {
  return shippingAddress.split("\n").find((line) => /\b\d{6}\b/.test(line)) ?? "";
}

const itemsShown = 3;

export function OrderTable({ rows, emptyMessage = "No orders found." }: { rows: OrderRow[]; emptyMessage?: string }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center text-sm text-slate-500 shadow-2xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
      <table className="w-full min-w-[980px] text-left text-sm text-slate-700">
        <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-3.5">Order</th>
            <th className="px-5 py-3.5">Customer</th>
            <th className="px-5 py-3.5">Items</th>
            <th className="px-5 py-3.5">Payment</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5 text-right">Total</th>
            <th className="px-5 py-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((order) => {
            const place = placeOf(order.shippingAddress);
            const pieces = order.items.reduce((total, item) => total + item.quantity, 0);
            return (
              <tr key={order.id} className="align-top transition-colors hover:bg-slate-50/60">
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono font-semibold whitespace-nowrap text-slate-900 hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <div className="mt-1 text-xs text-slate-500">{formatDateTime(order.createdAt)}</div>
                </td>

                <td className="px-5 py-4">
                  <div className="font-semibold text-slate-900">{order.customerName}</div>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="mt-0.5 block font-mono text-xs text-slate-700 hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                  <div className="mt-0.5 max-w-[220px] truncate font-mono text-xs text-slate-400" title={order.customerEmail}>
                    {order.customerEmail}
                  </div>
                  {place && <div className="mt-0.5 text-xs text-slate-500">{place}</div>}
                </td>

                <td className="px-5 py-4">
                  {order.items.length === 0 ? (
                    <span className="text-xs text-slate-400">No items recorded</span>
                  ) : (
                    <>
                      <ul className="space-y-1 text-xs">
                        {order.items.slice(0, itemsShown).map((item, index) => (
                          <li key={index} className="max-w-[280px]">
                            <span className="font-medium text-slate-900">{item.title}</span>
                            <span className="text-slate-500">
                              {" "}
                              · {item.size}
                              {item.color ? ` · ${item.color}` : ""}
                              <span className="whitespace-nowrap"> × {item.quantity}</span>
                            </span>
                          </li>
                        ))}
                        {order.items.length > itemsShown && (
                          <li className="text-slate-400">+{order.items.length - itemsShown} more</li>
                        )}
                      </ul>
                      <div className="mt-1.5 text-xs font-medium text-slate-500">
                        {pieces} {pieces === 1 ? "piece" : "pieces"}
                      </div>
                    </>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col items-start gap-1.5">
                    <PaymentMethodBadge method={order.paymentMethod} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </td>

                <td className="px-5 py-4">
                  <OrderStatusBadge status={order.status} />
                  {order.trackingNumber && (
                    <div className="mt-1.5 font-mono text-xs text-slate-500">
                      {order.courier ? `${order.courier}: ` : ""}
                      {order.trackingNumber}
                    </div>
                  )}
                </td>

                <td className="px-5 py-4 text-right">
                  <div className="font-semibold text-slate-900">{formatPaise(order.totalPaise)}</div>
                  {order.discountPaise > 0 && (
                    <div className="mt-0.5 text-xs text-emerald-700">-{formatPaise(order.discountPaise)} discount</div>
                  )}
                  {order.shippingPaise > 0 && (
                    <div className="mt-0.5 text-xs text-slate-400">incl. {formatPaise(order.shippingPaise)} shipping</div>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="flex flex-col items-end gap-1.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex h-8 items-center whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-[#0B0F19] hover:bg-[#0B0F19] hover:text-white"
                    >
                      View details
                    </Link>
                    <OrderRowActions
                      id={order.id}
                      orderNumber={order.orderNumber}
                      status={order.status}
                      paymentMethod={order.paymentMethod}
                      paymentStatus={order.paymentStatus}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
