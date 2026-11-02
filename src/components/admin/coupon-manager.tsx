"use client";

import * as React from "react";
import {
  Calendar,
  Check,
  Copy,
  FolderPlus,
  Loader2,
  Percent,
  Power,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  TicketPercent,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "@/components/ui/sonner";
import { formatPaise } from "@/lib/format";
import { createCoupon, deleteCoupon, toggleCoupon } from "@/server/actions/admin-coupons";

export interface CouponItem {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minCartPaise: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  endsAt: Date | null;
  createdAt: Date;
}

interface CouponManagerProps {
  initialCoupons: CouponItem[];
}

const PRESETS = [
  { label: "10% Welcome", code: "WELCOME10", type: "percent" as const, value: 10, minCart: 5000 },
  { label: "15% Festive", code: "FESTIVE15", type: "percent" as const, value: 15, minCart: 10000 },
  { label: "20% Luxury", code: "LUXURY20", type: "percent" as const, value: 20, minCart: 20000 },
  { label: "₹500 Flat Off", code: "FLAT500", type: "fixed" as const, value: 500, minCart: 3000 },
  { label: "₹1,000 Flat Off", code: "HERITAGE1000", type: "fixed" as const, value: 1000, minCart: 15000 },
];

export function CouponManager({ initialCoupons }: CouponManagerProps) {
  const [coupons, setCoupons] = React.useState<CouponItem[]>(initialCoupons);
  const [filter, setFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<number | null>(null);

  // Form State
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<"percent" | "fixed">("percent");
  const [value, setValue] = React.useState<string>("10");
  const [minCart, setMinCart] = React.useState<string>("0");
  const [maxUses, setMaxUses] = React.useState<string>("");
  const [endsAt, setEndsAt] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<number | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCoupons(initialCoupons);
  }, [initialCoupons]);

  const handleApplyPreset = (p: (typeof PRESETS)[number]) => {
    setCode(p.code);
    setType(p.type);
    setValue(String(p.value));
    setMinCart(String(p.minCart));
    setFormError(null);
    toast.info(`Preset applied: ${p.code} (${p.label})`);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      setFormError("Please enter a coupon code");
      toast.error("Coupon code cannot be empty");
      return;
    }

    const numValue = Number(value);
    if (!numValue || numValue <= 0) {
      setFormError("Discount value must be greater than zero");
      toast.error("Invalid discount value");
      return;
    }

    if (type === "percent" && numValue > 100) {
      setFormError("Percentage discount cannot exceed 100%");
      toast.error("Percentage cannot exceed 100%");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("code", cleanCode);
      formData.set("type", type);
      formData.set("value", String(numValue));
      formData.set("minCart", minCart || "0");
      if (maxUses) formData.set("maxUses", maxUses);
      if (endsAt) formData.set("endsAt", endsAt);

      const error = await createCoupon(null, formData);
      if (error) {
        setFormError(error);
        toast.error(error);
        return;
      }

      toast.success(`Coupon "${cleanCode}" created & ready to activate!`);
      // Reset form to defaults
      setCode("");
      setValue("10");
      setMinCart("0");
      setMaxUses("");
      setEndsAt("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create coupon";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: number, currentCode: string, isCurrentlyActive: boolean) => {
    setTogglingId(id);
    try {
      await toggleCoupon(id);
      const willBeActive = !isCurrentlyActive;
      setCoupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: willBeActive } : c))
      );
      if (willBeActive) {
        toast.success(`Coupon "${currentCode}" is now ACTIVE!`);
      } else {
        toast.info(`Coupon "${currentCode}" is now DEACTIVATED.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle status";
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: number, couponCode: string) => {
    await deleteCoupon(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCopy = (coupon: CouponItem) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    toast.success(`Copied "${coupon.code}" to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list
  const filtered = coupons.filter((coupon) => {
    if (filter === "active" && !coupon.isActive) return false;
    if (filter === "inactive" && coupon.isActive) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return coupon.code.toLowerCase().includes(q);
    }
    return true;
  });

  const activeCount = coupons.filter((c) => c.isActive).length;
  const inactiveCount = coupons.length - activeCount;

  return (
    <div className="space-y-6">
      {/* Creation Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <TicketPercent className="size-5 text-slate-900" />
              <span>Create Discount Coupon</span>
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Configure promotional codes, percentage discounts, minimum cart values and usage caps.
            </p>
          </div>

          {/* Quick Preset Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="size-3 text-amber-500" />
              Quick Presets:
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-[#bef264] hover:bg-[#bef264]/20 hover:text-slate-950 transition-all cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form noValidate onSubmit={handleCreate} className="space-y-5">
          {/* Discount Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-2 max-w-md">
              <button
                type="button"
                onClick={() => setType("percent")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  type === "percent"
                    ? "border-[#0B0F19] bg-[#0B0F19] text-white shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Percent className="size-3.5" />
                <span>Percentage (% Off)</span>
              </button>

              <button
                type="button"
                onClick={() => setType("fixed")}
                className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  type === "fixed"
                    ? "border-[#0B0F19] bg-[#0B0F19] text-white shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Tag className="size-3.5" />
                <span>Fixed Amount (₹ Off)</span>
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Coupon Code */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Coupon Code <span className="text-rose-500">*</span>
              </label>
              <Input
                name="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (formError) setFormError(null);
                }}
                placeholder="e.g. SUMMER2026"
                disabled={isSubmitting}
                className="h-10 rounded-xl border-slate-200 bg-white font-mono font-bold uppercase tracking-wider text-xs focus:border-[#bef264]"
              />
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {type === "percent" ? "Discount Percentage (%)" : "Flat Amount Discount (₹)"}{" "}
                <span className="text-rose-500">*</span>
              </label>
              <Input
                name="value"
                type="number"
                min="1"
                max={type === "percent" ? "100" : undefined}
                step={type === "percent" ? "1" : "50"}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (formError) setFormError(null);
                }}
                disabled={isSubmitting}
                placeholder={type === "percent" ? "15" : "500"}
                className="h-10 rounded-xl border-slate-200 bg-white font-mono text-xs focus:border-[#bef264]"
              />
            </div>

            {/* Min Cart ₹ */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Minimum Cart Value (₹)
              </label>
              <Input
                name="minCart"
                type="number"
                min="0"
                step="100"
                value={minCart}
                onChange={(e) => setMinCart(e.target.value)}
                disabled={isSubmitting}
                placeholder="0 for no minimum"
                className="h-10 rounded-xl border-slate-200 bg-white font-mono text-xs focus:border-[#bef264]"
              />
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Usage Limit (Optional)
              </label>
              <Input
                name="maxUses"
                type="number"
                min="1"
                step="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                disabled={isSubmitting}
                placeholder="Unlimited uses"
                className="h-10 rounded-xl border-slate-200 bg-white font-mono text-xs focus:border-[#bef264]"
              />
            </div>

            {/* Ends At */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Expiry Date (Optional)
              </label>
              <Input
                name="endsAt"
                type="date"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                disabled={isSubmitting}
                className="h-10 rounded-xl border-slate-200 bg-white text-xs focus:border-[#bef264]"
              />
            </div>

            {/* Live Voucher Preview */}
            <div className="flex flex-col justify-end">
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-3 relative overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="block font-mono text-xs font-black tracking-wider text-slate-950 truncate">
                      {code.trim().toUpperCase() || "CODE_PREVIEW"}
                    </span>
                    <span className="block text-[11px] font-semibold text-emerald-600">
                      {type === "percent" ? `${value || 0}% OFF ORDER` : `₹${value || 0} FLAT OFF`}
                    </span>
                  </div>
                  <span className="rounded-full bg-[#bef264] px-2 py-0.5 font-mono text-[10px] font-bold text-slate-950 shrink-0">
                    PREVIEW
                  </span>
                </div>
              </div>
            </div>
          </div>

          {formError && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
              {formError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-full bg-[#bef264] px-7 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] cursor-pointer disabled:opacity-60 inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating Voucher...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="size-3.5" />
                  <span>Create Discount Coupon</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Coupons Directory & Activation List */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-slate-200/70 p-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
                filter === "all" ? "bg-white text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              All ({coupons.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("active")}
              className={`rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
                filter === "active" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("inactive")}
              className={`rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
                filter === "inactive" ? "bg-white text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by coupon code..."
              className="h-8 w-full rounded-full border-slate-200 bg-white pl-8 pr-3 text-xs"
            />
          </div>
        </div>

        {/* Coupons List */}
        <ul className="divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <li className="p-12 text-center text-xs text-slate-400">
              {search.trim()
                ? `No coupon found matching "${search}".`
                : "No coupons available under this filter."}
            </li>
          ) : (
            filtered.map((coupon) => {
              const isToggling = togglingId === coupon.id;
              const isCopied = copiedId === coupon.id;

              return (
                <li
                  key={coupon.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 transition-colors hover:bg-slate-50/60"
                >
                  <div className="space-y-1.5 min-w-[240px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(coupon)}
                        title="Click to copy code"
                        className="group inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 font-mono font-bold text-slate-950 border border-slate-200/90 text-xs hover:border-slate-300 transition-colors cursor-pointer"
                      >
                        <span>{coupon.code}</span>
                        {isCopied ? (
                          <Check className="size-3 text-emerald-600" />
                        ) : (
                          <Copy className="size-3 text-slate-400 group-hover:text-slate-700" />
                        )}
                      </button>

                      <span className="inline-flex items-center rounded-full bg-[#bef264] px-2.5 py-0.5 text-[11px] font-bold text-slate-950 shadow-2xs">
                        {coupon.type === "percent"
                          ? `${coupon.value}% OFF`
                          : `${formatPaise(coupon.value)} OFF`}
                      </span>

                      {/* Status indicator */}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase border ${
                          coupon.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            coupon.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          }`}
                        />
                        <span>{coupon.isActive ? "Active" : "Inactive"}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-slate-500">
                      <span>Redeemed: {coupon.usedCount} times</span>
                      <span>•</span>
                      <span>
                        {coupon.maxUses ? `Max limit: ${coupon.maxUses}` : "Unlimited usage"}
                      </span>
                      {coupon.minCartPaise > 0 && (
                        <>
                          <span>•</span>
                          <span>Min order: {formatPaise(coupon.minCartPaise)}</span>
                        </>
                      )}
                      {coupon.endsAt && (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-amber-700">
                            <Calendar className="size-2.5" />
                            <span>Expires {new Date(coupon.endsAt).toLocaleDateString()}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions: Activate / Deactivate & Delete with Alert Dialog */}
                  <div className="flex items-center gap-2">
                    {/* Activate / Deactivate Button */}
                    <Button
                      type="button"
                      size="sm"
                      disabled={isToggling}
                      onClick={() => handleToggle(coupon.id, coupon.code, coupon.isActive)}
                      className={`rounded-full px-3.5 text-xs font-semibold transition-all cursor-pointer ${
                        coupon.isActive
                          ? "border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                      }`}
                    >
                      {isToggling ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : coupon.isActive ? (
                        <>
                          <Power className="size-3 text-amber-600" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <Power className="size-3 text-emerald-600" />
                          <span>Activate</span>
                        </>
                      )}
                    </Button>

                    {/* Delete with Alert Confirmation Dialog */}
                    <ConfirmDeleteDialog
                      title="Delete Coupon Voucher?"
                      itemName={`Coupon Code: ${coupon.code}`}
                      description={`Are you sure you want to delete coupon "${coupon.code}"? Customers will no longer be able to redeem this promotion at checkout. This cannot be undone.`}
                      confirmText="Delete Coupon"
                      successMessage={`Coupon "${coupon.code}" permanently deleted`}
                      onConfirm={() => handleDelete(coupon.id, coupon.code)}
                      trigger={
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="rounded-full px-3 text-xs font-medium cursor-pointer"
                        >
                          <Trash2 className="size-3" />
                          <span>Delete</span>
                        </Button>
                      }
                    />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
