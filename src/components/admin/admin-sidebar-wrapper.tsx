"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "./admin-nav";
import { MobileAdminNav } from "./mobile-admin-nav";
import type { AdminIdentity } from "@/server/auth/admin-session";

export function AdminSidebarWrapper({ admin }: { admin: AdminIdentity }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved === "true") setIsCollapsed(true);
    } catch {
      // localStorage may fail in private mode
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("admin_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <>
      <MobileAdminNav admin={admin} />
      <aside
        className={`hidden h-screen sticky top-0 bg-[#0B132B] text-white lg:flex lg:flex-col border-r border-slate-800 shrink-0 select-none overflow-hidden z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-72"
        }`}
      >
        <AdminNav
          admin={admin}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </aside>
    </>
  );
}

