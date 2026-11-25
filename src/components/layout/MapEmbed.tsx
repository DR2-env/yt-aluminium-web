"use client";

import { useState } from "react";

interface Props {
  src: string;
  title: string;
  address: string;
  loadLabel: string;
  note: string;
  directionsHref: string;
}

// Google Maps only loads when the visitor asks for it, so the site sets no third-party
// cookies by default (see the cookie policy). It also keeps the contact page light.
export function MapEmbed({ src, title, address, loadLabel, note, directionsHref }: Props) {
  const [show, setShow] = useState(false);
  if (show) {
    return <iframe title={title} src={src} className="block h-[360px] w-full md:h-[440px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />;
  }
  return (
    <div className="grid h-[260px] place-items-center bg-surface-2 px-6 text-center md:h-[320px]">
      <div>
        <p className="text-lg" dir="ltr">
          <a href={directionsHref} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
            {address}
          </a>
        </p>
        <button type="button" onClick={() => setShow(true)} className="mt-5 inline-flex h-11 items-center rounded-full border border-line-strong bg-surface px-5 text-[15px] font-medium hover:border-ink">
          {loadLabel}
        </button>
        <p className="mt-3 text-sm text-muted">{note}</p>
      </div>
    </div>
  );
}
