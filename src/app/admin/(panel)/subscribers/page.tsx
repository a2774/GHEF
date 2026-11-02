import { Mail } from "lucide-react";

import { formatDate } from "@/components/admin/order-table";
import { requireAdmin } from "@/server/auth/admin-session";
import { listNewsletterSubscribers } from "@/server/services/newsletter";

export default async function AdminSubscribersPage() {
  await requireAdmin("admin");
  const rows = await listNewsletterSubscribers();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Newsletter Subscribers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {rows.length} {rows.length === 1 ? "contact" : "contacts"} subscribed to store announcements, craft stories, and trade catalogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#bef264] px-3 py-1 text-xs font-bold text-slate-950 shadow-2xs">
            <Mail className="size-3.5" />
            {rows.length} Active Leads
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full min-w-[500px] text-left text-sm text-slate-700">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Email Address</th>
              <th className="px-5 py-3.5">Subscribed Date</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500">
                  No subscribers recorded yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-3.5 font-medium text-slate-900 font-mono">
                    <a
                      href={`mailto:${row.email}`}
                      className="hover:text-slate-950 hover:underline"
                    >
                      {row.email}
                    </a>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">
                    {formatDate(row.consentedAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      Subscribed
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
