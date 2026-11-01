import Image from "next/image";

const spaces = [
  {
    photo: "/images/lifestyle-living-room.jpg",
    alt: "Bright modern living room with two sofas",
    label: "Living room",
    className: "lg:col-span-2",
  },
  {
    photo: "/images/lifestyle-quiet-corner.jpg",
    alt: "Quiet corner with a sofa and round coffee table",
    label: "Quiet corners",
    className: "",
  },
];

export function Lifestyle() {
  return (
    <section id="spaces" className="scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <h2 className="text-title font-semibold">At home in every room.</h2>
        <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:gap-6">
          {spaces.map(({ photo, alt, label, className }) => (
            <figure
              key={photo}
              className={`group relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted lg:aspect-auto lg:h-[560px] ${className}`}
            >
              <Image
                src={photo}
                alt={alt}
                fill
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <figcaption className="liquid-glass absolute bottom-5 left-5 rounded-full px-5 py-2.5 text-base text-primary-foreground">
                {label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
