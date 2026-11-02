import { Suspense } from "react";

import { AdminSidebarSkeleton } from "@/components/admin/admin-skeleton";
import { AdminSidebarWrapper } from "@/components/admin/admin-sidebar-wrapper";
import { AdminTopBar } from "@/components/admin/admin-topbar";
import { AdminModeProvider } from "@/components/admin/admin-mode-context";
import { getAdmin } from "@/server/auth/admin-session";

export const instant = false;

async function AdminSidebarContent() {
  const admin = await getAdmin();
  if (!admin) return null;

  return <AdminSidebarWrapper admin={admin} />;
}

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();

  return (
    <AdminModeProvider>
      <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] text-slate-900 lg:flex antialiased selection:bg-[#bef264] selection:text-slate-950">
        <Suspense fallback={<AdminSidebarSkeleton />}>
          <AdminSidebarContent />
        </Suspense>
        <div className="flex-1 flex flex-col min-w-0">
          {admin && <AdminTopBar admin={admin} />}
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </AdminModeProvider>
  );
}
