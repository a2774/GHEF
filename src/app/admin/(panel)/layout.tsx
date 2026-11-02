import Link from "next/link";
import { Suspense } from "react";

import { logout } from "@/server/actions/admin-auth";
import { type AdminRole, getAdmin, hasRole, requireAdmin } from "@/server/auth/admin-session";

const links: { label: string; href: string; role: AdminRole }[] = [
  { label: "Dashboard", href: "/admin", role: "staff" },
  { label: "Products", href: "/admin/products", role: "staff" },
  { label: "Categories", href: "/admin/categories", role: "staff" },
  { label: "Inventory", href: "/admin/inventory", role: "staff" },
  { label: "Orders", href: "/admin/orders", role: "staff" },
  { label: "Returns", href: "/admin/returns", role: "staff" },
  { label: "Reviews", href: "/admin/reviews", role: "staff" },
  { label: "Payments", href: "/admin/payments", role: "admin" },
  { label: "Customers", href: "/admin/customers", role: "admin" },
  { label: "Coupons", href: "/admin/coupons", role: "admin" },
  { label: "Banners", href: "/admin/banners", role: "admin" },
  { label: "Settings", href: "/admin/settings", role: "owner" },
  { label: "Team", href: "/admin/team", role: "owner" },
  { label: "Audit log", href: "/admin/audit", role: "owner" },
];

async function AdminNav() {
  const admin = await getAdmin();
  if (!admin) return null;

  return (
    <nav aria-label="Admin" className="mt-3 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col">
      {links
        .filter(({ role }) => hasRole(admin, role))
        .map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg px-3 py-2 text-base whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {label}
          </Link>
        ))}
      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded-lg px-3 py-2 text-left text-base whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          Log out
        </button>
      </form>
    </nav>
  );
}

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-ink p-4 text-primary-foreground lg:p-6">
        <p className="font-heading text-lg font-semibold tracking-tight">GHE Admin</p>
        <Suspense fallback={null}>
          <AdminNav />
        </Suspense>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-10">
        <Suspense fallback={<p className="text-lg text-muted-foreground">Loading...</p>}>
          <AdminGuard>{children}</AdminGuard>
        </Suspense>
      </main>
    </div>
  );
}
