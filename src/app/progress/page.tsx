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
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8 sm:py-10 focus:outline-none">
        <header className="mb-8">
          <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Personal
          </p>
          <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Your progress
          </h1>
          <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
            Stored on this device only. Mark pages complete from the bottom of
            each page; tick self-check items as you go.
          </p>
        </header>

        <ProgressDashboard levels={levelData} quizMeta={quizMeta} />
      </main>
    </>
  );
}
