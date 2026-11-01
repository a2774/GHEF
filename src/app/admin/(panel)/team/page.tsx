import { asc } from "drizzle-orm";

import { TeamForm } from "@/components/admin/team-form";
import { Button } from "@/components/ui/button";
import { toggleTeamMember } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { adminUsers } from "@/server/db/schema";

export default async function AdminTeamPage() {
  await requireAdmin("owner");
  const rows = await withDbRetry(async () =>
    db
      .select({
        id: adminUsers.id,
        name: adminUsers.name,
        email: adminUsers.email,
        role: adminUsers.role,
        isActive: adminUsers.isActive,
      })
      .from(adminUsers)
      .orderBy(asc(adminUsers.createdAt)),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Team</h1>
      <TeamForm />
      <ul className="rounded-2xl bg-card">
        {rows.length === 0 && <li className="p-6 text-lg text-muted-foreground">No team members yet.</li>}
        {rows.map((member) => (
          <li key={member.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 text-base first:border-t-0">
            <span>
              {member.name} <span className="text-muted-foreground">{member.email}</span>
              <span className="ml-2 capitalize">{member.role}</span>
            </span>
            <form action={toggleTeamMember.bind(null, member.id)}>
              <Button type="submit" variant="outline" className="h-10 rounded-full px-4 text-base">
                {member.isActive ? "Disable" : "Enable"}
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
