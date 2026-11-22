import { ArrowRight } from "lucide-react";
import Link from "next/link";

// The hero photo is served as ready-made files from public/images/hero (AVIF with a WebP fallback, four
// widths), not through the image optimizer. The optimizer has to make each size on the first visit, and
// until then the top of the page used to stay black. A static file is there at once and a CDN keeps it.
const widths = [750, 1080, 1440, 1920] as const;
const srcSet = (extension: "avif" | "webp") => widths.map((width) => `/images/hero/hero-${width}.${extension} ${width}w`).join(", ");

// A 32 px wide, blurred copy of the same photo (about 0.5 KB). It is the background of the <img>, so the
// very first frame shows the picture's colours and the photo sharpens when the real file arrives.
const blurredPhoto =
  "data:image/jpeg;base64,/9j/2wBDAA4KCw0LCQ4NDA0QDw4RFiQXFhQUFiwgIRokNC43NjMuMjI6QVNGOj1OPjIySGJJTlZYXV5dOEVmbWVabFNbXVn/2wBDAQ8QEBYTFioXFypZOzI7WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVn/wAARCAASACADASIAAhEBAxEB/8QAGAAAAwEBAAAAAAAAAAAAAAAAAAMFBAb/xAAjEAACAgEEAAcAAAAAAAAAAAABAgADEQQFEiETIiMxQVGR/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAMC/8QAGREBAQADAQAAAAAAAAAAAAAAAAECETFB/9oADAMBAAIRAxEAPwDt7ccSJltsHh+mQT8zm9VvNouYFiEjdu1FlykAHDHMlapMVVHYkh8SdbqnXVccApE6y22m/wAlbHMXRWbbuZbDfRjZcb1jvUHjkAy9tSgKOh7QhDc4ouqkdqPyRLABe2BjuEIPH//Z";

export function Hero() {
  return (
    // The background colour is the photo's average colour, so nothing near-black shows while it loads.
    <section className="relative flex min-h-svh items-end overflow-hidden bg-[#b6a898] text-primary-foreground">
      <picture>
        <source type="image/avif" srcSet={srcSet("avif")} sizes="100vw" />
        {/* A plain <img> on purpose: the files are already resized and converted. */}
        <img
          src="/images/hero/hero-1080.webp"
          srcSet={srcSet("webp")}
          sizes="100vw"
          alt="Sunlit living room with a patterned carpet"
          width={1920}
          height={1080}
          decoding="async"
          style={{ backgroundImage: `url(${blurredPhoto})`, backgroundSize: "cover" }}
          className="absolute inset-0 size-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-44 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="max-w-2xl">
          {/* The headline is the biggest text on the page, so it is shown at once, with no fade-in. */}
          <h1 className="text-display font-semibold">A softer way to live.</h1>
          <div className="mt-5 animate-in duration-700 fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
            <p className="text-xl leading-relaxed text-white/90">Handcrafted comfort, in timeless design.</p>
            <Link
              href="/products"
              prefetch
              className="liquid-glass group mt-8 inline-flex h-14 items-center gap-2 rounded-full px-8 text-base transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
            >
              Explore Collection
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
