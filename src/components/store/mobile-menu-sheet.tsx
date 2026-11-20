"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { NavColumn, NavLink } from "@/lib/navigation";

import { SiteSearch } from "./site-search";

/** The slide-in menu of a phone. It is loaded the first time the menu button is used (see MobileMenu). */
export function MobileMenuSheet({
  open,
  onOpenChange,
  items,
  columns,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: NavLink[];
  columns: NavColumn[];
}) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
