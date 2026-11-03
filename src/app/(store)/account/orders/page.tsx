import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { AccountNav } from "@/components/store/account-nav";
import { LoginPrompt } from "@/components/store/login-prompt";
import { formatPaise } from "@/lib/format";
import { getCustomerSession } from "@/server/auth/customer-session";
import { orderStatusLabel } from "@/server/services/order-rules";
import { listCustomerOrders } from "@/server/services/orders";

export const metadata: Metadata = {
  title: "Your orders | Ganga Handmade Export",
  robots: { index: false, follow: false },
};

async function Orders() {
  const session = await getCustomerSession();
  if (!session?.user?.id) return <LoginPrompt message="Log in to see your orders." href="/account/orders" />;

  const orders = await listCustomerOrders(session.user.id);
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl bg-muted p-10 text-center">
        <p className="font-heading text-2xl font-semibold tracking-tight">No orders yet.</p>
        <Link href="/products" className="mt-2 inline-block text-lg underline underline-offset-4">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={`/account/orders/${order.orderNumber}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-muted p-5 text-lg transition-colors hover:bg-secondary"
          >
            <span className="font-semibold">{order.orderNumber}</span>
            <span>{orderStatusLabel(order.status)}</span>
            <span>{formatPaise(order.totalPaise)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function OrdersPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-36 pb-20 sm:px-6 lg:px-8 lg:pt-40">
      <h1 className="text-title font-semibold">Your orders.</h1>
      <div className="mt-6">
        <AccountNav />
      </div>
      <div className="mt-6">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />}>
          <Orders />
        </Suspense>
      </div>
    </main>
  );
}
