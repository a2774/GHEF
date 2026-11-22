"use client";

import { useState } from "react";

const money = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const step = 100;

// Only the round thumbs of the two sliders take the mouse, so both can be dragged on one track.
const slider =
  "pointer-events-none absolute inset-0 h-8 w-full appearance-none bg-transparent focus:outline-none " +
  "[&::-webkit-slider-runnable-track]:appearance-none [&::-webkit-slider-runnable-track]:bg-transparent " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-pointer " +
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] " +
  "[&::-webkit-slider-thumb]:border-[#111] [&::-webkit-slider-thumb]:bg-white " +
  "[&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 " +
  "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] " +
  "[&::-moz-range-thumb]:border-[#111] [&::-moz-range-thumb]:bg-white";

/**
 * A price slider with two thumbs, from Rs. 0 to the dearest carpet in the shop. The two sliders
 * are named `min` and `max`; the filter form leaves out a thumb that is still at its end.
 */
export function PriceRange({ bound, min, max }: { bound: number; min?: number; max?: number }) {
  const [low, setLow] = useState(Math.min(Math.max(min ?? 0, 0), bound));
  const [high, setHigh] = useState(Math.min(max ?? bound, bound));

  const lowPercent = (low / bound) * 100;
  const highPercent = (high / bound) * 100;

  return (
    <div>
      <div className="relative h-8">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded bg-[#d9d9d9]" />
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded bg-[#111]"
          style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
        />
        <input
          type="range"
          name="min"
          aria-label="Lowest price"
          min={0}
          max={bound}
          step={step}
          value={low}
          data-default="0"
          onChange={(event) => setLow(Math.min(Number(event.target.value), high - step))}
          className={`${slider} z-20`}
        />
        <input
          type="range"
          name="max"
          aria-label="Highest price"
          min={0}
          max={bound}
          step={step}
          value={high}
          data-default={bound}
          onChange={(event) => setHigh(Math.max(Number(event.target.value), low + step))}
          className={`${slider} z-30`}
        />
      </div>
      <p className="mt-2 text-base text-[#333]">
        Price: <strong className="font-semibold">Rs. {money.format(low)}</strong> -{" "}
        <strong className="font-semibold">Rs. {money.format(high)}</strong>
      </p>
    </div>
  );
}
