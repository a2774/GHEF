const palettes = {
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
};

export type RugPalette = keyof typeof palettes;

export function rugPaletteFor(color: string): RugPalette {
  return color in palettes ? (color as RugPalette) : "Ivory";
}

export function rugSwatch(color: string) {
  return palettes[rugPaletteFor(color)].field;
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

function Rosette({ x, y, petal, center }: { x: number; y: number; petal: string; center: string }) {
  return (
    <g>
      <polygon points={star(x, y, 11, 5, 8)} fill={petal} />
      <circle cx={x} cy={y} r={3.5} fill={center} />
    </g>
  );
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

export function RugIllustration({
  className,
  palette = "Ivory",
  medallion = true,
  viewBox = "0 0 600 840",
}: {
  className?: string;
  palette?: RugPalette;
  medallion?: boolean;
  viewBox?: string;
}) {
  const color = palettes[palette];
  const rosettes = medallion
    ? fieldRosettes.filter(({ x, y }) => Math.hypot(x - 300, y - 420) > medallionClearance)
    : fieldRosettes;

  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label="Illustration of a hand-woven carpet"
      className={className}
    >
      {Array.from({ length: 62 }, (_, i) => 8 + i * 9.5).map((x) => (
        <g key={x} stroke={color.light} strokeWidth={2.5}>
          <line x1={x} y1={0} x2={x} y2={18} />
          <line x1={x} y1={822} x2={x} y2={840} />
        </g>
      ))}

      <rect x={0} y={16} width={600} height={808} fill={color.frame} />
      <rect x={18} y={34} width={564} height={772} fill={color.light} />
      <rect x={26} y={42} width={548} height={756} fill={color.frame} />

      {borderX.map((x) => (
        <g key={x}>
          <polygon points={diamond(x, 72, 17, 19)} fill={color.metal} />
          <polygon points={diamond(x, 72, 8, 10)} fill={color.field} />
          <polygon points={diamond(x, 768, 17, 19)} fill={color.metal} />
          <polygon points={diamond(x, 768, 8, 10)} fill={color.field} />
        </g>
      ))}
      {borderY.map((y) => (
        <g key={y}>
          <polygon points={diamond(60, y, 17, 19)} fill={color.metal} />
          <polygon points={diamond(60, y, 8, 10)} fill={color.field} />
          <polygon points={diamond(540, y, 17, 19)} fill={color.metal} />
          <polygon points={diamond(540, y, 8, 10)} fill={color.field} />
        </g>
      ))}

      <rect x={92} y={104} width={416} height={632} fill={color.light} />
      <rect x={100} y={112} width={400} height={616} fill={color.field} />

      {rosettes.map(({ x, y }) => (
        <Rosette key={`${x}-${y}`} x={x} y={y} petal={color.light} center={color.frame} />
      ))}

      {medallion && (
        <>
          <polygon points="100,112 250,112 100,262" fill={color.frame} />
          <polygon points="500,112 350,112 500,262" fill={color.frame} />
          <polygon points="100,728 250,728 100,578" fill={color.frame} />
          <polygon points="500,728 350,728 500,578" fill={color.frame} />
          <Rosette x={138} y={150} petal={color.light} center={color.metal} />
          <Rosette x={462} y={150} petal={color.light} center={color.metal} />
          <Rosette x={138} y={690} petal={color.light} center={color.metal} />
          <Rosette x={462} y={690} petal={color.light} center={color.metal} />

          <polygon points={star(300, 420, 182, 146, 16)} fill={color.frame} />
          <polygon points={star(300, 420, 154, 124, 16)} fill={color.metal} />
          <polygon points={star(300, 420, 142, 112, 16)} fill={color.light} />
          <polygon points={star(300, 420, 116, 82, 12)} fill={color.field} />
          <polygon points={star(300, 420, 84, 58, 12)} fill={color.soft} />
          <polygon points={star(300, 420, 62, 30, 8)} fill={color.frame} />
          <polygon points={star(300, 420, 34, 16, 8)} fill={color.metal} />
          <circle cx={300} cy={420} r={9} fill={color.light} />
        </>
      )}
    </svg>
  );
}
