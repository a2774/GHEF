"use client";

import { Boxes, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AdminNav } from "./admin-nav";
import type { AdminIdentity } from "@/server/auth/admin-session";
import { useAdminMode } from "@/components/admin/admin-mode-context";

export function MobileAdminNav({ admin }: { admin: AdminIdentity }) {
  const [open, setOpen] = useState(false);
  const { mode, toggleMode, isPro } = useAdminMode();

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

        <div className="flex items-center gap-2">
          {/* Mobile Fast Mode Pill */}
          <button
            type="button"
            onClick={toggleMode}
            title={`Switch to ${isPro ? "Normal" : "Pro"} Mode`}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              isPro
                ? "bg-amber-400/20 border-amber-400/50 text-amber-300"
                : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
            }`}
          >
            <span>{isPro ? "⚡ Pro" : "🌿 Normal"}</span>
          </button>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs h-full flex-col bg-[#0B0F19] text-white shadow-2xl border-r border-white/10 overflow-hidden">
            <AdminNav admin={admin} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
