"use client";

import { useState } from "react";

export function LimitedTextArea({
  label,
  name,
  defaultValue,
  placeholder,
  maxLength,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  maxLength: number;
}) {
  const [length, setLength] = useState(defaultValue.length);
  const full = length >= maxLength;

  return (
    <label className="block text-xs font-semibold text-slate-700">
      {label}
      <textarea
        name={name}
        rows={3}
        maxLength={maxLength}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(event) => setLength(event.target.value.length)}
        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed font-normal shadow-2xs focus:border-[#bef264] focus:outline-none"
      />
      <span
        aria-live="polite"
        className={`mt-1 block text-right text-[0.7rem] font-medium tabular-nums ${full ? "text-red-600" : "text-slate-400"}`}
      >
        {length}/{maxLength}
        {full && " · limit reached"}
      </span>
    </label>
  );
}
