"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Camera } from "@phosphor-icons/react";
import { prepareFile, saveDraft } from "@/lib/quote-draft";

interface Props {
  quoteHref: string;
  label: string;
  placeholder: string;
  button: string;
  photo: string;
  photoHint: string;
  photoTooBig: string;
}

// Home page box: type a list or pick a photo, then carry it to the quote page to add contact details.
export function HeroRequest({ quoteHref, label, placeholder, button, photo, photoHint, photoTooBig }: Props) {
  const router = useRouter();
  const [list, setList] = useState("");
  const [busy, setBusy] = useState(false);
  const [tooBig, setTooBig] = useState(false);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (list.trim()) saveDraft({ list: list.trim() });
    router.push(quoteHref);
  };

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setTooBig(false);
    const prepared = await prepareFile(file);
    setBusy(false);
    if (!prepared) {
      setTooBig(true);
      return;
    }
    saveDraft({ list: list.trim() || undefined, photo: prepared });
    router.push(quoteHref);
  };

  return (
    <form onSubmit={go} className="rounded-2xl border border-line-strong bg-surface p-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)] focus-within:border-ink">
      <label htmlFor="hero-ask" className="sr-only">
        {label}
      </label>
      <textarea
        id="hero-ask"
        rows={2}
        value={list}
        onChange={(e) => setList(e.target.value)}
        placeholder={`${label} ${placeholder}`}
        className="block w-full resize-none bg-transparent px-3 pt-2 text-base text-ink placeholder:text-muted focus:outline-none"
      />
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <label className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-3 text-sm text-muted hover:bg-surface-2 hover:text-ink ${busy ? "opacity-60" : ""}`}>
          <Camera size={18} />
          <span>{photo}</span>
          <span className="hidden text-xs sm:inline">({photoHint})</span>
          <input type="file" accept="image/*,application/pdf" className="sr-only" disabled={busy} onChange={(e) => pick(e.target.files?.[0])} />
        </label>
        <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-medium text-white transition-opacity hover:opacity-90">
          {button}
          <ArrowRight size={16} className="rtl:-scale-x-100" />
        </button>
      </div>
      {tooBig && (
        <p className="px-3 pb-1 pt-2 text-sm text-red-700" role="alert">
          {photoTooBig}
        </p>
      )}
    </form>
  );
}
