import type { ReactNode } from "react";

export type LegalSection = [title: string, paragraphs: ReactNode[]];

interface Props {
  title: string;
  /** Shown on translated pages: the policy itself is in English. */
  englishNote?: string;
  updated: string;
  sections: LegalSection[];
}

// Shared layout for the privacy and cookie policies. The policy text is English on every
// language version so there is one authoritative wording.
export function LegalPage({ title, englishNote, updated, sections }: Props) {
  return (
    <div className="mx-auto max-w-[860px] px-4 pb-20 pt-12 md:px-8 md:pt-16">
      <h1 className="display text-5xl md:text-6xl">{title}</h1>
      {englishNote && <p className="mt-4 text-muted">{englishNote}</p>}
      <article lang="en" dir="ltr" className="mt-10 space-y-10">
        <p className="eyebrow text-muted">Last updated {updated}</p>
        {sections.map(([heading, paras]) => (
          <section key={heading}>
            <h2 className="text-2xl font-light">{heading}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-muted [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4">
              {paras.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}
