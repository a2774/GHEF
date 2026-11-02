import Link from "next/link";
import { Suspense } from "react";

import { logout } from "@/server/actions/admin-auth";
import { requireAdmin } from "@/server/auth/admin-session";

const links = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Orders", href: "/admin/orders" },
];

async function AdminGuard({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="bg-ink p-4 text-primary-foreground lg:p-6">
        <p className="font-heading text-lg font-semibold tracking-tight">GHE Admin</p>
        <nav aria-label="Admin" className="mt-3 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-col">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2.5 text-base whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          ))}
          <form action={logout}>
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2.5 text-left text-base whitespace-nowrap text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              Log out
            </button>
          </form>
        </nav>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-10">
        <Suspense fallback={<p className="text-lg text-muted-foreground">Loading...</p>}>
          <AdminGuard>{children}</AdminGuard>
        </Suspense>
      </main>
    </div>
  );
}
