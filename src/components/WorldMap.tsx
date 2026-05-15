import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Stylized equirectangular world map.
 * - Coarse continent silhouettes are rendered as smoothed polygons.
 * - Pins are projected from (lat, lon) → (x, y).
 * - Optional "trails" connect two coordinates with a great-circle-ish arc.
 *
 * This avoids any third-party mapping dependency so the dashboard ships
 * as part of the existing Vite bundle.
 */

export interface MapPin {
  id: string;
  lat: number;
  lon: number;
  label: string;
  sublabel?: string;
  tone?: "blue" | "gold" | "green" | "red" | "amber" | "muted";
  pulse?: boolean;
}

export interface MapTrail {
  id: string;
  from: { lat: number; lon: number };
  to: { lat: number; lon: number };
  tone?: "blue" | "gold" | "green";
  dashed?: boolean;
}

interface Props {
  pins: MapPin[];
  trails?: MapTrail[];
  height?: number;
  onPinClick?: (id: string) => void;
  selectedId?: string | null;
  className?: string;
}

const W = 1000;
const H = 500;

function project(lat: number, lon: number): { x: number; y: number } {
  // Equirectangular projection. lon ∈ [-180, 180] → x ∈ [0, W]
  // lat ∈ [-90, 90] → y ∈ [0, H] (inverted)
  const x = ((lon + 180) / 360) * W;
  const y = ((90 - lat) / 180) * H;
  return { x, y };
}

const TONE_FILL: Record<string, string> = {
  blue: "#2C5AA0",
  gold: "#C9A227",
  green: "#10b981",
  red: "#e11d48",
  amber: "#f59e0b",
  muted: "#94a3b8",
};

/**
 * Coarse continent silhouettes — each is a closed polygon of (lon,lat) pairs
 * projected into SVG space. Resolution is intentionally low: just enough to
 * make the map land/sea readable. Pin geography uses real coordinates so the
 * marker placement is accurate regardless of silhouette fidelity.
 */
const CONTINENT_POLYGONS: [number, number][][] = [
  // North America (incl. Greenland tip)
  [
    [-168, 65], [-160, 70], [-140, 70], [-120, 72], [-95, 78], [-75, 78],
    [-60, 82], [-45, 82], [-25, 75], [-20, 70], [-50, 60], [-55, 52],
    [-65, 48], [-72, 42], [-80, 32], [-85, 30], [-90, 30], [-97, 26],
    [-100, 22], [-106, 20], [-118, 30], [-125, 38], [-128, 48], [-135, 55],
    [-148, 60], [-160, 60], [-168, 65],
  ],
  // South America
  [
    [-82, 12], [-75, 12], [-65, 10], [-58, 8], [-50, 2], [-42, -8],
    [-38, -14], [-38, -25], [-50, -35], [-62, -42], [-66, -52], [-70, -55],
    [-72, -52], [-72, -42], [-76, -32], [-80, -20], [-80, -8], [-82, 0], [-82, 12],
  ],
  // Africa
  [
    [-18, 22], [-10, 30], [-2, 35], [10, 36], [22, 32], [30, 31],
    [35, 22], [42, 14], [50, 12], [52, 0], [42, -12], [40, -25],
    [32, -32], [22, -35], [18, -28], [12, -18], [9, -5], [10, 4],
    [5, 8], [-5, 6], [-12, 12], [-16, 18], [-18, 22],
  ],
  // Europe
  [
    [-10, 38], [-5, 42], [-1, 45], [3, 48], [10, 50], [12, 55], [18, 56],
    [22, 60], [28, 64], [32, 70], [40, 70], [55, 68], [60, 65], [55, 55],
    [40, 48], [32, 40], [22, 38], [15, 36], [8, 38], [-2, 36], [-10, 38],
  ],
  // Asia
  [
    [30, 70], [50, 75], [75, 78], [105, 78], [135, 72], [155, 70], [165, 65],
    [170, 60], [160, 55], [142, 48], [135, 38], [130, 32], [125, 22], [118, 18],
    [110, 18], [108, 10], [100, 6], [94, 14], [88, 22], [78, 22], [72, 18],
    [66, 24], [60, 30], [50, 32], [45, 38], [42, 45], [38, 55], [32, 62], [30, 70],
  ],
  // Australia
  [
    [113, -22], [118, -32], [128, -32], [138, -36], [146, -38], [150, -36],
    [154, -28], [144, -18], [135, -14], [128, -14], [120, -18], [113, -22],
  ],
];

const REGION_LABELS: { lat: number; lon: number; label: string }[] = [
  { lat: 48, lon: -100, label: "North America" },
  { lat: -15, lon: -60, label: "South America" },
  { lat: 50, lon: 18, label: "Europe" },
  { lat: 0, lon: 20, label: "Africa" },
  { lat: 45, lon: 95, label: "Asia" },
  { lat: -28, lon: 134, label: "Australia" },
];

function continentPath(coords: [number, number][]): string {
  return (
    coords
      .map(([lon, lat], i) => {
        const { x, y } = project(lat, lon);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

export default function WorldMap({
  pins,
  trails = [],
  height = 460,
  onPinClick,
  selectedId,
  className,
}: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const continents = useMemo(
    () => CONTINENT_POLYGONS.map((p) => continentPath(p)),
    []
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-line",
        "bg-gradient-to-br from-[#0E1B33] via-[#13234A] to-[#0A1530]",
        className
      )}
      style={{ height }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id="oceanGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1c3265" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#08122A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="landGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22325f" />
            <stop offset="100%" stopColor="#162247" />
          </linearGradient>
          <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Ocean glow */}
        <rect width={W} height={H} fill="url(#oceanGlow)" />

        {/* Lat/Lon grid */}
        <g stroke="#ffffff" strokeOpacity="0.06" strokeWidth="0.5">
          {Array.from({ length: 12 }, (_, i) => {
            const x = ((i + 1) * W) / 13;
            return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={H} />;
          })}
          {Array.from({ length: 6 }, (_, i) => {
            const y = ((i + 1) * H) / 7;
            return <line key={`h${i}`} x1={0} y1={y} x2={W} y2={y} />;
          })}
        </g>
        {/* Equator highlight */}
        <line
          x1={0}
          y1={H / 2}
          x2={W}
          y2={H / 2}
          stroke="#C9A227"
          strokeOpacity="0.18"
          strokeWidth="0.6"
          strokeDasharray="3 6"
        />

        {/* Continents */}
        <g>
          {continents.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="url(#landGrad)"
              stroke="#3a5394"
              strokeOpacity="0.55"
              strokeWidth="0.8"
            />
          ))}
        </g>

        {/* Region labels */}
        <g fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="10" fill="#ffffff" fillOpacity="0.35">
          {REGION_LABELS.map((r) => {
            const { x, y } = project(r.lat, r.lon);
            return (
              <text key={r.label} x={x} y={y} textAnchor="middle" letterSpacing="2">
                {r.label.toUpperCase()}
              </text>
            );
          })}
        </g>

        {/* Trails */}
        <g>
          {trails.map((t) => {
            const a = project(t.from.lat, t.from.lon);
            const b = project(t.to.lat, t.to.lon);
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2 - Math.min(70, Math.abs(b.x - a.x) * 0.18);
            return (
              <path
                key={t.id}
                d={`M ${a.x},${a.y} Q ${mx},${my} ${b.x},${b.y}`}
                stroke={TONE_FILL[t.tone ?? "gold"]}
                strokeOpacity={0.85}
                strokeWidth={1.6}
                strokeDasharray={t.dashed ? "4 4" : undefined}
                fill="none"
              />
            );
          })}
        </g>

        {/* Pins */}
        <g>
          {pins.map((p) => {
            const { x, y } = project(p.lat, p.lon);
            const color = TONE_FILL[p.tone ?? "blue"];
            const isActive = selectedId === p.id || hover === p.id;
            return (
              <g
                key={p.id}
                transform={`translate(${x},${y})`}
                style={{ cursor: onPinClick ? "pointer" : "default" }}
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onPinClick?.(p.id)}
              >
                {p.pulse && (
                  <circle r="14" fill={color} opacity="0.18">
                    <animate attributeName="r" values="6;18;6" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle r={isActive ? 7 : 5} fill={color} stroke="#fff" strokeWidth={1.5} filter="url(#pinShadow)" />
                {isActive && (
                  <g transform="translate(10,-6)">
                    <rect rx={4} ry={4} width={Math.max(60, p.label.length * 6.5)} height={p.sublabel ? 32 : 18} fill="#0B1A36" stroke="#2C5AA0" />
                    <text x={8} y={12} fontSize="10" fill="#fff" fontWeight="600">{p.label}</text>
                    {p.sublabel && (
                      <text x={8} y={25} fontSize="9" fill="#C9A227">{p.sublabel}</text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] text-white/70 bg-black/30 backdrop-blur-sm rounded-md px-2.5 py-1.5 border border-white/10">
        <LegendDot color={TONE_FILL.green} label="On-site / Available" />
        <LegendDot color={TONE_FILL.gold} label="Travelling" />
        <LegendDot color={TONE_FILL.blue} label="Assigned" />
        <LegendDot color={TONE_FILL.muted} label="Off-duty" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}
