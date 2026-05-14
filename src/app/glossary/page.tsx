import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY, getAllTermsAlpha } from "@/data/glossary";

export const metadata: Metadata = { title: "Glossary" };

export default function GlossaryPage() {
  const terms = getAllTermsAlpha();

  const byLetter: Record<string, typeof GLOSSARY> = {};
  for (const t of terms) {
    const letter = t.term[0]?.toUpperCase() ?? "";
    if (!byLetter[letter]) byLetter[letter] = [];
    byLetter[letter].push(t);
  }
  const letters = Object.keys(byLetter).sort();

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* Header band */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Reference
        </p>
        <h1 className="mb-1.5 mt-2 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          Glossary
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          {terms.length} terms across the workbook. Tagged by level so you can
          build vocabulary in step with the syllabus.
        </p>
      </header>

      <div className="px-[22px] pb-12 pt-5 md:mx-auto md:max-w-3xl md:px-14 md:pt-8">
        {/* Alphabet jump-strip */}
        <nav
          aria-label="Jump by letter"
          className="sticky top-0 z-10 mb-6 flex flex-wrap gap-1 border border-rule bg-paper-3 p-2 md:top-2"
        >
          {letters.map((l) => (
            <a
              key={l}
              href={`#letter-${l}`}
              className="rounded-[2px] px-2 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-3 no-underline hover:bg-paper hover:text-ink"
            >
              {l}
            </a>
          ))}
        </nav>

        {letters.map((letter) => (
          <section
            key={letter}
            id={`letter-${letter}`}
            className="mb-8 scroll-mt-24"
          >
            <h2 className="mb-3 font-display text-[28px] font-extrabold tracking-[-0.02em] text-red">
              {letter}
            </h2>
            <dl className="flex flex-col">
              {byLetter[letter].map((t) => (
                <div
                  key={t.id}
                  id={t.id}
                  className="scroll-mt-24 border-l-[3px] border-l-rule border-y border-y-rule bg-paper-3 px-4 py-4 first:border-t-rule [&:not(:first-child)]:border-t-0 hover:border-l-red"
                >
                  <dt className="flex flex-wrap items-baseline gap-2">
                    <span className="font-display text-[17px] font-bold tracking-[-0.012em] text-ink">
                      {t.term}
                    </span>
                    {t.tags
                      .filter((tag) => tag !== "cross")
                      .map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                  </dt>
                  <dd className="mt-2 text-[14px] leading-[1.55] text-ink-2">
                    {t.short}
                  </dd>
                  {t.long ? (
                    <dd className="mt-2 text-[14px] leading-[1.55] text-ink-2">
                      {t.long}
                    </dd>
                  ) : null}
                  {t.seeAlso && t.seeAlso.length > 0 ? (
                    <dd className="mt-3 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
                      See also:{" "}
                      {t.seeAlso.map((id, i) => {
                        const target = GLOSSARY.find((x) => x.id === id);
                        if (!target) return null;
                        return (
                          <span key={id}>
                            <a
                              href={`#${id}`}
                              className="text-red hover:text-ink"
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

        <p className="mt-10 border-t border-rule pt-6 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-ink-3">
          Suggest an edit?{" "}
          <Link href="/about" className="text-red hover:text-ink">
            About this build →
          </Link>
        </p>
      </div>
    </main>
  );
}
