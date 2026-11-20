/**
 * Shown while a product page loads. The page used to show an empty white block here, which
 * looked like the product was missing. This keeps the same layout, so nothing jumps when the
 * real product arrives.
 */
export function ProductSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto max-w-7xl animate-pulse px-4 pt-32 pb-20 motion-reduce:animate-none sm:px-6 lg:px-8"
    >
      <span className="sr-only">Loading product</span>
      <div className="h-4 w-56 rounded bg-muted" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/3] bg-muted" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="aspect-[4/5] bg-muted" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-9 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-10 w-1/2 rounded bg-muted" />
          <div className="h-9 w-2/3 rounded bg-muted" />
          <div className="h-9 w-1/2 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
