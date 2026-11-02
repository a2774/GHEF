"use client";

import {
  Activity,
  Boxes,
  ChevronDown,
  Clock,
  Compass,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquareText,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  TicketPercent,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { logout } from "@/server/actions/admin-auth";
import type { AdminIdentity, AdminRole } from "@/server/auth/admin-session";
import { useAdminMode } from "@/components/admin/admin-mode-context";

type NavLink = {
  label: string;
  href: string;
  role: AdminRole;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavLink[];
};

// 🌿 Normal Mode: 6 Core Essentials for daily warehouse and fulfillment operations
const normalNavItems: NavLink[] = [
  { label: "Dashboard", href: "/admin", role: "staff", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", role: "staff", icon: Package },
  { label: "Inventory & Warehouse", href: "/admin/inventory", role: "staff", icon: Boxes },
  { label: "Orders & Fulfillment", href: "/admin/orders", role: "staff", icon: ShoppingCart },
  { label: "Custom Enquiries", href: "/admin/enquiries", role: "staff", icon: MessageSquareText },
  { label: "Support Desk", href: "/admin/support", role: "staff", icon: LifeBuoy },
  { label: "Customer Reviews", href: "/admin/reviews", role: "staff", icon: Star },
];

// ⚡ Pro Mode: Full Enterprise Suite (18+ modules across 6 sections)
const proNavSections: NavSection[] = [
  {
    title: "Overview",
    icon: Compass,
    items: [
      { label: "Dashboard", href: "/admin", role: "staff", icon: LayoutDashboard },
      { label: "Traffic & Sales", href: "/admin/traffic", role: "admin", icon: TrendingUp },
    ],
  },
  {
    title: "Catalog",
    icon: Layers,
    items: [
      { label: "Products", href: "/admin/products", role: "staff", icon: Package },
      { label: "Categories", href: "/admin/categories", role: "staff", icon: FolderTree },
      { label: "Inventory", href: "/admin/inventory", role: "staff", icon: Boxes },
    ],
  },
  {
    title: "Sales & Fulfillment",
    icon: ShoppingCart,
    items: [
      { label: "Orders", href: "/admin/orders", role: "staff", icon: ShoppingCart },
      { label: "Abandoned Carts", href: "/admin/abandoned", role: "admin", icon: ShoppingBag },
      { label: "Returns", href: "/admin/returns", role: "staff", icon: RotateCcw },
      { label: "Payments", href: "/admin/payments", role: "admin", icon: CreditCard },
      { label: "Razorpay Gateway", href: "/admin/razorpay", role: "owner", icon: Activity },
    ],
  },
  {
    title: "Customers & Leads",
    icon: Users,
    items: [
      { label: "Customers", href: "/admin/customers", role: "admin", icon: Users },
      { label: "Support Desk", href: "/admin/support", role: "staff", icon: LifeBuoy },
      { label: "Enquiries", href: "/admin/enquiries", role: "staff", icon: MessageSquareText },
      { label: "Subscribers", href: "/admin/subscribers", role: "admin", icon: Mail },
      { label: "Reviews", href: "/admin/reviews", role: "staff", icon: Star },
    ],
  },
  {
    title: "Marketing & Store",
    icon: Sparkles,
    items: [
      { label: "Live Visual Preview", href: "/admin/preview", role: "staff", icon: Eye },
      { label: "Coupons", href: "/admin/coupons", role: "admin", icon: TicketPercent },
      { label: "Banners", href: "/admin/banners", role: "admin", icon: ImageIcon },
      { label: "Email & Quotas", href: "/admin/email", role: "owner", icon: Send },
      { label: "Settings", href: "/admin/settings", role: "owner", icon: Settings },
    ],
  },
  {
    title: "System & Governance",
    icon: ShieldCheck,
    items: [
      { label: "Team & Admins", href: "/admin/team", role: "owner", icon: Shield },
      { label: "Audit Logs", href: "/admin/audit", role: "owner", icon: FileText },
    ],
  },
];

const roleHierarchy: Record<AdminRole, number> = {
  owner: 3,
  admin: 2,
  staff: 1,
};

function hasRole(admin: AdminIdentity, required: AdminRole) {
  return roleHierarchy[admin.role] >= roleHierarchy[required];
}

export function AdminNav({
  admin,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
}: {
  admin: AdminIdentity;
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const { mode, setMode, toggleMode, isPro } = useAdminMode();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  // Determine which sections have active items in Pro mode
  const activeSectionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    proNavSections.forEach((section) => {
      map[section.title] = section.items.some((item) => isActive(item.href));
    });
    return map;
  }, [pathname]);

  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    let foundActive = false;
    proNavSections.forEach((section) => {
      const isAct = section.items.some((item) =>
        item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
      );
      initial[section.title] = isAct;
      if (isAct) foundActive = true;
    });
    if (!foundActive) {
      initial["Overview"] = true;
    }
    return initial;
  });

  // Whenever user navigates to a new route, auto-expand its section
  useEffect(() => {
    proNavSections.forEach((section) => {
      const isAct = section.items.some((item) =>
        item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
      );
      if (isAct) {
        setOpenSections((prev) => ({
          ...prev,
          [section.title]: true,
        }));
      }
    });
  }, [pathname]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const allOpen = useMemo(() => {
    return proNavSections.every((section) => !!openSections[section.title]);
  }, [openSections]);

  const toggleAll = () => {
    const nextState = !allOpen;
    const updated: Record<string, boolean> = {};
    proNavSections.forEach((section) => {
      updated[section.title] = nextState;
    });
    setOpenSections(updated);
  };

  // If collapsed mode is active, render the compact icon-only navigation bar
  if (isCollapsed) {
    return (
      <div className="flex h-full w-full flex-col justify-between overflow-hidden select-none bg-[#0B132B] text-slate-100 items-center py-3">
        {/* Header with Logo and Expand button */}
        <div className="flex flex-col items-center gap-3 shrink-0 pb-3 border-b border-slate-800 w-full">
          <Link
            href="/admin"
            onClick={onNavigate}
            title="Ganga Handmade Export"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bef264] text-slate-950 font-black shadow-xs hover:scale-105 transition-transform"
          >
            <Boxes className="size-5 text-slate-950" />
          </Link>

          {/* Mode Switcher Compact Icon */}
          <button
            type="button"
            onClick={toggleMode}
            title={`Active: ${isPro ? "Pro Mode (Click to switch to Normal)" : "Normal Mode (Click to switch to Pro)"}`}
            aria-label="Toggle admin mode"
            className={`flex size-8.5 items-center justify-center rounded-xl border transition-all cursor-pointer ${
              isPro
                ? "bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.25)]"
                : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
            }`}
          >
            <span className="text-xs select-none">{isPro ? "⚡" : "🌿"}</span>
          </button>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Maximize sidebar"
              aria-label="Maximize sidebar"
              className="flex size-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-[#bef264] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          )}
        </div>

        {/* Compact Navigation Icons */}
        <nav
          aria-label="Admin Compact Navigation"
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 space-y-2 no-scrollbar flex flex-col items-center w-full px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isPro ? (
            // Pro Mode: Render all sections icons
            proNavSections.map((section) => {
              const accessibleItems = section.items.filter((item) =>
                hasRole(admin, item.role)
              );
              if (accessibleItems.length === 0) return null;

              return (
                <div key={section.title} className="space-y-1.5 w-full flex flex-col items-center">
                  {accessibleItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        title={`${item.label} (${section.title})`}
                        className={`group relative flex size-10 items-center justify-center rounded-xl transition-all ${
                          active
                            ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-105"
                            : "text-slate-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className="size-4.5 shrink-0" />
                        {active && (
                          <span className="absolute -left-1 size-1.5 rounded-full bg-[#bef264] shadow-[0_0_6px_#bef264]" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              );
            })
          ) : (
            // Normal Mode: Render 6 Core Essentials icons
            <div className="space-y-1.5 w-full flex flex-col items-center">
              {normalNavItems
                .filter((item) => hasRole(admin, item.role))
                .map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      title={`🌿 ${item.label}`}
                      className={`group relative flex size-10 items-center justify-center rounded-xl transition-all ${
                        active
                          ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-105"
                          : "text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="size-4.5 shrink-0" />
                      {active && (
                        <span className="absolute -left-1 size-1.5 rounded-full bg-[#bef264] shadow-[0_0_6px_#bef264]" />
                      )}
                    </Link>
                  );
                })}
            </div>
          )}
        </nav>

        {/* Compact Footer */}
        <div className="shrink-0 pt-3 border-t border-slate-800 flex flex-col items-center gap-2 w-full px-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="View Live Store"
            className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-[#bef264] hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="size-4" />
          </Link>

          <form action={logout}>
            <button
              type="submit"
              title={`Sign out (${admin.email})`}
              aria-label="Sign out"
              className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Full Expanded Sidebar Mode
  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden select-none bg-[#0B132B] text-slate-100">
      {/* 1. Brand Header */}
      <div className="shrink-0 p-4 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2.5">
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 group min-w-0 flex-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bef264] text-slate-950 font-black shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Boxes className="size-5 text-slate-950" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
                Ganga Handmade
              </p>
              <p className="text-[11px] font-mono text-[#bef264] uppercase tracking-wider">
                Export Admin
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center rounded-full bg-[#bef264] px-2.5 py-0.5 text-[10px] font-bold text-slate-950 uppercase tracking-wider shadow-2xs">
              {admin.role}
            </span>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Minimize sidebar"
                aria-label="Minimize sidebar"
                className="hidden lg:flex size-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <PanelLeftClose className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Persistent Mode Switcher Pill */}
      <div className="shrink-0 px-3 pt-3 pb-2.5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => setMode("normal")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isPro
                ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-[1.01]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-sm leading-none">🌿</span>
            <span>Normal</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("pro")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isPro
                ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-[1.01]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="text-sm leading-none">⚡</span>
            <span>Pro</span>
          </button>
        </div>

        <div className="mt-1.5 flex items-center justify-between px-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            {isPro ? "Enterprise Suite" : "Daily Operations"}
          </span>
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
              isPro
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            {isPro ? "18+ TOOLS" : "6 ESSENTIALS"}
          </span>
        </div>
      </div>

      {/* 3. Navigation List (Filtered by Mode) */}
      <div className="flex-1 min-h-0 flex flex-col">
        {!isPro ? (
          /* Normal Mode: 6 Core Essentials */
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between px-4 pt-3 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              <span>Core Operations</span>
              <span className="text-[10px] font-mono text-[#bef264]">Clean Flow</span>
            </div>

            <nav
              aria-label="Admin Normal Navigation"
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2.5 py-1 space-y-1 no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {normalNavItems
                .filter((item) => hasRole(admin, item.role))
                .map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                        active
                          ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-[1.01]"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`size-4 shrink-0 transition-colors ${
                            active
                              ? "text-slate-950"
                              : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {active && (
                        <span className="size-1.5 rounded-full bg-slate-950 shrink-0" />
                      )}
                    </Link>
                  );
                })}

              {/* Pro Mode Unlock Prompt Card */}
              <div className="pt-3 px-1">
                <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-white/[0.04] to-transparent p-3 text-slate-300 text-xs">
                  <div className="flex items-center gap-1.5 text-white font-bold mb-1">
                    <Sparkles className="size-3.5 text-[#bef264]" />
                    <span>Need Enterprise Controls?</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
                    Unlock live attribution, abandoned carts, Razorpay gateway logs & system audit trail.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode("pro")}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-white/10 hover:bg-[#bef264] hover:text-slate-950 py-1.5 text-[11px] font-bold text-white transition-all cursor-pointer"
                  >
                    <Zap className="size-3 fill-current" />
                    <span>Switch to Pro Mode</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>
        ) : (
          /* Pro Mode: Full Enterprise Accordion Navigation */
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              <span>Enterprise Modules</span>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[10px] text-slate-400 hover:text-[#bef264] transition-colors cursor-pointer capitalize font-normal"
              >
                {allOpen ? "Collapse all" : "Expand all"}
              </button>
            </div>

            <nav
              aria-label="Admin Navigation"
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2.5 py-1.5 space-y-1 no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {proNavSections.map((section) => {
                const accessibleItems = section.items.filter((item) =>
                  hasRole(admin, item.role)
                );
                if (accessibleItems.length === 0) return null;

                const isOpen = !!openSections[section.title];
                const hasActiveChild = !!activeSectionMap[section.title];
                const SectionIcon = section.icon;

                return (
                  <div key={section.title} className="rounded-xl overflow-hidden transition-colors">
                    {/* Accordion Trigger Header */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer group ${
                        hasActiveChild
                          ? "text-white bg-white/[0.08]"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                      }`}
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SectionIcon
                          className={`size-4 shrink-0 transition-colors ${
                            hasActiveChild ? "text-[#bef264]" : "text-slate-400 group-hover:text-slate-300"
                          }`}
                        />
                        <span className="truncate tracking-wide text-[11px] uppercase font-bold">
                          {section.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {hasActiveChild && !isOpen && (
                          <span
                            title="Active page inside"
                            className="size-1.5 rounded-full bg-[#bef264] shadow-[0_0_8px_#bef264]"
                          />
                        )}
                        <ChevronDown
                          className={`size-3.5 text-slate-500 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-slate-300" : "group-hover:text-slate-400"
                          }`}
                        />
                      </div>
                    </button>

                    {/* Accordion Content Links */}
                    {isOpen && (
                      <div className="mt-1 space-y-0.5 pl-3 border-l border-slate-800 ml-3.5 my-1">
                        {accessibleItems.map((item) => {
                          const active = isActive(item.href);
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={onNavigate}
                              className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                                active
                                  ? "bg-[#bef264]/15 text-[#bef264] font-semibold shadow-xs border-l-2 border-[#bef264] -ml-[1px]"
                                  : "text-slate-400 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <Icon
                                className={`size-3.5 shrink-0 transition-colors ${
                                  active
                                    ? "text-[#bef264]"
                                    : "text-slate-400 group-hover:text-slate-200"
                                }`}
                              />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* 4. Footer controls: Live Store link, user identity, logout */}
      <div className="shrink-0 p-3 pt-3 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white border border-slate-800"
        >
          <span className="flex items-center gap-2 truncate">
            <ExternalLink className="size-3.5 text-[#bef264] shrink-0" />
            <span className="truncate">View live store</span>
          </span>
          <span className="text-[10px] text-slate-400 shrink-0">↗</span>
        </Link>

        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs border border-slate-800">
          <div className="truncate pr-2 min-w-0">
            <p className="truncate font-mono font-medium text-white text-[11px]">
              {admin.email}
            </p>
            <p className="capitalize text-[10px] text-slate-400">{admin.role} session</p>
          </div>
          <form action={logout} className="shrink-0">
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer flex items-center justify-center"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
