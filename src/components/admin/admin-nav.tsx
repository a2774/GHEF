"use client";

import {
  Activity,
  Boxes,
  Clock,
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
  RotateCcw,
  Send,
  Settings,
  Shield,
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

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", role: "staff", icon: LayoutDashboard },
      { label: "Traffic & Sales", href: "/admin/traffic", role: "admin", icon: TrendingUp },
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
      { label: "VIP Waitlist", href: "/admin/waitlist", role: "admin", icon: Clock },
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
}: {
  admin: AdminIdentity;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div className="flex h-full flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link
            href="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#bef264] text-slate-950 font-black shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Boxes className="size-5 text-slate-950" />
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-bold tracking-tight text-white truncate">
                Ganga Handmade
              </p>
              <p className="text-[11px] font-mono text-[#bef264] uppercase tracking-wider">
                Export Admin
              </p>
            </div>
          </Link>

          <span className="inline-flex items-center rounded-full bg-[#bef264] px-2 py-0.5 text-[10px] font-bold text-slate-950 uppercase tracking-wider shadow-2xs">
            {admin.role}
          </span>
        </div>

        {/* Grouped Navigation */}
        <nav aria-label="Admin Navigation" className="mt-5 space-y-5 overflow-y-auto pr-1">
          {navSections.map((section) => {
            const accessibleItems = section.items.filter((item) =>
              hasRole(admin, item.role),
            );
            if (accessibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <p className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  {section.title}
                </p>
                <div className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={`group flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                          active
                            ? "bg-white/10 text-white font-semibold shadow-xs border-l-2 border-[#bef264]"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`size-4 shrink-0 transition-colors ${
                            active
                              ? "text-[#bef264]"
                              : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer controls: Live Store link, user identity, logout */}
      <div className="mt-6 border-t border-white/10 pt-4 space-y-2.5">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white border border-white/5"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="size-3.5 text-[#bef264]" />
            View live store
          </span>
          <span className="text-[10px] text-slate-400">↗</span>
        </Link>

        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-xs border border-white/5">
          <div className="truncate pr-2">
            <p className="truncate font-mono font-medium text-white text-[11px]">
              {admin.email}
            </p>
            <p className="capitalize text-[10px] text-slate-400">{admin.role} session</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/20 hover:text-rose-300 cursor-pointer"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
