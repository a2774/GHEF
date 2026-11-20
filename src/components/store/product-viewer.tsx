"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The full-screen window around the product photos. It is loaded when the gallery is first used
 * (see ProductGallery), so the dialog library is not part of the first load of a product page.
 */
export function ProductViewer({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
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
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
