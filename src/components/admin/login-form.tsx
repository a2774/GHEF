"use client";

import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useActionState, useId, useState } from "react";

import { login } from "@/server/actions/admin-auth";

const inputClass =
  "peer h-12 w-full rounded-xl border border-slate-200 bg-white pr-4 pl-11 text-[15px] text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-[#0B132B] focus:ring-4 focus:ring-[#bef264]/40 disabled:opacity-60";

const iconClass =
  "pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-[#0B132B]";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const emailId = useId();
  const passwordId = useId();

  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label htmlFor={emailId} className="mb-2 block text-sm font-semibold text-slate-800">
          Email
        </label>
        <div className="relative">
          <input
            id={emailId}
            type="email"
            name="email"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Your admin email"
            disabled={pending}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
          <Mail aria-hidden="true" className={iconClass} />
        </div>
      </div>

      <div>
        <label htmlFor={passwordId} className="mb-2 block text-sm font-semibold text-slate-800">
          Password
        </label>
        <div className="relative">
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            name="password"
            required
            autoComplete="current-password"
            placeholder="Your password"
            disabled={pending}
            className={`${inputClass} pr-12`}
          />
          <Lock aria-hidden="true" className={iconClass} />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-1.5 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-[#bef264] focus-visible:outline-none"
          >
            {showPassword ? <EyeOff aria-hidden="true" className="size-[18px]" /> : <Eye aria-hidden="true" className="size-[18px]" />}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-medium text-rose-700 animate-in fade-in slide-in-from-top-1"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="group flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#bef264] text-[15px] font-bold text-slate-950 shadow-[0_10px_24px_-10px_rgba(101,163,13,0.8)] transition-all hover:bg-[#a3e635] active:scale-[0.99] focus-visible:ring-4 focus-visible:ring-[#bef264]/50 focus-visible:outline-none disabled:cursor-wait disabled:opacity-80"
      >
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-[18px] animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Sign in to dashboard
            <ArrowRight aria-hidden="true" className="size-[18px] transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </form>
  );
}
