import { LinkButton } from "@/components/ui/Button";
import { getDictionary } from "@/i18n";

// Rendered for unknown product codes and paths. Shown in English because the
// language segment may itself be the invalid part of the URL.
export default function NotFound() {
  const d = getDictionary("en");
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-24 md:px-8">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{d.notFound.title}</h1>
      <p className="mt-3 max-w-[50ch] text-muted">{d.notFound.text}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/products">{d.notFound.search}</LinkButton>
        <LinkButton href="/contact" variant="secondary">
          {d.nav.contact}
        </LinkButton>
      </div>
    </div>
  );
}
