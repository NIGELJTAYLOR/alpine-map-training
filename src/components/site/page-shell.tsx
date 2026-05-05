import Link from "next/link";
import type { ReactNode } from "react";
import type { Page } from "@/lib/content";

interface PageShellProps {
  page: Page;
  prev?: Page;
  next?: Page;
  children: ReactNode;
}

export function PageShell({ page, prev, next, children }: PageShellProps) {
  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <Breadcrumb
          level={page.level}
          section={page.section}
          pageCode={page.page}
        />

        <header className="mt-5 mb-8">
          <h1 className="font-display text-3xl font-medium leading-tight tracking-[-0.015em] text-ink sm:text-[44px]">
            {page.title}
          </h1>
          {page.learningAim ? (
            <aside className="surface-card mt-6 border-l-[3px] border-l-contour bg-paper-3 p-5">
              <p className="eyebrow eyebrow-contour">Learning aim</p>
              <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink-2">
                {page.learningAim}
              </p>
            </aside>
          ) : null}
        </header>

        <div className="mdx-body">{children}</div>

        <PrevNext prev={prev} next={next} level={page.level} />
      </article>
    </main>
  );
}

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
    <nav className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3">
      <Link href={`/levels/${level}`} className="hover:text-ink">
        Workbook · Level {level}
      </Link>
      <span className="mx-2 text-rule">/</span>
      <span>{section}</span>
      <span className="mx-2 text-rule">/</span>
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
    <nav className="mt-12 flex items-stretch justify-between gap-3 border-t border-rule pt-6">
      {prev ? (
        <Link
          href={`/levels/${level}/${prev.page}`}
          className="group flex flex-1 flex-col rounded-md border border-rule bg-paper-3 p-3 transition-colors hover:border-ink"
        >
          <span className="eyebrow">← Previous</span>
          <span className="mt-1 font-display text-base font-medium text-ink group-hover:text-ink-2">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/levels/${level}/${next.page}`}
          className="group flex flex-1 flex-col rounded-md border border-rule bg-paper-3 p-3 text-right transition-colors hover:border-ink"
        >
          <span className="eyebrow">Next →</span>
          <span className="mt-1 font-display text-base font-medium text-ink group-hover:text-ink-2">
            {next.title}
          </span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}
