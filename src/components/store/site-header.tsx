import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

import { shopColumns } from "@/lib/navigation";
import { listNavCategories } from "@/server/services/catalog";

import { AccountButton } from "./account-button";
import { HeaderLinks } from "./header-links";
import { MobileMenu } from "./mobile-menu";
import { OfferTicker } from "./offer-ticker";
import { ShopMenu } from "./shop-menu";
import { SiteSearch } from "./site-search";

const navItems = [
  { label: "Ready to ship", href: "/products?ready=on" },
  { label: "Custom", href: "/services/custom-carpets" },
  { label: "Our Story", href: "/about" },
];

async function loadColumns() {
  "use cache";
  cacheTag("products");
  cacheLife("hours");
  return shopColumns(await listNavCategories());
}

async function Navigation() {
  // Outside the cache, so a database error is not remembered as an empty menu.
  const columns = await loadColumns().catch(() => shopColumns([]));
  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-7 text-base whitespace-nowrap lg:flex">
        <ShopMenu columns={columns} />
        {navItems.map(({ label, href }) => (
          <Link key={label} href={href} className="transition-opacity hover:opacity-70">
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex shrink-0 items-center">
        <AccountButton />
        <HeaderLinks />
        <MobileMenu
          columns={columns}
          items={[
            { label: "Our story", href: "/about" },
            { label: "Track order", href: "/track" },
            { label: "Contact", href: "/contact" },
            { label: "Wishlist", href: "/wishlist" },
          ]}
        />
      </div>
    </>
  );
}

export function SiteHeader() {
  return (
    <>
      <Suspense>
        <OfferTicker />
      </Suspense>
      <header className="fixed inset-x-0 top-12 z-40 px-4 sm:px-6 lg:px-8">
        <div className="liquid-glass relative mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full py-2 pr-3 pl-2 text-primary-foreground">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image src="/brand-symbol.svg" alt="" width={44} height={44} className="size-11 shrink-0" />
            <span className="truncate font-heading text-lg font-semibold tracking-tight">
              Ganga Handmade Export
            </span>
          </Link>
          <SiteSearch className="hidden max-w-xs flex-1 xl:block" />
          <Suspense fallback={<div className="h-11" />}>
            <Navigation />
          </Suspense>
        </div>
      </header>
    </>
  );
}
