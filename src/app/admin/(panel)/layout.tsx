import { Suspense } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { MobileAdminNav } from "@/components/admin/mobile-admin-nav";
import { getAdmin, requireAdmin } from "@/server/auth/admin-session";

async function AdminSidebar() {
  const admin = await getAdmin();
  if (!admin) return null;

  return (
    <>
      <MobileAdminNav admin={admin} />
      <aside className="hidden h-screen sticky top-0 overflow-y-auto bg-ink p-6 text-primary-foreground lg:flex lg:flex-col lg:w-64 border-r border-white/10 shrink-0">
        <AdminNav admin={admin} />
      </aside>
    </>
  );
}

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background lg:flex">
      <Suspense fallback={null}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0">
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10 max-w-7xl">
          <Suspense fallback={<p className="text-lg text-muted-foreground animate-pulse">Loading view...</p>}>
            <AdminGuard>{children}</AdminGuard>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
