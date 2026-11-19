"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { LazyViewer } from "@/components/three/LazyViewer";
import type { ViewItem } from "@/components/three/scene";
import { swatchBackground } from "@/lib/finishes";

interface Props {
  item: ViewItem;
  code: string;
  name: string;
  dims?: [number, number];
  finishes: { code: string; name: string }[];
  href: string;
  caption: string;
  viewLabel: string;
  /** Pre-rendered picture shown until the live 3D model is ready. */
  poster: string;
}

// Live 3D model of a stocked profile; visitors can preview it in the finishes it is sold in.
export function HeroViewer({ item, code, name, dims, finishes, href, caption, viewLabel, poster }: Props) {
  const [finish, setFinish] = useState(finishes.some((f) => f.code === "MM") ? "MM" : finishes[0].code);
  const [ready, setReady] = useState(false);
  const current = finishes.find((f) => f.code === finish)?.name ?? finish;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md border border-line">
      <div className="relative aspect-[4/3] bg-surface-2">
        {!ready && (
          // eslint-disable-next-line @next/next/no-img-element -- local pre-rendered placeholder
          <img src={poster} alt={name} className="absolute inset-0 h-full w-full object-contain p-4" />
        )}
        <LazyViewer item={item} finish={finish} onReady={() => setReady(true)} />
        <span className="pointer-events-none absolute start-3 top-3 rounded-sm bg-surface px-2 py-0.5 font-mono text-xs" dir="ltr">
          {code}
        </span>
      </div>
      <div className="border-t border-line bg-surface p-4">
        <p className="text-sm font-medium">
          {name}
          {dims && (
            <span className="ms-2 font-mono text-xs font-normal text-muted" dir="ltr">
              {dims[0]} × {dims[1]} mm
            </span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-muted">{caption.replace("{finish}", current)}</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={name}>
            {finishes.map((f) => (
              <button
                key={f.code}
                type="button"
                role="radio"
                aria-checked={finish === f.code}
                aria-label={f.name}
                title={f.name}
                onClick={() => setFinish(f.code)}
                className={`size-7 rounded-full ring-1 ring-inset ring-line-strong ${finish === f.code ? "outline outline-2 outline-offset-2 outline-accent" : ""}`}
                style={{ background: swatchBackground(f.code) }}
              />
            ))}
          </div>
          <Link href={href} className="inline-flex h-9 shrink-0 items-center gap-1 rounded border border-line-strong px-3 text-sm font-medium hover:bg-surface-2">
            {viewLabel}
            <ArrowRight size={14} className="rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}
