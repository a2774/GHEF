import { ChevronDown } from "lucide-react";

import { SectionHeading } from "./section-heading";

const faqs = [
  {
    question: "What is the difference between hand-knotted and hand-tufted?",
    answer:
      "A hand-knotted carpet is built by tying each knot on a loom, which makes it dense and durable. A hand-tufted carpet is made by punching yarn through a backing with a hand tool, so it is quicker to make and usually costs less.",
  },
  {
    question: "How do I choose the right size?",
    answer:
      "In a living room, let at least the front legs of your sofa and chairs sit on the carpet. In a bedroom, let it extend beyond the sides and foot of the bed. In a dining room, leave room to pull chairs back while staying on the carpet.",
  },
  {
    question: "Which material suits which room?",
    answer:
      "Wool is soft and resilient, so it suits living rooms and bedrooms. Jute brings natural texture to dry, low-traffic spaces. Shaggy carpets feel cosy underfoot in bedrooms and quiet corners.",
  },
  {
    question: "How do I care for a handmade carpet?",
    answer:
      "Vacuum gently, blot spills quickly with a clean cloth, and rotate the carpet every few months so it wears evenly. For deep stains, use a professional carpet cleaner.",
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

/**
 * The "Good to know" heading and its questions. It has no section around it, so the home page can
 * place it beside the enquiry form in one section (see QuestionsSection).
 */
export function FaqBlock() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SectionHeading>Good to know.</SectionHeading>
      {/* Plain details/summary: it opens and closes with no script, so the home page ships no accordion library. */}
      <div className="mt-6 flex w-full flex-col">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group not-last:border-b">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg py-5 text-left font-heading text-xl font-semibold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
              {question}
              <ChevronDown
                aria-hidden="true"
                className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="pb-2.5 text-lg leading-relaxed text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
