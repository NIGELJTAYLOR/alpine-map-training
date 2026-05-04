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
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-8 sm:py-10 focus:outline-none">
        <nav className="font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Link href={`/levels/${level}`} className="hover:text-foreground">
            Level {level}
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <Link href={`/levels/${level}/${pageCode}`} className="hover:text-foreground">
            {pageCode}
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-foreground">Interactive quiz</span>
        </nav>

        <header className="mt-4 mb-6">
          <h1 className="font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {quiz.title}
          </h1>
          <p className="mt-3 font-serif text-base leading-relaxed text-muted-foreground">
            {quiz.intro}
          </p>
        </header>

        <QuizPlayer quiz={quiz} />
      </main>
    </>
  );
}
