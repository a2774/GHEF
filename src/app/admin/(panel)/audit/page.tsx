import { desc } from "drizzle-orm";

import { formatDate } from "@/components/admin/order-table";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { auditLogs } from "@/server/db/schema";

export default async function AdminAuditPage() {
  await requireAdmin("owner");
  const rows = await withDbRetry(async () =>
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Audit log</h1>
      <ul className="rounded-2xl bg-card">
        {rows.length === 0 && <li className="p-6 text-lg text-muted-foreground">No activity yet.</li>}
        {rows.map((row) => (
          <li key={row.id} className="flex flex-wrap justify-between gap-3 border-t border-border p-4 text-base first:border-t-0">
            <span>
              {row.action} {row.entity}
              {row.entityId && ` #${row.entityId}`}
              {row.details && <span className="ml-2 text-muted-foreground">{row.details}</span>}
            </span>
            <span className="text-muted-foreground">
              {row.actor}, {formatDate(row.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
