import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/site/page-shell";
import { AnswerToggle } from "@/components/site/answer-toggle";
import { DiagramCard } from "@/components/site/diagram-card";
import { PageBody } from "@/components/site/page-body";
import { AnswerKeyBody } from "@/components/site/answer-key-body";
import { PageCompletionControls } from "@/components/site/page-completion";
import { TrainerNotesPanel } from "@/components/site/trainer-notes-panel";
import { ReadinessCheckInput } from "@/components/site/readiness-check-input";
import { SeeAlso } from "@/components/site/see-also";
import { MapExtract } from "@/components/site/map-extract";
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
import { FLASHCARDS } from "@/data/flashcards.generated";

interface PageProps {
  params: Promise<{ level: string; page: string }>;
}

interface ReadinessConfig {
  scopeKey: string;
  title: string;
  prompt: string;
}

interface PageMapConfig {
  id: string;
  title: string;
  caption?: string;
  markers: { label: string; description: string; color?: "crimson" | "ink" | "moss" | "amber" }[];
}

const PAGE_MAPS: Record<string, PageMapConfig> = {
  "L2.C7.2": {
    id: "c7-2",
    title: "Section C7.2 — Virtual terrain walk",
    caption:
      "The route runs A → B → C → D. Use this extract for the standing descriptions and route-choice questions on the page below.",
    markers: [
      { label: "A", description: "Col / saddle — start of the day, on a ridge between two valleys", color: "ink" },
      { label: "B", description: "Bowl — mid-route, on a slope facing into a corrie", color: "crimson" },
      { label: "C", description: "Spur — descending towards the valley floor", color: "amber" },
      { label: "D", description: "Valley floor with stream — end of the day", color: "moss" },
    ],
  },
  "L3.D10.2": {
    id: "d10-2",
    title: "Section D10.2 — Virtual day on a tour",
    caption:
      "Six-leg tour with three pre-agreed decision points. Bearings, altimeter triggers, and decision-point criteria all reference these markers.",
    markers: [
      { label: "Start", description: "Departure point — set altimeter at known elevation here", color: "ink" },
      { label: "DP1", description: "First decision point — check bulletin against bowl exposure", color: "crimson" },
      { label: "DP2", description: "Second decision point — terrain-trap check before committing to descent", color: "crimson" },
      { label: "DP3", description: "Third decision point — pole-and-cord assessment if visibility drops", color: "crimson" },
      { label: "End", description: "Tour end — final altimeter reading and barometric trend", color: "moss" },
    ],
  },
};

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

  // Related flashcards: cards whose tags include this page code
  const relatedFlashcards = FLASHCARDS.filter((c) =>
    c.tags.some((t) => t === pageCode),
  )
    .slice(0, 6)
    .map((c) => ({ id: c.id, title: c.title }));

  const pageMap = PAGE_MAPS[page.id];

  return (
    <>
      <PageShell
        page={page}
        prev={neighbours.prev}
        next={neighbours.next}
        linkedCards={relatedFlashcards}
      >
        {quiz ? (
          <aside className="mb-8 rounded-md border border-rule bg-paper-3 p-5">
            <p className="eyebrow eyebrow-contour">Interactive quiz available</p>
            <p className="mt-2 font-sans text-[15px] leading-relaxed text-ink-2">
              The {quiz.questions.length}-question version of this quiz can be
              taken in the app: numeric and multiple-choice answers are
              auto-graded, the rest are self-marked against the model answer.
            </p>
            <Link
              href={`/levels/${level}/${pageCode}/quiz`}
              className="mt-4 inline-flex items-center gap-2 rounded-[4px] border border-ink bg-ink px-4 py-2 font-sans text-sm font-semibold text-paper hover:bg-ink-2"
            >
              Take the interactive quiz →
            </Link>
          </aside>
        ) : null}

        <PageBody
          pageId={page.id}
          body={page.body}
          answerKeyBody={answerKey?.rawBody}
        />

        {pageMap ? (
          <MapExtract
            id={pageMap.id}
            title={pageMap.title}
            caption={pageMap.caption}
            markers={pageMap.markers}
          />
        ) : null}

        {diagrams.length > 0 && !page.hasInlineDiagrams ? (
          <section className="mt-12">
            <h2 className="font-display text-xl font-medium tracking-[-0.01em] text-ink">
              Schematic diagrams for this page
            </h2>
            {diagrams.map((d) => (
              <DiagramCard key={d.id} diagram={d} />
            ))}
          </section>
        ) : null}

        {/* Per-exercise textareas now render inline within the workbook
            body via the remark-exercise-fields velite plugin (which injects
            <AnswerSlot> wherever the source has `____` markers). The Grade
            with AI button sits at the foot of each exercise as <ExerciseField>.
            The legacy bottom "Your responses" panel is retired. */}

        {answerKey ? (
          <AnswerToggle>
            <AnswerKeyBody body={answerKey.body} />
          </AnswerToggle>
        ) : null}

        {readinessConfig ? (
          <section className="mt-10 rounded-md border border-rule bg-paper-3 p-5">
            <h2 className="font-display text-lg font-medium text-ink">
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

        <SeeAlso
          level={level}
          pageCode={pageCode}
          diagrams={diagrams.map((d) => ({
            id: d.id,
            level: d.level,
            number: d.number,
            sub: d.sub,
            title: d.title,
          }))}
          templates={templates.map((t) => ({
            id: t.id,
            number: t.number,
            title: t.title,
          }))}
          flashcards={relatedFlashcards}
        />

        <PageCompletionControls pageId={page.id} />
      </PageShell>
    </>
  );
}
