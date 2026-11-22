"use client";

import { Download } from "lucide-react";
import { useEffect } from "react";

/**
 * Opens the browser's print window, where "Save as PDF" gives the label as a file. The page title
 * becomes the file name, so it is set to `fileName` while printing. With `autoPrint` the window
 * opens by itself when the page loads (the "Download shipping label" link on the order page).
 */
export function PrintButton({ fileName, autoPrint = false }: { fileName: string; autoPrint?: boolean }) {
  function print() {
    const previous = document.title;
    document.title = fileName;
    window.print();
    document.title = previous;
  }

  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(print, 400);
    return () => window.clearTimeout(timer);
    // `print` only reads `fileName`, which does not change while the page is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrint]);

  return (
    <button
      type="button"
      onClick={print}
      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#bef264] px-5 text-sm font-bold text-slate-950 shadow-xs transition-colors hover:bg-[#a3e635] focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
    >
      <Download aria-hidden="true" className="size-4" />
      Download / Print label
    </button>
  );
}
