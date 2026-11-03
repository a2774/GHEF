"use client";

import { ChevronDown, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { NavColumn, NavLink } from "@/lib/navigation";

import { SiteSearch } from "./site-search";

export function MobileMenu({ items, columns = [] }: { items: NavLink[]; columns?: NavColumn[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/15 lg:hidden"
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="p-6">
          <SheetTitle className="text-2xl font-semibold tracking-tight">Menu</SheetTitle>
        </SheetHeader>
        <SiteSearch className="mx-6" />
        <nav aria-label="Mobile" className="px-6 pb-10">
          {columns
            .filter(({ links }) => links.length > 0)
            .map(({ title, links }) => (
              <details key={title} className="group border-t border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-heading text-2xl font-semibold tracking-tight">
                  {title}
                  <ChevronDown className="size-5 transition-transform group-open:rotate-180" strokeWidth={1.5} />
                </summary>
                <ul className="pb-4">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link href={href} onClick={close} className="block py-2.5 text-lg text-muted-foreground">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          {items.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={close}
              className="block border-t border-border py-4 font-heading text-2xl font-semibold tracking-tight"
            >
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
