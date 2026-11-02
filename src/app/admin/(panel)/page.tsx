import Link from "next/link";

import { OrderTable } from "@/components/admin/order-table";
import { formatPaise } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin-session";
import { getDashboardData, lowStockThreshold } from "@/server/services/admin";
import { orderStatusLabel } from "@/server/services/order-rules";

function Panel({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {empty ? (
        <p className="mt-4 rounded-2xl bg-card p-6 text-lg text-muted-foreground">Nothing to show yet.</p>
      ) : (
        <ul className="mt-4 rounded-2xl bg-card">{children}</ul>
      )}
    </section>
  );
}

const rowClass = "flex justify-between gap-4 border-t border-border p-4 text-base first:border-t-0";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getDashboardData();

  const stats = [
    { label: "Total sales (paid)", value: formatPaise(data.revenuePaise) },
    { label: "Total orders", value: data.orderCount },
    { label: "Pending orders", value: data.pendingCount },
    { label: "Completed orders", value: data.completedCount },
    { label: "Customers", value: data.customerCount },
    { label: "Products", value: data.productCount },
    { label: "Low-stock variants", value: data.lowStock.length },
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
        <Panel title="Paid revenue, last 14 days" empty={data.revenueByDay.length === 0}>
          {data.revenueByDay.map(({ day, totalPaise }) => (
            <li key={day} className={rowClass}>
              <span>{day}</span>
              <span>{formatPaise(totalPaise)}</span>
            </li>
          ))}
        </Panel>
        <Panel title="Best sellers" empty={data.bestSellers.length === 0}>
          {data.bestSellers.map(({ title, units }) => (
            <li key={title} className={rowClass}>
              <span>{title}</span>
              <span>{units} sold</span>
            </li>
          ))}
        </Panel>
        <Panel title="Order status" empty={data.statusCounts.length === 0}>
          {data.statusCounts.map(({ status, total }) => (
            <li key={status} className={rowClass}>
              <span>{orderStatusLabel(status)}</span>
              <span>{total}</span>
            </li>
          ))}
        </Panel>
        <Panel title={`Low stock (${lowStockThreshold} or fewer)`} empty={data.lowStock.length === 0}>
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
        </Panel>
      </div>
    </div>
  );
}
