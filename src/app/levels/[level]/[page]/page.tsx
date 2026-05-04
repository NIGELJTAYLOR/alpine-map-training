import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { PageShell } from "@/components/site/page-shell";
import { AnswerToggle } from "@/components/site/answer-toggle";
import { DiagramCard } from "@/components/site/diagram-card";
import { mdxComponents } from "@/components/mdx/components";
import { MDXContent } from "@/lib/mdx";
import { buttonVariants } from "@/components/ui/button";
import {
  getPage,
  getPages,
  getNeighbours,
  getAnswerKeyForPage,
  getDiagramsForPage,
  getTemplatesForPage,
  getQuiz,
} from "@/lib/content";

interface PageProps {
  params: Promise<{ level: string; page: string }>;
}

export async function generateStaticParams() {
  return getPages().map((p) => ({
    level: String(p.level),
    page: p.page,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level, page } = await params;
  const p = getPage(parseInt(level, 10), page);
  if (!p) return {};
  return { title: p.title };
}

export default async function PageRoute({ params }: PageProps) {
  const { level: levelStr, page: pageCode } = await params;
  const level = parseInt(levelStr, 10);
  if (Number.isNaN(level)) notFound();

  const page = getPage(level, pageCode);
  if (!page) notFound();

  const neighbours = getNeighbours(level, pageCode);
  const answerKey = getAnswerKeyForPage(level, pageCode);
  const diagrams = getDiagramsForPage(level, pageCode);
  const templates = getTemplatesForPage(level, pageCode);
  const quiz = getQuiz(level, pageCode);

  return (
    <>
      <SiteHeader />
      <PageShell page={page} prev={neighbours.prev} next={neighbours.next}>
        {quiz ? (
          <aside className="mb-6 rounded-lg border border-primary/40 bg-primary/5 p-4">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-primary">
              Interactive quiz available
            </p>
            <p className="mt-1 font-serif text-sm text-foreground">
              The {quiz.questions.length}-question version of this quiz can be
              taken in the app: numeric and multiple-choice answers are
              auto-graded, the rest are self-marked against the model answer.
            </p>
            <Link
              href={`/levels/${level}/${pageCode}/quiz`}
              className={buttonVariants({ size: "sm" }) + " mt-3"}
            >
              Take the interactive quiz →
            </Link>
          </aside>
        ) : null}

        <MDXContent code={page.body} components={mdxComponents} />

        {diagrams.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-sans text-xl font-semibold text-foreground">
              Schematic diagrams for this page
            </h2>
            {diagrams.map((d) => (
              <DiagramCard key={d.id} diagram={d} />
            ))}
          </section>
        ) : null}

        {templates.length > 0 ? (
          <section className="mt-10">
            <h2 className="font-sans text-xl font-semibold text-foreground">
              Templates linked to this page
            </h2>
            <ul className="mt-3 space-y-2">
              {templates.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border border-border p-3 hover:border-primary"
                >
                  <Link
                    href={`/templates/${t.id.replace(/^template\./, "")}`}
                    className="font-sans text-sm font-medium text-foreground hover:text-primary"
                  >
                    {t.number}. {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {answerKey ? (
          <AnswerToggle>
            <MDXContent code={answerKey.body} components={mdxComponents} />
          </AnswerToggle>
        ) : null}
      </PageShell>
    </>
  );
}
