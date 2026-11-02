"use client";

import { Boxes, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AdminNav } from "./admin-nav";
import type { AdminIdentity } from "@/server/auth/admin-session";

export function MobileAdminNav({ admin }: { admin: AdminIdentity }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0B0F19] px-4 py-3 text-white lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#bef264] text-slate-950 font-bold shadow-2xs">
            <Boxes className="size-4 text-slate-950" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            Ganga Handmade <span className="text-[#bef264] font-mono text-xs">EXPORT</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-col bg-[#0B0F19] p-5 text-white shadow-2xl border-r border-white/10">
            <AdminNav admin={admin} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
