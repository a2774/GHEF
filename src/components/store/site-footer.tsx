import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { collectionLinks, roomLinks, serviceLinks } from "@/lib/navigation";
import { supportEmail } from "@/lib/site";
import { getStoreSettings, type StoreInfo } from "@/server/services/settings";

import { BrandLogo } from "./brand-logo";
import { NewsletterForm } from "./newsletter-form";

const footerLinks = [
  { title: "Shop", links: collectionLinks.slice(0, 4) },
  { title: "Rooms", links: roomLinks.slice(0, 4) },
  { title: "Services", links: serviceLinks },
  {
    title: "Help",
    links: [
      { label: "Track your order", href: "/track" },
      { label: "Contact us", href: "/contact" },
      { label: "Our story", href: "/about" },
      { label: "Our store", href: "/our-store" },
      { label: "Shipping", href: "/policies/shipping" },
      { label: "Returns", href: "/policies/returns" },
      { label: "Privacy", href: "/policies/privacy" },
      { label: "Terms", href: "/policies/terms" },
    ],
  },
];

async function loadStore(): Promise<StoreInfo> {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");
  return (await getStoreSettings()).store;
}

export async function SiteFooter() {
  const store: StoreInfo | null = await loadStore().catch(() => null);
  const socials = [
    { label: "Instagram", href: store?.instagram },
    { label: "YouTube", href: store?.youtube },
  ].filter((social): social is { label: string; href: string } => Boolean(social.href));

  return (
    <footer className="bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="max-w-md">
            <BrandLogo className="size-24" />
            <h2 className="mt-6 text-3xl font-semibold tracking-tight">Stay in touch.</h2>
            <div className="mt-5">
              <NewsletterForm />
            </div>
            <address className="mt-8 space-y-1 text-base text-white/70 not-italic">
              {store?.address && <p className="whitespace-pre-line">{store.address}</p>}
              {store?.phone && (
                <p>
                  <a href={`tel:${store.phone.replace(/\s/g, "")}`} className="hover:text-white">
                    {store.phone}
                  </a>
                </p>
              )}
              <p>
                <a href={`mailto:${supportEmail}`} className="hover:text-white">
                  {supportEmail}
                </a>
              </p>
            </address>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerLinks.map(({ title, links }) => (
              <div key={title}>
                <h3 className="text-lg font-semibold">{title}</h3>
                <ul className="mt-3">
                  {links.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="block py-1.5 text-base text-white/70 transition-colors hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-base text-white/60">
          <p>© 2026 Ganga Handmade Export</p>
          {socials.length > 0 && (
            <ul className="flex gap-6">
              {socials.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
