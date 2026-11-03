"use client";

import { Check, Copy, Tag } from "lucide-react";
import { useState } from "react";

export type OfferCard = {
  title: string;
  detail: string;
  /** Feeds the maroon badge, e.g. 10 → "10% OFF". */
  percent?: number;
  /** Badge text when it is not a percent, e.g. "₹500 OFF". Wins over `percent`. */
  badge?: string;
  /** Coupon code for a code-based offer. Replaces the detail line with "Use code CODE". */
  code?: string;
};

// Amounts ("₹70,000+"), discounts ("10% off") and item counts ("Buy 3") show in green.
const highlightPattern = /(₹[\d,]+\+?|\d+% off|(?<=Buy )\d+)/g;

function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(highlightPattern).map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-[#1f8a4c]">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}

function CouponCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked; the code stays visible to type by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? `Copied ${code}` : `Copy code ${code}`}
      className="inline-flex items-center gap-1.5 rounded-[4px] border border-dashed border-[#b8a06a] bg-[#fffaf0] px-1.5 py-0.5 text-xs font-bold tracking-wider text-[#2b2622] transition-colors hover:bg-[#fdf1d6]"
    >
      {code}
      {copied ? <Check className="size-3 text-[#1f8a4c]" /> : <Copy className="size-3 text-[#8a7a5c]" />}
    </button>
  );
}

export function AvailableOffers({ offers }: { offers: OfferCard[] }) {
  if (offers.length === 0) return null;

  return (
    <section
      aria-labelledby="offers-heading"
      className="mt-7 min-w-0 rounded-xl border border-[#f0e2b6] bg-[#fef9ec] px-4 pt-3.5 pb-4 [contain:inline-size]"
    >
      <h2
        id="offers-heading"
        className="flex items-center gap-2 border-b border-dashed border-[#ecd9a4] pb-2.5 text-xs font-bold tracking-[0.14em] text-[#6b1a1a] uppercase"
      >
        <Tag className="size-4" strokeWidth={2} />
        Available offers
      </h2>

      <ul className="-mr-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto pr-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {offers.map((offer) => (
          <li
            key={offer.title}
            className="flex min-w-[17rem] shrink-0 snap-start items-center justify-between gap-6 rounded-lg border border-[#ece4d4] bg-white px-3.5 py-3"
          >
            <div className="min-w-0">
              <p className="text-[0.95rem] leading-snug whitespace-nowrap text-[#2b2622]">
                <Highlighted text={offer.title} />
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.8rem] whitespace-nowrap text-[#7a7064]">
                {offer.code ? (
                  <>
                    Use code <CouponCode code={offer.code} />
                  </>
                ) : (
                  offer.detail
                )}
              </p>
            </div>
            <span className="shrink-0 rounded-[4px] bg-[#6b1a1a] px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-white">
              {offer.badge ?? `${offer.percent ?? 0}% OFF`}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
