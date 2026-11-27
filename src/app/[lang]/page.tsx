import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MagnifyingGlass, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { ProductVisual } from "@/components/catalogue/ProductVisual";
import { SectionDrawing } from "@/components/catalogue/SectionDrawing";
import { HeroRequest } from "@/components/quote/HeroRequest";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { QUOTE_ENABLED } from "@/lib/features";
import { CATEGORIES, NEW_PRODUCTS, isLightRender, PRODUCTS, RANGES, SECTIONS, productHref, productsInRange, rangeHref, resolveItem } from "@/lib/catalogue";
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
const GROUPS: string[][] = CATEGORIES.map((c) => c.ranges);

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
      {QUOTE_ENABLED ? (
        <Link href={p("/quote")} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-white hover:opacity-90">
          {d.nav.quoteCta}
          <ArrowRight size={16} className="rtl:-scale-x-100" />
        </Link>
      ) : (
        <a href={SITE.mobileHref} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-medium text-white hover:opacity-90">
          <Phone size={18} />
          {d.nav.call} <span dir="ltr">{SITE.mobile}</span>
        </a>
      )}
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
        <div className={`${wrap} grid grid-cols-1 items-center gap-12 pb-3 pt-5 sm:pb-20 md:pt-14 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-12 lg:gap-10 lg:py-10`}>
          <div className="lg:col-span-7">
            <h1 className="display text-balance text-[2.1rem] sm:text-6xl lg:text-[clamp(2.75rem,8vh,4.25rem)]">{d.home.heroTitle}</h1>
            <p className="mt-3 max-w-[36ch] text-lg leading-snug sm:mt-4 md:text-2xl">{d.home.heroSub}</p>
            <p className="mt-3 hidden max-w-[48ch] text-[15px] leading-relaxed text-muted sm:block md:text-base">{d.home.heroText}</p>

            {/* Visit or call: the main thing this page is for. */}
            <div className="mt-4 grid max-w-[620px] gap-3 rounded-2xl bg-white/55 p-4 sm:mt-7 sm:grid-cols-2 sm:gap-5 sm:rounded-none sm:border-t sm:border-ink/15 sm:bg-transparent sm:p-0 sm:pt-6">
              <div>
                <p className="eyebrow text-muted">{d.home.visitTitle}</p>
                <p className="mt-2 text-[15px]">{fullAddress}</p>
                <p className="text-[15px] text-muted">{d.site.hours}</p>
                <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-[15px] font-medium hover:text-accent sm:mt-2">
                  <MapPin size={16} />
                  {d.home.directions}
                </a>
              </div>
              <div>
                <p className="eyebrow text-muted">{d.nav.call}</p>
                {/* Mobile first: it is the number customers actually call. */}
                <a href={SITE.mobileHref} className="mt-1 block text-xl font-medium hover:text-accent sm:mt-2 sm:text-2xl" dir="ltr">
                  {SITE.mobile}
                </a>
                <a href={SITE.phoneHref} className="block text-[15px] text-muted hover:text-ink" dir="ltr">
                  {SITE.phone}
                </a>
                <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
                  <a href={SITE.mobileHref} className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-white hover:opacity-90">
                    <Phone size={16} />
                    {d.nav.call}
                  </a>
                  <a href={sendListHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/20 px-4 text-sm font-medium hover:border-ink">
                    <WhatsappLogo size={16} />
                    {d.nav.whatsapp}
                  </a>
                </div>
              </div>
              <p className="text-[13px] text-muted sm:col-span-2 sm:text-sm">{d.home.languages}</p>
            </div>

            {/* Product search by code or name; the Products page reads ?q=. */}
            <form action={p("/products")} method="get" role="search" className="mt-6 hidden max-w-[620px] sm:flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 p-1.5 ps-4 backdrop-blur-sm">
              <MagnifyingGlass size={18} className="shrink-0 text-muted" aria-hidden />
              <label htmlFor="home-search" className="sr-only">{d.catalogue.searchLabel}</label>
              <input id="home-search" name="q" type="search" placeholder={d.catalogue.searchPlaceholder} className="h-10 min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-muted focus:outline-none" />
              <button type="submit" className="h-10 shrink-0 rounded-full bg-ink px-5 text-sm font-medium text-white hover:opacity-90">
                {d.home.searchButton}
              </button>
            </form>
          </div>

          <Link href={p(productHref(hero))} className="group hidden lg:col-span-5 lg:block" aria-label={`${hero.code} ${tc(lang, hero.name)}`}>
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
      <section className={`${wrap} pb-14 pt-4 sm:py-24 md:py-32`}>
        <div className="flex items-end justify-between gap-6">
          <h2 className="display text-3xl md:text-6xl">{d.home.groupsTitle}</h2>
          <Link href={p("/products")} className="mb-1 hidden shrink-0 sm:inline-flex items-center gap-1.5 text-[15px] text-muted hover:text-ink">
            {d.home.viewProducts}
            <ArrowRight size={14} className="rtl:-scale-x-100" />
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-6 sm:mt-12 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3">
          {GROUPS.map((ids, i) => {
            const ranges = ids.map((id) => RANGES.find((r) => r.id === id)).filter((r): r is (typeof RANGES)[number] => Boolean(r));
            const cover = ranges[0] ? rangeCover(ranges[0].id) : null;
            const group = d.home.groups[i];
            return (
              <div key={group.title} className="flex gap-4 sm:block">
                <Link href={p(rangeHref(ranges[0]))} className="group shrink-0 sm:block" tabIndex={-1} aria-hidden>
                  <div className={`size-20 rounded-xl p-2 transition-colors sm:aspect-[4/3] sm:size-auto sm:rounded-md sm:p-5 ${cover && isLightRender(cover) ? "bg-tile-dark" : "bg-tile group-hover:bg-line"}`}>
                    {cover && <ProductVisual item={{ ...cover, name: group.title }} alt="" />}
                  </div>
                </Link>
                <div className="min-w-0">
                  <Link href={p(rangeHref(ranges[0]))} className="group">
                    <h3 className="text-lg font-medium group-hover:text-accent sm:mt-4 sm:text-xl">{group.title}</h3>
                  </Link>
                  <p className="mt-1 text-sm leading-relaxed text-muted sm:mt-2 sm:text-base">{group.text}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                    {ranges.map((r) => (
                      <li key={r.id}>
                        <Link href={p(rangeHref(r))} className="inline-flex h-7 items-center rounded-full bg-white/60 px-2.5 text-[13px] hover:bg-white sm:h-8 sm:px-3 sm:text-sm">
                          {tc(lang, r.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          <Link href={p("/products")} className="group hidden lg:block">
            <div className="grid aspect-[4/3] place-items-center rounded-md border border-line-strong transition-colors group-hover:border-ink">
              <span className="inline-flex items-center gap-2 text-[15px]">
                {d.home.viewProducts}
                <ArrowRight size={16} className="rtl:-scale-x-100" />
              </span>
            </div>
          </Link>
        </div>
        {/* Phones and tablets: a normal button instead of the big empty tile, then search. */}
        <Link href={p("/products")} className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-medium text-white sm:w-auto sm:px-6 lg:hidden">
          {d.home.viewProducts}
          <ArrowRight size={16} className="rtl:-scale-x-100" />
        </Link>
        <form action={p("/products")} method="get" role="search" className="mt-4 flex items-center gap-2 rounded-full bg-white/70 p-1.5 ps-4 sm:hidden">
          <MagnifyingGlass size={18} className="shrink-0 text-muted" aria-hidden />
          <label htmlFor="home-search-m" className="sr-only">{d.catalogue.searchLabel}</label>
          <input id="home-search-m" name="q" type="search" placeholder={d.catalogue.searchPlaceholder} className="h-10 min-w-0 flex-1 bg-transparent text-[15px] placeholder:text-muted focus:outline-none" />
          <button type="submit" className="h-10 shrink-0 rounded-full bg-ink px-4 text-sm font-medium text-white">
            {d.home.searchButton}
          </button>
        </form>
      </section>

      {/* Our latest catalogue: products marked NEW in the current price list. */}
      {NEW_PRODUCTS.length > 0 && (
        <section className="border-line sm:border-t">
          <div className={`${wrap} py-14 sm:py-24 md:py-32`}>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h2 className="display text-3xl md:text-6xl">{d.home.latestTitle}</h2>
                <p className="mt-3 max-w-[52ch] leading-relaxed text-muted sm:mt-5 sm:text-lg">{fmt(d.home.latestText, { date: lang === "en" ? SITE.priceListDate : "16/02/2026" })}</p>
              </div>
              <Link href={`${p("/products")}?tag=new`} className="mb-1 inline-flex shrink-0 items-center gap-1.5 text-[15px] text-muted hover:text-ink">
                {d.home.latestLink}
                <ArrowRight size={14} className="rtl:-scale-x-100" />
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {NEW_PRODUCTS.map((np) => (
                <ProductCard key={np.id} product={np} lang={lang} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why customers choose YT: four plain promises and a short line of facts. */}
      <section className="border-line sm:border-t">
        <div className={`${wrap} py-14 sm:py-24 md:py-32`}>
          <h2 className="display text-3xl md:text-6xl">{d.edge.title}</h2>
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:mt-14 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4">
            {d.edge.items.map((item) => (
              <div key={item.title} className="sm:border-t sm:border-ink sm:pt-6">
                <h3 className="text-lg font-medium sm:text-xl">{item.title}</h3>
                <p className="mt-1 leading-relaxed text-muted sm:mt-3">{item.text}</p>
              </div>
            ))}
          </div>
          <ul className="mt-8 flex flex-col gap-1 text-[15px] text-muted sm:mt-16 sm:flex-row sm:flex-wrap sm:gap-y-2">
            {d.edge.trust.map((fact, i) => (
              <li key={fact} className={i > 0 ? "sm:ms-5 sm:border-s sm:border-line-strong sm:ps-5" : ""}>
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Colours. */}
      <section className="border-line sm:border-t">
        <div className={`${wrap} py-14 sm:py-24 md:py-32`}>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="display text-3xl md:text-6xl">{d.home.finishesTitle}</h2>
              <p className="mt-3 max-w-[52ch] leading-relaxed text-muted sm:mt-5 sm:text-lg">{fmt(d.home.finishesText, { n: COLOUR_CODES.length })}</p>
            </div>
            <Link href={p("/finishes")} className="mb-1 hidden shrink-0 items-center gap-1.5 text-[15px] text-muted hover:text-ink sm:inline-flex">
              {d.home.finishesLink}
              <ArrowRight size={14} className="rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-5 gap-x-2 gap-y-4 sm:mt-12 sm:gap-x-3 sm:gap-y-6 lg:grid-cols-10">
            {COLOUR_CODES.map((code) => (
              <div key={code}>
                <div className="aspect-square rounded-md ring-1 ring-inset ring-black/10" style={{ background: swatchBackground(code) }} />
                <p className="mt-1.5 text-[11px] leading-snug text-muted sm:mt-2 sm:text-xs">{finishName(lang, code)}</p>
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
        <div className={`${wrap} py-14 sm:py-24 md:py-32`}>
          <h2 className="display max-w-[16ch] text-balance text-3xl md:text-6xl">{QUOTE_ENABLED ? d.home.requestQuote : d.contactPage.priceTitle}</h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-muted">{QUOTE_ENABLED ? d.home.orderSteps[1].text : d.contactPage.priceText}</p>
          {QUOTE_ENABLED && (
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
          )}
          <div className="mt-6">{actions}</div>
        </div>
      </section>
    </>
  );
}
