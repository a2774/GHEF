import { cacheLife, cacheTag } from "next/cache";
import { Clock, MapPin, Phone } from "lucide-react";
import Image from "next/image";

import { getStoreSettings } from "@/server/services/settings";

export async function VisitUs() {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");

  const { store } = await getStoreSettings();
  if (!store.address) return null;

  const details = [
    { icon: MapPin, label: "Address", value: store.address },
    { icon: Clock, label: "Hours", value: store.hours },
    { icon: Phone, label: "Phone", value: store.phone, href: store.phone ? `tel:${store.phone.replace(/\s/g, "")}` : undefined },
  ].filter(({ value }) => value);

  return (
    <section id="visit" className="scroll-mt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-32">
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
          <h2 className="text-title font-semibold text-balance">Come and feel the pile.</h2>
          <p className="mt-5 max-w-md text-xl leading-relaxed text-muted-foreground">
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
