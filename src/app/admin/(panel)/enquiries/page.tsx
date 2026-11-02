import Link from "next/link";

import { formatDate } from "@/components/admin/order-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { changeEnquiryStatus } from "@/server/actions/admin-enquiries";
import { requireAdmin } from "@/server/auth/admin-session";
import { enquiryLabels, listEnquiries } from "@/server/services/enquiries";

const statusColors: Record<string, "default" | "secondary" | "outline"> = {
  new: "default",
  contacted: "secondary",
  closed: "outline",
};

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin("staff");
  const { status } = await searchParams;
  const rows = await listEnquiries(status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Custom Enquiries</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Custom size orders and bulk/export requests from prospective buyers.
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        {["", "new", "contacted", "closed"].map((val) => (
          <Link
            key={val}
            href={val ? `/admin/enquiries?status=${val}` : "/admin/enquiries"}
            className={buttonVariants({
              variant: (status ?? "") === val ? "default" : "outline",
              className: "rounded-full text-sm",
            })}
          >
            {val === "" ? "All" : val.charAt(0).toUpperCase() + val.slice(1)}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full min-w-[700px] text-left text-base">
          <thead className="text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Message</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-lg text-muted-foreground">
                  No enquiries found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-border align-top">
                  <td className="p-4 whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <Badge variant="outline">
                      {enquiryLabels[row.type as keyof typeof enquiryLabels] ?? row.type}
                    </Badge>
                  </td>
                  <td className="p-4 font-medium">{row.name}</td>
                  <td className="p-4 whitespace-nowrap">
                    <a
                      href={`tel:${row.phone}`}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {row.phone}
                    </a>
                  </td>
                  <td className="p-4 max-w-xs text-sm text-muted-foreground whitespace-pre-line">
                    {row.message}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <Badge variant={statusColors[row.status] ?? "outline"}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <form action={changeEnquiryStatus.bind(null, row.id)} className="flex gap-2">
                      <select
                        name="status"
                        defaultValue={row.status}
                        className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                      <Button type="submit" size="sm" variant="secondary" className="h-9 rounded-lg px-3 text-xs">
                        Save
                      </Button>
                    </form>
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
