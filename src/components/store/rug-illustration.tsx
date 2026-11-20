import { type RugPalette, rugFileName, rugViewBoxes } from "@/lib/rug-art";

export { type RugPalette, rugPaletteFor, rugSwatch } from "@/lib/rug-art";

/**
 * A drawing of a woven carpet, for a product that has no photo yet. It is a small image file
 * (made in lib/rug-art and served from app/rug-art), not shapes inside the page, so a page full
 * of product cards stays light. The size comes from the file itself: give it a width or a height
 * and the other side follows, just like the inline drawing it replaced.
 *
 * `viewBox` is only used to choose between the whole carpet and the square close-up of its middle.
 */
export function RugIllustration({
  className,
  palette = "Ivory",
  medallion = true,
  viewBox,
}: {
  className?: string;
  palette?: RugPalette;
  medallion?: boolean;
  viewBox?: string;
}) {
  const view = viewBox && viewBox !== rugViewBoxes.full ? "close" : "full";

  return (
    // A plain <img> on purpose: an SVG file is already as small as it gets, so there is nothing for the image optimiser to do.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/rug-art/${rugFileName(palette, medallion, view)}`}
      alt="Illustration of a hand-woven carpet"
      loading="lazy"
      decoding="async"
      draggable={false}
      className={className}
    />
  );
}
