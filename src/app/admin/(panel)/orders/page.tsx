import { OrderFilters } from "@/components/admin/order-filters";
import { OrderTable } from "@/components/admin/order-table";
import { formatPaise } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin-session";
import { orderStatus } from "@/server/db/schema";
import { listOrders, type OrderRange, orderRanges } from "@/server/services/admin";

export const instant = false;

type OrdersSearchParams = { q?: string; status?: string; range?: string; from?: string; to?: string };

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<OrdersSearchParams> }) {
  await requireAdmin();
  const { q = "", status, range, from = "", to = "" } = await searchParams;
  const selectedStatus = orderStatus.enumValues.find((value) => value === status);
  const selectedRange: OrderRange = orderRanges.find((value) => value === range) ?? "all";
  const fromDate = dateOnly.test(from) ? from : "";
  const toDate = dateOnly.test(to) ? to : "";
  const orders = await listOrders(q, selectedStatus, selectedRange, fromDate, toDate);

  const filtered = Boolean(q.trim() || selectedStatus || selectedRange !== "all");
  const counted = orders.filter((order) => order.status !== "cancelled");
  const value = counted.reduce((total, order) => total + order.totalPaise, 0);
  const cash = orders.filter((order) => /cash|cod/i.test(order.paymentMethod)).length;
  const toProcess = orders.filter((order) => ["pending", "confirmed", "processing", "packed"].includes(order.status)).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Orders & Fulfillment
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Every order with what was bought, who ordered it, how they pay and where it stands. Open an order to
          update its status and tracking.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <OrderFilters
        key={`${q}|${selectedStatus ?? ""}|${selectedRange}|${fromDate}|${toDate}`}
        initialQuery={q}
        initialStatus={selectedStatus ?? ""}
        initialRange={selectedRange}
        initialFrom={fromDate}
        initialTo={toDate}
      />

      {/* Summary labels */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: filtered ? "Orders found" : "Orders", value: String(orders.length) },
          { label: "Order value (without cancelled)", value: formatPaise(value) },
          { label: "Cash on delivery", value: String(cash) },
          { label: "To process", value: String(toProcess) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-2xs">
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{stat.label}</dt>
            <dd className="mt-1 text-xl font-bold text-slate-950">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {/* Orders List Table */}
      <OrderTable
        rows={orders}
        emptyMessage={
          filtered
            ? "No orders match these filters. Try another date range or status, or press Reset."
            : "No orders yet. When a customer places an order it appears here with the items, address and payment."
        }
      />
      {orders.length === 100 && (
        <p className="text-center text-xs text-slate-500">
          Showing the newest 100 orders. Use the search box or a date range to find older ones.
        </p>
      )}
    </div>
  );
}
