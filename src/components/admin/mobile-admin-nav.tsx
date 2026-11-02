"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { AdminNav } from "./admin-nav";
import type { AdminIdentity } from "@/server/auth/admin-session";

export function MobileAdminNav({ admin }: { admin: AdminIdentity }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/brand-symbol.svg"
            alt="GHE Admin"
            width={28}
            height={28}
            className="size-7 shrink-0"
          />
          <span className="font-heading text-base font-semibold tracking-tight">
            GHE Admin
          </span>
        </Link>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg border border-input p-2 text-foreground transition-colors hover:bg-muted"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-col bg-ink p-5 text-white shadow-xl">
            <AdminNav admin={admin} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
