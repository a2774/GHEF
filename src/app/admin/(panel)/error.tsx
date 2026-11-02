"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin panel error:", error);
  }, [error]);

  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 max-w-2xl">
      <h2 className="font-heading text-2xl font-semibold text-destructive">
        Admin dashboard error
      </h2>
      <p className="mt-2 text-base text-muted-foreground">
        An unexpected error occurred while loading this admin view.
      </p>
      {error.message && (
        <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-card p-3 text-sm text-destructive">
          {error.message}
        </pre>
      )}
      <div className="mt-6 flex flex-wrap gap-4">
        <Button onClick={() => reset()} className="h-10 rounded-full px-6 text-sm">
          Try again
        </Button>
        <Link
          href="/admin"
          className={buttonVariants({
            variant: "outline",
            className: "h-10 rounded-full px-6 text-sm",
          })}
        >
          Dashboard home
        </Link>
      </div>
    </div>
  );
}
