import type { ReactNode } from "react";

/**
 * Wraps a part of a page that is below the first screen. The browser then skips its layout and
 * painting until it is scrolled near, which makes the first screen ready sooner on a phone.
 * `contain-intrinsic-size` is the height the browser assumes until the part has been drawn once
 * (after that it remembers the real height), so the scrollbar stays steady.
 */
export function Deferred({ children, height = 720 }: { children: ReactNode; height?: number }) {
  return (
    <div className="[content-visibility:auto]" style={{ containIntrinsicSize: `auto ${height}px` }}>
      {children}
    </div>
  );
}
