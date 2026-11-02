"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { type KeyboardEvent, type PointerEvent, type RefObject, useRef, useState } from "react";

import { ProductPhoto } from "./product-photo";

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
}: {
  images: GalleryImage[];
  title: string;
  index: number;
  onChange: (next: number) => void;
  onOpen?: () => void;
  fit: "cover" | "contain";
  sizes: string;
  className: string;
}) {
  const swipe = useRef<{ x: number; moved: boolean } | null>(null);
  const justSwiped = useRef(false);
  const last = images.length - 1;

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
            <ProductPhoto
              publicId={image.publicId}
              alt={image.alt || `${title}, photo ${position + 1}`}
              sizes={sizes}
              className={`pointer-events-none ${fit === "cover" ? "object-cover" : "object-contain"}`}
            />
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
    <div ref={stripRef} className={`no-scrollbar flex gap-3 overflow-x-auto p-1 sm:gap-4 ${dark ? "justify-center" : ""}`}>
      {images.map((image, position) => (
        <button
          key={image.id}
          type="button"
          aria-label={`Show photo ${position + 1}`}
          aria-current={position === index}
          onClick={() => onChange(position)}
          onMouseEnter={() => onChange(position, true)}
          className={`relative aspect-square shrink-0 overflow-hidden rounded-2xl opacity-60 outline-offset-2 transition-opacity hover:opacity-100 aria-current:opacity-100 aria-current:outline-2 ${
            dark ? "w-16 bg-white/10 aria-current:outline-white sm:w-20" : "w-[22%] bg-muted aria-current:outline-primary"
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
  const strip = useRef<HTMLDivElement>(null);
  const viewerStrip = useRef<HTMLDivElement>(null);
  const last = images.length - 1;

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
        onOpen={() => setOpen(true)}
        fit="cover"
        sizes="(min-width: 1024px) 60vw, 100vw"
        className="aspect-square rounded-3xl bg-muted"
      />
      <div className="mt-4">
        <Thumbnails images={images} index={index} onChange={show} stripRef={strip} />
      </div>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-ink data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <DialogPrimitive.Popup
            aria-label={`${title} photos, full screen`}
            className="fixed inset-0 z-[60] flex flex-col gap-4 bg-ink p-4 text-primary-foreground outline-none sm:p-6"
          >
            <div className="flex items-center justify-between">
              <DialogPrimitive.Title className="truncate font-heading text-xl font-semibold tracking-tight">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close
                aria-label="Close"
                className="liquid-glass flex size-11 shrink-0 items-center justify-center rounded-full"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
            </div>
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
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}
