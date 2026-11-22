import { cacheLife, cacheTag } from "next/cache";
import { Clock, MapPin, Phone } from "lucide-react";
import Image from "next/image";

import { describeDbError } from "@/lib/db-error";
import { sectionTop } from "@/lib/section-spacing";
import { getStoreSettings } from "@/server/services/settings";

import { SectionHeading } from "./section-heading";

// Throws on failure so a database error is never cached as "no address".
async function loadStore() {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");
  return (await getStoreSettings()).store;
}

export async function VisitUs() {
  // If the database is slow or down, this section is left out instead of breaking the whole page.
  let store: Awaited<ReturnType<typeof loadStore>>;
  try {
    store = await loadStore();
  } catch (error) {
    console.error(`Could not load the showroom details: ${describeDbError(error)}`);
    return null;
  }
  if (!store.address) return null;

  const details = [
    { icon: MapPin, label: "Address", value: store.address },
    { icon: Clock, label: "Hours", value: store.hours },
    { icon: Phone, label: "Phone", value: store.phone, href: store.phone ? `tel:${store.phone.replace(/\s/g, "")}` : undefined },
  ].filter(({ value }) => value);

  return (
    <section id="visit" className="scroll-mt-32">
      <div className={`mx-auto max-w-7xl px-4 ${sectionTop} sm:px-6 lg:px-8`}>
        <SectionHeading>Come and feel the pile.</SectionHeading>
      </div>
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-6 pb-10 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:pb-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
          <Image
            src="/images/lifestyle-quiet-corner.jpg"
            alt="Carpets laid out in a calm, sunlit room"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="max-w-md text-xl leading-relaxed text-muted-foreground">
            See the colours in daylight and run your hand across the weave before you choose.
          </p>
          <dl className="mt-10">
            {details.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4 border-t border-border py-5">
                <Icon aria-hidden="true" className="mt-1 size-5 shrink-0" strokeWidth={1.5} />
                <div>
                  <dt className="text-base text-muted-foreground">{label}</dt>
                  <dd className="mt-0.5 text-lg whitespace-pre-line">
                    {href ? <a href={href} className="underline-offset-4 hover:underline">{value}</a> : value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          {store.mapUrl && (
            <a
              href={store.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-14 items-center rounded-full bg-primary px-8 text-base text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get directions
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
