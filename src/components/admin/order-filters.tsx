"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Filter, RotateCw, Search, X } from "lucide-react";
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

const RANGES = [
  { key: "all", label: "All Orders" },
  { key: "24h", label: "24 hrs" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "365d", label: "365 days" },
];

export function OrderFilters({
  initialQuery = "",
  initialStatus = "",
  initialRange = "all",
  initialFrom = "",
  initialTo = "",
}: {
  initialQuery?: string;
  initialStatus?: string;
  initialRange?: string;
  initialFrom?: string;
  initialTo?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = React.useState(initialQuery);
  const [status, setStatus] = React.useState(initialStatus);
  const [dateRange, setDateRange] = React.useState(initialRange);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = React.useState("Just now");
  const [showCustomDate, setShowCustomDate] = React.useState(initialRange === "custom");
  const [startDate, setStartDate] = React.useState(initialFrom);
  const [endDate, setEndDate] = React.useState(initialTo);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedAt(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 600);
  };

  /** The address is the source of truth: every filter writes into it, and the page loads the matching orders. */
  const go = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `/admin/orders?${query}` : "/admin/orders");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    go({ q: q.trim() || null, status: status || null });
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    go({ status: val || null });
  };

  const handleRangeChange = (key: string) => {
    setDateRange(key);
    setShowCustomDate(false);
    setStartDate("");
    setEndDate("");
    go({ range: key === "all" ? null : key, from: null, to: null });
  };

  const handleCustomApply = () => {
    if (!startDate && !endDate) return;
    setDateRange("custom");
    setShowCustomDate(false);
    go({ range: "custom", from: startDate || null, to: endDate || null });
  };

  const handleClear = () => {
    setQ("");
    setStatus("");
    setDateRange("all");
    setShowCustomDate(false);
    setStartDate("");
    setEndDate("");
    router.push("/admin/orders");
  };

  const hasActiveFilters = Boolean(q || status || dateRange !== "all");

  return (
    <div className="space-y-3.5">
      {/* 1. Date Range Toolbar & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
        {/* Date Range Selector Pill */}
        <div className="inline-flex flex-wrap items-center rounded-full bg-slate-200/70 p-1 shadow-inner">
          {RANGES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={dateRange === key}
              onClick={() => handleRangeChange(key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                dateRange === key
                  ? "bg-[#0B132B] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            aria-pressed={dateRange === "custom"}
            onClick={() => setShowCustomDate(!showCustomDate)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              dateRange === "custom" || showCustomDate
                ? "bg-[#0B132B] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Calendar className="size-3" />
            <span>Custom</span>
          </button>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] transition-all cursor-pointer"
        >
          <RotateCw
            className={`size-3.5 text-slate-500 transition-transform duration-500 ${
              isRefreshing ? "animate-spin text-slate-900" : "group-hover:rotate-45"
            }`}
          />
          <span>{isRefreshing ? "Syncing..." : "Refresh"}</span>
          <span className="hidden sm:inline text-[10px] font-normal text-slate-400">
            • {lastRefreshedAt}
          </span>
        </button>
      </div>

      {/* Custom Date Range Popover */}
      {showCustomDate && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm animate-in fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">Filter Placed Between:</span>
            <input
              type="date"
              aria-label="From date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-mono text-slate-800"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              aria-label="To date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-mono text-slate-800"
            />
            <button
              type="button"
              onClick={handleCustomApply}
              disabled={!startDate && !endDate}
              className="rounded-full bg-[#0B132B] px-3.5 py-1 text-xs font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* 2. Search & Select Bar */}
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
              aria-label="Clear search"
              onClick={() => {
                setQ("");
                go({ q: null });
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
          className="h-9 rounded-full bg-[#0B132B] px-5 text-xs font-semibold text-white shadow-2xs hover:bg-[#1a233a] cursor-pointer"
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

      {/* 3. Quick Status Chips */}
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
              aria-pressed={isActive}
              onClick={() => handleStatusChange(chip.val)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0B132B] text-white shadow-xs"
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
