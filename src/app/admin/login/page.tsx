import { Boxes } from "lucide-react";
import Link from "next/link";

import { LoginForm } from "@/components/admin/login-form";

export const instant = false;

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4 bg-[#f8fafc] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#bef264] text-slate-950 font-black shadow-xs">
            <Boxes className="size-5 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              Ganga Handmade
            </h1>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">
              Export Admin Portal
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-2">
          Secure, role-gated administrative sign in.
        </p>

        <LoginForm />

        <div className="mt-8 border-t border-slate-100 pt-4 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            ← Return to public storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
