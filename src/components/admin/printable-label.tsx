"use client";

import { type ReactNode, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const noSubscription = () => () => {};

/**
 * A hidden copy of the shipping label, kept straight under <body> (outside the admin panel's layout).
 * Two buttons use it: "Download label (PDF)" takes a picture of it, and "Print label" prints only this
 * copy, because every other child of <body> is hidden while printing (see PrintLabelButton). It sits far
 * off screen, so nobody sees it on the page.
 */
export function PrintableLabel({ children }: { children: ReactNode }) {
  // The server renders nothing here; the browser adds the label once the page has loaded.
  const ready = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
  if (!ready) return null;

  return createPortal(
    <div id="shipping-label-print" aria-hidden="true" inert className="pointer-events-none fixed top-0 -left-[9999px]">
      <div id="shipping-label-source" className="w-fit bg-white">
        {children}
      </div>
    </div>,
    document.body,
  );
}
