import { OrderTable } from "@/components/admin/order-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/server/auth/admin-session";
import { orderStatus } from "@/server/db/schema";
import { listOrders } from "@/server/services/admin";

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
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Orders</h1>

      <form className="flex flex-wrap gap-2">
        <Input
          name="q"
          defaultValue={q}
          aria-label="Search orders"
          placeholder="Order, name, email or phone"
          className="h-11 max-w-sm rounded-xl bg-card px-3 text-base md:text-base"
        />
        <select
          name="status"
          defaultValue={selectedStatus ?? ""}
          aria-label="Filter by status"
          className="h-11 rounded-xl border border-input bg-card px-3 text-base capitalize"
        >
          <option value="">All statuses</option>
          {orderStatus.enumValues.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" className="h-11 rounded-full px-6 text-base">
          Apply
        </Button>
      </form>

      <OrderTable rows={orders} />
    </div>
  );
}
