"use client";

import { ExternalLink, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAdminMode } from "@/components/admin/admin-mode-context";
import type { AdminIdentity } from "@/server/auth/admin-session";

const routeTitleMap: Record<string, string> = {
  "/admin": "Dashboard Overview",
  "/admin/traffic": "Analytics & Traffic Attribution",
  "/admin/products": "Handcrafted Rugs Catalog",
  "/admin/products/new": "Create Handcrafted Rug",
  "/admin/categories": "Category Classifications",
  "/admin/inventory": "Warehouse Stock Control",
  "/admin/orders": "Orders & Fulfillment",
  "/admin/abandoned": "Abandoned Cart Recovery",
  "/admin/returns": "Returns & Refund Claims",
  "/admin/payments": "Payment Gateway Ledger",
  "/admin/razorpay": "Razorpay Telemetry",
  "/admin/customers": "Customer CRM Directory",
  "/admin/support": "Artisan Support Desk",
  "/admin/enquiries": "Bespoke Rug Enquiries",
  "/admin/subscribers": "Newsletter Subscribers",
  "/admin/reviews": "Customer Testimonials",
  "/admin/preview": "Storefront Live Preview",
  "/admin/coupons": "Discount Coupons",
  "/admin/banners": "Storefront Banners",
  "/admin/email": "Email & SMS Quotas",
  "/admin/settings": "Global Store Settings",
  "/admin/team": "Admin Team & Access",
  "/admin/audit": "System Audit Trail",
};

export function AdminTopBar({ admin }: { admin: AdminIdentity }) {
  const pathname = usePathname();
  const { mode, setMode, isPro } = useAdminMode();

  // Find readable page title
  let activeTitle = "Admin Control";
  for (const [route, label] of Object.entries(routeTitleMap)) {
    if (pathname === route) {
      activeTitle = label;
      break;
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-all shadow-2xs">
      {/* Left: Active route context badge & indicator */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 truncate">
            {activeTitle}
          </span>
        </div>
        <span className="hidden md:inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500">
          GHEF Live
        </span>
      </div>

      {/* Right: Permanent Mode Toggle Button + Live Store & Role */}
      <div className="flex items-center gap-3 shrink-0">
        {/* The Toggle Button to switch modes - ALWAYS in the Right Top Bar */}
        <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("normal")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isPro
                ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="text-xs">🌿</span>
            <span>Normal</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("pro")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isPro
                ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-[1.02]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="text-xs">⚡</span>
            <span>Pro</span>
          </button>
        </div>

        {/* View live store shortcut */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-950 transition-colors"
        >
          <span>Store</span>
          <ExternalLink className="size-3 text-slate-400" />
        </Link>

        {/* Admin Role Badge */}
        <span className="inline-flex items-center rounded-full bg-[#0B132B] px-2.5 py-1 text-[10px] font-bold text-[#bef264] uppercase tracking-wider shadow-2xs">
          {admin.role}
        </span>
      </div>
    </header>
  );
}

