import type { NetWorthPoint } from "@/types/portfolio";
import { netWorthTrend } from "@/data/mockDashboard";

/** Dependency-free SVG area chart of consolidated net worth. */
export function NetWorthChart({
  data = netWorthTrend,
}: {
  data?: NetWorthPoint[];
}) {
  const w = 560;
  const h = 150;
  const pad = { top: 12, right: 6, bottom: 20, left: 6 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const values = data.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = data.map((p, i) => {
    const x = pad.left + (i / (data.length - 1)) * innerW;
    const y = pad.top + innerH - ((p.value - min) / range) * innerH;
    return { x, y, label: p.period };
  });

  const line = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad.left},${pad.top + innerH} ${line} ${
    pad.left + innerW
  },${pad.top + innerH}`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-40 w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Consolidated net worth trend, last 8 months"
    >
      <defs>
        <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#nwFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="4" fill="#2563eb" />
      <circle cx={last.x} cy={last.y} r="7" fill="#2563eb" fillOpacity="0.15" />
      {points.map((p) => (
        <text
          key={p.label}
          x={p.x}
          y={h - 4}
          textAnchor="middle"
          className="fill-muted"
          fontSize="10"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
