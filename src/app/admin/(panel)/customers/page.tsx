import { count, desc, eq, ilike, or } from "drizzle-orm";

import { formatDate } from "@/components/admin/order-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orders, users } from "@/server/db/schema";

export const instant = false;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin("admin");
  const { q = "" } = await searchParams;
  const term = `%${q.trim().replace(/[\\%_]/g, "\\$&")}%`;

  const rows = await withDbRetry(async () =>
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        createdAt: users.createdAt,
        orderCount: count(orders.id),
      })
      .from(users)
      .leftJoin(orders, eq(orders.userId, users.id))
      .where(
        q.trim()
          ? or(ilike(users.name, term), ilike(users.email, term), ilike(users.phone, term))
          : undefined,
      )
      .groupBy(users.id, users.name, users.email, users.phone, users.createdAt)
      .orderBy(desc(users.createdAt))
      .limit(100),
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Customer Accounts
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View registered customer accounts, transaction histories, and contact info.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <form className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Input
            name="q"
            defaultValue={q}
            aria-label="Search customers"
            placeholder="Search by customer name, email or phone..."
            className="h-9 w-full rounded-full border border-slate-200/90 bg-white pl-4 pr-4 text-xs shadow-2xs focus:border-[#bef264]"
          />
        </div>

        <Button
          type="submit"
          className="h-9 rounded-full bg-[#0B0F19] px-5 text-xs font-semibold text-white shadow-2xs hover:bg-[#1a233a] cursor-pointer"
        >
          Search
        </Button>
      </form>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Customer Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Mobile</th>
              <th className="px-5 py-3.5">Joined Date</th>
              <th className="px-5 py-3.5 text-right">Lifetime Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                  No customers found matching this query.
                </td>
              </tr>
            ) : (
              rows.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {user.name || "Unnamed Customer"}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                    {user.phone || "—"}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-900 font-mono">
                      {user.orderCount}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
