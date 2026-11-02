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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { logout } from "@/server/actions/admin-auth";
import type { AdminIdentity, AdminRole } from "@/server/auth/admin-session";

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

const navSections: NavSection[] = [
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
}: {
  admin: AdminIdentity;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  // Determine which sections have active items
  const activeSectionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    navSections.forEach((section) => {
      map[section.title] = section.items.some((item) => isActive(item.href));
    });
    return map;
  }, [pathname]);

  // Accordion open/close state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    let foundActive = false;
    navSections.forEach((section) => {
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
    navSections.forEach((section) => {
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
    return navSections.every((section) => !!openSections[section.title]);
  }, [openSections]);

  const toggleAll = () => {
    const nextState = !allOpen;
    const updated: Record<string, boolean> = {};
    navSections.forEach((section) => {
      updated[section.title] = nextState;
    });
    setOpenSections(updated);
  };

  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden select-none bg-[#0B132B] text-slate-100">
      {/* 1. Brand Header (Pinned at Top) */}
      <div className="shrink-0 p-4 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between gap-2.5">
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 group min-w-0"
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

          <span className="inline-flex items-center rounded-full bg-[#bef264] px-2.5 py-0.5 text-[10px] font-bold text-slate-950 uppercase tracking-wider shadow-2xs shrink-0">
            {admin.role}
          </span>
        </div>
      </div>

      {/* 2. Accordion Navigation */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Sub-header with Quick Collapse/Expand toggle */}
        <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          <span>Categories</span>
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
          {navSections.map((section) => {
            const accessibleItems = section.items.filter((item) =>
              hasRole(admin, item.role),
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
                    {/* Glowing active indicator dot when accordion is collapsed but active child is inside */}
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

      {/* 3. Footer controls: Live Store link, user identity, logout */}
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
