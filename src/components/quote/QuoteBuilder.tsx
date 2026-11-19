"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ClipboardText, Copy, EnvelopeSimple, Minus, Plus, Trash, WhatsappLogo } from "@phosphor-icons/react";
import { lineText, quote, useQuote, type QuoteLine } from "@/lib/quote-store";
import { unitLabel } from "@/lib/units";
import { finishOf } from "@/lib/finishes";
import { SITE, mailtoLink, whatsappLink } from "@/lib/site";

/** Lightweight lookup the page passes in, so the paste box can recognise codes. */
export interface CodeEntry {
  code: string;
  pid: string;
  name: string;
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
    if (!key) {
      missed.push(line);
      continue;
    }
    const entry = byCode.get(key);
    if (!entry) continue;
    const rest = line.toUpperCase().replace(new RegExp(key.replace(/[/.]/g, "\\$&").split("").join("\\s*"), "i"), " ");
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

export function QuoteBuilder({ codes }: { codes: CodeEntry[] }) {
  const lines = useQuote();
  const [details, setDetails] = useState<Details>(EMPTY_DETAILS);
  const [paste, setPaste] = useState("");
  const [pasteResult, setPasteResult] = useState<{ added: number; missed: string[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);

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
    "h-11 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none aria-[invalid=true]:border-accent";

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        {lines.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong p-10 text-center">
            <ClipboardText size={32} className="mx-auto text-muted" />
            <p className="mt-4 text-lg font-semibold">Your quote list is empty</p>
            <p className="mx-auto mt-2 max-w-sm text-muted">Add items from the catalogue, or paste the codes you already have in the box below.</p>
            <Link href="/products" className="mt-6 inline-flex h-11 items-center rounded-lg bg-ink px-5 text-sm font-semibold text-bg">
              Browse products
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {lines.map((l) => (
              <li key={`${l.code}|${l.finish}`} className="flex flex-wrap items-center gap-4 p-4">
                <span className="size-9 shrink-0 rounded-md ring-1 ring-inset ring-line-strong" style={{ background: finishOf(l.finish).css ?? finishOf(l.finish).hex }} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-snug">
                    <span className="font-mono text-sm">{l.code}</span> {l.name}
                    {l.label && <span className="text-muted"> {l.label}</span>}
                  </p>
                  <p className="text-sm text-muted">{l.finishName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 items-center rounded-lg border border-line-strong">
                    <button type="button" className="grid h-full w-9 place-items-center text-muted hover:text-ink" onClick={() => quote.setQty(l, l.qty - 1)} aria-label={`Fewer ${l.code}`}>
                      <Minus size={14} weight="bold" />
                    </button>
                    <input
                      inputMode="numeric"
                      aria-label={`Quantity of ${l.code}`}
                      value={l.qty}
                      onChange={(e) => quote.setQty(l, parseInt(e.target.value.replace(/\D/g, ""), 10) || 1)}
                      className="h-full w-10 bg-transparent text-center font-mono font-semibold focus:outline-none"
                    />
                    <button type="button" className="grid h-full w-9 place-items-center text-muted hover:text-ink" onClick={() => quote.setQty(l, l.qty + 1)} aria-label={`More ${l.code}`}>
                      <Plus size={14} weight="bold" />
                    </button>
                  </div>
                  <span className="w-14 text-sm text-muted">{unitLabel(l.unit, l.qty)}</span>
                  <button type="button" onClick={() => quote.remove(l)} className="grid size-10 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink" aria-label={`Remove ${l.code}`}>
                    <Trash size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 rounded-2xl border border-line bg-surface p-5 md:p-6">
          <label htmlFor="paste" className="text-sm font-semibold">
            Paste a list of codes
          </label>
          <p id="paste-help" className="mt-1 text-sm text-muted">
            One item per line, with a quantity and optional colour code. For example: AU014 x4 MM
          </p>
          <textarea
            id="paste"
            aria-describedby="paste-help"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            rows={4}
            placeholder={"AU014 x4 MM\nAU045 x2 BK\nFM9150 x1"}
            className="mt-3 w-full rounded-lg border border-line-strong bg-bg p-3 font-mono text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={addPasted} disabled={!paste.trim()} className="inline-flex h-10 items-center rounded-lg border border-line-strong bg-surface px-4 text-sm font-semibold hover:border-ink disabled:opacity-50">
              Add to list
            </button>
            {pasteResult && (
              <p className="text-sm text-muted" aria-live="polite">
                Added {pasteResult.added} {pasteResult.added === 1 ? "item" : "items"}.
                {pasteResult.missed.length > 0 && <span className="text-accent"> Not recognised: {pasteResult.missed.join(", ")}</span>}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-5">
        <form className="rounded-2xl border border-line bg-surface p-5 md:p-6 lg:sticky lg:top-24" onSubmit={(e) => e.preventDefault()} noValidate>
          <h2 className="text-lg font-semibold tracking-tight">Your details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="q-name" className="text-sm font-medium">Name</label>
              <input id="q-name" className={input} value={details.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={touched && missingName} />
              {touched && missingName && <p className="text-xs text-accent">Add your name so we know who to reply to.</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="q-company" className="text-sm font-medium">Company <span className="font-normal text-muted">(optional)</span></label>
              <input id="q-company" className={input} value={details.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="q-phone" className="text-sm font-medium">Phone</label>
              <input id="q-phone" type="tel" className={input} value={details.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" aria-invalid={touched && missingPhone} />
              {touched && missingPhone && <p className="text-xs text-accent">Add a phone number so we can confirm the order.</p>}
            </div>
            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-medium">Delivery</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["deliver", "collect"] as const).map((opt) => (
                  <label key={opt} className={`flex h-11 cursor-pointer items-center justify-center rounded-lg border text-sm font-medium ${details.delivery === opt ? "border-ink bg-ink text-bg" : "border-line-strong hover:border-ink"}`}>
                    <input type="radio" name="delivery" value={opt} className="sr-only" checked={details.delivery === opt} onChange={() => set("delivery", opt)} />
                    {opt === "deliver" ? "Deliver to site" : "Pick up in Milperra"}
                  </label>
                ))}
              </div>
            </fieldset>
            {details.delivery === "deliver" && (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <label htmlFor="q-suburb" className="text-sm font-medium">Delivery suburb</label>
                <input id="q-suburb" className={input} value={details.suburb} onChange={(e) => set("suburb", e.target.value)} autoComplete="address-level2" />
              </div>
            )}
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label htmlFor="q-notes" className="text-sm font-medium">Notes <span className="font-normal text-muted">(optional)</span></label>
              <textarea id="q-notes" rows={3} className={`${input} h-auto py-2.5`} value={details.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Job name, deadline, cutting requirements" />
            </div>
          </div>

          <div className="mt-6 grid gap-2">
            <a
              href={whatsappLink(message)}
              onClick={guard}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!lines.length}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-accent text-[15px] font-semibold text-accent-ink transition-[background-color,transform] hover:bg-accent-hover active:translate-y-px aria-disabled:opacity-50"
            >
              <WhatsappLogo size={20} weight="bold" />
              Send on WhatsApp
            </a>
            <div className="grid grid-cols-2 gap-2">
              <a
                href={mailtoLink(`Quote request${details.company ? `, ${details.company}` : ""}`, message)}
                onClick={guard}
                aria-disabled={!lines.length}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line-strong text-sm font-semibold hover:border-ink aria-disabled:opacity-50"
              >
                <EnvelopeSimple size={18} weight="bold" />
                Email
              </a>
              <button type="button" onClick={copy} disabled={!lines.length} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-line-strong text-sm font-semibold hover:border-ink disabled:opacity-50">
                {copied ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
                {copied ? "Copied" : "Copy for WeChat"}
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            We reply with trade pricing, usually the same business day. Prefer to talk? Call {SITE.phone}.
          </p>
          {lines.length > 0 && (
            <button type="button" onClick={() => quote.clear()} className="mt-4 text-xs font-medium text-muted underline underline-offset-4 hover:text-ink">
              Clear the list
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
