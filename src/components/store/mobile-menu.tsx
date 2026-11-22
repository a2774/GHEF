"use client";

import { Menu } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { NavColumn, NavLink } from "@/lib/navigation";

// Only the button is part of every page. The menu itself (and the dialog library behind it) is
// fetched while the browser is idle just after the page opens, and shown from the first tap.
const MobileMenuSheet = dynamic(() => import("./mobile-menu-sheet").then((module) => module.MobileMenuSheet), {
  ssr: false,
});
const loadSheet = () => import("./mobile-menu-sheet");

export function MobileMenu({ items, columns = [] }: { items: NavLink[]; columns?: NavColumn[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 3000));
    idle(() => void loadSheet());
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
        className="flex size-11 items-center justify-center rounded-full transition-colors hover:bg-white/15 lg:hidden"
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </button>
      {mounted && <MobileMenuSheet open={open} onOpenChange={setOpen} items={items} columns={columns} />}
    </>
  );
}
