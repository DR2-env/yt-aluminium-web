import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MagnifyingGlass, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { ProductVisual } from "@/components/catalogue/ProductVisual";
import { SectionDrawing } from "@/components/catalogue/SectionDrawing";
import { HeroRequest } from "@/components/quote/HeroRequest";
import { PRODUCTS, RANGES, SECTIONS, productHref, productsInRange, rangeHref, resolveItem } from "@/lib/catalogue";
import { COLOUR_CODES, swatchBackground } from "@/lib/finishes";
import { SITE, fullAddress, whatsappLink } from "@/lib/site";
import { finishName, fmt, getDictionary, isLocale, localePath, tc } from "@/i18n";

function rangeCover(rangeId: string) {
  const range = RANGES.find((r) => r.id === rangeId);
  const products = range ? productsInRange(range) : [];
  const pick = products.find((p) => p.sec) ?? products[0];
  return pick ? resolveItem(pick) : null;
}

const wrap = "mx-auto max-w-[1280px] px-4 md:px-8";

// The 17 ranges grouped into five plain categories, in the same order as d.home.groups.
const GROUPS: string[][] = [
  ["shopfront", "hinged-door", "bifold", "double-glaze", "partition", "angle"],
  ["security", "door-window-acc", "flyscreen"],
  ["mesh", "ss-mesh", "grill"],
  ["hardware", "locks", "pile-wedge"],
  ["blinds", "curtain"],
];

// Built for trade customers: visit or call first, then five plain categories, why YT, colours,
// and the quote request at the end.
export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const p = (path: string) => localePath(lang, path);
  const hero = PRODUCTS.AU014;
  const heroSection = SECTIONS[hero.sec ?? "AU014"];
  // Pre-filled text stays in English so staff can read it.
  const sendListHref = whatsappLink(getDictionary("en").home.sendListMessage + " ");

  // Closing call to action: the quote form first, WhatsApp for people who prefer it.
  const actions = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Link href={p("/quote")} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-white hover:opacity-90">
        {d.nav.quoteCta}
        <ArrowRight size={16} className="rtl:-scale-x-100" />
      </Link>
      <a
        href={sendListHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line-strong px-6 text-[15px] font-medium hover:border-ink"
      >
        <WhatsappLogo size={18} />
        {d.home.sendList}
      </a>
    </div>
  );

  return (
    <>
      <section className="ambient">
        <div className={`${wrap} grid grid-cols-1 items-center gap-12 pb-20 pt-10 md:pt-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:gap-10 lg:py-10`}>
          <div className="lg:col-span-7">
            <h1 className="display text-balance text-[2.5rem] sm:text-6xl lg:text-[clamp(2.75rem,8vh,4.25rem)]">{d.home.heroTitle}</h1>
            <p className="mt-4 max-w-[36ch] text-xl leading-snug md:text-2xl">{d.home.heroSub}</p>
            <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-muted md:text-base">{d.home.heroText}</p>

            {/* Visit or call: the main thing this page is for. */}
            <div className="mt-7 grid max-w-[620px] gap-5 border-t border-ink/15 pt-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow text-muted">{d.home.visitTitle}</p>
                <p className="mt-2 text-[15px]">{fullAddress}</p>
                <p className="text-[15px] text-muted">{d.site.hours}</p>
                <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[15px] font-medium hover:text-accent">
                  <MapPin size={16} />
                  {d.home.directions}
                </a>
              </div>
              <div>
                <p className="eyebrow text-muted">{d.nav.call}</p>
                <a href={SITE.phoneHref} className="mt-2 block text-2xl font-medium hover:text-accent" dir="ltr">
                  {SITE.phone}
                </a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={SITE.phoneHref} className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white hover:opacity-90">
                    <Phone size={16} />
                    {d.nav.call}
                  </a>
                  <a href={sendListHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/20 px-4 text-sm font-medium hover:border-ink">
                    <WhatsappLogo size={16} />
                    {d.nav.whatsapp}
                  </a>
                </div>
              </div>
              <p className="text-sm text-muted sm:col-span-2">{d.home.languages}</p>
            </div>

            {/* Product search by code or name; the Products page reads ?q=. */}
            <form action={p("/products")} method="get" role="search" className="mt-6 flex max-w-[620px] items-center gap-2 rounded-full border border-ink/15 bg-white/70 p-1.5 ps-4 backdrop-blur-sm">
              <MagnifyingGlass size={18} className="shrink-0 text-muted" aria-hidden />
              <label htmlFor="home-search" className="sr-only">{d.catalogue.searchLabel}</label>
              <input id="home-search" name="q" type="search" placeholder={d.catalogue.searchPlaceholder} className="h-10 min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-muted focus:outline-none" />
              <button type="submit" className="h-10 shrink-0 rounded-full bg-ink px-5 text-sm font-medium text-white hover:opacity-90">
                {d.home.searchButton}
              </button>
            </form>
          </div>

          <Link href={p(productHref(hero))} className="group block lg:col-span-5" aria-label={`${hero.code} ${tc(lang, hero.name)}`}>
            <div className="blueprint rounded-lg p-6 transition-colors group-hover:border-ink/30 md:p-8">
              <SectionDrawing section={heroSection} finish="MM" dims={hero.dims} showDims outline className="mx-auto aspect-[4/3] w-full max-w-[400px] text-ink lg:max-h-[42vh]" title={tc(lang, hero.name)} />
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

      {/* Five plain categories; each lists its ranges. */}
      <section className={`${wrap} py-24 md:py-32`}>
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-4xl md:text-6xl">{d.home.groupsTitle}</h2>
          <Link href={p("/products")} className="mb-1 inline-flex shrink-0 items-center gap-1.5 text-[15px] text-muted hover:text-ink">
            {d.home.viewProducts}
            <ArrowRight size={14} className="rtl:-scale-x-100" />
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((ids, i) => {
            const ranges = ids.map((id) => RANGES.find((r) => r.id === id)).filter((r): r is (typeof RANGES)[number] => Boolean(r));
            const cover = ranges[0] ? rangeCover(ranges[0].id) : null;
            const group = d.home.groups[i];
            return (
              <div key={group.title}>
                <Link href={p(rangeHref(ranges[0]))} className="group block">
                  <div className="aspect-[4/3] rounded-md bg-tile p-5 transition-colors group-hover:bg-line">
                    {cover && <ProductVisual item={{ ...cover, name: group.title }} />}
                  </div>
                  <h3 className="mt-4 text-xl font-medium group-hover:text-accent">{group.title}</h3>
                </Link>
                <p className="mt-2 leading-relaxed text-muted">{group.text}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {ranges.map((r) => (
                    <li key={r.id}>
                      <Link href={p(rangeHref(r))} className="inline-flex h-8 items-center rounded-full border border-ink/15 px-3 text-sm hover:border-ink">
                        {tc(lang, r.name)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
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
          <div className="mt-10 max-w-[560px]">
            <HeroRequest
              quoteHref={p("/quote")}
              label={d.home.askLabel}
              placeholder={d.home.askPlaceholder}
              button={d.home.askButton}
              photo={d.home.askPhoto}
              photoHint={d.home.askPhotoHint}
              photoTooBig={d.quote.photoTooBig}
            />
          </div>
          <div className="mt-6">{actions}</div>
        </div>
      </section>
    </>
  );
}
