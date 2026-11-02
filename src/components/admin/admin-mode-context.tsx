"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";

export type AdminMode = "normal" | "pro";

interface AdminModeContextType {
  mode: AdminMode;
  setMode: (mode: AdminMode) => void;
  toggleMode: () => void;
  isPro: boolean;
}

const AdminModeContext = createContext<AdminModeContextType | null>(null);

const STORAGE_KEY = "ghef_admin_mode";
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): AdminMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "normal" || saved === "pro") {
      return saved;
    }
  } catch {
    // localStorage may fail in some environments
  }
  return "normal";
}

function getServerSnapshot(): AdminMode {
  return "normal";
}

export const PRO_ROUTES: Record<string, { title: string; category: string }> = {
  "/admin/categories": { title: "Category Taxonomy", category: "Catalog" },
  "/admin/abandoned": { title: "Abandoned Cart Recovery", category: "Sales" },
  "/admin/returns": { title: "Returns & Refund Claims", category: "Sales" },
  "/admin/payments": { title: "Gateway Ledger & Settlements", category: "Finance" },
  "/admin/razorpay": { title: "Razorpay Telemetry & Webhooks", category: "Finance" },
  "/admin/customers": { title: "Customer Directory & CRM", category: "Customers" },
  "/admin/subscribers": { title: "Newsletter Subscribers", category: "Marketing" },
  "/admin/preview": { title: "Live Visual Preview", category: "Marketing" },
  "/admin/coupons": { title: "Coupons & Discounts", category: "Marketing" },
  "/admin/banners": { title: "Promotional Banners", category: "Marketing" },
  "/admin/email": { title: "Email Quotas & Templates", category: "Marketing" },
  "/admin/settings": { title: "Store Configuration", category: "Governance" },
  "/admin/team": { title: "Team & Role Permissions", category: "Governance" },
  "/admin/audit": { title: "System Audit Trail", category: "Governance" },
};

export function isProRoute(pathname: string): boolean {
  return Object.keys(PRO_ROUTES).some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

export function getProRouteMeta(pathname: string): { title: string; category: string } | null {
  for (const [route, meta] of Object.entries(PRO_ROUTES)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return meta;
    }
  }
  return null;
}

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setMode = (newMode: AdminMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // ignore
    }
    listeners.forEach((listener) => listener());
  };

  const toggleMode = () => {
    const next = mode === "normal" ? "pro" : "normal";
    setMode(next);
  };

  return (
    <AdminModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isPro: mode === "pro",
      }}
    >
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode(): AdminModeContextType {
  const ctx = useContext(AdminModeContext);
  if (!ctx) {
    // Graceful fallback for components rendered outside provider
    return {
      mode: "normal",
      setMode: () => {},
      toggleMode: () => {},
      isPro: false,
    };
  }
  return ctx;
}

/**
 * Safety guard banner displayed when a user in Normal Mode visits a Pro-only route
 */
export function AdminProSafetyGuard() {
  return null;
}
