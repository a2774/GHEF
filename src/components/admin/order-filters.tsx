"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Return Requested", value: "return_requested" },
  { label: "Returned", value: "returned" },
  { label: "Refunded", value: "refunded" },
];

export function OrderFilters({
  initialQuery = "",
  initialStatus = "",
}: {
  initialQuery?: string;
  initialStatus?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(initialQuery);
  const [status, setStatus] = React.useState(initialStatus);

  const applyFilters = (newQ: string, newStatus: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (newQ.trim()) {
      params.set("q", newQ.trim());
    } else {
      params.delete("q");
    }

    if (newStatus) {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    router.push(`/admin/orders?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(q, status);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    applyFilters(q, val);
  };

  const handleClear = () => {
    setQ("");
    setStatus("");
    router.push("/admin/orders");
  };

  const hasActiveFilters = Boolean(q || status);

  return (
    <div className="space-y-3">
      {/* Search & Select Bar */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search orders"
            placeholder="Search by order #, name, email or phone..."
            className="h-9 w-full rounded-full border border-slate-200/90 bg-white pl-9 pr-9 text-xs shadow-2xs focus:border-[#bef264] transition-all"
          />
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                applyFilters("", status);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Custom styled select */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="Filter by status"
            className="h-9 appearance-none rounded-full border border-slate-200/90 bg-white pl-4 pr-8 text-xs font-medium text-slate-700 shadow-2xs focus:border-[#bef264] focus:outline-none transition-all cursor-pointer hover:border-slate-300"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
        </div>

        <Button
          type="submit"
          className="h-9 rounded-full bg-[#0B0F19] px-5 text-xs font-semibold text-white shadow-2xs hover:bg-[#1a233a] cursor-pointer"
        >
          Search
        </Button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-9 rounded-full text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            Reset
          </Button>
        )}
      </form>

      {/* Quick Status Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        {[
          { label: "All", val: "" },
          { label: "Pending", val: "pending" },
          { label: "Confirmed", val: "confirmed" },
          { label: "Processing", val: "processing" },
          { label: "Shipped", val: "shipped" },
          { label: "Delivered", val: "delivered" },
          { label: "Cancelled", val: "cancelled" },
        ].map((chip) => {
          const isActive = status === chip.val;
          return (
            <button
              key={chip.val}
              type="button"
              onClick={() => handleStatusChange(chip.val)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0B0F19] text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
