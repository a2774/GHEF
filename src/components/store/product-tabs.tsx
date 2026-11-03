"use client";

import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";

import { roomName } from "@/lib/catalog-taxonomy";
import { policies } from "@/app/(store)/policies/content";
import { formatPaise } from "@/lib/format";
import type { ProductDetail } from "@/server/services/products";

import type { PurchaseInfo } from "./product-experience";

const tabs = [
  { id: "description", label: "Description" },
  { id: "reviews", label: "Customer Reviews" },
  { id: "shipping", label: "Shipping" },
  { id: "returns", label: "Return Policies" },
] as const;
type TabId = (typeof tabs)[number]["id"];

const defaultCare =
  "Vacuum gently without the beater bar, blot spills quickly with a clean cloth and mild detergent, and rotate every few months for even wear. For deep stains, use a professional carpet cleaner.";

function defaultShipping(purchase: PurchaseInfo) {
  const delivery =
    purchase.shippingPaise === 0
      ? "Free delivery across India."
      : `Delivery across India for ${formatPaise(purchase.shippingPaise)} per order.`;
  const days = (count: number) => `${count} ${count === 1 ? "working day" : "working days"}`;
  return [
    delivery,
    `Ready stock ships in about ${days(purchase.readyDispatchDays)}; made-to-order pieces take around ${days(purchase.madeToOrderDays)} to weave.`,
    "Tracking details reach you by email once it ships.",
    `Pay by UPI, card or net banking${purchase.codEnabled ? ", or cash on delivery" : ""}.`,
  ].join(" ");
}

// Admin text keeps its line breaks, so owners can write short paragraphs or lists.
function AdminText({ text }: { text: string }) {
  return <p className="text-[1.05rem] leading-relaxed break-words whitespace-pre-line text-[#555]">{text}</p>;
}

/** Policy text with headings. In admin text, a line starting with "## " becomes a heading. */
function PolicyText({ sections }: { sections: { heading?: string; body: string }[] }) {
  return (
    <div className="space-y-8">
      {sections.map(({ heading, body }, index) => (
        <div key={index}>
          {heading && (
            <h3 className="mb-3 text-2xl font-medium tracking-tight text-[#111] sm:text-[2rem]">{heading}</h3>
          )}
          {body && <AdminText text={body} />}
        </div>
      ))}
    </div>
  );
}

function toSections(text: string) {
  const sections: { heading?: string; body: string }[] = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("## ")) sections.push({ heading: line.slice(3).trim(), body: "" });
    else if (sections.length === 0) sections.push({ body: line });
    else sections[sections.length - 1].body += (sections[sections.length - 1].body ? "\n" : "") + line;
  }
  return sections.map((section) => ({ ...section, body: section.body.trim() }));
}

export function ProductTabs({
  product,
  purchase,
  reviews,
}: {
  product: ProductDetail;
  purchase: PurchaseInfo;
  /** The reviews list, rendered on the server. */
  reviews: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("description");

  // A link such as /products/kashi#reviews opens that tab.
  useEffect(() => {
    const open = () => {
      const id = window.location.hash.slice(1);
      if (tabs.some((tab) => tab.id === id)) setActive(id as TabId);
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  const details = [
    { label: "Ready to ship", value: product.isReadyToDispatch ? "Yes" : "No, made to order" },
    { label: "Material", value: product.material },
    { label: "Construction", value: product.category },
    { label: "Pile height (thickness)", value: product.pileHeight },
    { label: "Backing", value: product.backing },
    { label: "Best for", value: product.rooms.map(roomName).join(", ") },
    { label: "Made in", value: "India, by hand" },
  ].filter((detail): detail is { label: string; value: string } => Boolean(detail.value));

  function handleKeys(event: React.KeyboardEvent, index: number) {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = tabs[(index + step + tabs.length) % tabs.length];
    setActive(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  }

  return (
    <section aria-label="Product information" className="mt-4 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          role="tablist"
          aria-label="Product information"
          className="-mx-4 flex gap-8 overflow-x-auto px-4 pt-12 [scrollbar-width:none] sm:justify-center sm:gap-12 [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={active === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={active === tab.id ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(event) => handleKeys(event, index)}
              className="shrink-0 border-b border-transparent pb-1 text-lg font-medium whitespace-nowrap text-[#111] transition-colors hover:border-[#111] aria-selected:border-[#111] sm:text-xl"
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-[1000px] pt-11 pb-6">
          {/* Every panel stays in the page so search engines read all of it. */}
          <div id="panel-description" role="tabpanel" aria-labelledby="tab-description" hidden={active !== "description"}>
            {details.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-5 gap-y-6 sm:gap-x-[60px] sm:gap-y-10">
                {details.map(({ label, value }) => (
                  <div key={label} className="border-b border-[#e0e0e0] pb-2 sm:pb-3">
                    <dt className="mb-2 text-[0.9rem] font-extrabold text-[#111] capitalize sm:mb-4 sm:text-xl">{label}</dt>
                    <dd className="text-[0.85rem] leading-snug text-[#333] sm:text-[1.15rem]">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-10">
              <AdminText text={product.description} />
            </div>
            <p className="mt-3 text-[0.95rem] text-[#777]">
              Handmade pieces vary a little in shade and size. That is the mark of the hand, not a flaw.
            </p>
            <h3 className="mt-8 text-xl font-semibold tracking-tight text-[#111]">Care</h3>
            <div className="mt-2">
              <AdminText text={purchase.tabs.care || defaultCare} />
            </div>
            <p className="mt-8 text-[1.05rem] text-[#555]">
              Need another size or colour? We weave to your measurements and palette.{" "}
              <Link href="/services/custom-carpets" className="text-[#111] underline underline-offset-4">
                Ask for a custom carpet
              </Link>
              .
            </p>
          </div>

          <div id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews" hidden={active !== "reviews"}>
            {reviews}
          </div>

          <div id="panel-shipping" role="tabpanel" aria-labelledby="tab-shipping" hidden={active !== "shipping"}>
            <PolicyText
              sections={purchase.tabs.shipping ? toSections(purchase.tabs.shipping) : [{ body: defaultShipping(purchase) }]}
            />
            <Link href="/policies/shipping" className="mt-6 inline-block text-[1.05rem] text-[#111] underline underline-offset-4">
              Read the full shipping policy
            </Link>
          </div>

          <div id="panel-returns" role="tabpanel" aria-labelledby="tab-returns" hidden={active !== "returns"}>
            <PolicyText
              sections={purchase.tabs.returns ? toSections(purchase.tabs.returns) : policies.returns.sections}
            />
            <Link href="/policies/returns" className="mt-6 inline-block text-[1.05rem] text-[#111] underline underline-offset-4">
              Read the full returns policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
