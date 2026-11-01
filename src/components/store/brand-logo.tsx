import { useId } from "react";

const studs = [
  { x: 200, y: 26, r: 6 },
  { x: 200, y: 374, r: 6 },
  { x: 26, y: 200, r: 6 },
  { x: 374, y: 200, r: 6 },
  { x: 54, y: 200, r: 3.5 },
  { x: 346, y: 200, r: 3.5 },
];

const ringGaps = "M 186 30 A 170 170 0 0 0 30 186 M 214 30 A 170 170 0 0 1 370 186 M 186 370 A 170 170 0 0 1 30 214 M 214 370 A 170 170 0 0 0 370 214";

export function BrandLogo({ className }: { className?: string }) {
  const id = useId().replace(/\W/g, "");
  const gold = `url(#${id}-gold)`;

  return (
    <svg
      viewBox="0 0 400 400"
      role="img"
      aria-label="Ganga Handmade Export logo"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e3a1" />
          <stop offset="0.45" stopColor="#d4a94a" />
          <stop offset="0.7" stopColor="#f3dc93" />
          <stop offset="1" stopColor="#a87a26" />
        </linearGradient>
        <path id={`${id}-top`} d="M 62 200 A 138 138 0 0 1 338 200" />
        <path id={`${id}-bottom`} d="M 42 200 A 158 158 0 0 0 358 200" />
      </defs>

      <circle cx={200} cy={200} r={196} fill="#090807" stroke={gold} strokeWidth={5} />
      <path d={ringGaps} fill="none" stroke={gold} strokeWidth={2.5} />
      <circle cx={200} cy={200} r={118} fill="none" stroke={gold} strokeWidth={3} />

      {studs.map(({ x, y, r }) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={gold} />
      ))}

      <g fill={gold} fontFamily="var(--font-display)" fontSize={23} fontWeight={700} letterSpacing={2}>
        <text textAnchor="middle">
          <textPath href={`#${id}-top`} startOffset="50%">
            GANGA HANDMADE EXPORT
          </textPath>
        </text>
        <text textAnchor="middle">
          <textPath href={`#${id}-bottom`} startOffset="50%">
            GANGA HANDMADE EXPORT
          </textPath>
        </text>
      </g>

      <g
        fill={gold}
        stroke="#090807"
        strokeWidth={5}
        paintOrder="stroke"
        fontFamily="var(--font-logo)"
        fontWeight={700}
        textAnchor="middle"
      >
        <text x={200} y={252} fontSize={148}>
          H
        </text>
        <text x={132} y={240} fontSize={112}>
          G
        </text>
        <text x={270} y={240} fontSize={112}>
          E
        </text>
      </g>

      <path
        d="M 276 118 L 281 137 L 300 142 L 281 147 L 276 166 L 271 147 L 252 142 L 271 137 Z"
        fill={gold}
      />
    </svg>
  );
}
