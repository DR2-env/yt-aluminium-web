import Link from "next/link";
import { Logo } from "./Logo";
import { RANGES, rangeHref } from "@/lib/catalogue";
import { SITE } from "@/lib/site";
import { getDictionary, localePath, tc, type Locale } from "@/i18n";

export function SiteFooter({ lang }: { lang: Locale }) {
  const d = getDictionary(lang);
  const nav = [
    { href: "/products", label: d.nav.products },
    { href: "/finishes", label: d.nav.finishes },
    { href: "/about", label: d.nav.about },
    { href: "/contact", label: d.nav.contact },
    { href: "/quote", label: d.nav.quote },
    { href: "/faq", label: d.footer.faq },
    { href: "/privacy", label: d.footer.privacy },
  ];
  return (
    <footer className="border-t border-line bg-surface pb-20 sm:pb-0">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 md:grid-cols-12 md:px-8">
        <div className="md:col-span-4">
          <Logo href={localePath(lang, "/")} />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{d.footer.about}</p>
        </div>
        <div className="md:col-span-5">
          <h2 className="eyebrow text-muted">{d.footer.ranges}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-muted">
            {RANGES.map((r) => (
              <li key={r.id}>
                <Link href={localePath(lang, rangeHref(r))} className="hover:text-ink">
                  {tc(lang, r.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-6 md:col-span-3">
          <div>
            <h2 className="eyebrow text-muted">{d.footer.counter}</h2>
            <address className="mt-3 space-y-1 text-sm not-italic text-muted">
              <p>{SITE.address.street}</p>
              <p>
                {SITE.address.suburb} {SITE.address.state} {SITE.address.postcode}
              </p>
              <p>{d.site.hoursShort}</p>
            </address>
          </div>
          <div className="space-y-1 text-sm" dir="ltr">
            <a href={SITE.phoneHref} className="block hover:text-accent">{SITE.phone}</a>
            <a href={SITE.mobileHref} className="block hover:text-accent">{SITE.mobile}</a>
            <a href={`mailto:${SITE.email}`} className="block hover:text-accent">{SITE.email}</a>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-5 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            {SITE.legalName} <span dir="ltr">· ABN {SITE.abn}</span>
          </p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
            {nav.map((n) => (
              <Link key={n.href} href={localePath(lang, n.href)} className="hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
