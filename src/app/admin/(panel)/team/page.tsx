import { asc } from "drizzle-orm";

import { TeamForm } from "@/components/admin/team-form";
import { Button } from "@/components/ui/button";
import { toggleTeamMember } from "@/server/actions/admin-modules";
import { requireAdmin } from "@/server/auth/admin-session";
import { db, withDbRetry } from "@/server/db";
import { adminUsers } from "@/server/db/schema";

export const instant = false;

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
    <div className="max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
          Admin Team & Access
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage staff permissions, invite administrative colleagues, and control system roles.
        </p>
      </div>

      <TeamForm />

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Active Staff Members ({rows.length})</span>
          <span className="text-[10px] text-slate-400">Owner Access Only</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <li className="p-6 text-center text-xs text-slate-500">
              No additional team members yet.
            </li>
          ) : (
            rows.map((member) => (
              <li
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs transition-colors hover:bg-slate-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>{member.name}</span>
                      <span className="inline-flex items-center rounded-full bg-[#bef264] px-2 py-0.5 text-[10px] font-bold text-slate-950 capitalize shadow-2xs">
                        {member.role}
                      </span>
                    </div>
                    <p className="font-mono text-slate-500 text-[11px]">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      member.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {member.isActive ? "Active" : "Disabled"}
                  </span>
                  <form action={toggleTeamMember.bind(null, member.id)}>
                    <Button
                      type="submit"
                      variant="outline"
                      size="xs"
                      className="rounded-full border-slate-200 hover:bg-slate-100 text-xs px-3"
                    >
                      {member.isActive ? "Disable" : "Enable"}
                    </Button>
                  </form>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
