"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        We ran into an unexpected problem while loading this page. Please try again or head back to the store.
      </p>
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Button onClick={() => reset()} className="h-12 rounded-full px-8 text-base">
          Try again
        </Button>
        <Link
          href="/"
          className={buttonVariants({
            variant: "outline",
            className: "h-12 rounded-full px-8 text-base",
          })}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
