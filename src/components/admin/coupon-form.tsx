"use client";

import { useActionState } from "react";
import { Plus, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCoupon } from "@/server/actions/admin-coupons";

const inputClass =
  "mt-1.5 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#bef264] focus:outline-none focus:ring-1 focus:ring-[#bef264]";
const selectClass =
  "mt-1.5 h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 shadow-2xs focus:border-[#bef264] focus:outline-none focus:ring-1 focus:ring-[#bef264]";

export function CouponForm() {
  const [error, action, pending] = useActionState(createCoupon, null);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Tag className="size-4 text-slate-700" />
        <h2 className="text-sm font-bold text-slate-900">
          Create Discount Coupon
        </h2>
      </div>

      <form action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="block text-xs font-semibold text-slate-700">
          Voucher Code
          <Input
            name="code"
            required
            placeholder="WELCOME10"
            className={`${inputClass} uppercase font-mono font-bold`}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Discount Type
          <select name="type" className={selectClass}>
            <option value="percent">Percentage Off (%)</option>
            <option value="fixed">Fixed Rupee Off (₹)</option>
          </select>
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Discount Amount / %
          <Input
            name="value"
            type="number"
            min="1"
            step="0.01"
            required
            placeholder="10"
            className={`${inputClass} font-mono font-bold`}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Minimum Cart Value (₹)
          <Input
            name="minCart"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            className={`${inputClass} font-mono`}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Max Redemptions (Optional)
          <Input
            name="maxUses"
            type="number"
            min="1"
            step="1"
            placeholder="Unlimited"
            className={`${inputClass} font-mono`}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Expiry Date (Optional)
          <Input
            name="endsAt"
            type="date"
            className={inputClass}
          />
        </label>

        {error && (
          <p
            role="alert"
            className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium sm:col-span-2 lg:col-span-3"
          >
            {error}
          </p>
        )}

        <div className="sm:col-span-2 lg:col-span-3 pt-2">
          <Button
            type="submit"
            disabled={pending}
            className="h-9 rounded-full bg-[#bef264] px-6 text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] transition-all cursor-pointer"
          >
            <Plus className="size-3.5 mr-1 text-slate-950" />
            <span>{pending ? "Creating Coupon..." : "Create Coupon"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
