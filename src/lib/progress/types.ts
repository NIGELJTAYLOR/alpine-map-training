export const PROGRESS_VERSION = 1;
export const STORAGE_KEY = "alpine-map-training:progress";

export type PageStatus = "not-started" | "in-progress" | "completed";

export interface PageProgress {
  status: PageStatus;
  selfCheck: boolean[];
  lastViewed: string;
}

export interface QuizResponse {
  value: unknown;
  status:
    | "unanswered"
    | "auto-correct"
    | "auto-incorrect"
    | "self-correct"
    | "self-partial"
    | "self-incorrect"
    | "skipped";
  submittedAt?: number;
}

export interface QuizProgress {
  startedAt: string;
  completedAt?: string;
  responses: Record<string, QuizResponse>;
  score?: number;
  totalQuestions?: number;
  timeMinutes?: number;
}

export interface ConfidenceScore {
  /** integer 1..5, or null when not set */
  value: number | null;
  updatedAt: string;
}

export type ReadinessStatus = "yes" | "not-quite" | "no";
export interface ReadinessCheck {
  status: ReadinessStatus;
  notes?: string;
  updatedAt: string;
}

export interface AppSettings {
  trainerMode: boolean;
}

/**
 * Per-card SM-2 schedule. Imported from src/lib/flashcards/sm2.ts shape but
 * re-declared here so this file has no cross-module dep.
 */
export interface FlashcardSchedule {
  easiness: number;
  repetitions: number;
  intervalDays: number;
  dueDate: string;
  lastReviewed?: string;
  lastQuality?: number;
}

export interface ProgressStore {
  candidateId: string;
  version: number;
  lastUpdated: string;
  settings: AppSettings;
  pages: Record<string, PageProgress>;
  quizzes: Record<string, QuizProgress>;
  confidenceScores: Record<string, ConfidenceScore>;
  readinessChecks: Record<string, ReadinessCheck>;
  /** SM-2 schedules keyed by card id. Missing card = never studied. */
  flashcards: Record<string, FlashcardSchedule>;
}

export function emptyProgress(): ProgressStore {
  return {
    candidateId: "default",
    version: PROGRESS_VERSION,
    lastUpdated: new Date().toISOString(),
    settings: { trainerMode: false },
    pages: {},
    quizzes: {},
    confidenceScores: {},
    readinessChecks: {},
    flashcards: {},
  };
}
