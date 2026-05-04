import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { PageShell } from "@/components/site/page-shell";
import { AnswerToggle } from "@/components/site/answer-toggle";
import { DiagramCard } from "@/components/site/diagram-card";
import { PageBody } from "@/components/site/page-body";
import { AnswerKeyBody } from "@/components/site/answer-key-body";
import { PageCompletionControls } from "@/components/site/page-completion";
import { TrainerNotesPanel } from "@/components/site/trainer-notes-panel";
import { ReadinessCheckInput } from "@/components/site/readiness-check-input";
import { buttonVariants } from "@/components/ui/button";
import {
  getPage,
  getPages,
  getNeighbours,
  getAnswerKeyForPage,
  getDiagramsForPage,
  getTemplatesForPage,
  getQuiz,
  getTrainerNotesForSection,
} from "@/lib/content";

interface PageProps {
  params: Promise<{ level: string; page: string }>;
}

interface ReadinessConfig {
  scopeKey: string;
  title: string;
  prompt: string;
}

function readinessConfigFor(pageId: string): ReadinessConfig | null {
  if (pageId === "L1.Reflection") {
    return {
      scopeKey: "L1.Reflection.readiness",
      title: "Level 1 readiness",
      prompt:
        "Looking at your Level 1 work as a whole, are you ready to begin Level 2? Stored on this device.",
    };
  }
  if (pageId === "L2.C7.2") {
    return {
      scopeKey: "L2.C7.2.readiness",
      title: "Level 3 readiness",
      prompt:
        "Looking at the C7.1 quiz, the C7.2 walk and your error log, are you ready for Level 3? Stored on this device.",
    };
  }
  if (pageId === "L3.D10.2") {
    return {
      scopeKey: "L3.D10.2.readiness",
      title: "Level 4 readiness",
      prompt:
        "Looking at the D10.1 quiz, the D10.2 walk and your error log, are you ready for Level 4 / IMS assessment? Stored on this device.",
    };
  }
  return null;
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
  const trainerNotes = getTrainerNotesForSection(level, page.section).map(
    (n) => ({ id: n.id, title: n.title, body: n.body, sections: n.sections }),
  );
  const readinessConfig = readinessConfigFor(page.id);

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

        <PageBody pageId={page.id} body={page.body} />

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
            <AnswerKeyBody body={answerKey.body} />
          </AnswerToggle>
        ) : null}

        {readinessConfig ? (
          <section className="mt-10 rounded-xl border border-border bg-card p-4 sm:p-5">
            <h2 className="font-sans text-lg font-semibold text-foreground">
              {readinessConfig.title}
            </h2>
            <div className="mt-3">
              <ReadinessCheckInput
                scopeKey={readinessConfig.scopeKey}
                prompt={readinessConfig.prompt}
              />
            </div>
          </section>
        ) : null}

        <TrainerNotesPanel notes={trainerNotes} />

        <PageCompletionControls pageId={page.id} />
      </PageShell>
    </>
  );
}
