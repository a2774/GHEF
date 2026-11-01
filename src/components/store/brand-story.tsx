import { RugIllustration } from "./rug-illustration";

const principles = [
  { title: "Craftsmanship", body: "Shaped by hand, row after row." },
  { title: "Materials", body: "Natural fibres, chosen for how they age." },
  { title: "Detail", body: "Every edge finished and checked by hand." },
];

export function BrandStory() {
  return (
    <section id="story" className="scroll-mt-24 bg-muted">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-32">
        <div className="overflow-hidden rounded-3xl">
          <RugIllustration
            palette="Sand"
            viewBox="110 230 380 380"
            className="block aspect-square w-full"
          />
        </div>
        <div>
          <h2 className="text-title font-semibold text-balance">Made slowly, on purpose.</h2>
          <dl className="mt-10">
            {principles.map(({ title, body }) => (
              <div key={title} className="border-t border-border py-5">
                <dt className="font-heading text-2xl font-semibold tracking-tight">{title}</dt>
                <dd className="mt-1 text-lg text-muted-foreground">{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
