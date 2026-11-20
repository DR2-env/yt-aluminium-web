"use client";

import dynamic from "next/dynamic";

// The quote form reads the browser's saved list and the hand-off from the home page box,
// so it only renders in the browser. This avoids a flash of the wrong content on load.
export const QuoteBuilderClient = dynamic(() => import("./QuoteBuilder").then((m) => m.QuoteBuilder), {
  ssr: false,
  loading: () => <div className="h-[520px] rounded-lg border border-line bg-surface/60" aria-hidden />,
});
