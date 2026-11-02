"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/server/actions/admin-auth";

const fieldClass = "h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 shadow-2xs focus:border-[#bef264] focus:ring-2 focus:ring-[#bef264]/20";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="mt-6 space-y-3.5">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Admin Email
        </label>
        <Input
          type="email"
          name="email"
          required
          autoComplete="username"
          aria-label="Email"
          placeholder="admin@ghef.export"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Password
        </label>
        <Input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          aria-label="Password"
          placeholder="••••••••••••"
          className={fieldClass}
        />
      </div>

      {error && (
        <div role="alert" className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-medium text-rose-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-full bg-[#bef264] text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] cursor-pointer"
      >
        {pending ? "Authenticating..." : "Sign in to Dashboard"}
      </Button>
    </form>
  );
}
