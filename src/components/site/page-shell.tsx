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
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Breadcrumb level={page.level} section={page.section} pageCode={page.page} />

      <header className="mt-4 mb-8">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {page.title}
        </h1>
        {page.learningAim ? (
          <aside className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Learning aim
            </p>
            <p className="mt-1 font-serif text-base leading-relaxed text-foreground">
              {page.learningAim}
            </p>
          </aside>
        ) : null}
      </header>

      <div className="mdx-body">{children}</div>

      <PrevNext prev={prev} next={next} level={page.level} />
    </article>
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
    <nav className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
      <Link href={`/levels/${level}`} className="hover:text-foreground">
        Level {level}
      </Link>
      <span className="mx-2 opacity-50">/</span>
      <span>{section}</span>
      <span className="mx-2 opacity-50">/</span>
      <span className="text-foreground">{pageCode}</span>
    </nav>
  );
}

function PrevNext({ prev, next, level }: { prev?: Page; next?: Page; level: number }) {
  if (!prev && !next) return null;
  return (
    <nav className="mt-12 flex items-stretch justify-between gap-3 border-t border-border pt-6">
      {prev ? (
        <Link
          href={`/levels/${level}/${prev.page}`}
          className="group flex flex-1 flex-col rounded-lg border border-border p-3 hover:border-primary"
        >
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            ← Previous
          </span>
          <span className="mt-1 font-sans text-sm font-medium text-foreground group-hover:text-primary">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
      {next ? (
        <Link
          href={`/levels/${level}/${next.page}`}
          className="group flex flex-1 flex-col rounded-lg border border-border p-3 text-right hover:border-primary"
        >
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Next →
          </span>
          <span className="mt-1 font-sans text-sm font-medium text-foreground group-hover:text-primary">
            {next.title}
          </span>
        </Link>
      ) : (
        <span className="flex-1" />
      )}
    </nav>
  );
}
