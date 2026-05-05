import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { QuizPlayer } from "@/components/site/quiz/quiz-player";
import { getAllQuizzes, getQuiz } from "@/lib/content";

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

        <QuizPlayer quiz={quiz} />
      </main>
    </>
  );
}
