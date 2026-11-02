import { formatDate } from "@/components/admin/order-table";
import { requireAdmin } from "@/server/auth/admin-session";
import { listNewsletterSubscribers } from "@/server/services/newsletter";

export default async function AdminSubscribersPage() {
  await requireAdmin("admin");
  const rows = await listNewsletterSubscribers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Newsletter Subscribers</h1>
          <p className="mt-1 text-base text-muted-foreground">
            {rows.length} {rows.length === 1 ? "contact" : "contacts"} subscribed to store announcements and offers.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-card">
        <table className="w-full min-w-[500px] text-left text-base">
          <thead className="text-muted-foreground">
            <tr>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Subscribed Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-6 text-center text-lg text-muted-foreground">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="p-4 font-medium">
                    <a
                      href={`mailto:${row.email}`}
                      className="text-foreground hover:underline"
                    >
                      {row.email}
                    </a>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {formatDate(row.consentedAt)}
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
