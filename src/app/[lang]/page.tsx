import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, ClipboardText, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { ProductVisual } from "@/components/catalogue/ProductVisual";
import { SectionDrawing } from "@/components/catalogue/SectionDrawing";
import { LinkButton } from "@/components/ui/Button";
import { CODE_COUNT, PRODUCTS, RANGES, SECTIONS, productHref, productsInRange, rangeHref, resolveItem } from "@/lib/catalogue";
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

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const p = (path: string) => localePath(lang, path);
  const hero = PRODUCTS.AU014;
  const heroSection = SECTIONS[hero.sec ?? "AU014"];
  const sendListHref = whatsappLink(getDictionary("en").home.sendListMessage + " ");

  return (
    <>
      {/* Hero: large headline on soft blue glows, with a technical drawing sheet. */}
      <section className="ambient border-b border-line">
        <div className={`${wrap} grid grid-cols-1 gap-12 pb-20 pt-16 md:pb-32 md:pt-28 lg:grid-cols-12 lg:items-center lg:gap-10`}>
          <div className="lg:col-span-7">
            <h1 className="display text-balance text-[2.9rem] sm:text-6xl lg:text-[5.6rem]">{d.home.heroTitle}</h1>
            <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted md:text-xl">{d.home.heroText}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href={sendListHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded bg-brand px-5 text-[15px] font-medium">
                <WhatsappLogo size={18} />
                {d.home.sendList}
              </a>
              <LinkButton href={p("/products")} variant="secondary" size="lg" className="h-12 bg-transparent text-[15px]">
                {d.home.viewProducts}
              </LinkButton>
            </div>
            <a href={SITE.phoneHref} className="mt-5 inline-flex items-center gap-2 text-[15px] hover:text-accent">
              <Phone size={16} />
              <span>{fmt(d.home.callUs, { phone: "" })}</span>
              <span dir="ltr">{SITE.phone}</span>
            </a>
            <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {d.home.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-base font-medium">
                  <CheckCircle size={22} weight="fill" className="shrink-0 text-accent" aria-hidden />
                  {perk}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">{d.home.perksNote}</p>
          </div>

          {/* Drawing sheet: the real AU014 section traced from the price list, drawn as linework. */}
          <Link href={p(productHref(hero))} className="group block lg:col-span-5" aria-label={`${hero.code} ${tc(lang, hero.name)}`}>
            <div className="rounded-md border border-line-strong bg-surface/60 p-4 backdrop-blur-sm transition-colors group-hover:border-ink/40 md:p-5">
              <div className="eyebrow flex justify-between text-muted" dir="ltr">
                <span>{d.product.viewSection}</span>
                <span>{hero.code}</span>
              </div>
              <SectionDrawing section={heroSection} finish="MM" dims={hero.dims} showDims outline className="mx-auto my-2 aspect-[4/3] w-full max-w-[420px] text-ink" title={tc(lang, hero.name)} />
              <div className="grid grid-cols-2 border-t border-line-strong text-xs">
                <div className="border-e border-line-strong px-2 py-2">
                  <p className="eyebrow text-muted">{SITE.name}</p>
                  <p className="mt-0.5 font-mono" dir="ltr">{hero.code}</p>
                </div>
                <div className="px-2 py-2">
                  <p className="eyebrow text-muted">{d.product.size}</p>
                  <p className="mt-0.5 font-mono" dir="ltr">{hero.dims ? `${hero.dims[0]} × ${hero.dims[1]} mm` : ""}</p>
                </div>
              </div>
              <p className="mt-3 flex items-center justify-between text-sm">
                <span>{tc(lang, hero.name)}</span>
                <span className="inline-flex items-center gap-1 text-muted group-hover:text-ink">
                  {d.home.viewProduct}
                  <ArrowRight size={14} className="rtl:-scale-x-100" />
                </span>
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Ranges. */}
      <section className="border-t border-line bg-surface">
        <div className={`${wrap} py-20 md:py-28`}>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <h2 className="display text-5xl md:text-7xl">{d.home.rangesTitle}</h2>
            <div>
              <p className="max-w-[52ch] text-lg leading-relaxed text-muted">{d.home.aboutText}</p>
              <Link href={p("/products")} className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium hover:text-accent">
                {d.home.viewProducts}
                <ArrowRight size={14} className="rtl:-scale-x-100" />
              </Link>
            </div>
          </div>
          <div className="mt-14 grid grid-cols-2 border-s border-t border-line md:grid-cols-3 lg:grid-cols-4">
            {RANGES.map((r) => {
              const cover = rangeCover(r.id);
              const codes = productsInRange(r).reduce((n, x) => n + (x.variants?.length || 1), 0);
              return (
                <Link key={r.id} href={p(rangeHref(r))} className="group border-b border-e border-line bg-surface transition-colors hover:bg-bg">
                  <div className="aspect-[4/3] bg-tile p-4">{cover && <ProductVisual item={{ ...cover, name: tc(lang, r.name) }} />}</div>
                  <div className="px-4 pb-4">
                    <h3 className="text-[15px] group-hover:text-accent">{tc(lang, r.name)}</h3>
                    <p className="eyebrow mt-1 text-muted">{fmt(d.home.codes, { n: codes })}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to order: large heading, then giant thin step numbers. */}
      <section className={`${wrap} py-20 md:py-28`}>
        <h2 className="display text-5xl md:text-7xl">{d.home.orderTitle}</h2>
        <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
          {d.home.orderSteps.map((step, i) => (
            <li key={step.title}>
              <span className="display block text-7xl md:text-[7.5rem]" dir="ltr">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-2xl font-medium">{step.title}</h3>
              <p className="mt-3 max-w-[38ch] leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Facts band. */}
      <section className={`${wrap} pb-20 md:pb-28`}>
        <div className="band grid grid-cols-3 gap-y-10 rounded-md px-6 py-10 md:px-10 md:py-14">
          {[
            [String(RANGES.length), d.home.facts.ranges],
            [String(CODE_COUNT), d.home.facts.codes],
            [String(COLOUR_CODES.length), d.home.facts.finishes],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="display text-6xl md:text-7xl">{n}</p>
              <p className="mt-2 text-[15px]">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Finishes. */}
      <section className="border-t border-line">
        <div className={`${wrap} py-20 md:py-28`}>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
            <h2 className="display text-5xl md:text-7xl">{d.home.finishesTitle}</h2>
            <div>
              <p className="max-w-[52ch] text-lg leading-relaxed text-muted">{fmt(d.home.finishesText, { n: COLOUR_CODES.length })}</p>
              <Link href={p("/finishes")} className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-medium hover:text-accent">
                {d.home.finishesLink}
                <ArrowRight size={14} className="rtl:-scale-x-100" />
              </Link>
            </div>
          </div>
          <div className="mt-14 grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-6 lg:grid-cols-10">
            {COLOUR_CODES.map((code) => (
              <div key={code}>
                <div className="aspect-square rounded ring-1 ring-inset ring-line-strong" style={{ background: swatchBackground(code) }} />
                <p className="mt-2 text-xs leading-tight text-muted">{finishName(lang, code)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing call to action on ink, flowing into the dark footer. */}
      <section className="ambient-end border-t border-line">
        <div className={`${wrap} pb-12 pt-20 md:pt-28`}>
          <h2 className="display text-balance text-5xl md:text-7xl">{d.home.requestQuote}</h2>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={sendListHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded bg-brand px-5 text-[15px] font-medium">
              <WhatsappLogo size={18} />
              {d.home.sendList}
            </a>
            <LinkButton href={p("/quote")} variant="secondary" size="lg" className="h-12 bg-surface text-[15px]">
              <ClipboardText size={18} />
              {d.home.buildQuote}
            </LinkButton>
          </div>
          <div className="mt-14 grid gap-8 border-t border-line-strong pt-8 text-sm sm:grid-cols-3">
            <div>
              <p className="eyebrow text-muted">{d.home.visitTitle}</p>
              <p className="mt-2">{fullAddress}</p>
              <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-muted hover:text-ink">
                <MapPin size={14} />
                {d.home.directions}
              </a>
            </div>
            <div>
              <p className="eyebrow text-muted">{d.contactPage.hours}</p>
              <p className="mt-2">{d.site.hours}</p>
            </div>
            <div>
              <p className="eyebrow text-muted">{d.contactPage.office}</p>
              <a href={SITE.phoneHref} className="mt-2 block hover:text-accent" dir="ltr">
                {SITE.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
