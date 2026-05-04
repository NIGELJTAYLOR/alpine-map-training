"use client";

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
  toggleSelfCheck: (pageId: string, idx: number, total: number) => void;
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
  // bulk
  reset: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const DEFAULT_PAGE: PageProgress = {
  status: "not-started",
  selfCheck: [],
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
    (pageId: string, idx: number, total: number) => {
      setStore((prev) => {
        const existing = prev.pages[pageId] ?? DEFAULT_PAGE;
        const arr = [...existing.selfCheck];
        // Pad to total
        while (arr.length < total) arr.push(false);
        arr[idx] = !arr[idx];
        // Auto-promote not-started → in-progress on first interaction
        const status: PageStatus =
          existing.status === "not-started" ? "in-progress" : existing.status;
        return {
          ...prev,
          pages: {
            ...prev.pages,
            [pageId]: {
              ...existing,
              selfCheck: arr,
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
      reset,
    ],
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used inside <ProgressProvider>");
  }
  return ctx;
}

// Convenience: typed export of the most common slice access
export type { ConfidenceScore, PageProgress, QuizProgress, ReadinessCheck };
