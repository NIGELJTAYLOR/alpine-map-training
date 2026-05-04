import {
  pages as allPages,
  answerKeys as allAnswerKeys,
  trainerNotes as allTrainerNotes,
} from "#site/content";

export type Page = (typeof allPages)[number];
export type AnswerKey = (typeof allAnswerKeys)[number];
export type TrainerNote = (typeof allTrainerNotes)[number];

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
