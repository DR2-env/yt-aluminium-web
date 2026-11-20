import { SITE } from "@/lib/site";
import { LOCALE_META, fmt, getDictionary, type Locale } from "@/i18n";

/** Christmas closure notice. Renders nothing until both dates are set in src/lib/site.ts. */
export function ClosureNotice({ lang, className = "" }: { lang: Locale; className?: string }) {
  const { from, to } = SITE.closure as { from: string; to: string };
  if (!from || !to) return null;
  const d = getDictionary(lang);
  const date = (iso: string) =>
    new Intl.DateTimeFormat(LOCALE_META[lang].htmlLang, { weekday: "short", day: "numeric", month: "long", timeZone: "Australia/Sydney" }).format(new Date(`${iso}T12:00:00+10:00`));
  return (
    <div className={`border-b border-line bg-accent-soft ${className}`} role="note">
      <p className="mx-auto max-w-[1280px] px-4 py-2.5 text-sm md:px-8">
        <span className="font-medium">{d.closure.title}: </span>
        {fmt(d.closure.text, { from: date(from), to: date(to) })}
      </p>
    </div>
  );
}
