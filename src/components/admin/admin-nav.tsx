"use client";

import {
  Boxes,
  CreditCard,
  ExternalLink,
  FileText,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareText,
  Package,
  RotateCcw,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  TicketPercent,
  Users,
} from "lucide-react";
import Image from "next/image";
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
    title: "Sales",
    items: [
      { label: "Orders", href: "/admin/orders", role: "staff", icon: ShoppingCart },
      { label: "Returns", href: "/admin/returns", role: "staff", icon: RotateCcw },
      { label: "Payments", href: "/admin/payments", role: "admin", icon: CreditCard },
    ],
  },
  {
    title: "Customers & Leads",
    items: [
      { label: "Customers", href: "/admin/customers", role: "admin", icon: Users },
      { label: "Enquiries", href: "/admin/enquiries", role: "staff", icon: MessageSquareText },
      { label: "Subscribers", href: "/admin/subscribers", role: "admin", icon: Mail },
      { label: "Reviews", href: "/admin/reviews", role: "staff", icon: Star },
    ],
  },
  {
    title: "Marketing & Store",
    items: [
      { label: "Coupons", href: "/admin/coupons", role: "admin", icon: TicketPercent },
      { label: "Banners", href: "/admin/banners", role: "admin", icon: ImageIcon },
      { label: "Settings", href: "/admin/settings", role: "owner", icon: Settings },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Team", href: "/admin/team", role: "owner", icon: Shield },
      { label: "Audit Log", href: "/admin/audit", role: "owner", icon: FileText },
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

const roleBadges: Record<AdminRole, { label: string; class: string }> = {
  owner: { label: "Owner", class: "bg-amber-400/20 text-amber-300 border-amber-400/30" },
  admin: { label: "Admin", class: "bg-blue-400/20 text-blue-300 border-blue-400/30" },
  staff: { label: "Staff", class: "bg-zinc-400/20 text-zinc-300 border-zinc-400/30" },
};

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
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3">
            <Image
              src="/brand-symbol.svg"
              alt="Ganga Handmade Export"
              width={34}
              height={34}
              className="size-8 shrink-0 brightness-125"
            />
            <div>
              <p className="font-heading text-base font-semibold tracking-tight text-white">
                GHE Admin
              </p>
              <p className="text-xs text-white/50">Handmade Rugs & Carpets</p>
            </div>
          </Link>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${
              roleBadges[admin.role].class
            }`}
          >
            {roleBadges[admin.role].label}
          </span>
        </div>

        {/* Grouped Navigation */}
        <nav aria-label="Admin Navigation" className="mt-6 space-y-6">
          {navSections.map((section) => {
            const accessibleItems = section.items.filter((item) =>
              hasRole(admin, item.role),
            );
            if (accessibleItems.length === 0) return null;

            return (
              <div key={section.title}>
                <p className="px-3 text-[11px] font-medium tracking-wider text-white/40 uppercase">
                  {section.title}
                </p>
                <div className="mt-1.5 space-y-0.5">
                  {accessibleItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                          active
                            ? "bg-amber-400/15 font-medium text-amber-300 shadow-xs"
                            : "text-white/70 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`size-4 shrink-0 transition-colors ${
                            active
                              ? "text-amber-400"
                              : "text-white/50 group-hover:text-white/80"
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
      <div className="mt-8 border-t border-white/10 pt-4 space-y-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="size-3.5 text-white/50" />
            View live store
          </span>
          <span className="text-[10px] text-white/40">↗</span>
        </Link>

        <div className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-white/60">
          <div className="truncate pr-2">
            <p className="truncate font-medium text-white/90">
              {admin.email || "Administrator"}
            </p>
            <p className="capitalize text-white/40">{admin.role} account</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              title="Sign out"
              aria-label="Sign out"
              className="rounded-md p-1.5 text-white/60 transition-colors hover:bg-destructive/20 hover:text-destructive-foreground"
            >
              <LogOut className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
