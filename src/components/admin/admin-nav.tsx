"use client";

import {
  Activity,
  Boxes,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  FolderTree,
  Image as ImageIcon,
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
  Star,
  TicketPercent,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/server/actions/admin-auth";
import type { AdminIdentity, AdminRole } from "@/server/auth/admin-session";
import { useAdminMode } from "@/components/admin/admin-mode-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavLink = {
  label: string;
  href: string;
  role: AdminRole;
  icon: React.ComponentType<{ className?: string }>;
};

type NavSection = {
  title: string;
  items: NavLink[];
};

// 🌿 Normal Mode: Only necessary pages for daily operations
const normalNavItems: NavLink[] = [
  { label: "Dashboard", href: "/admin", role: "staff", icon: LayoutDashboard },
  { label: "Analytics & Traffic", href: "/admin/traffic", role: "staff", icon: TrendingUp },
  { label: "Products", href: "/admin/products", role: "staff", icon: Package },
  { label: "Categories", href: "/admin/categories", role: "staff", icon: FolderTree },
  { label: "Inventory", href: "/admin/inventory", role: "staff", icon: Boxes },
  { label: "Orders", href: "/admin/orders", role: "staff", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", role: "admin", icon: Users },
  { label: "Enquiries", href: "/admin/enquiries", role: "staff", icon: MessageSquareText },
  { label: "Reviews", href: "/admin/reviews", role: "staff", icon: Star },
];

// ⚡ Pro Mode: All pages and options across full store suite
const proNavSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", role: "staff", icon: LayoutDashboard },
      { label: "Traffic & Attribution", href: "/admin/traffic", role: "staff", icon: TrendingUp },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", href: "/admin/products", role: "staff", icon: Package },
      { label: "Categories", href: "/admin/categories", role: "staff", icon: FolderTree },
      { label: "Inventory", href: "/admin/inventory", role: "staff", icon: Boxes },
    ],
  },
  {
    title: "Sales & Fulfillment",
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
  const { isPro } = useAdminMode();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  // 1. Minimized / Collapsed Sidebar Mode
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={150}>
        <div className="flex h-full w-full flex-col justify-between overflow-hidden select-none bg-[#0B132B] text-slate-100 items-center py-3">
          {/* Header with Logo & Expand button */}
          <div className="flex flex-col items-center gap-3 shrink-0 pb-3 border-b border-slate-800 w-full px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/admin"
                  onClick={onNavigate}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bef264] text-slate-950 font-black shadow-xs hover:scale-105 transition-transform"
                >
                  <Boxes className="size-5 text-slate-950" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="font-bold">Ganga Handmade Export</p>
                <p className="text-[11px] text-slate-400">Admin Panel</p>
              </TooltipContent>
            </Tooltip>

            {onToggleCollapse && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onToggleCollapse}
                    aria-label="Maximize sidebar"
                    className="flex size-8 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-[#bef264] hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <PanelLeftOpen className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span>Expand Sidebar</span>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Compact Navigation Icons (NO DOT) */}
          <nav
            aria-label="Admin Compact Navigation"
            className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 space-y-2 no-scrollbar flex flex-col items-center w-full px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isPro ? (
              // Pro Mode: All pages icons
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
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              onClick={onNavigate}
                              className={`group relative flex size-10 items-center justify-center rounded-xl transition-all ${
                                active
                                  ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-105"
                                  : "text-slate-400 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <Icon className="size-4.5 shrink-0" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {section.title}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              // Normal Mode: Necessary pages icons only
              <div className="space-y-1.5 w-full flex flex-col items-center">
                {normalNavItems
                  .filter((item) => hasRole(admin, item.role))
                  .map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            onClick={onNavigate}
                            className={`group relative flex size-10 items-center justify-center rounded-xl transition-all ${
                              active
                                ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-105"
                                : "text-slate-400 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <Icon className="size-4.5 shrink-0" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="font-semibold">{item.label}</p>
                          <p className="text-[10px] text-[#bef264]">Core Operation</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
              </div>
            )}
          </nav>

          {/* Compact Footer */}
          <div className="shrink-0 pt-3 border-t border-slate-800 flex flex-col items-center gap-2 w-full px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Live Store"
                  className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-[#bef264] hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="size-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">View Live Store</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <form action={logout}>
                  <button
                    type="submit"
                    aria-label="Sign out"
                    className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-4" />
                  </button>
                </form>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sign out</p>
                <p className="text-[10px] text-slate-400">{admin.email}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // 2. Full Expanded Sidebar Mode
  return (
    <div className="flex h-full w-full flex-col justify-between overflow-hidden select-none bg-[#0B132B] text-slate-100">
      {/* Brand Header */}
      <div className="shrink-0 p-4 pb-3.5 border-b border-slate-800/80 bg-slate-950/30">
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
            <span className="inline-flex items-center rounded-full bg-[#bef264] px-2 py-0.5 text-[10px] font-bold text-slate-950 uppercase tracking-wider shadow-2xs">
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

      {/* Navigation List: Simple Flat Layout (No Accordions, No promo card) */}
      <div className="flex-1 min-h-0 flex flex-col">
        {!isPro ? (
          /* Normal Mode: Clean Flat List of Necessary Pages Only */
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="px-4 pt-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Operations
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
                      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
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
            </nav>
          </div>
        ) : (
          /* Pro Mode: Simple Flat Categorized List (All Pages Visible) */
          <div className="flex-1 min-h-0 flex flex-col">
            <nav
              aria-label="Admin Navigation"
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2.5 py-2 space-y-4 no-scrollbar"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {proNavSections.map((section) => {
                const accessibleItems = section.items.filter((item) =>
                  hasRole(admin, item.role)
                );
                if (accessibleItems.length === 0) return null;

                return (
                  <div key={section.title} className="space-y-1">
                    <div className="px-3 pt-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      {section.title}
                    </div>

                    <div className="space-y-0.5">
                      {accessibleItems.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                              active
                                ? "bg-[#bef264] text-slate-950 font-bold shadow-xs scale-[1.01]"
                                : "text-slate-300 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
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
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Footer: Live Store link, user identity, logout */}
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
