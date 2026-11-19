import type { Metadata } from "next";
import { QuoteBuilder, type CodeEntry } from "@/components/quote/QuoteBuilder";
import { PRODUCTS, resolveItem } from "@/lib/catalogue";

export const metadata: Metadata = {
  title: "Quote list",
  description: "Build a list of YT Aluminium codes and send it to us by WhatsApp, email or WeChat for trade pricing.",
};

export default function QuotePage() {
  const codes: CodeEntry[] = Object.values(PRODUCTS).flatMap((p) => {
    const n = p.variants?.length || 1;
    return Array.from({ length: n }, (_, i) => {
      const c = resolveItem(p, i);
      return { code: c.code, pid: p.id, name: p.name, label: c.label, fin: c.fin, unit: p.unit, multi: n > 1 };
    });
  });

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 pt-10 md:px-8 md:pt-14">
      <h1 className="text-4xl font-semibold tracking-tighter md:text-6xl">Quote list</h1>
      <p className="mt-4 max-w-[58ch] text-muted">
        Check quantities and colours, add your details, then send the list. Nothing is ordered until we confirm pricing with you.
      </p>
      <div className="mt-10">
        <QuoteBuilder codes={codes} />
      </div>
    </div>
  );
}
