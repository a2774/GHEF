import { Skeleton } from "@/components/ui/skeleton";

export function AdminPanelSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Title & Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>

      {/* 2. Primary KPI Cards Grid (Matches PushMyRank / Admin Style) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28 rounded-lg" />
            <Skeleton className="h-3 w-36 rounded" />
          </div>
        ))}
      </div>

      {/* 3. Secondary Section / Table & Cards Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <Skeleton className="h-4 w-36 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>

          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="flex items-center justify-between py-2.5 border-b border-slate-100/80 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-48 rounded" />
                  <Skeleton className="h-3 w-32 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminSidebarSkeleton() {
  return (
    <aside className="hidden h-screen sticky top-0 bg-[#0B132B] text-white lg:flex lg:flex-col lg:w-72 border-r border-slate-800 shrink-0 select-none overflow-hidden z-20">
      {/* Brand Header */}
      <div className="shrink-0 p-4 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-[#bef264]/20 animate-pulse shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <div className="h-4 w-32 bg-white/20 rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-[#bef264]/30 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-12 rounded-full bg-white/10 animate-pulse shrink-0" />
        </div>
      </div>

      {/* Nav categories */}
      <div className="flex-1 p-3 space-y-2 overflow-hidden">
        <div className="h-3 w-20 bg-white/10 rounded mb-3 animate-pulse" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-9 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-slate-800 space-y-2">
        <div className="h-8 rounded-xl bg-white/5 animate-pulse" />
        <div className="h-10 rounded-xl bg-white/5 animate-pulse" />
      </div>
    </aside>
  );
}
