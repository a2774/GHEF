const steps = [
  { title: "Design", body: "Each pattern is drawn and colour-matched." },
  { title: "Dye", body: "Yarn is dyed in small, careful batches." },
  { title: "Weave", body: "The carpet takes shape by hand, row by row." },
  { title: "Finish", body: "It is washed, sheared and checked by hand." },
];

export function ProcessSection() {
  return (
    <section className="bg-ink text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <h2 className="text-title font-semibold">From thread to home.</h2>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {steps.map(({ title, body }, index) => (
            <li key={title} className="border-t border-white/20 pt-5">
              <span className="text-base text-white/60">0{index + 1}</span>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-lg leading-relaxed text-white/75">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
