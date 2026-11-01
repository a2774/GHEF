import { notFound } from "next/navigation";

import { formatDate } from "@/components/admin/order-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPaise } from "@/lib/format";
import { cancelOrder, updateOrder } from "@/server/actions/admin-orders";
import { requireAdmin } from "@/server/auth/admin-session";
import { orderStatus, paymentStatus } from "@/server/db/schema";
import { getAdminOrder } from "@/server/services/admin";

const fieldClass = "h-11 w-full rounded-xl border border-input bg-card px-3 text-base capitalize";
const cancellable = ["pending", "confirmed", "packed"];

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const result = await getAdminOrder(Number(id));
  if (!result) notFound();
  const { order, items } = result;
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">{order.orderNumber}</h1>
        <p className="mt-1 text-base text-muted-foreground">{formatDate(order.createdAt)}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-card p-5 text-base">
          <h2 className="text-xl font-semibold tracking-tight">Customer</h2>
          <p className="mt-2">{order.customerName}</p>
          <p>{order.customerEmail}</p>
          <p>{order.customerPhone}</p>
          <p className="mt-2 whitespace-pre-line text-muted-foreground">{order.shippingAddress}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 text-base">
          <h2 className="text-xl font-semibold tracking-tight">Items</h2>
          <ul className="mt-2 space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  {item.title}, {item.color}, {item.size} × {item.quantity}
                </span>
                <span>{formatPaise(item.unitPricePaise * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-border pt-3 font-medium">
            <span>Total ({order.paymentMethod})</span>
            <span>{formatPaise(order.totalPaise)}</span>
          </p>
        </div>
      </section>

      <form action={updateOrder.bind(null, order.id)} className="grid gap-4 rounded-2xl bg-muted p-5 md:grid-cols-2">
        <label className="block text-base font-medium">
          Order status
          <select name="status" defaultValue={order.status} disabled={isCancelled} className={`mt-1.5 ${fieldClass}`}>
            {orderStatus.enumValues
              .filter((value) => value !== "cancelled" || isCancelled)
              .map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
          </select>
        </label>
        <label className="block text-base font-medium">
          Payment status
          <select name="paymentStatus" defaultValue={order.paymentStatus} className={`mt-1.5 ${fieldClass}`}>
            {paymentStatus.enumValues.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-base font-medium">
          Courier
          <Input name="courier" defaultValue={order.courier ?? ""} className="mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base" />
        </label>
        <label className="block text-base font-medium">
          Tracking number
          <Input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className="mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base" />
        </label>
        <label className="block text-base font-medium md:col-span-2">
          Notes
          <textarea name="notes" rows={3} defaultValue={order.notes ?? ""} className="mt-1.5 w-full rounded-xl border border-input bg-card p-3 text-base" />
        </label>
        {!isCancelled && (
          <Button type="submit" className="h-12 rounded-full px-8 text-base md:w-fit">
            Save order
          </Button>
        )}
      </form>

      <p className="text-base text-muted-foreground">
        Refunds are manual until a payment gateway is connected: refund the customer, then set payment status to refunded.
      </p>

      {cancellable.includes(order.status) && (
        <form action={cancelOrder.bind(null, order.id)}>
          <Button type="submit" variant="destructive" className="h-12 rounded-full px-6 text-base">
            Cancel order and restock
          </Button>
        </form>
      )}
    </div>
  );
}
