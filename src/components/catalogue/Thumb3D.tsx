"use client";

import { useEffect, useRef, useState } from "react";
import type { ViewItem } from "@/components/three/scene";

interface Props {
  thumbKey: string;
  item: ViewItem;
  finish: string;
  alt: string;
}

// Renders a 3D picture only when the card scrolls near the viewport, so three.js loads lazily.
export function Thumb3D({ thumbKey, item, finish, alt }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        import("@/components/three/thumbs").then(({ renderThumb }) => {
          if (!cancelled) setSrc(renderThumb(thumbKey, item, finish));
        });
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [thumbKey, item, finish]);

  return (
    <div ref={ref} className="grid h-full w-full place-items-center">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- generated data URL, not a remote image
        <img src={src} alt={alt} className="h-full w-full object-contain" />
      ) : (
        <div className="h-3/5 w-3/5 animate-pulse rounded-2xl bg-surface-2" aria-hidden />
      )}
    </div>
  );
}
