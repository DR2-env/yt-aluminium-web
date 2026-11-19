"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowCounterClockwise, Check, Cube, Minus, Plus, Polygon, Play, Pause } from "@phosphor-icons/react";
import { LazyViewer } from "@/components/three/LazyViewer";
import { SectionDrawing } from "./SectionDrawing";
import { finishOf, swatchBackground } from "@/lib/finishes";
import { quote, useQuote } from "@/lib/quote-store";
import { unitLabel } from "@/lib/units";
import type { Section } from "@/lib/catalogue";

export interface ConfigVariant {
  code: string;
  label?: string;
  fin: string[];
  sec?: string;
  dims?: [number, number];
  len: string;
  pack: number;
  packText: string;
  w?: number;
  h?: number;
  t?: number;
}

export interface ConfigProduct {
  id: string;
  name: string;
  kind: string;
  unit: string;
  tag?: string;
  mesh?: string;
  spool?: string;
  rubber?: boolean;
  photo?: string;
  variants: ConfigVariant[];
  sections: Record<string, Section>;
}

type Mode = "3d" | "section";

export function ProductConfigurator({ product }: { product: ConfigProduct }) {
  const params = useSearchParams();
  const initialIndex = Math.max(0, product.variants.findIndex((v) => v.code === params.get("size")));
  const [vi, setVi] = useState(initialIndex);
  const v = product.variants[vi] ?? product.variants[0];
  const [finish, setFinish] = useState(() => (v.fin.includes("MM") ? "MM" : v.fin[0]));
  const activeFinish = v.fin.includes(finish) ? finish : v.fin.includes("MM") ? "MM" : v.fin[0];
  const [qty, setQty] = useState(1);
  const [mode, setMode] = useState<Mode>("3d");
  const [spin, setSpin] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [added, setAdded] = useState(false);
  const lines = useQuote();

  const section = v.sec ? product.sections[v.sec] : undefined;
  const can3D = Boolean(section) || ["spool", "roll", "sheet", "packer"].includes(product.kind);
  const viewItem = useMemo(
    () => ({ kind: product.kind, rubber: product.rubber, spool: product.spool, mesh: product.mesh, w: v.w, h: v.h, t: v.t, section }),
    [product.kind, product.rubber, product.spool, product.mesh, v.w, v.h, v.t, section],
  );
  const showFinishPicker = !(v.fin.length === 1 && (v.fin[0] === "NA" || v.fin[0] === "RB"));
  const inQuote = lines.filter((l) => l.code === v.code).reduce((n, l) => n + l.qty, 0);

  const add = () => {
    quote.add({
      pid: product.id,
      code: v.code,
      name: product.name,
      label: product.variants.length > 1 ? v.label : undefined,
      finish: activeFinish,
      finishName: finishOf(activeFinish).name,
      qty,
      unit: product.unit,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  const toggle = (active: boolean) =>
    `inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors ${active ? "bg-ink text-bg" : "text-muted hover:text-ink"}`;

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* Viewer */}
      <div className="lg:col-span-7">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-[radial-gradient(ellipse_at_50%_35%,var(--surface)_0%,var(--surface-2)_100%)] lg:sticky lg:top-24">
          {can3D && mode === "3d" ? (
            <LazyViewer item={viewItem} finish={activeFinish} autoRotate={spin} resetKey={resetKey} onInteract={() => setSpin(false)} />
          ) : section ? (
            <div className="absolute inset-0 p-8 md:p-14">
              <SectionDrawing section={section} finish={activeFinish} dims={v.dims} showDims className="h-full w-full text-ink" title={`${product.name} cross section`} />
            </div>
          ) : product.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- small local cut-out, already optimised webp
            <img src={product.photo} alt={product.name} className="absolute inset-0 h-full w-full object-contain p-10 mix-blend-multiply dark:mix-blend-normal" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-mono text-3xl font-semibold">{v.code}</p>
                <p className="mt-2 text-sm text-muted">Photo coming soon. Ask us for a picture.</p>
              </div>
            </div>
          )}

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-md bg-surface/90 px-2.5 py-1 font-mono text-xs font-semibold backdrop-blur">{v.code}</span>
            {product.tag && <span className="rounded-md bg-accent px-2 py-1 text-[11px] font-semibold text-accent-ink">{product.tag}</span>}
          </div>

          {(section || can3D) && (
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
              {section ? (
                <div className="flex rounded-lg border border-line bg-surface/90 p-0.5 backdrop-blur" role="group" aria-label="View">
                  <button type="button" className={toggle(mode === "3d")} aria-pressed={mode === "3d"} onClick={() => setMode("3d")}>
                    <Cube size={14} weight="bold" /> 3D
                  </button>
                  <button type="button" className={toggle(mode === "section")} aria-pressed={mode === "section"} onClick={() => setMode("section")}>
                    <Polygon size={14} weight="bold" /> Section
                  </button>
                </div>
              ) : (
                <span />
              )}
              {mode === "3d" && can3D && (
                <div className="flex rounded-lg border border-line bg-surface/90 p-0.5 backdrop-blur">
                  <button type="button" className={toggle(false)} aria-pressed={spin} onClick={() => setSpin((s) => !s)} aria-label={spin ? "Stop rotating" : "Rotate"}>
                    {spin ? <Pause size={14} weight="bold" /> : <Play size={14} weight="bold" />}
                  </button>
                  <button type="button" className={toggle(false)} onClick={() => setResetKey((k) => k + 1)} aria-label="Reset view">
                    <ArrowCounterClockwise size={14} weight="bold" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          {section && !v.dims
            ? "Drawn from our price list sketch. Ask us for the technical drawing."
            : "Screen colours are a guide. Ask for a physical sample before you order."}
        </p>
      </div>

      {/* Options */}
      <div className="lg:col-span-5">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{product.name}</h1>
        <p className="mt-2 font-mono text-sm text-muted">{v.code}</p>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {[
            ["Supplied as", v.len],
            ["Sold in", v.packText],
            ...(v.dims ? [["Size", `${v.dims[0]} × ${v.dims[1]} mm`]] : []),
            ...(v.label && product.variants.length > 1 ? [["Option", v.label]] : []),
          ].map(([k, val], i, all) => (
            <div key={k} className={`bg-surface p-4 ${all.length % 2 && i === all.length - 1 ? "col-span-2" : ""}`}>
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-1 text-sm font-medium">{val}</dd>
            </div>
          ))}
        </dl>

        {product.variants.length > 1 && (
          <fieldset className="mt-8">
            <legend className="text-sm font-semibold">Size</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.variants.map((x, i) => (
                <button
                  key={x.code}
                  type="button"
                  onClick={() => setVi(i)}
                  aria-pressed={i === vi}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${i === vi ? "border-ink bg-ink text-bg" : "border-line-strong bg-surface hover:border-ink"}`}
                >
                  <span className="block font-medium">{x.label}</span>
                  <span className={`block font-mono text-[11px] ${i === vi ? "text-bg/70" : "text-muted"}`}>{x.code}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {showFinishPicker && (
          <fieldset className="mt-8">
            <legend className="text-sm font-semibold">
              Finish <span className="font-normal text-muted">{finishOf(activeFinish).name}</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Finish">
              {v.fin.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={f === activeFinish}
                  onClick={() => setFinish(f)}
                  title={finishOf(f).name}
                  className={`flex items-center gap-2 rounded-lg border py-1.5 pl-1.5 pr-3 text-sm transition-colors ${f === activeFinish ? "border-ink bg-surface" : "border-line bg-surface hover:border-line-strong"}`}
                >
                  <span className="size-6 rounded-md ring-1 ring-inset ring-line-strong" style={{ background: swatchBackground(f) }} />
                  <span className="font-medium">{finishOf(f).name}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-10 rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 items-center rounded-lg border border-line-strong">
              <button type="button" className="grid h-full w-11 place-items-center text-muted hover:text-ink" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer">
                <Minus size={16} weight="bold" />
              </button>
              <label className="sr-only" htmlFor="qty">Quantity</label>
              <input
                id="qty"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value.replace(/\D/g, ""), 10) || 1))}
                className="h-full w-12 bg-transparent text-center font-mono text-base font-semibold focus:outline-none"
              />
              <button type="button" className="grid h-full w-11 place-items-center text-muted hover:text-ink" onClick={() => setQty((q) => q + 1)} aria-label="More">
                <Plus size={16} weight="bold" />
              </button>
            </div>
            <span className="text-sm text-muted">{unitLabel(product.unit, qty)}</span>
            <button
              type="button"
              onClick={add}
              className="ml-auto inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-6 text-[15px] font-semibold text-accent-ink transition-[background-color,transform] hover:bg-accent-hover active:translate-y-px sm:flex-none"
            >
              {added ? <Check size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
              {added ? "Added" : "Add to quote list"}
            </button>
          </div>
          {inQuote > 0 && (
            <p className="mt-3 text-sm text-muted">
              {inQuote} {unitLabel(product.unit, inQuote)} of {v.code} in your list.{" "}
              <Link href="/quote" className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                Review and send
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
