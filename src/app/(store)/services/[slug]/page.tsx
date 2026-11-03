import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EnquiryForm } from "@/components/store/enquiry-form";
import { siteName } from "@/lib/site";

import { type ServiceSlug, serviceSlugs, services } from "../content";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  if (!service) return { title: siteName };
  return {
    title: `${service.title} | ${siteName}`,
    description: service.intro,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServicePage({ params }: Params) {
  const { slug } = await params;
  const service = services[slug as ServiceSlug];
  if (!service) notFound();

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pt-36 pb-16 sm:px-6 lg:px-8 lg:pt-44 lg:pb-24">
        <p className="text-lg text-muted-foreground">{service.title}</p>
        <h1 className="mt-2 max-w-4xl text-display font-semibold text-balance">{service.headline}</h1>
        <p className="mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground">{service.intro}</p>
        <Link
          href="#enquire"
          className="mt-8 inline-flex h-14 items-center rounded-full bg-primary px-8 text-base text-primary-foreground transition-opacity hover:opacity-90"
        >
          Get a quote
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {service.points.map(({ title, body }) => (
            <li key={title} className="rounded-3xl bg-muted p-7">
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-lg text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-20 bg-ink text-primary-foreground lg:mt-32">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <h2 className="text-title font-semibold">How it works.</h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {service.steps.map((step, index) => (
              <li key={step} className="border-t border-white/20 pt-5">
                <span className="text-base text-white/60">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-2 font-heading text-2xl font-semibold tracking-tight">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="enquire" className="scroll-mt-32 bg-muted">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-32">
          <div>
            <h2 className="text-title font-semibold text-balance">Tell us what you need.</h2>
            <p className="mt-5 max-w-md text-xl leading-relaxed text-muted-foreground">
              We reply within a working day with questions or a quote.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {serviceSlugs
                .filter((other) => other !== slug)
                .map((other) => (
                  <li key={other}>
                    <Link
                      href={`/services/${other}`}
                      className="inline-flex h-11 items-center rounded-full border border-border px-5 text-base hover:border-primary"
                    >
                      {services[other].title}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
          <EnquiryForm types={[service.enquiryType]} placeholder={service.formHint} />
        </div>
      </section>
    </main>
  );
}
