import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

import { EnquiryForm } from "@/components/store/enquiry-form";
import { supportEmail } from "@/lib/site";
import { getStoreSettings } from "@/server/services/settings";

export const metadata: Metadata = {
  title: "Contact us | Ganga Handmade Export",
  description: "Call, WhatsApp, email or visit Ganga Handmade Export.",
  alternates: { canonical: "/contact" },
};

async function loadStore() {
  "use cache";
  cacheTag("storefront");
  cacheLife("hours");
  return (await getStoreSettings()).store;
}

async function ContactDetails() {
  const store = await loadStore();
  const whatsappNumber = store.whatsapp.replace(/\D/g, "");
  const ways = [
    store.phone && { icon: Phone, label: "Call", value: store.phone, href: `tel:${store.phone.replace(/\s/g, "")}` },
    whatsappNumber && { icon: MessageCircle, label: "WhatsApp", value: store.whatsapp, href: `https://wa.me/${whatsappNumber}` },
    { icon: Mail, label: "Email", value: supportEmail, href: `mailto:${supportEmail}` },
    store.address && { icon: MapPin, label: "Visit", value: store.address, href: store.mapUrl || undefined },
    store.hours && { icon: Clock, label: "Hours", value: store.hours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <dl>
      {ways.map(({ icon: Icon, label, value, href }) => (
        <div key={label} className="flex gap-4 border-t border-border py-5">
          <Icon aria-hidden="true" className="mt-1 size-5 shrink-0" strokeWidth={1.5} />
          <div>
            <dt className="text-base text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-lg whitespace-pre-line">
              {href ? (
                <a
                  href={href}
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="underline-offset-4 hover:underline"
                >
                  {value}
                </a>
              ) : (
                value
              )}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pt-36 pb-20 sm:px-6 lg:px-8 lg:pt-40">
      <h1 className="text-title font-semibold">Contact us.</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Questions about a size, an order or a custom piece? We usually reply within a working day.{" "}
        <Link href="/track" className="underline underline-offset-4">
          Track an order
        </Link>
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-muted motion-reduce:animate-none" />}>
          <ContactDetails />
        </Suspense>
        <div className="rounded-3xl bg-muted p-1 lg:self-start">
          <EnquiryForm
            types={["custom", "bulk", "cleaning", "wall_to_wall"]}
            placeholder="How can we help?"
          />
        </div>
      </div>
    </main>
  );
}
