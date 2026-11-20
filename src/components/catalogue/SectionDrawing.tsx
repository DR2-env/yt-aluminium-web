import type { Section } from "@/lib/catalogue";
import { finishOf } from "@/lib/finishes";

interface Props {
  section: Section;
  finish: string;
  dims?: [number, number];
  showDims?: boolean;
  className?: string;
  title?: string;
  /** Line drawing only (no finish colour), for a technical-drawing look. */
  outline?: boolean;
}

// End-on cross section of a profile, drawn from the traced price-list sketch.
// Stroke uses currentColor so it follows light and dark mode.
export function SectionDrawing({ section: S, finish, dims, showDims = false, className = "", title, outline = false }: Props) {
  const pad = Math.max(S.w, S.h) * (showDims ? 0.34 : 0.14);
  const toPath = (pts: [number, number][]) => `M${pts.map(([x, y]) => `${x} ${-y}`).join("L")}Z`;
  const d = S.shapes.map((s) => toPath(s.outer) + s.holes.map(toPath).join("")).join("");
  const x0 = -S.w / 2, x1 = S.w / 2, y0 = -S.h / 2, y1 = S.h / 2;
  const sw = Math.max(S.w, S.h) / 260;
  const fs = Math.max(S.w, S.h) / 17;
  const f = finishOf(finish);
  const yy = y1 + pad * 0.45;
  const xx = x1 + pad * 0.45;

  return (
    <svg
      viewBox={`${x0 - pad} ${y0 - pad} ${S.w + pad * 2} ${S.h + pad * 2}`}
      className={className}
      role="img"
      aria-label={title ?? "Profile cross section"}
    >
      <path d={d} fill={outline ? "none" : f.wood ? "#a04a2c" : f.hex} fillRule="evenodd" stroke="currentColor" strokeWidth={outline ? sw * 0.9 : sw * 1.3} strokeLinejoin="round" />
      {showDims && dims && (
        <g className="text-muted" stroke="currentColor" strokeWidth={sw} fill="none">
          <path d={`M${x0} ${y1 + pad * 0.15}V${yy + pad * 0.1}M${x1} ${y1 + pad * 0.15}V${yy + pad * 0.1}M${x0} ${yy}H${x1}`} />
          <path d={`M${x1 + pad * 0.15} ${y0}H${xx + pad * 0.1}M${x1 + pad * 0.15} ${y1}H${xx + pad * 0.1}M${xx} ${y0}V${y1}`} />
          <g fill="currentColor" stroke="none" fontFamily="var(--font-mono)" fontSize={fs} textAnchor="middle" className="text-ink">
            <text x={0} y={yy + fs * 1.3}>
              {dims[0]} mm
            </text>
            <text x={xx + fs * 0.5} y={0} transform={`rotate(-90 ${xx + fs * 0.5} 0)`} dy={fs * 0.9}>
              {dims[1]} mm
            </text>
          </g>
        </g>
      )}
    </svg>
  );
}
