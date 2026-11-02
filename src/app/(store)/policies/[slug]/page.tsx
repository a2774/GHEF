import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { policies, type PolicySlug, policySlugs } from "../content";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return policySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const policy = policies[slug as PolicySlug];
  return {
    title: policy ? `${policy.title} | Ganga Handmade Export` : "Ganga Handmade Export",
    alternates: { canonical: `/policies/${slug}` },
  };
}

export default async function PolicyPage({ params }: Params) {
  const { slug } = await params;
  const policy = policies[slug as PolicySlug];
  if (!policy) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 pt-28 pb-20 sm:px-6 lg:pt-32">
      <h1 className="text-title font-semibold">{policy.title}.</h1>
      {policy.sections.map(({ heading, body }) => (
        <section key={heading} className="mt-8">
          <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
          <p className="mt-2 text-lg leading-relaxed text-muted-foreground">{body}</p>
        </section>
      ))}
    </main>
  );
}
