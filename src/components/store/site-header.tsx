import Image from "next/image";
import Link from "next/link";

import { BagSheet } from "./bag-sheet";
import { MobileMenu } from "./mobile-menu";

const navItems = [
  { label: "Shop", href: "/#collection" },
  { label: "Collections", href: "/#spaces" },
  { label: "Our Story", href: "/#story" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-4 z-40 px-4 sm:px-6 lg:px-8">
      <div className="liquid-glass mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full py-2 pr-3 pl-2 text-primary-foreground">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image src="/brand-symbol.svg" alt="" width={44} height={44} className="size-11 shrink-0" />
          <span className="truncate font-heading text-lg font-semibold tracking-tight">
            Ganga Handmade Export
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-9 text-base lg:flex">
          {navItems.map(({ label, href }) => (
            <Link key={label} href={href} className="transition-opacity hover:opacity-70">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center">
          <BagSheet />
          <MobileMenu items={navItems} />
        </div>
      </div>
    </header>
  );
}
