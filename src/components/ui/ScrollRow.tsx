"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

/**
 * Horizontal row that scrolls, with arrow buttons and a fade on whichever side has more
 * content, so people can see there is more to the left or right. Works in right-to-left too.
 */
export function ScrollRow({ children, className = "", label }: { children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    // In RTL, scrollLeft runs from 0 down to negative values.
    const pos = rtl ? -el.scrollLeft : el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: pos > 4, end: pos < max - 4 });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const nudge = (towardsEnd: boolean) => {
    const el = ref.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const step = el.clientWidth * 0.7 * (towardsEnd ? 1 : -1);
    el.scrollBy({ left: rtl ? -step : step, behavior: "smooth" });
  };

  const arrow = "absolute top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full border border-line-strong bg-surface text-ink shadow-sm";
  return (
    <div className={`relative min-w-0 ${className}`}>
      <div ref={ref} className="scroll-row flex gap-2 overflow-x-auto">
        {children}
      </div>
      {edges.start && (
        <>
          <span className="pointer-events-none absolute inset-y-0 start-0 w-12 bg-gradient-to-r from-bg to-transparent rtl:bg-gradient-to-l" aria-hidden />
          <button type="button" className={`${arrow} start-0`} onClick={() => nudge(false)} aria-label={`${label} ‹`}>
            <CaretLeft size={14} className="rtl:-scale-x-100" />
          </button>
        </>
      )}
      {edges.end && (
        <>
          <span className="pointer-events-none absolute inset-y-0 end-0 w-12 bg-gradient-to-l from-bg to-transparent rtl:bg-gradient-to-r" aria-hidden />
          <button type="button" className={`${arrow} end-0`} onClick={() => nudge(true)} aria-label={`${label} ›`}>
            <CaretRight size={14} className="rtl:-scale-x-100" />
          </button>
        </>
      )}
    </div>
  );
}
