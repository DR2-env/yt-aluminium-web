import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChatCircleText, ListChecks, MapPin, Truck } from "@phosphor-icons/react/ssr";
import { HeroViewer } from "@/components/home/HeroViewer";
import { ProductVisual } from "@/components/catalogue/ProductVisual";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CODE_COUNT, PRODUCTS, RANGES, SECTIONS, defaultFinish, productHref, productsInRange, rangeHref, resolveItem } from "@/lib/catalogue";
import { COLOUR_CODES, finishOf, swatchBackground } from "@/lib/finishes";
import { SITE, fullAddress } from "@/lib/site";

// Ranges shown as wide tiles in the range grid (keeps the grid rows full: 3 wide + 14 standard).
const FEATURED = new Set(["shopfront", "hinged-door", "security"]);

function rangeCover(rangeId: string) {
  const range = RANGES.find((r) => r.id === rangeId);
  const products = range ? productsInRange(range) : [];
  // Prefer a drawn profile, then a photo, then anything.
  const pick = products.find((p) => p.sec) ?? products.find((p) => p.kind === "photo") ?? products[0];
  return pick ? resolveItem(pick) : null;
}

export default function HomePage() {
  const hero = PRODUCTS.AU014;
  const heroItem = resolveItem(hero);
  const heroFinishes = ["MM", "BK", "PW", "SF", "WG", "ML", "PS"].filter((f) => hero.fin.includes(f));

  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-[1320px] gap-10 px-4 pb-16 pt-10 md:px-8 md:pt-16 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-20">
        <div className="lg:col-span-5">
          <h1 className="text-[2.6rem] font-semibold leading-[1.02] tracking-tighter text-balance md:text-6xl lg:text-[4.1rem]">
            Aluminium profiles, mesh and hardware for the trade.
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-muted">
            Stocked in Milperra for Sydney fabricators, glaziers and builders. Build your list online and get a quote back the same business day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/products" size="lg">
              Browse the range
              <ArrowRight size={16} weight="bold" />
            </LinkButton>
            <LinkButton href="/quote" variant="secondary" size="lg">
              Send us your list
            </LinkButton>
          </div>
        </div>
        <div className="h-[440px] md:h-[540px] lg:col-span-7 lg:h-[min(640px,calc(100dvh-9rem))]">
          <HeroViewer
            item={{ kind: heroItem.kind, section: SECTIONS[hero.sec ?? "AU014"] }}
            code={hero.code}
            name={hero.name}
            dims={hero.dims}
            finishes={heroFinishes}
            href={productHref(hero)}
          />
        </div>
      </section>

      {/* Range grid */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-[1320px] px-4 py-20 md:px-8 md:py-28">
          <Reveal className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {RANGES.length} ranges. {CODE_COUNT} codes. One trade counter.
            </h2>
            <p className="mt-4 max-w-[60ch] text-muted">
              Every product from our current price list, with its code, finishes and pack size. Pick what you need and add it to your quote list.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-flow-dense grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {RANGES.map((r) => {
              const cover = rangeCover(r.id);
              const wide = FEATURED.has(r.id);
              const codes = productsInRange(r).reduce((n, p) => n + (p.variants?.length || 1), 0);
              return (
                <Link
                  key={r.id}
                  href={rangeHref(r)}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-bg transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong ${wide ? "col-span-2" : ""}`}
                >
                  <div className={`relative ${wide ? "aspect-[2/1] p-8 md:p-12" : `aspect-square ${cover?.kind === "photo" ? "p-10 md:p-12" : "p-6 md:p-8"}`}`}>
                    {cover && <ProductVisual item={cover} finish={defaultFinish(cover.fin)} />}
                  </div>
                  <div className="flex items-end justify-between gap-3 border-t border-line p-4">
                    <div>
                      <h3 className={`font-semibold tracking-tight ${wide ? "text-lg" : "text-[15px]"}`}>{r.name}</h3>
                      <p className="mt-0.5 font-mono text-xs text-muted">{codes} codes</p>
                    </div>
                    <ArrowRight size={16} weight="bold" className="mb-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How ordering works */}
      <section className="mx-auto grid max-w-[1320px] gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Order the way you already do.</h2>
            <p className="mt-4 max-w-[48ch] text-muted">
              No account and no checkout. The quote list turns into a clean, numbered list in our codes, ready to send from your phone.
            </p>
          </div>
        </div>
        <ol className="space-y-4 lg:col-span-7">
          {[
            {
              icon: ListChecks,
              title: "Pick codes and finishes",
              body: "Browse the catalogue, choose the colour and size, and add the quantity. Or paste a list of codes you already have.",
            },
            {
              icon: ChatCircleText,
              title: "Send it by WhatsApp, email or WeChat",
              body: "Your list arrives as plain text, for example “1. AU014 Main Frame, Monument (MM), 4 lengths”. We reply with pricing the same business day.",
            },
            {
              icon: Truck,
              title: "Collect or have it delivered",
              body: "Pick up from the Milperra trade counter, or ask for same day delivery in the Sydney area. Delivery is free on orders over $500 (conditions apply).",
            },
          ].map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <li className="flex gap-5 rounded-2xl border border-line bg-surface p-6 md:p-8">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                  <s.icon size={22} weight="bold" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 max-w-[56ch] leading-relaxed text-muted">{s.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Finishes strip */}
      <section className="border-y border-line bg-surface py-20 md:py-28">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-4 md:flex-row md:items-end md:justify-between md:px-8">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-5xl">
            {COLOUR_CODES.length} finishes, from mill to Western Red Cedar.
          </h2>
          <Link href="/finishes" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-accent">
            See which products come in each colour
            <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
        <div className="scroll-row mt-12 flex snap-x gap-3 overflow-x-auto px-4 md:px-8 xl:mx-auto xl:max-w-[1320px] xl:grid xl:grid-cols-[repeat(19,minmax(0,1fr))] xl:gap-2 xl:overflow-visible">
          {COLOUR_CODES.map((code) => (
            <div key={code} className="w-24 shrink-0 snap-start xl:w-auto">
              <div className="h-40 rounded-2xl ring-1 ring-inset ring-line-strong xl:h-48" style={{ background: swatchBackground(code) }} />
              <p className="mt-3 text-xs font-medium leading-tight">{finishOf(code).name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-muted">{code}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why YT */}
      <section className="mx-auto max-w-[1320px] px-4 py-20 md:px-8 md:py-28">
        <Reveal>
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">Stock on the shelf, people who answer the phone.</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-3">
          <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-line lg:col-span-2 lg:row-span-3">
            <Image
              src="https://images.unsplash.com/photo-1741655262435-4890ab9918fa?auto=format&fit=crop&w=1600&q=80"
              alt="Racked aluminium profile stock in a warehouse"
              fill
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover grayscale-[35%]"
            />
          </div>
          {[
            { title: "Same day delivery in Sydney", body: "Order in the morning, have it on site in the afternoon across the Sydney area." },
            { title: "No order too small", body: "A single length or a full bundle. Trade prices either way." },
            { title: "Over 20 years in aluminium", body: "Ask us what suits the job. We know the systems we sell." },
          ].map((f) => (
            <div key={f.title} className="flex flex-col justify-center rounded-2xl border border-line bg-surface p-6 md:p-8">
              <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trade counter */}
      <section className="mx-auto max-w-[1320px] px-4 pb-24 md:px-8">
        <div className="grid gap-10 overflow-hidden rounded-2xl bg-ink p-8 text-bg md:grid-cols-2 md:p-14">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">Come to the trade counter.</h2>
            <p className="mt-4 max-w-[44ch] text-bg/70">Walk in with your list, or send it ahead and we will have it ready for pick up.</p>
          </div>
          <div className="flex flex-col justify-between gap-8">
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-bg/60">Address</dt>
                <dd className="mt-1 font-medium">{fullAddress}</dd>
              </div>
              <div>
                <dt className="text-sm text-bg/60">Hours</dt>
                <dd className="mt-1 font-medium">{SITE.hours}</dd>
              </div>
              <div>
                <dt className="text-sm text-bg/60">Phone</dt>
                <dd className="mt-1 font-mono font-medium">
                  <a href={SITE.phoneHref} className="hover:text-accent">{SITE.phone}</a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-bg/60">Mobile and WhatsApp</dt>
                <dd className="mt-1 font-mono font-medium">
                  <a href={SITE.mobileHref} className="hover:text-accent">{SITE.mobile}</a>
                </dd>
              </div>
            </dl>
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 w-fit items-center gap-2 rounded-lg bg-bg px-6 text-[15px] font-semibold text-ink transition-transform active:translate-y-px"
            >
              <MapPin size={18} weight="bold" />
              Get directions
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
