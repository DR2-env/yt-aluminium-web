import { swatchBackground } from "@/lib/finishes";
import { finishName, type Locale } from "@/i18n";

export function SwatchStrip({ fin, lang, standardLabel, max = 7 }: { fin: string[]; lang: Locale; standardLabel: string; max?: number }) {
  const shown = fin.filter((f) => f !== "NA" && f !== "RB");
  if (!shown.length) return <span className="text-xs text-muted">{standardLabel}</span>;
  return (
    <div className="flex items-center gap-1">
      {shown.slice(0, max).map((f) => (
        <span key={f} title={finishName(lang, f)} className="size-3 rounded-full ring-1 ring-inset ring-line-strong" style={{ background: swatchBackground(f) }} />
      ))}
      {shown.length > max && <span className="ms-0.5 text-[11px] text-muted">+{shown.length - max}</span>}
    </div>
  );
}
