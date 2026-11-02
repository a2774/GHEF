import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TrafficSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header and Filter Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button skeleton */}
          <Skeleton className="h-9 w-24 rounded-lg" />
          {/* Date range pills skeleton */}
          <Skeleton className="h-9 w-64 rounded-xl" />
        </div>
      </div>

      {/* 5 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="size-4 rounded-full" />
            </div>
            <div className="flex items-baseline gap-2">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-4 w-12 rounded-md" />
            </div>
            <Skeleton className="h-3 w-24" />
          </Card>
        ))}
      </div>

      {/* Visual Activity & Trend Graph Skeleton */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-3.5 w-72" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Bar chart placeholder */}
        <div className="flex h-48 items-end gap-3 pt-4 sm:gap-6 justify-between">
          {[40, 25, 60, 95, 80, 55, 70].map((height, idx) => (
            <div key={idx} className="flex flex-1 flex-col items-center gap-2 h-full justify-end">
              <div className="w-full flex items-end justify-center h-full">
                <Skeleton
                  style={{ height: `${height}%` }}
                  className="w-full max-w-[42px] rounded-t-lg"
                />
              </div>
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </Card>

      {/* Grid: Traffic Sources & Device Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Attribution Sources Table Skeleton */}
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-64" />
            </div>
            <Skeleton className="h-5 w-28 rounded-full" />
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-lg" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-2 w-20 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </Card>

        {/* Device Breakdown Skeleton */}
        <Card className="p-6 space-y-4">
          <div className="pb-4 border-b border-slate-100 space-y-1.5">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-44" />
          </div>

          <div className="space-y-5 pt-2">
            {[
              { width: "65%" },
              { width: "28%" },
              { width: "7%" },
            ].map((d, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </Card>
      </div>

      {/* Top Viewed Pages Skeleton */}
      <Card className="p-6 space-y-4">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-60" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        <div className="divide-y divide-slate-100 pt-1">
          {[1, 2, 3, 4].map((p) => (
            <div key={p} className="flex flex-wrap items-center justify-between py-3 gap-3">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="flex items-center gap-6">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
