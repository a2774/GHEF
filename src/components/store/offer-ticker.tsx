import { cacheLife, cacheTag } from "next/cache";

import { describeDbError } from "@/lib/db-error";
import { offerHeadlines } from "@/server/services/pricing";
import { getStoreSettings } from "@/server/services/settings";

// Throws on failure so a database error is never cached as "no offers".
async function loadItems() {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");

  const { announcement, offers } = await getStoreSettings();
  return [
    ...(announcement ? [announcement] : []),
    ...offerHeadlines(offers).map(({ title }) => title),
  ];
}

export async function OfferTicker() {
  // If the database is slow or down, the strip is left out instead of breaking the whole page.
  let items: string[] = [];
  try {
    items = await loadItems();
  } catch (error) {
    console.error(`Could not load the offer ticker: ${describeDbError(error)}`);
    return null;
  }
  if (items.length === 0) return null;

  // Repeat the list so one copy is always on screen while the other slides in.
  const run = Array.from({ length: Math.max(2, Math.ceil(8 / items.length)) }, () => items).flat();

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-9 overflow-hidden bg-ink text-sm text-primary-foreground">
      <p className="sr-only">Offers: {items.join(". ")}</p>
      <div aria-hidden="true" className="ticker-track flex h-full w-max items-center">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center">
            {run.map((item, index) => (
              <li key={`${copy}-${index}`} className="flex items-center gap-6 px-6 whitespace-nowrap">
                <span className="size-1 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
