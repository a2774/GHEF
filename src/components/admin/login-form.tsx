"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/server/actions/admin-auth";

const fieldClass =
  "h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs text-slate-900 shadow-2xs focus:border-[#bef264] focus:ring-2 focus:ring-[#bef264]/20 transition-all";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            autoComplete="current-password"
            aria-label="Password"
            placeholder="••••••••••••"
            className={`${fieldClass} pr-10 font-mono`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="size-4 text-slate-700" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs font-medium text-rose-700 animate-in fade-in"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-full rounded-full bg-[#bef264] text-xs font-bold text-slate-950 shadow-xs hover:bg-[#a3e635] transition-all cursor-pointer"
      >
        {pending ? "Authenticating..." : "Sign in to Dashboard"}
      </Button>
    </form>
  );
}
