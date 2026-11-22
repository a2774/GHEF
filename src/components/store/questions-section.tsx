import { sectionY } from "@/lib/section-spacing";

import { EnquiryBlock } from "./custom-enquiry";
import { FaqBlock } from "./faq-section";

/**
 * One section for the end of the home page: the questions people ask on the left, and the form to
 * send an enquiry on the right. On a phone they stack, questions first.
 */
export function QuestionsSection() {
  return (
    <section id="custom" className="scroll-mt-24 bg-muted">
      <div
        className={`mx-auto grid max-w-7xl items-start gap-12 px-4 ${sectionY} sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8`}
      >
        <FaqBlock />
        <EnquiryBlock />
      </div>
    </section>
  );
}
