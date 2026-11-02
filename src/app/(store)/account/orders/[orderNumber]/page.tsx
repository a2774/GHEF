import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AccountNav } from "@/components/store/account-nav";
import { LoginPrompt } from "@/components/store/login-prompt";
import { OrderActions } from "@/components/store/order-actions";
import { formatPaise } from "@/lib/format";
import { getCustomerSession } from "@/server/auth/customer-session";
import { canCustomerCancel, canTransition, orderStatusLabel } from "@/server/services/order-rules";
import { getCustomerOrder } from "@/server/services/orders";

export const metadata: Metadata = {
  title: "Order details | Ganga Handmade Export",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ orderNumber: string }> };

async function OrderDetail({ params }: Params) {
  const { orderNumber } = await params;
  const session = await getCustomerSession();
  if (!session?.user?.id) return <LoginPrompt message="Log in to see this order." href="/account/orders" />;

  const result = await getCustomerOrder(session.user.id, orderNumber);
  if (!result) notFound();
  const { order, items, returnRequest } = result;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-3xl bg-muted p-6">
        <h2 className="text-2xl font-semibold tracking-tight">{order.orderNumber}</h2>
        <p className="mt-1 text-lg">{orderStatusLabel(order.status)}</p>
        <ul className="mt-4 space-y-2 border-t border-border pt-4 text-base">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.title}, {item.color}, {item.size} × {item.quantity}
              </span>
              <span>{formatPaise(item.unitPricePaise * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-border pt-4 text-lg">
          {order.discountPaise > 0 && (
            <div className="flex justify-between">
              <dt>Discount</dt>
              <dd>-{formatPaise(order.discountPaise)}</dd>
            </div>
          )}
          {order.discountNote && <p className="text-base text-muted-foreground">{order.discountNote}</p>}
          <div className="flex justify-between font-semibold">
            <dt>Total</dt>
            <dd>{formatPaise(order.totalPaise)}</dd>
          </div>
          <div className="flex justify-between text-base text-muted-foreground">
            <dt>{order.paymentMethod}</dt>
            <dd>{orderStatusLabel(order.paymentStatus)}</dd>
          </div>
        </dl>
      </section>

      <div className="space-y-4">
        <section className="rounded-3xl bg-muted p-6 text-base">
          <h2 className="text-xl font-semibold tracking-tight">Delivery</h2>
          <p className="mt-2">{order.customerName}</p>
          <p className="whitespace-pre-line text-muted-foreground">{order.shippingAddress}</p>
          {order.trackingNumber && (
            <p className="mt-3">
              {order.courier ?? "Courier"}: {order.trackingNumber}
            </p>
          )}
        </section>
        {returnRequest && (
          <p className="rounded-3xl bg-muted p-6 text-base">
            Return {orderStatusLabel(returnRequest.status).toLowerCase()}: {returnRequest.reason}
          </p>
        )}
        <OrderActions
          orderId={order.id}
          orderNumber={order.orderNumber}
          canCancel={canCustomerCancel(order.status)}
          canReturn={canTransition(order.status, "return_requested") && !returnRequest}
        />
      </div>
    </div>
  );
}

export default function OrderDetailPage({ params }: Params) {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-36 pb-20 sm:px-6 lg:px-8 lg:pt-40">
      <h1 className="text-title font-semibold">Order details.</h1>
      <div className="mt-6">
        <AccountNav />
      </div>
      <div className="mt-6">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />}>
          <OrderDetail params={params} />
        </Suspense>
      </div>
    </main>
  );
}
