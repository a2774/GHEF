"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin panel error:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-rose-200 bg-white p-8 max-w-2xl shadow-2xs space-y-4">
      <div className="flex items-center gap-3 text-rose-600">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 border border-rose-200">
          <AlertTriangle className="size-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Admin Dashboard Error
          </h2>
          <p className="text-xs text-slate-500">
            An unexpected error occurred while loading this administrative view.
          </p>
        </div>
      </div>

      {error.message && (
        <pre className="max-h-40 overflow-auto rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs font-mono text-rose-700">
          {error.message}
        </pre>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          onClick={() => reset()}
          className="h-9 rounded-full bg-[#bef264] px-5 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] cursor-pointer"
        >
          <RotateCcw className="size-3.5 mr-1.5" />
          <span>Try Again</span>
        </Button>
        <Link
          href="/admin"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <Home className="size-3.5" />
          <span>Dashboard Overview</span>
        </Link>
      </div>
    </div>
  );
}
