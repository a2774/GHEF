import { Suspense } from "react";

import { AdminSidebarSkeleton, AdminTopBarSkeleton } from "@/components/admin/admin-skeleton";
import { AdminSidebarWrapper } from "@/components/admin/admin-sidebar-wrapper";
import { AdminTopBar } from "@/components/admin/admin-topbar";
import { AdminModeProvider } from "@/components/admin/admin-mode-context";
import { getAdmin } from "@/server/auth/admin-session";
import { getOrdersToProcessCount } from "@/server/services/admin";

export const instant = false;

async function AdminSidebarContent() {
  const admin = await getAdmin();
  if (!admin) return null;

  // A database hiccup must not take the sidebar away: without the number it simply shows no badge.
  const ordersToProcess = await getOrdersToProcessCount().catch(() => 0);
  return <AdminSidebarWrapper admin={admin} ordersToProcess={ordersToProcess} />;
}

async function AdminTopBarContent() {
  const admin = await getAdmin();
  if (!admin) return null;

  return <AdminTopBar admin={admin} />;
}

// The layout itself does not wait for the session check, so the frame of the panel (sidebar,
// top bar and the page's loading skeleton) appears straight away and the parts that need the
// admin fill in as soon as the check finishes.
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminModeProvider>
      <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] text-slate-900 lg:flex antialiased selection:bg-[#bef264] selection:text-slate-950">
        <Suspense fallback={<AdminSidebarSkeleton />}>
          <AdminSidebarContent />
        </Suspense>
        <div className="flex-1 flex flex-col min-w-0">
          <Suspense fallback={<AdminTopBarSkeleton />}>
            <AdminTopBarContent />
          </Suspense>
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </AdminModeProvider>
  );
}
