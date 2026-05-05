import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import {
  LevelProgressBar,
  PageStatusBadge,
} from "@/components/site/progress-indicators";
import { getPages, getDiagramsForLevel } from "@/lib/content";

interface PageProps {
  params: Promise<{ level: string }>;
}

export async function generateStaticParams() {
  return [{ level: "1" }, { level: "2" }, { level: "3" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params;
  return { title: `Level ${level}` };
}

const LEVEL_TITLES: Record<number, { name: string; tagline: string; word: string }> = {
  1: {
    name: "Map literacy",
    word: "ONE",
    tagline:
      "Scale, grid references, contour reading, symbol recognition. The fundamentals — finished here, the rest is craft.",
  },
  2: {
    name: "Terrain interpretation",
    word: "TWO",
    tagline:
      "Read shape before steepness. Summit forms, ridges, gullies, aspect, slope angle, terrain traps.",
  },
  3: {
    name: "Navigation toolkit",
    word: "THREE",
    tagline:
      "Compass, altimeter, route cards, pacing, timing, attack points, and poor-vis techniques.",
  },
};

export default async function LevelIndex({ params }: PageProps) {
  const { level: levelStr } = await params;
  const level = parseInt(levelStr, 10);
  if (Number.isNaN(level)) notFound();

  const pages = getPages(level);
  if (pages.length === 0) notFound();

  const diagrams = getDiagramsForLevel(level);
  const meta = LEVEL_TITLES[level] ?? { name: `Level ${level}`, word: String(level), tagline: "" };
  const pageIds = pages.map((p) => p.id);

  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-3xl px-4 py-10 sm:py-14 focus:outline-none"
      >
        {/* ===== Hero band ===== */}
        <div className="border-b border-rule pb-8">
          <Link
            href="/"
            className="eyebrow inline-flex items-center gap-1 hover:text-ink"
          >
            ← Home
          </Link>
          <p className="eyebrow eyebrow-contour mt-6">Level {meta.word}</p>
          <p className="mt-3 font-display text-[80px] font-medium leading-none tracking-[-0.025em] text-contour sm:text-[96px]">
            0{level}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[36px]">
            {meta.name}
          </h1>
          <p className="mt-3 max-w-[55ch] font-sans text-base leading-relaxed text-ink-2">
            {meta.tagline}
          </p>
          <div className="mt-6">
            <LevelProgressBar pageIds={pageIds} />
          </div>
        </div>

        {/* ===== Page list ===== */}
        <ol className="mt-8 divide-y divide-rule overflow-hidden rounded-md border border-rule bg-paper-3">
          {pages.map((p) => (
            <li key={p.id}>
              <Link
                href={`/levels/${level}/${p.page}`}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-paper-2"
              >
                <PageStatusBadge pageId={p.id} />
                <span className="page-code w-14 shrink-0">
                  {p.kind === "contents"
                    ? "INTRO"
                    : p.kind === "reflection"
                    ? "END"
                    : p.kind === "quiz"
                    ? "QUIZ"
                    : p.page}
                </span>
                <span className="flex-1 font-sans text-[15px] text-ink">
                  {p.title}
                </span>
                <svg
                  className="h-3.5 w-3.5 text-ink-3"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden
                >
                  <path d="M5 2l5 5-5 5" />
                </svg>
              </Link>
            </li>
          ))}
        </ol>

        {diagrams.length > 0 ? (
          <p className="mt-6 text-center">
            <Link
              href={`/diagrams#L${level}`}
              className="font-sans text-sm text-ink-2 underline-offset-4 hover:text-ink hover:underline"
            >
              See all {diagrams.length} schematic diagrams for Level {level} →
            </Link>
          </p>
        ) : null}
      </main>
    </>
  );
}
