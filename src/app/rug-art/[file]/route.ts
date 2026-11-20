import { parseRugFileName, rugFileName, rugPaletteNames, rugSvg, type RugView } from "@/lib/rug-art";

// The carpet drawings that stand in for product photos. Every combination is made once at build
// time, and the browser keeps each file for a year, so a page only has a short <img> for each one.
export function generateStaticParams() {
  const views: RugView[] = ["full", "close"];
  return rugPaletteNames.flatMap((palette) =>
    [true, false].flatMap((medallion) => views.map((view) => ({ file: rugFileName(palette, medallion, view) }))),
  );
}

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const parsed = parseRugFileName(file);
  if (!parsed) return new Response("Not found", { status: 404 });

  return new Response(rugSvg(parsed.palette, parsed.medallion, parsed.view), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
