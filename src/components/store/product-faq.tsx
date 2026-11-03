import { Plus } from "lucide-react";

import { formatPaise } from "@/lib/format";

import type { PurchaseInfo } from "./product-experience";

function days(count: number) {
  return `${count} ${count === 1 ? "working day" : "working days"}`;
}

/** Common buying questions, answered from the store's own settings. */
export function ProductFaq({ purchase, brandName }: { purchase: PurchaseInfo; brandName: string }) {
  const faqs = [
    {
      question: "How long does it take to receive a carpet after placing an order?",
      answer: `Ready stock ships in about ${days(purchase.readyDispatchDays)}, and made-to-order carpets take around ${days(purchase.madeToOrderDays)} to weave. Delivery then takes about ${days(purchase.transitDays)}. Remote PIN codes and sale periods can take longer.`,
    },
    {
      question: "How will I know when my order is shipped?",
      answer: "Once your order ships, the courier name and tracking number appear in your account under Orders, and we email you the details.",
    },
    {
      question: "Can I customize the size, color, or design of a carpet?",
      answer: "Yes. We weave carpets to your measurements, colours and design. Send us a custom enquiry with your room size and what you have in mind.",
    },
    {
      question: "Are your carpets handmade?",
      answer: `Yes. Every carpet is made by hand by skilled artisans in Bhadohi, where ${brandName} has been making carpets for more than 48 years.`,
    },
    {
      question: "What materials are used in your carpets?",
      answer: "We use graded wool for most carpets, with strong cotton for the foundation. Some designs use jute, viscose or silk. Each product page lists its material.",
    },
    {
      question: "Can I change my order after placing it?",
      answer: "You can cancel from your account until your order has shipped. For other changes, contact us as soon as possible and we will help if the carpet has not been dispatched.",
    },
    {
      question: "How do I clean or maintain the carpet?",
      answer: "Vacuum gently without the beater bar, blot spills quickly with a clean cloth, and rotate the carpet every few months so it wears evenly. For deep stains, use a professional carpet cleaner.",
    },
    {
      question: "Do you ship across India?",
      answer:
        purchase.shippingPaise === 0
          ? "Yes, we deliver across India, and delivery is free."
          : `Yes, we deliver across India for ${formatPaise(purchase.shippingPaise)} per order.`,
    },
    {
      question: "Is Cash on Delivery (COD) available?",
      answer: purchase.codEnabled
        ? "Yes, cash on delivery is available at checkout. You can also pay by UPI, card or net banking."
        : "Not at the moment. You can pay securely by UPI, card or net banking.",
    },
    {
      question: "Do you offer any discounts or special offers?",
      answer:
        purchase.offers.length > 0
          ? `Yes. Current offers: ${purchase.offers.map(({ title }) => title).join("; ")}. Offers are applied in your cart.`
          : "We run offers from time to time. Join our newsletter to hear about them first.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-[800px] px-4 py-16 sm:px-6 lg:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }}
      />
      <h2 id="faq-heading" className="text-center text-[1.75rem] font-medium text-[#555]">
        FAQs
      </h2>
      <div className="mt-8 divide-y divide-[#eee] border-y border-[#eee]">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[0.95rem] text-[#555] marker:hidden [&::-webkit-details-marker]:hidden">
              {question}
              <Plus
                aria-hidden="true"
                className="size-4 shrink-0 text-[#555] transition-transform group-open:rotate-45"
              />
            </summary>
            <p className="pb-5 text-[0.95rem] leading-relaxed text-[#777]">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
