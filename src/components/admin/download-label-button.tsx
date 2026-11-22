"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

// A4 paper (210 x 297 mm) in PDF points (1 point = 1/72 inch).
const pageWidth = 595.28;
const pageHeight = 841.89;

/**
 * Turns the label on the page into a PDF file and saves it straight away: no new tab and no print
 * window. The label is drawn by the browser (so any language in the address prints correctly), taken
 * as a sharp picture and placed on A4 pages (one page, or more when the order has many products). The
 * two libraries are fetched only when the button is pressed, so they add nothing to the weight of the
 * page itself.
 */
export function DownloadLabelButton({
  sourceId,
  fileName,
  printHref,
}: {
  /** The id of the element that holds the label. */
  sourceId: string;
  /** The file name without ".pdf". */
  fileName: string;
  /** The printable label page, offered if the PDF could not be made. */
  printHref: string;
}) {
  const [state, setState] = useState<"idle" | "working" | "failed">("idle");

  async function download() {
    const label = document.getElementById(sourceId);
    if (!label) {
      setState("failed");
      return;
    }

    setState("working");
    try {
      const [{ toPng }, { PDFDocument }] = await Promise.all([import("html-to-image"), import("pdf-lib")]);
      await document.fonts?.ready;
      const picture = await toPng(label, { pixelRatio: 3, cacheBust: true, backgroundColor: "#ffffff" });

      const pdf = await PDFDocument.create();
      pdf.setTitle(fileName);
      const image = await pdf.embedPng(picture);

      // The picture is as wide as the page. A label taller than one page continues on the next one:
      // the same picture is placed on each page, moved up by one page height more every time.
      const imageHeight = (label.offsetHeight / label.offsetWidth) * pageWidth;
      const pages = Math.max(1, Math.ceil(imageHeight / pageHeight - 0.02));
      for (let index = 0; index < pages; index += 1) {
        const page = pdf.addPage([pageWidth, pageHeight]);
        page.drawImage(image, {
          x: 0,
          y: pageHeight - imageHeight + index * pageHeight,
          width: pageWidth,
          height: imageHeight,
        });
      }
      const bytes = await pdf.save();

      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.pdf`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setState("idle");
    } catch (error) {
      console.error("Could not make the shipping label PDF:", error);
      setState("failed");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <button
        type="button"
        onClick={download}
        disabled={state === "working"}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#bef264] px-5 text-sm font-bold text-slate-950 shadow-xs transition-colors hover:bg-[#a3e635] focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none disabled:cursor-wait disabled:opacity-70"
      >
        {state === "working" ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin" />
        ) : (
          <Download aria-hidden="true" className="size-4" />
        )}
        {state === "working" ? "Making PDF..." : "Download label (PDF)"}
      </button>
      {state === "failed" && (
        <p role="alert" className="max-w-xs text-xs text-rose-700 sm:text-right">
          The PDF could not be made.{" "}
          <a href={printHref} className="font-semibold underline underline-offset-2">
            Open the printable label
          </a>{" "}
          and choose Save as PDF.
        </p>
      )}
    </div>
  );
}
