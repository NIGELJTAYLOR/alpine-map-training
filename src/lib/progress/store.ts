import {
  emptyProgress,
  PROGRESS_VERSION,
  STORAGE_KEY,
  type ProgressStore,
} from "./types";

export function loadProgress(): ProgressStore {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as ProgressStore;
    if (!parsed || typeof parsed !== "object") return emptyProgress();
    if (parsed.version !== PROGRESS_VERSION) {
      // Future: migration. For v1 we drop on mismatch.
      return emptyProgress();
    }
    // Hydrate any missing fields conservatively.
    const empty = emptyProgress();
    return {
      ...empty,
      ...parsed,
      settings: { ...empty.settings, ...(parsed.settings ?? {}) },
      pages: parsed.pages ?? {},
      quizzes: parsed.quizzes ?? {},
      confidenceScores: parsed.confidenceScores ?? {},
      readinessChecks: parsed.readinessChecks ?? {},
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(store: ProgressStore): void {
  if (typeof window === "undefined") return;
  try {
    const next: ProgressStore = {
      ...store,
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full / disabled — silently fail
  }
}

export function clearProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
