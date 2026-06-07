/**
 * Cloud sync helpers for the user_progress table.
 *
 * The whole ProgressStore is treated as a single opaque JSONB blob, keyed
 * by user_id. Row-level security on the table guarantees a signed-in user
 * can only read and write their own row.
 *
 * Errors are logged but never thrown to the UI: cloud sync is a background
 * concern, and localStorage continues to work even if the cloud is
 * unreachable.
 */
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ProgressStore } from "./types";

interface CloudRow {
  data: ProgressStore;
  updated_at: string;
}

/**
 * Fetch the cloud row for the given user. Returns null if no row exists
 * yet, or on error. Distinguishes "not signed in / row missing" (null)
 * from "row exists but empty" (returns the empty ProgressStore).
 */
export async function pullCloudProgress(
  userId: string,
): Promise<ProgressStore | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("user_progress")
      .select("data, updated_at")
      .eq("user_id", userId)
      .maybeSingle<CloudRow>();
    if (error) {
      console.warn("[progress sync] pull failed", error);
      return null;
    }
    if (!data) return null;
    return data.data ?? null;
  } catch (err) {
    console.warn("[progress sync] pull threw", err);
    return null;
  }
}

/**
 * Upsert the user's cloud row with the given store. Idempotent; safe to
 * call repeatedly. Returns true on success, false on failure.
 */
export async function pushCloudProgress(
  userId: string,
  store: ProgressStore,
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("user_progress")
      .upsert(
        {
          user_id: userId,
          data: store,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    if (error) {
      console.warn("[progress sync] push failed", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[progress sync] push threw", err);
    return false;
  }
}

/**
 * Delete the user's cloud row. Used by the Settings → "Delete my synced
 * progress" control. Returns true on success.
 */
export async function deleteCloudProgress(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", userId);
    if (error) {
      console.warn("[progress sync] delete failed", error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[progress sync] delete threw", err);
    return false;
  }
}

/**
 * Heuristic: a "real" progress store has at least one page, quiz, or
 * flashcard schedule written. An empty row (default '{}'::jsonb) and a
 * freshly-initialised ProgressStore both register as empty here.
 */
export function isEmptyProgress(p: ProgressStore | null | undefined): boolean {
  if (!p) return true;
  const pagesEmpty = !p.pages || Object.keys(p.pages).length === 0;
  const quizzesEmpty = !p.quizzes || Object.keys(p.quizzes).length === 0;
  const cardsEmpty =
    !p.flashcards || Object.keys(p.flashcards).length === 0;
  return pagesEmpty && quizzesEmpty && cardsEmpty;
}
