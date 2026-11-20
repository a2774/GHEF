"use client";

import { useState } from "react";

/** A short description shown in two lines, with a link to open the whole text. */
export function ReadMore({ children }: { children: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4">
      <p className={`max-w-5xl text-[0.95rem] leading-relaxed text-[#444] ${open ? "" : "line-clamp-2"}`}>{children}</p>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="mt-3 text-sm font-medium text-[#111] underline-offset-4 hover:underline"
      >
        {open ? "Read less" : "Read more"}
      </button>
    </div>
  );
}
