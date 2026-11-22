import { EnquiryForm } from "./enquiry-form";
import { SectionHeading } from "./section-heading";

/**
 * The "Made for your space" heading, its line of text and the enquiry form. It has no section
 * around it, so the home page can place it beside the questions in one section (see QuestionsSection).
 */
export function EnquiryBlock() {
  return (
    <div>
      <SectionHeading>Made for your space.</SectionHeading>
      <p className="mx-auto mt-3 max-w-md text-center text-xl leading-relaxed text-muted-foreground">
        Custom sizes for your home, and bulk or export orders for your business.
      </p>
      <div className="mt-6">
        <EnquiryForm />
      </div>
    </div>
  );
}
