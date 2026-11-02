"use client";

import { useSyncExternalStore } from "react";
import { AdminNav } from "./admin-nav";
import { MobileAdminNav } from "./mobile-admin-nav";
import type { AdminIdentity } from "@/server/auth/admin-session";

const sidebarListeners = new Set<() => void>();

function subscribeSidebar(onStoreChange: () => void) {
  sidebarListeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    sidebarListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSidebarSnapshot(): boolean {
  try {
    return localStorage.getItem("admin_sidebar_collapsed") === "true";
  } catch {
    return false;
  }
}

function getServerSidebarSnapshot(): boolean {
  return false;
}

export function AdminSidebarWrapper({ admin }: { admin: AdminIdentity }) {
  const isCollapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot
  );

  const toggleCollapse = () => {
    const next = !isCollapsed;
    try {
      localStorage.setItem("admin_sidebar_collapsed", String(next));
    } catch {
      // ignore
    }
    sidebarListeners.forEach((listener) => listener());
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

