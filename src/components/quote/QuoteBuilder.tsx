"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Camera, CheckCircle, Minus, Plus, Trash, WhatsappLogo, X } from "@phosphor-icons/react";
import { lineText, quote, useQuote } from "@/lib/quote-store";
import { clearDraft, prepareFile, takeDraft, type DraftPhoto } from "@/lib/quote-draft";
import type { QuoteRequest } from "@/lib/quote-request";
import { swatchBackground } from "@/lib/finishes";
import { SITE, whatsappLink } from "@/lib/site";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";

interface Details {
  name: string;
  company: string;
  phone: string;
  suburb: string;
  delivery: "deliver" | "collect";
  notes: string;
  website: string; // honeypot
}

const EMPTY: Details = { name: "", company: "", phone: "", suburb: "", delivery: "deliver", notes: "", website: "" };
const fill = (t: string, vars: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

type Status = "idle" | "sending" | "sent" | "failed" | "not_ready";

interface Props {
  lang: Locale;
  q: Dictionary["quote"];
  units: Record<string, string[]>;
  finishNames: Record<string, string>;
  /** Product code to name in the page language, for display only. */
  localNames: Record<string, string>;
  productsHref: string;
}

// One simple flow: what you need (catalogue items, typed list or a photo), your details, Send.
// The request is emailed to YT by /api/quote; WhatsApp is offered only if sending is unavailable.
export function QuoteBuilder({ lang, q, units, finishNames, localNames, productsHref }: Props) {
  const lines = useQuote();
  // Rendered on the client only (see the page), so reading the hand-off from the home page here is safe.
  const [draft] = useState(takeDraft);
  const [list, setList] = useState(draft.list ?? "");
  const [photo, setPhoto] = useState<DraftPhoto | null>(draft.photo ?? null);
  const [photoError, setPhotoError] = useState(false);
  const [details, setDetails] = useState<Details>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [sentName, setSentName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const unit = (u: string, n: number) => (units[u] ?? units.item)[n === 1 ? 0 : 1];
  const set = <K extends keyof Details>(k: K, v: Details[K]) => setDetails((d) => ({ ...d, [k]: v }));
  const missingName = !details.name.trim();
  const missingPhone = !details.phone.trim();
  const empty = !lines.length && !list.trim() && !photo;

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(false);
    const prepared = await prepareFile(file);
    if (prepared) setPhoto(prepared);
    else setPhotoError(true);
  };

  // Plain-text version for WhatsApp, used only when sending from the website is unavailable.
  const fallbackText = [
    "Quote request from ytaluminium.com",
    "",
    ...lines.map(lineText),
    ...(list.trim() ? ["", list.trim()] : []),
    "",
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    details.delivery === "collect" ? "Pick up from Milperra" : `Deliver to: ${details.suburb || "(suburb to confirm)"}`,
  ].join("\n");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (missingName || missingPhone || empty) return;
    setStatus("sending");
    const payload: QuoteRequest = {
      name: details.name,
      company: details.company,
      phone: details.phone,
      delivery: details.delivery,
      suburb: details.suburb,
      notes: details.notes,
      list,
      lines: lines.map(lineText),
      photo: photo ?? undefined,
      lang,
      website: details.website,
    };
    try {
      const res = await fetch("/api/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        setSentName(details.name.trim());
        setStatus("sent");
        quote.clear();
        clearDraft();
        setList("");
        setPhoto(null);
        setDetails(EMPTY);
        setTouched(false);
        return;
      }
      setStatus(res.status === 503 ? "not_ready" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-line bg-surface p-8 text-center md:p-12">
        <CheckCircle size={44} weight="light" className="mx-auto text-ink" />
        <h2 className="mt-4 text-2xl font-medium">{q.sentTitle}</h2>
        <p className="mt-2 text-muted">{fill(q.sentText, { name: sentName })}</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-8 inline-flex h-11 items-center rounded-full border border-line-strong px-5 text-[15px] hover:border-ink">
          {q.sentAgain}
        </button>
      </div>
    );
  }

  const input = "h-12 w-full rounded-lg border border-line-strong bg-surface px-4 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none aria-[invalid=true]:border-red-600";
  const label = "text-sm font-medium";

  return (
    <form onSubmit={send} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* 1. What you need */}
      <div className="space-y-8 lg:col-span-7">
        <section>
          <h2 className="text-xl font-medium">{q.listTitle}</h2>

          {lines.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted">{q.fromCatalogue}</p>
              <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-surface">
                {lines.map((l) => (
                  <li key={`${l.code}|${l.finish}`} className="flex flex-wrap items-center gap-4 p-4">
                    <span className="size-8 shrink-0 rounded ring-1 ring-inset ring-black/10" style={{ background: swatchBackground(l.finish) }} aria-hidden />
                    <div className="min-w-0 flex-1 basis-48">
                      <p className="text-sm font-medium leading-snug">
                        <span className="font-mono" dir="ltr">{l.code}</span> {localNames[l.code] ?? l.name}
                        {l.label && <span className="text-muted" dir="ltr"> {l.label}</span>}
                      </p>
                      <p className="text-sm text-muted">{finishNames[l.finish] ?? l.finishName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 items-center rounded-full border border-line-strong">
                        <button type="button" className="grid h-full w-8 place-items-center text-muted hover:text-ink" onClick={() => quote.setQty(l, l.qty - 1)} aria-label={fill(q.qtyOf, { code: l.code })}>
                          <Minus size={12} />
                        </button>
                        <input
                          inputMode="numeric"
                          aria-label={l.code}
                          value={l.qty}
                          onChange={(e) => quote.setQty(l, parseInt(e.target.value.replace(/\D/g, ""), 10) || 1)}
                          className="h-full w-9 bg-transparent text-center font-mono text-sm focus:outline-none"
                        />
                        <button type="button" className="grid h-full w-8 place-items-center text-muted hover:text-ink" onClick={() => quote.setQty(l, l.qty + 1)} aria-label={fill(q.qtyOf, { code: l.code })}>
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="w-16 text-sm text-muted">{unit(l.unit, l.qty)}</span>
                      <button type="button" onClick={() => quote.remove(l)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label={fill(q.remove, { code: l.code })}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <label htmlFor="q-list" className={label}>
              {q.typeLabel}
            </label>
            <p id="q-list-help" className="text-sm text-muted">
              {q.typeHelp}
            </p>
            <textarea
              id="q-list"
              aria-describedby="q-list-help"
              rows={5}
              value={list}
              onChange={(e) => setList(e.target.value)}
              placeholder={q.typePlaceholder}
              className="w-full rounded-lg border border-line-strong bg-surface p-4 text-[15px] text-ink placeholder:text-muted focus:border-ink focus:outline-none"
            />
          </div>

          <div className="mt-4">
            {photo ? (
              <div className="flex items-center gap-4 rounded-lg border border-line bg-surface p-3">
                {photo.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen photo
                  <img src={photo.dataUrl} alt="" className="size-16 rounded object-cover" />
                ) : (
                  <span className="grid size-16 place-items-center rounded bg-tile font-mono text-xs">PDF</span>
                )}
                <span className="min-w-0 flex-1 truncate text-sm">{photo.name}</span>
                <button type="button" onClick={() => setPhoto(null)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink" aria-label={q.photoRemove}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center gap-3 rounded-lg border border-dashed border-line-strong bg-surface px-4 py-4 text-start hover:border-ink"
              >
                <Camera size={22} className="shrink-0" />
                <span>
                  <span className="block text-[15px] font-medium">{q.photoAdd}</span>
                  <span className="block text-sm text-muted">{q.photoHint}</span>
                </span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,application/pdf" className="sr-only" tabIndex={-1} onChange={(e) => pickFile(e.target.files?.[0])} />
            {photoError && <p className="mt-2 text-sm text-red-700">{q.photoTooBig}</p>}
          </div>

          {touched && empty && <p className="mt-3 text-sm text-red-700">{q.needSomething}</p>}
          {!lines.length && (
            <Link href={productsHref} className="mt-4 inline-block text-sm text-muted underline underline-offset-4 hover:text-ink">
              {q.browse}
            </Link>
          )}
        </section>
      </div>

      {/* 2. Your details and Send */}
      <div className="lg:col-span-5">
        <section className="rounded-lg border border-line bg-surface p-5 md:p-7 lg:sticky lg:top-24">
          <h2 className="text-xl font-medium">{q.details}</h2>
          <div className="mt-5 grid gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-name" className={label}>{q.name}</label>
              <input id="q-name" className={input} value={details.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={touched && missingName} />
              {touched && missingName && <p className="text-sm text-red-700">{q.nameError}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-phone" className={label}>{q.phone}</label>
              <input id="q-phone" type="tel" dir="ltr" className={input} value={details.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" aria-invalid={touched && missingPhone} />
              {touched && missingPhone && <p className="text-sm text-red-700">{q.phoneError}</p>}
            </div>
            <fieldset>
              <legend className={label}>{q.delivery}</legend>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {(["deliver", "collect"] as const).map((opt) => (
                  <label
                    key={opt}
                    className={`flex h-12 cursor-pointer items-center justify-center rounded-full border px-3 text-center text-sm ${details.delivery === opt ? "border-ink bg-ink text-white" : "border-line-strong hover:border-ink"}`}
                  >
                    <input type="radio" name="delivery" value={opt} className="sr-only" checked={details.delivery === opt} onChange={() => set("delivery", opt)} />
                    {opt === "deliver" ? q.deliver : q.collect}
                  </label>
                ))}
              </div>
            </fieldset>
            {details.delivery === "deliver" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="q-suburb" className={label}>{q.suburb}</label>
                <input id="q-suburb" className={input} value={details.suburb} onChange={(e) => set("suburb", e.target.value)} autoComplete="address-level2" />
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-company" className={label}>
                {q.company} <span className="font-normal text-muted">({q.optional})</span>
              </label>
              <input id="q-company" className={input} value={details.company} onChange={(e) => set("company", e.target.value)} autoComplete="organization" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="q-notes" className={label}>
                {q.notes} <span className="font-normal text-muted">({q.optional})</span>
              </label>
              <textarea id="q-notes" rows={2} className={`${input} h-auto py-3`} value={details.notes} onChange={(e) => set("notes", e.target.value)} placeholder={q.notesPlaceholder} />
            </div>
            {/* Honeypot: hidden from people, filled in by bots. */}
            <input type="text" name="website" value={details.website} onChange={(e) => set("website", e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-ink text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {status === "sending" ? q.sending : q.send}
          </button>

          {(status === "failed" || status === "not_ready") && (
            <div className="mt-4 rounded-lg bg-surface-2 p-4 text-sm" role="alert">
              <p>{status === "not_ready" ? q.notReady : q.sendFailed}</p>
              <a href={whatsappLink(fallbackText)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-medium underline underline-offset-4">
                <WhatsappLogo size={16} />
                {q.whatsappFallback}
              </a>
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-muted">{fill(q.footnote, { phone: SITE.phone })}</p>
        </section>
      </div>
    </form>
  );
}
