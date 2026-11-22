"use client";

import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import dynamic from "next/dynamic";
import { type KeyboardEvent, type PointerEvent, type RefObject, useEffect, useRef, useState } from "react";

import { ProductPhoto } from "./product-photo";

// The full-screen window needs a dialog library, so it is fetched while the browser is idle after
// the page opens (or at the first click on a photo) instead of being part of the first load.
const ProductViewer = dynamic(() => import("./product-viewer").then((module) => module.ProductViewer), {
  ssr: false,
});
const loadViewer = () => import("./product-viewer");

type GalleryImage = { id: number; publicId: string; alt: string };

const arrowClass =
  "liquid-glass absolute top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-primary-foreground transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-0";

/** Scrolls only the thumbnail strip sideways, never the page. */
function centreThumb(strip: RefObject<HTMLDivElement | null>, position: number) {
  const container = strip.current;
  const thumb = container?.children[position] as HTMLElement | undefined;
  if (!container || !thumb) return;
  container.scrollTo({
    left: thumb.offsetLeft - (container.clientWidth - thumb.clientWidth) / 2,
    behavior: "smooth",
  });
}

function Slides({
  images,
  title,
  index,
  onChange,
  onOpen,
  fit,
  sizes,
  className,
  priority = false,
}: {
  images: GalleryImage[];
  title: string;
  index: number;
  onChange: (next: number) => void;
  onOpen?: () => void;
  fit: "cover" | "contain";
  sizes: string;
  className: string;
  /** The first photo is what the page opens on, so it is fetched first and the rest wait. */
  priority?: boolean;
}) {
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  const justSwiped = useRef(false);
  const last = images.length - 1;

  // On the page itself only the photo in view is loaded first. The next one is fetched a moment
  // later, so the first photo gets the whole connection and the page does not wait on four others.
  // The full-screen view is only opened on purpose, so it loads all of them at once.
  const [nextReady, setNextReady] = useState(0);
  useEffect(() => {
    if (!priority) return;
    const timer = window.setTimeout(() => setNextReady((current) => Math.max(current, index + 1)), index === 0 ? 2500 : 300);
    return () => window.clearTimeout(timer);
  }, [index, priority]);
  const loadedUpTo = priority ? Math.max(nextReady, index) : last;

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowLeft") onChange(index - 1);
    if (event.key === "ArrowRight") onChange(index + 1);
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType !== "mouse") swipe.current = { x: event.clientX, moved: false };
  }

  function onPointerUp(event: PointerEvent) {
    if (!swipe.current) return;
    const distance = event.clientX - swipe.current.x;
    swipe.current = null;
    if (Math.abs(distance) > 40) {
      justSwiped.current = true;
      onChange(index + (distance < 0 ? 1 : -1));
    }
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} photos`}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipe.current = null)}
      className={`relative touch-pan-y overflow-hidden outline-offset-4 select-none ${className}`}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((image, position) => (
          <div
            key={image.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${position + 1} of ${images.length}`}
            aria-hidden={position !== index}
            className="relative h-full w-full shrink-0"
          >
            {position <= loadedUpTo && (
              <ProductPhoto
                publicId={image.publicId}
                alt={image.alt || `${title}, photo ${position + 1}`}
                sizes={sizes}
                priority={priority && position === 0}
                className={`pointer-events-none ${fit === "cover" ? "object-cover" : "object-contain"}`}
              />
            )}
          </div>
        ))}
      </div>

      {onOpen && (
        <button
          type="button"
          aria-label="Open photo full screen"
          onClick={() => {
            if (justSwiped.current) {
              justSwiped.current = false;
              return;
            }
            onOpen();
          }}
          className="absolute inset-0 z-10 cursor-zoom-in"
        >
          <span className="liquid-glass absolute top-3 right-3 flex size-10 items-center justify-center rounded-full text-primary-foreground">
            <Expand className="size-4" aria-hidden="true" />
          </span>
        </button>
      )}

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            disabled={index === 0}
            onClick={() => onChange(index - 1)}
            className={`${arrowClass} left-3`}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            disabled={index === last}
            onClick={() => onChange(index + 1)}
            className={`${arrowClass} right-3`}
          >
            <ChevronRight className="size-5" />
          </button>
          <span
            aria-live="polite"
            className="liquid-glass absolute right-3 bottom-3 z-20 rounded-full px-3 py-1 text-sm text-primary-foreground"
          >
            {index + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}

function Thumbnails({
  images,
  index,
  onChange,
  stripRef,
  dark = false,
}: {
  images: GalleryImage[];
  index: number;
  onChange: (next: number, fromHover?: boolean) => void;
  stripRef: RefObject<HTMLDivElement | null>;
  dark?: boolean;
}) {
  if (images.length < 2) return null;
  return (
    <div ref={stripRef} className={`no-scrollbar flex gap-3 overflow-x-auto p-px ${dark ? "justify-center sm:gap-4" : ""}`}>
      {images.map((image, position) => (
        <button
          key={image.id}
          type="button"
          aria-label={`Show photo ${position + 1}`}
          aria-current={position === index}
          onClick={() => onChange(position)}
          onMouseEnter={() => onChange(position, true)}
          className={`relative shrink-0 overflow-hidden opacity-70 transition-opacity hover:opacity-100 aria-current:opacity-100 ${
            dark
              ? "aspect-square w-16 rounded-xl bg-white/10 outline-offset-2 aria-current:outline-2 aria-current:outline-white sm:w-20"
              : "aspect-[4/5] w-[calc((100%-2.25rem)/4)] bg-muted outline-offset-0 aria-current:outline-1 aria-current:outline-[#111]"
          }`}
        >
          <ProductPhoto publicId={image.publicId} alt="" sizes="20vw" className="object-cover" />
        </button>
      ))}
    </div>
  );
}

/**
 * Product photos, Amazon style. Arrows, swipe or thumbnails change the large
 * photo; clicking the large photo opens it full screen with the same controls.
 */
export function ProductGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [viewerMounted, setViewerMounted] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const viewerStrip = useRef<HTMLDivElement>(null);
  const last = images.length - 1;

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 3000));
    idle(() => void loadViewer());
  }, []);

  function show(next: number, fromHover = false) {
    const clamped = Math.max(0, Math.min(last, next));
    setIndex(clamped);
    if (!fromHover) {
      centreThumb(strip, clamped);
      centreThumb(viewerStrip, clamped);
    }
  }

  return (
    <div>
      <Slides
        images={images}
        title={title}
        index={index}
        onChange={show}
        onOpen={() => {
          setViewerMounted(true);
          setOpen(true);
        }}
        fit="cover"
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="aspect-[4/3] bg-muted"
        priority
      />
      <div className="mt-3">
        <Thumbnails images={images} index={index} onChange={show} stripRef={strip} />
      </div>

      {viewerMounted && (
        <ProductViewer open={open} onOpenChange={setOpen} title={title}>
          <Slides
            images={images}
            title={title}
            index={index}
            onChange={show}
            fit="contain"
            sizes="100vw"
            className="min-h-0 flex-1 rounded-2xl"
          />
          <Thumbnails images={images} index={index} onChange={show} stripRef={viewerStrip} dark />
        </ProductViewer>
      )}
    </div>
  );
}
