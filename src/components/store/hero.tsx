import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";


export function Hero() {
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden bg-ink text-primary-foreground">
      <Image
        src="/images/hero-living-room.jpg"
        alt="Sunlit living room with a patterned carpet"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pt-44 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="max-w-2xl animate-in duration-700 fade-in slide-in-from-bottom-4 motion-reduce:animate-none">
          <h1 className="text-display font-semibold">A softer way to live.</h1>
          <p className="mt-5 text-xl leading-relaxed text-white/90">
            Handcrafted comfort, in timeless design.
          </p>
          <Link
            href="/products"
            className="liquid-glass group mt-8 inline-flex h-14 items-center gap-2 rounded-full px-8 text-base transition-transform hover:scale-[1.02] motion-reduce:hover:scale-100"
          >
            Explore Collection
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
