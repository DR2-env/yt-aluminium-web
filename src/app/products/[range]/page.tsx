import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react/ssr";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { RANGES, getRange, productsInRange, rangeHref } from "@/lib/catalogue";

// Every valid path is prerendered from the price list, so a blocking shell is fine here.
export const instant = false;

export function generateStaticParams() {
  return RANGES.map((r) => ({ range: r.id }));
}

export async function generateMetadata({ params }: PageProps<"/products/[range]">): Promise<Metadata> {
  const { range } = await params;
  const r = getRange(range);
  if (!r) return {};
  return { title: r.name, description: r.blurb };
}

export default async function RangePage({ params }: PageProps<"/products/[range]">) {
  const { range } = await params;
  const r = getRange(range);
  if (!r) notFound();
  const products = productsInRange(r);

  // Keep price-list grouping (frames, beads, hinges...) where the range has it.
  const groups: { name: string; items: typeof products }[] = [];
  for (const p of products) {
    const name = p.grp ?? "";
    const g = groups.find((x) => x.name === name);
    if (g) g.items.push(p);
    else groups.push({ name, items: [p] });
  }

  const idx = RANGES.findIndex((x) => x.id === r.id);
  const next = RANGES[(idx + 1) % RANGES.length];

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 pt-8 md:px-8 md:pt-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
        <Link href="/products" className="hover:text-ink">Products</Link>
        <CaretRight size={12} />
        <span className="text-ink">{r.name}</span>
      </nav>
      <h1 className="mt-6 text-4xl font-semibold tracking-tighter md:text-6xl">{r.name}</h1>
      <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">{r.blurb}</p>

      {groups.map((g) => (
        <section key={g.name || "all"} className="mt-12">
          {g.name && groups.length > 1 && <h2 className="mb-5 text-lg font-semibold tracking-tight">{g.name}</h2>}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
            {g.items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ))}

      <Link href={rangeHref(next)} className="group mt-20 flex items-center justify-between rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-strong md:p-8">
        <span>
          <span className="block text-sm text-muted">Next range</span>
          <span className="mt-1 block text-xl font-semibold tracking-tight md:text-2xl">{next.name}</span>
        </span>
        <CaretRight size={22} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
      </Link>
    </div>
  );
}
