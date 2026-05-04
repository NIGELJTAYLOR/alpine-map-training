import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
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

const LEVEL_TITLES: Record<number, { name: string; tagline: string }> = {
  1: {
    name: "Map Literacy Foundations",
    tagline:
      "Map basics, structure, scale, grid references and orientation. The groundwork for everything that follows.",
  },
  2: {
    name: "Terrain Interpretation",
    tagline:
      "Reading contour shapes, judging steepness, recognising features and route choice from maps.",
  },
  3: {
    name: "Mountain Navigation Toolkit",
    tagline:
      "Compass work, altimeter use, route cards, decision points and the full IMS-aligned toolkit.",
  },
};

export default async function LevelIndex({ params }: PageProps) {
  const { level: levelStr } = await params;
  const level = parseInt(levelStr, 10);
  if (Number.isNaN(level)) notFound();

  const pages = getPages(level);
  if (pages.length === 0) notFound();

  const diagrams = getDiagramsForLevel(level);
  const meta = LEVEL_TITLES[level] ?? { name: `Level ${level}`, tagline: "" };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
        <header className="mb-8">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Level {level}
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {meta.name}
          </h1>
          {meta.tagline ? (
            <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
              {meta.tagline}
            </p>
          ) : null}
          <p className="mt-3 font-sans text-sm text-muted-foreground">
            {pages.length} pages
            {diagrams.length > 0 ? ` · ${diagrams.length} schematic diagrams` : ""}
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
                <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">
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

        {diagrams.length > 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
            <p className="font-sans text-sm">
              <Link
                href={`/diagrams#L${level}`}
                className="font-medium text-primary hover:underline"
              >
                See all {diagrams.length} schematic diagrams for Level {level} →
              </Link>
            </p>
          </div>
        ) : null}
      </main>
    </>
  );
}
