import { cacheLife, cacheTag } from "next/cache";

import { offerHeadlines } from "@/server/services/pricing";
import { getStoreSettings } from "@/server/services/settings";

export async function OfferTicker() {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");

  const { announcement, offers } = await getStoreSettings();
  const items = [
    ...(announcement ? [announcement] : []),
    ...offerHeadlines(offers).map(({ title }) => title),
  ];
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
