import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 py-28 md:px-8">
      <p className="font-mono text-sm text-muted">404</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tighter md:text-6xl">That page is not on the shelf.</h1>
      <p className="mt-4 max-w-[50ch] text-muted">Search the catalogue by code or name, or get in touch and we will find it for you.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href="/products">Search products</LinkButton>
        <LinkButton href="/contact" variant="secondary">Contact us</LinkButton>
      </div>
    </div>
  );
}
