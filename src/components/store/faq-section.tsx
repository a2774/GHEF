import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

export function FaqSection() {
  return (
    <section>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8 lg:py-32">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <h2 className="text-title font-semibold text-balance">Good to know.</h2>
        <Accordion>
          {faqs.map(({ question, answer }) => (
            <AccordionItem key={question} value={question}>
              <AccordionTrigger className="py-5 font-heading text-xl font-semibold">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-lg leading-relaxed text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
