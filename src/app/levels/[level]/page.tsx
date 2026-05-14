import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LevelIndexView } from "@/components/site/level-index/level-index-view";
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

const LEVEL_TITLES: Record<
  number,
  { name: string; tagline: string; word: string }
> = {
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
  const meta =
    LEVEL_TITLES[level] ?? { name: `Level ${level}`, word: String(level), tagline: "" };

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      <LevelIndexView
        level={level}
        levelWord={meta.word}
        levelName={meta.name}
        levelTagline={meta.tagline}
        pages={pages}
        diagramCount={diagrams.length}
      />
    </main>
  );
}
