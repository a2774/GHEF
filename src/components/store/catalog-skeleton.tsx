/**
 * What the products page shows while the list loads. It has the same shape as the finished page
 * (heading, filter column, and enough rows of cards to push the footer below the first screen), so
 * nothing jumps when the real content arrives.
 */
export function CatalogSkeleton() {
  const pulse = "animate-pulse rounded-lg bg-muted motion-reduce:animate-none";

  return (
    <div aria-busy="true" aria-label="Loading products">
      <div className={`h-10 w-3/4 max-w-md sm:h-12 ${pulse}`} />
      <div className={`mt-6 h-6 w-44 ${pulse}`} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-12">
        <div className="hidden space-y-5 lg:block">
          {[0, 1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className={`h-11 ${pulse}`} />
          ))}
        </div>

        <div>
          <div className={`h-7 w-64 max-w-full ${pulse}`} />
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item}>
                <div className={`aspect-[3/4] rounded-none ${pulse}`} />
                <div className={`mt-3 h-5 w-5/6 ${pulse}`} />
                <div className={`mt-2 h-5 w-1/3 ${pulse}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
