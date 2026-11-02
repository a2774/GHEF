import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
        404 error
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        Sorry, we couldn&apos;t find the page or product you&apos;re looking for.
      </p>
      <div className="mt-8">
        <Link
          href="/"
          className={buttonVariants({ className: "h-12 rounded-full px-8 text-base" })}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
