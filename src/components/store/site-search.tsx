import { Search } from "lucide-react";
import Form from "next/form";

export function SiteSearch({ className }: { className?: string }) {
  return (
    <Form action="/products" role="search" className={`relative ${className ?? ""}`}>
      <Search
        aria-hidden="true"
        strokeWidth={1.5}
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
      />
      <input
        type="search"
        name="q"
        required
        maxLength={100}
        aria-label="Search products"
        placeholder="Search carpets, rugs, doormats"
        className="h-11 w-full rounded-full border border-current/25 bg-current/5 pr-4 pl-10 text-base text-inherit outline-none placeholder:text-current/60 focus-visible:ring-3 focus-visible:ring-current/40"
      />
    </Form>
  );
}
