import type { Metadata } from "next";
import { ExportBlock } from "@/components/site/export-block";
import { ProgressDashboard } from "@/components/site/progress-dashboard";
import {
  AVAILABLE_LEVELS,
  getAllQuizzes,
  getPages,
} from "@/lib/content";

export const metadata: Metadata = { title: "Your progress" };

export default function ProgressPage() {
  // Full pages and quizzes are passed to the Markdown export builder so it
  // can read titles, prompts, exercise headings, etc. The dashboard's slim
  // metadata projection is kept separate to avoid bloating its props.
  const allPages = getPages();
  const allQuizzes = getAllQuizzes();

  const levelData = AVAILABLE_LEVELS.map((level) => ({
    level,
    pages: allPages
      .filter((p) => p.level === level)
      .map((p) => ({ id: p.id, title: p.title, page: p.page })),
  }));
  const quizMeta = allQuizzes.map((q) => ({
    id: q.id,
    level: q.level,
    page: q.page,
    title: q.title,
    totalQuestions: q.questions.length,
  }));

  const exportPages = allPages.map((p) => ({
    id: p.id,
    level: p.level,
    page: p.page,
    title: p.title,
    body: p.body,
    rawBody: p.rawBody,
    order: p.order,
  }));

  return (
    <main id="main-content" tabIndex={-1} className="focus:outline-none">
      {/* Header band */}
      <header className="border-b border-rule bg-paper-3 px-[22px] pb-5 pt-5 md:px-14 md:pt-10">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3">
          Progress
        </p>
        <h1 className="mb-1.5 mt-2 font-display text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-ink md:text-[40px]">
          Your progress
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.55] text-ink-2 md:text-[15px]">
          Stored on this device only. Mark pages complete from the bottom of each page; tick self-check items as you go.
        </p>
      </header>

      <ProgressDashboard levels={levelData} quizMeta={quizMeta} />

      <div className="border-t border-rule bg-paper-3 px-[22px] pb-12 pt-5 md:px-14 md:pt-8">
        <ExportBlock pages={exportPages} quizzes={allQuizzes} />
      </div>
    </main>
  );
}
