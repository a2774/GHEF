"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Zap, Sparkles, X, ChevronRight, ShieldCheck } from "lucide-react";

export type AdminMode = "normal" | "pro";

interface AdminModeContextType {
  mode: AdminMode;
  setMode: (mode: AdminMode) => void;
  toggleMode: () => void;
  isPro: boolean;
}

const AdminModeContext = createContext<AdminModeContextType | null>(null);

const STORAGE_KEY = "ghef_admin_mode";

export const PRO_ROUTES: Record<string, { title: string; category: string }> = {
  "/admin/traffic": { title: "Traffic & Sales Attribution", category: "Analytics" },
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
  const [mode, setModeState] = useState<AdminMode>("normal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "normal" || saved === "pro") {
        setModeState(saved);
      }
    } catch {
      // localStorage may fail in some environments
    } finally {
      setMounted(true);
    }
  }, []);

  const setMode = (newMode: AdminMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // ignore
    }
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
  const { mode, setMode } = useAdminMode();
  const pathname = usePathname();
  const [dismissedForPath, setDismissedForPath] = useState<string | null>(null);

  if (mode === "pro") return null;

  const meta = getProRouteMeta(pathname);
  if (!meta) return null;
  if (dismissedForPath === pathname) return null;

  return (
    <aside
      aria-label="Pro Mode Required Notification"
      className="mb-6 rounded-2xl border border-amber-300/60 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-slate-900/5 p-4 sm:p-4.5 shadow-xs backdrop-blur-xs transition-all animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-xs">
            <Zap className="size-4.5 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-950">
                ⚡ Pro Tool Active
              </span>
              <span className="inline-flex items-center rounded-md bg-amber-200/80 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-900">
                {meta.category} • {meta.title}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600">
              You are accessing an enterprise module while in <strong className="text-slate-900 font-semibold">Normal Mode</strong>. Switch to Pro Mode to unlock complete telemetry and full navigation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setMode("pro")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B132B] px-3.5 py-2 text-xs font-bold text-[#bef264] shadow-xs hover:bg-slate-900 active:scale-95 transition-all cursor-pointer"
          >
            <Zap className="size-3.5 fill-[#bef264]" />
            <span>Switch to Pro Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setDismissedForPath(pathname)}
            title="Dismiss notice"
            aria-label="Dismiss notice"
            className="size-8 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
