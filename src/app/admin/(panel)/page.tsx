import { DashboardClient } from "@/components/admin/dashboard-client";
import { requireAdmin } from "@/server/auth/admin-session";
import { getDashboardData } from "@/server/services/admin";

export const instant = false;

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await getDashboardData();

  return <DashboardClient initialData={data} />;
}
