// Shows straight away when a link is clicked, while the next page's data loads.
export default function StoreLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="mx-auto max-w-7xl animate-pulse px-4 pt-32 pb-20 sm:px-6 lg:px-8">
      <div className="h-4 w-56 rounded bg-muted" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className="aspect-[4/3] bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-10 w-1/2 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
          <div className="h-12 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
