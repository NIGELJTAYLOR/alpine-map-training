import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { GLOSSARY, getAllTermsAlpha } from "@/data/glossary";

export const metadata: Metadata = { title: "Glossary" };

export default function GlossaryPage() {
  const terms = getAllTermsAlpha();

  // Group by first letter for the index column
  const byLetter: Record<string, typeof GLOSSARY> = {};
  for (const t of terms) {
    const letter = t.term[0]?.toUpperCase() ?? "";
    if (!byLetter[letter]) byLetter[letter] = [];
    byLetter[letter].push(t);
  }
  const letters = Object.keys(byLetter).sort();

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-10 sm:py-14 focus:outline-none"
      >
        <header className="mb-10">
          <p className="eyebrow eyebrow-contour">Reference</p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            Glossary
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
            {terms.length} terms across the workbook. Tagged by Level so you
            can build vocabulary in step with the syllabus.
          </p>
        </header>

        {/* Alphabet jump-strip */}
        <nav
          aria-label="Jump by letter"
          className="surface-card mb-10 flex flex-wrap gap-1 p-3"
        >
          {letters.map((l) => (
            <a
              key={l}
              href={`#letter-${l}`}
              className="rounded-[3px] px-2 py-1 font-mono text-[12px] uppercase text-ink-3 hover:bg-paper-2 hover:text-ink"
            >
              {l}
            </a>
          ))}
        </nav>

        {letters.map((letter) => (
          <section
            key={letter}
            id={`letter-${letter}`}
            className="mb-10 scroll-mt-24"
          >
            <h2 className="mb-4 font-display text-2xl font-medium tracking-[-0.01em] text-contour">
              {letter}
            </h2>
            <dl className="space-y-6">
              {byLetter[letter].map((t) => (
                <div
                  key={t.id}
                  id={t.id}
                  className="scroll-mt-24 border-l-[3px] border-l-rule pl-4 hover:border-l-contour"
                >
                  <dt className="flex flex-wrap items-baseline gap-2">
                    <span className="font-display text-lg font-medium text-ink">
                      {t.term}
                    </span>
                    {t.tags
                      .filter((tag) => tag !== "cross")
                      .map((tag) => (
                        <span key={tag} className="page-code">
                          {tag}
                        </span>
                      ))}
                  </dt>
                  <dd className="mt-2 font-sans text-[14px] leading-relaxed text-ink-2">
                    {t.short}
                  </dd>
                  {t.long ? (
                    <dd className="mt-2 font-sans text-[14px] leading-relaxed text-ink-2">
                      {t.long}
                    </dd>
                  ) : null}
                  {t.seeAlso && t.seeAlso.length > 0 ? (
                    <dd className="mt-2 page-code">
                      See also:{" "}
                      {t.seeAlso.map((id, i) => {
                        const target = GLOSSARY.find((x) => x.id === id);
                        if (!target) return null;
                        return (
                          <span key={id}>
                            <a
                              href={`#${id}`}
                              className="text-contour hover:text-ink"
                            >
                              {target.term}
                            </a>
                            {i < t.seeAlso!.length - 1 ? " · " : ""}
                          </span>
                        );
                      })}
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          </section>
        ))}

        <p className="mt-12 border-t border-rule pt-6 page-code">
          Suggest an edit? <Link href="/about" className="text-contour hover:text-ink">About this build →</Link>
        </p>
      </main>
    </>
  );
}
