"use client";

import { useState } from "react";

import { ReviewForm } from "./review-form";

export function WriteReview({ productId }: { productId: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="write-review-form"
        onClick={() => setOpen(!open)}
        className="h-9 rounded-md bg-[#4a4a4a] px-4 text-[0.95rem] font-medium tracking-wide text-white uppercase transition-colors hover:bg-[#333] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        {open ? "Cancel review" : "Write a review"}
      </button>
      {open && (
        <div id="write-review-form" className="mt-4 w-full max-w-lg rounded-xl border border-border bg-card p-5 text-left">
          <ReviewForm productId={productId} />
        </div>
      )}
    </>
  );
}
