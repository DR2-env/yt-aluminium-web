import { finishOf, swatchBackground } from "@/lib/finishes";

export function SwatchStrip({ fin, max = 7 }: { fin: string[]; max?: number }) {
  const shown = fin.filter((f) => f !== "NA" && f !== "RB");
  if (!shown.length) return <span className="text-xs text-muted">Standard finish</span>;
  return (
    <div className="flex items-center gap-1" aria-label={`${shown.length} finishes`}>
      {shown.slice(0, max).map((f) => (
        <span
          key={f}
          title={finishOf(f).name}
          className="size-3.5 rounded-full ring-1 ring-inset ring-line-strong"
          style={{ background: swatchBackground(f) }}
        />
      ))}
      {shown.length > max && <span className="ml-1 font-mono text-[11px] text-muted">+{shown.length - max}</span>}
    </div>
  );
}
