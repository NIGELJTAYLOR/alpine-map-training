import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LevelCompleteView } from "@/components/site/level-complete/level-complete-view";
import {
  AVAILABLE_LEVELS,
  getAllQuizzes,
  getPages,
} from "@/lib/content";

interface PageProps {
  params: Promise<{ level: string }>;
}

export function generateStaticParams() {
  return AVAILABLE_LEVELS.map((level) => ({ level: String(level) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { level } = await params;
  return { title: `Level ${level} complete` };
}

const LEVEL_TITLES: Record<
  number,
  { name: string; word: string; tagline: string }
> = {
  1: {
    name: "Map literacy",
    word: "ONE",
    tagline: "You can read the map.",
  },
  2: {
    name: "Terrain interpretation",
    word: "TWO",
    tagline: "You can read the terrain.",
  },
  3: {
    name: "Navigation toolkit",
    word: "THREE",
    tagline: "You can carry the tools.",
  },
};

export default async function LevelCompletePage({ params }: PageProps) {
  const { level: levelStr } = await params;
  const level = parseInt(levelStr, 10);
  if (Number.isNaN(level)) notFound();

  const pages = getPages(level);
  if (pages.length === 0) notFound();

  const meta =
    LEVEL_TITLES[level] ?? { name: `Level ${level}`, word: String(level), tagline: "" };

  // Level quizzes that exist (we surface the most recent score in the view).
  const quizzes = getAllQuizzes()
    .filter((q) => q.level === level)
    .map((q) => ({
      id: q.id,
      title: q.title,
      totalQuestions: q.questions.length,
    }));

  const nextLevel = level < 3 ? level + 1 : null;
  const nextMeta = nextLevel ? LEVEL_TITLES[nextLevel] : null;

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <LevelCompleteView
        level={level}
        levelWord={meta.word}
        levelName={meta.name}
        levelTagline={meta.tagline}
        pageIds={pages.map((p) => p.id)}
        quizzes={quizzes}
        nextLevel={nextLevel}
        nextLevelName={nextMeta?.name ?? null}
      />
    </main>
  );
}
