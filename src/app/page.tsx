import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { LevelProgressCount } from "@/components/site/progress-indicators";
import { ContourBackground, HeroArt } from "@/components/site/carta/contour-bg";
import {
  AVAILABLE_LEVELS,
  getPages,
  getDiagramsForLevel,
  getAllTemplates,
} from "@/lib/content";
import { FLASHCARDS } from "@/data/flashcards.generated";

const LEVEL_NAMES: Record<number, { name: string; desc: string }> = {
  1: {
    name: "Map literacy",
    desc: "Scale, grid references, contour reading, symbol recognition. The fundamentals — finished here, the rest is craft.",
  },
  2: {
    name: "Terrain interpretation",
    desc: "Reading shape before steepness. Summit forms, ridges, gullies, aspect, slope angle, terrain traps.",
  },
  3: {
    name: "Navigation toolkit",
    desc: "Compass, altimeter, route cards, pacing, timing, attack points, and poor-vis techniques.",
  },
};

export default function Home() {
  const allDiagrams = AVAILABLE_LEVELS.flatMap((l) => getDiagramsForLevel(l));
  const templates = getAllTemplates();

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="focus:outline-none"
      >
        {/* ===== Hero band ===== */}
        <section className="relative overflow-hidden border-b border-rule bg-paper-3">
          <ContourBackground opacity={0.32} />
          <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 sm:py-20 md:grid-cols-[1.4fr_1fr] md:gap-16 md:py-24">
            <div>
              <span className="pill pill-contour">Level 1 · Ready</span>
              <h1 className="mt-5 font-display text-4xl font-medium leading-[1.02] tracking-[-0.025em] text-ink sm:text-5xl md:text-6xl">
                Read the mountain<br />before you ski it.
              </h1>
              <p className="mt-5 max-w-[48ch] font-sans text-base leading-relaxed text-ink-2 sm:text-[17px]">
                The digital companion to your BASI Alpine Level 4 ISTD
                navigation workbook. {getPages().length} pages, {FLASHCARDS.length} cards,
                two graded quizzes — built for cold huts and quiet evenings.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/levels/1"
                  className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-ink bg-ink px-5 py-3 font-sans text-sm font-semibold text-paper hover:bg-ink-2"
                >
                  Continue Level 1 →
                </Link>
                <Link
                  href="/progress"
                  className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-rule bg-transparent px-5 py-3 font-sans text-sm font-semibold text-ink hover:border-ink"
                >
                  Open progress
                </Link>
              </div>
            </div>
            <div className="relative hidden h-[280px] md:block">
              <HeroArt className="h-full w-full" />
            </div>
          </div>
        </section>

        {/* ===== Three levels in order ===== */}
        <section className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink sm:text-[28px]">
              Three levels, in order.
            </h2>
            <span className="eyebrow eyebrow-contour">
              Workbook · {getPages().length} pages
            </span>
          </div>
          <ol className="grid gap-5 md:grid-cols-3">
            {AVAILABLE_LEVELS.map((level) => {
              const ids = getPages(level).map((p) => p.id);
              const meta = LEVEL_NAMES[level] ?? { name: `Level ${level}`, desc: "" };
              return (
                <li key={level}>
                  <Link
                    href={`/levels/${level}`}
                    className="group surface-card block min-h-[220px] p-7 transition-colors hover:border-ink"
                  >
                    <span className="eyebrow">Level {numWord(level)} · {ids.length} pages</span>
                    <p className="mt-2 font-display text-[56px] font-medium leading-none tracking-[-0.02em] text-contour">
                      0{level}
                    </p>
                    <p className="mt-3 font-display text-xl font-medium leading-tight text-ink group-hover:text-ink-2">
                      {meta.name}
                    </p>
                    <p className="mt-2 font-sans text-[13px] leading-relaxed text-ink-2">
                      {meta.desc}
                    </p>
                    <div className="mt-5">
                      <LevelProgressCount pageIds={ids} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ===== Reference shelf ===== */}
        <section className="border-t border-rule bg-paper-3/40">
          <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
            <div className="mb-6 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl font-medium tracking-[-0.01em] text-ink sm:text-[28px]">
                Reference shelf
              </h2>
              <span className="eyebrow eyebrow-contour">Always at hand</span>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <Link
                href="/flashcards"
                className="group surface-card flex items-center gap-5 p-6 transition-colors hover:border-ink"
              >
                <svg className="h-8 w-8 shrink-0 text-contour" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="5" width="14" height="14" rx="1.5" />
                  <rect x="7" y="9" width="14" height="14" rx="1.5" />
                </svg>
                <div className="min-w-0">
                  <p className="font-display text-lg font-medium text-ink group-hover:text-ink-2">
                    Flashcards
                  </p>
                  <p className="page-code mt-1">
                    {FLASHCARDS.length} cards · spaced repetition
                  </p>
                </div>
              </Link>
              <Link
                href="/diagrams"
                className="group surface-card flex items-center gap-5 p-6 transition-colors hover:border-ink"
              >
                <svg className="h-8 w-8 shrink-0 text-contour" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M3 18 Q 8 8, 13 12 T 21 6" />
                  <path d="M3 14 Q 8 4, 13 8 T 21 2" />
                </svg>
                <div className="min-w-0">
                  <p className="font-display text-lg font-medium text-ink group-hover:text-ink-2">
                    Schematic diagrams
                  </p>
                  <p className="page-code mt-1">
                    {allDiagrams.length} plates · contours, compass, slopes
                  </p>
                </div>
              </Link>
              <Link
                href="/templates"
                className="group surface-card flex items-center gap-5 p-6 transition-colors hover:border-ink"
              >
                <svg className="h-8 w-8 shrink-0 text-contour" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="3" width="16" height="18" rx="1" />
                  <path d="M8 8h8M8 12h8M8 16h5" />
                </svg>
                <div className="min-w-0">
                  <p className="font-display text-lg font-medium text-ink group-hover:text-ink-2">
                    Printable templates
                  </p>
                  <p className="page-code mt-1">
                    {templates.length} sheets · A4 print-ready
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function numWord(n: number): string {
  return ["zero", "one", "two", "three", "four", "five", "six"][n] ?? String(n);
}
