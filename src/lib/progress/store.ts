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

/**
 * Validate an arbitrary parsed JSON object against the ProgressStore shape.
 *
 * Used by the Settings → Restore from backup flow (V1.4.1+). Strict enough
 * to reject random JSON, lenient enough to accept stores exported from any
 * version since v2 (the field-by-field hydration in loadProgress fills in
 * any missing maps after the import lands in localStorage).
 *
 * Returns the validated ProgressStore on success or a human-readable
 * reason on failure.
 */
export function validateImportedProgress(
  raw: unknown,
): { ok: true; store: ProgressStore } | { ok: false; reason: string } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, reason: "File is not a valid JSON object." };
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.version !== "number") {
    return {
      ok: false,
      reason:
        "Missing 'version' field. The file does not look like an Alpine Map Training backup.",
    };
  }
  if (obj.version < 2) {
    return {
      ok: false,
      reason: `Backup version ${obj.version} is too old to import (minimum is v2).`,
    };
  }
  if (obj.version > PROGRESS_VERSION) {
    return {
      ok: false,
      reason: `Backup was created by a newer version (v${obj.version}) than this app supports (v${PROGRESS_VERSION}). Update the app first.`,
    };
  }
  if (!obj.pages || typeof obj.pages !== "object") {
    return { ok: false, reason: "Missing 'pages' map. File may be corrupted." };
  }
  if (!obj.settings || typeof obj.settings !== "object") {
    return {
      ok: false,
      reason: "Missing 'settings' object. File may be corrupted.",
    };
  }
  return { ok: true, store: raw as ProgressStore };
}
