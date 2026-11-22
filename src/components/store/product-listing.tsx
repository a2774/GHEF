"use client";

import { type ReactNode, useState } from "react";

const columnClass = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" } as const;
type Columns = keyof typeof columnClass;

/** A small square of dots: 2 by 2, 3 by 3 or 4 by 4, like the buttons on a shop page. */
function DensityIcon({ columns }: { columns: Columns }) {
  const gap = 2;
  const cell = (20 - gap * (columns - 1)) / columns;
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.4">
      {Array.from({ length: columns * columns }, (_, index) => (
        <rect
          key={index}
          x={(index % columns) * (cell + gap) + 0.7}
          y={Math.floor(index / columns) * (cell + gap) + 0.7}
          width={Math.max(cell - 1.4, 1)}
          height={Math.max(cell - 1.4, 1)}
          rx="1"
        />
      ))}
    </svg>
  );
}

/**
 * The bar above the products ("There are 8 results in total", the sort choice and the buttons for
 * how many products to show in a row) and the products themselves. The buttons only change how
 * the products sit on a big screen, so this is the one part of the page that needs to remember a choice.
 */
export function ProductListing({
  summary,
  sort,
  empty,
  children,
}: {
  summary: string;
  /** The sort dropdown, drawn by the page so it belongs to the filter form. */
  sort: ReactNode;
  /** Shown instead of the products when nothing matches. */
  empty?: ReactNode;
  children: ReactNode;
}) {
  const [columns, setColumns] = useState<Columns>(3);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="text-lg text-[#555]">{summary}</p>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-base">
            <span className="font-medium text-[#111]">Sort by:</span>
            {sort}
          </div>
          {!empty && (
            <div role="group" aria-label="Products in a row" className="hidden items-center gap-1 lg:flex">
              {([2, 3, 4] as const).map((count) => (
                <button
                  key={count}
                  type="button"
                  aria-label={`${count} in a row`}
                  aria-pressed={columns === count}
                  onClick={() => setColumns(count)}
                  className={`rounded p-1 transition-colors ${columns === count ? "text-[#111]" : "text-[#a5a5a5] hover:text-[#111]"}`}
                >
                  <DensityIcon columns={count} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {empty ?? <div className={`mt-6 grid grid-cols-2 gap-x-4 gap-y-10 ${columnClass[columns]}`}>{children}</div>}
    </div>
  );
}
