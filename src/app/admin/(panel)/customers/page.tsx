import { count, desc, eq, ilike, or } from "drizzle-orm";

import { formatDate } from "@/components/admin/order-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { orders, users } from "@/server/db/schema";

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
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Customers</h1>
      <form className="flex gap-2">
        <Input name="q" defaultValue={q} aria-label="Search customers" placeholder="Name, email or mobile" className="h-11 max-w-sm rounded-xl bg-card px-3 text-base md:text-base" />
        <Button type="submit" variant="outline" className="h-11 rounded-full px-6 text-base">
          Search
        </Button>
      </form>
      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full min-w-[640px] text-left text-base">
          <thead className="text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Mobile</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Orders</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-lg text-muted-foreground">No customers found.</td>
              </tr>
            )}
            {rows.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="p-4">{user.name}</td>
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.phone}</td>
                <td className="p-4">{formatDate(user.createdAt)}</td>
                <td className="p-4">{user.orderCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
