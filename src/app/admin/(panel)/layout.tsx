import { Suspense } from "react";

import { AdminSidebarSkeleton } from "@/components/admin/admin-skeleton";
import { AdminSidebarWrapper } from "@/components/admin/admin-sidebar-wrapper";
import { AdminModeProvider, AdminProSafetyGuard } from "@/components/admin/admin-mode-context";
import { getAdmin } from "@/server/auth/admin-session";

export const instant = false;

async function AdminSidebar() {
  const admin = await getAdmin();
  if (!admin) return null;

  return <AdminSidebarWrapper admin={admin} />;
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminModeProvider>
      <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] text-slate-900 lg:flex antialiased selection:bg-[#bef264] selection:text-slate-950">
        <Suspense fallback={<AdminSidebarSkeleton />}>
          <AdminSidebar />
        </Suspense>
        <div className="flex-1 flex flex-col min-w-0">
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <AdminProSafetyGuard />
            {children}
          </main>
        </div>
      </div>
    </AdminModeProvider>
  );
}
