import { OrderFilters } from "@/components/admin/order-filters";
import { OrderTable } from "@/components/admin/order-table";
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
      <OrderFilters initialQuery={q} initialStatus={selectedStatus ?? ""} />

      {/* Orders List Table */}
      <OrderTable rows={orders} />
    </div>
  );
}
