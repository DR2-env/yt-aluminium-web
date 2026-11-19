"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { LazyViewer } from "@/components/three/LazyViewer";
import type { ViewItem } from "@/components/three/scene";
import { finishOf, swatchBackground } from "@/lib/finishes";

interface Props {
  item: ViewItem;
  code: string;
  name: string;
  dims?: [number, number];
  finishes: string[];
  href: string;
}

// Live 3D render of a real YT profile. Visitors can recolour it with the finishes it comes in.
export function HeroViewer({ item, code, name, dims, finishes, href }: Props) {
  const [finish, setFinish] = useState(finishes.includes("MM") ? "MM" : finishes[0]);
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-panel">
      <div className="relative min-h-[300px] flex-1 bg-[radial-gradient(ellipse_at_50%_35%,var(--surface)_0%,var(--surface-2)_100%)]">
        <LazyViewer item={item} finish={finish} />
        <div className="pointer-events-none absolute left-4 top-4 rounded-md bg-surface/90 px-2.5 py-1 font-mono text-xs font-semibold backdrop-blur">
          {code}
        </div>
      </div>
      <div className="flex flex-col gap-4 border-t border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {name}
            {dims && <span className="ml-2 font-mono text-xs font-normal text-muted">{dims[0]} × {dims[1]} mm</span>}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Shown in <span className="text-ink">{finishOf(finish).name}</span>. Drag to rotate.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5" role="radiogroup" aria-label="Preview finish">
            {finishes.map((f) => (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={finish === f}
                aria-label={finishOf(f).name}
                title={finishOf(f).name}
                onClick={() => setFinish(f)}
                className={`size-6 rounded-full ring-1 ring-inset ring-line-strong transition-transform hover:scale-110 ${finish === f ? "outline-2 outline-offset-2 outline-accent" : ""}`}
                style={{ background: swatchBackground(f), outlineStyle: finish === f ? "solid" : "none" }}
              />
            ))}
          </div>
          <Link href={href} className="grid size-9 shrink-0 place-items-center rounded-lg border border-line-strong hover:border-ink" aria-label={`View ${code} ${name}`}>
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );
}
