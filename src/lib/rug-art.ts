// The drawings of a woven carpet that stand in for a product photo. They are built here as SVG text
// and served as small files (see app/rug-art), so a page shows them with a plain <img> instead of
// carrying hundreds of shapes in its HTML for every product card.

export const rugPalettes = {
  Ivory: {
    field: "#efe6d7",
    frame: "#c3b199",
    light: "#fbf7ef",
    metal: "#b39f86",
    soft: "#dccfba",
  },
  Sand: {
    field: "#cdb995",
    frame: "#8d7c63",
    light: "#f0e6d3",
    metal: "#a28b6b",
    soft: "#dcc8a6",
  },
  Beige: {
    field: "#ddd0bb",
    frame: "#a99a84",
    light: "#f4ecdf",
    metal: "#bba98f",
    soft: "#e9dfcf",
  },
  Charcoal: {
    field: "#3a342e",
    frame: "#1f1c19",
    light: "#b8ab98",
    metal: "#8d7c63",
    soft: "#574e45",
  },
} as const;

export type RugPalette = keyof typeof rugPalettes;
export const rugPaletteNames = Object.keys(rugPalettes) as RugPalette[];

export function rugPaletteFor(color: string): RugPalette {
  return color in rugPalettes ? (color as RugPalette) : "Ivory";
}

export function rugSwatch(color: string) {
  return rugPalettes[rugPaletteFor(color)].field;
}

/** `full` is the whole carpet; `close` is a square crop of its middle, for close-up views. */
export type RugView = "full" | "close";

export const rugViewBoxes: Record<RugView, string> = {
  full: "0 0 600 840",
  close: "110 230 380 380",
};

export function rugFileName(palette: RugPalette, medallion: boolean, view: RugView) {
  return `${palette.toLowerCase()}-${medallion ? "medallion" : "plain"}-${view}.svg`;
}

export function parseRugFileName(file: string): { palette: RugPalette; medallion: boolean; view: RugView } | null {
  const match = /^([a-z]+)-(medallion|plain)-(full|close)\.svg$/.exec(file);
  if (!match) return null;
  const palette = rugPaletteNames.find((name) => name.toLowerCase() === match[1]);
  if (!palette) return null;
  return { palette, medallion: match[2] === "medallion", view: match[3] as RugView };
}

function star(cx: number, cy: number, outer: number, inner: number, tips: number) {
  return Array.from({ length: tips * 2 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * i) / tips - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function diamond(cx: number, cy: number, width: number, height: number) {
  return `${cx},${cy - height} ${cx + width},${cy} ${cx},${cy + height} ${cx - width},${cy}`;
}

const borderX = Array.from({ length: 11 }, (_, i) => 80 + i * 44);
const borderY = Array.from({ length: 17 }, (_, i) => 72 + i * 44);
const fieldRows = Array.from({ length: 11 }, (_, row) => 160 + row * 52);

const fieldRosettes = fieldRows.flatMap((y, row) =>
  [0, 1, 2, 3, 4, 5, 6]
    .map((column) => ({ x: 120 + column * 60 + (row % 2) * 30, y }))
    .filter(({ x }) => x < 490),
);

const medallionClearance = 195;

const polygon = (points: string, fill: string) => `<polygon points="${points}" fill="${fill}"/>`;

function rosette(x: number, y: number, petal: string, center: string) {
  return `${polygon(star(x, y, 11, 5, 8), petal)}<circle cx="${x}" cy="${y}" r="3.5" fill="${center}"/>`;
}

/** The finished drawing as the text of an SVG file. */
export function rugSvg(paletteName: RugPalette, medallion: boolean, view: RugView) {
  const color = rugPalettes[paletteName];
  const viewBox = rugViewBoxes[view];
  const [, , width, height] = viewBox.split(" ");
  const rosettes = medallion
    ? fieldRosettes.filter(({ x, y }) => Math.hypot(x - 300, y - 420) > medallionClearance)
    : fieldRosettes;

  const fringe = Array.from({ length: 62 }, (_, i) => {
    const x = 8 + i * 9.5;
    return `M${x} 0V18M${x} 822V840`;
  }).join("");

  const parts: string[] = [
    `<path d="${fringe}" stroke="${color.light}" stroke-width="2.5" fill="none"/>`,
    `<rect x="0" y="16" width="600" height="808" fill="${color.frame}"/>`,
    `<rect x="18" y="34" width="564" height="772" fill="${color.light}"/>`,
    `<rect x="26" y="42" width="548" height="756" fill="${color.frame}"/>`,
  ];

  for (const x of borderX) {
    parts.push(
      polygon(diamond(x, 72, 17, 19), color.metal),
      polygon(diamond(x, 72, 8, 10), color.field),
      polygon(diamond(x, 768, 17, 19), color.metal),
      polygon(diamond(x, 768, 8, 10), color.field),
    );
  }
  for (const y of borderY) {
    parts.push(
      polygon(diamond(60, y, 17, 19), color.metal),
      polygon(diamond(60, y, 8, 10), color.field),
      polygon(diamond(540, y, 17, 19), color.metal),
      polygon(diamond(540, y, 8, 10), color.field),
    );
  }

  parts.push(
    `<rect x="92" y="104" width="416" height="632" fill="${color.light}"/>`,
    `<rect x="100" y="112" width="400" height="616" fill="${color.field}"/>`,
  );
  for (const { x, y } of rosettes) parts.push(rosette(x, y, color.light, color.frame));

  if (medallion) {
    parts.push(
      polygon("100,112 250,112 100,262", color.frame),
      polygon("500,112 350,112 500,262", color.frame),
      polygon("100,728 250,728 100,578", color.frame),
      polygon("500,728 350,728 500,578", color.frame),
      rosette(138, 150, color.light, color.metal),
      rosette(462, 150, color.light, color.metal),
      rosette(138, 690, color.light, color.metal),
      rosette(462, 690, color.light, color.metal),
      polygon(star(300, 420, 182, 146, 16), color.frame),
      polygon(star(300, 420, 154, 124, 16), color.metal),
      polygon(star(300, 420, 142, 112, 16), color.light),
      polygon(star(300, 420, 116, 82, 12), color.field),
      polygon(star(300, 420, 84, 58, 12), color.soft),
      polygon(star(300, 420, 62, 30, 8), color.frame),
      polygon(star(300, 420, 34, 16, 8), color.metal),
      `<circle cx="300" cy="420" r="9" fill="${color.light}"/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${parts.join("")}</svg>`;
}
