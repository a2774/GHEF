import { notFound } from "next/navigation";

import { formatDate } from "@/components/admin/order-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPaise } from "@/lib/format";
import { cancelOrder, decideReturn, updateOrder } from "@/server/actions/admin-orders";
import { requireAdmin } from "@/server/auth/admin-session";
import { paymentStatus } from "@/server/db/schema";
import { getAdminOrder } from "@/server/services/admin";
import { canTransition, nextStatuses, orderStatusLabel } from "@/server/services/order-rules";

export const instant = false;

const fieldClass = "h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#bef264] focus:outline-none capitalize";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();
  const result = await getAdminOrder(numericId);
  if (!result) notFound();
  const { order, items, returnRequest, payments } = result;
  const statusOptions = [
    order.status,
    ...nextStatuses(order.status).filter((value) => value !== "cancelled"),
  ];

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 font-mono">
          {order.orderNumber}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Placed on {formatDate(order.createdAt)} • Payment Method: {order.paymentMethod.toUpperCase()}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Customer Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Customer & Shipping</h2>
          <div className="mt-3 space-y-1">
            <p className="text-sm font-semibold text-slate-900">{order.customerName}</p>
            <p className="text-xs font-mono text-slate-500">{order.customerEmail}</p>
            <p className="text-xs font-mono text-slate-500">{order.customerPhone}</p>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">
                {order.shippingAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Items Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Ordered Items</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-xs">
            {items.map((item) => (
              <li key={item.id} className="py-2.5 flex justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  <p className="text-slate-400">{item.color} • {item.size} × {item.quantity}</p>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatPaise(item.unitPricePaise * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          {order.discountPaise > 0 && (
            <div className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Discounts</span>
                <span>-{formatPaise(order.discountPaise)}</span>
              </div>
              {order.discountNote && <p className="mt-1 text-slate-400">{order.discountNote}</p>}
            </div>
          )}
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-950">
            <span>Total Amount</span>
            <span>{formatPaise(order.totalPaise)}</span>
          </div>
        </div>
      </div>

      {/* Fulfillment Controls Form */}
      <form
        key={order.updatedAt.getTime()}
        action={updateOrder.bind(null, order.id)}
        className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs md:grid-cols-2"
      >
        <div className="md:col-span-2 border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Fulfillment & Tracking Controls</h3>
          <p className="text-xs text-slate-500">Update status, enter courier and tracking references.</p>
        </div>

        <label className="block text-xs font-semibold text-slate-700">
          Order status
          <select name="status" defaultValue={order.status} className={`mt-1.5 ${fieldClass}`}>
            {statusOptions.map((value) => (
              <option key={value} value={value}>
                {orderStatusLabel(value)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Payment status
          <select name="paymentStatus" defaultValue={order.paymentStatus} className={`mt-1.5 ${fieldClass}`}>
            {paymentStatus.enumValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Courier
          <Input name="courier" defaultValue={order.courier ?? ""} placeholder="e.g. Blue Dart, Delhivery" className="mt-1.5 h-9 rounded-xl border-slate-200 bg-white px-3 text-xs shadow-2xs" />
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Tracking number
          <Input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} placeholder="e.g. BLU123456789" className="mt-1.5 h-9 rounded-xl border-slate-200 bg-white px-3 text-xs font-mono shadow-2xs" />
        </label>

        <label className="block text-xs font-semibold text-slate-700 md:col-span-2">
          Notes
          <textarea name="notes" rows={3} defaultValue={order.notes ?? ""} placeholder="Internal notes on packaging, custom finishing, or delivery requirements..." className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs focus:border-[#bef264] focus:outline-none" />
        </label>

        <div className="md:col-span-2 flex items-center justify-end">
          <Button type="submit" className="h-9 rounded-full bg-[#bef264] px-6 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] cursor-pointer">
            Save Order Updates
          </Button>
        </div>
      </form>

      {returnRequest && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">Return request</h2>
          <p className="mt-2 text-xs text-slate-600">{returnRequest.reason}</p>
          <p className="mt-1 text-xs text-slate-400">{orderStatusLabel(returnRequest.status)}</p>
          {order.status === "return_requested" && (
            <div className="mt-3 flex gap-2">
              <form action={decideReturn.bind(null, order.id, "approved")}>
                <Button type="submit" className="h-8 rounded-full bg-emerald-600 px-4 text-xs text-white">
                  Approve Return
                </Button>
              </form>
              <form action={decideReturn.bind(null, order.id, "rejected")}>
                <Button type="submit" variant="outline" className="h-8 rounded-full px-4 text-xs">
                  Reject
                </Button>
              </form>
            </div>
          )}
        </section>
      )}

      {payments.length > 0 && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">Payment Transactions</h2>
          <ul className="mt-2 space-y-1.5 text-xs">
            {payments.map((payment) => (
              <li key={payment.id} className="font-mono text-slate-600">
                {payment.provider}: {orderStatusLabel(payment.status)} • {formatPaise(payment.amountPaise)}
                {payment.providerPaymentId && ` (${payment.providerPaymentId})`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {canTransition(order.status, "cancelled") && (
        <form action={cancelOrder.bind(null, order.id)} className="pt-2">
          <Button type="submit" variant="destructive" className="h-9 rounded-full px-5 text-xs font-semibold cursor-pointer">
            Cancel Order & Restock Inventory
          </Button>
        </form>
      )}
    </div>
  );
}
