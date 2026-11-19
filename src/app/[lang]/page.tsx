import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, MapPin, Phone, WhatsappLogo } from "@phosphor-icons/react/ssr";
import { HeroViewer } from "@/components/home/HeroViewer";
import { ProductVisual } from "@/components/catalogue/ProductVisual";
import { LinkButton } from "@/components/ui/Button";
import { CODE_COUNT, PRODUCTS, RANGES, SECTIONS, productHref, productsInRange, rangeHref, renderSrc, resolveItem } from "@/lib/catalogue";
import { COLOUR_CODES, swatchBackground } from "@/lib/finishes";
import { SITE, fullAddress, whatsappLink } from "@/lib/site";
import { finishName, fmt, getDictionary, isLocale, localePath, tc } from "@/i18n";

// Camera angle for the home page model: turned towards the end so the frame profile is visible.
const HERO_VIEW: [number, number, number] = [1.1, 0.75, 1.5];

function rangeCover(rangeId: string) {
  const range = RANGES.find((r) => r.id === rangeId);
  const products = range ? productsInRange(range) : [];
  const pick = products.find((p) => p.sec) ?? products[0];
  return pick ? resolveItem(pick) : null;
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const d = getDictionary(lang);
  const p = (path: string) => localePath(lang, path);
  const hero = PRODUCTS.AU014;
  const heroFinishes = ["MM", "BK", "PW", "SF", "WG", "ML", "PS"].filter((f) => hero.fin.includes(f)).map((code) => ({ code, name: finishName(lang, code) }));

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-4 py-8 md:px-8 md:py-14 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-6">
            <h1 className="text-3xl font-semibold leading-tight text-balance md:text-[2.6rem]">{d.home.heroTitle}</h1>
            <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-muted">{d.home.heroText}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={whatsappLink(getDictionary("en").home.sendListMessage + " ")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded bg-accent px-5 text-base font-medium text-accent-ink hover:bg-accent-hover"
              >
                <WhatsappLogo size={20} />
                {d.home.sendList}
              </a>
              <LinkButton href={p("/products")} variant="secondary" size="lg" className="h-12 text-base">
                {d.home.viewProducts}
              </LinkButton>
            </div>
            <a href={SITE.phoneHref} className="mt-4 inline-flex items-center gap-2 text-base font-medium hover:text-accent">
              <Phone size={18} />
              <span>{fmt(d.home.callUs, { phone: "" })}</span>
              <span dir="ltr">{SITE.phone}</span>
            </a>
            <ul className="mt-6 grid grid-cols-2 gap-2 [&>li]:min-w-0">
              {d.home.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 rounded border border-line bg-surface-2 px-3 py-2 text-sm font-medium">
                  <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-accent" />
                  {perk}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">{d.home.perksNote}</p>
          </div>
          <div className="lg:col-span-6">
            <HeroViewer
              item={{ id: hero.id, kind: hero.kind, section: SECTIONS[hero.sec ?? "AU014"], view: HERO_VIEW }}
              code={hero.code}
              name={tc(lang, hero.name)}
              dims={hero.dims}
              finishes={heroFinishes}
              href={p(productHref(hero))}
              caption={d.home.heroCaption}
              viewLabel={d.home.viewProduct}
              poster={renderSrc(hero)}
            />
          </div>
        </div>
      </section>

      {/* How to order */}
      <section className="border-y border-line bg-surface-2">
        <div className="mx-auto max-w-[1280px] px-4 py-14 md:px-8 md:py-20">
          <h2 className="text-2xl font-semibold md:text-3xl">{d.home.orderTitle}</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {d.home.orderSteps.map((step, i) => (
              <li key={step.title} className="border-t-2 border-accent pt-5">
                <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Ranges */}
      <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-8 md:py-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">{d.home.rangesTitle}</h2>
            <p className="mt-2 text-muted">{fmt(d.home.rangesText, { ranges: RANGES.length, codes: CODE_COUNT })}</p>
          </div>
          <Link href={p("/products")} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            {d.home.viewProducts}
            <ArrowRight size={14} className="rtl:-scale-x-100" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {RANGES.map((r) => {
            const cover = rangeCover(r.id);
            const codes = productsInRange(r).reduce((n, x) => n + (x.variants?.length || 1), 0);
            return (
              <Link key={r.id} href={p(rangeHref(r))} className="group overflow-hidden rounded-md border border-line bg-surface transition-colors hover:border-line-strong">
                <div className="aspect-[4/3] bg-surface-2 p-3">{cover && <ProductVisual item={{ ...cover, name: tc(lang, r.name) }} />}</div>
                <div className="border-t border-line p-3">
                  <h3 className="text-sm font-medium group-hover:text-accent">{tc(lang, r.name)}</h3>
                  <p className="mt-0.5 text-xs text-muted">{fmt(d.home.codes, { n: codes })}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Finishes */}
      <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-8 md:py-20">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">{d.home.finishesTitle}</h2>
            <p className="mt-2 max-w-[60ch] text-muted">{fmt(d.home.finishesText, { n: COLOUR_CODES.length })}</p>
          </div>
          <Link href={p("/finishes")} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            {d.home.finishesLink}
            <ArrowRight size={14} className="rtl:-scale-x-100" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-10">
          {COLOUR_CODES.map((code) => (
            <div key={code}>
              <div className="aspect-square rounded-md ring-1 ring-inset ring-line-strong" style={{ background: swatchBackground(code) }} />
              <p className="mt-2 text-xs leading-tight">{finishName(lang, code)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 md:px-8 md:py-20 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="text-2xl font-semibold md:text-3xl">{d.home.aboutTitle}</h2>
            <p className="mt-4 max-w-[60ch] leading-relaxed text-muted">{d.home.aboutText}</p>
            <Link href={p("/about")} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
              {d.nav.about}
              <ArrowRight size={14} className="rtl:-scale-x-100" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-md border border-line bg-line lg:col-span-6">
            {[
              [String(RANGES.length), d.home.facts.ranges],
              [String(CODE_COUNT), d.home.facts.codes],
              [String(COLOUR_CODES.length), d.home.facts.finishes],
            ].map(([n, l]) => (
              <div key={l} className="bg-surface p-5">
                <p className="text-3xl font-semibold">{n}</p>
                <p className="mt-1 text-sm text-muted">{l}</p>
              </div>
            ))}
            <div className="bg-surface p-5">
              <p className="text-sm font-medium leading-snug">{d.home.facts.delivery}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trade counter */}
      <section className="border-t border-line bg-surface-2">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-10">
            <div>
              <p className="text-sm text-muted">{d.home.visitTitle}</p>
              <p className="mt-1 text-sm font-medium">{fullAddress}</p>
            </div>
            <div>
              <p className="text-sm text-muted">{d.contactPage.hours}</p>
              <p className="mt-1 text-sm font-medium">{d.site.hours}</p>
            </div>
            <div>
              <p className="text-sm text-muted">{d.contactPage.office}</p>
              <a href={SITE.phoneHref} className="mt-1 block text-sm font-medium hover:text-accent" dir="ltr">
                {SITE.phone}
              </a>
            </div>
          </div>
          <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 w-fit items-center gap-2 rounded border border-line-strong bg-surface px-4 text-sm font-medium hover:bg-bg">
            <MapPin size={16} />
            {d.home.directions}
          </a>
        </div>
      </section>
    </>
  );
}
