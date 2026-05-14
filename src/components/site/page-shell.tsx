import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, ArrowLeft } from "lucide-react";
import type { Page } from "@/lib/content";
import { PageRightRail } from "@/components/site/page-right-rail";

interface PageShellProps {
  page: Page;
  prev?: Page;
  next?: Page;
  /** Linked flashcards for the right rail (already filtered to this page). */
  linkedCards?: ReadonlyArray<{ id: string; title: string }>;
  children: ReactNode;
}

/**
 * Glacier Lab workbook page shell.
 *
 * Mobile: top crumb, display title + sub, mono-caps meta tags, red-left
 * Learning aim card, MDX body, prev/next pager.
 *
 * Desktop: a two-column grid inside the chrome's right column — main
 * content (max-width 760) on the left + sticky right rail (280) on the
 * right showing status, linked cards and a Review CTA.
 */
export function PageShell({
  page,
  prev,
  next,
  linkedCards = [],
  children,
}: PageShellProps) {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <div className="md:grid md:grid-cols-[minmax(0,_1fr)_280px]">
        {/* ===== MAIN COLUMN ===== */}
        <article className="min-w-0">
          {/* Header band */}
          <header className="border-b border-rule bg-paper-3 px-[22px] pb-4 pt-5 md:bg-transparent md:px-14 md:pt-10">
            <Breadcrumb level={page.level} section={page.section} pageCode={page.page} />
            <h1 className="mb-1 mt-3 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[48px]">
              {page.title}
            </h1>
            <p className="pb-3.5 text-[14px] text-ink-2 md:max-w-[62ch] md:text-[15px]">
              {pageSubLine(page)}
            </p>
            <div className="flex flex-wrap gap-1.5 pb-2">
              <span className="tag ice">
                <span
                  className="dot"
                  style={{ background: "var(--ice)" }}
                />
                {kindLabel(page)}
              </span>
              {page.exerciseCount ? (
                <span className="tag">
                  {page.exerciseCount} exercise{page.exerciseCount === 1 ? "" : "s"}
                </span>
              ) : null}
              {page.selfCheckCount ? (
                <span className="tag">
                  {page.selfCheckCount} self-check{page.selfCheckCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          </header>

          {/* Learning aim card */}
          {page.learningAim ? (
            <aside className="mx-[22px] mt-[18px] border border-rule border-l-[3px] border-l-red bg-paper-3 px-4 py-3.5 md:mx-14 md:mt-5 md:px-5 md:py-4">
              <p className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-red">
                Learning aim
              </p>
              <p className="text-[14px] leading-[1.5] text-ink-2 md:text-[15px]">
                {page.learningAim}
              </p>
            </aside>
          ) : null}

          {/* MDX body and other inline content */}
          <div className="mdx-body px-[22px] pb-2 pt-4 md:px-14 md:pt-6">
            {children}
          </div>

          {/* Prev/next pager */}
          <PrevNext prev={prev} next={next} level={page.level} />
        </article>

        {/* ===== RIGHT RAIL (desktop only) ===== */}
        <aside className="no-print hidden md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto md:border-l md:border-rule md:bg-paper-3 md:px-6 md:py-8">
          <PageRightRail pageId={page.id} linkedCards={linkedCards} />
        </aside>
      </div>
    </main>
  );
}

/* ---------- subcomponents ---------- */

function Breadcrumb({
  level,
  section,
  pageCode,
}: {
  level: number;
  section: string;
  pageCode: string;
}) {
  return (
    <nav className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
      <Link href={`/levels/${level}`} className="no-underline hover:text-ink">
        Workbook
      </Link>
      <ChevronRight className="h-2 w-2" aria-hidden />
      <Link href={`/levels/${level}`} className="text-ink-2 no-underline hover:text-ink">
        Level {level}
      </Link>
      <ChevronRight className="h-2 w-2" aria-hidden />
      <span className="text-ink">{section}</span>
      <ChevronRight className="h-2 w-2" aria-hidden />
      <span className="text-ink">{pageCode}</span>
    </nav>
  );
}

function PrevNext({
  prev,
  next,
  level,
}: {
  prev?: Page;
  next?: Page;
  level: number;
}) {
  if (!prev && !next) return null;
  return (
    <nav className="mt-8 flex items-stretch justify-between gap-3 border-t border-rule bg-paper-3 px-[22px] py-4 md:mt-10 md:bg-transparent md:px-14 md:py-6">
      {prev ? (
        <Link
          href={`/levels/${level}/${prev.page}`}
          className="group flex min-w-0 max-w-[48%] flex-col gap-0.5 text-ink no-underline hover:text-ink"
        >
          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            <ArrowLeft className="h-2.5 w-2.5" aria-hidden />
            Previous
          </span>
          <span className="truncate font-display text-[13px] font-bold leading-tight tracking-[-0.01em] text-ink group-hover:text-ink-2">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/levels/${level}/${next.page}`}
          className="group flex min-w-0 max-w-[48%] flex-col items-end gap-0.5 text-ink no-underline hover:text-ink"
        >
          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-red">
            Next
            <ChevronRight className="h-2.5 w-2.5" aria-hidden />
          </span>
          <span className="truncate text-right font-display text-[13px] font-bold leading-tight tracking-[-0.01em] text-ink group-hover:text-ink-2">
            {next.title}
          </span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}

function kindLabel(page: Page): string {
  if (page.kind === "contents") return "Intro";
  if (page.kind === "reflection") return "Reflection";
  if (page.kind === "quiz") return "Quiz";
  return `${page.section} page`;
}

function pageSubLine(page: Page): string {
  const sectionAndCode = `Section ${page.section} · page ${page.page}`;
  if (page.kind === "quiz") return `${sectionAndCode}. Level check quiz.`;
  if (page.kind === "reflection") return `${sectionAndCode}. Level reflection.`;
  if (page.kind === "contents") return `${sectionAndCode}. Level introduction.`;
  return sectionAndCode;
}
