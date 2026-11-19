import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/catalogue";
import { COLOUR_CODES, finishOf, swatchBackground } from "@/lib/finishes";

export const metadata: Metadata = {
  title: "Finishes",
  description: "The 19 powder coat, anodised, mill and timber-look finishes YT Aluminium stocks, and how many products come in each.",
};

export default function FinishesPage() {
  const products = Object.values(PRODUCTS);
  const count = (code: string) =>
    products.filter((p) => p.fin.includes(code) || p.variants?.some((v) => v.fin?.includes(code))).length;
  const groups = [
    { title: "Mill and anodised", codes: COLOUR_CODES.filter((c) => ["Mill finish", "Anodised"].includes(finishOf(c).type)) },
    { title: "Powder coat", codes: COLOUR_CODES.filter((c) => finishOf(c).type.includes("owder coat")) },
    { title: "Timber look", codes: COLOUR_CODES.filter((c) => finishOf(c).type === "Timber finish") },
  ];

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 pt-10 md:px-8 md:pt-14">
      <h1 className="text-4xl font-semibold tracking-tighter md:text-6xl">Finishes</h1>
      <p className="mt-4 max-w-[60ch] text-muted">
        Not every product comes in every colour. Each product page shows the finishes we stock for that item. Screen colours are a guide, so ask for a physical sample before you commit to a job.
      </p>
      {groups.map((g) => (
        <section key={g.title} className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{g.title}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
            {g.codes.map((code) => {
              const f = finishOf(code);
              return (
                <div key={code} className="overflow-hidden rounded-2xl border border-line bg-surface">
                  <div className="aspect-[4/3]" style={{ background: swatchBackground(code) }} />
                  <div className="p-4">
                    <p className="font-semibold tracking-tight">{f.name}</p>
                    <p className="mt-0.5 text-sm text-muted">{f.type}</p>
                    <p className="mt-3 flex items-center justify-between font-mono text-xs text-muted">
                      <span>{code}</span>
                      <span>{count(code)} products</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
