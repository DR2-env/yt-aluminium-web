"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowCounterClockwise, Check, Minus, Pause, Play, Plus, WhatsappLogo } from "@phosphor-icons/react";
import { LazyViewer } from "@/components/three/LazyViewer";
import { SectionDrawing } from "./SectionDrawing";
import { finishOf, swatchBackground } from "@/lib/finishes";
import { quote, useQuote } from "@/lib/quote-store";
import { whatsappLink } from "@/lib/site";
import type { Section } from "@/lib/catalogue";

export interface ConfigVariant {
  code: string;
  label?: string;
  fin: string[];
  sec?: string;
  dims?: [number, number];
  len: string;
  packText: string;
  w?: number;
  h?: number;
  t?: number;
}

export interface ConfigProduct {
  id: string;
  /** English name, used in the quote message sent to YT. */
  nameEn: string;
  name: string;
  kind: string;
  unit: string;
  mesh?: string;
  spool?: string;
  rubber?: boolean;
  photo?: string;
  /** Size from src/data/sizes.ts, for items the price list gives no dimensions for. */
  sizeText?: string;
  /** Pre-rendered picture shown until the live 3D model is ready. */
  poster: string;
  note: "section" | "standin" | "model";
  variants: ConfigVariant[];
  sections: Record<string, Section>;
}

export interface ConfigStrings {
  view3d: string;
  viewSection: string;
  viewPhoto: string;
  rotate: string;
  pause: string;
  reset: string;
  suppliedAs: string;
  soldIn: string;
  size: string;
  option: string;
  finish: string;
  quantity: string;
  fewer: string;
  more: string;
  add: string;
  added: string;
  inQuote: string;
  reviewQuote: string;
  noteSection: string;
  noteStandin: string;
  noteModel: string;
  noteColour: string;
  ask: string;
  askMessage: string;
  price: string;
  tag?: string;
  units: Record<string, string[]>;
  finishNames: Record<string, string>;
  quoteHref: string;
}

type Mode = "3d" | "section" | "photo";
const fill = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

export function ProductConfigurator({ product, s }: { product: ConfigProduct; s: ConfigStrings }) {
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
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ code: string; qty: number } | null>(null);
  // Hide the confirmation after a few seconds; a new add restarts the timer.
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(t);
  }, [toast]);
  const lines = useQuote();

  const unit = (n: number) => (s.units[product.unit] ?? s.units.item)[n === 1 ? 0 : 1];
  const fname = (code: string) => s.finishNames[code] ?? finishOf(code).name;
  const section = v.sec ? product.sections[v.sec] : undefined;
  const viewItem = useMemo(
    () => ({ id: product.id, kind: product.kind, rubber: product.rubber, spool: product.spool, mesh: product.mesh, w: v.w, h: v.h, t: v.t, section }),
    [product.id, product.kind, product.rubber, product.spool, product.mesh, v.w, v.h, v.t, section],
  );
  const showFinishPicker = !(v.fin.length === 1 && (v.fin[0] === "NA" || v.fin[0] === "RB"));
  const inQuote = lines.filter((l) => l.code === v.code).reduce((n, l) => n + l.qty, 0);
  const views: { id: Mode; label: string }[] = [
    { id: "3d", label: s.view3d },
    ...(section ? [{ id: "section" as const, label: s.viewSection }] : []),
    ...(product.photo ? [{ id: "photo" as const, label: s.viewPhoto }] : []),
  ];

  const add = () => {
    quote.add({
      pid: product.id,
      code: v.code,
      name: product.nameEn,
      label: product.variants.length > 1 ? v.label : undefined,
      finish: activeFinish,
      finishName: finishOf(activeFinish).name,
      qty,
      unit: product.unit,
    });
    setAdded(true);
    setToast({ code: v.code, qty });
    window.setTimeout(() => setAdded(false), 2000);
  };

  const seg = (active: boolean) =>
    `h-8 rounded-sm px-3 text-xs font-medium transition-colors ${active ? "bg-surface text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)]" : "text-muted hover:text-ink"}`;
  const note = product.note === "section" ? s.noteSection : product.note === "standin" ? s.noteStandin : s.noteModel;

  const specs: [string, string][] = [[s.suppliedAs, v.len], [s.soldIn, v.packText]];
  if (v.dims) specs.push([s.size, `${v.dims[0]} × ${v.dims[1]} mm`]);
  else if (product.sizeText) specs.push([s.size, product.sizeText]);
  if (v.label && product.variants.length > 1) specs.push([s.option, v.label]);

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="lg:sticky lg:top-24">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-tile">
            {mode === "3d" && !ready && (
              // eslint-disable-next-line @next/next/no-img-element -- local pre-rendered placeholder
              <img src={product.poster} alt={product.name} className="absolute inset-0 h-full w-full object-contain p-6" />
            )}
            {mode === "3d" && <LazyViewer item={viewItem} finish={activeFinish} autoRotate={spin} resetKey={resetKey} onInteract={() => setSpin(false)} onReady={() => setReady(true)} />}
            {mode === "section" && section && (
              <div className="absolute inset-0 p-8 md:p-12">
                <SectionDrawing section={section} finish={activeFinish} dims={v.dims} showDims className="h-full w-full text-ink" title={product.name} />
              </div>
            )}
            {mode === "photo" && product.photo && (
              // eslint-disable-next-line @next/next/no-img-element -- small local cut-out, already optimised webp
              <img src={product.photo} alt={product.name} className="absolute inset-0 h-full w-full object-contain p-10 mix-blend-multiply dark:mix-blend-normal" />
            )}
            <span className="absolute start-3 top-3 rounded-sm bg-surface px-2 py-0.5 font-mono text-xs" dir="ltr">
              {v.code}
            </span>
            {s.tag && <span className="absolute end-3 top-3 rounded-sm bg-accent px-1.5 py-0.5 text-[11px] font-medium text-accent-ink">{s.tag}</span>}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {views.length > 1 ? (
              <div className="flex rounded bg-surface-2 p-0.5" role="group">
                {views.map((x) => (
                  <button key={x.id} type="button" className={seg(mode === x.id)} aria-pressed={mode === x.id} onClick={() => setMode(x.id)}>
                    {x.label}
                  </button>
                ))}
              </div>
            ) : (
              <span />
            )}
            {mode === "3d" && (
              <div className="flex gap-1">
                <button type="button" className="grid size-8 place-items-center rounded border border-line text-muted hover:text-ink" onClick={() => setSpin((x) => !x)} aria-label={spin ? s.pause : s.rotate} title={spin ? s.pause : s.rotate}>
                  {spin ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button type="button" className="grid size-8 place-items-center rounded border border-line text-muted hover:text-ink" onClick={() => setResetKey((k) => k + 1)} aria-label={s.reset} title={s.reset}>
                  <ArrowCounterClockwise size={14} />
                </button>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            {note} {s.noteColour}
          </p>
        </div>
      </div>

      <div className="lg:col-span-5">
        <h1 className="text-2xl font-semibold leading-tight md:text-3xl">{product.name}</h1>
        <p className="mt-1 font-mono text-sm text-muted" dir="ltr">
          {v.code}
        </p>

        <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
          {specs.map(([k, val]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted">{k}</dt>
              <dd className="text-end font-medium">{val}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 rounded border border-line bg-surface-2 p-3 text-sm leading-relaxed">{s.price}</p>
        <a
          href={whatsappLink(fill(s.askMessage, { code: v.code, name: product.nameEn }))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded border border-line-strong text-[15px] font-medium hover:bg-surface-2 sm:w-auto sm:px-4"
        >
          <WhatsappLogo size={18} />
          {s.ask}
        </a>

        {product.variants.length > 1 && (
          <fieldset className="mt-6">
            <legend className="text-sm font-medium">{s.size}</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((x, i) => (
                <button
                  key={x.code}
                  type="button"
                  onClick={() => setVi(i)}
                  aria-pressed={i === vi}
                  className={`rounded border px-3 py-1.5 text-start text-sm transition-colors ${i === vi ? "border-accent bg-accent-soft" : "border-line-strong bg-surface hover:border-ink"}`}
                >
                  <span className="block" dir="ltr">{x.label}</span>
                  <span className="block font-mono text-[11px] text-muted" dir="ltr">{x.code}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {showFinishPicker && (
          <fieldset className="mt-6">
            <legend className="text-sm font-medium">
              {s.finish}: <span className="font-normal text-muted">{fname(activeFinish)}</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label={s.finish}>
              {v.fin.map((f) => (
                <button
                  key={f}
                  type="button"
                  role="radio"
                  aria-checked={f === activeFinish}
                  onClick={() => setFinish(f)}
                  title={fname(f)}
                  className={`flex items-center gap-2 rounded border py-1 pe-2.5 ps-1 text-sm transition-colors ${f === activeFinish ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong"}`}
                >
                  <span className="size-6 rounded-sm ring-1 ring-inset ring-line-strong" style={{ background: swatchBackground(f) }} />
                  <span>{fname(f)}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="sticky bottom-[calc(3.6rem+env(safe-area-inset-bottom))] z-10 -mx-4 mt-8 flex flex-wrap items-center gap-3 border-t border-line bg-bg px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:p-0">
          <div className="flex h-11 items-center rounded border border-line-strong">
            <button type="button" className="grid h-full w-10 place-items-center text-muted hover:text-ink" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={s.fewer}>
              <Minus size={14} />
            </button>
            <label className="sr-only" htmlFor="qty">
              {s.quantity}
            </label>
            <input
              id="qty"
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value.replace(/\D/g, ""), 10) || 1))}
              className="h-full w-12 bg-transparent text-center font-mono text-sm focus:outline-none"
            />
            <button type="button" className="grid h-full w-10 place-items-center text-muted hover:text-ink" onClick={() => setQty((q) => q + 1)} aria-label={s.more}>
              <Plus size={14} />
            </button>
          </div>
          <span className="text-sm text-muted">{unit(qty)}</span>
          <button
            type="button"
            onClick={add}
            className="ms-auto inline-flex h-11 flex-1 items-center justify-center gap-2 rounded bg-brand px-5 text-[15px] font-medium text-accent-ink transition-colors sm:flex-none"
          >
            {added ? <Check size={16} /> : <Plus size={16} />}
            {added ? s.added : s.add}
          </button>
        </div>
        {inQuote > 0 && (
          <p className="mt-3 text-sm text-muted">
            {fill(s.inQuote, { n: inQuote, unit: unit(inQuote), code: v.code })}{" "}
            <Link href={s.quoteHref} className="font-medium text-accent hover:underline">
              {s.reviewQuote}
            </Link>
          </p>
        )}
      </div>
      {toast && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-md bg-ink px-4 py-3 text-sm text-white shadow-lg sm:bottom-6"
        >
          <span className="flex items-center gap-2">
            <Check size={16} />
            <span>
              {s.added}: <span dir="ltr">{toast.qty} × {toast.code}</span> {product.name}
            </span>
          </span>
          <Link href={s.quoteHref} className="shrink-0 rounded bg-white/15 px-3 py-1.5 font-medium hover:bg-white/25">
            {s.reviewQuote}
          </Link>
        </div>
      )}
    </div>
  );
}
