import Link from "next/link";

import { OrderTable } from "@/components/admin/order-table";
import { formatPaise } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin-session";
import { getDashboardData, lowStockThreshold } from "@/server/services/admin";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getDashboardData();

  const stats = [
    { label: "Total orders", value: data.orderCount.toLocaleString("en-IN") },
    { label: "Revenue (paid)", value: formatPaise(data.revenuePaise) },
    { label: "Total products", value: data.productCount.toLocaleString("en-IN") },
    { label: "Low-stock variants", value: data.lowStock.length.toLocaleString("en-IN") },
  ];

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-semibold tracking-tight">Dashboard</h1>

      <dl className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-2xl bg-card p-5">
            <dt className="text-base text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-heading text-3xl font-semibold tracking-tight">{value}</dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Recent orders</h2>
        <div className="mt-4">
          <OrderTable rows={data.recentOrders} />
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-2">
        <section>
          <h2 className="text-2xl font-semibold tracking-tight">Order status</h2>
          {data.statusCounts.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-card p-6 text-lg text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="mt-4 rounded-2xl bg-card">
              {data.statusCounts.map(({ status, total }) => (
                <li key={status} className="flex justify-between border-t border-border p-4 text-base capitalize first:border-t-0">
                  <span>{status}</span>
                  <span>{total}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold tracking-tight">
            Low stock ({lowStockThreshold} or fewer)
          </h2>
          {data.lowStock.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-card p-6 text-lg text-muted-foreground">Stock looks healthy.</p>
          ) : (
            <ul className="mt-4 rounded-2xl bg-card">
              {data.lowStock.map(({ id, productId, title, size, color, stock }) => (
                <li key={id} className="border-t border-border first:border-t-0">
                  <Link href={`/admin/products/${productId}`} className="flex justify-between gap-4 p-4 text-base hover:bg-muted">
                    <span>
                      {title}, {color}, {size}
                    </span>
                    <span>{stock}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
