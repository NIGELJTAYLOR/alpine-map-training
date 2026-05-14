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
      // Additive schema history (all backward-compatible):
      //   v2 → v3: optional onboarding settings
      //   v3 → v4: profile fields + per-page inputs map
      //   v4 → v5: per-exercise AI grade map
      // The field-by-field hydration below fills any missing maps. Pre-v2
      // stores are dropped.
      if (typeof parsed.version !== "number" || parsed.version < 2) {
        return emptyProgress();
      }
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
      flashcards: parsed.flashcards ?? {},
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
