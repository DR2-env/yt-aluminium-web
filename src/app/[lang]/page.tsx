import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { ProductVisual } from "@/components/catalogue/ProductVisual";
import { SectionDrawing } from "@/components/catalogue/SectionDrawing";
import { LinkButton } from "@/components/ui/Button";
import { PRODUCTS, RANGES, SECTIONS, productHref, productsInRange, rangeHref, resolveItem } from "@/lib/catalogue";
import { COLOUR_CODES, swatchBackground } from "@/lib/finishes";
import { whatsappLink } from "@/lib/site";
import { finishName, fmt, getDictionary, isLocale, localePath, tc } from "@/i18n";

function rangeCover(rangeId: string) {
  const range = RANGES.find((r) => r.id === rangeId);
  const products = range ? productsInRange(range) : [];
  const pick = products.find((p) => p.sec) ?? products[0];
  return pick ? resolveItem(pick) : null;
}

const wrap = "mx-auto max-w-[1280px] px-4 md:px-8";

// Sparse on purpose: hero, ranges, why customers choose YT, colours, one closing call to action.
// Detail (how to order, contact) lives on its own pages and in the footer.
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const p = (path: string) => localePath(lang, path);
  const hero = PRODUCTS.AU014;
  const heroSection = SECTIONS[hero.sec ?? "AU014"];
  // Pre-filled text stays in English so staff can read it.
  const sendListHref = whatsappLink(getDictionary("en").home.sendListMessage + " ");

  const actions = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <a
        href={sendListHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-[15px] font-medium"
      >
        <WhatsappLogo size={18} />
        {d.home.sendList}
      </a>
      <LinkButton href={p("/products")} variant="secondary" size="lg" className="h-12 bg-transparent px-6 text-[15px]">
        {d.home.viewProducts}
      </LinkButton>
    </div>
  );

  return (
    <>
      <section className="ambient">
        <div className={`${wrap} grid grid-cols-1 items-center gap-14 pb-24 pt-16 md:pb-32 md:pt-28 lg:grid-cols-12 lg:gap-10`}>
          <div className="lg:col-span-7">
            <h1 className="display text-balance text-[2.5rem] sm:text-6xl lg:text-[4.25rem]">{d.home.heroTitle}</h1>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted md:text-xl">{d.home.heroText}</p>
            <div className="mt-10">{actions}</div>
          </div>

          <Link href={p(productHref(hero))} className="group block lg:col-span-5" aria-label={`${hero.code} ${tc(lang, hero.name)}`}>
            <div className="rounded-lg border border-line bg-surface/70 p-6 backdrop-blur-sm transition-colors group-hover:border-line-strong md:p-8">
              <SectionDrawing section={heroSection} finish="MM" dims={hero.dims} showDims outline className="mx-auto aspect-[4/3] w-full max-w-[400px] text-ink" title={tc(lang, hero.name)} />
              <p className="mt-4 flex items-center justify-between text-sm">
                <span>
                  <span className="font-mono text-muted" dir="ltr">{hero.code}</span>
                  <span className="ms-2">{tc(lang, hero.name)}</span>
                </span>
                <ArrowRight size={16} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink rtl:-scale-x-100" />
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className={`${wrap} py-24 md:py-32`}>
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-4xl md:text-6xl">{d.home.rangesTitle}</h2>
          <Link href={p("/products")} className="mb-1 inline-flex shrink-0 items-center gap-1.5 text-[15px] text-muted hover:text-ink">
            {d.home.viewProducts}
            <ArrowRight size={14} className="rtl:-scale-x-100" />
          </Link>
        </div>
        {/* 17 ranges plus an "all products" tile = 18, so rows are always full in 2 or 3 columns. */}
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
          {RANGES.map((r) => {
            const cover = rangeCover(r.id);
            return (
              <Link key={r.id} href={p(rangeHref(r))} className="group">
                <div className="aspect-[4/3] rounded-md bg-tile p-5 transition-colors group-hover:bg-line">
                  {cover && <ProductVisual item={{ ...cover, name: tc(lang, r.name) }} />}
                </div>
                <h3 className="mt-3 text-[15px] group-hover:text-accent">{tc(lang, r.name)}</h3>
              </Link>
            );
          })}
          <Link href={p("/products")} className="group">
            <div className="grid aspect-[4/3] place-items-center rounded-md border border-line-strong transition-colors group-hover:border-ink">
              <span className="inline-flex items-center gap-2 text-[15px]">
                {d.home.viewProducts}
                <ArrowRight size={16} className="rtl:-scale-x-100" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Why customers choose YT: four plain promises and a short line of facts. */}
      <section className="border-t border-line">
        <div className={`${wrap} py-24 md:py-32`}>
          <h2 className="display text-4xl md:text-6xl">{d.edge.title}</h2>
          <div className="mt-14 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {d.edge.items.map((item) => (
              <div key={item.title} className="border-t border-ink pt-6">
                <h3 className="text-xl font-medium">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{item.text}</p>
              </div>
            ))}
          </div>
          <ul className="mt-16 flex flex-wrap gap-y-2 text-[15px] text-muted">
            {d.edge.trust.map((fact, i) => (
              <li key={fact} className={i > 0 ? "border-s border-line-strong ps-5 ms-5" : ""}>
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Colours. */}
      <section className="border-t border-line">
        <div className={`${wrap} py-24 md:py-32`}>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="display text-4xl md:text-6xl">{d.home.finishesTitle}</h2>
              <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">{fmt(d.home.finishesText, { n: COLOUR_CODES.length })}</p>
            </div>
            <Link href={p("/finishes")} className="mb-1 hidden shrink-0 items-center gap-1.5 text-[15px] text-muted hover:text-ink sm:inline-flex">
              {d.home.finishesLink}
              <ArrowRight size={14} className="rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-5 lg:grid-cols-10">
            {COLOUR_CODES.map((code) => (
              <div key={code}>
                <div className="aspect-square rounded-md ring-1 ring-inset ring-black/10" style={{ background: swatchBackground(code) }} />
                <p className="mt-2 text-xs leading-snug text-muted">{finishName(lang, code)}</p>
              </div>
            ))}
          </div>
          <Link href={p("/finishes")} className="mt-8 inline-flex items-center gap-1.5 text-[15px] text-muted hover:text-ink sm:hidden">
            {d.home.finishesLink}
            <ArrowRight size={14} className="rtl:-scale-x-100" />
          </Link>
        </div>
      </section>

      <section className="ambient-end">
        <div className={`${wrap} py-24 md:py-32`}>
          <h2 className="display max-w-[16ch] text-balance text-4xl md:text-6xl">{d.home.requestQuote}</h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-muted">{d.home.orderSteps[1].text}</p>
          <div className="mt-10">{actions}</div>
        </div>
      </section>
    </>
  );
}
