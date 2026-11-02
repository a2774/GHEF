import { Suspense } from "react";

import { AdminNav } from "@/components/admin/admin-nav";
import { AdminSidebarSkeleton } from "@/components/admin/admin-skeleton";
import { MobileAdminNav } from "@/components/admin/mobile-admin-nav";
import { getAdmin } from "@/server/auth/admin-session";

export const instant = false;

async function AdminSidebar() {
  const admin = await getAdmin();
  if (!admin) return null;

  return (
    <>
      <MobileAdminNav admin={admin} />
      <aside className="hidden h-screen sticky top-0 bg-[#0B132B] text-white lg:flex lg:flex-col lg:w-72 border-r border-slate-800 shrink-0 select-none overflow-hidden z-20">
        <AdminNav admin={admin} />
      </aside>
    </>
  );
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] text-slate-900 lg:flex antialiased selection:bg-[#bef264] selection:text-slate-950">
      <Suspense fallback={<AdminSidebarSkeleton />}>
        <AdminSidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0">
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
