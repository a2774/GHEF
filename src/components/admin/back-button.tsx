"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Goes back to the page the owner came from (for example the Orders list with its filters still
 * set). When the page was opened directly, with nothing to go back to, it opens `fallbackHref`.
 */
export function BackButton({ fallbackHref, children }: { fallbackHref: string; children: ReactNode }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallbackHref))}
      className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-[#bef264] focus-visible:outline-none"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      {children}
    </button>
  );
}
