"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileMenu({ items }: { items: { label: string; href: string }[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/15 lg:hidden"
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="p-6">
          <SheetTitle className="text-2xl font-semibold tracking-tight">Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile" className="px-6">
          {items.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
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
