import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { ProgressDashboard } from "@/components/site/progress-dashboard";
import {
  AVAILABLE_LEVELS,
  getAllQuizzes,
  getPages,
} from "@/lib/content";

export const metadata: Metadata = { title: "Your progress" };

export default function ProgressPage() {
  const levelData = AVAILABLE_LEVELS.map((level) => ({
    level,
    pages: getPages(level).map((p) => ({
      id: p.id,
      title: p.title,
      page: p.page,
    })),
  }));
  const quizMeta = getAllQuizzes().map((q) => ({
    id: q.id,
    level: q.level,
    page: q.page,
    title: q.title,
    totalQuestions: q.questions.length,
  }));

  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-10 sm:py-14 focus:outline-none">
        <header className="mb-10">
          <p className="eyebrow eyebrow-contour">Where you are</p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-[-0.015em] text-ink sm:text-[44px]">
            Your progress
          </h1>
          <p className="mt-3 font-sans text-base leading-relaxed text-ink-2">
            Stored on this device only. Mark pages complete from the bottom of
            each page; tick self-check items as you go.
          </p>
        </header>

        <ProgressDashboard levels={levelData} quizMeta={quizMeta} />
      </main>
    </>
  );
}
