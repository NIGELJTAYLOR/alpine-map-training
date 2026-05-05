import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { QuizPlayer } from "@/components/site/quiz/quiz-player";
import { MapExtract } from "@/components/site/map-extract";
import { getAllQuizzes, getQuiz } from "@/lib/content";

const QUIZ_MAPS: Record<string, { id: string; title: string; markers: { label: string; description: string; color?: "crimson" | "ink" | "moss" | "amber" }[] }> = {
  "L2.C7.1": {
    id: "c7-1",
    title: "Section C7.1 — Mixed contour quiz",
    markers: [
      { label: "Q1", description: "Slope where contours are 2 mm apart (steepness reading)", color: "crimson" },
      { label: "Q2", description: "Aspect-reading point — slope falls towards the lower-right corner", color: "ink" },
      { label: "Q3", description: "Standing-description point for the four-part written response", color: "moss" },
    ],
  },
  "L3.D10.1": {
    id: "d10-1",
    title: "Section D10.1 — Mixed quiz",
    markers: [
      { label: "Q4", description: "Bearing setup point — take a grid bearing from here", color: "crimson" },
      { label: "F1", description: "First feature for resection (target ~90° angular separation from F2)", color: "ink" },
      { label: "F2", description: "Second feature for resection", color: "ink" },
    ],
  },
};

interface PageProps {
  params: Promise<{ level: string; page: string }>;
}

export async function generateStaticParams() {
  return getAllQuizzes().map((q) => ({
    level: String(q.level),
    page: q.page,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level, page } = await params;
  const q = getQuiz(parseInt(level, 10), page);
  if (!q) return {};
  return { title: q.title };
}

export default async function QuizRoute({ params }: PageProps) {
  const { level: levelStr, page: pageCode } = await params;
  const level = parseInt(levelStr, 10);
  const quiz = getQuiz(level, pageCode);
  if (!quiz) notFound();

  const mapCfg = QUIZ_MAPS[quiz.id];

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-10 sm:py-14 focus:outline-none">
        <nav className="eyebrow">
          <Link href={`/levels/${level}`} className="hover:text-ink">
            Level {level}
          </Link>
          <span className="mx-2 text-rule">/</span>
          <Link href={`/levels/${level}/${pageCode}`} className="hover:text-ink">
            {pageCode}
          </Link>
          <span className="mx-2 text-rule">/</span>
          <span className="text-ink">Interactive quiz</span>
        </nav>

        <header className="mt-5 mb-8">
          <h1 className="font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            {quiz.title}
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
            {quiz.intro}
          </p>
        </header>

        {mapCfg ? (
          <MapExtract
            id={mapCfg.id}
            title={mapCfg.title}
            caption="Use this extract for the questions that reference Q1, Q2, Q3 (or F1/F2 on the L3 quiz). Numbered points are approximate; the workbook is calibrated against your trainer's printed extract — this is here so you can practise solo."
            markers={mapCfg.markers}
          />
        ) : null}

        <QuizPlayer quiz={quiz} />
      </main>
    </>
  );
}
