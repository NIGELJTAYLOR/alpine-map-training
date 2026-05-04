import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { LevelProgressCount } from "@/components/site/progress-indicators";
import {
  AVAILABLE_LEVELS,
  getPages,
  getDiagramsForLevel,
  getAllTemplates,
} from "@/lib/content";

const LEVEL_BLURBS: Record<number, string> = {
  1: "Map literacy foundations",
  2: "Terrain interpretation",
  3: "Mountain navigation toolkit",
};

export default function Home() {
  const allDiagrams = AVAILABLE_LEVELS.flatMap((l) => getDiagramsForLevel(l));
  const templates = getAllTemplates();
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10 sm:py-16 focus:outline-none">
        <header className="flex flex-col gap-3">
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Alpine Map Training
          </p>
          <h1 className="font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Levels 1 to 3 — digital companion
          </h1>
        </header>

        <div className="space-y-4 font-serif text-lg leading-relaxed text-foreground">
          <p>
            A Progressive Web App for the Alpine Map Training workbook,
            supporting BASI Alpine Level 4 ISTD candidates and their trainers.
          </p>
          <p>
            All three levels are now navigable, with {allDiagrams.length} schematic
            diagrams and {templates.length} printable templates. Interactive
            quizzes arrive in Session 4 and trainer mode in Session 7.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/levels/1" className={buttonVariants({ size: "lg" })}>
            Start Level 1
          </Link>
          <Button size="lg" variant="outline" disabled>
            Trainer mode (Session 7)
          </Button>
        </div>

        <section className="grid gap-3 sm:grid-cols-3">
          {AVAILABLE_LEVELS.map((level) => {
            const ids = getPages(level).map((p) => p.id);
            return (
              <Link
                key={level}
                href={`/levels/${level}`}
                className="group rounded-lg border border-border p-4 transition-colors hover:border-primary"
              >
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Level {level}
                </p>
                <p className="mt-1 font-sans text-base font-semibold text-foreground group-hover:text-primary">
                  {LEVEL_BLURBS[level] ?? `Level ${level}`}
                </p>
                <p className="mt-1">
                  <LevelProgressCount pageIds={ids} />
                </p>
              </Link>
            );
          })}
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/diagrams"
            className="group rounded-lg border border-border p-4 transition-colors hover:border-primary"
          >
            <p className="font-sans text-sm font-semibold text-foreground group-hover:text-primary">
              Schematic diagrams →
            </p>
            <p className="mt-1 font-sans text-xs text-muted-foreground">
              {allDiagrams.length} diagrams across L2 and L3
            </p>
          </Link>
          <Link
            href="/templates"
            className="group rounded-lg border border-border p-4 transition-colors hover:border-primary"
          >
            <p className="font-sans text-sm font-semibold text-foreground group-hover:text-primary">
              Templates →
            </p>
            <p className="mt-1 font-sans text-xs text-muted-foreground">
              {templates.length} printable forms
            </p>
          </Link>
        </section>
      </main>
    </>
  );
}
