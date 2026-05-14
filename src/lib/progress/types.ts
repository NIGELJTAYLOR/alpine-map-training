export const PROGRESS_VERSION = 5;
export const STORAGE_KEY = "alpine-map-training:progress";

export type PageStatus = "not-started" | "in-progress" | "completed";

/**
 * Rubric score returned by the AI grader for a single exercise answer.
 *   - "met"     — covers the model answer's key points correctly
 *   - "nearly"  — on the right track but missing detail or with a minor error
 *   - "not-yet" — misses the core point, contains a significant error, or is
 *                 essentially absent
 */
export type GradeScore = "met" | "nearly" | "not-yet";

export interface ExerciseGrade {
  /** Two to three sentence trainer-style paragraph addressed to the candidate. */
  feedback: string;
  /** Rubric judgement. */
  score: GradeScore;
  /** Two to three concise positives. */
  strengths: string[];
  /** Two to three concise improvement points. */
  improvements: string[];
  /** Anthropic model id used to produce this grade. */
  model: string;
  /** ISO timestamp when the grader returned. */
  gradedAt: string;
  /**
   * Cheap fingerprint of the candidate's answer at grading time. Lets the UI
   * flag grades as stale when the candidate edits their answer afterwards.
   */
  answerHash?: string;
}

export interface PageProgress {
  status: PageStatus;
  /**
   * Map from a per-checkbox stable id (React.useId()) to its checked state.
   * Replaced the legacy boolean[] in v2 to eliminate render-order dependence
   * and the hydration mismatch that came with it.
   */
  selfCheck: Record<string, boolean>;
  /**
   * Per-exercise free-text responses. Keys are stable input ids (typically
   * `ex-<n>` from the position of the corresponding "### Exercise N" heading
   * in the MDX body). Added in v4.
   */
  inputs?: Record<string, string>;
  /**
   * Per-exercise AI grades, keyed by the same `ex-<n>` ids as `inputs`.
   * Added in v5. Absent = not yet graded.
   */
  grades?: Record<string, ExerciseGrade>;
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

export type StartingLevel = 1 | 2 | 3;

export interface AppSettings {
  trainerMode: boolean;
  /** Set true once the onboarding wizard has completed. */
  onboardingComplete?: boolean;
  /** Captured during onboarding: which level the user is starting from. */
  startingLevel?: StartingLevel;
  /** Captured during onboarding: target session length in minutes. */
  sessionMinutes?: number;
  /** Captured during onboarding: target study days per week. */
  studyDaysPerWeek?: number;
  /** Captured during onboarding (v4+): the candidate's display name. */
  profileName?: string;
  /** Captured during onboarding (v4+): the candidate's contact email. */
  profileEmail?: string;
}

export interface OnboardingPrefs {
  startingLevel: StartingLevel;
  sessionMinutes: number;
  studyDaysPerWeek: number;
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
