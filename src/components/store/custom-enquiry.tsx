import { EnquiryForm } from "./enquiry-form";

export function CustomEnquiry() {
  return (
    <section id="custom" className="scroll-mt-24 bg-muted">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-32">
        <div>
          <h2 className="text-title font-semibold text-balance">Made for your space.</h2>
          <p className="mt-5 max-w-md text-xl leading-relaxed text-muted-foreground">
            Custom sizes for your home, and bulk or export orders for your business.
          </p>
        </div>
        <EnquiryForm />
      </div>
    </section>
  );
}
