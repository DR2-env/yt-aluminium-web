import type { Metadata } from "next";
import Image from "next/image";
import { LinkButton } from "@/components/ui/Button";
import { CODE_COUNT, RANGES } from "@/lib/catalogue";
import { COLOUR_CODES } from "@/lib/finishes";

export const metadata: Metadata = {
  title: "About",
  description: "YT Aluminium is a Milperra-based trade supplier of aluminium profiles, mesh, hardware and locks for fabricators, glaziers and builders.",
};

const FACTS = [
  { value: `${RANGES.length}`, label: "product ranges" },
  { value: `${CODE_COUNT}`, label: "stocked codes" },
  { value: `${COLOUR_CODES.length}`, label: "finishes" },
  { value: "20+", label: "years in the industry" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-24 pt-10 md:px-8 md:pt-14">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h1 className="text-4xl font-semibold tracking-tighter md:text-6xl">A trade supplier that knows the systems it sells.</h1>
          <div className="mt-8 max-w-[60ch] space-y-5 text-lg leading-relaxed text-muted">
            <p>
              YT Aluminium supplies aluminium extrusions, accessories, mesh, hardware and locks to installers, fabricators, glaziers and builders. Our trade counter and warehouse are in Milperra, in Sydney&rsquo;s south west.
            </p>
            <p>
              We keep deep stock across shopfront, door and window, security, flyscreen and partition systems, in the finishes the trade actually orders. No order is too small, and we deliver across the Sydney area.
            </p>
            <p>We work to your list and your deadline. Call, message or walk in, and you will talk to someone who can answer the question.</p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <LinkButton href="/products">Browse the range</LinkButton>
            <LinkButton href="/contact" variant="secondary">Contact us</LinkButton>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-line lg:col-span-6">
          <Image
            src="https://images.unsplash.com/photo-1741655262435-4890ab9918fa?auto=format&fit=crop&w=1400&q=80"
            alt="Aluminium profiles racked in a warehouse"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover grayscale-[35%]"
            priority
          />
        </div>
      </div>

      <dl className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        {FACTS.map((f) => (
          <div key={f.label} className="bg-surface p-6 md:p-8">
            <dd className="font-mono text-4xl font-semibold tracking-tight md:text-5xl">{f.value}</dd>
            <dt className="mt-2 text-sm text-muted">{f.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
