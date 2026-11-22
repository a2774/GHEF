"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import type { NavColumn } from "@/lib/navigation";

export function ShopMenu({ columns }: { columns: NavColumn[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  // A hover opens the menu just before the click lands; ignore that click.
  const openedByHoverAt = useRef(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onClick = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={root} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (Date.now() - openedByHoverAt.current < 400) return;
          setOpen((value) => !value);
        }}
        onMouseEnter={() => {
          if (!open) openedByHoverAt.current = Date.now();
          setOpen(true);
        }}
        className="flex items-center gap-1 transition-opacity hover:opacity-70"
      >
        Shop
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.5} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full pt-3"
      >
        <div className="grid grid-cols-4 gap-8 rounded-3xl bg-background p-8 text-foreground shadow-2xl ring-1 ring-border">
          {columns.map(({ title, links }) => (
            <div key={title}>
              <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
              <ul className="mt-3 space-y-0.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} onClick={() => setOpen(false)} className="block rounded-lg py-1.5 text-base hover:text-muted-foreground">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
