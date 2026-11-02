"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border group-[.toaster]:border-slate-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:py-3.5 group-[.toaster]:px-4 text-xs font-medium",
          description: "group-[.toast]:text-slate-500 text-xs",
          actionButton:
            "group-[.toast]:bg-slate-900 group-[.toast]:text-white font-medium text-xs rounded-lg",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 font-medium text-xs rounded-lg",
          error: "group-[.toaster]:!bg-rose-50 group-[.toaster]:!text-rose-950 group-[.toaster]:!border-rose-200",
          success: "group-[.toaster]:!bg-emerald-50 group-[.toaster]:!text-emerald-950 group-[.toaster]:!border-emerald-200",
          warning: "group-[.toaster]:!bg-amber-50 group-[.toaster]:!text-amber-950 group-[.toaster]:!border-amber-200",
          info: "group-[.toaster]:!bg-sky-50 group-[.toaster]:!text-sky-950 group-[.toaster]:!border-sky-200",
        },
      }}
      {...props}
    />
  );
}

export { toast };
