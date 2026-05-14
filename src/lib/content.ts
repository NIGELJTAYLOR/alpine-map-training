import {
  pages as allPages,
  answerKeys as allAnswerKeys,
  trainerNotes as allTrainerNotes,
  diagrams as allDiagrams,
  templates as allTemplates,
  quizzes as allQuizzes,
} from "#site/content";

export type Page = (typeof allPages)[number];
export type AnswerKey = (typeof allAnswerKeys)[number];
export type TrainerNote = (typeof allTrainerNotes)[number];
export type Diagram = (typeof allDiagrams)[number];
export type Template = (typeof allTemplates)[number];
export type Quiz = (typeof allQuizzes)[number];
export type QuizQuestion = Quiz["questions"][number];

export const AVAILABLE_LEVELS = [
  ...new Set(allPages.map((p) => p.level)),
].sort();

export function getPages(level?: number): Page[] {
  const list = level == null ? allPages : allPages.filter((p) => p.level === level);
  return [...list].sort((a, b) => a.order - b.order);
}

export function getPage(level: number, page: string): Page | undefined {
  return allPages.find((p) => p.level === level && p.page === page);
}

export function getAnswerKeyForPage(level: number, page: string): AnswerKey | undefined {
  return allAnswerKeys.find((a) => a.level === level && a.page === page);
}

export function getTrainerNotesForLevel(level: number): TrainerNote[] {
  return allTrainerNotes.filter((t) => t.level === level);
}

export function getTrainerNotesForSection(level: number, section: string): TrainerNote[] {
  return allTrainerNotes.filter(
    (t) => t.level === level && t.sections.includes(section),
  );
}

export function getNeighbours(level: number, page: string) {
  const list = getPages(level);
  const idx = list.findIndex((p) => p.page === page);
  return {
    prev: idx > 0 ? list[idx - 1] : undefined,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : undefined,
  };
}

export function getDiagramsForLevel(level: number): Diagram[] {
  return [...allDiagrams.filter((d) => d.level === level)].sort(
    (a, b) =>
      a.number - b.number ||
      a.sub.localeCompare(b.sub),
  );
}

export function getDiagramsForPage(level: number, page: string): Diagram[] {
  return allDiagrams.filter((d) => d.level === level && d.pageRefs.includes(page));
}

/**
 * Look up a diagram by short reference like "L2.14" or "L3.1a".
 * Used by the inline <Diagram fig="L2.14" /> MDX component to embed
 * a schematic at the exact point of reference inside lesson MDX.
 */
export function getDiagramByRef(fig: string): Diagram | undefined {
  const m = fig.match(/^L(\d+)\.(\d+)([a-z]*)$/i);
  if (!m) return undefined;
  const level = Number(m[1]);
  const number = Number(m[2]);
  const sub = m[3].toLowerCase();
  return allDiagrams.find(
    (d) => d.level === level && d.number === number && (d.sub || "") === sub,
  );
}

export function getAllTemplates(): Template[] {
  return [...allTemplates].sort((a, b) => a.number - b.number);
}

export function getTemplate(slug: string): Template | undefined {
  return allTemplates.find(
    (t) => t.id === `template.${slug}` || t.id === slug,
  );
}

export function getTemplatesForPage(_level: number, page: string): Template[] {
  return allTemplates.filter((t) => t.pageRefs.includes(page));
}

export function getQuiz(level: number, page: string): Quiz | undefined {
  return allQuizzes.find((q) => q.level === level && q.page === page);
}

export function getAllQuizzes(): Quiz[] {
  return [...allQuizzes].sort((a, b) =>
    a.level - b.level || a.page.localeCompare(b.page),
  );
}
