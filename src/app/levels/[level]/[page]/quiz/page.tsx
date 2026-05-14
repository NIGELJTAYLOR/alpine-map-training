import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { QuizPlayer } from "@/components/site/quiz/quiz-player";
import { MapExtract } from "@/components/site/map-extract";
import { getAllQuizzes, getQuiz } from "@/lib/content";

const QUIZ_MAPS: Record<
  string,
  {
    id: string;
    title: string;
    markers: { label: string; description: string; color?: "crimson" | "ink" | "moss" | "amber" }[];
  }
> = {
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
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* Header band */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <nav className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
          <Link href="/" className="no-underline hover:text-ink">
            Home
          </Link>
          <ChevronRight className="h-2 w-2" aria-hidden />
          <Link
            href={`/levels/${level}`}
            className="no-underline hover:text-ink"
          >
            Level {level}
          </Link>
          <ChevronRight className="h-2 w-2" aria-hidden />
          <Link
            href={`/levels/${level}/${pageCode}`}
            className="no-underline hover:text-ink"
          >
            {pageCode}
          </Link>
          <ChevronRight className="h-2 w-2" aria-hidden />
          <span className="text-red">Quiz</span>
        </nav>
        <h1 className="mb-1.5 mt-3 font-display text-[30px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[48px]">
          {quiz.title}
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          {quiz.intro}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="tag red">
            <span className="dot" />
            Quiz · {quiz.questions.length} questions
          </span>
          <span className="tag">Auto-graded + self-mark</span>
        </div>
      </header>

      {/* Optional map extract */}
      {mapCfg ? (
        <div className="px-[22px] pt-6 md:px-14">
          <MapExtract
            id={mapCfg.id}
            title={mapCfg.title}
            caption="Use this extract for the questions that reference the marked points. Numbered points are approximate; the workbook is calibrated against your trainer's printed extract — this is here so you can practise solo."
            markers={mapCfg.markers}
          />
        </div>
      ) : null}

      {/* Quiz body */}
      <div className="px-[22px] pb-10 pt-4 md:px-14 md:pt-6">
        <QuizPlayer quiz={quiz} />
      </div>
    </main>
  );
}
