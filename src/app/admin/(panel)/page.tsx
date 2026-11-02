import {
  ArrowUpRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { OrderTable } from "@/components/admin/order-table";
import { formatPaise } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin-session";
import { getDashboardData, lowStockThreshold } from "@/server/services/admin";

export const instant = false;

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getDashboardData();

  const primaryKpis = [
    {
      label: "Users",
      value: data.customerCount.toLocaleString("en-IN"),
      subtext: "Registered customer accounts",
    },
    {
      label: "Live Products",
      value: data.productCount.toLocaleString("en-IN"),
      subtext: "Active handcrafted rugs",
    },
    {
      label: "Total Orders",
      value: data.orderCount.toLocaleString("en-IN"),
      subtext: "Lifetime placed orders",
    },
    {
      label: "Net Paid Revenue",
      value: formatPaise(data.revenuePaise),
      subtext: "Confirmed bank settlements",
    },
  ];

  const directoryStats = [
    {
      label: "Active Catalog",
      value: data.productCount.toLocaleString("en-IN"),
      subtext: "Published on live storefront",
    },
    {
      label: "Categories",
      value: data.categoryCount.toLocaleString("en-IN"),
      subtext: "Heritage weaving collections",
    },
    {
      label: "Low Stock Items",
      value: data.lowStock.length.toLocaleString("en-IN"),
      subtext: `Variants ≤ ${lowStockThreshold} units`,
      highlight: data.lowStock.length > 0,
    },
    {
      label: "Out of Stock",
      value: "0",
      subtext: "Awaiting artisan restock",
    },
  ];

  const pipelineStats = [
    {
      label: "Total Inquiries",
      value: data.enquiryCount.toLocaleString("en-IN"),
      subtext: "Bespoke & bulk quotes",
    },
    {
      label: "New / Unread",
      value: data.newEnquiryCount.toLocaleString("en-IN"),
      subtext: "Needs team response within 24h",
      highlight: data.newEnquiryCount > 0,
    },
    {
      label: "Newsletter Subscribers",
      value: data.subscriberCount.toLocaleString("en-IN"),
      subtext: "Active marketing audience",
    },
    {
      label: "Pending Fulfillment",
      value: data.pendingCount.toLocaleString("en-IN"),
      subtext: "Orders awaiting dispatch",
      highlight: data.pendingCount > 0,
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time analytics, inventory signals, and fulfillment tracking for Ganga Handmade Export.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#bef264] px-4 py-2 text-xs font-semibold text-slate-950 shadow-xs hover:bg-[#a3e635] transition-all cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>New Product</span>
          </Link>
          <Link
            href="/admin/enquiries"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-all"
          >
            <span>Inquiries</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-all"
          >
            <span>Storefront</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      {/* Row 1: High-Level Primary Metrics (PushMyRank Style) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryKpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {kpi.label}
            </div>
            <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {kpi.value}
            </div>
            <p className="mt-1 text-xs text-slate-400">{kpi.subtext}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Directory & Catalog Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Directory & Catalog
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {directoryStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs"
            >
              <div className="text-xs font-medium text-slate-500">
                {stat.label}
              </div>
              <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
                <span>{stat.value}</span>
                {stat.highlight && (
                  <span className="inline-block size-2 rounded-full bg-amber-500" />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">{stat.subtext}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Pipelines & Inquiries in the last 24 hours */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Inquiries & Activity in the last 24 hours
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pipelineStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs"
            >
              <div className="text-xs font-medium text-slate-500">
                {stat.label}
              </div>
              <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
                <span>{stat.value}</span>
                {stat.highlight && (
                  <span className="inline-block size-2 rounded-full bg-[#bef264]" />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">{stat.subtext}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Recent Alerts & System Notices (PushMyRank Failed Audits Panel Style) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Inventory & Dispatch Alerts
          </h2>
          {data.lowStock.length > 0 && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              {data.lowStock.length} items low stock
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
          {data.lowStock.length > 0 ? (
            <div className="space-y-3">
              {data.lowStock.map((variant) => (
                <div key={variant.id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono font-medium text-slate-800">
                      stock.ghef.export - low stock alert, variant #{variant.id}
                    </span>
                    <span className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                      Only {variant.stock} left
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-mono text-slate-500 break-all">
                    Product &quot;{variant.title}&quot; (Color: {variant.color ?? "Standard"}, Size: {variant.size ?? "Standard"}). Immediate restocking recommended before sales outage.
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-2">
              <div className="text-xs font-mono font-medium text-slate-800">
                system.ghef.export - warehouse inventory audit, healthy
              </div>
              <p className="mt-1 text-xs font-mono text-slate-500">
                All catalog variants meet minimum threshold ({lowStockThreshold}+ units). Fulfillment pipelines operating smoothly.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Recent Orders & Fulfillment */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1"
          >
            <span>View all orders</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <OrderTable rows={data.recentOrders} />
      </div>
    </div>
  );
}
