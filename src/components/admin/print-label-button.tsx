"use client";

import { Printer } from "lucide-react";

// Applied only while the print window is open: A4 paper without browser margins, and everything under
// <body> except the hidden label copy (PrintableLabel) is left out, so exactly the label is printed.
const printCss = `
@page { size: A4; margin: 0; }
@media print {
  html[data-print-label], html[data-print-label] body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
  html[data-print-label] body > *:not(#shipping-label-print) { display: none !important; }
  html[data-print-label] #shipping-label-print { position: static !important; left: auto !important; top: auto !important; }
}
`;

/**
 * Opens the print window for the shipping label right on this page (no new tab). In the print window
 * the owner can pick a printer or "Save as PDF". The page title is the file name while printing.
 */
export function PrintLabelButton({ fileName }: { fileName: string }) {
  function print() {
    const previousTitle = document.title;
    const style = document.createElement("style");
    style.textContent = printCss;
    document.head.append(style);
    document.documentElement.dataset.printLabel = "1";
    document.title = fileName;

    const finish = () => {
      window.removeEventListener("afterprint", finish);
      delete document.documentElement.dataset.printLabel;
      style.remove();
      document.title = previousTitle;
    };
    window.addEventListener("afterprint", finish);
    window.print();
  }

  return (
    <button
      type="button"
      onClick={print}
      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-slate-900 shadow-xs transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none"
    >
      <Printer aria-hidden="true" className="size-4" />
      Print label
    </button>
  );
}
