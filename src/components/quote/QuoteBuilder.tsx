"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, EnvelopeSimple, Minus, Plus, Trash, WhatsappLogo } from "@phosphor-icons/react";
import { lineText, quote, useQuote, type QuoteLine } from "@/lib/quote-store";
import { finishOf, swatchBackground } from "@/lib/finishes";
import { SITE, mailtoLink, whatsappLink } from "@/lib/site";
import type { Dictionary } from "@/i18n/dictionaries/en";

/** Lookup the page passes in so the paste box can recognise codes. */
export interface CodeEntry {
  code: string;
  pid: string;
  /** English name: the message to YT always uses English so it maps to MYOB. */
  name: string;
  /** Name in the page language, for display. */
  localName: string;
  label?: string;
  fin: string[];
  unit: string;
  multi: boolean;
}

interface Details {
  name: string;
  company: string;
  phone: string;
  suburb: string;
  delivery: "deliver" | "collect";
  notes: string;
}

const EMPTY_DETAILS: Details = { name: "", company: "", phone: "", suburb: "", delivery: "deliver", notes: "" };
const fill = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

// Turns "AU014 x4 MM", "4 x au014", "AU014 - 4 lengths" into quote lines.
function parseList(text: string, codes: CodeEntry[]) {
  const byCode = new Map(codes.map((c) => [c.code.toUpperCase().replace(/\s+/g, ""), c]));
  const sorted = [...byCode.keys()].sort((a, b) => b.length - a.length);
  const found: QuoteLine[] = [];
  const missed: string[] = [];
  for (const rawLine of text.split(/\n|;/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const compact = line.toUpperCase().replace(/\s+/g, "");
    const key = sorted.find((k) => compact.includes(k));
    const entry = key ? byCode.get(key) : undefined;
    if (!key || !entry) {
      missed.push(line);
      continue;
    }
    const codePattern = key.replace(/[/.]/g, "\\$&").split("").join("\\s*");
    const rest = line.toUpperCase().replace(new RegExp(codePattern, "i"), " ");
    const qtyMatch = /(?:X\s*|QTY\s*|^|\s)(\d{1,4})(?:\s*X)?(?=\s|$|[A-Z])/.exec(rest);
    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
    const finCode = entry.fin.find((f) => new RegExp(`\\b${f}\\b`).test(rest) || rest.includes(finishOf(f).name.toUpperCase()));
    const finish = finCode ?? (entry.fin.includes("MM") ? "MM" : entry.fin[0]);
    found.push({
      pid: entry.pid,
      code: entry.code,
      name: entry.name,
      label: entry.multi ? entry.label : undefined,
      finish,
      finishName: finishOf(finish).name,
      qty: Math.max(1, qty),
      unit: entry.unit,
    });
  }
  return { found, missed };
}

interface Props {
  codes: CodeEntry[];
  q: Dictionary["quote"];
  units: Record<string, string[]>;
  finishNames: Record<string, string>;
  productsHref: string;
}

export function QuoteBuilder({ codes, q, units, finishNames, productsHref }: Props) {
  const lines = useQuote();
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [paste, setPaste] = useState("");
  const [pasteResult, setPasteResult] = useState<{ added: number; missed: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);

  const localName = new Map(codes.map((c) => [c.code, c.localName]));
  const unit = (u: string, n: number) => (units[u] ?? units.item)[n === 1 ? 0 : 1];
  const set = <K extends keyof Details>(k: K, v: Details[K]) => setDetails((d) => ({ ...d, [k]: v }));
  const missingName = !details.name.trim();
  const missingPhone = !details.phone.trim();

  const contactLines = [
    `Name: ${details.name}`,
    details.company ? `Company: ${details.company}` : null,
    `Phone: ${details.phone}`,
    details.delivery === "collect" ? "Pick up from Milperra" : `Deliver to: ${details.suburb || "(suburb to confirm)"}`,
    details.notes ? `Notes: ${details.notes}` : null,
  ].filter((l): l is string => l !== null);
  const message = ["Quote request from ytaluminium.com", "", ...lines.map(lineText), "", ...contactLines].join("\n");

  const guard = (e: React.MouseEvent) => {
    setTouched(true);
    if (missingName || missingPhone || !lines.length) {
      e.preventDefault();
      document.getElementById(missingName ? "q-name" : "q-phone")?.focus();
      return false;
    }
    return true;
  };

  const copy = async (e: React.MouseEvent) => {
    if (!guard(e)) return;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const addPasted = () => {
    const { found, missed } = parseList(paste, codes);
    found.forEach((l) => quote.add(l));
    setPasteResult({ added: found.length, missed });
    if (found.length && !missed.length) setPaste("");
  };

  const input =
    "h-10 w-full rounded border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none aria-[invalid=true]:border-red-600";
  const label = "text-sm font-medium";

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        {lines.length === 0 ? (
          <div className="rounded-md border border-line bg-surface-2 p-10 text-center">
            <p className="font-medium">{q.empty}</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{q.emptyText}</p>
            <Link href={productsHref} className="mt-5 inline-flex h-10 items-center rounded bg-accent px-4 text-sm font-medium text-accent-ink hover:bg-accent-hover">
              {q.browse}
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line rounded-md border border-line bg-surface">
            {lines.map((l) => (
              <li key={`${l.code}|${l.finish}`} className="flex flex-wrap items-center gap-4 p-4">
                <span className="size-8 shrink-0 rounded-sm ring-1 ring-inset ring-line-strong" style={{ background: swatchBackground(l.finish) }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">
                    <span className="font-mono" dir="ltr">{l.code}</span> {localName.get(l.code) ?? l.name}
                    {l.label && <span className="text-muted" dir="ltr"> {l.label}</span>}
                  </p>
                  <p className="text-sm text-muted">{finishNames[l.finish] ?? l.finishName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 items-center rounded border border-line-strong">
                    <button type="button" className="grid h-full w-8 place-items-center text-muted hover:text-ink" onClick={() => quote.setQty(l, l.qty - 1)} aria-label={fill(q.qtyOf, { code: l.code })}>
                      <Minus size={12} />
                    </button>
                    <input
                      inputMode="numeric"
                      aria-label={fill(q.qtyOf, { code: l.code })}
                      value={l.qty}
                      onChange={(e) => quote.setQty(l, parseInt(e.target.value.replace(/\D/g, ""), 10) || 1)}
                      className="h-full w-10 bg-transparent text-center font-mono text-sm focus:outline-none"
                    />
                    <button type="button" className="grid h-full w-8 place-items-center text-muted hover:text-ink" onClick={() => quote.setQty(l, l.qty + 1)} aria-label={fill(q.qtyOf, { code: l.code })}>
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="w-16 text-sm text-muted">{unit(l.unit, l.qty)}</span>
                  <button type="button" onClick={() => quote.remove(l)} className="grid size-9 place-items-center rounded text-muted hover:bg-surface-2 hover:text-ink" aria-label={fill(q.remove, { code: l.code })}>
                    <Trash size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 rounded-md border border-line p-5">
          <label htmlFor="paste" className={label}>
            {q.pasteLabel}
          </label>
          <p id="paste-help" className="mt-1 text-sm text-muted">
            {q.pasteHelp}
          </p>
          <textarea
            id="paste"
            aria-describedby="paste-help"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={4}
            dir="ltr"
            placeholder={"AU014 x4 MM\nAU045 x2 BK\nFM9150 x1"}
            className="mt-3 w-full rounded border border-line-strong bg-surface p-3 font-mono text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={addPasted} disabled={!paste.trim()} className="inline-flex h-9 items-center rounded border border-line-strong px-3 text-sm font-medium hover:bg-surface-2 disabled:opacity-50">
              {q.pasteButton}
            </button>
            {pasteResult && (
              <p className="text-sm text-muted" aria-live="polite">
                {fill(q.pasteAdded, { n: pasteResult.added })}
                {pasteResult.missed.length > 0 && <span className="text-red-700 dark:text-red-400"> {fill(q.pasteMissed, { list: pasteResult.missed.join(", ") })}</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <form className="rounded-md border border-line p-5 lg:sticky lg:top-24" onSubmit={(e) => e.preventDefault()} noValidate>
          <h2 className="text-base font-semibold">{q.details}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-name" className={label}>{q.name}</label>
              <input id="q-name" className={input} value={details.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={touched && missingName} />
              {touched && missingName && <p className="text-xs text-red-700 dark:text-red-400">{q.nameError}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-company" className={label}>
                {q.company} <span className="font-normal text-muted">({q.optional})</span>
              </label>
              <input id="q-company" className={input} value={details.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="q-phone" className={label}>{q.phone}</label>
              <input id="q-phone" type="tel" dir="ltr" className={input} value={details.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" aria-invalid={touched && missingPhone} />
              {touched && missingPhone && <p className="text-xs text-red-700 dark:text-red-400">{q.phoneError}</p>}
            </div>
            <fieldset className="sm:col-span-2">
              <legend className={label}>{q.delivery}</legend>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(["deliver", "collect"] as const).map((opt) => (
                  <label key={opt} className={`flex h-10 cursor-pointer items-center justify-center rounded border px-2 text-center text-sm ${details.delivery === opt ? "border-accent bg-accent-soft font-medium" : "border-line-strong hover:bg-surface-2"}`}>
                    <input type="radio" name="delivery" value={opt} className="sr-only" checked={details.delivery === opt} onChange={() => set("delivery", opt)} />
                    {opt === "deliver" ? q.deliver : q.collect}
                  </label>
                ))}
              </div>
            </fieldset>
            {details.delivery === "deliver" && (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="q-suburb" className={label}>{q.suburb}</label>
                <input id="q-suburb" className={input} value={details.suburb} onChange={(e) => set("suburb", e.target.value)} autoComplete="address-level2" />
              </div>
            )}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="q-notes" className={label}>
                {q.notes} <span className="font-normal text-muted">({q.optional})</span>
              </label>
              <textarea id="q-notes" rows={3} className={`${input} h-auto py-2`} value={details.notes} onChange={(e) => set("notes", e.target.value)} placeholder={q.notesPlaceholder} />
            </div>
          </div>

          <div className="mt-5 grid gap-2">
            <a
              href={whatsappLink(message)}
              onClick={guard}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!lines.length}
              className="inline-flex h-11 items-center justify-center gap-2 rounded bg-accent text-sm font-medium text-accent-ink hover:bg-accent-hover aria-disabled:opacity-50"
            >
              <WhatsappLogo size={18} />
              {q.sendWhatsapp}
            </a>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={mailtoLink(`Quote request${details.company ? `, ${details.company}` : ""}`, message)}
                onClick={guard}
                aria-disabled={!lines.length}
                className="inline-flex h-10 items-center justify-center gap-2 rounded border border-line-strong text-sm font-medium hover:bg-surface-2 aria-disabled:opacity-50"
              >
                <EnvelopeSimple size={16} />
                {q.sendEmail}
              </a>
              <button type="button" onClick={copy} disabled={!lines.length} className="inline-flex h-10 items-center justify-center gap-2 rounded border border-line-strong text-sm font-medium hover:bg-surface-2 disabled:opacity-50">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? q.copied : q.copy}
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">{fill(q.footnote, { phone: SITE.phone })}</p>
          {lines.length > 0 && (
            <button type="button" onClick={() => quote.clear()} className="mt-3 text-xs text-muted underline underline-offset-4 hover:text-ink">
              {q.clear}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
