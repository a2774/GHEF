import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  IndianRupee,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { OrderTable } from "@/components/admin/order-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatPaise } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin-session";
import { getDashboardData, lowStockThreshold } from "@/server/services/admin";
import { orderStatusLabel } from "@/server/services/order-rules";

function Panel({
  title,
  subtitle,
  empty,
  children,
}: {
  title: string;
  subtitle?: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {empty ? (
        <p className="rounded-xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">
          No records to display yet.
        </p>
      ) : (
        <ul className="divide-y divide-border">{children}</ul>
      )}
    </section>
  );
}

const rowClass = "flex items-center justify-between gap-4 py-3 text-sm";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getDashboardData();

  const stats = [
    {
      label: "Paid Revenue",
      value: formatPaise(data.revenuePaise),
      icon: IndianRupee,
      trend: "Confirmed payments",
      accent: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Total Orders",
      value: data.orderCount.toLocaleString("en-IN"),
      icon: ShoppingCart,
      trend: `${data.pendingCount} pending fulfillment`,
      accent: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Pending Action",
      value: data.pendingCount.toLocaleString("en-IN"),
      icon: Clock,
      trend: "Requires packaging/dispatch",
      accent: data.pendingCount > 0 ? "text-amber-500 bg-amber-500/10" : "text-muted-foreground bg-muted",
    },
    {
      label: "Completed",
      value: data.completedCount.toLocaleString("en-IN"),
      icon: CheckCircle2,
      trend: "Delivered to customer",
      accent: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Customers",
      value: data.customerCount.toLocaleString("en-IN"),
      icon: Users,
      trend: "Registered accounts",
      accent: "text-indigo-500 bg-indigo-500/10",
    },
    {
      label: "Live Products",
      value: data.productCount.toLocaleString("en-IN"),
      icon: Package,
      trend: "Catalog items",
      accent: "text-zinc-500 bg-zinc-500/10",
    },
    {
      label: "Low Stock Alert",
      value: data.lowStock.length.toLocaleString("en-IN"),
      icon: AlertTriangle,
      trend: `Variants ≤ ${lowStockThreshold} units`,
      accent: data.lowStock.length > 0 ? "text-rose-500 bg-rose-500/10" : "text-muted-foreground bg-muted",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header with Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Store Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor sales performance, fulfillment pipelines, and inventory alerts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className={buttonVariants({
              size: "sm",
              className: "rounded-full px-4 text-xs font-medium",
            })}
          >
            <Plus className="mr-1.5 size-3.5" />
            New Product
          </Link>
          <Link
            href="/admin/orders"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "rounded-full px-4 text-xs",
            })}
          >
            View Orders
          </Link>
          <Link
            href="/admin/enquiries"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "rounded-full px-4 text-xs",
            })}
          >
            Enquiries
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, trend, accent }) => (
          <div
            key={label}
            className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-shadow hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
              <div className={`rounded-xl p-2.5 ${accent}`}>
                <Icon className="size-4" />
              </div>
            </div>
            <div className="mt-3">
              <dd className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {value}
              </dd>
              <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
            </div>
          </div>
        ))}
      </dl>

      {/* Recent Orders Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Recent Orders</h2>
            <p className="text-xs text-muted-foreground">Latest transactions across the storefront.</p>
          </div>
          <Link
            href="/admin/orders"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "text-xs",
            })}
          >
            All Orders
            <ArrowUpRight className="ml-1 size-3.5" />
          </Link>
        </div>
        <OrderTable rows={data.recentOrders} />
      </section>

      {/* Analytics & Performance Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Daily Paid Revenue"
          subtitle="Revenue generated over the last 14 days"
          empty={data.revenueByDay.length === 0}
        >
          {data.revenueByDay.map(({ day, totalPaise }) => (
            <li key={day} className={rowClass}>
              <span className="font-medium text-foreground">{day}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatPaise(totalPaise)}
              </span>
            </li>
          ))}
        </Panel>

        <Panel
          title="Best Sellers"
          subtitle="Top selling rug variants by unit volume"
          empty={data.bestSellers.length === 0}
        >
          {data.bestSellers.map(({ title, units }) => (
            <li key={title} className={rowClass}>
              <span className="truncate pr-4 font-medium">{title}</span>
              <Badge variant="secondary" className="shrink-0 font-normal">
                <TrendingUp className="mr-1 size-3 text-emerald-500" />
                {units} sold
              </Badge>
            </li>
          ))}
        </Panel>

        <Panel
          title="Order Pipeline Breakdown"
          subtitle="Distribution of current order statuses"
          empty={data.statusCounts.length === 0}
        >
          {data.statusCounts.map(({ status, total }) => (
            <li key={status} className={rowClass}>
              <span className="capitalize">{orderStatusLabel(status)}</span>
              <Badge variant="outline" className="font-mono">
                {total}
              </Badge>
            </li>
          ))}
        </Panel>

        <Panel
          title={`Low Stock Variants (≤ ${lowStockThreshold} left)`}
          subtitle="Stock items requiring workshop re-orders"
          empty={data.lowStock.length === 0}
        >
          {data.lowStock.map(({ id, productId, title, size, color, stock }) => (
            <li key={id} className="py-2.5">
              <Link
                href={`/admin/products/${productId}`}
                className="flex items-center justify-between rounded-lg p-2 text-sm transition-colors hover:bg-muted"
              >
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">
                    {color} · {size}
                  </p>
                </div>
                <Badge
                  variant={stock === 0 ? "destructive" : "outline"}
                  className="font-mono font-semibold"
                >
                  {stock === 0 ? "Out of stock" : `${stock} left`}
                </Badge>
              </Link>
            </li>
          ))}
        </Panel>
      </div>
    </div>
  );
}
