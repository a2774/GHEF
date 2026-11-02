import { OrderTable } from "@/components/admin/order-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/server/auth/admin-session";
import { orderStatus } from "@/server/db/schema";
import { listOrders } from "@/server/services/admin";

export const instant = false;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const { q = "", status } = await searchParams;
  const selectedStatus = orderStatus.enumValues.find((value) => value === status);
  const orders = await listOrders(q, selectedStatus);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Orders & Fulfillment
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track customer orders, verify Razorpay settlements, and update shipment status.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <form className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Input
            name="q"
            defaultValue={q}
            aria-label="Search orders"
            placeholder="Search by order #, name, email or phone..."
            className="h-9 w-full rounded-full border border-slate-200/90 bg-white pl-4 pr-9 text-xs shadow-2xs focus:border-[#bef264]"
          />
        </div>

        <select
          name="status"
          defaultValue={selectedStatus ?? ""}
          aria-label="Filter by status"
          className="h-9 rounded-full border border-slate-200/90 bg-white px-4 text-xs font-medium text-slate-700 capitalize shadow-2xs focus:border-[#bef264] focus:outline-none"
        >
          <option value="">All Fulfillment Statuses</option>
          {orderStatus.enumValues.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>

        <Button
          type="submit"
          className="h-9 rounded-full bg-[#0B0F19] px-5 text-xs font-semibold text-white shadow-2xs hover:bg-[#1a233a] cursor-pointer"
        >
          Filter
        </Button>
      </form>

      {/* Orders List Table */}
      <OrderTable rows={orders} />
    </div>
  );
}
