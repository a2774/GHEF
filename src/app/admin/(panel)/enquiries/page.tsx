import Link from "next/link";

import { formatDate } from "@/components/admin/order-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { changeEnquiryStatus } from "@/server/actions/admin-enquiries";
import { requireAdmin } from "@/server/auth/admin-session";
import { enquiryLabels, listEnquiries } from "@/server/services/enquiries";

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin("staff");
  const { status } = await searchParams;
  const rows = await listEnquiries(status);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
            Custom Enquiries
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage custom rug dimensions, bespoke weaves, and bulk export inquiries.
          </p>
        </div>
      </div>

      {/* Pill Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {["", "new", "contacted", "closed"].map((val) => {
          const active = (status ?? "") === val;
          return (
            <Link
              key={val}
              href={val ? `/admin/enquiries?status=${val}` : "/admin/enquiries"}
              className={cn(
                "inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold transition-all shrink-0 cursor-pointer",
                active
                  ? "bg-[#0B0F19] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-2xs"
              )}
            >
              {val === "" ? "All Enquiries" : val.charAt(0).toUpperCase() + val.slice(1)}
            </Link>
          );
        })}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full min-w-[700px] text-left text-sm text-slate-700">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Type</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Phone</th>
              <th className="px-5 py-3.5">Message / Requirements</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-slate-500">
                  No enquiries found matching this filter.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isNew = row.status === "new";
                return (
                  <tr key={row.id} className="transition-colors hover:bg-slate-50/60 align-top">
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-slate-400 font-mono">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {enquiryLabels[row.type as keyof typeof enquiryLabels] ?? row.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {row.name}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <a
                        href={`tel:${row.phone}`}
                        className="text-xs font-mono text-slate-700 hover:text-slate-950 hover:underline"
                      >
                        {row.phone}
                      </a>
                    </td>
                    <td className="px-5 py-3.5 max-w-sm text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                      {row.message}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {isNew ? (
                        <span className="inline-flex items-center rounded-full bg-[#bef264] px-2.5 py-0.5 text-xs font-bold text-slate-950 shadow-2xs">
                          New
                        </span>
                      ) : row.status === "contacted" ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          Contacted
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <form action={changeEnquiryStatus.bind(null, row.id)} className="flex items-center gap-2">
                        <select
                          name="status"
                          defaultValue={row.status}
                          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#bef264] focus:outline-none"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="closed">Closed</option>
                        </select>
                        <Button
                          type="submit"
                          size="xs"
                          className="rounded-lg bg-[#0B0F19] text-white hover:bg-[#1a233a] font-medium text-xs px-2.5 py-1"
                        >
                          Update
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
