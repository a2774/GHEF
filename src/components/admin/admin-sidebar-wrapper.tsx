"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AdminNav } from "./admin-nav";
import { MobileAdminNav } from "./mobile-admin-nav";
import { fetchOrdersToProcess } from "@/server/actions/admin-orders";
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

export function AdminSidebarWrapper({
  admin,
  ordersToProcess,
}: {
  admin: AdminIdentity;
  ordersToProcess: number;
}) {
  const isCollapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot
  );

  // The number of orders to ship comes with the page, and is asked again every minute and whenever the
  // tab is opened again, so a new order shows up without reloading. A newer number from the page wins.
  const [fromPage, setFromPage] = useState(ordersToProcess);
  const [asked, setAsked] = useState<number | null>(null);
  if (ordersToProcess !== fromPage) {
    setFromPage(ordersToProcess);
    setAsked(null);
  }
  const liveCount = asked ?? ordersToProcess;

  useEffect(() => {
    async function ask() {
      if (document.visibilityState !== "visible") return;
      try {
        const total = await fetchOrdersToProcess();
        if (total !== null) setAsked(total);
      } catch {
        // Keep the last number; the next try is in a minute.
      }
    }
    const timer = window.setInterval(ask, 60_000);
    window.addEventListener("focus", ask);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", ask);
    };
  }, []);

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
      <MobileAdminNav admin={admin} ordersToProcess={liveCount} />
      <aside
        className={`hidden h-screen sticky top-0 bg-[#0B132B] text-white lg:flex lg:flex-col border-r border-slate-800 shrink-0 select-none overflow-hidden z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:w-20" : "lg:w-72"
        }`}
      >
        <AdminNav
          admin={admin}
          ordersToProcess={liveCount}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </aside>
    </>
  );
}

