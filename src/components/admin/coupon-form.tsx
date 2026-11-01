"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCoupon } from "@/server/actions/admin-coupons";

const fieldClass = "mt-1.5 h-11 rounded-xl bg-card px-3 text-base md:text-base";

export function CouponForm() {
  const [error, action, pending] = useActionState(createCoupon, null);

  return (
    <form action={action} className="grid gap-4 rounded-2xl bg-muted p-5 sm:grid-cols-2 lg:grid-cols-3">
      <label className="block text-base font-medium">
        Code
        <Input name="code" required placeholder="WELCOME10" className={`${fieldClass} uppercase`} />
      </label>
      <label className="block text-base font-medium">
        Type
        <select name="type" className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 text-base">
          <option value="percent">Percent off</option>
          <option value="fixed">Fixed ₹ off</option>
        </select>
      </label>
      <label className="block text-base font-medium">
        Value
        <Input name="value" type="number" min="1" step="0.01" required className={fieldClass} />
      </label>
      <label className="block text-base font-medium">
        Minimum cart ₹
        <Input name="minCart" type="number" min="0" step="0.01" defaultValue="0" className={fieldClass} />
      </label>
      <label className="block text-base font-medium">
        Max uses (optional)
        <Input name="maxUses" type="number" min="1" step="1" className={fieldClass} />
      </label>
      <label className="block text-base font-medium">
        Ends on (optional)
        <Input name="endsAt" type="date" className={fieldClass} />
      </label>
      {error && (
        <p role="alert" className="text-base text-destructive sm:col-span-2 lg:col-span-3">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="h-11 w-fit rounded-full px-8 text-base">
        Create coupon
      </Button>
    </form>
  );
}
