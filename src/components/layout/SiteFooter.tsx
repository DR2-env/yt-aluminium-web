import Link from "next/link";
import { Logo } from "./Logo";
import { NAV } from "./nav";
import { SITE } from "@/lib/site";
import { RANGES, rangeHref } from "@/lib/catalogue";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface pb-24 sm:pb-0">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-14 md:grid-cols-12 md:px-8">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Aluminium extrusions, mesh, hardware and locks for fabricators, glaziers and builders.
          </p>
        </div>
        <div className="md:col-span-5">
          <h2 className="text-sm font-semibold">Ranges</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted">
            {RANGES.map((r) => (
              <li key={r.id}>
                <Link href={rangeHref(r)} className="transition-colors hover:text-ink">
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-8 md:col-span-3">
          <div>
            <h2 className="text-sm font-semibold">Trade counter</h2>
            <address className="mt-4 space-y-1 text-sm not-italic text-muted">
              <p>{SITE.address.street}</p>
              <p>
                {SITE.address.suburb} {SITE.address.state} {SITE.address.postcode}
              </p>
              <p>{SITE.hoursShort}</p>
            </address>
          </div>
          <div className="space-y-1 text-sm">
            <a href={SITE.phoneHref} className="block font-mono hover:text-accent">
              {SITE.phone}
            </a>
            <a href={SITE.mobileHref} className="block font-mono hover:text-accent">
              {SITE.mobile}
            </a>
            <a href={`mailto:${SITE.email}`} className="block hover:text-accent">
              {SITE.email}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-4 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>{SITE.legalName}</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Footer">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-ink">
                {n.label}
              </Link>
            ))}
            <Link href="/quote" className="hover:text-ink">
              Quote list
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
