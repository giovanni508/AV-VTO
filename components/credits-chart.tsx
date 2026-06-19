"use client";

import { useState } from "react";

export type CreditsPoint = { label: string; value: number };

const W = 720;
const H = 180;
const PAD = 10;

/**
 * Grafico ad area dell'uso crediti nel tempo. SVG leggero (nessuna dipendenza),
 * con linea a gradiente di brand e tooltip al passaggio del mouse.
 */
export function CreditsChart({ data }: { data: CreditsPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = data.length;
  const max = Math.max(...data.map((d) => d.value), 1);

  const x = (i: number) => PAD + (i * (W - PAD * 2)) / Math.max(n - 1, 1);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);

  const line = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const area = `M ${x(0)},${H - PAD} L ${data
    .map((d, i) => `${x(i)},${y(d.value)}`)
    .join(" L ")} L ${x(n - 1)},${H - PAD} Z`;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = (event.clientX - rect.left) / rect.width;
    const index = Math.round(fraction * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, index)));
  }

  const active = hover != null ? data[hover] : null;

  return (
    <div
      className="relative"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-40 w-full overflow-visible"
        role="img"
        aria-label="Andamento uso crediti negli ultimi 30 giorni"
      >
        <defs>
          <linearGradient id="creditsArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2fa0f7" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2fa0f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="creditsLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1e3ebe" />
            <stop offset="100%" stopColor="#2fa0f7" />
          </linearGradient>
        </defs>

        <path d={area} fill="url(#creditsArea)" />
        <polyline
          points={line}
          fill="none"
          stroke="url(#creditsLine)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {hover != null ? (
          <line
            x1={x(hover)}
            y1={PAD}
            x2={x(hover)}
            y2={H - PAD}
            stroke="#2fa0f7"
            strokeWidth={1}
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>

      {/* Punto + tooltip sul valore in hover (HTML per evitare distorsioni SVG) */}
      {hover != null && active ? (
        <>
          <span
            className="bg-background ring-brand pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2"
            style={{
              left: `${(x(hover) / W) * 100}%`,
              top: `${(y(active.value) / H) * 100}%`,
              boxShadow: "0 0 0 3px rgba(47,160,247,0.25)",
            }}
          />
          <div
            className="bg-foreground text-background pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap shadow-md"
            style={{
              left: `${Math.min(Math.max((x(hover) / W) * 100, 8), 92)}%`,
              top: `${(y(active.value) / H) * 100 - 4}%`,
            }}
          >
            {active.label}: {active.value.toLocaleString("it-IT")} cr.
          </div>
        </>
      ) : null}

      <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
        <span>{data[0]?.label}</span>
        <span className="text-foreground font-medium">
          {total.toLocaleString("it-IT")} crediti negli ultimi 30 giorni
        </span>
        <span>{data[n - 1]?.label}</span>
      </div>
    </div>
  );
}
