"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Boxes,
  Check,
  Package,
  RotateCw,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateStock } from "@/server/actions/admin-modules";

interface InventoryVariant {
  id: number;
  title: string;
  size: string;
  color: string;
  sku: string;
  stock: number;
}

type StockFilter = "all" | "low" | "out" | "healthy";
type SortOption = "lowest" | "highest" | "title";

export function InventoryClient({ initialRows }: { initialRows: InventoryVariant[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [sort, setSort] = useState<SortOption>("lowest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState("Just now");

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

  const filteredAndSortedRows = useMemo(() => {
    let result = [...initialRows];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.size.toLowerCase().includes(q) ||
          r.color.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q)
      );
    }

    // Stock level filter
    if (filter === "low") {
      result = result.filter((r) => r.stock > 0 && r.stock <= 3);
    } else if (filter === "out") {
      result = result.filter((r) => r.stock === 0);
    } else if (filter === "healthy") {
      result = result.filter((r) => r.stock > 3);
    }

    // Sort
    if (sort === "lowest") {
      result.sort((a, b) => a.stock - b.stock);
    } else if (sort === "highest") {
      result.sort((a, b) => b.stock - a.stock);
    } else if (sort === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [initialRows, search, filter, sort]);

  const stats = useMemo(() => {
    const totalVariants = initialRows.length;
    const totalUnits = initialRows.reduce((sum, r) => sum + r.stock, 0);
    const lowCount = initialRows.filter((r) => r.stock > 0 && r.stock <= 3).length;
    const outCount = initialRows.filter((r) => r.stock === 0).length;
    return { totalVariants, totalUnits, lowCount, outCount };
  }, [initialRows]);

  return (
    <div className={`space-y-6 pb-12 transition-opacity duration-200 ${isRefreshing ? "opacity-80" : "opacity-100"}`}>
      {/* 1. Header with Refresh */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">
              Warehouse Inventory
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#bef264]/40 border border-[#bef264] px-2.5 py-0.5 text-[11px] font-bold text-slate-950">
              <Boxes className="size-3.5" />
              Live Stocks
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Quickly adjust on-hand inventory levels for handcrafted rug variants and prevent overselling.
          </p>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-950 active:scale-[0.98] transition-all cursor-pointer shrink-0"
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

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Variants
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {stats.totalVariants}
          </div>
          <p className="mt-1 text-xs text-slate-400">Unique size & color combinations</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total On-Hand Rugs
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {stats.totalUnits.toLocaleString("en-IN")}
          </div>
          <p className="mt-1 text-xs text-slate-400">Physical pieces stored in warehouse</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Low Stock</span>
            {stats.lowCount > 0 && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                Action Required
              </span>
            )}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <span>{stats.lowCount}</span>
            {stats.lowCount > 0 && <span className="size-2 rounded-full bg-amber-500" />}
          </div>
          <p className="mt-1 text-xs text-slate-400">≤ 3 units available</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Out of Stock</span>
            {stats.outCount > 0 && (
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                Outage
              </span>
            )}
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-slate-950 flex items-center gap-2">
            <span>{stats.outCount}</span>
            {stats.outCount > 0 && <span className="size-2 rounded-full bg-rose-500" />}
          </div>
          <p className="mt-1 text-xs text-slate-400">0 units in warehouse</p>
        </div>
      </div>

      {/* 3. Filter and Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by rug name, size, color, SKU..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs shadow-2xs focus:border-[#bef264]"
            />
          </div>

          {/* Stock Filter Pills */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {[
              { key: "all", label: `All (${initialRows.length})` },
              { key: "low", label: `Low (${stats.lowCount})` },
              { key: "out", label: `Out (${stats.outCount})` },
              { key: "healthy", label: "Healthy" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key as StockFilter)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  filter === key
                    ? "bg-white text-slate-950 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-3.5 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs focus:border-[#bef264] focus:outline-none cursor-pointer"
          >
            <option value="lowest">Lowest Stock First</option>
            <option value="highest">Highest Stock First</option>
            <option value="title">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* 4. Table / List of Variants */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full min-w-[640px] text-left text-sm text-slate-700">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Product &amp; Weave</th>
              <th className="px-5 py-3.5">Size &amp; Color</th>
              <th className="px-5 py-3.5">SKU Code</th>
              <th className="px-5 py-3.5">Inventory Status</th>
              <th className="px-5 py-3.5 text-right">Quick Stock Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-xs text-slate-400">
                  No rug variants match your search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedRows.map((row) => {
                const isOut = row.stock === 0;
                const isLow = row.stock > 0 && row.stock <= 3;

                return (
                  <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{row.title}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      <span className="font-medium text-slate-800">{row.size}</span>
                      <span className="text-slate-400"> • </span>
                      <span>{row.color}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                      {row.sku}
                    </td>
                    <td className="px-5 py-3.5">
                      {isOut ? (
                        <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                          Low: {row.stock} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                          {row.stock} in stock
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <form action={updateStock.bind(null, row.id)} className="inline-flex items-center justify-end gap-2">
                        <Input
                          name="stock"
                          type="number"
                          min="0"
                          defaultValue={row.stock}
                          aria-label={`Stock for ${row.title}`}
                          className="h-8 w-20 rounded-xl border border-slate-200 bg-white text-center font-mono text-xs font-bold text-slate-900 shadow-2xs focus:border-[#bef264]"
                        />
                        <Button
                          type="submit"
                          className="h-8 rounded-full bg-[#bef264] px-4 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] transition-all cursor-pointer"
                        >
                          Save
                        </Button>
                      </form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

