import { desc } from "drizzle-orm";

import { formatDate } from "@/components/admin/order-table";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { auditLogs } from "@/server/db/schema";

export const instant = false;

export default async function AdminAuditPage() {
  await requireAdmin("owner");
  const rows = await withDbRetry(async () =>
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200),
  );

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Security & Audit Trail
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Immutable event log of all administrative actions, stock changes, and authentication attempts.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Audit Log Entries ({rows.length})</span>
          <span className="text-[10px] text-slate-400">Chronological • Real-time</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <li className="p-8 text-center text-xs text-slate-500">
              No audit log activity recorded yet.
            </li>
          ) : (
            rows.map((row) => (
              <li
                key={row.id}
                className="p-4 text-xs transition-colors hover:bg-slate-50/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-slate-900">
                      audit.ghef.export - {row.action}
                    </span>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-700 capitalize">
                      {row.entity} {row.entityId ? `#${row.entityId}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <span className="text-slate-600 font-medium">{row.actor}</span>
                    <span>•</span>
                    <span>{formatDate(row.createdAt)}</span>
                  </div>
                </div>

                {row.details && (
                  <p className="mt-1.5 font-mono text-[11px] text-slate-500 leading-relaxed bg-slate-50/80 rounded-lg p-2 border border-slate-100">
                    {row.details}
                  </p>
                )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
