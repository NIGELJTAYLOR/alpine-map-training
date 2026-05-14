"use client";

/**
 * Progress provider.
 *
 * Today this is single-profile per browser: one ProgressStore lives at
 * localStorage key "alpine-map-training:progress". The Settings panel exposes
 * a destructive "Start fresh / new user" action that calls `reset()` and
 * re-fires onboarding.
 *
 * TODO(multi-profile, v5 schema): when ready, lift to true multi-tenant on
 * the device:
 *   1. Storage — write per-profile keys "alpine-map-training:profile:<id>",
 *      plus an index "alpine-map-training:profiles" containing
 *      { profiles: ProfileMeta[], currentProfileId: string } where
 *      ProfileMeta = { id, name, email, createdAt, lastSeenAt }.
 *   2. Provider — accept currentProfileId from a higher-level
 *      ProfilesProvider; load/save against the current profile's key.
 *   3. Migration — on first run after upgrade, move the existing
 *      "alpine-map-training:progress" payload into a new profile keyed by
 *      profileName (or "Default" if blank). Set it as current.
 *   4. UI — replace the single "Start fresh" row with a Users section:
 *      switch profile, add profile (re-runs onboarding for the new slot),
 *      rename profile, delete profile, export profile.
 *   5. Export (Pass B) — namespace exports by profile so trainers can
 *      receive per-candidate Markdown without mixing data.
 *
 * Keep this comment in sync with reality. Delete the TODO when v5 ships.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  emptyProgress,
  type ConfidenceScore,
  type ExerciseGrade,
  type FlashcardSchedule,
  type OnboardingPrefs,
  type PageProgress,
  type PageStatus,
  type ProgressStore,
  type QuizProgress,
  type QuizResponse,
  type ReadinessCheck,
  type ReadinessStatus,
} from "./types";
import { clearProgress, loadProgress, saveProgress } from "./store";

interface ProgressContextValue {
  hydrated: boolean;
  store: ProgressStore;
  // page
  getPage: (pageId: string) => PageProgress;
  setPageStatus: (pageId: string, status: PageStatus) => void;
  toggleSelfCheck: (pageId: string, key: string) => void;
  markVisited: (pageId: string) => void;
  // quizzes
  getQuiz: (quizId: string) => QuizProgress | undefined;
  setQuizResponse: (quizId: string, qId: string, response: QuizResponse) => void;
  finishQuiz: (
    quizId: string,
    summary: { score: number; totalQuestions: number; timeMinutes: number },
  ) => void;
  resetQuiz: (quizId: string) => void;
  // confidence + readiness
  setConfidence: (areaId: string, value: number | null) => void;
  setReadiness: (key: string, status: ReadinessStatus, notes?: string) => void;
  // settings
  setTrainerMode: (on: boolean) => void;
  /** Save the captured onboarding choices and mark the flow complete. */
  setOnboardingPrefs: (prefs: OnboardingPrefs) => void;
  /** Update the candidate's local profile (name + email). */
  setProfile: (profile: { name?: string; email?: string }) => void;
  /** Save a per-exercise free-text input on a page. */
  setInput: (pageId: string, inputKey: string, value: string) => void;
  /** Save an AI grade for one exercise on a page. */
  setGrade: (pageId: string, exerciseKey: string, grade: ExerciseGrade) => void;
  /** Remove an AI grade for one exercise on a page (used by Re-grade). */
  clearGrade: (pageId: string, exerciseKey: string) => void;
  // flashcards
  getFlashcardSchedule: (cardId: string) => FlashcardSchedule | undefined;
  setFlashcardSchedule: (cardId: string, schedule: FlashcardSchedule) => void;
  resetFlashcards: () => void;
  // bulk
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const DEFAULT_PAGE: PageProgress = {
  status: "not-started",
  selfCheck: {},
  lastViewed: "",
};

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<ProgressStore>(() => emptyProgress());
  const [hydrated, setHydrated] = useState(false);

  // hydrate on mount
  useEffect(() => {
    setStore(loadProgress());
    setHydrated(true);
  }, []);

  // persist on every change after hydration
  useEffect(() => {
    if (!hydrated) return;
    saveProgress(store);
  }, [store, hydrated]);

  // ------------------------------------------------------------------ pages
  const getPage = useCallback(
    (pageId: string): PageProgress => store.pages[pageId] ?? DEFAULT_PAGE,
    [store.pages],
  );

  const setPageStatus = useCallback((pageId: string, status: PageStatus) => {
    setStore((prev) => ({
      ...prev,
      pages: {
        ...prev.pages,
        [pageId]: {
          ...DEFAULT_PAGE,
          ...prev.pages[pageId],
          status,
          lastViewed: new Date().toISOString(),
        },
      },
    }));
  }, []);

  const toggleSelfCheck = useCallback(
    (pageId: string, key: string) => {
      setStore((prev) => {
        const existing = prev.pages[pageId] ?? DEFAULT_PAGE;
        const next: Record<string, boolean> = { ...existing.selfCheck };
        next[key] = !next[key];
        // Auto-promote not-started → in-progress on first interaction
        const status: PageStatus =
          existing.status === "not-started" ? "in-progress" : existing.status;
        return {
          ...prev,
          pages: {
            ...prev.pages,
            [pageId]: {
              ...existing,
              selfCheck: next,
              status,
              lastViewed: new Date().toISOString(),
            },
          },
        };
      });
    },
    [],
  );

  const markVisited = useCallback((pageId: string) => {
    setStore((prev) => {
      const existing = prev.pages[pageId];
      if (existing && existing.lastViewed) {
        // Already tracked. Update lastViewed only if it's been > 60s — cheap noise reduction.
        const last = Date.parse(existing.lastViewed);
        if (!Number.isNaN(last) && Date.now() - last < 60_000) return prev;
      }
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [pageId]: {
            ...DEFAULT_PAGE,
            ...(existing ?? {}),
            lastViewed: new Date().toISOString(),
          },
        },
      };
    });
  }, []);

  // ------------------------------------------------------------------ quizzes
  const getQuiz = useCallback(
    (quizId: string) => store.quizzes[quizId],
    [store.quizzes],
  );

  const setQuizResponse = useCallback(
    (quizId: string, qId: string, response: QuizResponse) => {
      setStore((prev) => {
        const existing: QuizProgress = prev.quizzes[quizId] ?? {
          startedAt: new Date().toISOString(),
          responses: {},
        };
        return {
          ...prev,
          quizzes: {
            ...prev.quizzes,
            [quizId]: {
              ...existing,
              responses: { ...existing.responses, [qId]: response },
            },
          },
        };
      });
    },
    [],
  );

  const finishQuiz = useCallback(
    (
      quizId: string,
      summary: { score: number; totalQuestions: number; timeMinutes: number },
    ) => {
      setStore((prev) => {
        const existing: QuizProgress = prev.quizzes[quizId] ?? {
          startedAt: new Date().toISOString(),
          responses: {},
        };
        return {
          ...prev,
          quizzes: {
            ...prev.quizzes,
            [quizId]: {
              ...existing,
              completedAt: new Date().toISOString(),
              ...summary,
            },
          },
        };
      });
    },
    [],
  );

  const resetQuiz = useCallback((quizId: string) => {
    setStore((prev) => {
      const next = { ...prev.quizzes };
      delete next[quizId];
      return { ...prev, quizzes: next };
    });
  }, []);

  // ------------------------------------------------------------- confidence
  const setConfidence = useCallback((areaId: string, value: number | null) => {
    setStore((prev) => ({
      ...prev,
      confidenceScores: {
        ...prev.confidenceScores,
        [areaId]: { value, updatedAt: new Date().toISOString() },
      },
    }));
  }, []);

  const setReadiness = useCallback(
    (key: string, status: ReadinessStatus, notes?: string) => {
      setStore((prev) => ({
        ...prev,
        readinessChecks: {
          ...prev.readinessChecks,
          [key]: { status, notes, updatedAt: new Date().toISOString() },
        },
      }));
    },
    [],
  );

  const setTrainerMode = useCallback((on: boolean) => {
    setStore((prev) => ({
      ...prev,
      settings: { ...prev.settings, trainerMode: on },
    }));
  }, []);

  const setOnboardingPrefs = useCallback((prefs: OnboardingPrefs) => {
    setStore((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        onboardingComplete: true,
        startingLevel: prefs.startingLevel,
        sessionMinutes: prefs.sessionMinutes,
        studyDaysPerWeek: prefs.studyDaysPerWeek,
      },
    }));
  }, []);

  const setProfile = useCallback(
    (profile: { name?: string; email?: string }) => {
      setStore((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          ...(profile.name !== undefined ? { profileName: profile.name } : {}),
          ...(profile.email !== undefined
            ? { profileEmail: profile.email }
            : {}),
        },
      }));
    },
    [],
  );

  const setInput = useCallback(
    (pageId: string, inputKey: string, value: string) => {
      setStore((prev) => {
        const existing = prev.pages[pageId] ?? DEFAULT_PAGE;
        const existingInputs = existing.inputs ?? {};
        return {
          ...prev,
          pages: {
            ...prev.pages,
            [pageId]: {
              ...existing,
              inputs: { ...existingInputs, [inputKey]: value },
              // Typing into a page promotes it to in-progress, mirroring
              // the self-check checkbox behaviour.
              status:
                existing.status === "not-started"
                  ? "in-progress"
                  : existing.status,
              lastViewed: new Date().toISOString(),
            },
          },
        };
      });
    },
    [],
  );

  const setGrade = useCallback(
    (pageId: string, exerciseKey: string, grade: ExerciseGrade) => {
      setStore((prev) => {
        const existing = prev.pages[pageId] ?? DEFAULT_PAGE;
        const existingGrades = existing.grades ?? {};
        return {
          ...prev,
          pages: {
            ...prev.pages,
            [pageId]: {
              ...existing,
              grades: { ...existingGrades, [exerciseKey]: grade },
              lastViewed: new Date().toISOString(),
            },
          },
        };
      });
    },
    [],
  );

  const clearGrade = useCallback((pageId: string, exerciseKey: string) => {
    setStore((prev) => {
      const existing = prev.pages[pageId];
      if (!existing || !existing.grades) return prev;
      const nextGrades = { ...existing.grades };
      delete nextGrades[exerciseKey];
      return {
        ...prev,
        pages: {
          ...prev.pages,
          [pageId]: { ...existing, grades: nextGrades },
        },
      };
    });
  }, []);

  const getFlashcardSchedule = useCallback(
    (cardId: string) => store.flashcards[cardId],
    [store.flashcards],
  );

  const setFlashcardSchedule = useCallback(
    (cardId: string, schedule: FlashcardSchedule) => {
      setStore((prev) => ({
        ...prev,
        flashcards: { ...prev.flashcards, [cardId]: schedule },
      }));
    },
    [],
  );

  const resetFlashcards = useCallback(() => {
    setStore((prev) => ({ ...prev, flashcards: {} }));
  }, []);

  const reset = useCallback(() => {
    clearProgress();
    setStore(emptyProgress());
  }, []);

  const value = useMemo<ProgressContextValue>(
    () => ({
      hydrated,
      store,
      getPage,
      setPageStatus,
      toggleSelfCheck,
      markVisited,
      getQuiz,
      setQuizResponse,
      finishQuiz,
      resetQuiz,
      setConfidence,
      setReadiness,
      setTrainerMode,
      setOnboardingPrefs,
      setProfile,
      setInput,
      setGrade,
      clearGrade,
      getFlashcardSchedule,
      setFlashcardSchedule,
      resetFlashcards,
      reset,
    }),
    [
      hydrated,
      store,
      getPage,
      setPageStatus,
      toggleSelfCheck,
      markVisited,
      getQuiz,
      setQuizResponse,
      finishQuiz,
      resetQuiz,
      setConfidence,
      setReadiness,
      setTrainerMode,
      setOnboardingPrefs,
      setProfile,
      setInput,
      setGrade,
      clearGrade,
      getFlashcardSchedule,
      setFlashcardSchedule,
      resetFlashcards,
      reset,
    ],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return ctx;
}
