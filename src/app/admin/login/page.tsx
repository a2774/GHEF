import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";

export const instant = false;

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/brand-symbol.svg" alt="" width={56} height={56} className="size-14" priority />
          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">Ganga Handmade Export</p>
          <p className="font-mono text-[11px] tracking-[0.18em] text-slate-500 uppercase">Admin portal</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">Sign in</h1>
          <p className="mt-1.5 text-sm text-slate-500">Use your admin email and password.</p>

          <LoginForm />
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to the store
          </Link>
        </div>
      </div>
    </main>
  );
}
