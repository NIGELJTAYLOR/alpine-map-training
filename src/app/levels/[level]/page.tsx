import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { getPages } from "@/lib/content";

interface PageProps {
  params: Promise<{ level: string }>;
}

export async function generateStaticParams() {
  return [{ level: "1" }];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params;
  return { title: `Level ${level}` };
}

export default async function LevelIndex({ params }: PageProps) {
  const { level: levelStr } = await params;
  const level = parseInt(levelStr, 10);
  if (Number.isNaN(level)) notFound();

  const pages = getPages(level);
  if (pages.length === 0) notFound();

  const sections = groupBySection(pages);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Level {level}
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Map Literacy Foundations
          </h1>
          <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
            {pages.length} pages, working from map basics through to a Level 1 check quiz and reflection.
          </p>
        </header>

        <ol className="space-y-2">
          {pages.map((p) => (
            <li
              key={p.id}
              className="rounded-lg border border-border transition-colors hover:border-primary"
            >
              <Link
                href={`/levels/${level}/${p.page}`}
                className="flex items-baseline gap-3 p-3"
              >
                <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">
                  {p.kind === "contents"
                    ? "Intro"
                    : p.kind === "reflection"
                    ? "End"
                    : p.kind === "quiz"
                    ? "Quiz"
                    : p.page}
                </span>
                <span className="font-sans text-base text-foreground">{p.title}</span>
              </Link>
            </li>
          ))}
        </ol>

        {Object.keys(sections).length > 1 ? (
          <details className="mt-8 rounded-lg border border-border p-4">
            <summary className="cursor-pointer font-sans text-sm text-muted-foreground">
              Section breakdown
            </summary>
            <ul className="mt-3 space-y-1 font-sans text-sm">
              {Object.entries(sections).map(([section, count]) => (
                <li key={section}>
                  <span className="font-medium">{section}</span>{" "}
                  <span className="text-muted-foreground">— {count} page(s)</span>
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </main>
    </>
  );
}

function groupBySection(pages: ReturnType<typeof getPages>) {
  const counts: Record<string, number> = {};
  for (const p of pages) counts[p.section] = (counts[p.section] ?? 0) + 1;
  return counts;
}
